"""Build the end-user manual. Run with Python + ReportLab; Windows YaHei fonts by default."""
from pathlib import Path
from xml.sax.saxutils import escape
import argparse
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser()
parser.add_argument('--font', default='C:/Windows/Fonts/msyh.ttc')
parser.add_argument('--bold-font', default='C:/Windows/Fonts/msyhbd.ttc')
args = parser.parse_args()
pdfmetrics.registerFont(TTFont('CN', args.font, subfontIndex=0))
pdfmetrics.registerFont(TTFont('CNBold', args.bold_font, subfontIndex=0))
NAVY = colors.HexColor('#102f4c')
TEAL = colors.HexColor('#087f78')
MUTED = colors.HexColor('#536779')
LIGHT = colors.HexColor('#edf3f6')
WIDTH = A4[0] - 88
STYLES = {
    'title': ParagraphStyle('title', fontName='CNBold', fontSize=29, leading=43, textColor=NAVY, spaceAfter=12),
    'h1': ParagraphStyle('h1', fontName='CNBold', fontSize=20, leading=30, textColor=NAVY, spaceAfter=15),
    'h2': ParagraphStyle('h2', fontName='CNBold', fontSize=12, leading=20, textColor=TEAL, spaceBefore=12, spaceAfter=7),
    'p': ParagraphStyle('p', fontName='CN', fontSize=10, leading=17, wordWrap='CJK', textColor=NAVY, spaceAfter=8),
    'small': ParagraphStyle('small', fontName='CN', fontSize=8.3, leading=13.5, wordWrap='CJK', textColor=MUTED, spaceAfter=6),
    'cell': ParagraphStyle('cell', fontName='CN', fontSize=9, leading=14.5, wordWrap='CJK', textColor=NAVY),
    'head': ParagraphStyle('head', fontName='CNBold', fontSize=9, leading=14.5, wordWrap='CJK', textColor=colors.white),
    'note': ParagraphStyle('note', fontName='CN', fontSize=10, leading=18, wordWrap='CJK', textColor=NAVY,
                           backColor=LIGHT, borderPadding=10, spaceBefore=8, spaceAfter=14),
}

def p(text, style='p'):
    return Paragraph(escape(str(text)).replace('\n', '<br/>'), STYLES[style])

def table(rows, widths):
    result = Table([[p(v, 'head' if i == 0 else 'cell') for v in row] for i, row in enumerate(rows)],
                   colWidths=widths, repeatRows=1, hAlign='LEFT')
    result.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 9), ('RIGHTPADDING', (0, 0), (-1, -1), 9),
        ('TOPPADDING', (0, 0), (-1, -1), 7), ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LINEBELOW', (0, 1), (-1, -1), .4, colors.HexColor('#d8e2e9')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f8fa')]),
    ]))
    return result

def image(name, width):
    img = Image(str(ROOT / 'docs/source/assets' / name))
    img.drawHeight *= width / img.drawWidth
    img.drawWidth = width
    return img

pages = [
    [p('保额罗盘\nInsureCompass', 'title'), p('使用说明', 'h1'),
     p('AI 家庭保险保障体检助手', 'h2'),
     p('面向首次使用者与作品评审人员。本说明配套当前源码交付版本，介绍信息填写、双险种测算、情景比较、AI咨询与报告保存。'),
     p('快速完成一次体检', 'h2'),
     table([['步骤', '操作', '得到什么'],
            ['01 进入应用', '打开部署方提供的应用访问地址，点击“开始体检”。', '免登录进入家庭信息填写区域。'],
            ['02 填写信息', '核对基础信息；按需展开“高级参数设置与资产抵扣”。', '符合实际家庭情况的财务假设。'],
            ['03 生成报告', '点击“生成完整体检报告”，处理输入提示。', '定寿和重疾的参考目标、已有保障与待补缺口。'],
            ['04 查看与咨询', '切换情景、展开公式；按需打开AI助手。', '理解需求构成及参数变化的影响。'],
            ['05 保存结果', '点击“打印 / 保存PDF”，在打印对话框保存。', '可留存、分享的体检报告。']], [85, 254, WIDTH-339]),
     p('使用前准备', 'h2'),
     p('建议备好税后年收入、剩余房贷本金、有效保单保额、家庭必要年度开支和可动用资产信息。电脑或手机浏览器均可访问；AI咨询需要网络及已启用的服务。'),
     p('金额统一使用“万元”。例如：20表示20万元，0.5表示5000元；比例字段按百分数填写，100表示100%。', 'note'),
     p('阅读索引：基础填写第2页；高级参数第3页；报告解读第4页；AI咨询第5页；完整示例第6页；导出与常见问题第7页。', 'small'),
     p('文档版本 1.0  |  配套应用版本 0.0.1  |  编制日期 2026-10-30', 'small')],
    [p('01  填写基础信息', 'h1'),
     p('点击首页“开始体检”，进入“家庭财务与风险信息采集”。页面已有示例值，请逐项替换为自身情况；没有对应债务或保障时填0。'),
     table([['字段', '如何填写', '示例'],
            ['您的年龄', '填写18至70岁的整数。', '32岁'],
            ['个人税后年收入', '本人全年税后收入，单位万元/年。', '20'],
            ['家庭总人数', '包含本人，填写1至30人的整数。', '3'],
            ['依赖本人收入生活的人数', '实际依赖本人收入的其他家庭成员数；不含本人，且少于家庭总人数。', '2'],
            ['剩余房贷本金余额', '当前未偿还本金，不是房屋总价，也不是每月月供。', '100'],
            ['已有有效定期寿险保额', '按页面保障口径填写有效身故保障金额，不填写累计保费。', '50'],
            ['已有有效重疾险保额', '填写有效重疾给付保额，不把报销型医疗险额度计入。', '20']], [130, 300, WIDTH-430]),
     p('输入检查', 'h2'),
     p('金额填写非负数，人数填写整数。受扶养人数不能等于或超过家庭总人数。遇到提示时，按提示更正后重新生成报告。'),
     p('即时反馈与完整报告', 'h2'),
     p('表单下方的“即时测算参考反馈”使用基准情景，随输入变化提供预览。点击“生成完整体检报告”后，再查看完整结果、图表与计算明细。'),
     p('修改数据', 'h2'),
     p('在报告区域点击“返回修改数据”，调整相关字段并再次点击“生成完整体检报告”。比较修改前后时，请确认选中的是同一情景。'),
     p('年龄用于适用范围校验，不直接作为保额系数；受扶养人数决定是否计入家庭生活支持责任。本工具不预测疾病概率或承保资格。', 'note')],
    [p('02  调整高级参数与资产', 'h1'),
     p('展开“高级参数设置与资产抵扣”。默认值是可调整的项目估算假设，应优先用实际预算和责任安排替换。'),
     table([['参数', '填写说明 / 默认口径'],
            ['家庭必要年度开支', '以万元/年填写必要生活预算；默认本人年收入的60%。避免重复计入已计划一次性清偿的同一笔房贷本金。'],
            ['其他家庭成员承担开支', '其他成员每年能够持续分担的必要开支，默认0。'],
            ['保障支持年限', '未来希望支持家庭的年数，范围0至50年；有受扶养人默认10年，否则默认0年。'],
            ['本人承担房贷比例', '填写0至100的百分数，默认100；共同承担时按实际责任调整。'],
            ['其他个人债务', '除上述房贷外需纳入保障规划的债务，默认0万元。'],
            ['专项教育与赡养储备', '尚未在年度开支中计入的专项责任，默认0万元，避免重复计入。'],
            ['可动用家庭流动资产总额', '可实际用于应对风险的资金，默认0万元；不要直接填写自住房估值。'],
            ['分配用于定寿风险抵扣', '从上述流动资产中划给定寿责任的金额，默认0万元。'],
            ['分配用于重疾风险抵扣', '从上述流动资产中划给重疾责任的金额，默认0万元。'],
            ['预计收入中断年数', '范围0至10年，默认2年；允许填0。'],
            ['重疾治疗自费储备', '根据自身安排填写，默认30万元。'],
            ['康复照护与营养储备', '根据自身安排填写，默认10万元。']], [157, WIDTH-157]),
     p('同一笔资产只分配一次', 'h2'),
     p('定寿与重疾的资产分配合计不要超过可动用总额。超额时系统按比例缩减；总额为0时不进行资产抵扣。建议先填写总额，再安排两项分配。'),
     p('手动修改家庭开支后，调整收入不会覆盖该自定义值。使用高级设置中的恢复默认操作，会按当前基础信息重置高级参数，请先记下需要保留的数据。', 'small')],
    [p('03  阅读结果与情景对比', 'h1'),
     image('report.png', WIDTH),
     p('图1  基准情景报告示例。定寿目标200万元、缺口150万元；重疾目标80万元、缺口60万元。对应输入见第6页。', 'small'),
     table([['结果项', '含义'],
            ['参考目标保额', '需求扣除分配资产后的保障参考值，尚未扣除已有保险。'],
            ['待补保险缺口', '参考目标再扣除已有对应保额，最低为0。'],
            ['覆盖率与图表', '辅助比较已有保障与参考目标；缺口为0仅表示达到本次假设下的目标。']], [113, WIDTH-113]),
     p('比较情景并核对公式', 'h2'),
     p('点击“乐观情景 / 基准情景 / 谨慎情景”，比较支持年限、收入中断期及治疗康复储备变化后的结果。向下滚动并点击“展开推导过程”，核对实际参数和抵扣金额。'),
     p('不同情景是规划假设，不代表事故发生概率。AI授权同步的是基准报告；咨询基准数字时，建议先切回“基准情景”。', 'small')],
    [p('04  使用 AI 保险咨询助手', 'h1'),
     p('点击右下角“AI 保险咨询助手”，或报告区域的“AI 咨询解读”。电脑端以悬浮窗口显示，手机端可在对话区域内滚动。'),
     Table([[image('ai-mobile.png', 178), [
         p('1 选择是否同步财务摘要', 'h2'),
         p('“授权同步基准测算报告与财务假设”默认关闭。普通险种概念问题可直接提问；希望解释自己的报告时，再主动打开开关。'),
         p('2 输入并发送问题', 'h2'),
         p('点击快捷问题或在底部输入文字，点击发送按钮；等待本轮回答后可继续追问。'),
         p('3 修改数据后核对上下文', 'h2'),
         p('重新生成报告后再提问。为减少历史金额干扰，比较新场景时可先点击聊天顶部的清空会话图标，再重新询问。'),
         p('4 以报告核对金额', 'h2'),
         p('AI解释供理解和参考。出现数字不一致时，以页面确定性报告和公式为准。'),
     ]]], colWidths=[193, WIDTH-193], style=TableStyle([
         ('VALIGN', (0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),
         ('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),0),
     ])),
     p('图2  已开启摘要同步的咨询示例。此截图不代表开关默认开启。', 'small'),
     p('可直接使用的提问', 'h2'),
     p('报告解读（先开启同步）：请根据当前基准报告，简要说明定寿和重疾险的参考目标、已有保额与待补缺口。只引用报告已有数字，不推荐具体产品。', 'note'),
     p('概念问答（无需同步）：重疾险和医疗险有什么区别？为什么医疗险额度不能直接抵扣重疾险缺口？请用普通家庭能听懂的话说明。'),
     p('开启同步后，必要的财务摘要会随问题发送至AI服务。关闭开关不会撤回已经发送的内容；清空会话只清除当前页面对话，不代表删除服务方可能保留的记录。不要在提问中提交身份证号、保单号等敏感标识。', 'small')],
    [p('05  完整操作示例', 'h1'),
     p('以下为虚构家庭样例，可用于首次体验。全部金额单位为万元；请完整核对高级参数，资产抵扣不同会改变结果。'),
     table([['基础信息', '填写值', '高级参数', '填写值'],
            ['年龄 / 年收入', '32岁 / 20', '必要年开支 / 其他成员承担', '12 / 0'],
            ['家庭人数 / 受扶养人数', '3 / 2', '支持年限 / 房贷责任', '10年 / 100%'],
            ['剩余房贷', '100', '其他债务 / 专项储备', '0 / 0'],
            ['已有定寿', '50', '流动资产总额', '20'],
            ['已有重疾', '20', '定寿分配 / 重疾分配', '20 / 0'],
            ['金额口径', '万元', '收入中断 / 治疗 / 康复', '2年 / 30 / 10']], [127, 76, 206, WIDTH-409]),
     p('生成报告并选择基准情景', 'h2'),
     p('定寿总需求：100 × 100% + (12 - 0) × 10 = 220万元。\n定寿参考目标：220 - 20 = 200万元；待补缺口：200 - 50 = 150万元。\n重疾参考目标：30 + 20 × 2 + 10 - 0 = 80万元；待补缺口：80 - 20 = 60万元。', 'note'),
     table([['情景', '定寿目标 / 缺口', '重疾目标 / 缺口'],
            ['乐观', '164 / 114', '62 / 42'],
            ['基准', '200 / 150', '80 / 60'],
            ['谨慎', '260 / 210', '112 / 92']], [95, 206, WIDTH-301]),
     p('再体验一次：房贷清零', 'h2'),
     p('点击“返回修改数据”，仅将剩余房贷从100改为0，其他参数保持不变；再次生成报告并选中基准情景。此时定寿目标为100万元、缺口50万元；重疾目标仍为80万元、缺口60万元。'),
     p('如果想让AI解释变化，可先清空旧会话、开启摘要同步，然后提问：“请根据最新基准报告，说明当前房贷、定寿目标和缺口，并解释房贷清零后的责任变化。只引用报告已有数字。”'),
     p('未分配20万元定寿资产时，同样家庭的基准定寿目标为220万元、缺口170万元。出现这一结果时，先核对资产总额及分配字段。', 'small')],
    [p('06  保存报告与常见问题', 'h1'),
     p('打印或保存 PDF', 'h2'),
     p('1. 核对输入与报告结果，选择需要保存的情景。\n2. 点击报告顶部“打印 / 保存PDF”。\n3. 在浏览器打印对话框选择“另存为PDF”或系统PDF打印机。\n4. 建议使用A4纸张，预览全部页面；需要时关闭浏览器附加的页眉页脚。\n5. 确认结果卡、图表和公式完整后保存。建议在文件名中注明日期及情景。'),
     p('导出内容为体检报告，不包含AI聊天。若某一手机浏览器未提供PDF选项，可在电脑浏览器打开同一应用重新填写并导出。', 'small'),
     table([['遇到的情况', '处理方法'],
            ['无法生成完整报告', '检查错误提示，尤其是人数关系、金额负值、比例和年限范围；更正后重新生成。'],
            ['结果与样例不同', '核对单位、当前情景、资产总额与分配、家庭开支、支持年限及已有保额。'],
            ['AI提示服务暂未启用或连接失败', '确认网络后重试；持续失败时联系应用维护者。测算、情景对比和报告仍可使用。'],
            ['AI沿用修改前的数字', '重新生成报告，核对摘要授权开关；清空旧会话后再问，并与页面报告核对。'],
            ['刷新或关闭页面后数据消失', '当前版本不提供账号云存档；重要结果请提前保存为PDF。'],
            ['缺口为0，是否无需任何保险', '只表示达到当前输入与假设下的目标；仍需结合实际责任、条款和预算判断。']], [143, WIDTH-143]),
     p('结果适用范围', 'h2'),
     p('本工具用于家庭保障教育与责任规划参考。默认值不是行业统一标准；结果不包含完整精算、保费、通胀、贴现或承保资格评估，也不构成保险产品推荐、核保或理赔承诺。'),
     p('信息留存', 'h2'),
     p('当前应用不提供家庭财务或聊天的应用数据库存档。向AI发送的问题及授权摘要会经过所配置服务处理；服务方留存范围以其政策为准。建议仅提交解释报告所需的信息。'),
     p('本说明配套源码交付版本；启动与部署方法另见随包README及部署说明。', 'small')],
]

def frame(canvas, doc):
    w, h = A4
    canvas.saveState()
    canvas.setStrokeColor(TEAL)
    canvas.setLineWidth(1.4)
    canvas.line(44, h-40, w-44, h-40)
    canvas.setFont('CN', 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(44, h-30, 'INSURECOMPASS  /  保额罗盘')
    canvas.drawRightString(w-44, h-30, '使用说明')
    canvas.drawString(44, 28, '文档 1.0  ·  应用 0.0.1  ·  2026-10-30')
    canvas.drawRightString(w-44, 28, f'{doc.page} / {len(pages)}')
    canvas.restoreState()

target = ROOT / 'outputs/05_使用说明.pdf'
target.parent.mkdir(exist_ok=True)
story = []
for i, blocks in enumerate(pages):
    if i:
        story.append(PageBreak())
    story.extend(blocks)
doc = SimpleDocTemplate(str(target), pagesize=A4, leftMargin=44, rightMargin=44,
                        topMargin=61, bottomMargin=45, title='保额罗盘 InsureCompass 使用说明',
                        author='InsureCompass', pageCompression=1)
doc.build(story, onFirstPage=frame, onLaterPages=frame)
print(target)
