# 围产家庭支持工具 / Maternity & New Parent Toolkit

**新增独立驾驶特别篇：[北京同行 · 欢乐谷到三元桥](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/drive-beijing.html)**。俯视街机驾驶，实际控制油门、刹车和车道，包含前车、红灯、出口及停车。北京道路方位为蓝本，场景压缩且不用于导航；原「雨夜，去医院」完整保留。[玩法、地图来源与边界](dad-quest/docs/BEIJING_DRIVE.md)。

**临产出发已重制：[雨夜，去医院](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/route.html)**。两张地图、整段路线规划、动态封路与缓行、院区夜间入口和遮雨路线、电梯寻路；到院后找到产科接待才完成。支持行进暂停、路口存档和实际路线回顾。

**[爸爸练习生 · 十章中文游戏合集](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/series.html)**

已实现从孕晚期到产后支持的十种挑战：行李拼图、路线应变、医院陪产、出院交接、家庭夜班、轮班排程、环境安抚、来访分流、求助通讯、支持网络。新增八章采用不同操作机制，可自由选章、自动保存，不要求重复刷关。

[系列规划与覆盖边界](dad-quest/docs/SERIES_PLAN.md) · [游戏结构与操作说明](dad-quest/README.md)

公共网站根入口进入成长地图；旧游戏地址保持可用。

**新游戏：[爸爸陪产 · 我在你身边](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/labor.html)** — 入院交接、物品递送、握手节奏挑战、医护沟通与产后交接。可独立游玩，支持中文与手机操作。[玩法说明](dad-quest/LABOR.md)。

[English](README.en.md)

帮助待产与产后家庭准备、沟通和分担照护的实用工具。

## 新版：爸爸值夜班

[直接开始中文版游戏](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/)

控制角色在四个房间里移动，搬运物品、整理婴儿床、接手换护、送水送饭、处理门铃与电话，并找帮手交接休息。单晚最长六分钟，支持键盘、鼠标和手机点按；含八项连续任务、定时事件与夜班回顾。这是第一章单人模拟游戏，不再以答题为主要玩法。

此前的双语问答保留为 [中文知识练习](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/practice.html) / [English practice](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/en.html)。英文版目前仍是知识练习。

其他资源：

- **爸爸，准备好了吗？ / Dad, You Got This**：中文、英文双语情境游戏，四章共 12 个情境，覆盖待产准备、陪产沟通、夜间照护、家庭边界与情绪支持。包含即时反馈、章节徽章、复习、准备清单和本地进度保存。
- **月嫂 / 育儿嫂面试评分表**：保留原有中文网页与可打印 PDF，帮助家庭有条理地考察候选人的专业知识、沟通与服务边界。

## 在线体验

无需下载或注册，手机和电脑均可直接访问：

- [中文游戏](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/index.html)
- [English game](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/en.html)
- [月嫂面试评分表](https://lolerpanda.github.io/maternity-matron-guide/scorecard.html)

GitHub Pages 从 main 分支根目录发布。进度保存在各参与者自己的浏览器中，不上传到 GitHub，也不与其他人共享。

## 本地开发

克隆仓库后，从仓库根目录运行：

```sh
git clone https://github.com/LolerPanda/maternity-matron-guide.git
cd maternity-matron-guide
python3 -m http.server 8873 --bind 127.0.0.1
```

浏览器打开：

- 中文操作游戏：<http://127.0.0.1:8873/dad-quest/index.html>
- English knowledge practice：<http://127.0.0.1:8873/dad-quest/en.html>
- 中文面试评分表：<http://127.0.0.1:8873/scorecard.html>

端口被占用时改用其他端口。也可直接用浏览器打开相应 HTML 文件；需要稳定的游戏进度保存和跨语言共享时，推荐使用上面的本地服务器方式。无需安装前端依赖或执行构建。


## 项目结构

```text
maternity-matron-guide/
├── index.html                      # Public site entry
├── .nojekyll                       # Static GitHub Pages publishing
├── README.md                       # 中文仓库说明
├── README.en.md                    # English repository guide
├── dad-quest/
│   ├── drive-beijing.html          # 独立北京驾驶特别篇
│   ├── route.html                  # 临产出发重制：城市与院区
│   ├── series.html                 # 十章中文成长地图
│   ├── adventure.html              # 八款新互动章节
│   ├── docs/SERIES_PLAN.md          # 场景规划与玩法分工
│   ├── labor.html                  # 新增中文陪产游戏
│   ├── LABOR.md                    # 陪产篇玩法说明
│   ├── index.html                  # 中文操作游戏
│   ├── practice.html               # 原中文知识练习
│   ├── en.html                     # English game entry
│   ├── assets/
│   │   ├── css/night.css           # 操作游戏样式
│   │   ├── css/style.css           # 双语共享样式
│   │   ├── images/family.svg       # 本地插画
│   │   └── js/
│   │       ├── series-data.js      # 十章元数据
│   │       ├── series-core.js      # 规则与存储
│   │       ├── series-hub.js       # 地图与进度
│   │       ├── episodes.js         # 八种新玩法
│   │       ├── night.js            # 游戏循环、寻路与任务
│   │       ├── app.js              # 共享游戏逻辑
│   │       └── locales/
│   │           ├── zh-CN.js        # 中文情境与界面
│   │           └── en.js           # English content and UI
│   ├── tests/content.test.cjs      # 内容完整性检查
│   ├── README.md                   # 中文游戏文档
│   └── README.en.md                # English game documentation
├── docs/scorecard.md               # 原评分表说明、考察点与致谢
├── scorecard.html                  # 原中文评分表，路径不变
└── 月嫂面试评分表.pdf                # 原可打印 PDF，路径不变
```

## 双语知识练习

详细运行、存储、内容来源与开发说明见 [中文游戏文档](dad-quest/README.md) / [English game documentation](dad-quest/README.en.md)。

右上角可切换语言并保留当前情境。同一浏览器来源下共用进度与准备清单。内容保存在本地，不上传个人数据；没有外部字体、统计追踪或付费 API。英文版完整翻译了游戏内容，不包含现有中文面试评分表的翻译。

内容检查（Node.js 18+）：

```sh
node --check dad-quest/assets/js/app.js
node --test dad-quest/tests/*.test.cjs
```

## 月嫂 / 育儿嫂面试评分表

- [中文网页版源码](scorecard.html)
- [可打印 PDF](月嫂面试评分表.pdf)
- [完整考察点、评分说明与致谢](docs/scorecard.md)

评分表包含 11 项知识考察与 1 项沟通观察清单，前 11 项提供「优秀 / 合格 / 不合格」参考，满分 33 分；观察清单不计分。

原评分表的许多考察思路来自抖音博主 **朱古力**（[主页](https://v.douyin.com/1uxSLDhWnog/)）公开的月嫂 / 育儿嫂面试实录。感谢其分享；详细致谢继续保留在评分表说明中。

## 使用边界

本仓库为家庭学习与沟通参考，不提供诊断、治疗或专业资质评定。游戏未经临床验证，健康相关参考来源和核对日期列于游戏文档及应用内「内容与参考资料」。实际护理请遵循当地医护的个体化意见；紧急情况立即联系当地急救服务。
