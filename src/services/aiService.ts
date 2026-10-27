export interface ChatMessage { role: 'user' | 'assistant'; content: string; }
export interface AiCheckStatusResponse { configured: boolean; model: string | null; message: string; }
export interface AiChatResponse { configured: boolean; reply?: string; error?: string; message?: string; }

// 浏览器只请求本项目服务端，不持有模型密钥。
const endpoint = import.meta.env?.VITE_AI_ENDPOINT || '/api/chat';
const unavailable = 'AI 服务暂未启用，计算器仍可使用';

export async function checkAiConfigStatus(): Promise<AiCheckStatusResponse> {
  if (!import.meta.env) return { configured: false, model: null, message: unavailable };
  try {
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error('Service unavailable');
    return await response.json();
  } catch { return { configured: false, model: null, message: unavailable }; }
}

export async function sendChatMessage(messages: ChatMessage[], context?: Record<string, unknown>): Promise<AiChatResponse> {
  if (!import.meta.env) return { configured: false, error: 'AI_NOT_CONFIGURED', message: unavailable };
  try {
    const response = await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context }), signal: AbortSignal.timeout(30_000),
    });
    const result = await response.json();
    return result;
  } catch { return { configured: false, error: 'NETWORK_ERROR', message: 'AI 服务连接失败，请稍后重试' }; }
}
