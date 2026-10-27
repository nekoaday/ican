import React from 'react';
import { type BaseFormInput } from '@/utils/calculator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Wallet, Users, Home, Shield, HeartHandshake } from 'lucide-react';

interface BaseFormProps {
  data: BaseFormInput;
  onChange: (updated: Partial<BaseFormInput>) => void;
  errors: Record<string, string>;
}

export const BaseForm: React.FC<BaseFormProps> = ({ data, onChange, errors }) => {
  const handleNumberChange = (field: keyof BaseFormInput, value: string) => {
    const num = value === '' ? 0 : Number(value);
    onChange({ [field]: isNaN(num) ? 0 : Math.max(0, num) });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 年龄 */}
        <div className="space-y-2">
          <Label htmlFor="age" className="flex items-center text-sm font-medium text-foreground">
            <User className="w-4 h-4 mr-1.5 text-accent" />
            您的年龄
            <span className="text-muted-foreground ml-1.5 text-xs font-normal">（岁）</span>
          </Label>
          <div className="relative">
            <Input
              id="age"
              type="number"
              min={18}
              max={70}
              value={data.age || ''}
              onChange={(e) => handleNumberChange('age', e.target.value)}
              className="pr-12 text-base font-semibold stat-num"
              placeholder="例如 32"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              岁
            </span>
          </div>
          {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
        </div>

        {/* 个人税后年收入 */}
        <div className="space-y-2">
          <Label htmlFor="annualIncome" className="flex items-center text-sm font-medium text-foreground">
            <Wallet className="w-4 h-4 mr-1.5 text-accent" />
            个人税后年收入
            <span className="text-muted-foreground ml-1.5 text-xs font-normal">（万元/年）</span>
          </Label>
          <div className="relative">
            <Input
              id="annualIncome"
              type="number"
              min={0}
              step={0.5}
              value={data.annualIncome || ''}
              onChange={(e) => handleNumberChange('annualIncome', e.target.value)}
              className="pr-16 text-base font-semibold stat-num"
              placeholder="例如 20"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              万元/年
            </span>
          </div>
          {errors.annualIncome && <p className="text-xs text-destructive">{errors.annualIncome}</p>}
        </div>

        {/* 家庭总人数 */}
        <div className="space-y-2">
          <Label htmlFor="familyMembers" className="flex items-center text-sm font-medium text-foreground">
            <Users className="w-4 h-4 mr-1.5 text-primary" />
            家庭总人数
            <span className="text-muted-foreground ml-1.5 text-xs font-normal">（含本人，人）</span>
          </Label>
          <div className="relative">
            <Input
              id="familyMembers"
              type="number"
              min={1}
              max={15}
              value={data.familyMembers || ''}
              onChange={(e) => handleNumberChange('familyMembers', e.target.value)}
              className="pr-12 text-base font-semibold stat-num"
              placeholder="例如 3"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              人
            </span>
          </div>
          {errors.familyMembers && <p className="text-xs text-destructive">{errors.familyMembers}</p>}
        </div>

        {/* 受扶养人数 */}
        <div className="space-y-2">
          <Label htmlFor="dependents" className="flex items-center text-sm font-medium text-foreground">
            <HeartHandshake className="w-4 h-4 mr-1.5 text-primary" />
            其中依赖本人收入生活的人数
            <span className="text-muted-foreground ml-1.5 text-xs font-normal">（子女/老人/全职配偶）</span>
          </Label>
          <div className="relative">
            <Input
              id="dependents"
              type="number"
              min={0}
              max={data.familyMembers - 1 || 10}
              value={data.dependents}
              onChange={(e) => handleNumberChange('dependents', e.target.value)}
              className="pr-12 text-base font-semibold stat-num"
              placeholder="例如 2"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              人
            </span>
          </div>
          {errors.dependents && <p className="text-xs text-destructive">{errors.dependents}</p>}
          <p className="text-[11px] text-muted-foreground">若无受扶养人，定寿无需预留年度家庭支持基金</p>
        </div>

        {/* 剩余房贷本金 */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="mortgageBalance" className="flex items-center text-sm font-medium text-foreground">
            <Home className="w-4 h-4 mr-1.5 text-accent" />
            剩余房贷本金余额
            <span className="text-muted-foreground ml-1.5 text-xs font-normal">（万元）</span>
          </Label>
          <div className="relative">
            <Input
              id="mortgageBalance"
              type="number"
              min={0}
              step={1}
              value={data.mortgageBalance || ''}
              onChange={(e) => handleNumberChange('mortgageBalance', e.target.value)}
              className="pr-12 text-base font-semibold stat-num"
              placeholder="无房贷可填 0，如 100"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              万元
            </span>
          </div>
          {errors.mortgageBalance && <p className="text-xs text-destructive">{errors.mortgageBalance}</p>}
        </div>

        {/* 已有定期寿险保额 */}
        <div className="space-y-2">
          <Label htmlFor="existingLifeInsurance" className="flex items-center text-sm font-medium text-foreground">
            <Shield className="w-4 h-4 mr-1.5 text-blue-600" />
            已有有效定期寿险/终身寿险保额
            <span className="text-muted-foreground ml-1.5 text-xs font-normal">（万元）</span>
          </Label>
          <div className="relative">
            <Input
              id="existingLifeInsurance"
              type="number"
              min={0}
              step={5}
              value={data.existingLifeInsurance}
              onChange={(e) => handleNumberChange('existingLifeInsurance', e.target.value)}
              className="pr-12 text-base font-semibold stat-num"
              placeholder="如 50，没有填 0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              万元
            </span>
          </div>
        </div>

        {/* 已有重疾险保额 */}
        <div className="space-y-2">
          <Label htmlFor="existingCriticalIllnessInsurance" className="flex items-center text-sm font-medium text-foreground">
            <Shield className="w-4 h-4 mr-1.5 text-emerald-600" />
            已有有效重疾险给付保额
            <span className="text-muted-foreground ml-1.5 text-xs font-normal">（万元，不含百万医疗险）</span>
          </Label>
          <div className="relative">
            <Input
              id="existingCriticalIllnessInsurance"
              type="number"
              min={0}
              step={5}
              value={data.existingCriticalIllnessInsurance}
              onChange={(e) => handleNumberChange('existingCriticalIllnessInsurance', e.target.value)}
              className="pr-12 text-base font-semibold stat-num"
              placeholder="如 20，没有填 0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              万元
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">注：百万医疗险为报销制，不可替代重疾给付保额</p>
        </div>
      </div>
    </div>
  );
};
