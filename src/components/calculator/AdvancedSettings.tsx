import React from 'react';
import { type AdvancedFormInput } from '@/utils/calculator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, RotateCcw, Info, AlertTriangle } from 'lucide-react';

interface AdvancedSettingsProps {
  data: AdvancedFormInput;
  onChange: (updated: Partial<AdvancedFormInput>) => void;
  onResetDefaults: () => void;
  annualIncome: number;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  data,
  onChange,
  onResetDefaults,
  annualIncome,
}) => {
  const handleNumberChange = (field: keyof AdvancedFormInput, value: string) => {
    const num = value === '' ? 0 : Number(value);
    onChange({ [field]: isNaN(num) ? 0 : Math.max(0, num) });
  };

  const totalAllocated = (data.allocatedAssetsToLife || 0) + (data.allocatedAssetsToCritical || 0);
  const isAssetsOverAllocated = totalAllocated > (data.liquidAssets || 0) && data.liquidAssets > 0;

  return (
    <div className="space-y-6 pt-2">
      {/* 默认假设说明提示条 */}
      <div className="p-3.5 rounded-lg bg-secondary/80 border border-border text-xs text-secondary-foreground flex items-start gap-2.5">
        <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-foreground">关于精细化测算参数假设说明：</p>
          <p className="text-muted-foreground leading-relaxed">
            以下所有默认值均为<strong className="text-foreground">「可调整的估算假设」</strong>，并非保险行业统一硬性标准。
            您可以根据家庭实际收支账目、负债协议与理财规划灵活定制，系统将即时联动重算。
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onResetDefaults}
          className="ml-auto shrink-0 h-7 text-xs px-2.5 flex items-center gap-1 bg-background"
        >
          <RotateCcw className="w-3 h-3" />
          重置默认假设
        </Button>
      </div>

      {/* 参数区块 1：寿险支出与债务 */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          定期寿险与家庭责任参数设置
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="advanced-annualFamilyExpense" className="text-xs font-medium">家庭必要年度开支（万元/年）</Label>
            <div className="relative">
              <Input
                id="advanced-annualFamilyExpense"
                type="number"
                step={0.5}
                min={0}
                value={data.annualFamilyExpense || ''}
                onChange={(e) => handleNumberChange('annualFamilyExpense', e.target.value)}
                className="pr-12 text-sm stat-num"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">万元</span>
            </div>
            <p className="text-[11px] text-muted-foreground">默认设为个人税后年收入的 60%（约 {(annualIncome * 0.6).toFixed(1)} 万）</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="advanced-otherMemberContribution" className="text-xs font-medium">其他家庭成员承担开支（万元/年）</Label>
            <div className="relative">
              <Input
                id="advanced-otherMemberContribution"
                type="number"
                step={0.5}
                min={0}
                value={data.otherMemberContribution || ''}
                onChange={(e) => handleNumberChange('otherMemberContribution', e.target.value)}
                className="pr-12 text-sm stat-num"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">万元</span>
            </div>
            <p className="text-[11px] text-muted-foreground">例如配偶工资可分担的家庭年度支出</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="advanced-supportYears" className="text-xs font-medium">保障支持年限（年）</Label>
            <div className="relative">
              <Input
                id="advanced-supportYears"
                type="number"
                min={0}
                max={40}
                value={data.supportYears}
                onChange={(e) => handleNumberChange('supportYears', e.target.value)}
                className="pr-12 text-sm stat-num"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">年</span>
            </div>
            <p className="text-[11px] text-muted-foreground">建议覆盖到幼子大学毕业或房贷结清</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="advanced-mortgageSharePercent" className="text-xs font-medium">本人承担房贷比例（%）</Label>
            <div className="relative">
              <Input
                id="advanced-mortgageSharePercent"
                type="number"
                min={0}
                max={100}
                value={data.mortgageSharePercent}
                onChange={(e) => handleNumberChange('mortgageSharePercent', e.target.value)}
                className="pr-10 text-sm stat-num"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
            <p className="text-[11px] text-muted-foreground">默认 100%（单人承担），夫妻均摊可填 50%</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="advanced-otherDebts" className="text-xs font-medium">其他个人债务（万元）</Label>
            <div className="relative">
              <Input
                id="advanced-otherDebts"
                type="number"
                min={0}
                value={data.otherDebts || ''}
                onChange={(e) => handleNumberChange('otherDebts', e.target.value)}
                className="pr-12 text-sm stat-num"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">万元</span>
            </div>
            <p className="text-[11px] text-muted-foreground">消费贷、信用贷、经营性个人连带债务等</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="advanced-specialReserve" className="text-xs font-medium">专项教育与赡养储备（万元）</Label>
            <div className="relative">
              <Input
                id="advanced-specialReserve"
                type="number"
                min={0}
                value={data.specialReserve || ''}
                onChange={(e) => handleNumberChange('specialReserve', e.target.value)}
                className="pr-12 text-sm stat-num"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">万元</span>
            </div>
            <p className="text-[11px] text-muted-foreground">子女深造学费、父母终老专项照护金</p>
          </div>
        </div>
      </div>

      {/* 参数区块 2：流动资产安全抵扣设置 */}
      <div className="space-y-4 p-4 rounded-lg bg-card border border-border">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-accent" />
            家庭流动资产与风险抵扣（严禁重复扣减）
          </h4>
          <span className="text-xs text-muted-foreground">总流动资产：{data.liquidAssets || 0} 万元</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="advanced-liquidAssets" className="text-xs font-medium">可动用家庭流动资产总额（万元）</Label>
            <div className="relative">
              <Input
                id="advanced-liquidAssets"
                type="number"
                min={0}
                value={data.liquidAssets || ''}
                onChange={(e) => handleNumberChange('liquidAssets', e.target.value)}
                className="pr-12 text-sm stat-num"
                placeholder="存款/货币基金/理财"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">万元</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="advanced-allocatedAssetsToLife" className="text-xs font-medium">分配用于定寿风险抵扣（万元）</Label>
            <div className="relative">
              <Input
                id="advanced-allocatedAssetsToLife"
                type="number"
                min={0}
                max={data.liquidAssets || 0}
                value={data.allocatedAssetsToLife || ''}
                onChange={(e) => handleNumberChange('allocatedAssetsToLife', e.target.value)}
                className="pr-12 text-sm stat-num"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">万元</span>
            </div>
            <p className="text-[11px] text-muted-foreground">直接充抵身故后的房贷与家庭扶养开销</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="advanced-allocatedAssetsToCritical" className="text-xs font-medium">分配用于重疾风险抵扣（万元）</Label>
            <div className="relative">
              <Input
                id="advanced-allocatedAssetsToCritical"
                type="number"
                min={0}
                max={data.liquidAssets || 0}
                value={data.allocatedAssetsToCritical || ''}
                onChange={(e) => handleNumberChange('allocatedAssetsToCritical', e.target.value)}
                className="pr-12 text-sm stat-num"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">万元</span>
            </div>
            <p className="text-[11px] text-muted-foreground">专款用于垫付大病医疗康复与应急开销</p>
          </div>
        </div>

        {isAssetsOverAllocated && (
          <div className="p-2.5 rounded bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              已分配资产总计 ({totalAllocated} 万) 超出总流动资产 ({data.liquidAssets} 万)。系统计算时已自动按比例保护，防止同一笔资产重复双重抵扣。
            </span>
          </div>
        )}
      </div>

      {/* 参数区块 3：重疾险参数 */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          重大疾病保险保障参数设置
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="advanced-incomeInterruptionYears" className="text-xs font-medium">预计收入中断年数（年）</Label>
            <div className="relative">
              <Input
                id="advanced-incomeInterruptionYears"
                type="number"
                min={0}
                max={10}
                step={0.5}
                value={data.incomeInterruptionYears}
                onChange={(e) => handleNumberChange('incomeInterruptionYears', e.target.value)}
                className="pr-12 text-sm stat-num"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">年</span>
            </div>
            <p className="text-[11px] text-muted-foreground">默认2年为可调整的项目假设，可根据自身情况填0至10年</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="advanced-treatmentReserve" className="text-xs font-medium">重疾治疗自费储备（万元）</Label>
            <div className="relative">
              <Input
                id="advanced-treatmentReserve"
                type="number"
                min={0}
                step={5}
                value={data.treatmentReserve || ''}
                onChange={(e) => handleNumberChange('treatmentReserve', e.target.value)}
                className="pr-12 text-sm stat-num"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">万元</span>
            </div>
            <p className="text-[11px] text-muted-foreground">医保目录外靶向药、质子重离子、免疫治疗自费</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="advanced-rehabReserve" className="text-xs font-medium">康复照护与营养储备（万元）</Label>
            <div className="relative">
              <Input
                id="advanced-rehabReserve"
                type="number"
                min={0}
                step={5}
                value={data.rehabReserve || ''}
                onChange={(e) => handleNumberChange('rehabReserve', e.target.value)}
                className="pr-12 text-sm stat-num"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">万元</span>
            </div>
            <p className="text-[11px] text-muted-foreground">护工照料、居家护理康复器械、特医营养品</p>
          </div>
        </div>
      </div>
    </div>
  );
};
