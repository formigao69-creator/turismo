#!/usr/bin/env python3
"""
hookscore.py - score the first line of a Reel on the five things strong hooks
have in common, and rank a batch of them against each other.

What this is:  five local heuristics, computed on your machine from the text
alone. They measure properties that hooks which hold attention tend to share -
a length you can say in under three seconds, a concrete marker, something at stake,
the payload at the front rather than the back, and a viewer to aim it at.

What this is NOT:  a view predictor. It was tested against 74 real short-form
hooks, transcribed from the first three seconds of the top eight and bottom
eight performers on five channels. Separating a real hook from a deliberately
bad one it does well: AUC 0.83, and 9 of 10 written-to-be-bad hooks scored
below the real median. Separating a good creator's hits from that same
creator's misses it barely does at all: AUC 0.56, where 0.50 is a coin flip.

So use it for what it measured well. It catches greetings, preambles, hooks
with nothing concrete in them and hooks that take five seconds to say. It will
not tell you which of two decent hooks will travel, and nothing that reads text
can, because that is decided by your face, your edit, your audio and who
Instagram shows it to. Trust the retention graph over this script.

Each check returns 0 to 100. Higher is better.

Usage
  python3 hookscore.py hooks.txt              # one hook per line, ranked
  python3 hookscore.py --hook "I lost $18,000 on one missing contract."
  pbpaste | python3 hookscore.py -
  python3 hookscore.py hooks.txt --json
  python3 hookscore.py hooks.txt --lang pt     # Portuguese (also: es, en, auto)

Language: the word lists live in lang.json (en, pt, es). Pick one with --lang,
or set IG_LANG=pt in the environment. Without either, the script guesses from
the text, which is reliable on a batch and shaky on one short line.
"""

import argparse
import json
import os
import re
import statistics
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
LANG_FILE = os.path.join(HERE, "lang.json")
LANGS = ("en", "pt", "es")

# Unicode-aware: "férias", "São Luís" and "año" are one word each.
WORD_RE = re.compile(r"[\w$%'’-]+")
CURRENCY = r"(?:R\$|US\$|U\$|AR\$|\$|€|£)"
NUMBER_RE = re.compile(
    CURRENCY + r"\s?\d[\d.,]*"                         # money: $18,000  R$ 1.840,00
    r"|\b\d[\d.,]*\s?"                                # a figure, with or without a unit
    r"(?:%|k\b|x\b|mil\b|h\b|hrs?\b|hours?\b|horas?\b|mins?\b|minutes?\b|minutos?\b"
    r"|days?\b|dias?\b|días?\b|nights?\b|noites?\b|noches?\b|weeks?\b|semanas?\b"
    r"|months?\b|meses\b|mês\b|mes\b|years?\b|anos?\b|años?\b|km\b|m\b)?",
    re.IGNORECASE)
PRICE_RE = re.compile(CURRENCY + r"\s?\d")
UPPER = "A-ZÀ-ÖØ-Þ"
LOWER = "a-zß-öø-ÿ"
PROPER_RE = re.compile(r"(?<!^)\b[" + UPPER + r"][" + LOWER + r"]{2,}\b")
HASHTAG_RE = re.compile(r"(?:^|\s)#\w+")
EMOJI_RE = re.compile(r"[\U0001F300-\U0001FAFF☀-➿]")

COMMON_DEALBREAKERS = {
    "en": [
        (HASHTAG_RE, "Hashtag in the hook. Hashtags belong at the bottom of the caption, if anywhere."),
        (EMOJI_RE, "Emoji in the hook. On-screen text at hook size has room for words or for an emoji, not both."),
    ],
    "pt": [
        (HASHTAG_RE, "Hashtag no hook. Hashtag vai no fim da legenda, se for."),
        (EMOJI_RE, "Emoji no hook. Texto de tela no tamanho do hook tem espaço para palavras ou para emoji, não os dois."),
    ],
    "es": [
        (HASHTAG_RE, "Hashtag en el hook. Los hashtags van al final del caption, si van."),
        (EMOJI_RE, "Emoji en el hook. El texto en pantalla a tamaño hook tiene lugar para palabras o para un emoji, no los dos."),
    ],
}


def _load_tables(path=LANG_FILE):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


TABLES = _load_tables()


def _build(lang):
    t = TABLES[lang]
    return {
        "lang": lang,
        "wpm": float(t.get("wpm", 165)),
        "spoken_numbers": set(t["spoken_numbers"]),
        "money_words": set(t["money_words"]),
        "months": set(t.get("months", [])),
        "stakes": set(t["stakes"]),
        "weak_openers": list(t["weak_openers"]),
        "imperatives": set(t["imperatives"]),
        "address": re.compile(t["address_regex"], re.IGNORECASE),
        "first_person": re.compile(t["first_person_regex"], re.IGNORECASE),
        "dealbreakers": [(re.compile(d["regex"]), d["msg"]) for d in t["dealbreakers"]]
                        + COMMON_DEALBREAKERS.get(lang, COMMON_DEALBREAKERS["en"]),
    }


CONFIG = {lang: _build(lang) for lang in LANGS if lang in TABLES}


def detect_lang(text, default="en"):
    """Guess en / pt / es from function words and accents. Good on a caption,
    shaky on a single six-word hook, which is why --lang exists."""
    d = TABLES["detect"]
    low = text.lower()
    toks = re.findall(r"[^\W\d_]+", low)
    scores = {lang: sum(1 for w in toks if w in set(d[lang])) for lang in LANGS}
    scores["pt"] += 2 * sum(low.count(c) for c in d["chars_pt"])
    scores["es"] += 2 * sum(low.count(c) for c in d["chars_es"])
    best = max(LANGS, key=lambda k: scores[k])
    return best if scores[best] > 0 else default


def resolve_lang(lang, text):
    """Explicit --lang wins, then the IG_LANG environment variable, then a guess."""
    if lang and lang != "auto":
        return lang
    env = os.environ.get("IG_LANG", "").strip().lower()
    if env in CONFIG:
        return env
    return detect_lang(text)


def clamp(n):
    return max(0.0, min(100.0, n))


def words(text):
    # "$18,000" and "R$ 1.840" are one number when spoken, so one word here too.
    return WORD_RE.findall(re.sub(r"(?<=\d)[.,](?=\d{3}\b)", "", text))


def check_length(text, cfg):
    """A hook has to land before the thumb moves. Roughly two seconds."""
    w = words(text)
    n = len(w)
    secs = n / (cfg["wpm"] / 60.0)       # spoken, at the language's default rate
    chars = len(text.strip())
    if 5 <= n <= 12:
        score = 100.0
    elif n < 5:
        score = clamp(100 - (5 - n) * 20)
    else:
        score = clamp(100 - (n - 12) * 11)
    if chars > 60:                       # two lines of big on-screen text
        score -= 12
    return clamp(score), f"{n} words, {chars} chars, ~{secs:.1f}s spoken (want 5-12 words)"


def check_specificity(text, cfg):
    """One concrete thing beats three abstract ones."""
    nums = [n.strip() for n in NUMBER_RE.findall(text) if n.strip()]
    propers = set(PROPER_RE.findall(text))
    low = [w.lower().strip("'’") for w in words(text)]
    spoken = [w for w in low if w in cfg["spoken_numbers"] or w in cfg["money_words"]
              or w in cfg["months"]]
    hits = len(nums) + len(propers) + len(spoken)
    score = 15.0 if hits == 0 else clamp(45 + hits * 30)
    found = ", ".join(nums[:2] + sorted(propers)[:2] + spoken[:2])
    return score, (f"{hits} concrete marker(s)" + (f": {found}" if found else
                   " - no number, no name, nothing checkable"))


def check_stakes(text, cfg):
    """Tension, cost, negation. Something the viewer might lose."""
    w = [x.lower().strip("'’") for x in words(text)]
    hits = [x for x in w if x in cfg["stakes"]]
    markers = sorted(set(hits))
    if PRICE_RE.search(text):
        markers.append("a price")
    n = len(markers)
    score = {0: 20.0, 1: 70.0}.get(n, 100.0)
    detail = f"{n} tension marker(s)" + (f": {', '.join(markers[:4])}" if markers else
                                         " - nothing is at stake in this line")
    return clamp(score), detail


def check_frontload(text, cfg):
    """The interesting word cannot be in position nine."""
    w = words(text)
    if not w:
        return 0.0, "empty"
    low = [x.lower().strip("'’") for x in w]
    opener = " ".join(low[:3])
    penalty = 0
    hit_opener = None
    for weak in cfg["weak_openers"]:
        if opener == weak or opener.startswith(weak + " ") or low[0] == weak:
            penalty, hit_opener = 30, weak
            break
    payload = None
    for i, token in enumerate(low):
        if (token in cfg["stakes"] or token in cfg["spoken_numbers"] or token in cfg["money_words"]
                or NUMBER_RE.match(w[i]) or (i and PROPER_RE.match(w[i]))):
            payload = i
            break
    if payload is None:
        base = 30.0
        where = "no payload word anywhere in the line"
    elif payload <= 3:
        base = 100.0
        where = f"payload at word {payload + 1}"
    elif payload <= 6:
        base = 70.0
        where = f"payload at word {payload + 1}, could move forward"
    else:
        base = 40.0
        where = f"payload at word {payload + 1}, too late"
    detail = where + (f"; weak opener \"{hit_opener}\"" if hit_opener else "")
    return clamp(base - penalty), detail


def check_address(text, cfg):
    """Aimed at one viewer, or floating in the air."""
    low = text.lower()
    w = [x.lower().strip("'’") for x in words(text)]
    if cfg["address"].search(low):
        return 100.0, "speaks to the viewer"
    if w and w[0] in cfg["imperatives"]:
        return 90.0, f"imperative opener (\"{w[0]}\")"
    if cfg["first_person"].search(low):
        return 70.0, "first person, no viewer named"
    return 35.0, "third person, nobody in the room"


CHECKS = ["LENGTH", "SPECIFICITY", "STAKES", "FRONTLOAD", "ADDRESS"]


def run(text, lang=None):
    cfg = CONFIG[resolve_lang(lang, text)]
    results = {
        "LENGTH": check_length(text, cfg),
        "SPECIFICITY": check_specificity(text, cfg),
        "STAKES": check_stakes(text, cfg),
        "FRONTLOAD": check_frontload(text, cfg),
        "ADDRESS": check_address(text, cfg),
    }
    flags = [msg for pattern, msg in cfg["dealbreakers"] if pattern.search(text)]
    scores = [results[c][0] for c in CHECKS]
    # The weakest property caps the hook, same logic as detect.py: one bad
    # property is enough for the thumb to keep moving.
    overall = statistics.mean(scores) * 0.6 + min(scores) * 0.4 - len(flags) * 15
    overall = clamp(overall)
    verdict = "STRONG" if overall >= 70 and min(scores) >= 55 and not flags else (
        "OK" if overall >= 50 else "WEAK")
    return results, overall, verdict, flags


def bar(score, width=24):
    filled = round(score / 100 * width)
    return "#" * filled + "." * (width - filled)


def render_one(text, results, overall, verdict, flags, out=sys.stdout):
    print("\nHOOK SCORE", file=out)
    print("=" * 62, file=out)
    print(f"  \"{text.strip()}\"\n", file=out)
    for name in CHECKS:
        score, detail = results[name]
        print(f"  {name:<13} {bar(score)} {score:5.1f}", file=out)
        print(f"  {'':<13} {detail}", file=out)
    print("-" * 62, file=out)
    print(f"  {'HOOK SCORE':<13} {bar(overall)} {overall:5.1f}   {verdict}", file=out)
    for f in flags:
        print(f"\n  DEALBREAKER  {f}", file=out)
    if verdict != "STRONG":
        weakest = min(CHECKS, key=lambda c: results[c][0])
        print(f"\n  Weakest property: {weakest}. Fix that one and re-run.", file=out)
    print("", file=out)


def render_table(rows, out=sys.stdout):
    print("\nHOOK RANKING\n" + "=" * 78, file=out)
    for i, r in enumerate(rows, 1):
        mark = "->" if i == 1 else "  "
        hook = r["hook"] if len(r["hook"]) <= 62 else r["hook"][:59] + "..."
        print(f"{mark} {r['score']:5.1f} {r['verdict']:<7} {hook}", file=out)
        print(f"        weakest: {r['weakest']} ({r['checks'][r['weakest']]['score']:.0f})", file=out)
        for f in r["flags"]:
            print(f"        dealbreaker: {f}", file=out)
    print("\nShoot the top one. If the top one is under 50, none of these are the hook.\n",
          file=out)


def main():
    ap = argparse.ArgumentParser(description="Score a Reel hook on five properties.")
    ap.add_argument("input", nargs="?", default="-", help="file with one hook per line, or -")
    ap.add_argument("--hook", help="score a single hook given on the command line")
    ap.add_argument("--lang", default="auto", choices=["auto", "en", "pt", "es"],
                    help="language of the hooks (default: IG_LANG, else a guess)")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    if args.hook:
        lines = [args.hook]
    else:
        raw = sys.stdin.read() if args.input == "-" else open(args.input, encoding="utf-8").read()
        lines = [l.strip() for l in raw.splitlines() if l.strip()]
    if not lines:
        print("nothing to score", file=sys.stderr)
        sys.exit(2)

    # One language for the whole batch: a guess on the joined text beats a
    # guess on each six-word line.
    lang = resolve_lang(args.lang, " ".join(lines))
    payload = []
    for line in lines:
        results, overall, verdict, flags = run(line, lang)
        payload.append({
            "hook": line,
            "checks": {k: {"score": round(v[0], 1), "detail": v[1]} for k, v in results.items()},
            "weakest": min(CHECKS, key=lambda c: results[c][0]),
            "flags": flags,
            "score": round(overall, 1),
            "verdict": verdict,
            "lang": lang,
        })

    if args.json:
        print(json.dumps(payload if len(payload) > 1 else payload[0], indent=2, ensure_ascii=False))
        return

    if len(payload) == 1:
        results, overall, verdict, flags = run(lines[0], lang)
        render_one(lines[0], results, overall, verdict, flags)
    else:
        render_table(sorted(payload, key=lambda r: -r["score"]))

    sys.exit(0 if max(p["score"] for p in payload) >= 70 else 1)


if __name__ == "__main__":
    main()
