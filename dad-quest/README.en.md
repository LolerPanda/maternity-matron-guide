# Dad, You Got This

**New: [Dad on Night Duty — playable Chinese simulation](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/).** Move around four rooms, carry supplies, share care, manage interruptions, and hand over to a helper. This first episode is a single-player Chinese game. The English page below remains the original learning quiz; it is not an English translation of the new simulation. See the [Chinese game guide](README.md) for current game controls and structure.

[中文说明](README.md)

A bilingual Chinese / English scenario game for expectant dads, new dads, and other caregivers. Practice preparation, birth support, shared care, and emotional support after birth.

[在线中文版](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/practice.html) · [Play online in English](https://lolerpanda.github.io/maternity-matron-guide/dad-quest/en.html)

## Play locally

From this directory, run:

```sh
python3 -m http.server 8873 --bind 127.0.0.1
```

- English: <http://127.0.0.1:8873/en.html>
- Chinese: <http://127.0.0.1:8873/index.html>

When serving from the repository root, add `/dad-quest/` to these paths. Choose another port if necessary. You can also open either HTML file directly without installing anything, but browser storage behavior for local files varies. Use a local HTTP server for reliable shared progress.

## What’s included

Four chapters, twelve situations, immediate explanations, practical takeaways, reference links, chapter badges, focused review, and a six-item preparation checklist. No timer or parenting ability score.

Switch languages in the header without losing the current situation or reflection page. Both versions share choices and checklist items on the same browser origin. The original Chinese version’s `dad-quest-v1` save format remains compatible. Changing domains, ports, or devices does not transfer progress. Clearing browser data removes it. Starting a new round resets answers but keeps your checklist.

## Project structure

```text
dad-quest/
├── index.html                 # Chinese entry
├── en.html                    # English entry
├── assets/
│   ├── css/style.css          # Shared responsive styles
│   ├── images/family.svg      # Local family illustration
│   └── js/
│       ├── app.js             # Shared renderer, state, and navigation
│       └── locales/
│           ├── zh-CN.js       # Chinese content and UI
│           └── en.js          # English content and UI
├── tests/content.test.cjs     # Content integrity checks
├── README.md
└── README.en.md
```

## Content and privacy

This is an educational communication exercise, not a clinically validated tool, diagnosis, treatment, or assessment of caregiving ability. It covers late pregnancy, birth, and the weeks afterward, using a broader everyday-care scope than some clinical definitions of the perinatal period.

Health-related points draw on [NHS birth-partner guidance](https://www.nhs.uk/best-start-in-life/pregnancy/preparing-for-labour-and-birth/tips-for-your-birthing-partner-or-partners/), [NHS safer sleep](https://www.nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/safe-sleep-advice-for-babies/), [NHS postnatal depression](https://www.nhs.uk/mental-health/conditions/postnatal-depression/), [NHS sleep and tiredness after birth](https://www.nhs.uk/baby/support-and-services/sleep-and-tiredness-after-having-a-baby/), and [CDC urgent maternal warning signs](https://www.cdc.gov/hearher/maternal-warning-signs/index.html), checked on October 3, 2026. Follow local, individualized medical advice. The urgent-help information is not a complete list. Emergency numbers are examples; use the number for your location.

No accounts, analytics, external fonts, or runtime network requests are used. Choices and checklist items stay in local browser storage. External reference links only open when selected. Both languages share scenario IDs and answer meanings.

## Development and checks

Edit the matching locale files together, preserving scenario order, answer indices, and UI keys. Shared behavior belongs in `assets/js/app.js`. There is no build step: refresh after editing.

With Node.js 18 or later:

```sh
node --check assets/js/app.js
node --test tests/content.test.cjs
```

Checks cover translation keys, scenario completeness, matching answers, reference structure, and local asset paths. They are not a clinical review. After UI or logic changes, also check both full playthroughs, focused review, reload persistence, in-scenario language switching, the checklist, narrow screens, and keyboard access.
