# 爸爸练习生 · 围产成长地图

**后五章已重制为场景游戏**：双角色轮班、空间声源与安全暂停、多人门口协调、持续通讯与现场引导、会变化的支持网络。角色会实际移动，帮手会回复、晚到或临时缺席，每章有独立续存与章节导航。[五章玩法说明](docs/RECOVERY_GAMES.md)。

**新增陪产续篇：[迎接你 · 从陪产到第一次见面](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/birth.html)**。12 个连续时刻连接待产、分娩、初次接触与出生后的照护；包含空间整理、陪伴回应、连续出生叙事与医护交接。本机自动续存，可随时暂停。

出生叙事与初次接触时，可以在妈妈剧情同意后走到床头，选择头贴头陪伴。也可打开游戏手机，把取景滑块调整到 45–65，在宝宝出生后截取游戏画面，下载 PNG 纪念图。纪念图使用本局剧情出生瞬间锁定的设备本地时间，延后截图不会改变这一时刻；旧的已出生存档若没有时间记录，保持未记录状态。

头贴头和纪念截图均为可选互动，不影响主线，取景与截图可无限重试。游戏不调用系统截屏或相机；照片独立存于浏览器 `dad-birth-photo-v1`，可能受存储容量限制，建议下载保留。腕带配对编号 `A-0618` 仍为虚构。[续篇玩法与记录说明](docs/BIRTH_JOURNEY.md)。

**新增独立驾驶特别篇：[安心同行 · 向阳家园到星光妇产医院](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/drive-beijing.html)**。俯视街机驾驶，实际控制油门、刹车和前轮转向，支持倒车，不再自动沿路转弯，包含前车、红灯、出口及停车；新增 8 分钟平稳挑战、颠簸预算、弯道反馈和三类路况事件。虚构城市道路，场景压缩且不用于导航；原「雨夜，去医院」完整保留。[玩法说明与边界](docs/BEIJING_DRIVE.md)。

**临产出发已重制：[雨夜，去医院](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/route.html)**。两张地图、整段路线规划、动态封路与缓行、院区夜间入口和遮雨路线、电梯寻路；到院后找到产科接待才完成。支持行进暂停、路口存档和实际路线回顾。

[直接在线游玩：十一章中文游戏合集](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/series.html)

从孕晚期到产后持续支持，每章一种主要玩法：**行李拼图、路线应变、医院陪产、出生见证、出院交接、家庭夜班、轮班排程、环境安抚、来访分流、求助通讯、支持网络**。保留两款场景模拟，新增八款独立互动游戏。所有章节开放，无需刷关或连续登录。

新增八章支持电脑和手机、过程自动存档、可选原创程序配乐；提示放在场景外。已有陪产与夜班游戏保留原玩法及最佳成绩存储。详细的场景覆盖、去重复设计和未覆盖情境见 [系列规划](docs/SERIES_PLAN.md)。新系列目前为中文；英文版仍是原有知识练习。

## 合集文件结构

```text
dad-quest/
├── series.html                 # 十一章地图与完成标记
├── drive-beijing.html          # 独立安心驾驶特别篇
├── docs/BEIJING_DRIVE.md        # 地图蓝本、操控和存储说明
├── assets/js/beijing-drive-core.js # 驾驶规则
├── assets/js/beijing-drive.js   # 驾驶画面与输入
├── route.html                  # 重制的临产出发：城市与院区
├── adventure.html              # 其他七个新增章节入口
├── index.html / labor.html     # 家庭夜班 / 医院陪产
├── practice.html / en.html     # 中文 / 英文知识练习
├── docs/SERIES_PLAN.md          # 场景覆盖与玩法分工
├── assets/css/series.css        # 合集和八章的响应式布局
├── assets/js/series-data.js     # 章节与参考资料
├── assets/js/departure-core.js  # 重制出发：路线、事件和存储校验
├── assets/js/departure.js       # 行进动画、暂停、院区与行程回顾
├── assets/js/series-core.js     # 拼图规则、校验和本地存储
├── assets/js/series-hub.js      # 地图与进度展示
├── assets/js/episodes.js        # 八种互动玩法
├── assets/js/music.js           # 原创合成配乐
└── tests/                      # 规则、流程、内容与音乐回归测试
```

临产出发重制用 `dad-departure-v2` 保存行程；其他新章节使用 `dad-series-v1` 保存过程及完成标记，旧游戏存储键不变。清理浏览器数据会清空进度；没有账号、云同步或联网对战。存储不可用时仍可游玩，但无法在关闭后恢复。

---

# 爸爸值夜班 · 回家第一晚

**新增独立章节：[爸爸陪产 · 我在你身边](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/labor.html)**，详见 [陪产篇玩法](LABOR.md)。下文介绍原有「回家第一晚」。

[在线游玩中文版](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/)

一款可直接在浏览器运行的俯视角家庭照护模拟游戏。玩家控制爸爸在卧室、客厅、厨房和家务角之间移动，用实际操作完成回家第一晚的任务。

## 这一版怎么玩

- **移动**：WASD / 方向键；也可点击地面或物品自动寻路。
- **互动**：靠近物品，按 E / 空格或点击互动按钮。
- **搬运**：一次携带一件物品，送到正确地点才能完成任务。
- **照护**：接过宝宝、走到换护垫、连续完成换护、抱回准备好的婴儿床。宝宝在换护垫上时不能离开。
- **安排**：处理门铃和电话，利用洗衣与帮手在路上的等待时间做其他事。
- **交接**：找帮手、门口交接，最后到沙发休息。

每晚最长六分钟，可暂停、提前结束或重玩。精力、安定度及时间均为游戏叙事反馈，不是健康或照护能力指标；不会因操作缓慢模拟宝宝受伤。八项任务可以灵活安排顺序，某些任务有物品和交接前置条件。点击「带我去当前任务」可辅助找路。手机支持点按，横屏视野更好。点击开始后播放原创程序合成的轻柔夜曲，可单独开关配乐、调节音量；操作音效默认关闭。暂停、打开手册、切换后台或结束本晚时，配乐停止，返回游戏后继续播放。所有音乐在设备上生成，无需下载音频文件。

本版是第一章单人游戏，不包含多人联机、真实医疗模拟或英文版操作游戏。完整夜班状态不会续存，只有最佳完成数保存在浏览器本地。

## 知识练习保留

之前的选择题版本保留为独立工具：

- [中文知识练习](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/practice.html)
- [English learning scenarios](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/en.html)

两个知识练习版本仍共享原有本地进度，与新游戏分开存储。

## 文件结构

```text
dad-quest/
├── recovery.html               # 后五章场景重制入口
├── birth.html                  # 陪产续篇：迎接你
├── labor.html                  # 独立中文陪产游戏
├── LABOR.md                    # 陪产篇玩法说明
├── index.html                  # 中文可操作游戏
├── practice.html               # 原中文知识练习
├── en.html                     # 原英文知识练习
├── assets/
│   ├── css/recovery.css        # 后五章场景重制样式
│   ├── css/night.css           # 游戏界面
│   ├── css/style.css           # 知识练习样式
│   ├── images/family.svg       # 知识练习插画
│   ├── css/labor.css           # 陪产篇样式
│   └── js/
│       ├── music.js            # 本地合成背景配乐
│       ├── recovery-core.js     # 五章规则与独立存档
│       ├── recovery-scene.js    # 五个原创场景
│       ├── recovery.js          # 输入、界面与章节导航
│       ├── birth-core.js            # 续篇规则与存档校验
│       ├── birth-scene.js           # 连续分娩室画面
│       ├── birth-keepsake.js        # PNG 截图、纪念卡与照片校验
│       ├── birth.js                 # 续篇交互
│       ├── labor.js            # 陪产、节奏挑战与医护交接
│       ├── night.js            # Canvas 场景、寻路、任务与事件
│       ├── app.js              # 知识练习逻辑
│       └── locales/            # 中英文知识练习内容
├── tests/night.test.cjs        # 完整夜班、暂停和重玩逻辑测试
├── tests/content.test.cjs      # 双语知识练习内容检查
├── README.md
└── README.en.md
```

## 本地开发与测试

无需安装依赖、无需构建。在仓库根目录运行：

```sh
python3 -m http.server 8873 --bind 127.0.0.1
```

访问 `http://127.0.0.1:8873/dad-quest/`。Node.js 18+ 可运行：

```sh
node --check dad-quest/assets/js/night.js
node --test dad-quest/tests/*.test.cjs
```

逻辑测试使用受控时钟和模拟绘图环境验证完整任务流程，不代替浏览器渲染、鼠标、触屏或键盘检查。

## 内容边界与资料

这是家庭照护协作游戏，不是医学或实际护理操作培训。换护与抱持动作做了大幅简化，请在现实中向医护学习。婴儿安全睡眠要点参考 [NHS 安全睡眠](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/safe-sleep-advice-for-babies/)，其余原有资料见知识练习「内容与参考资料」（核对日期 2026-10-03）。现实紧急情况立即寻求当地医疗帮助。

无账户、追踪、付费 API 或外部字体。最高完成数与知识练习进度仅存储在浏览器本地。


安心驾驶篇新增分段路况：1–3 车道及渐变收窄、20/30/40/60 游戏限速与路牌、接缝路面的高速颠簸、湿滑路面的较长制动距离和转弯反馈。NPC 按分段限速行驶并提前并入单车道。道路宽度与碰撞边界使用同一套数据；车道数与速度均为原创玩法设定，不代表真实交通规定。

新篇文件：`dad-quest/assets/js/birth-core.js`（阶段与规则）、`birth-scene.js`（原创房间绘制）、`birth-keepsake.js`（PNG 画面截图、纪念卡与照片校验）、`birth.js`（交互、暂停与续存）、`dad-quest/assets/css/birth.css`，说明见 `dad-quest/docs/BIRTH_JOURNEY.md`。完整系列现在包含 11 个章节。

所有游戏章节默认开启轻柔配乐：有开始页的章节在点击开始后播放，其余章节在首次操作后播放。可手动关闭；暂停、切后台或结束时停止。
