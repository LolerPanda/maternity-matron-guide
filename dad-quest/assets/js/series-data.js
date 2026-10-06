/* Major family-life situations, not an exhaustive list of medical pathways. */
window.DAD_CHAPTERS = [
{id:'pack',stage:'孕晚期',name:'行李，不是越多越好',subtitle:'空间拼图',icon:'▦',minutes:'3–5',color:'#dfb990',desc:'旋转、摆放，把真正需要的东西装进有限空间。',mechanic:'旋转物件 · 网格装箱',lesson:'按医院清单准备，证件与紧急联系方式放在易取的位置。'},
{id:'route',stage:'临产出发',name:'雨夜，去医院',subtitle:'动态行程',href:'route.html',icon:'⌁',minutes:'5–8',color:'#b2cbbf',desc:'规划整段行程，应对封路与缓行，再穿过雨夜院区找到接待团队。',mechanic:'动态路线 · 院区探索',lesson:'遵循产科给出的就诊安排；游戏交通不代表真实导航。'},
{id:'labor',stage:'入院与待产',name:'我在，你不用独自面对',subtitle:'角色陪伴',icon:'♡',minutes:'5–8',color:'#bed2cb',desc:'在医院走动、交接资料，以握手节奏回应她的需要。',mechanic:'场景探索 · 节奏互动',href:'labor.html',lesson:'支持她与医护沟通，不替她作出医疗选择。'},
{id:'birth',stage:'分娩与初次见面',name:'迎接你',subtitle:'连续叙事互动',icon:'✦',minutes:'4–7',color:'#d9c2a0',desc:'从待产末段到第一次见面，整理空间、陪在床头，再接住出生后的需要。',mechanic:'空间互动 · 出生见证 · 持续照护',href:'birth.html',lesson:'陪伴贯穿出生前后，临床照护由医护负责。'},
{id:'handover',stage:'住院与出院',name:'别把交接留给记忆',subtitle:'信息拼接',icon:'▤',minutes:'2–4',color:'#cdc6de',desc:'从交接资料里提取信息，补齐缺失记录，带着清楚的安排回家。',mechanic:'查阅档案 · 信息归档',lesson:'出院资料有缺漏时当面确认，不靠猜测补全。'},
{id:'night',stage:'回家第一晚',name:'今晚，你来接一班',subtitle:'家庭模拟',icon:'☾',minutes:'4–6',color:'#d2d8b8',desc:'整理空间、递送物品、接手换护，最后交给帮手休息。',mechanic:'移动搬运 · 连续照护',href:'index.html',lesson:'照护需要具体行动，也需要清楚交接。'},
{id:'shifts',stage:'产后第一周',name:'把休息排进生活',subtitle:'家庭行动与轮班',href:'shifts.html',icon:'▥',minutes:'3–5',color:'#b9cbd8',desc:'亲自走动、查阅、搬运和交接；队友到位后，在非紧急来电中守住休息。',mechanic:'键盘移动 · 近身互动 · 连续接班',lesson:'这是成人分工表，不是给新生儿规定喂养和睡眠时刻。'},
{id:'soothe',stage:'新生儿日常',name:'哭声里的暂停键',subtitle:'空间与情绪互动',href:'recovery.html?chapter=soothe',icon:'◌',minutes:'3–5',color:'#dfc7ac',desc:'把额外声源移远，安全安置宝宝，再给自己暂停并完成真实接班。',mechanic:'空间声源 · 安全暂停 · 接班',lesson:'哭泣不总能立刻停止。感到失控时确保宝宝安全，寻求支援，绝不摇晃。'},
{id:'visitors',stage:'亲友与边界',name:'把好意安排在合适的位置',subtitle:'门口现场协调',href:'recovery.html?chapter=visitors',icon:'⇆',minutes:'3–5',color:'#d4c3bd',desc:'对讲了解来访，控制家门与隐私屏，协调物品交付、预约和接班。',mechanic:'门与隐私屏 · 多人到访',lesson:'用具体安排协调亲友，保留休息空间和就医联络。'},
{id:'signal',stage:'异常与求助',name:'接通那通重要的电话',subtitle:'通讯与现场协作',href:'recovery.html?chapter=signal',icon:'✚',minutes:'3–5',color:'#d9b7ac',desc:'保持模拟联络，传递已知情况，留出通道并引导支援人员到家门。',mechanic:'持续通讯 · 路线引导 · 交接',lesson:'警示信号需要及时求医；记录资料不能成为延误求助的理由。'},
{id:'network',stage:'持续恢复',name:'我们需要的不止两双手',subtitle:'动态支持网络',href:'recovery.html?chapter=network',icon:'✧',minutes:'3–5',color:'#bdc8aa',desc:'等待回复、确认范围，让支持抵达；有人临时无法到场时重新分工。',mechanic:'请求协商 · 专长容量 · 动态改派',lesson:'恢复、喂养困难和情绪困扰都可以寻求适合的支持。'}
];
window.DAD_REFERENCES = [
['NHS · 陪产伙伴','https://www.nhs.uk/best-start-in-life/pregnancy/preparing-for-labour-and-birth/tips-for-your-birthing-partner-or-partners/'],
['NHS · 临产信号与联络','https://www.nhs.uk/pregnancy/labour-and-birth/signs-that-labour-has-begun/'],
['NHS · 安抚哭泣宝宝','https://www.nhs.uk/baby/caring-for-a-newborn/soothing-a-crying-baby/'],
['NHS · 产后情绪支持','https://www.nhs.uk/mental-health/conditions/postnatal-depression/'],
['CDC · 紧急孕产期警示信号','https://www.cdc.gov/hearher/maternal-warning-signs/index.html']
];
