#!/usr/bin/env python3
"""
caption.py - lint an Instagram caption and show exactly what the feed shows
before the "... more".

Instagram gives a caption about 125 characters in the feed and hides the rest
behind a tap. Almost every caption that fails, fails there: the hook is in
sentence three, or the first line is a greeting, or the whole thing opens on a
hashtag. This prints the visible window as a box so you can read it the way a
scrolling stranger does, then checks the eight things that are worth checking.

The 125-character cut is an approximation. The real number moves with the
device, the font size and where your line breaks fall, which is exactly why
you want a margin rather than a caption engineered to end at 125. Change it
with --truncate if you want to test a tighter one.

Usage
  python3 caption.py caption.txt
  python3 caption.py caption.txt --keywords "proposal software,client contract"
  pbpaste | python3 caption.py -
  python3 caption.py caption.txt --json
  python3 caption.py legenda.txt --lang pt --keywords "pousada guarapari,praia do morro"
"""

import argparse
import json
import os
import re
import sys
import textwrap

LIMIT = 2200             # Instagram's hard caption limit.
TRUNCATE = 125           # Roughly where the feed cuts to "... more".
HASHTAG_LIMIT = 5        # Instagram's cap per post or reel since 18 Dec 2025,
                         # down from 30. Announced by the @Creators account:
                         # "using fewer (up to 5) more targeted hashtags,
                         # rather than many generic ones, can improve both your
                         # content's performance and people's experience".

HASHTAG_RE = re.compile(r"(?:^|\s)(#\w+)")             # "#férias" is one tag
MENTION_RE = re.compile(r"(?:^|\s)(@[\w.]+)")
LINK_RE = re.compile(r"https?://\S+|\bwww\.\S+|\b[a-z0-9-]+\.(?:com|co|io|net|org|ai|app|br|ar|cl|uy|es)/\S*",
                     re.IGNORECASE)
EMOJI_RE = re.compile(r"[\U0001F300-\U0001FAFF☀-➿←-⇿️]")
CONCRETE_RE = re.compile(r"(?:R\$|US\$|\$|€|£)\s?\d|\b\d[\d,.]*\b|(?<!^)\b[A-ZÀ-ÖØ-Þ][a-zß-öø-ÿ]{2,}\b",
                         re.MULTILINE)

ASKS = {
    "en": [
        (re.compile(r"(?i)\bcomment (?:the word |\")?[A-Z0-9]{2,}\b"), "comment a keyword"),
        (re.compile(r"(?i)\b(?:dm|message) me\b"), "DM me"),
        (re.compile(r"(?i)\bsave (?:this|it)\b"), "save this"),
        (re.compile(r"(?i)\bshare (?:this|it)\b"), "share this"),
        (re.compile(r"(?i)\bfollow (?:me|for)\b"), "follow"),
        (re.compile(r"(?i)\blink in (?:my )?bio\b"), "link in bio"),
        (re.compile(r"(?i)\b(?:swipe|tap) (?:through|left|right|for|to)\b"), "swipe or tap"),
        (re.compile(r"(?i)\btell me\b|\bwhat would you\b|\bwhich one\b"), "answer a question"),
        (re.compile(r"(?i)\bbook (?:now|direct|your|today)\b"), "book"),
    ],
    # The keyword itself is matched case-sensitively: "comenta aqui" is not a
    # keyword ask, "comenta JULHO" is.
    "pt": [
        (re.compile(r"\b(?i:comenta|comente|comentem|escreve|escreva)(?: (?i:a palavra|aqui))? [\"“]?[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9]{2,}\b"), "comentar palavra-chave"),
        (re.compile(r"(?i)\b(?:me chama|chama a gente|chama|manda (?:um )?(?:direct|dm|mensagem))\b(?: (?:no|na|pelo|pela) (?:direct|dm|whats(?:app)?|inbox))?"), "chamar no direct"),
        (re.compile(r"(?i)\b(?:salva|salve|guarda|guarde) (?:esse|este|essa|esta|isso|o post)\b"), "salvar"),
        (re.compile(r"(?i)\b(?:compartilha|compartilhe|envia|envie|manda|mande) (?:esse|este|isso|pra|para) (?:quem|alguém|aquele|aquela|post|vídeo|reels?)?"), "compartilhar"),
        (re.compile(r"(?i)\b(?:siga|segue|sigam) (?:a gente|o perfil|@|pra|para)"), "seguir"),
        (re.compile(r"(?i)\blink na bio\b"), "link na bio"),
        (re.compile(r"(?i)\b(?:arrasta|arraste|desliza|deslize|passa) (?:pro lado|para o lado|pra direita|para a direita)\b"), "arrastar"),
        (re.compile(r"(?i)\bme conta\b|\bconta aqui\b|\bqual (?:você|vc) (?:prefere|escolhe)\b|\bo que (?:você|vc) faria\b"), "responder pergunta"),
        (re.compile(r"(?i)\b(?:reserve|reserva|reservas) (?:já|agora|direto|pelo|pela|no|na)\b"), "reservar"),
    ],
    "es": [
        (re.compile(r"\b(?i:coment[aá]|comenta|escrib[ií]|escribe)(?: (?i:la palabra|ac[aá]))? [\"“]?[A-ZÁÉÍÓÚÑ0-9]{2,}\b"), "comentar palabra clave"),
        (re.compile(r"(?i)\b(?:escribinos|escr[ií]benos|mandanos|m[aá]ndanos|hablanos|h[aá]blanos)\b"), "escribir por DM"),
        (re.compile(r"(?i)\b(?:guard[aá]|guarda) (?:este|esto|esta|el post)\b"), "guardar"),
        (re.compile(r"(?i)\b(?:compart[ií]|comparte|mand[aá]selo|env[ií]aselo|enviale|env[ií]ale)\b"), "compartir"),
        (re.compile(r"(?i)\b(?:seguinos|s[ií]guenos|seguime|s[ií]gueme)\b"), "seguir"),
        (re.compile(r"(?i)\blink en (?:la )?bio\b"), "link en bio"),
        (re.compile(r"(?i)\b(?:desliz[aá]|desliza|pas[aá]) (?:al costado|a la derecha|para ver)\b"), "deslizar"),
        (re.compile(r"(?i)\bcontame\b|\bcu[eé]ntame\b|\bcu[aá]l (?:prefer[ií]s|prefieres|eleg[ií]s|eliges)\b|\bqu[eé] har[ií]as\b"), "responder pregunta"),
        (re.compile(r"(?i)\breserv[aá] (?:ya|ahora|directo|por|en)\b"), "reservar"),
    ],
}

# Tags that describe nothing, plus, for travel, tags so broad that a five-tag
# budget is wasted on them (#praia, #viagem). Five tags should name the place,
# the kind of trip and the audience.
FILLER_TAGS = {
    "en": {"#viral", "#fyp", "#explore", "#explorepage", "#foryou", "#foryoupage",
           "#trending", "#instagood", "#love", "#follow", "#like4like", "#reels",
           "#reelsinstagram", "#viralreels", "#instadaily", "#travel", "#beach", "#trip"},
    "pt": {"#viral", "#fyp", "#explorar", "#explore", "#reels", "#reelsinstagram", "#instagood",
           "#amor", "#sigam", "#sigoevolto", "#curtir", "#like", "#tbt", "#instadaily",
           "#fotododia", "#bomdia", "#boanoite", "#sextou", "#trend", "#viralizou", "#brasil",
           "#viagem", "#viagens", "#turismo", "#praia", "#praias", "#ferias", "#férias",
           "#travel", "#trip", "#verão", "#verao", "#natureza", "#paisagem", "#sol", "#mar"},
    "es": {"#viral", "#fyp", "#parati", "#explorar", "#explore", "#reels", "#instagood",
           "#amor", "#like", "#tbt", "#instadaily", "#viaje", "#viajes", "#turismo", "#playa",
           "#playas", "#vacaciones", "#verano", "#travel", "#trip", "#brasil", "#naturaleza",
           "#paisaje", "#sol", "#mar"},
}

DETECT = {
    "pt": {"não", "você", "vocês", "uma", "também", "são", "muito", "isso", "mais", "do", "da",
           "dos", "das", "no", "na", "em", "pra", "é", "com", "aqui", "seu", "sua", "praia"},
    "es": {"el", "los", "las", "una", "del", "y", "muy", "más", "también", "eso", "hay", "pero",
           "usted", "tú", "vos", "es", "con", "acá", "aquí", "su", "playa"},
    "en": {"the", "and", "you", "is", "are", "this", "that", "with", "for", "of", "to", "it",
           "my", "your", "i"},
}


def detect_lang(text, default="en"):
    low = text.lower()
    toks = re.findall(r"[^\W\d_]+", low)
    scores = {k: sum(1 for t in toks if t in v) for k, v in DETECT.items()}
    scores["pt"] += 2 * sum(low.count(c) for c in "ãõçâêô")
    scores["es"] += 2 * sum(low.count(c) for c in "ñ¿¡")
    best = max(("pt", "es", "en"), key=lambda k: scores[k])
    return best if scores[best] > 0 else default


def resolve_lang(lang, text):
    if lang and lang != "auto":
        return lang
    env = os.environ.get("IG_LANG", "").strip().lower()
    return env if env in ASKS else detect_lang(text)


def visible_window(text, cut):
    """What the feed shows. Instagram cuts mid-word, so this does too."""
    flat = text.strip()
    return flat if len(flat) <= cut else flat[:cut]


def render_box(window, truncated, out=sys.stdout, width=52):
    print("\n  WHAT THE FEED SHOWS", file=out)
    print("  +" + "-" * (width + 2) + "+", file=out)
    lines = []
    for raw in window.split("\n"):
        lines.extend(textwrap.wrap(raw, width) or [""])
    for line in lines[:8]:
        print(f"  | {line:<{width}} |", file=out)
    tail = "... more" if truncated else "(whole caption fits)"
    print("  +" + "-" * (width + 2 - len(tail) - 2) + f" {tail} " + "+", file=out)


def analyse(text, cut=TRUNCATE, keywords=None, lang=None):
    lang = resolve_lang(lang, text)
    text = text.rstrip()
    stripped = text.strip()
    chars = len(stripped)
    lines = [l for l in stripped.split("\n")]
    first_line = lines[0].strip() if lines else ""
    tags = HASHTAG_RE.findall(stripped)
    mentions = MENTION_RE.findall(stripped)
    links = LINK_RE.findall(stripped)
    emoji = EMOJI_RE.findall(stripped)
    window = visible_window(stripped, cut)
    truncated = chars > cut
    asks = [name for pattern, name in ASKS[lang] if pattern.search(stripped)]
    filler = [t for t in tags if t.lower() in FILLER_TAGS[lang]]
    keywords = [k.strip() for k in (keywords or []) if k.strip()]

    checks = []

    def add(name, status, detail):
        checks.append({"check": name, "status": status, "detail": detail})

    add("LENGTH", "FAIL" if chars > LIMIT else "PASS",
        f"{chars} / {LIMIT} characters" + (f", {chars - LIMIT} over the limit"
                                           if chars > LIMIT else ""))

    if not first_line:
        add("FIRST LINE", "FAIL", "the caption opens on a blank line")
    elif first_line.startswith("#") or first_line.startswith("@"):
        add("FIRST LINE", "FAIL",
            "opens on a hashtag or a mention, which is the one position worth a sentence")
    elif len(first_line) > cut:
        add("FIRST LINE", "WARN",
            f"{len(first_line)} characters, so it gets cut at {cut} mid-thought. "
            "Fine if the cut is a cliffhanger, bad if it is a subordinate clause")
    else:
        add("FIRST LINE", "PASS", f"{len(first_line)} characters, lands whole")

    add("HOOK IS CONCRETE", "PASS" if CONCRETE_RE.search(window) else "WARN",
        f"{len(CONCRETE_RE.findall(window))} number(s) or name(s) in the visible window"
        + ("" if CONCRETE_RE.search(window) else " - nothing checkable before the tap"))

    if len(tags) > HASHTAG_LIMIT:
        add("HASHTAGS", "FAIL", f"{len(tags)} tags, over Instagram's cap of {HASHTAG_LIMIT}. "
                                "Tags past the fifth do not count and the block reads as old")
    elif len(tags) == HASHTAG_LIMIT and filler:
        add("HASHTAGS", "WARN", f"{len(tags)} tags, at the cap, and "
                                f"{len(filler)} of them generic. Spend the five on topics")
    elif filler:
        add("HASHTAGS", "WARN", f"{len(tags)} tags, {len(filler)} of them generic "
                                f"({', '.join(filler[:3])}). Those describe nothing")
    else:
        add("HASHTAGS", "PASS", f"{len(tags)} tag(s)" + (f": {' '.join(tags)}" if tags else ""))

    if not tags:
        add("TAG PLACEMENT", "PASS", "no tags to place")
    elif any(re.search(r"(?:^|\s)" + re.escape(t) + r"\b", window) for t in tags):
        add("TAG PLACEMENT", "WARN", "a hashtag is inside the visible window, "
                                     "spending feed space on a label")
    else:
        add("TAG PLACEMENT", "PASS", "tags are below the fold")

    add("LINKS", "WARN" if links else "PASS",
        f"{len(links)} link(s) in the caption, and captions are not clickable. "
        f"Move it to the bio or the DM" if links else "no dead links in the body")

    if len(asks) == 1:
        add("ONE ASK", "PASS", f"one call to action: {asks[0]}")
    elif not asks:
        add("ONE ASK", "WARN", "no call to action. Decide what this post is for")
    else:
        add("ONE ASK", "WARN", f"{len(asks)} asks ({', '.join(asks)}). "
                               "Two asks is the same as none")

    density = len(emoji) * 100 / max(chars, 1)
    add("EMOJI", "WARN" if density > 4 else "PASS",
        f"{len(emoji)} emoji, {density:.1f} per 100 characters"
        + (" - reads as decoration" if density > 4 else ""))

    if keywords:
        low = stripped.lower()
        found = [k for k in keywords if k.lower() in low]
        missing = [k for k in keywords if k.lower() not in low]
        in_window = [k for k in found if k.lower() in window.lower()]
        status = "PASS" if not missing else ("WARN" if found else "FAIL")
        add("SEARCH TERMS", status,
            f"{len(found)}/{len(keywords)} present"
            + (f", {len(in_window)} in the visible window" if found else "")
            + (f". Missing: {', '.join(missing)}" if missing else ""))

    fails = sum(1 for c in checks if c["status"] == "FAIL")
    warns = sum(1 for c in checks if c["status"] == "WARN")
    verdict = "FIX" if fails else ("REVIEW" if warns else "READY")

    return {
        "characters": chars, "limit": LIMIT, "truncate_at": cut,
        "visible": window, "truncated": truncated,
        "first_line_chars": len(first_line),
        "hashtags": tags, "mentions": mentions, "links": links,
        "emoji": len(emoji), "asks": asks,
        "checks": checks, "verdict": verdict, "lang": lang,
    }


def render(a, out=sys.stdout):
    head = (f"CAPTION LINT  ·  {a['characters']} / {a['limit']} chars  ·  "
            f"{len(a['hashtags'])} hashtags  ·  {len(a['asks'])} ask(s)  ·  lang: {a['lang']}")
    print("\n" + head, file=out)
    print("=" * max(len(head), 62), file=out)
    render_box(a["visible"], a["truncated"], out=out)
    print("", file=out)
    for c in a["checks"]:
        print(f"  {c['status']:<5} {c['check']:<17} {c['detail']}", file=out)
    print("-" * max(len(head), 62), file=out)
    print(f"  VERDICT  {a['verdict']}\n", file=out)


def main():
    ap = argparse.ArgumentParser(description="Lint an Instagram caption.")
    ap.add_argument("input", nargs="?", default="-", help="caption file, or - for stdin")
    ap.add_argument("--truncate", type=int, default=TRUNCATE,
                    help=f"characters shown before '... more' (default {TRUNCATE})")
    ap.add_argument("--keywords", default="", help="comma-separated terms you want to be found for")
    ap.add_argument("--lang", default="auto", choices=["auto", "en", "pt", "es"],
                    help="caption language (default: IG_LANG, else a guess)")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    raw = sys.stdin.read() if args.input == "-" else open(args.input, encoding="utf-8").read()
    a = analyse(raw, cut=args.truncate, keywords=args.keywords.split(","), lang=args.lang)
    if args.json:
        print(json.dumps(a, indent=2, ensure_ascii=False))
    else:
        render(a)
    sys.exit(0 if a["verdict"] == "READY" else 1)


if __name__ == "__main__":
    main()
