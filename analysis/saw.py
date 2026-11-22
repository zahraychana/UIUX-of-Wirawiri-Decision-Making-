"""Simple Additive Weighting (SAW) for the WiraWiri fleet-priority decision.

Reproduces Tables VI-IX of the report: decision matrix, normalised matrix,
preference values, ranking with need categories, and the weight-sensitivity
analysis. Standard library only.

    python analysis/saw.py

Results are printed and written to analysis/results/*.csv.
"""

import csv
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA = HERE / "data"
RESULTS = HERE / "results"

# Need-score categories, as configured on the Pengaturan (Settings) screen.
CATEGORIES = [  # (lower bound of score, label, proposed extra units)
    (80, "Sangat perlu", "+2 to +4"),
    (72, "Perlu", "+1"),
    (55, "Pantau", "0"),
    (0, "Belum perlu", "0"),
]
# Scores within this many points of a category boundary are flagged for review.
BORDERLINE_MARGIN = 3


def load():
    with open(DATA / "criteria.csv", newline="", encoding="utf-8") as f:
        criteria = list(csv.DictReader(f))
    for c in criteria:
        c["weight"] = float(c["weight"])
    with open(DATA / "corridors.csv", newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    cols = [k for k in rows[0] if k[:2] in {c["code"] for c in criteria}]
    alternatives = {r["code"]: r["name"] for r in rows}
    matrix = {r["code"]: [float(r[k]) for k in cols] for r in rows}
    return criteria, alternatives, matrix


def normalise(criteria, matrix):
    """Benefit: x / max(x). Cost: min(x) / x."""
    n = len(criteria)
    col = [[v[j] for v in matrix.values()] for j in range(n)]
    out = {}
    for a, values in matrix.items():
        out[a] = [
            min(col[j]) / values[j] if criteria[j]["type"] == "cost" else values[j] / max(col[j])
            for j in range(n)
        ]
    return out


def preference(weights, normalised):
    return {a: sum(w * r for w, r in zip(weights, row)) for a, row in normalised.items()}


def score(v):
    """Preference value shown in the UI as a 0-100 need score (half-up rounding)."""
    return int(Decimal(str(v * 100)).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def category(s):
    for lower, label, units in CATEGORIES:
        if s >= lower:
            return label, units
    raise ValueError(s)


def near_boundary(s):
    bounds = [lower for lower, _, _ in CATEGORIES if lower > 0]
    return any(abs(s - b) <= BORDERLINE_MARGIN for b in bounds)


def rescale(weights, k, new_wk):
    """Change weight k and rescale the others proportionally so they still sum to 1."""
    old = weights[k]
    w = [wj * (1 - new_wk) / (1 - old) for wj in weights]
    w[k] = new_wk
    return w


def scenarios(weights):
    n = len(weights)
    return [
        ("S0", "Base weights", weights),
        ("S1", "Equal weights (1/6)", [1 / n] * n),
        ("S2", "C1 raised to 0.35", rescale(weights, 0, 0.35)),
        ("S3", "C3 raised to 0.30", rescale(weights, 2, 0.30)),
        ("S4", "C4 removed (0)", rescale(weights, 3, 0.0)),
        ("S5", "C5 raised to 0.20", rescale(weights, 4, 0.20)),
    ]


def write_csv(name, header, rows):
    RESULTS.mkdir(exist_ok=True)
    with open(RESULTS / name, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)


def main():
    criteria, names, matrix = load()
    codes = [c["code"] for c in criteria]
    weights = [c["weight"] for c in criteria]
    assert abs(sum(weights) - 1) < 1e-9, "weights must sum to 1"

    R = normalise(criteria, matrix)
    V = preference(weights, R)
    ranking = sorted(V, key=V.get, reverse=True)

    print("Normalised matrix and preference values (Table VII)")
    print("Alt  " + "  ".join(f"{c:>5}" for c in codes) + "       V")
    for a in matrix:
        print(f"{a:<4} " + "  ".join(f"{r:5.3f}" for r in R[a]) + f"  {V[a]:.4f}")

    print("\nRanking (Table VIII)")
    rank_rows = []
    for i, a in enumerate(ranking, 1):
        s = score(V[a])
        label, units = category(s)
        flag = "review" if near_boundary(s) else ""
        rank_rows.append([i, a, names[a], f"{V[a]:.4f}", s, label, units, flag])
        print(f"{i}. {a} {names[a]:<24} V={V[a]:.4f}  score={s:>3}  {label:<12} {flag}")

    print("\nSensitivity analysis (Table IX)")
    sens_rows = []
    for code, label, w in scenarios(weights):
        v = preference(w, R)
        order = sorted(v, key=v.get, reverse=True)
        cats = {a: category(score(v[a]))[0] for a in v}
        gap_3_4 = v[order[2]] - v[order[3]]
        sens_rows.append([code, label, " > ".join(order), f"{v['A4']:.4f}",
                          score(v["A3"]), cats["A3"], score(v["A2"]), cats["A2"], f"{gap_3_4:.4f}"])
        print(f"{code} {label:<20} {' > '.join(order)}  V(A4)={v['A4']:.4f}  "
              f"A3={score(v['A3'])} ({cats['A3']})  A2={score(v['A2'])} ({cats['A2']})  gap 3rd-4th={gap_3_4:.4f}")

    write_csv("normalised.csv", ["code"] + codes + ["V"],
              [[a] + [f"{r:.4f}" for r in R[a]] + [f"{V[a]:.4f}"] for a in matrix])
    write_csv("ranking.csv", ["rank", "code", "corridor", "V", "score", "category", "proposed_units", "flag"], rank_rows)
    write_csv("sensitivity.csv", ["scenario", "description", "ranking", "V_A4", "score_A3", "category_A3",
                                  "score_A2", "category_A2", "gap_rank3_rank4"], sens_rows)
    print(f"\nCSV files written to {RESULTS}")


if __name__ == "__main__":
    main()
