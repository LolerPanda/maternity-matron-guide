# 围产家庭支持工具 / Maternity & New Parent Toolkit

[English](README.en.md)

帮助待产与产后家庭准备、沟通和分担照护的实用工具。目前包含：

- **爸爸，准备好了吗？ / Dad, You Got This**：中文、英文双语情境游戏，四章共 12 个情境，覆盖待产准备、陪产沟通、夜间照护、家庭边界与情绪支持。包含即时反馈、章节徽章、复习、准备清单和本地进度保存。
- **月嫂 / 育儿嫂面试评分表**：保留原有中文网页与可打印 PDF，帮助家庭有条理地考察候选人的专业知识、沟通与服务边界。

## 快速开始

克隆仓库后，从仓库根目录运行：

```sh
git clone https://github.com/LolerPanda/maternity-matron-guide.git
cd maternity-matron-guide
python3 -m http.server 8873 --bind 127.0.0.1
```

浏览器打开：

- 中文游戏：<http://127.0.0.1:8873/dad-quest/index.html>
- English game：<http://127.0.0.1:8873/dad-quest/en.html>
- 中文面试评分表：<http://127.0.0.1:8873/scorecard.html>

端口被占用时改用其他端口。也可直接用浏览器打开相应 HTML 文件；需要稳定的游戏进度保存和跨语言共享时，推荐使用上面的本地服务器方式。无需安装前端依赖或执行构建。

GitHub 文件页展示源码，并不直接运行 HTML 游戏。下载或克隆后可按上面的方式开始使用。

## 项目结构

```text
maternity-matron-guide/
├── README.md                       # 中文仓库说明
├── README.en.md                    # English repository guide
├── dad-quest/
│   ├── index.html                  # 中文游戏入口
│   ├── en.html                     # English game entry
│   ├── assets/
│   │   ├── css/style.css           # 双语共享样式
│   │   ├── images/family.svg       # 本地插画
│   │   └── js/
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

## 双语游戏

详细运行、存储、内容来源与开发说明见 [中文游戏文档](dad-quest/README.md) / [English game documentation](dad-quest/README.en.md)。

右上角可切换语言并保留当前情境。同一浏览器来源下共用进度与准备清单。内容保存在本地，不上传个人数据；没有外部字体、统计追踪或付费 API。英文版完整翻译了游戏内容，不包含现有中文面试评分表的翻译。

内容检查（Node.js 18+）：

```sh
node --check dad-quest/assets/js/app.js
node --test dad-quest/tests/content.test.cjs
```

## 月嫂 / 育儿嫂面试评分表

- [中文网页版源码](scorecard.html)
- [可打印 PDF](月嫂面试评分表.pdf)
- [完整考察点、评分说明与致谢](docs/scorecard.md)

评分表包含 11 项知识考察与 1 项沟通观察清单，前 11 项提供「优秀 / 合格 / 不合格」参考，满分 33 分；观察清单不计分。

原评分表的许多考察思路来自抖音博主 **朱古力**（[主页](https://v.douyin.com/1uxSLDhWnog/)）公开的月嫂 / 育儿嫂面试实录。感谢其分享；详细致谢继续保留在评分表说明中。

## 使用边界

本仓库为家庭学习与沟通参考，不提供诊断、治疗或专业资质评定。游戏未经临床验证，健康相关参考来源和核对日期列于游戏文档及应用内「内容与参考资料」。实际护理请遵循当地医护的个体化意见；紧急情况立即联系当地急救服务。
