# 爸爸练习生 · 围产成长地图

**临产出发已重制：[雨夜，去医院](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/route.html)**。两张地图、整段路线规划、动态封路与缓行、院区夜间入口和遮雨路线、电梯寻路；到院后找到产科接待才完成。支持行进暂停、路口存档和实际路线回顾。

[直接在线游玩：十章中文游戏合集](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/series.html)

从孕晚期到产后持续支持，每章一种主要玩法：**行李拼图、路线应变、医院陪产、出院交接、家庭夜班、轮班排程、环境安抚、来访分流、求助通讯、支持网络**。保留两款场景模拟，新增八款独立互动游戏。所有章节开放，无需刷关或连续登录。

新增八章支持电脑和手机、过程自动存档、可选原创程序配乐；提示放在场景外。已有陪产与夜班游戏保留原玩法及最佳成绩存储。详细的场景覆盖、去重复设计和未覆盖情境见 [系列规划](docs/SERIES_PLAN.md)。新系列目前为中文；英文版仍是原有知识练习。

## 合集文件结构

```text
dad-quest/
├── series.html                 # 十章地图与完成标记
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
├── labor.html                  # 独立中文陪产游戏
├── LABOR.md                    # 陪产篇玩法说明
├── index.html                  # 中文可操作游戏
├── practice.html               # 原中文知识练习
├── en.html                     # 原英文知识练习
├── assets/
│   ├── css/night.css           # 游戏界面
│   ├── css/style.css           # 知识练习样式
│   ├── images/family.svg       # 知识练习插画
│   ├── css/labor.css           # 陪产篇样式
│   └── js/
│       ├── music.js            # 本地合成背景配乐
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
