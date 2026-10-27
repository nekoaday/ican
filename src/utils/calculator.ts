/**
 * 保额罗盘（InsureCompass）- 确定性保障需求测算
 * 输入和输出的金额单位均为万元人民币，结果保留两位小数。
 */

// 用户基本表单输入
export interface BaseFormInput {
  age: number; // 年龄（岁）
  annualIncome: number; // 个人税后年收入（万元）
  familyMembers: number; // 家庭人数（含本人）
  dependents: number; // 其中依赖本人收入生活的人数
  mortgageBalance: number; // 剩余房贷本金（万元）
  existingLifeInsurance: number; // 已有定期寿险保额（万元）
  existingCriticalIllnessInsurance: number; // 已有重疾险保额（万元）
}

// 高级可折叠设置参数
export interface AdvancedFormInput {
  annualFamilyExpense: number; // 家庭必要年度开支（万元/年）
  otherMemberContribution: number; // 其他家庭成员承担的开支（万元/年）
  supportYears: number; // 保障支持年限（年）
  mortgageSharePercent: number; // 本人承担的房贷比例（0-100%）
  otherDebts: number; // 其他债务（万元）
  specialReserve: number; // 专项教育赡养储备（万元）
  liquidAssets: number; // 可动用流动资产（万元）
  allocatedAssetsToLife: number; // 分配用于定寿风险的流动资产（万元）
  allocatedAssetsToCritical: number; // 分配用于重疾风险的流动资产（万元）
  incomeInterruptionYears: number; // 收入中断年数（年）
  treatmentReserve: number; // 重疾治疗自费储备（万元）
  rehabReserve: number; // 康复照护储备（万元）
}

export type FullCheckupInput = BaseFormInput & AdvancedFormInput;

export function validateCheckupInput(input: FullCheckupInput): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [field, value] of Object.entries(input)) {
    if (!Number.isFinite(value) || value < 0 || value > 1_000_000) {
      errors[field] = '数值须为 0 至 1,000,000 范围内的有限数字';
    }
  }
  if (!Number.isInteger(input.age) || input.age < 18 || input.age > 70) errors.age = '年龄须为18至70岁的整数';
  if (!Number.isInteger(input.familyMembers) || input.familyMembers < 1 || input.familyMembers > 30) errors.familyMembers = '家庭总人数须为1至30人的整数';
  if (!Number.isInteger(input.dependents) || input.dependents < 0 || input.dependents >= input.familyMembers) errors.dependents = '受扶养人数须为非负整数，且少于家庭总人数';
  if (input.mortgageSharePercent > 100) errors.mortgageSharePercent = '房贷承担比例不能超过100%';
  if (input.supportYears > 50) errors.supportYears = '支持年限不能超过50年';
  if (input.incomeInterruptionYears > 10) errors.incomeInterruptionYears = '收入中断年限不能超过10年';
  return errors;
}

// 默认估算假设生成函数（明确标注为可调整的估算假设）
export function getDefaultAssumptions(base: BaseFormInput): AdvancedFormInput {
  const annualFamilyExpense = Number((base.annualIncome * 0.6).toFixed(1)); // 默认：个人税后年收入的 60%
  const otherMemberContribution = 0; // 默认：0
  const supportYears = base.dependents > 0 ? 10 : 0; // 有受扶养人默认 10 年，无则 0 年
  const mortgageSharePercent = 100; // 默认本人承担 100%
  const otherDebts = 0;
  const specialReserve = 0;
  const liquidAssets = 0;
  const allocatedAssetsToLife = 0;
  const allocatedAssetsToCritical = 0;
  const incomeInterruptionYears = 2; // 默认收入中断 2 年
  const treatmentReserve = 30; // 默认重疾治疗自费 30 万元
  const rehabReserve = 10; // 默认康复照护储备 10 万元

  return {
    annualFamilyExpense,
    otherMemberContribution,
    supportYears,
    mortgageSharePercent,
    otherDebts,
    specialReserve,
    liquidAssets,
    allocatedAssetsToLife,
    allocatedAssetsToCritical,
    incomeInterruptionYears,
    treatmentReserve,
    rehabReserve,
  };
}

// 测算单项结果
export interface CoverageCalculationResult {
  assumptions: {
    supportYears: number;
    incomeInterruptionYears: number;
  };
  // 定期寿险结果
  life: {
    annualSupportGap: number; // 年度家庭支持缺口
    supportTotal: number; // 支持年限总缺口
    mortgageResponsibility: number; // 承担房贷金额
    totalDemand: number; // 寿险保障需求总额
    allocatedLiquidAssets: number; // 抵扣的流动资产
    referenceTarget: number; // 定寿参考目标
    existingCoverage: number; // 已有定寿保额
    uncoveredGap: number; // 待补缺口（>=0）
    coverageRatio: number; // 覆盖率（百分比）
    breakdown: {
      mortgage: number;
      familySupport: number;
      otherDebts: number;
      specialReserve: number;
      deductedAssets: number;
    };
  };
  // 重大疾病保险结果
  critical: {
    incomeLossCompensation: number; // 收入中断损失补偿
    treatmentReserve: number; // 治疗自费储备
    rehabReserve: number; // 康复照护储备
    totalDemand: number; // 重疾保障需求总额
    allocatedLiquidAssets: number; // 抵扣的流动资产
    referenceTarget: number; // 重疾参考目标
    existingCoverage: number; // 已有重疾保额
    uncoveredGap: number; // 待补缺口（>=0）
    coverageRatio: number; // 覆盖率（百分比）
    breakdown: {
      treatment: number;
      incomeLoss: number;
      rehab: number;
      deductedAssets: number;
    };
  };
}

export type ScenarioType = 'optimistic' | 'baseline' | 'cautious';

export interface ScenarioDefinition {
  type: ScenarioType;
  name: string;
  tag: string;
  description: string;
  adjustments: {
    supportYearsDelta: number; // 支持年限调整
    incomeInterruptionYears: number; // 收入中断年数
    treatmentReserveMultiplier: number; // 医疗康复储备乘数
  };
}

export const SCENARIOS: Record<ScenarioType, ScenarioDefinition> = {
  optimistic: {
    type: 'optimistic',
    name: '乐观情景',
    tag: '基础防御',
    description: '假设康复恢复顺利、子女较早自立，重点兜底高危核心债务与急症自费。',
    adjustments: {
      supportYearsDelta: -3, // 通常减少3年、下限3年；基准不足3年时不增加
      incomeInterruptionYears: 1.5, // 收入中断1.5年
      treatmentReserveMultiplier: 0.8, // 医疗康复自费按80%计
    },
  },
  baseline: {
    type: 'baseline',
    name: '基准情景',
    tag: '平衡稳健',
    description: '以您当前设置的实际财务和家庭结构为基准，兼顾现实生活水平维持与债务清偿。',
    adjustments: {
      supportYearsDelta: 0,
      incomeInterruptionYears: 2,
      treatmentReserveMultiplier: 1.0,
    },
  },
  cautious: {
    type: 'cautious',
    name: '谨慎情景',
    tag: '全面防御',
    description: '充分考虑重大变故时的长期康复与家庭生活冗余，提供顶格安全垫。',
    adjustments: {
      supportYearsDelta: 5, // 支持年限延长5年
      incomeInterruptionYears: 3, // 收入中断3年
      treatmentReserveMultiplier: 1.3, // 医疗康复储备上浮30%
    },
  },
};

/**
 * 核心计算函数（严格遵循确定性科学计算公式）
 */
export function calculateInsurance(
  input: FullCheckupInput,
  scenario: ScenarioType = 'baseline'
): CoverageCalculationResult {
  const scenarioConfig = SCENARIOS[scenario];

  // 1. 资产分配安全校验（保证不重复扣减、且两项分配不超过总流动资产）
  const totalLiquid = Math.max(0, input.liquidAssets || 0);
  let lifeAsset = Math.max(0, input.allocatedAssetsToLife || 0);
  let criticalAsset = Math.max(0, input.allocatedAssetsToCritical || 0);

  if (lifeAsset + criticalAsset > totalLiquid) {
    // 若用户填写的分配超额，按比例缩放或优先分配
    if (totalLiquid === 0) {
      lifeAsset = 0;
      criticalAsset = 0;
    } else {
      const sum = lifeAsset + criticalAsset;
      lifeAsset = Number(((lifeAsset / sum) * totalLiquid).toFixed(2));
      criticalAsset = Number((totalLiquid - lifeAsset).toFixed(2));
    }
  }

  // 2. 情景参数动态修正
  let effectiveSupportYears = Math.max(0, input.supportYears || 0);
  let effectiveIncomeYears = Math.max(0, input.incomeInterruptionYears ?? 2);
  let effectiveTreatment = Math.max(0, input.treatmentReserve || 0);
  let effectiveRehab = Math.max(0, input.rehabReserve || 0);

  if (scenario === 'optimistic') {
    if (input.dependents > 0) {
      effectiveSupportYears = Math.min(
        effectiveSupportYears,
        Math.max(3, effectiveSupportYears + scenarioConfig.adjustments.supportYearsDelta)
      );
    } else {
      effectiveSupportYears = 0;
    }
    effectiveIncomeYears = Math.min(effectiveIncomeYears, Math.max(1, effectiveIncomeYears * 0.75));
    effectiveTreatment = effectiveTreatment * scenarioConfig.adjustments.treatmentReserveMultiplier;
    effectiveRehab = effectiveRehab * scenarioConfig.adjustments.treatmentReserveMultiplier;
  } else if (scenario === 'cautious') {
    if (input.dependents > 0) {
      effectiveSupportYears = effectiveSupportYears + scenarioConfig.adjustments.supportYearsDelta;
    } else {
      effectiveSupportYears = 0;
    }
    effectiveIncomeYears = Math.max(3, effectiveIncomeYears * 1.5);
    effectiveTreatment = effectiveTreatment * scenarioConfig.adjustments.treatmentReserveMultiplier;
    effectiveRehab = effectiveRehab * scenarioConfig.adjustments.treatmentReserveMultiplier;
  }

  // ======================
  // 3. 定期寿险测算
  // ======================
  // 年度家庭支持缺口 = 有受扶养人时 max(0, 家庭年度必要开支 − 其他家庭成员承担开支)，否则为 0。
  const annualSupportGap =
    input.dependents > 0
      ? Math.max(0, (input.annualFamilyExpense || 0) - (input.otherMemberContribution || 0))
      : 0;

  const supportTotal = annualSupportGap * effectiveSupportYears;
  const mortgageShareRatio = (input.mortgageSharePercent ?? 100) / 100;
  const mortgageResponsibility = (input.mortgageBalance || 0) * mortgageShareRatio;
  const otherDebts = input.otherDebts || 0;
  const specialReserve = input.specialReserve || 0;

  // 寿险保障需求总额 = 房贷余额 × 本人承担比例 + 年度家庭支持缺口 × 需要支持的年数 + 其他个人债务 + 专项家庭储备
  const lifeTotalDemand = mortgageResponsibility + supportTotal + otherDebts + specialReserve;

  // 定寿参考目标 = max(0, 寿险保障需求总额 − 分配用于该风险的流动资产)
  const lifeReferenceTarget = Math.max(0, lifeTotalDemand - lifeAsset);

  // 定寿待补缺口 = max(0, 定寿参考目标 − 已有有效身故保障)
  const existingLife = Math.max(0, input.existingLifeInsurance || 0);
  const lifeUncoveredGap = Math.max(0, lifeReferenceTarget - existingLife);

  // 覆盖率
  const lifeCoverageRatio =
    lifeReferenceTarget > 0 ? Math.min(200, Math.round((existingLife / lifeReferenceTarget) * 100)) : 100;

  // ======================
  // 4. 重疾险测算
  // ======================
  // 收入中断损失 = 个人年收入 × 预计收入中断年数
  const incomeLossCompensation = (input.annualIncome || 0) * effectiveIncomeYears;

  // 重疾保障需求总额 = 重疾治疗自费储备 + 个人年收入 × 预计收入中断年数 + 康复照护储备
  const criticalTotalDemand = effectiveTreatment + incomeLossCompensation + effectiveRehab;

  // 重疾参考目标 = max(0, 重疾保障需求总额 − 分配用于重疾风险的流动资产)
  const criticalReferenceTarget = Math.max(0, criticalTotalDemand - criticalAsset);

  // 重疾待补缺口 = max(0, 重疾参考目标 − 已有有效重疾险给付保额)
  const existingCritical = Math.max(0, input.existingCriticalIllnessInsurance || 0);
  const criticalUncoveredGap = Math.max(0, criticalReferenceTarget - existingCritical);

  // 覆盖率
  const criticalCoverageRatio =
    criticalReferenceTarget > 0 ? Math.min(200, Math.round((existingCritical / criticalReferenceTarget) * 100)) : 100;

  return {
    assumptions: {
      supportYears: input.dependents > 0 ? effectiveSupportYears : 0,
      incomeInterruptionYears: effectiveIncomeYears,
    },
    life: {
      annualSupportGap: Number(annualSupportGap.toFixed(2)),
      supportTotal: Number(supportTotal.toFixed(2)),
      mortgageResponsibility: Number(mortgageResponsibility.toFixed(2)),
      totalDemand: Number(lifeTotalDemand.toFixed(2)),
      allocatedLiquidAssets: Number(lifeAsset.toFixed(2)),
      referenceTarget: Number(lifeReferenceTarget.toFixed(2)),
      existingCoverage: Number(existingLife.toFixed(2)),
      uncoveredGap: Number(lifeUncoveredGap.toFixed(2)),
      coverageRatio: lifeCoverageRatio,
      breakdown: {
        mortgage: Number(mortgageResponsibility.toFixed(2)),
        familySupport: Number(supportTotal.toFixed(2)),
        otherDebts: Number(otherDebts.toFixed(2)),
        specialReserve: Number(specialReserve.toFixed(2)),
        deductedAssets: Number(lifeAsset.toFixed(2)),
      },
    },
    critical: {
      incomeLossCompensation: Number(incomeLossCompensation.toFixed(2)),
      treatmentReserve: Number(effectiveTreatment.toFixed(2)),
      rehabReserve: Number(effectiveRehab.toFixed(2)),
      totalDemand: Number(criticalTotalDemand.toFixed(2)),
      allocatedLiquidAssets: Number(criticalAsset.toFixed(2)),
      referenceTarget: Number(criticalReferenceTarget.toFixed(2)),
      existingCoverage: Number(existingCritical.toFixed(2)),
      uncoveredGap: Number(criticalUncoveredGap.toFixed(2)),
      coverageRatio: criticalCoverageRatio,
      breakdown: {
        treatment: Number(effectiveTreatment.toFixed(2)),
        incomeLoss: Number(incomeLossCompensation.toFixed(2)),
        rehab: Number(effectiveRehab.toFixed(2)),
        deductedAssets: Number(criticalAsset.toFixed(2)),
      },
    },
  };
}
