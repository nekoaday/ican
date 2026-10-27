import React, { useState, useEffect, useRef } from 'react';
import {
  type ChatMessage,
  type AiCheckStatusResponse,
  checkAiConfigStatus,
  sendChatMessage,
} from '@/services/aiService';
import { type FullCheckupInput, calculateInsurance } from '@/utils/calculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Loader2,
  Settings,
  Bot,
  User,
  ExternalLink,
} from 'lucide-react';

interface AiChatAssistantProps {
  currentInput?: FullCheckupInput;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUICK_QUESTIONS = [
  '为什么我需要配置这么高额度的定期寿险？',
  '重疾险和百万医疗险有什么区别？有了百万医疗险还要买重疾吗？',
  '如果未来提前还清房贷，我的保额应该怎么调整？',
  '我的重疾险缺口该优先选择保终身还是保到70岁？',
];

export const AiChatAssistant: React.FC<AiChatAssistantProps> = ({
  currentInput,
  isOpen,
  onOpenChange,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [configStatus, setConfigStatus] = useState<AiCheckStatusResponse | null>(null);
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);
  const [syncContext, setSyncContext] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化检查服务端 AI 配置状态
  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      setIsCheckingConfig(true);
      const res = await checkAiConfigStatus();
      if (isMounted) {
        setConfigStatus(res);
        setIsCheckingConfig(false);
      }
    }
    checkStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  // 消息滚动到底部
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // 生成当前测算上下文摘要
  const getContextPayload = () => {
    if (!syncContext || !currentInput) return undefined;
    const result = calculateInsurance(currentInput, 'baseline');
    return {
      userBaseInfo: {
        age: currentInput.age,
        annualIncome: `${currentInput.annualIncome} 万元/年`,
        familyMembers: `${currentInput.familyMembers} 人`,
        dependents: `${currentInput.dependents} 人`,
        mortgageBalance: `${currentInput.mortgageBalance} 万元`,
        existingLifeInsurance: `${currentInput.existingLifeInsurance} 万元`,
        existingCriticalIllnessInsurance: `${currentInput.existingCriticalIllnessInsurance} 万元`,
      },
      calculationResult: {
        lifeInsurance: {
          referenceTarget: `${result.life.referenceTarget} 万元`,
          uncoveredGap: `${result.life.uncoveredGap} 万元`,
          coverageRatio: `${result.life.coverageRatio}%`,
        },
        criticalIllnessInsurance: {
          referenceTarget: `${result.critical.referenceTarget} 万元`,
          uncoveredGap: `${result.critical.uncoveredGap} 万元`,
          coverageRatio: `${result.critical.coverageRatio}%`,
        },
      },
      assumptions: {
        supportYears: `${currentInput.supportYears} 年`,
        incomeInterruptionYears: `${currentInput.incomeInterruptionYears} 年`,
        annualFamilyExpense: `${currentInput.annualFamilyExpense} 万元/年`,
        treatmentReserve: `${currentInput.treatmentReserve} 万元`,
        rehabReserve: `${currentInput.rehabReserve} 万元`,
      },
    };
  };

  // 发送消息
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || isLoading) return;

    if (!configStatus?.configured) {
      return;
    }

    const newMessages: ChatMessage[] = [...messages.slice(-10), { role: 'user', content }];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);
    setLastError(null);

    const contextPayload = getContextPayload();
    const response = await sendChatMessage(newMessages, contextPayload);

    setIsLoading(false);

    if (response.reply) {
      setMessages((prev) => [...prev, { role: 'assistant', content: response.reply! }]);
    } else {
      const err = response.message || '大模型未能返回有效回答';
      setLastError(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `【服务提示】${err}`,
        },
      ]);
    }
  };

  // 清空对话
  const handleClearChat = () => {
    setMessages([]);
    setLastError(null);
  };

  return (
    <div id="ai-chat-assistant-container" className="no-print">
      {/* 右下角悬浮唤醒按钮 */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/95 transition-all duration-200 active:scale-95 group border border-accent/30"
          aria-label="打开 AI 保险咨询助手"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-accent animate-pulse" />
            {configStatus?.configured && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent ring-2 ring-primary" />
            )}
          </div>
          <span className="text-sm font-semibold tracking-wide">AI 保险咨询助手</span>
        </button>
      )}

      {/* 弹窗 / 抽屉窗口 */}
      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-5 md:right-5 md:w-[420px] md:h-[640px] z-50 flex flex-col bg-card border border-border shadow-2xl rounded-none md:rounded-2xl overflow-hidden transition-all duration-200">
          {/* 窗口顶部标题栏 */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-primary text-primary-foreground border-b border-primary/20 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-accent/20 text-accent">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  保额罗盘 AI 咨询助手
                  {configStatus?.configured ? (
                    <Badge variant="outline" className="text-[10px] h-4 px-1 border-accent/40 text-accent">
                      服务已配置
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] h-4 px-1 border-amber-400 text-amber-300">
                      尚未配置
                    </Badge>
                  )}
                </h3>
                <p className="text-[11px] text-primary-foreground/70">
                  专业解答保额依据、险种搭配与家庭规划疑问
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearChat}
                  title="清空会话"
                  className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                aria-label="关闭 AI 助手"
                className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 测算上下文同步开关 */}
          {currentInput && (
            <div className="px-3.5 py-2 bg-secondary/50 border-b border-border flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Settings className="w-3.5 h-3.5 text-accent" />
                <span>授权同步基准测算报告与财务假设</span>
              </div>
              <Switch
                checked={syncContext}
                onCheckedChange={setSyncContext}
                className="scale-75"
              />
            </div>
          )}

          {/* 对话消息区 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!isCheckingConfig && !configStatus?.configured && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs space-y-1">
                <p className="font-semibold">AI 服务暂未启用</p>
                <p>您仍可使用测算、情景对比与报告功能。服务恢复后可继续咨询。</p>
              </div>
            )}

            {/* 欢迎语 */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl rounded-tl-sm bg-muted text-xs leading-relaxed text-foreground max-w-[85%] space-y-1.5">
                <p>您好！我是您的家庭保险保障规划助手。</p>
                <p>
                  我可以结合您填写的房贷、家庭开销与抚养责任，为您详细解读定寿与重疾的配置逻辑。
                </p>
                {configStatus?.configured && (
                  <p className="text-muted-foreground pt-1 border-t border-border/50 text-[11px]">
                    您可以点击下方快捷问题，或直接输入您的个性化疑问：
                  </p>
                )}
              </div>
            </div>

            {/* 快捷推荐提问（当尚未发很多消息时展示） */}
            {configStatus?.configured && messages.length <= 2 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-accent" />
                  猜你想问：
                </p>
                <div className="flex flex-col gap-1.5">
                  {QUICK_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(q)}
                      disabled={isLoading}
                      className="text-left text-xs p-2 rounded-lg bg-secondary/60 hover:bg-secondary text-foreground border border-border/60 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 对话消息流 */}
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${
                  m.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                    m.role === 'user'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap break-words ${
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted text-foreground rounded-tl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {/* 加载状态 */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-2xl bg-muted text-xs text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                  <span>AI 正在结合您的测算报告思考回答...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 底部输入框 */}
          <div className="p-3 border-t border-border bg-card shrink-0 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <Input
                aria-label="AI 保险问题"
                maxLength={1500}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  configStatus?.configured
                    ? '输入您的保险保障疑问...'
                    : 'AI 服务端未配置 API 密钥'
                }
                disabled={isLoading || !configStatus?.configured}
                className="text-xs h-9"
              />
              <Button
                aria-label="发送问题"
                type="submit"
                disabled={isLoading || !inputText.trim() || !configStatus?.configured}
                size="sm"
                className="h-9 px-3 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </Button>
            </form>
            <div className="text-[10px] text-muted-foreground text-center">
              AI 建议仅供保障科普与财务参考，不构成具体保险产品销售承诺
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
