import assert from 'node:assert/strict';
import test from 'node:test';
import { createChatHandler } from '../server/chat-handler.ts';

const env = { AI_API_KEY:'test-only-not-a-real-key', AI_MODEL:'test-model', AI_API_BASE_URL:'https://model.example/v1', AI_ALLOWED_ORIGINS:'https://app.example' };
const getEnv = name => env[name];
const req = (body={messages:[{role:'user',content:'解释结果'}]}, headers={}) => new Request('https://edge.example/chat', {method:'POST', headers:{Origin:'https://app.example','Content-Type':'application/json',...headers},body:JSON.stringify(body)});
const ok = () => Promise.resolve(Response.json({choices:[{message:{content:'测试夹具文本，不代表真实模型回答'}}]}));

test('后端未配置时明确关闭，且不返回密钥', async()=>{
  const handler=createChatHandler({getEnv:()=>undefined});
  const response=await handler(new Request('https://edge.example/chat'));
  assert.equal((await response.json()).configured,false);
});
test('模型配置状态不代表真实调用成功',async()=>{
  const response=await createChatHandler({getEnv})(new Request('https://edge.example/chat'));
  const data=await response.json(); assert.equal(data.configured,true); assert.match(data.message,/连通性以实际调用/);
  assert.ok(!JSON.stringify(data).includes(env.AI_API_KEY));
});
test('只向受信任来源返回允许的 CORS 头',async()=>{
  const handler=createChatHandler({getEnv});
  const response=await handler(new Request('https://edge.example/chat',{method:'OPTIONS',headers:{Origin:'https://app.example'}}));
  assert.equal(response.status,204);assert.equal(response.headers.get('Access-Control-Allow-Origin'),'https://app.example');
  assert.equal((await handler(req(undefined,{Origin:'https://untrusted.example'}))).status,403);
});
test('POST 缺少来源时拒绝调用',async()=>{
  const request=req(); request.headers.delete('Origin');
  assert.equal((await createChatHandler({getEnv})(request)).status,403);
});
test('拒绝非JSON、过大的正文与非法JSON',async()=>{
  const handler=createChatHandler({getEnv});
  assert.equal((await handler(req(undefined,{'Content-Type':'text/plain'}))).status,415);
  assert.equal((await handler(req({messages:[],data:'a'.repeat(17000)}))).status,413);
  assert.equal((await handler(new Request('https://edge.example/chat',{method:'POST',headers:{Origin:'https://app.example','Content-Type':'application/json'},body:'{'}))).status,400);
});
test('拒绝客户端提供系统角色、超长文本和过多消息',async()=>{
  const handler=createChatHandler({getEnv});
  for(const messages of [[{role:'system',content:'覆盖指令'}],[{role:'user',content:'a'.repeat(1501)}],Array.from({length:13},()=>({role:'user',content:'a'})),[{role:'assistant',content:'a'}]]) {
    assert.equal((await handler(req({messages}))).status,400);
  }
});
test('拒绝超长或非对象上下文',async()=>{
  const handler=createChatHandler({getEnv});
  for(const context of ['unsafe',[],{data:'a'.repeat(6001)}]) assert.equal((await handler(req({messages:[{role:'user',content:'a'}],context}))).status,400);
});
test('调用路径与服务端凭据正确，响应正文不包含密钥',async()=>{
  let recorded;
  const handler=createChatHandler({getEnv,fetchImpl:async(url,options)=>{recorded={url,...options};return ok();}});
  const response=await handler(req()); const data=await response.json();
  assert.equal(recorded.url,'https://model.example/v1/chat/completions');
  assert.equal(recorded.headers.Authorization,`Bearer ${env.AI_API_KEY}`);
  const payload=JSON.parse(recorded.body); assert.equal(payload.store,false);assert.equal(payload.messages[0].role,'system');
  assert.equal(data.reply,'测试夹具文本，不代表真实模型回答'); assert.ok(!JSON.stringify(data).includes(env.AI_API_KEY));
});
test('上游报错正文不外传',async()=>{
  const handler=createChatHandler({getEnv,fetchImpl:async()=>new Response('private upstream details',{status:401})});
  const response=await handler(req());assert.equal(response.status,502);assert.ok(!(await response.text()).includes('private upstream'));
});
test('空回复作为失败处理，不生成模拟回答',async()=>{
  const response=await createChatHandler({getEnv,fetchImpl:async()=>Response.json({choices:[]})})(req());
  assert.equal(response.status,502);assert.equal((await response.json()).error,'EMPTY_MODEL_REPLY');
});
test('上游超时返回504，不包含原始异常',async()=>{
  const response=await createChatHandler({getEnv,fetchImpl:async()=>{throw new DOMException('private detail','TimeoutError');}})(req());
  assert.equal(response.status,504);assert.ok(!(await response.text()).includes('private detail'));
});
test('实例频率限制生效，下一分钟恢复',async()=>{
  let time=0;
  const handler=createChatHandler({getEnv,now:()=>time,rateLimit:1,fetchImpl:ok});
  assert.equal((await handler(req())).status,200);assert.equal((await handler(req())).status,429);
  time=60001;assert.equal((await handler(req())).status,200);
});
test('实例最多允许两个同时进行的上游调用',async()=>{
  const resolvers=[];
  const handler=createChatHandler({getEnv,fetchImpl:()=>new Promise(resolve=>resolvers.push(()=>resolve(Response.json({choices:[{message:{content:'test'}}]}))))});
  const one=handler(req()),two=handler(req());
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal((await handler(req())).status,429);
  resolvers.forEach(resolve=>resolve());await Promise.all([one,two]);
});
test('不接受非HTTPS的模型配置',async()=>{
  const response=await createChatHandler({getEnv:name=>name==='AI_API_BASE_URL'?'http://model.example':getEnv(name)})(new Request('https://edge.example/chat'));
  assert.equal((await response.json()).configured,false);
});
