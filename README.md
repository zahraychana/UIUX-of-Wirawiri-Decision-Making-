# WiraWiri Feeder Suroboyo: Operations Dashboard and Fleet Decision Support

A desktop web interface that helps a city transport agency decide **which feeder-bus corridor should get extra buses first, and explain why.**
It combines daily operations monitoring with a Decision Support System based on **Simple Additive Weighting (SAW)**, and every part of the calculation can be traced on screen.

![Rekomendasi Armada screen](docs/hero.png)

| | |
|---|---|
| **Credit** | Raychana Maharani Zahra · [zahraychana@gmail.com](mailto:zahraychana@gmail.com) |
| **Role** | UI/UX designer and decision analyst (solo) |
| **Context** | Course project, Decision Support Systems, Department of Mathematics, Institut Teknologi Sepuluh Nopember (ITS), 2026 |
| **Scope** | 7 pages + 4 sub-views, desktop 1280 px, high-fidelity in Figma |
| **Decision model** | SAW, 5 corridors × 6 criteria, plus weight-sensitivity analysis |
| **Evaluation** | Heuristic inspection against Nielsen's 10 usability heuristics |
| **Deliverables** | [Report (PDF, Indonesian)](report/laporan-wirawiri.pdf) · [Figma file](https://www.figma.com/design/gAYZEz2JXkJzd2NWhkJvwu/Dashboard-SPK--Copy-?node-id=0-1) · [Interactive prototype](src/index.html) · [Dataset and SAW workbook](analysis/saw-wirawiri.xlsx) · [SAW check script](analysis/saw.py) · [Design decision log](docs/design-decisions.md) |

> **Note:** This is an academic concept. It is not affiliated with or endorsed by Dinas Perhubungan Kota Surabaya. All operational data is simulated, and the names shown in the UI are fictional.

---

## The problem

WiraWiri Suroboyo is Surabaya's feeder-bus service, connecting neighbourhoods to the main transit network. When demand on a corridor outgrows its fleet, people feel it directly: full buses, long waits, more complaints.

Deciding where to add buses is slow because the data sits in separate places: ridership, bus load, waiting time, complaints, and fleet availability. Planners merge it by hand, and the decision maker is still left asking *"why this corridor first?"*

Dashboards and decision models usually live apart. Dashboards stop at showing numbers, and SAW calculations stay in spreadsheets that managers don't read. This project puts both in **one workflow**: monitor → verify → decide → document.

## Users

| Actor | Needs | Main pages |
|---|---|---|
| **Transport Planner** (primary, daily user) | Monitor corridor performance, compare data, draft fleet proposals | Dashboard, Data Koridor, Rekomendasi |
| **Kepala Bidang Angkutan** (decision maker) | Understand the recommendation and its reasons, approve it | Rekomendasi, Laporan |
| **Admin Depo** | Keep bus status up to date (operating, maintenance, reserve) | Data Koridor |

## Process

The design follows Garrett's five planes of user experience, then adds the decision model and an evaluation step.

| # | Stage | Output |
|---|---|---|
| 1 | Reference study of Dishub Surabaya's website and visual identity | Navigation patterns, visual style |
| 2 | Requirements analysis | 3 actor profiles |
| 3 | Information architecture | Menu grouped by work stage |
| 4 | Design system | Colours, type, components |
| 5 | High-fidelity design | 7 pages + 4 sub-views in Figma |
| 6 | SAW implementation | Decision matrix, ranking, sensitivity analysis |
| 7 | Evaluation | Nielsen heuristic inspection |

## User flow

```mermaid
flowchart LR
    A[Login] --> B[Dashboard<br/>spot the problem]
    B --> C[Peta Rute<br/>verify on the map]
    B --> D[Data Koridor<br/>verify the numbers]
    C --> E[Rekomendasi Armada<br/>decide]
    D --> E
    E --> F[Laporan<br/>document and approve]
    E -. Atur Faktor .-> G[Pengaturan<br/>weights and thresholds]
    G -. live preview .-> E
```

Each page links to the next step (for example, "Lihat Rekomendasi" on the Dashboard), so users can follow the whole flow without going back to the menu.

## Key design decisions

The full log, with the alternatives considered and the reasoning, is in [docs/design-decisions.md](docs/design-decisions.md).

| Decision | Why |
|---|---|
| The recommendation page opens with the conclusion, **"Tambah 7 unit armada"** (add 7 buses), before any table | The decision maker is not technical and needs the answer first, details second |
| A **"Why is A4 most in need?"** panel and a visible weights panel | Avoids a black-box recommendation; the reasons are on the same screen as the result |
| **SAW** rather than AHP or TOPSIS | It is a weighted sum, so every part of it can be shown and explained in the UI |
| Show a 0–100 **need score** instead of V = 0.9667 | Easier to read and compare at a glance |
| The number of buses is an **analyst input** within a category range, not SAW output | SAW ranks need; it does not size the fleet |
| Status shown by **colour and a text label** (Kritis / Waspada / Normal) | Traffic-light colours are familiar in transport, and the labels keep it readable for colour-blind users (WCAG 2.1) |
| Navigation grouped by **work stage**: Summary, Data, Decision, Other | Mirrors how a planner thinks: overview → check → decide → document |
| Every KPI has a **target or comparison** next to it | A number alone does not say whether it is good or bad |
| **One simulated dataset** used consistently on every screen | Numbers can be checked by hand (2,090 passengers = sum of C1; 23.6 min = mean waiting time) |

## Screens

| | |
|---|---|
| ![Login](design/desktop/screens/00-login.png) **Login**: animated intro (the bus pulls up onto the route map), staff-only access with official email or NIP, show/hide password | ![Dashboard](design/desktop/screens/01-dashboard.png) **Dashboard**: KPIs with targets, 8-week trend, corridor performance vs. service standard, alerts, recommendation preview |
| ![Dashboard slide-over: corridor data](design/desktop/screens/01a-dashboard-slide-data-koridor.png) **Slide-over: corridor data**: six criteria per corridor without leaving the Dashboard | ![Dashboard slide-over: recommendation](design/desktop/screens/01b-dashboard-slide-rekomendasi-armada.png) **Slide-over: recommendation**: ranking and expected impact |
| ![Peta Rute](design/desktop/screens/02-peta-rute.png) **Peta Rute**: schematic map coloured by service status, with segment filters | ![Data Koridor](design/desktop/screens/03-data-koridor.png) **Data Koridor**: master data; six columns are the SAW decision matrix |
| ![Tambah Koridor](design/desktop/screens/03a-tambah-koridor.png) **Add corridor**: three-step form, auto-fill from the route file, required-field markers | ![Rekomendasi Armada](design/desktop/screens/04-rekomendasi-armada.png) **Rekomendasi Armada**: the core of the DSS, with conclusion, ranking, reasons, weights and expected impact; each row shows its score trend since June and links to Riwayat Kebutuhan |
| ![Laporan](design/desktop/screens/05-laporan.png) **Laporan**: official decision sheet ready for approval, PDF/Excel export | ![Semua Arsip](design/desktop/screens/05a-laporan-semua-arsip.png) **Archive**: all decision documents with status and type filters |
| ![Pengaturan](design/desktop/screens/06-pengaturan.png) **Pengaturan**: weight sliders with live result preview, service thresholds, score categories, data sources | ![Detail Perhitungan](design/desktop/screens/04a-rekomendasi-detail-perhitungan.png) **Detail Perhitungan**: the SAW steps, factor contributions per corridor, the full calculation table, the stability check and the random-weight simulation |

### States (added after evaluation)

| | |
|---|---|
| ![Konfirmasi](design/desktop/screens/04b-rekomendasi-konfirmasi.png) **Approval confirmation**: summary of what will be approved, borderline warning, calculation freeze notice | ![Riwayat](design/desktop/screens/04d-rekomendasi-riwayat.png) **Riwayat Kebutuhan**: score trend June–November with category bands, month × corridor table, automatic notes |
| ![Pilih periode](design/desktop/screens/04e-rekomendasi-pilih-periode.png) **Period selector**: six months; past months open read-only with a link to the archive | ![Memuat](design/desktop/screens/04c-rekomendasi-memuat.png) **Loading**: skeleton while a period loads |
| ![Sinkron gagal](design/desktop/screens/03c-data-koridor-sinkron-gagal.png) **Sync failed**: last good data stays visible, retry button | ![Galat form](design/desktop/screens/03b-tambah-koridor-galat.png) **Form errors**: inline messages (duplicate code, same start and end stop, missing length) |
| ![Tidak ditemukan](design/desktop/screens/03d-data-koridor-tidak-ditemukan.png) **Empty search result** with a hint | |

Every design carries the same watermark, `zahraychana@gmail.com`, in the bottom-left corner. Mobile designs are kept separately in [`design/mobile/`](design/mobile).

Source SVGs are in [`design/desktop/svg/`](design/desktop/svg). The layouts use [Poppins](https://fonts.google.com/specimen/Poppins).

## Interactive prototype

[`src/`](src) is a clickable prototype of the whole flow, in three files and with no install or build step:

| File | Contents |
|---|---|
| `src/index.html` | App shell (sidebar and top bar) and all styles, using the Figma tokens |
| `src/saw.js` | Simulated dataset and the SAW method: normalisation, score, category, allocation, sensitivity |
| `src/app.js` | Every screen, navigation and interaction |

Open `src/index.html` in a browser (the demo account is pre-filled). The SAW logic is live: move a weight in **Pengaturan**, save, and the ranking in **Rekomendasi Armada**, **Detail Perhitungan**, the Dashboard and the report all recalculate. Approving a recommendation freezes its calculation in the report, so later weight changes do not alter it. `saw.js` produces the same numbers as the workbook (97/87/75/70/46).

## Decision model: Simple Additive Weighting

**Alternatives**: five corridors (A1 Benowo–TP, A2 Puspa Agro–DTC, A3 Sungkono–Kenjeran, A4 Bratang–Joyoboyo, A5 Joyoboyo–Lakarsantri).

**Criteria and weights**: the goal is to measure *need* for more buses, so a higher value means more need. The one exception is C5: a **low** fleet-per-km ratio means the corridor is short of buses, so C5 is a cost criterion.

| Code | Criterion | Weight | Type |
|---|---|---|---|
| C1 | Passengers (people/day) | 0.25 | Benefit |
| C2 | Bus load at peak (%) | 0.20 | Benefit |
| C3 | Waiting time (min) | 0.20 | Benefit |
| C4 | Complaints (reports/month) | 0.15 | Benefit |
| C5 | Fleet per route km (units/km) | 0.10 | Cost |
| C6 | Transit connectivity (1–5) | 0.10 | Benefit |

Normalisation: $r_{ij} = x_{ij} / \max_i x_{ij}$ for benefit criteria and $r_{ij} = \min_i x_{ij} / x_{ij}$ for cost criteria. Preference value: $V_i = \sum_j w_j r_{ij}$.

**Result**

| Rank | Corridor | V | Score | Category | Proposal |
|---|---|---|---|---|---|
| 1 | A4 Bratang–Joyoboyo | 0.9667 | 97 | Sangat perlu (urgent) | +4 units |
| 2 | A1 Benowo–TP | 0.8704 | 87 | Sangat perlu (urgent) | +2 units |
| 3 | A3 Sungkono–Kenjeran | 0.7503 | 75 | Perlu (needed) | +1 unit |
| 4 | A2 Puspa Agro–DTC | 0.6990 | 70 | Pantau (monitor) | – |
| 5 | A5 Joyoboyo–Lakarsantri | 0.4619 | 46 | Belum perlu (not yet) | – |

Score categories (set on the Pengaturan screen): 80–100 Sangat perlu, 72–79 Perlu, 55–71 Pantau, 0–54 Belum perlu.

### Sensitivity analysis: the ranking holds, the allocation is less certain

The weights come from the analyst team's judgement, so they are subjective. To test how robust the result is, one weight is changed at a time and the rest are rescaled proportionally: $w'_j = w_j \frac{1 - w'_k}{1 - w_k}$.

| Scenario | Change | Ranking | V(A4) | Score A3 / A2 |
|---|---|---|---|---|
| S0 | Base weights | A4 › A1 › A3 › A2 › A5 | 0.9667 | 75 / 70 |
| S1 | Equal weights (1/6) | A4 › A1 › A3 › A2 › A5 | 0.9556 | 77 / 70 |
| S2 | C1 raised to 0.35 | A4 › A1 › A3 › A2 › A5 | 0.9711 | **72** / 70 |
| S3 | C3 raised to 0.30 | A4 › A1 › A3 › A2 › A5 | 0.9625 | 78 / 69 |
| S4 | C4 removed | A4 › A1 › A3 › A2 › A5 | 0.9608 | 74 / **74** |
| S5 | C5 raised to 0.20 | A4 › A1 › A3 › A2 › A5 | 0.9481 | 78 / 70 |

The **ranking never changes**, so the priority for A4 and A1 is safe to act on. The **decision for A3 and A2 is less certain.** Both sit near the 72-point boundary of the Perlu category:

- In S2, A3 drops to exactly 72.
- In S4, A2 rises to 74 and joins the Perlu category. It is only 0.0039 behind A3 in preference value, so it would also qualify for an extra bus.

The UI therefore flags corridors whose score is close to a category boundary and leaves those calls to the decision maker.

### Random-weight simulation

The six scenarios change one weight at a time. A wider test multiplies **every** weight by a random factor between 0.5 and 1.5, renormalises, and re-ranks, 1,000 times (seeded generator, identical in `saw.js` and `saw.py`):

| Corridor | Same rank | Same category | Score range |
|---|---|---|---|
| A4 | 100% | 100% | 95–98 |
| A1 | 100% | 100% | 84–90 |
| A3 | 93.9% | 85.5% | 68–82 |
| A2 | 93.9% | 83.1% | 66–74 |
| A5 | 100% | 100% | 42–51 |

The full order holds in 93.9% of runs. Only A3 and A2 ever swap, which confirms the borderline flag.

### Monthly history

The History sheet holds simulated monthly averages for June–November 2026. With the same weights, A3 rises from 65 (Pantau) to 75 (Perlu) and overtakes A2 in September, so the proposal grows from +6 to +7 buses. The prototype shows this on the **Riwayat Kebutuhan** page and every period-aware screen follows the period selector.

### Reproduce it

The simulated dataset and the whole SAW calculation live in one workbook, [`analysis/saw-wirawiri.xlsx`](analysis/saw-wirawiri.xlsx), with one sheet per step and live formulas:

| Sheet | Contents |
|---|---|
| About | Sheet guide, method, colour legend and the key result |
| Criteria | Six criteria, weights, benefit/cost type, need-score categories, borderline margin |
| Data | Step 1: decision matrix for the 5 corridors (simulated) |
| Normalisation | Step 2: benchmark per criterion and the 0–1 matrix (Table VII) |
| Ranking | Steps 3–4: contribution points, V, score, category, rank (Table VIII) |
| Sensitivity | Six weight scenarios (Table IX) |
| History | June–November 2026 data and the score of each month |

Change a blue input cell (a weight, a corridor value or a scenario) and every sheet recalculates. To check the workbook independently of its formulas:

```bash
pip install openpyxl
python analysis/saw.py        # Tables VII–IX, monthly scores, random-weight simulation, workbook check
```

## Traceability: no black box

Every SAW component appears on a specific UI element, so a sceptical manager can trace a recommendation back to the raw data.

```mermaid
flowchart LR
    X["Decision matrix X<br/>Data Koridor table"] --> N["Normalised values r"]
    W["Weights W<br/>'Faktor yang Dipertimbangkan' panel<br/>Pengaturan sliders"] --> V
    N --> V["Preference V<br/>need score 0–100"]
    V --> K["Ranking and category<br/>'Urutan Kebutuhan Armada'"]
    T["Category bounds<br/>'Tingkat Kebutuhan' panel"] --> K
    K --> Y["Criterion contribution<br/>'Kenapa A4 paling perlu?'"]
    K --> D["Final decision<br/>Laporan decision sheet and archive"]
```

## Evaluation

The design was inspected against Nielsen's 10 usability heuristics. **6 are fully met and 4 are partly met.**

| Partly met | Gap | Status |
|---|---|---|
| Error prevention | No confirmation before "Setujui & Buat Laporan" (approve and create report) | **Fixed**: confirmation dialog (04b) |
| Help users recover from errors | No error messages for invalid form input | **Fixed**: inline errors (03b), sync-failed banner with retry (03c) |
| Flexibility and efficiency | Desktop only | **Fixed**: responsive prototype for tablet and phone |
| Help and documentation | No help page | Open: help centre and glossary of criteria |

### Iteration after evaluation

| Before | After |
|---|---|
| Approve button created the report immediately | Confirmation dialog with units, total fleet and borderline warning |
| Period selector showed only November | Six months, period-aware pages, Riwayat Kebutuhan trend page |
| Robustness shown by six one-at-a-time scenarios | Plus a 1,000-run random-weight simulation |
| No loading, empty, error or offline states | Skeleton, empty search, inline form errors, sync-failed and offline banners |
| Desktop only, min-width 1180 px | Tablet and phone layouts with off-canvas menu |
| 18 of 27 colour pairs below WCAG AA, 10 px text | All pairs pass, 11 px minimum, skip link, reduced motion ([audit](docs/accessibility.md)) |

## Limitations

- All data is simulated, and the evaluation was a heuristic self-inspection, not testing with real users.
- The weights reflect the analyst team's judgement. The sensitivity analysis bounds this risk but does not remove it.
- The number of buses per corridor is an analyst input. SAW only ranks the corridors by need.

## Next steps

1. Usability testing with Dishub staff using the System Usability Scale (SUS).
2. Add a scenario-simulation mode that does not change the active weights.
3. Add a help centre and glossary (the last partly met heuristic).
4. Replace simulated data with GPS and e-ticket feeds.

## Design system

| Element | Specification |
|---|---|
| Primary colours | Navy `#0F2D4E`, blue `#2F64A0`, text `#1B2A3A`, background `#F1F5FA` |
| Status colours | Red `#C43741` Kritis, amber `#E2A23B` bar / `#986410` text Waspada, green `#287A4E` Normal |
| Text | Secondary `#606D7D`, placeholder `#5F7288`, field border `#808FA5` (all WCAG AA, see [audit](docs/accessibility.md)) |
| Typography | Poppins: page title 28 px bold, card title 16 px, body 13–14 px |
| Components | KPI card, status chip, data table, progress bar, button, segmented filter, slide-over panel, modal form, checkbox and password-visibility toggle (with state variants) |
| Layout | 1280 px frame, 260 px sidebar, 72 px header, card-based content; 390 px mobile frame below 640 px |

## Repository structure

```
.
├── README.md                     case study (this file)
├── docs/
│   ├── design-decisions.md       decision log: context, options, choice, rationale
│   ├── accessibility.md          WCAG contrast audit, before/after
│   ├── cover.png                 Behance/LinkedIn cover (1600×1200)
│   └── hero.png
├── design/
│   ├── desktop/
│   │   ├── screens/              PNG exports of every screen (2x)
│   │   └── svg/                  source SVGs (text outlined; Login has two animation frames)
│   └── mobile/                   mobile designs (kept separately)
├── analysis/
│   ├── saw-wirawiri.xlsx         simulated dataset + SAW calculation, one sheet per step
│   └── saw.py                    recomputes the model from the workbook and checks it
├── src/                          clickable prototype: index.html, saw.js, app.js
└── report/
    ├── laporan-wirawiri.pdf      full report (Indonesian)
    └── laporan-wirawiri.docx
```

## Author

**Raychana Maharani Zahra**, Department of Mathematics, Institut Teknologi Sepuluh Nopember.
Credit by [zahraychana@gmail.com](mailto:zahraychana@gmail.com). The same credit appears at the bottom left of the prototype's sidebar.

The Dishub Surabaya logo and name are used only to make this academic mock-up realistic. Poppins is licensed under the SIL Open Font License.
