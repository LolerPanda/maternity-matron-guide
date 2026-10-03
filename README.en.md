# Maternity & New Parent Toolkit

[中文](README.md)

Practical resources for families preparing for birth and sharing care afterward.

- **Dad, You Got This**: a complete Chinese / English scenario game with four chapters and twelve situations covering preparation, birth support, shared care, boundaries, and emotional well-being. Includes feedback, learning badges, focused review, a checklist, and locally saved progress.
- **Maternity / infant caregiver interview scorecard**: the existing Chinese web page and printable PDF, with knowledge prompts and communication observations. These original resources remain in Chinese.

## Play online

No download or sign-in required. Open on a phone or computer:

- [Play in English](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/en.html)
- [中文版](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/index.html)
- [Chinese interview scorecard](https://lolerpanda.github.io/maternity-matron-guide/scorecard.html)

GitHub Pages publishes the root of the main branch. Progress stays in each participant’s browser; it is not uploaded or shared with other participants.

## Local development

```sh
git clone https://github.com/LolerPanda/maternity-matron-guide.git
cd maternity-matron-guide
python3 -m http.server 8873 --bind 127.0.0.1
```

Open in your browser:

- English game: <http://127.0.0.1:8873/dad-quest/en.html>
- Chinese game: <http://127.0.0.1:8873/dad-quest/index.html>
- Chinese scorecard: <http://127.0.0.1:8873/scorecard.html>

Choose another port if needed. You can also open the HTML files directly, though a local server is recommended for reliable progress storage and language sharing. No frontend dependencies or build process are required.


## Structure

```text
maternity-matron-guide/
├── index.html                      # Public site entry
├── .nojekyll                       # Static GitHub Pages publishing
├── README.md                       # Chinese repository guide
├── README.en.md                    # English repository guide
├── dad-quest/
│   ├── index.html                  # Chinese game entry
│   ├── en.html                     # English game entry
│   ├── assets/
│   │   ├── css/style.css           # Shared styles
│   │   ├── images/family.svg       # Local illustration
│   │   └── js/
│   │       ├── app.js              # Shared game logic
│   │       └── locales/
│   │           ├── zh-CN.js        # Chinese content and UI
│   │           └── en.js           # English content and UI
│   ├── tests/content.test.cjs      # Content integrity checks
│   ├── README.md                   # Chinese game documentation
│   └── README.en.md                # English game documentation
├── docs/scorecard.md               # Original Chinese scorecard guide and credits
├── scorecard.html                  # Existing Chinese scorecard, same path
└── 月嫂面试评分表.pdf                 # Existing printable PDF, same path
```

## Bilingual game

See the [English game documentation](dad-quest/README.en.md) or [中文游戏文档](dad-quest/README.md) for usage, storage behavior, references, and development notes.

Switch languages in the header while keeping the current situation. Choices and checklist items are shared on the same browser origin and stay on the device. No external fonts, analytics, or paid APIs are used. The entire game is translated; the existing interview scorecard is not.

Content checks with Node.js 18 or later:

```sh
node --check dad-quest/assets/js/app.js
node --test dad-quest/tests/content.test.cjs
```

## Interview scorecard and credits

The original [HTML scorecard](scorecard.html) and [printable PDF](月嫂面试评分表.pdf) retain their paths. The [original guide](docs/scorecard.md) preserves the detailed assessment topics, scoring instructions, and acknowledgments. Eleven knowledge areas have three reference levels for a total of 33 points; the communication checklist is unscored.

Many of the scorecard’s interview prompts were informed by public interview videos from Douyin creator **朱古力** ([profile](https://v.douyin.com/1uxSLDhWnog/)). The original acknowledgment remains in the scorecard guide.

## Scope

These are learning and communication resources, not diagnosis, treatment, or professional certification. The game has not been clinically validated. Health references and their review date are listed in its documentation and About dialog. Follow local, individualized clinical advice and contact local emergency services when urgent help is needed.
