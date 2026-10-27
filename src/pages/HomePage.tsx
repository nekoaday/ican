import React, { useState, useRef } from 'react';
import {
  type BaseFormInput,
  type AdvancedFormInput,
  type FullCheckupInput,
  getDefaultAssumptions,
  calculateInsurance,
  validateCheckupInput,
} from '@/utils/calculator';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BaseForm } from '@/components/calculator/BaseForm';
import { AdvancedSettings } from '@/components/calculator/AdvancedSettings';
import { ReportView } from '@/components/report/ReportView';
import { AiChatAssistant } from '@/components/chat/AiChatAssistant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Compass,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FileText,
  Sliders,
} from 'lucide-react';
import { toast } from 'sonner';

export const HomePage: React.FC = () => {
  // 默认初始数据（贴近中国典型家庭经济支柱场景）
  const [baseInput, setBaseInput] = useState<BaseFormInput>({
    age: 32,
    annualIncome: 20, // 20万/年
    familyMembers: 3, // 3人
    dependents: 2, // 2人
    mortgageBalance: 100, // 房贷100万
    existingLifeInsurance: 50, // 已有定寿50万
    existingCriticalIllnessInsurance: 20, // 已有重疾20万
  });

  const [advancedInput, setAdvancedInput] = useState<AdvancedFormInput>(() =>
    getDefaultAssumptions({
      age: 32,
      annualIncome: 20,
      familyMembers: 3,
      dependents: 2,
      mortgageBalance: 100,
      existingLifeInsurance: 50,
      existingCriticalIllnessInsurance: 20,
    })
  );

  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  const [hasGeneratedReport, setHasGeneratedReport] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);

  const reportRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const customizedExpense = useRef(false);

  // 合并完整输入
  const fullInput: FullCheckupInput = {
    ...baseInput,
    ...advancedInput,
  };

  // 即时快速计算预览
  const quickResult = calculateInsurance(fullInput, 'baseline');

  // 表单更新
  const handleBaseChange = (updated: Partial<BaseFormInput>) => {
    setBaseInput((prev) => {
      const next = { ...prev, ...updated };
      // 若年收入改变且用户未自定义开支，可动态同步调整默认开支建议
      if (updated.annualIncome !== undefined && !customizedExpense.current) {
        setAdvancedInput((adv) => ({
          ...adv,
          annualFamilyExpense: Number((next.annualIncome * 0.6).toFixed(1)),
        }));
      }
      return next;
    });
    setErrors({});
  };

  const handleAdvancedChange = (updated: Partial<AdvancedFormInput>) => {
    if (updated.annualFamilyExpense !== undefined) customizedExpense.current = true;
    setAdvancedInput((prev) => ({ ...prev, ...updated }));
  };

  const handleResetDefaults = () => {
    customizedExpense.current = false;
    setAdvancedInput(getDefaultAssumptions(baseInput));
    toast.success('已恢复为基准估算假设');
  };

  // 表单有效性校验
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = validateCheckupInput(fullInput);
    if (!baseInput.age || baseInput.age < 18 || baseInput.age > 70) {
      newErrors.age = '年龄须在 18 至 70 岁之间';
    }
    if (baseInput.annualIncome === undefined || baseInput.annualIncome < 0) {
      newErrors.annualIncome = '个人年收入不能为负数';
    }
    if (!baseInput.familyMembers || baseInput.familyMembers < 1) {
      newErrors.familyMembers = '家庭总人数至少为 1 人';
    }
    if (baseInput.dependents < 0 || baseInput.dependents >= baseInput.familyMembers) {
      newErrors.dependents = '受扶养人数不能超过其他家庭成员总数';
    }
    if (baseInput.mortgageBalance < 0) {
      newErrors.mortgageBalance = '房贷余额不能为负数';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) toast.error(Object.values(newErrors)[0]);
    return Object.keys(newErrors).length === 0;
  };

  // 触发生成体检报告
  const handleGenerateReport = () => {
    if (!validateForm()) {
      toast.error('表单输入存在不合法数值，请检查后重新提交');
      return;
    }
    setHasGeneratedReport(true);
    toast.success('家庭保险保障体检报告已生成');
    setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 返回修改
  const handleModify = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 顶部导航 */}
      <Navbar
        onStartCheckup={() => {
          formRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenAiChat={() => setIsAiChatOpen(true)}
      />

      {/* 主体区域 */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-12">
        {/* Hero 宣传区 */}
        <section className="text-center space-y-4 pt-4 md:pt-8 no-print">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border text-xs font-semibold text-foreground">
            <Compass className="w-3.5 h-3.5 text-accent" />
            <span>保额罗盘 · InsureCompass</span>
            <span className="text-muted-foreground font-normal">|</span>
            <span className="text-muted-foreground font-normal">免登录 · 确定性公式测算</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground text-balance">
            家庭人身保额智能体检
          </h1>

          <p className="max-w-2xl mx-auto text-sm md:text-base text-muted-foreground text-pretty leading-relaxed">
            告别凭感觉买保险。输入家庭基础收支与负债，基于严格的责任法与收入损失模型，
            为您测算定期寿险与重大疾病保险的<strong className="text-foreground">参考保障目标</strong>与
            <strong className="text-destructive font-semibold">待补风险缺口</strong>。
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              拒绝 AI 随机臆造保额
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary" />
              乐观/基准/谨慎三情景推演
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent" />
              接入大模型专属 AI 顾问
            </span>
          </div>
        </section>

        {/* 表单填写区域 */}
        <section ref={formRef} className="space-y-6 scroll-mt-20 no-print">
          <Card className="fintech-card overflow-hidden">
            <CardHeader className="bg-card border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    家庭财务与风险信息采集
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    以下基础信息用于确定家庭责任总额，所有数字仅在您浏览器本地计算
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* 基本表单 */}
              <BaseForm
                data={baseInput}
                onChange={handleBaseChange}
                errors={errors}
              />

              {/* 高级折叠面板 */}
              <div className="pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary text-xs font-semibold text-foreground transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-accent" />
                    <span>高级参数设置与资产抵扣</span>
                    <span className="text-[11px] font-normal text-muted-foreground">
                      （家庭支出、支持年限、债务、流动资产抵扣、收入中断期等）
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span>{isAdvancedOpen ? '收起高级设置' : '展开精细调整'}</span>
                    {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isAdvancedOpen && (
                  <div className="pt-4 animate-accordion-down">
                    <AdvancedSettings
                      data={advancedInput}
                      onChange={handleAdvancedChange}
                      onResetDefaults={handleResetDefaults}
                      annualIncome={baseInput.annualIncome}
                    />
                  </div>
                )}
              </div>

              {/* 即时计算反馈摘要条 */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center md:justify-start">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    即时测算参考反馈（基准情景）
                  </div>
                  <div className="text-sm font-semibold text-foreground flex flex-wrap items-center gap-x-4 gap-y-1 justify-center md:justify-start">
                    <span>
                      定寿参考目标：<strong className="text-primary stat-num">{quickResult.life.referenceTarget} 万</strong>
                      （缺口 <strong className="text-destructive stat-num">{quickResult.life.uncoveredGap} 万</strong>）
                    </span>
                    <span className="hidden md:inline text-muted-foreground">|</span>
                    <span>
                      重疾参考目标：<strong className="text-accent stat-num">{quickResult.critical.referenceTarget} 万</strong>
                      （缺口 <strong className="text-destructive stat-num">{quickResult.critical.uncoveredGap} 万</strong>）
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateReport}
                  className="w-full md:w-auto h-10 px-6 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-md gap-2"
                >
                  生成完整体检报告
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 体检报告区域 */}
        <section ref={reportRef} className="scroll-mt-20">
          {hasGeneratedReport && Object.keys(validateCheckupInput(fullInput)).length === 0 && (
            <ReportView
              input={fullInput}
              onModify={handleModify}
              onOpenAiChat={() => setIsAiChatOpen(true)}
            />
          )}
        </section>
      </main>

      {/* 底部与免责声明 */}
      <Footer />

      {/* 右下角 AI 咨询助手 */}
      <AiChatAssistant
        currentInput={fullInput}
        isOpen={isAiChatOpen}
        onOpenChange={setIsAiChatOpen}
      />
    </div>
  );
};
