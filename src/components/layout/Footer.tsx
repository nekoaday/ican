import React from 'react';
import { ShieldAlert, Compass } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border bg-card/60 mt-16 py-8 text-xs text-muted-foreground no-print">
      <div className="container mx-auto px-4 space-y-4">
        {/* 合规免责声明专栏 */}
        <div className="p-4 rounded-xl bg-muted/60 border border-border/80 space-y-2">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>合规安全与免责声明</span>
          </div>
          <p className="leading-relaxed">
            1. <strong>定位说明：</strong>本应用（保额罗盘 InsureCompass）仅为个人与家庭保险保障教育及初步量化规划测算工具，<strong>不属于任何保险机构的直销平台、代理人核保中介或交易签约系统</strong>。
          </p>
          <p className="leading-relaxed">
            2. <strong>测算参考性：</strong>所有保额建议与缺口分析均基于公开可验证的确定性财务算法及您自主输入的收支债务假设，系统不承诺实际承保保额的绝对精确性与最终核保结论，<strong>不虚构任何保险保费报价，亦不直接推荐任何商业保险单品</strong>。
          </p>
          <p className="leading-relaxed">
            3. <strong>隐私保护：</strong>本应用采用纯客户端即时计算，<strong>无需注册与手机号登录，不收集姓名、身份证号、病史或银行卡等敏感隐私信息</strong>，亦不默认保存用户上传的财务明细。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-border/40 text-[11px]">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-accent" />
            <span>保额罗盘 InsureCompass · AI 家庭保险保障体检助手</span>
          </div>
          <div>
            确定性测算模型 · 支持桌面端与手机端免登录访问
          </div>
        </div>
      </div>
    </footer>
  );
};
