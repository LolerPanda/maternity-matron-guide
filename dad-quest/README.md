# 爸爸，准备好了吗？ / Dad, You Got This

[English documentation](README.en.md)

一款中文 / English 双语情境选择游戏，帮助准爸爸、新手爸爸及其他照护者练习待产准备、陪产沟通、照护协作与产后情绪支持。

[在线中文版](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/index.html) · [Play online in English](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/en.html)

## 开始使用

在本目录运行：

```sh
python3 -m http.server 8873 --bind 127.0.0.1
```

- 中文：<http://127.0.0.1:8873/index.html>
- English：<http://127.0.0.1:8873/en.html>

如果从仓库根目录启动服务器，则在上述地址中加入 `/dad-quest/`。端口被占用时换一个可用端口。

也可直接用浏览器打开 `index.html` 或 `en.html`，无需安装依赖。直接打开本地文件时，各浏览器的存储行为不一致；需要可靠的跨语言进度共享时，请使用本地 HTTP 服务。

## 如何玩

选择任意章节，阅读情境并选择行动，查看解释、参考来源和可执行的小行动。共四章、12 个情境，无倒计时。章节完成后获得学习徽章，全部完成后可集中复习需要巩固的情境，也可重新开始。

页面右上角切换中英文时保留当前情境或回顾页面。相同来源下的两个版本共用选择记录和六项准备清单。原中文版 `dad-quest-v1` 存储格式保持兼容；切换域名、端口、设备或清除浏览器数据不会迁移进度。重新开始只清除答题记录，保留准备清单。

## 文件结构

```text
dad-quest/
├── index.html                 # 中文入口
├── en.html                    # English entry
├── assets/
│   ├── css/style.css          # 双语共享响应式样式
│   ├── images/family.svg      # 本地家庭插画
│   └── js/
│       ├── app.js             # 共享游戏逻辑、存储与导航
│       └── locales/
│           ├── zh-CN.js       # 中文情境、界面与资料
│           └── en.js          # 英文情境、界面与资料
├── tests/content.test.cjs     # 本地内容完整性检查
├── README.md
└── README.en.md
```

## 内容与隐私

情境和对话为学习用途创作，不是临床工具，不提供诊断、治疗或照护能力评级。内容覆盖孕晚期、分娩及产后数周，不以严格医学围产期定义限定场景。健康要点参考 [NHS 陪产指南](https://www.nhs.uk/best-start-in-life/pregnancy/preparing-for-labour-and-birth/tips-for-your-birthing-partner-or-partners/)、[NHS 安全睡眠](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/safe-sleep-advice-for-babies/)、[NHS 产后抑郁](https://www.nhs.uk/mental-health/conditions/postnatal-depression/)、[NHS 产后睡眠与疲劳](https://www.nhs.uk/baby/support-and-services/sleep-and-tiredness-after-having-a-baby/)及 [CDC 紧急孕产期警示信号](https://www.cdc.gov/hearher/maternal-warning-signs/index.html)，核对日期为 2026-10-03。请遵循当地医护的个体化指引。游戏内的紧急提示不是完整清单。

无需账户，无统计追踪、外部字体或运行时网络请求。选择和清单仅存储在浏览器本地；点击外部参考链接才会离开游戏。两种语言共用场景编号及答案语义，急救号码提示按语言提供不同示例，请使用所在地号码。

## 开发与验证

修改 `assets/js/locales/` 下的双语内容时保持场景顺序、答案索引和 UI 键一致；公共行为只修改 `assets/js/app.js`。没有打包步骤，刷新页面即可看到变化。

使用 Node.js 18 或更高版本运行：

```sh
node --check assets/js/app.js
node --test tests/content.test.cjs
```

这些检查覆盖翻译键、12 个情境、答案对应关系、资料链接结构与本地资源路径，不构成医学审查。界面或逻辑变更后还应手动验证：两种语言完整通关、答错复习、刷新恢复、情境中切换语言、准备清单、窄屏和键盘操作。
