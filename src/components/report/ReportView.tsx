import React, { useState } from 'react';
import {
  type FullCheckupInput,
  type ScenarioType,
  SCENARIOS,
  calculateInsurance,
} from '@/utils/calculator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShieldAlert,
  ShieldCheck,
  Printer,
  ChevronDown,
  ChevronUp,
  Sparkles,
  PieChart as PieIcon,
  Calculator,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ReportViewProps {
  input: FullCheckupInput;
  onModify: () => void;
  onOpenAiChat: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ input, onModify, onOpenAiChat }) => {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('baseline');
  const [showFormulaDetails, setShowFormulaDetails] = useState<boolean>(false);

  // 根据当前情景重新实时计算
  const result = calculateInsurance(input, activeScenario);
  const scenarioConfig = SCENARIOS[activeScenario];

  // 打印功能
  const handlePrint = () => {
    window.print();
  };

  // 柱状图数据：已有 vs 待补缺口
  const comparisonData = [
    {
      name: '定期寿险',
      已有保障: result.life.existingCoverage,
      待补缺口: result.life.uncoveredGap,
      参考总目标: result.life.referenceTarget,
    },
    {
      name: '重大疾病险',
      已有保障: result.critical.existingCoverage,
      待补缺口: result.critical.uncoveredGap,
      参考总目标: result.critical.referenceTarget,
    },
  ];

  return (
    <div className="space-y-8 print-page">
      {/* 顶部标题与操作条 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-accent/15 text-accent">
              体检已完成
            </span>
            <span className="text-xs text-muted-foreground">
              测算基准时间：{new Date().toLocaleDateString('zh-CN')}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mt-1 text-balance">
            家庭人身风险与保额缺口体检报告
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground text-pretty">
            根据您的家庭财务结构、抚养责任与房贷负债生成的确定性量化保障配置方案
          </p>
        </div>

        <div className="flex items-center gap-2.5 no-print">
          <Button variant="outline" size="sm" onClick={onModify} className="text-xs h-9">
            返回修改数据
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs h-9 gap-1.5">
            <Printer className="w-3.5 h-3.5" />
            打印 / 保存PDF
          </Button>
          <Button
            size="sm"
            onClick={onOpenAiChat}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            AI 咨询解读
          </Button>
        </div>
      </div>

      {/* 情景切换面板 */}
      <div className="p-4 rounded-xl bg-card border border-border space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-secondary">
              情景模式动态推演
            </Badge>
            <span className="text-xs text-muted-foreground">
              动态调整抚养支持年数、收入中断期及康复储备
            </span>
          </div>
          <Tabs
            value={activeScenario}
            onValueChange={(val) => setActiveScenario(val as ScenarioType)}
            className="w-full md:w-auto no-print"
          >
            <TabsList className="grid grid-cols-3 h-8 w-full md:w-80">
              <TabsTrigger value="optimistic" className="text-xs">
                乐观情景
              </TabsTrigger>
              <TabsTrigger value="baseline" className="text-xs font-semibold">
                基准情景
              </TabsTrigger>
              <TabsTrigger value="cautious" className="text-xs">
                谨慎情景
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <p className="text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-lg border border-border/50">
          <strong className="text-foreground">{scenarioConfig.name}（{scenarioConfig.tag}）：</strong>
          {scenarioConfig.description}
        </p>
      </div>

      {/* 两张大型保额结果卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 定期寿险结果卡 */}
        <Card className="fintech-card overflow-hidden border-t-4 border-t-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">定期寿险保障建议</CardTitle>
                  <CardDescription className="text-xs">防范家庭经济支柱身故导致的债务与抚养断裂</CardDescription>
                </div>
              </div>
              <Badge
                variant={result.life.uncoveredGap > 0 ? 'destructive' : 'secondary'}
                className="text-xs px-2 py-0.5"
              >
                {result.life.uncoveredGap > 0 ? '存在保障缺口' : '已达本次测算目标'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* 核心数字大卡 */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/50 border border-border">
              <div>
                <span className="text-xs text-muted-foreground">参考目标保额</span>
                <div className="text-2xl md:text-3xl font-extrabold text-foreground stat-num mt-0.5">
                  {result.life.referenceTarget}
                  <span className="text-sm font-normal text-muted-foreground ml-1">万元</span>
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-destructive flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  待补保障缺口
                </span>
                <div className="text-2xl md:text-3xl font-extrabold text-destructive stat-num mt-0.5">
                  {result.life.uncoveredGap}
                  <span className="text-sm font-normal text-destructive/80 ml-1">万元</span>
                </div>
              </div>
            </div>

            {/* 进度条与已有保障 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  已有身故保额：<strong className="text-foreground">{result.life.existingCoverage} 万元</strong>
                </span>
                <span className="font-semibold text-foreground">
                  覆盖率：{result.life.coverageRatio}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden flex">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, result.life.coverageRatio)}%` }}
                />
              </div>
            </div>

            {/* 构成拆解明细 */}
            <div className="text-xs space-y-1.5 pt-2 border-t border-border">
              <div className="flex justify-between text-muted-foreground">
                <span>承担房贷本金：</span>
                <span className="font-medium text-foreground">{result.life.breakdown.mortgage} 万元</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>家庭生活支持基金总额：</span>
                <span className="font-medium text-foreground">{result.life.breakdown.familySupport} 万元</span>
              </div>
              {result.life.breakdown.otherDebts > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>其他个人债务兜底：</span>
                  <span className="font-medium text-foreground">{result.life.breakdown.otherDebts} 万元</span>
                </div>
              )}
              {result.life.breakdown.specialReserve > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>专项教育与赡养储备：</span>
                  <span className="font-medium text-foreground">{result.life.breakdown.specialReserve} 万元</span>
                </div>
              )}
              {result.life.breakdown.deductedAssets > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>已抵扣专款流动资产：</span>
                  <span className="font-medium">- {result.life.breakdown.deductedAssets} 万元</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 重疾险结果卡 */}
        <Card className="fintech-card overflow-hidden border-t-4 border-t-accent">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-accent/15 text-accent">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">重大疾病保险保障建议</CardTitle>
                  <CardDescription className="text-xs">弥补大病停工收入损失、高昂自费靶向药与长效康复</CardDescription>
                </div>
              </div>
              <Badge
                variant={result.critical.uncoveredGap > 0 ? 'destructive' : 'secondary'}
                className="text-xs px-2 py-0.5"
              >
                {result.critical.uncoveredGap > 0 ? '存在保障缺口' : '已达本次测算目标'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* 核心数字大卡 */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/50 border border-border">
              <div>
                <span className="text-xs text-muted-foreground">参考目标保额</span>
                <div className="text-2xl md:text-3xl font-extrabold text-foreground stat-num mt-0.5">
                  {result.critical.referenceTarget}
                  <span className="text-sm font-normal text-muted-foreground ml-1">万元</span>
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-destructive flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  待补保障缺口
                </span>
                <div className="text-2xl md:text-3xl font-extrabold text-destructive stat-num mt-0.5">
                  {result.critical.uncoveredGap}
                  <span className="text-sm font-normal text-destructive/80 ml-1">万元</span>
                </div>
              </div>
            </div>

            {/* 进度条与已有保障 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  已有重疾保额：<strong className="text-foreground">{result.critical.existingCoverage} 万元</strong>
                </span>
                <span className="font-semibold text-foreground">
                  覆盖率：{result.critical.coverageRatio}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden flex">
                <div
                  className="bg-accent h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, result.critical.coverageRatio)}%` }}
                />
              </div>
            </div>

            {/* 构成拆解明细 */}
            <div className="text-xs space-y-1.5 pt-2 border-t border-border">
              <div className="flex justify-between text-muted-foreground">
                <span>停工收入损失补偿金：</span>
                <span className="font-medium text-foreground">{result.critical.breakdown.incomeLoss} 万元</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>重疾自费治疗储备：</span>
                <span className="font-medium text-foreground">{result.critical.breakdown.treatment} 万元</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>长期康复与照料营养费：</span>
                <span className="font-medium text-foreground">{result.critical.breakdown.rehab} 万元</span>
              </div>
              {result.critical.breakdown.deductedAssets > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>已抵扣专款流动资产：</span>
                  <span className="font-medium">- {result.critical.breakdown.deductedAssets} 万元</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 可视化对比图表 */}
      <Card className="fintech-card">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-accent" />
            <CardTitle className="text-base font-bold">已有保额与待补缺口对比透视图</CardTitle>
          </div>
          <CardDescription className="text-xs">
            直观衡量当前有效保障与参考保障目标之间的配置完成度
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full min-w-0 overflow-hidden h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{ top: 15, right: 25, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 13, fill: 'currentColor' }} />
                <YAxis unit="万" tick={{ fontSize: 12, fill: 'currentColor' }} />
                <Tooltip
                  formatter={(value: number | string | Array<number | string> | undefined) => [
                    `${value ?? 0} 万元`,
                    undefined,
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: 10, fontSize: 12 }}
                />
                <Bar isAnimationActive={false} dataKey="已有保障" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar isAnimationActive={false} dataKey="待补缺口" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 科学计算依据与步骤透明明细 */}
      <Card className="fintech-card">
        <CardHeader
          className="cursor-pointer select-none pb-3"
          onClick={() => setShowFormulaDetails(!showFormulaDetails)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-bold">计算依据与公式推导明细</CardTitle>
              <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground">
                确定性测算公式
              </Badge>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={(e) => {
                e.stopPropagation();
                setShowFormulaDetails(!showFormulaDetails);
              }}
            >
              {showFormulaDetails ? '收起明细' : '展开推导过程'}
              {showFormulaDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
          </div>
          <CardDescription className="text-xs">
            坚持确定性公式计算，拒绝随机与假数据，所有数字有据可查
          </CardDescription>
        </CardHeader>

          <CardContent className={`space-y-6 pt-2 border-t border-border ${showFormulaDetails ? '' : 'hidden print:block'}`}>
            {/* 定寿公式 */}
            <div className="p-4 rounded-lg bg-secondary/30 space-y-2.5 text-xs text-foreground">
              <h4 className="font-bold text-sm text-primary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                定期寿险（Life Insurance）推导逻辑：
              </h4>
              <div className="space-y-1.5 font-mono text-[11px] text-muted-foreground bg-card p-3 rounded border border-border">
                <p>1. 年度家庭支持缺口 = 有受扶养人时 max(0, 年度支出 {input.annualFamilyExpense}万 - 其他成员承担 {input.otherMemberContribution || 0}万) = {result.life.annualSupportGap} 万元</p>
                <p>2. 寿险保障需求总额 = 房贷 {input.mortgageBalance}万 × {input.mortgageSharePercent}% + 年度支持缺口 {result.life.annualSupportGap}万 × {result.assumptions.supportYears}年 + 债务 {input.otherDebts || 0}万 + 专项储备 {input.specialReserve || 0}万 = {result.life.totalDemand} 万元</p>
                <p>3. 定寿参考目标 = max(0, 需求总额 {result.life.totalDemand}万 - 分配流动资产 {result.life.allocatedLiquidAssets}万) = {result.life.referenceTarget} 万元</p>
                <p>4. 定寿待补缺口 = max(0, 参考目标 {result.life.referenceTarget}万 - 已有定寿保额 {result.life.existingCoverage}万) = {result.life.uncoveredGap} 万元</p>
              </div>
            </div>

            {/* 重疾公式 */}
            <div className="p-4 rounded-lg bg-secondary/30 space-y-2.5 text-xs text-foreground">
              <h4 className="font-bold text-sm text-accent flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent" />
                重大疾病保险（Critical Illness）推导逻辑：
              </h4>
              <div className="space-y-1.5 font-mono text-[11px] text-muted-foreground bg-card p-3 rounded border border-border">
                <p>1. 收入中断损失 = 年收入 {input.annualIncome}万 × 收入中断 {result.assumptions.incomeInterruptionYears}年 = {result.critical.incomeLossCompensation} 万元</p>
                <p>2. 重疾保障需求总额 = 治疗自费 {result.critical.treatmentReserve}万 + 收入中断 {result.critical.incomeLossCompensation}万 + 康复照护 {result.critical.rehabReserve}万 = {result.critical.totalDemand} 万元</p>
                <p>3. 重疾参考目标 = max(0, 需求总额 {result.critical.totalDemand}万 - 分配流动资产 {result.critical.allocatedLiquidAssets}万) = {result.critical.referenceTarget} 万元</p>
                <p>4. 重疾待补缺口 = max(0, 参考目标 {result.critical.referenceTarget}万 - 已有重疾保额 {result.critical.existingCoverage}万) = {result.critical.uncoveredGap} 万元</p>
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>注：两种风险分配的流动资产总额受总资产约束，避免重复抵扣；已有保额超出时缺口下限为 0，不为负数。</span>
            </div>
          </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">本报告为可调整假设下的保障需求参考，不代表保险报价、承保或理赔结论。</p>

      {/* 底部引导与合规提示 */}
      <div className="no-print p-4 rounded-xl bg-card border border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-sm font-semibold text-foreground">对测算结果有疑问，或想进一步咨询险种搭配？</h4>
          <p className="text-xs text-muted-foreground">
            点击右下角悬浮助手或下方按钮，可选择授权同步当前测算指标，再由 AI 助手解释。
          </p>
        </div>
        <div className="flex items-center gap-3 no-print shrink-0">
          <Button
            onClick={onOpenAiChat}
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs gap-1.5 h-9"
          >
            开启 AI 顾问对话
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
