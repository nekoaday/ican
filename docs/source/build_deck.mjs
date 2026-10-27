import fs from 'node:fs/promises';
import path from 'node:path';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const root=process.cwd(), output=path.join(root,'outputs'), build=path.join(root,'work/slides');
await fs.mkdir(output,{recursive:true});await fs.mkdir(build,{recursive:true});
const p=Presentation.create({slideSize:{width:1280,height:720}});
const C={navy:'#102f4c',teal:'#087f78',muted:'#536779',light:'#edf3f6',white:'#ffffff'};
const font='Microsoft YaHei';
function text(s,content,x,y,w,h,size=28,color=C.navy,bold=false){
  const sh=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
  sh.text=content;sh.text.style={fontSize:size,typeface:font,color,bold,insets:0,verticalAlignment:'top',wrap:'square',autoFit:'none'};return sh;
}
function slide(title,number){const s=p.slides.add();s.background.fill=C.white;text(s,title,64,46,1150,68,42,C.navy,true);text(s,`保额罗盘  /  InsureCompass`,64,674,900,24,16,C.muted);text(s,String(number).padStart(2,'0'),1160,674,60,24,16,C.muted);return s;}
function note(s,n){s.speakerNotes.text=n;}
function row(s,y,title,body){text(s,title,70,y,330,55,30,C.teal,true);text(s,body,420,y,780,95,28);}
function box(s,x,y,w,h,title,detail){let sh=s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:C.light,line:{fill:C.teal,width:1.5}});text(s,title,x+18,y+16,w-36,44,26,C.navy,true);text(s,detail,x+18,y+67,w-36,h-65,22,C.muted);return sh;}
function arrow(s,a,b,from='right',to='left'){s.shapes.connect(a,b,{kind:'straight',fromSide:from,toSide:to,line:{fill:C.teal,width:2},tail:{type:'triangle',width:'med',length:'med'}});}
async function image(s,relative,position){const b=await fs.readFile(path.join(root,relative));s.images.add({blob:b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),contentType:'image/png',alt:relative.includes('ai')?'真实模型联调页面':'实际应用测算报告截图',fit:'contain',position});}

// 1
{
 const s=p.slides.add();s.background.fill=C.navy;
 text(s,'保额罗盘',72,142,1120,105,76,C.white,true);
 text(s,'InsureCompass',76,260,1100,70,48,'#35c4b3');
 text(s,'AI 家庭保险保障体检助手',76,372,1100,70,36,C.white);
 text(s,'确定性公式测算  ·  服务端 AI 解释  ·  家庭责任缺口分析',76,497,1100,70,27,'#d4e3eb');
 text(s,'金融科技竞赛项目',76,647,1000,30,20,'#d4e3eb');
 note(s,'30秒。介绍项目与职责分工：金额由代码产生，AI解释。依据：README与src/utils/calculator.ts。');
}
// 2
{
 const s=slide('家庭保障体检的三个任务',2);
 row(s,170,'责任需要多少','房贷、家庭支持、专项储备与治疗康复假设');
 row(s,317,'已有保障抵扣多少','分配可用资产，再扣除已有有效保额');
 row(s,464,'条件变化后如何调整','修改参数、切换情景、展开公式并核对结果');
 note(s,'45秒。介绍用户任务，不引用未经验证的市场数据。依据：产品当前表单与报告。');
}
// 3
{
 const s=slide('系统架构与凭据边界',3);
 const a=box(s,64,190,330,135,'浏览器计算器','输入校验、确定性测算、报告');
 const b=box(s,470,190,345,135,'Node /api/chat','消息校验、限流、超时、脱敏');
 const c=box(s,890,190,325,135,'DeepSeek','HTTPS 模型接口');
 arrow(s,a,b);arrow(s,b,c);
 text(s,'仅在用户提问时调用；财务摘要需要主动授权',64,373,1150,62,28,C.teal,true);
 text(s,'浏览器不持有模型密钥\n服务端不保存对话与家庭输入\n密钥和允许来源由部署人员配置',64,463,1140,155,28);
 note(s,'60秒。说明浏览器计算与AI请求分离。图示箭头为提问/解释路径，测算不依赖模型。来源：server/index.mjs、server/chat-handler.ts、src/services/aiService.ts。');
}
// 4
{
 const s=slide('定期寿险：家庭责任需求拆解',4);
 text(s,'100万房贷 + 12万年支出 × 10年 = 220万总需求',65,171,1150,90,34,C.navy,true);
 text(s,'抵扣分配资产20万，再扣已有保额50万',65,278,1150,75,29,C.muted);
 text(s,'200万',65,402,490,115,72,C.teal,true);text(s,'参考目标',70,529,490,50,28);
 text(s,'150万',675,402,490,115,72,C.navy,true);text(s,'待补缺口',680,529,490,50,28);
 text(s,'已有保障超过目标时，缺口下限为0；两项风险的资产分配受总额约束',65,611,1150,42,22,C.muted);
 note(s,'65秒。用README标准样例讲解220-20=200，200-50=150，金额单位万元。来源：calculateInsurance及标准验收测试。');
}
// 5
{
 const s=slide('重疾险：治疗、停工与康复储备',5);
 text(s,'30万治疗 + 20万年收入 × 2年 + 10万康复',65,171,1150,90,34,C.navy,true);
 text(s,'未分配重疾资产，已有重疾给付保额20万',65,278,1150,75,29,C.muted);
 text(s,'80万',65,402,490,115,72,C.teal,true);text(s,'参考目标',70,529,490,50,28);
 text(s,'60万',675,402,490,115,72,C.navy,true);text(s,'待补缺口',680,529,490,50,28);
 text(s,'年限与储备均可调整；这些数值是项目假设，不是医疗费用预测或行业统一标准',65,611,1150,42,22,C.muted);
 note(s,'60秒。说明给付型重疾和报销型医疗的口径不同；年龄仅作校验，本项目没有精算风险系数。来源：src/utils/calculator.ts。');
}
// 6
{
 const s=slide('产品演示：结果、构成与公式',6);
 await image(s,'docs/source/assets/report.png',{left:64,top:138,width:820,height:500});
 text(s,'双险种结果\n\n已有保障与缺口\n\n明细与PDF打印',925,180,290,360,30,C.navy,true);
 note(s,'60秒。截图为本地生产构建真实页面，标准样例为200/150与80/60万。可现场打开应用完成参数调整，或用截图说明。');
}
// 7
{
 const s=slide('同一家庭的三种情景',7);
 const values=[['情景','定寿目标','定寿缺口','重疾目标','重疾缺口'],['乐观','164','114','62','42'],['基准','200','150','80','60'],['谨慎','260','210','112','92']];
 const t=s.tables.add({rows:4,columns:5,left:64,top:179,width:1152,height:300,columnWidths:[232,230,230,230,230],values});
 for(let r=0;r<4;r++)for(let c=0;c<5;c++){const cell=t.getCell(r,c);cell.fill=r===0?C.navy:(r===2?C.light:C.white);cell.text.style={fontSize:29,typeface:font,color:r===0?C.white:C.navy,bold:r===0||r===2,verticalAlignment:'middle',alignment:'center'};}
 t.borders.assign({fill:'#d8e2e9',width:1,style:'solid'});
 text(s,'单位：万元。改变的是支持年限、收入中断和治疗康复假设',64,522,1150,55,26,C.muted);
 text(s,'边界修复：0年不误用默认值；乐观情景不会延长较短的支持期',64,593,1150,55,26,C.teal,true);
 note(s,'55秒。表格由确定性算法计算，定寿资产20万，已有定寿50万、重疾20万。来源：tests/calculator.test.mjs。');
}
// 8
{
 const s=slide('AI 解释与多轮对话',8);
 text(s,'已完成 DeepSeek 真实接口联调',64,170,745,70,32,C.teal,true);
 text(s,'概念解释：重疾险与医疗险\n\n授权后引用计算器的当前结果\n\n多轮追问家庭责任变化\n\n最终金额仍以计算器报告为准',64,270,740,320,28);
 await image(s,'docs/source/assets/ai-mobile.png',{left:900,top:135,width:290,height:510});
 note(s,'70秒。截图来自实际服务调用，不是固定问答。当前页面样例与前页保持200/150和80/60万。来源：docs/TESTING.md、DeepSeek官方API说明 https://api-docs.deepseek.com/ 。');
}
// 9
{
 const s=slide('安全边界与验证结果',9);
 text(s,'34项',64,172,370,120,78,C.teal,true);text(s,'自动测试通过',68,310,370,55,30);
 text(s,'类型检查与生产构建通过\n\n桌面、手机视口及PDF导出已验收\n\n服务端凭据隔离、默认关闭摘要同步\n\n来源校验、请求约束、基础限流与超时',470,172,745,380,28);
 text(s,'权限：访客使用 / 服务进程调用 / 部署人员配置；当前无应用内管理员后台',64,592,1150,58,24,C.muted);
 note(s,'55秒。说明验证范围，实例限流不替代全局配额；不宣称经过渗透测试或认证。来源：docs/TESTING.md与安全自评报告。');
}
// 10
{
 const s=slide('交付与下一步',10);
 row(s,170,'可复核的交付','源码、锁文件、测试、构建产物和部署说明');
 row(s,315,'完整比赛材料','技术文档、答辩PDF、安全自评报告与源码ZIP');
 row(s,460,'持续改进','统一配额、模型回答评估和更多终端兼容性验证');
 text(s,'定位：家庭保障教育与需求估算工具',64,611,1150,44,26,C.teal,true);
 note(s,'40秒。交代成果与适用边界，结束答辩。总时长约9分钟。');
}

for(let i=0;i<p.slides.items.length;i++){
 const blob=await p.export({slide:p.slides.items[i],format:'png',scale:1});
 await fs.writeFile(path.join(build,`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await blob.arrayBuffer()));
}
// PDF pages are assembled from the checked native-rendered slides by build_deck_pdf.py.
await (await PresentationFile.exportPptx(p)).save(path.join(build,'candidate.pptx'));
await fs.writeFile(path.join(build,'deck.json'),JSON.stringify(p.toProto()));
console.log('Created 10-slide PDF and editable draft.');
