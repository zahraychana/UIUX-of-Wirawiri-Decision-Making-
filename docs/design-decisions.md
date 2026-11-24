# Design decision log

This log records the main decisions behind the WiraWiri interface and its decision model. Each entry has the context, the options considered, the choice, and the trade-off accepted. Report section numbers refer to [the report](../report/laporan-wirawiri.pdf).

---

### D1. Put monitoring and decision support in one product

- **Context:** Dashboards usually stop at showing numbers, and SAW calculations live in spreadsheets that managers don't read (Report §I).
- **Options:** (a) operations dashboard only; (b) standalone DSS calculator; (c) one workflow from monitoring to documentation.
- **Decision:** (c). The flow is Dashboard → Peta Rute / Data Koridor → Rekomendasi Armada → Laporan.
- **Why:** The decision is only as trusted as the data behind it. Keeping both in one place lets the planner move from "something is wrong" to "here is what we should do" without exporting anything.
- **Trade-off:** A larger scope to design and keep consistent.

### D2. Choose SAW as the decision method

- **Context:** Five corridors, six quantitative criteria, and a decision maker who is not technical.
- **Options:** SAW, AHP, TOPSIS.
- **Decision:** SAW.
- **Why:** SAW is a weighted sum. Every part of it (raw value, normalised value, weight, contribution, total) can be shown on screen and explained in one sentence. AHP needs pairwise-comparison questionnaires that the team would have to fill in again whenever criteria change. TOPSIS's distance-to-ideal logic is harder to explain to a manager.
- **Trade-off:** SAW is compensatory: a very high value on one criterion can hide a weak one. The "Why is A4 most in need?" panel and the per-criterion values on Data Koridor make this visible.

### D3. Treat C5 (fleet per km) as a cost criterion

- **Context:** The model measures *need* for more buses.
- **Decision:** C1–C4 and C6 are benefit criteria (higher means more need). C5 is a cost criterion, because a low ratio of buses to route length means the corridor is under-served.
- **Why:** If every criterion simply used "higher is better", the model would reward corridors that already have plenty of buses.

### D4. Lead with the conclusion

- **Context:** The Kepala Bidang approves the decision and does not want to read a matrix.
- **Decision:** Rekomendasi Armada opens with a sentence in decision language, "Tambah 7 unit armada" (add 7 buses) for 3 corridors, plus the expected impact (48 → 55 buses, −3.1 min average waiting time). The ranking and reasons come after.
- **Why:** Answer first, evidence second. The planner can still drill down.

### D5. Explain every recommendation on the same screen

- **Context:** A recommendation without reasons is a black box, and black boxes get ignored or overruled.
- **Decision:** Two side panels on Rekomendasi Armada: "Kenapa A4 paling perlu?" compares the top corridor with the average on each criterion, and "Faktor yang Dipertimbangkan" shows the weights. Each corridor row also has short reasons such as "Bus penuh 95%" (bus 95% full).
- **Why:** Traceability is the main contribution of the project (Report §IV-F). Every SAW component is linked to a UI element.

### D6. Show a 0–100 need score, not the raw preference value

- **Decision:** V is multiplied by 100 and rounded (0.9667 → 97), then grouped into four categories: Sangat perlu, Perlu, Pantau, Belum perlu.
- **Why:** Whole numbers and words are faster to scan than four-decimal values.
- **Trade-off:** Rounding hides small differences. The category boundaries also make small differences matter more (see D10).

### D7. Keep the number of buses as an analyst input

- **Context:** SAW ranks corridors by need; it does not calculate how many buses each one needs.
- **Decision:** Each category has a proposal range (Sangat perlu: +2 to +4, Perlu: +1), set on the Pengaturan screen. The exact number per corridor is entered by the analyst team and shown next to the score.
- **Why:** Being honest about what the model can and cannot do. Fleet sizing depends on budget, depot capacity and spare units, which are outside the model.

### D8. Status = colour + text label

- **Decision:** Red / amber / green for Kritis / Waspada / Normal, always with the text label.
- **Why:** The traffic-light convention is familiar in transport. The labels mean status does not rely on colour alone (WCAG 2.1, success criterion 1.4.1).

### D9. Navigation and global controls follow the planner's mental model

- **Decision:** A fixed sidebar grouped by work stage (Ringkasan, Data, Keputusan, Lainnya), and a global period picker in the header.
- **Why:** The groups mirror the order of work: overview, check, decide, document. The global period means every page shows the same month, so numbers always match between pages.

### D10. Report what the sensitivity analysis actually shows

- **Context:** The weights are a judgement call, so the result must be tested.
- **Decision:** Six weight scenarios (Report Table IX). The ranking is identical in all of them, but the categories of A3 and A2 are not. In S4, A2 reaches 74 (Perlu) and is only 0.0039 behind A3.
- **Why:** "The ranking is stable" is true, but it is not the same as "the allocation is stable". Saying so tells the decision maker where their judgement is still needed.
- **Next step:** Flag corridors whose score is within ±3 points of a category boundary, and add a scenario mode that tests weights without changing the active ones.

### D11. Let analysts tune the model with a live preview

- **Decision:** Pengaturan has weight sliders with a "Total 100%" check, a live "Pratinjau Hasil" (result preview) panel, a "Kembalikan Default" (restore defaults) button, and editable category bounds and service thresholds. The "Atur Faktor" (adjust factors) button on Rekomendasi Armada links here.
- **Why:** Users see what a change does before saving it, and can always undo it.

### D12. Use one consistent simulated dataset

- **Decision:** All screens draw from one dataset for November 2026.
- **Why:** Anyone can check the UI against the maths. Today's passengers (2,090) are the sum of C1, the average wait (23.6 min) is the mean of C3, and the average load (80.4%) is the mean of C2.
