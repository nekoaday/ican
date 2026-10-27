"""Rebuild the technical and security PDFs with ReportLab and a Chinese TTF/TTC font.
Usage: python docs/source/build_pdfs.py --font path/to/chinese.ttf --bold-font path/to/bold.ttf
"""
from pathlib import Path
import argparse, json, shutil
from xml.sax.saxutils import escape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Flowable, Image

root=Path(__file__).resolve().parents[2]
out=root/'outputs'; out.mkdir(exist_ok=True)
parser=argparse.ArgumentParser();parser.add_argument('--font',default='C:/Windows/Fonts/msyh.ttc');parser.add_argument('--bold-font',default='C:/Windows/Fonts/msyhbd.ttc');args=parser.parse_args()
pdfmetrics.registerFont(TTFont('CN',args.font,subfontIndex=0))
pdfmetrics.registerFont(TTFont('CNBold',args.bold_font,subfontIndex=0))
navy=colors.HexColor('#102f4c');teal=colors.HexColor('#087f78');muted=colors.HexColor('#536779');light=colors.HexColor('#edf3f6')
styles={
 'title':ParagraphStyle('title',fontName='CNBold',fontSize=27,leading=39,textColor=navy,spaceAfter=18),
 'h1':ParagraphStyle('h1',fontName='CNBold',fontSize=19,leading=29,textColor=navy,spaceAfter=16),
 'h2':ParagraphStyle('h2',fontName='CNBold',fontSize=12,leading=20,textColor=teal,spaceBefore=12,spaceAfter=7),
 'p':ParagraphStyle('p',fontName='CN',fontSize=10.2,leading=18,wordWrap='CJK',textColor=navy,spaceAfter=8),
 'small':ParagraphStyle('small',fontName='CN',fontSize=8.4,leading=14,wordWrap='CJK',textColor=muted,spaceAfter=7),
 'cell':ParagraphStyle('cell',fontName='CN',fontSize=9,leading=15,wordWrap='CJK',textColor=navy),
 'head':ParagraphStyle('head',fontName='CNBold',fontSize=9,leading=15,wordWrap='CJK',textColor=colors.white),
 'formula':ParagraphStyle('formula',fontName='CNBold',fontSize=11,leading=21,wordWrap='CJK',textColor=navy,backColor=light,borderPadding=10,spaceBefore=8,spaceAfter=12),
}
def p(text,style='p'):return Paragraph(escape(text).replace('\n','<br/>'),styles[style])
def table(rows,widths):
    cells=[[p(str(c),'head' if i==0 else 'cell') for c in row] for i,row in enumerate(rows)]
    t=Table(cells,colWidths=widths,hAlign='LEFT',repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),navy),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8),('LINEBELOW',(0,1),(-1,-1),0.4,colors.HexColor('#d8e2e9')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f5f8fa')])]))
    return t

class Architecture(Flowable):
    def __init__(self):Flowable.__init__(self);self.width=500;self.height=275
    def draw(self):
        c=self.canv
        def box(x,y,w,h,title,detail):
            c.setStrokeColor(teal);c.setFillColor(light);c.roundRect(x,y,w,h,5,fill=1,stroke=1)
            c.setFillColor(navy);c.setFont('CNBold',10);c.drawCentredString(x+w/2,y+h-20,title)
            c.setFont('CN',8.5);c.drawCentredString(x+w/2,y+16,detail)
        def arrow(x1,y1,x2,y2):
            c.setStrokeColor(muted);c.setFillColor(muted);c.line(x1,y1,x2,y2)
            path=c.beginPath();path.moveTo(x2,y2)
            if abs(y2-y1)>abs(x2-x1):
                dy=5 if y2<y1 else -5;path.lineTo(x2-3,y2+dy);path.lineTo(x2+3,y2+dy)
            else: path.lineTo(x2-5,y2+3);path.lineTo(x2-5,y2-3)
            path.close();c.drawPath(path,fill=1,stroke=0)
        box(0,185,210,65,'浏览器 / React','表单校验、确定性算法、情景报告')
        box(0,65,210,65,'AI 聊天窗口','用户授权后附带财务摘要')
        box(270,65,220,65,'Node 服务端 /api/chat','来源、正文、角色、频率与超时校验')
        box(270,185,220,65,'服务端环境配置','密钥、模型名称、允许来源')
        box(270,-15,220,50,'DeepSeek 模型服务','HTTPS Chat Completions')
        arrow(105,185,105,130);arrow(210,97,270,97)
        arrow(380,185,380,130);arrow(380,65,380,35)
        c.setFont('CN',8);c.setFillColor(teal);c.drawString(217,110,'同源请求')
        c.setDash(4,3);c.setStrokeColor(colors.HexColor('#c2d1db'));c.line(245,5,245,263);c.setDash()
        c.setFont('CN',8);c.setFillColor(muted);c.drawString(15,10,'浏览器不持有模型密钥')

def header(title):
    def draw(c,doc):
        w,h=A4;c.setStrokeColor(teal);c.setLineWidth(1.4);c.line(44,h-40,w-44,h-40)
        c.setFont('CN',8);c.setFillColor(muted);c.drawString(44,h-30,'INSURECOMPASS  /  保额罗盘');c.drawRightString(w-44,h-30,title)
        c.setFont('CN',8);c.drawString(44,28,'版本 0.0.1 · 2026-10-28');c.drawRightString(w-44,28,f'{doc.page}')
    return draw

def render(filename,title,pages):
    story=[]
    for i,blocks in enumerate(pages):
        if i:story.append(PageBreak())
        story.extend(blocks)
    doc=SimpleDocTemplate(str(out/filename),pagesize=A4,leftMargin=44,rightMargin=44,topMargin=61,bottomMargin=45,title='保额罗盘 - '+title,author='InsureCompass',pageCompression=1)
    doc.build(story,onFirstPage=header(title),onLaterPages=header(title))

tech=[
 [p('保额罗盘\nInsureCompass','title'),p('系统架构、核心算法与安全设计','h1'),
  p('AI 家庭保险保障体检助手','h2'),p('面向家庭经济责任场景，将定期寿险和重疾险的需求拆成可核对的财务项目；金额由确定性公式计算，AI 通过服务端接口解释结果与假设。'),
  p('产品范围','h2'),p('输入年龄、收入、房贷、家庭人数、受扶养人数、已有保障和高级参数，输出参考目标、缺口、覆盖率及构成。支持乐观、基准、谨慎情景、公式明细和浏览器打印报告。'),
  table([['模块','实现方式'],['前端','React 18 + TypeScript + Vite；Tailwind 和 Recharts 展示'],['计算层','浏览器内纯函数测算，独立于模型服务'],['服务端','Node.js 24 提供静态构建与同源 /api/chat'],['模型接口','服务端 HTTPS 调用 DeepSeek；已完成真实问答、上下文与多轮联调']], [94,413]),
  p('阅读范围','h2'),p('后续章节依次说明架构与数据流、两类保障公式、情景与资产约束、安全权限，以及验证与部署。本文描述当前仓库实现；不将模型解释当作精算、报价或承保结论。')],
 [p('01  系统架构与数据流','h1'),Architecture(),Spacer(1,16),
  p('本地测算路径','h2'),p('用户输入 → 输入校验 → calculateInsurance → 结果卡、情景图表和公式明细。页面不调用模型生成金额；没有 AI 配置时，测算仍可运行。'),
  p('授权解释路径','h2'),p('聊天窗口默认关闭财务同步。用户授权后，问题、近期对话和基准测算摘要发往同源 /api/chat；服务端校验并用服务端凭据请求 DeepSeek，向浏览器只返回回答及必要状态。'),
  p('部署与数据边界','h2'),p('不设置应用数据库，不主动持久化家庭输入或对话。服务器只公开 dist 静态文件和聊天接口，源文件与环境文件不在静态目录中。反向代理的访问日志及模型供应商的数据政策属于部署侧管理范围。'),
  p('对应代码：src/pages/HomePage.tsx；src/utils/calculator.ts；src/services/aiService.ts；server/index.mjs；server/chat-handler.ts。','small')],
 [p('02  定期寿险参考目标与缺口','h1'),
  p('计算口径','h2'),p('本模型按家庭责任需求拆解，以万元为金额单位。必要家庭年支出应避免再次包含计划一次性清偿的同一笔房贷本金，降低重复计入风险。'),
  p('G = 有受扶养人时 max(0, E - C)，否则为0\nD = M × s + G × Y + B + R\nT = max(0, D - A)\nGap = max(0, T - L)','formula'),
  table([['符号','含义'],['E / C','家庭必要年度开支 / 其他成员每年承担开支'],['M / s','剩余房贷本金 / 本人承担比例（0至100%）'],['Y / B / R','实际情景支持年限 / 其他债务 / 教育赡养专项储备'],['A / L','分配给定寿风险的可用资产 / 已有有效身故保额'],['D / T / Gap','总需求 / 保险参考目标 / 待补保障缺口']], [94,413]),
  p('标准验收样例','h2'),p('房贷100万、责任比例100%；受扶养2人，必要年支出12万，其他成员承担0万，支持10年；其他债务和专项储备均为0。总需求 = 100 + 12 × 10 = 220万。'),p('抵扣定寿资产20万 → 参考目标200万；再扣已有身故保额50万 → 待补缺口150万。覆盖率为25%。'),
  p('年龄与人数的作用','h2'),p('年龄用于18至70岁的整数校验；家庭总人数用于关系校验；受扶养人数大于0时才计生活支持责任。未按年龄、人数直接乘算保额，不估计死亡概率或保险价格。')],
 [p('03  重疾险参考目标与缺口','h1'),
  p('H = F + I × Z + Q\nT = max(0, H - A)\nGap = max(0, T - L)','formula'),
  table([['符号','含义'],['F / Q','治疗自费储备 / 康复照护储备'],['I / Z','本人税后年收入 / 当前情景收入中断年限'],['A / L','分配给重疾风险的资产 / 已有有效重疾给付保额']], [94,413]),
  p('样例与保障边界','h2'),p('年收入20万、收入中断2年、治疗储备30万、康复储备10万，需求为30 + 20 × 2 + 10 = 80万；未分配重疾资产、已有重疾20万时，缺口60万。报销型医疗险不能直接作为重疾给付保额抵扣。'),
  p('可调整的默认假设','h2'),table([['参数','默认值','性质'],['必要年支出','年收入的60%','缺省估算，可改为实际预算'],['家庭支持年限','有受扶养人10年，否则0年','责任规划假设'],['房贷责任','100%','应按实际协议调整'],['治疗 / 康复储备','30万 / 10万','项目假设，不代表医疗费用预测'],['收入中断','2年','可调整为0至10年']], [137,135,235]),
  p('金额语义','h2'),p('结果是给定假设下的需求估算。未计通胀、贴现、社保给付、核保条件或保费负担能力。显示金额保留0.01万元精度，不能当作精确到元的财务结算。')],
 [p('04  情景、资产与边界处理','h1'),
  table([['规则','乐观','基准','谨慎'],['支持年限','通常减3年，下限3年；不超过基准','用户输入','有受扶养人时加5年'],['收入中断','基准×0.75，下限1年；不超过基准','用户输入，保留0','max(3年, 基准×1.5)'],['治疗 / 康复','基准×0.8','用户输入','基准×1.3']], [87,147,112,161]),
  p('标准样例的情景结果（万元）','h2'),table([['情景','定寿目标 / 缺口','重疾目标 / 缺口'],['乐观','164 / 114','62 / 42'],['基准','200 / 150','80 / 60'],['谨慎','260 / 210','112 / 92']], [100,203,204]),
  p('资产分配与输出限制','h2'),p('两类风险的资产分配之和不得超过可动用资产；超额时按比例缩放。总资产为0时两类抵扣归零，已有保障超过目标时缺口归零。此约束是项目采取的保守资源分配政策。'),
  p('回归修复','h2'),p('收入中断为0时，基准不再误用2年默认值；乐观情景也保持0。短支持期不被乐观情景提高到3年。谨慎情景明确改变假设，可能提高原先为0的停工年限，报告显示变更后的实际年限。'),
  p('输入与公式一致性','h2'),p('拒绝非有限、负数、超范围金额，以及不合法人数、房贷责任比例和年限。报告公式使用当前情景实际年限。用户自定义家庭开支后，调整收入不再覆盖该项。')],
 [p('05  安全设计与权限边界','h1'),
  table([['层级','允许操作','限制或控制'],['访客','填写、测算、打印；向AI提问','默认不发送财务摘要，无配置修改入口'],['服务进程','读取密钥并调用固定配置的模型接口','凭据不进入网页；不回传上游原始错误'],['部署维护者','通过主机/托管平台配置、更新、轮换凭据','依赖部署平台访问控制；应用没有管理员后台']], [94,180,233]),
  p('已实现的接口约束','h2'),p('Origin 精确白名单；POST 只接受JSON；正文最多16KiB；对话最多12条、每条1500字符且只允许user/assistant；上下文最多6000字符；单实例每分钟30次有效请求、最多2个上游并发；上游调用20秒超时。'),
  p('浏览器与隐私','h2'),p('静态服务设置CSP、禁止嵌入、禁止MIME嗅探及不发送来源的策略；聊天响应不缓存。没有姓名、身份证、病史等必填字段，不使用应用数据库保存输入。对话以文本渲染，默认不启用财务摘要授权。'),
  p('安全边界','h2'),p('来源白名单不等于身份认证，非浏览器客户端仍可伪造Origin；实例限流不等于全局配额。部署需配合账号费用预算和公网入口保护。模型仍可能受提示注入影响或产生错误，其回答不覆盖确定性报告。')],
 [p('06  验证结果与交付部署','h1'),
  table([['验证项','范围与结果'],['自动测试','34项通过：18项算法/校验、2项服务降级、14项接口处理'],['类型与构建','前端和后端处理器类型检查通过，生产构建通过'],['浏览器','标准金额、情景与明细、边界、授权、参数保留、手机视口及PDF导出'],['真实模型','DeepSeek概念问答、授权上下文解释及多轮追问通过'],['依赖审计','本次检查报告0项已知漏洞，不等同于不存在未知漏洞']], [100,407]),
  p('源码交付与运行','h2'),p('源码包包含README、部署说明、锁文件、测试、前后端源码和dist构建产物。Node.js 24可直接运行 npm start 查看构建；修改或重建时执行 npm ci 与 npm run verify。模型密钥在服务端配置，公开访问还需HTTPS和实际域名来源白名单。'),
  p('验证限制','h2'),p('未进行多实例压测、独立渗透测试或全浏览器认证。当前记录验证了本地生产构建，不预设公网域名。主脚本约753kB，仍存在构建体积提示；可后续按需加载图表。'),
  p('资料依据与可追溯性','h2'),p('主要依据为当前源码与 docs/TESTING.md 中的实际验证。NAIC寿险消费者资料支持考虑收入、债务和受扶养责任等因素，不为本项目默认比例或储备金额背书。'),
  p('参考：\nhttps://content.naic.org/consumer/life-insurance.htm\nhttps://vite.dev/guide/build.html\nhttps://api-docs.deepseek.com/','small')],
]

security=[
 [p('安全自评报告','title'),p('保额罗盘 InsureCompass','h1'),p('01  范围、资产与权限','h2'),
  p('评估对象为本项目浏览器页面、Node静态服务与AI代理处理器。评估方式为代码检查、34项自动测试、浏览器验收及DeepSeek真实接口联调；不代替独立安全审计。'),
  table([['资产','保护目标','边界'],['模型API凭据','不进入前端或源码包','仅服务端环境/内存使用'],['家庭财务输入','最小收集、避免非必要外传','默认本地计算，授权后摘要送模型'],['对话与模型回答','不被当作可信执行指令','文本渲染，不执行模型工具或代码'],['配置和源码','访客不可修改或读取服务端源码','静态根目录限制为dist']], [97,185,225]),
  p('权限分级实现说明','h2'),p('访客拥有测算、打印和提问能力；服务进程拥有使用凭据调用上游模型的能力；部署维护者通过主机或托管平台管理配置与版本。当前未实现应用内账号、管理员后台或基于用户角色的RBAC，不将平台权限假称为应用内功能。'),
  p('权限验证','h2'),p('访问 /.env.server 和 /server/index.mjs 均返回404；接口状态仅返回配置状态、模型名和说明，不返回密钥。实际应用的主机/平台协作者权限需要部署维护者另行配置。')],
 [p('02  已实现控制与验证证据','h1'),
  table([['控制','实现与证据','结果'],['密钥边界','仅服务端读取；浏览器调用同源/api/chat；配置文件被Git忽略','已实现'],['来源约束','精确Origin白名单；拒绝不在列表中的来源和无来源POST','已测试'],['输入约束','JSON类型、16KiB正文、消息数量/角色/长度、上下文长度','已测试'],['资源约束','每实例30次/分钟，最多2并发；20秒上游超时','已测试'],['错误脱敏','上游错误正文和内部异常不直接返回前端','已测试'],['浏览器防护','CSP、X-Frame-Options、nosniff、Referrer-Policy','已检查'],['授权与持久化','摘要同步默认关闭；无应用数据库和持久化聊天记录','已检查'],['供应链','移除未引用的平台依赖与模板，保留锁文件；npm审计0项已知漏洞','已检查']], [82,345,80]),
  p('AI安全措施','h2'),p('系统提示限定为保障教育，要求只解释计算器提供的金额，不推荐具体商业产品或承诺核保。客户端不能提交system角色；财务摘要以普通数据消息传入。回答按纯文本呈现，模型无文件、命令或外部工具执行权限。'),
  p('证据位置：tests/chat-handler.test.mjs、tests/calculator.test.mjs、tests/ai-service.test.mjs；server/chat-handler.ts、server/index.mjs；docs/TESTING.md。','small')],
 [p('03  已知风险清单','h1'),
  table([['风险 / 级别','剩余风险','后续处理'],['公网滥用 / 高','无用户身份鉴权，Origin可由非浏览器伪造','网关防护、账号预算、用户级配额'],['分布式限流 / 中','限制仅在单实例内存生效，重启归零','使用共享存储统一计数和熔断'],['模型错误与注入 / 中','提示约束不能保证回答正确或不偏离','扩充对抗样例，保留公式核对入口'],['第三方数据政策 / 中','授权内容送往模型服务，留存范围由服务商决定','部署方核实政策、最小化摘要'],['公网部署配置 / 中','HTTPS、证书、反向代理和托管权限取决于部署','上线检查及最小协作者权限'],['参数与模型局限 / 中','没有保费、通胀、贴现或精算风险估计','明确适用范围并验证新增模型'],['依赖维护 / 低','漏洞扫描无法覆盖未知问题；图表库为既有版本','定期审计与兼容性升级'],['性能与打印差异 / 低','脚本较大；浏览器字体和纸张设置可能影响打印','按需加载和更多终端复核']], [104,206,197]),
  p('本次未实施范围','h2'),p('未开展独立渗透测试、跨地区或多实例压力测试，不宣称达到任何未经过认证的安全等级。未配置应用数据库，因此没有数据库行级权限或用户数据隔离功能可供宣称。')],
 [p('04  自评结论与上线检查','h1'),
  p('自评结论','h2'),p('本版本已实现服务端凭据隔离、默认关闭财务同步、输入与接口约束、错误脱敏和基本资源保护，并通过功能与真实接口联调验证。可作为家庭保障教育和竞赛原型交付。公网长期运营前仍需强化滥用防护、统一配额和部署侧权限。'),
  table([['上线检查项','责任方'],['使用HTTPS，核对实际域名及AI_ALLOWED_ORIGINS','部署维护者'],['把模型密钥放在秘密变量管理中，限制协作者','部署维护者'],['设置模型账号费用预算、告警与撤销流程','部署维护者'],['验证未登录访问、真实问答和密钥无前端暴露','项目维护者'],['复核第三方隐私政策及用户授权说明','项目维护者'],['对齐演示版本、PDF、源码包和测试记录','项目维护者']], [380,127]),
  p('凭据与异常处理','h2'),p('密钥轮换通过服务端环境更新并重启/重新部署完成；发现异常用量时可禁用模型凭据，计算器仍独立工作。应用不记录原始对话与上游错误正文；主机和反向代理日志应按最小化原则配置。'),
  p('报告日期：2026-10-28。自评所称“已实现”指当前代码与本次验证范围，“后续处理”不计入已完成功能。','small')],
]

render('01_技术文档.pdf','技术文档',tech)
render('04_安全自评报告.pdf','安全自评报告',security)
print(json.dumps({'technicalPagesPlanned':len(tech),'securityPagesPlanned':len(security)},ensure_ascii=False))
