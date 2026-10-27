import assert from 'node:assert/strict';
import test from 'node:test';
import { checkAiConfigStatus, sendChatMessage } from '../src/services/aiService.ts';

// 原生 Node 没有 Vite 注入的连接参数；这些测试只验证未配置时的降级分支。
test('非浏览器环境下，AI 状态明确为未启用', async () => {
  const result = await checkAiConfigStatus();
  assert.equal(result.configured, false);
  assert.equal(result.model, null);
  assert.match(result.message, /AI 服务暂未启用/);
});

test('非浏览器环境下不联网、不返回模拟 AI 答复', async () => {
  const originalFetch = globalThis.fetch;
  let requested = false;
  globalThis.fetch = async () => {
    requested = true;
    throw new Error('离线测试不允许网络请求');
  };
  try {
    const result = await sendChatMessage([{ role: 'user', content: '解释测算结果' }]);
    assert.equal(result.configured, false);
    assert.equal(result.error, 'AI_NOT_CONFIGURED');
    assert.equal(result.reply, undefined);
    assert.equal(requested, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
