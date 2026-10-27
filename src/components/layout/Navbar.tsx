import React from 'react';
import { Compass, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  onStartCheckup?: () => void;
  onOpenAiChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onStartCheckup, onOpenAiChat }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* 产品 Logo 与标题 */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
            <Compass className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base md:text-lg tracking-tight text-foreground">
                保额罗盘
              </span>
              <span className="text-xs font-semibold text-accent hidden sm:inline-block">
                InsureCompass
              </span>
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground hidden md:inline-flex">
                确定性公式测算
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              AI 家庭保险保障体检助手 · 免登录即用
            </p>
          </div>
        </div>

        {/* 顶部操作区 */}
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>不保存隐私财务数据</span>
          </div>

          {onOpenAiChat && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAiChat}
              aria-label="AI 顾问"
              className="h-8 text-xs gap-1.5 border-accent/40 text-accent hover:bg-accent/10"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI 顾问</span>
            </Button>
          )}

          {onStartCheckup && (
            <Button
              size="sm"
              onClick={onStartCheckup}
              className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm"
            >
              开始体检
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
