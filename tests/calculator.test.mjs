import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateInsurance, getDefaultAssumptions, validateCheckupInput } from '../src/utils/calculator.ts';

// 全部金额均为万元；仅使用虚构的验收数据。
const input = {
  age: 32,
  annualIncome: 20,
  familyMembers: 3,
  dependents: 2,
  mortgageBalance: 100,
  existingLifeInsurance: 50,
  existingCriticalIllnessInsurance: 20,
  annualFamilyExpense: 12,
  otherMemberContribution: 0,
  supportYears: 10,
  mortgageSharePercent: 100,
  otherDebts: 0,
  specialReserve: 0,
  liquidAssets: 20,
  allocatedAssetsToLife: 20,
  allocatedAssetsToCritical: 0,
  incomeInterruptionYears: 2,
  treatmentReserve: 30,
  rehabReserve: 10,
};

test('基准样例：定寿目标200万、缺口150万，重疾目标80万、缺口60万', () => {
  const result = calculateInsurance(input);
  assert.equal(result.life.referenceTarget, 200);
  assert.equal(result.life.uncoveredGap, 150);
  assert.equal(result.critical.referenceTarget, 80);
  assert.equal(result.critical.uncoveredGap, 60);
});

test('已有保障超过目标时，两项缺口均为零', () => {
  const result = calculateInsurance({
    ...input,
    existingLifeInsurance: 300,
    existingCriticalIllnessInsurance: 150,
  });
  assert.equal(result.life.uncoveredGap, 0);
  assert.equal(result.critical.uncoveredGap, 0);
});

test('收入中断为零时，基准与乐观情景均不计停工收入损失', () => {
  for (const scenario of ['baseline', 'optimistic']) {
    const result = calculateInsurance({ ...input, incomeInterruptionYears: 0 }, scenario);
    assert.equal(result.critical.incomeLossCompensation, 0);
  }
});

test('支持期仅1年时，乐观情景不延长到3年', () => {
  const shortInput = { ...input, supportYears: 1 };
  assert.equal(calculateInsurance(shortInput).life.supportTotal, 12);
  assert.equal(calculateInsurance(shortInput, 'optimistic').life.supportTotal, 12);
});

test('零支持期在乐观情景中保持为零', () => {
  const result = calculateInsurance({ ...input, supportYears: 0 }, 'optimistic');
  assert.equal(result.life.supportTotal, 0);
});

test('不足1年的收入中断期不会被乐观情景提高到1年', () => {
  const result = calculateInsurance({ ...input, incomeInterruptionYears: 0.5 }, 'optimistic');
  assert.equal(result.critical.incomeLossCompensation, 10);
});

test('常规乐观情景仍使用7年支持期、1.5年收入中断和80%医疗康复储备', () => {
  const result = calculateInsurance(input, 'optimistic');
  assert.equal(result.life.supportTotal, 84);
  assert.equal(result.life.referenceTarget, 164);
  assert.equal(result.critical.incomeLossCompensation, 30);
  assert.equal(result.critical.referenceTarget, 62);
});

test('不同短期与长期输入下，乐观目标不会高于基准目标', () => {
  for (const supportYears of [0, 0.5, 1, 2, 3, 5, 10, 20]) {
    for (const incomeInterruptionYears of [0, 0.5, 1, 2, 4]) {
      const sample = { ...input, supportYears, incomeInterruptionYears };
      const baseline = calculateInsurance(sample);
      const optimistic = calculateInsurance(sample, 'optimistic');
      assert.ok(optimistic.life.referenceTarget <= baseline.life.referenceTarget);
      assert.ok(optimistic.critical.referenceTarget <= baseline.critical.referenceTarget);
    }
  }
});

test('无受扶养人时，三个情景均不计家庭支持开支', () => {
  for (const scenario of ['optimistic', 'baseline', 'cautious']) {
    const result = calculateInsurance({ ...input, dependents: 0 }, scenario);
    assert.equal(result.life.annualSupportGap, 0);
    assert.equal(result.life.supportTotal, 0);
  }
});

test('其他成员承担开支足够时，年度支持缺口为零', () => {
  const result = calculateInsurance({ ...input, otherMemberContribution: 15 });
  assert.equal(result.life.annualSupportGap, 0);
});

test('超额分配资产时按比例缩放，两项抵扣合计不超过20万', () => {
  const result = calculateInsurance({ ...input, allocatedAssetsToCritical: 20 });
  assert.equal(result.life.allocatedLiquidAssets, 10);
  assert.equal(result.critical.allocatedLiquidAssets, 10);
  assert.equal(result.life.referenceTarget, 210);
  assert.equal(result.critical.referenceTarget, 70);
});

test('总流动资产为零时，不允许使用填写的资产分配抵扣', () => {
  const result = calculateInsurance({ ...input, liquidAssets: 0, allocatedAssetsToCritical: 10 });
  assert.equal(result.life.allocatedLiquidAssets, 0);
  assert.equal(result.critical.allocatedLiquidAssets, 0);
});

test('房贷责任为零时，不计入房贷余额', () => {
  const result = calculateInsurance({ ...input, mortgageSharePercent: 0 });
  assert.equal(result.life.mortgageResponsibility, 0);
});

test('资产足够覆盖需求时，保险目标及缺口均为零', () => {
  const result = calculateInsurance({
    ...input,
    liquidAssets: 400,
    allocatedAssetsToLife: 300,
    allocatedAssetsToCritical: 100,
  });
  assert.equal(result.life.referenceTarget, 0);
  assert.equal(result.life.uncoveredGap, 0);
  assert.equal(result.critical.referenceTarget, 0);
  assert.equal(result.critical.uncoveredGap, 0);
});

test('默认支持期根据是否有受扶养人设定，且年龄不改变金额', () => {
  assert.equal(getDefaultAssumptions(input).supportYears, 10);
  assert.equal(getDefaultAssumptions({ ...input, dependents: 0 }).supportYears, 0);
  assert.deepEqual(calculateInsurance({ ...input, age: 65 }), calculateInsurance(input));
});

test('谨慎情景保留原有压力假设：15年支持、3年收入中断、130%储备', () => {
  const result = calculateInsurance(input, 'cautious');
  assert.equal(result.life.supportTotal, 180);
  assert.equal(result.life.referenceTarget, 260);
  assert.equal(result.critical.referenceTarget, 112);
});

test('表单校验拒绝非有限金额、负数、超额房贷比例及小数人数', () => {
  assert.deepEqual(validateCheckupInput(input), {});
  for (const invalid of [{annualIncome: Infinity}, {mortgageBalance:-1}, {mortgageSharePercent:101}, {familyMembers:2.5}, {dependents:3}, {supportYears:51}, {incomeInterruptionYears:11}, {age:17}]) {
    assert.ok(Object.keys(validateCheckupInput({...input,...invalid})).length > 0);
  }
});

test('报告返回的是当前情景的实际年限，可用于展示正确的公式明细', () => {
  assert.deepEqual(calculateInsurance(input,'optimistic').assumptions,{supportYears:7,incomeInterruptionYears:1.5});
  assert.deepEqual(calculateInsurance(input,'cautious').assumptions,{supportYears:15,incomeInterruptionYears:3});
});
