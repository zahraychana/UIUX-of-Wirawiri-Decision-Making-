"""Simple Additive Weighting (SAW) for the WiraWiri fleet-priority decision.

Reads the inputs (criteria, weights, categories, simulated corridor data, weight
scenarios and the June-November history) from saw-wirawiri.xlsx, recomputes Tables
VII-IX of the report and the monthly scores independently of the spreadsheet formulas,
runs a random-weight simulation, and checks that the values saved in the workbook match.
The simulation uses the same generator (mulberry32, seed 2026) as src/saw.js, so the
prototype shows the same percentages.

    pip install openpyxl
    python analysis/saw.py

Exit code 1 means the workbook and this script disagree.
"""

import sys
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

from openpyxl import load_workbook

WORKBOOK = Path(__file__).resolve().parent / "saw-wirawiri.xlsx"


def round_half_up(x, digits=0):
    """Excel's ROUND: halves go away from zero (Python's round() goes to even)."""
    q = Decimal(1).scaleb(-digits)
    return float(Decimal(str(x)).quantize(q, rounding=ROUND_HALF_UP))


def load(path):
    wb = load_workbook(path)  # formulas as text: only the input cells are read
    cr, da, se = wb["Criteria"], wb["Data"], wb["Sensitivity"]
    criteria = [{"code": cr[f"A{r}"].value, "name": cr[f"B{r}"].value,
                 "weight": float(cr[f"E{r}"].value), "type": cr[f"F{r}"].value} for r in range(5, 11)]
    categories = [(cr[f"A{r}"].value, cr[f"C{r}"].value, cr[f"D{r}"].value) for r in range(15, 19)]
    margin = cr["B20"].value
    names, matrix = {}, {}
    for r in range(5, 10):
        code = da[f"A{r}"].value
        names[code] = da[f"B{r}"].value
        km, units = da[f"D{r}"].value, da[f"F{r}"].value
        fleet_per_km = round_half_up(units / km, 2)  # same as =ROUND(F/D,2) in the Data sheet
        matrix[code] = [da[f"G{r}"].value, da[f"H{r}"].value, da[f"I{r}"].value, da[f"J{r}"].value,
                        fleet_per_km, da[f"L{r}"].value]
    scen = [(se[f"A{r}"].value, se[f"B{r}"].value, se[f"E{r}"].value, se[f"F{r}"].value) for r in range(5, 11)]
    return criteria, categories, margin, names, matrix, scen


def normalise(criteria, matrix):
    """Benefit: x / max(x). Cost: min(x) / x."""
    n = len(criteria)
    col = [[v[j] for v in matrix.values()] for j in range(n)]
    return {a: [min(col[j]) / v[j] if criteria[j]["type"] == "cost" else v[j] / max(col[j]) for j in range(n)]
            for a, v in matrix.items()}


def preference(weights, R):
    return {a: sum(w * r for w, r in zip(weights, row)) for a, row in R.items()}


def score(v):
    return int(round_half_up(v * 100))


def category(s, categories):
    """Highest lower bound that is not above the score."""
    return [c for c in categories if s >= c[0]][-1]


def near_boundary(s, categories, margin):
    return any(abs(s - lower) <= margin for lower, _, _ in categories if lower > 0)


def scenario_weights(base, scen):
    out = []
    for code, desc, k, new_w in scen:
        if code == "S0":
            w = list(base)
        elif code == "S1":
            w = [1 / len(base)] * len(base)
        else:  # change weight k, rescale the others so the total stays 1
            k = int(k) - 1
            w = [wj * (1 - new_w) / (1 - base[k]) for wj in base]
            w[k] = new_w
        out.append((code, desc, w))
    return out


MONTHS = ["Jun", "Jul", "Agu", "Sep", "Okt", "Nov"]
HIST_TOP, HIST_STEP = 14, 9  # first month block and block height in the History sheet


def load_history(path, matrix):
    """Monthly matrices: June-October from the History sheet, November from the Data sheet."""
    hi = load_workbook(path)["History"]
    out = []
    for b in range(5):
        top = HIST_TOP + b * HIST_STEP
        m = {}
        for i, code in enumerate(matrix):
            r = top + 1 + i
            m[code] = [hi[f"{c}{r}"].value for c in "CDEF"] + matrix[code][4:]
        out.append(m)
    out.append(matrix)
    return out


def mulberry32(seed):
    a = seed & 0xFFFFFFFF
    def rnd():
        nonlocal a
        a = (a + 0x6D2B79F5) & 0xFFFFFFFF
        t = a
        t = ((t ^ (t >> 15)) * (t | 1)) & 0xFFFFFFFF
        t ^= (t + (((t ^ (t >> 7)) * (t | 61)) & 0xFFFFFFFF)) & 0xFFFFFFFF
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296
    return rnd


def monte_carlo(R, weights, categories, runs=1000, spread=0.5, seed=2026):
    """Multiply every weight by a random factor in [1-spread, 1+spread], renormalise, re-rank."""
    rnd = mulberry32(seed)
    V0 = preference(weights, R)
    order0 = sorted(V0, key=V0.get, reverse=True)
    cat0 = {a: category(score(V0[a]), categories)[1] for a in V0}
    same_order, same_rank, same_cat = 0, dict.fromkeys(V0, 0), dict.fromkeys(V0, 0)
    for _ in range(runs):
        w = [x * (1 - spread + 2 * spread * rnd()) for x in weights]
        t = sum(w)
        v = preference([x / t for x in w], R)
        order = sorted(v, key=v.get, reverse=True)
        same_order += order == order0
        for a in v:
            same_rank[a] += order.index(a) == order0.index(a)
            same_cat[a] += category(score(v[a]), categories)[1] == cat0[a]
    return same_order, same_rank, same_cat


def check_workbook(path, R, V, sens, hist=None):
    """Compare with the values Excel saved in the workbook (needs a file last saved by Excel)."""
    wb = load_workbook(path, data_only=True)
    no, ra, se = wb["Normalisation"], wb["Ranking"], wb["Sensitivity"]
    codes = list(R)
    if ra["I5"].value is None:
        return None, ["no saved values: open the workbook in Excel and save it, then run again"]
    bad, n = [], 0

    def same(label, got, want, tol=1e-9):
        nonlocal n
        n += 1
        ok = (abs(got - want) <= tol) if isinstance(want, float) else got == want
        if not ok:
            bad.append(f"{label}: workbook {got!r}, script {want!r}")

    for i, a in enumerate(codes):
        for j, col in enumerate("CDEFGH"):
            same(f"Normalisation!{col}{10 + i}", no[f"{col}{10 + i}"].value, R[a][j])
        same(f"Ranking!I{5 + i}", ra[f"I{5 + i}"].value, V[a])
        same(f"Ranking!J{5 + i}", ra[f"J{5 + i}"].value, score(V[a]))
    for s, (code, _, v) in enumerate(sens):
        for i, a in enumerate(codes):
            same(f"Sensitivity!{'GHIJK'[i]}{14 + s}", se[f"{'GHIJK'[i]}{14 + s}"].value, score(v[a]))
    if hist:
        hi = wb["History"]
        for b, Vm in enumerate(hist):
            for i, a in enumerate(codes):
                r = HIST_TOP + b * HIST_STEP + 1 + i
                same(f"History!J{r}", hi[f"J{r}"].value, score(Vm[a]))
    return n, bad


def main():
    criteria, categories, margin, names, matrix, scen = load(WORKBOOK)
    codes = [c["code"] for c in criteria]
    weights = [c["weight"] for c in criteria]
    assert abs(sum(weights) - 1) < 1e-9, "weights must sum to 1"

    R = normalise(criteria, matrix)
    V = preference(weights, R)

    print(f"Source: {WORKBOOK.name}\n")
    print("Normalised matrix and preference values (Table VII)")
    print("Alt  " + "  ".join(f"{c:>5}" for c in codes) + "       V")
    for a in matrix:
        print(f"{a:<4} " + "  ".join(f"{r:5.3f}" for r in R[a]) + f"  {V[a]:.4f}")

    print("\nRanking (Table VIII)")
    for i, a in enumerate(sorted(V, key=V.get, reverse=True), 1):
        s = score(V[a])
        _, label, units = category(s, categories)
        flag = "review" if near_boundary(s, categories, margin) else ""
        print(f"{i}. {a} {names[a]:<24} V={V[a]:.4f}  score={s:>3}  {label:<12} {units:<9} {flag}")

    print("\nSensitivity analysis (Table IX)")
    base_order = sorted(V, key=V.get, reverse=True)
    sens = []
    for code, desc, w in scenario_weights(weights, scen):
        v = preference(w, R)
        sens.append((code, desc, v))
        order = sorted(v, key=v.get, reverse=True)
        moved = [a for a in v if category(score(v[a]), categories)[1] != category(score(V[a]), categories)[1]]
        note = "same order" if order == base_order else "ORDER CHANGES"
        if moved:
            note += "; category changes: " + ", ".join(
                f"{a} {score(v[a])} ({category(score(v[a]), categories)[1]})" for a in moved)
        print(f"{code} {desc:<32} {' > '.join(order)}  {note}")

    print()
    print("Monthly history (score per month)")
    hist = []
    print("Alt  " + "  ".join(f"{m:>4}" for m in MONTHS))
    for m in load_history(WORKBOOK, matrix):
        hist.append(preference(weights, normalise(criteria, m)))
    for a in matrix:
        print(f"{a:<4} " + "  ".join(f"{score(h[a]):>4}" for h in hist))

    runs, spread = 1000, 0.5
    so, sr, sc = monte_carlo(R, weights, categories, runs, spread)
    print()
    print(f"Random-weight simulation ({runs} runs, each weight x [{1 - spread:.1f}, {1 + spread:.1f}], seed 2026)")
    print(f"Same order of all five corridors: {so / runs:.1%}")
    for a in matrix:
        print(f"  {a}: same rank {sr[a] / runs:.1%}, same category {sc[a] / runs:.1%}")

    n, bad = check_workbook(WORKBOOK, R, V, sens, hist)
    print()
    if n is None:
        print("Workbook check skipped:", bad[0])
    elif bad:
        print(f"Workbook check FAILED: {len(bad)} of {n} values differ")
        for b in bad:
            print("  " + b)
        sys.exit(1)
    else:
        print(f"Workbook check passed: all {n} values match the spreadsheet formulas.")


if __name__ == "__main__":
    main()
