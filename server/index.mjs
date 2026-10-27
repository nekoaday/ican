import http from 'node:http';
import { Readable } from 'node:stream';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { createChatHandler } from './chat-handler.ts';

// 支持一次性隐藏输入，供本地联调使用；不写配置文件、不输出输入内容。
async function readMemoryConfiguration() {
  if (!process.argv.includes('--secrets-stdin')) return {};
  if (process.stdin.isTTY) process.stdin.setRawMode(true);
  process.stdin.setEncoding('utf8');
  process.stdout.write('Ready for temporary server configuration (input hidden).\n');
  return new Promise((resolve, reject) => {
    let buffer = '';
    const receive = chunk => {
      if (chunk.includes('\u0003')) process.exit(0);
      buffer += chunk;
      if (!buffer.includes('\n') && !buffer.includes('\r')) return;
      process.stdin.off('data', receive);
      process.stdin.pause();
      if (process.stdin.isTTY) process.stdin.setRawMode(false);
      try { const config = JSON.parse(buffer.trim()); buffer = ''; resolve(config); }
      catch { buffer = ''; reject(new Error('Invalid server configuration')); }
    };
    process.stdin.on('data', receive);
    process.stdin.resume();
  });
}
const secrets = await readMemoryConfiguration();
const port = Number(process.env.PORT || 4180);
const host = process.env.HOST || '127.0.0.1';
const root = path.resolve(import.meta.dirname, '../dist');
const handler = createChatHandler({ getEnv: name => secrets[name] ?? process.env[name] ??
  (name === 'AI_ALLOWED_ORIGINS' ? `http://127.0.0.1:${port},http://localhost:${port}` : undefined) });
const mime = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon' };
const server = http.createServer(async (incoming, outgoing) => {
  try {
    const url = new URL(incoming.url, `http://127.0.0.1:${port}`);
    if (url.pathname === '/api/chat') {
      const options = { method: incoming.method, headers: incoming.headers };
      if (!['GET','HEAD'].includes(incoming.method)) { options.body = Readable.toWeb(incoming); options.duplex = 'half'; }
      const response = await handler(new Request(url, options));
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      outgoing.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    if (!['GET','HEAD'].includes(incoming.method)) { outgoing.writeHead(405); outgoing.end(); return; }
    const relative = decodeURIComponent(url.pathname);
    let file = path.resolve(root, '.' + relative);
    if (!file.startsWith(root + path.sep) && file !== root) { outgoing.writeHead(404); outgoing.end(); return; }
    if (relative === '/' || !path.extname(relative)) file = path.join(root,'index.html');
    if (!mime[path.extname(file)]) { outgoing.writeHead(404); outgoing.end(); return; }
    await stat(file);
    outgoing.writeHead(200, {
      'Content-Type':mime[path.extname(file)], 'X-Content-Type-Options':'nosniff',
      'X-Frame-Options':'DENY', 'Referrer-Policy':'no-referrer',
      'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'",
      'Cache-Control':path.extname(file)==='.html'?'no-cache':'public, max-age=3600',
    });
    outgoing.end(incoming.method==='HEAD'?undefined:await readFile(file));
  } catch { if (!outgoing.headersSent) outgoing.writeHead(404); outgoing.end(); }
});
server.requestTimeout = 35_000;
server.headersTimeout = 10_000;
server.listen(port, host, () => console.log(`InsureCompass: http://${host}:${port}/`));
