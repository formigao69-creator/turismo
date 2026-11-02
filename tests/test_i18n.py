#!/usr/bin/env python3
"""Tests for the Portuguese and Spanish adaptation.

Run from the repo root:  python3 -m unittest discover -s tests -v

Two kinds of test. Regression: English must still produce the numbers printed
in README.md. Behaviour: Portuguese and Spanish text must be tokenised,
scored and cleaned the way the English path already was.
"""

import json
import os
import subprocess
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SK = os.path.join(ROOT, "skills")
for sub in ("ig-reel", "ig-caption", "ig-human", "ig-viral"):
    sys.path.insert(0, os.path.join(SK, sub))

import hookscore      # noqa: E402
import beats          # noqa: E402
import caption        # noqa: E402
import detect         # noqa: E402
import humanize       # noqa: E402
import swipe          # noqa: E402

LEX = os.path.join(SK, "ig-human", "slop.json")


def score(hook, lang):
    return hookscore.run(hook, lang)[1]


class EnglishRegression(unittest.TestCase):
    """The README's own examples. If these move, English behaviour changed."""

    def test_readme_hook_ranking(self):
        cases = [
            ("Nobody tells you that your first 30 reels are supposed to flop", 85.6),
            ("I lost $18,000 because of one missing contract.", 81.4),
            ("Stop scrolling if you want to grow on Instagram in 2026 🔥", 54.4),
            ("Hey guys, today I wanted to talk about content strategy", 9.6),
        ]
        for hook, expected in cases:
            self.assertAlmostEqual(round(score(hook, "en"), 1), expected, places=1, msg=hook)

    def test_english_words(self):
        self.assertEqual(hookscore.words("I lost $18,000 today"), ["I", "lost", "$18000", "today"])


class Tokenising(unittest.TestCase):

    def test_accents_are_one_word(self):
        self.assertEqual(hookscore.words("Férias em São Luís"), ["Férias", "em", "São", "Luís"])
        self.assertEqual(detect.words("año único"), ["año", "único"])

    def test_brazilian_thousands(self):
        self.assertIn("1840", hookscore.words("R$ 1.840 por noite"))

    def test_unicode_hashtags(self):
        a = caption.analyse("Teste de legenda.\n\n#férias #maceió", lang="pt")
        self.assertEqual(a["hashtags"], ["#férias", "#maceió"])


class LanguageDetection(unittest.TestCase):

    def test_detects(self):
        self.assertEqual(hookscore.detect_lang("Você não precisa reservar em julho, a praia está lotada"), "pt")
        self.assertEqual(hookscore.detect_lang("Nadie te cuenta que el hotel es más caro en enero"), "es")
        self.assertEqual(hookscore.detect_lang("Nobody tells you the hotel is cheaper in May"), "en")

    def test_explicit_wins(self):
        self.assertEqual(hookscore.resolve_lang("es", "texto em português"), "es")


class HookScorePT(unittest.TestCase):

    def test_greeting_is_weak(self):
        r, overall, verdict, flags = hookscore.run("Oi gente, hoje eu quero falar sobre as férias", "pt")
        self.assertEqual(verdict, "WEAK")
        self.assertTrue(any("Saudação" in f for f in flags))

    def test_specific_beats_generic(self):
        good = score("Ninguém te conta que julho é o mês mais caro de Guarapari", "pt")
        bad = score("Descubra o paraíso escondido que vai transformar suas férias", "pt")
        self.assertGreater(good, 70)
        self.assertGreater(good, bad + 20)

    def test_stop_scrolling_pt(self):
        flags = hookscore.run("Para de rolar, isso aqui é importante", "pt")[3]
        self.assertTrue(any("para de rolar" in f for f in flags))

    def test_spoken_number_and_month_are_concrete(self):
        detail = hookscore.check_specificity("Setembro custa metade de julho", hookscore.CONFIG["pt"])[1]
        self.assertTrue(detail.startswith("3 concrete"), detail)   # setembro, metade, julho


class HookScoreES(unittest.TestCase):

    def test_greeting_is_weak(self):
        r, overall, verdict, flags = hookscore.run("Hola chicos, hoy les quiero hablar de las vacaciones", "es")
        self.assertEqual(verdict, "WEAK")
        self.assertTrue(flags)

    def test_strong_hook(self):
        self.assertGreater(score("Nadie te cuenta que en julio Guarapari cuesta el doble", "es"), 70)


class Beats(unittest.TestCase):

    def test_pt_default_rate_and_loop(self):
        a = beats.analyse("Julho custa o dobro de setembro.\nAnota: setembro custa metade de julho.", lang="pt")
        self.assertEqual(a["wpm"], 155)
        self.assertTrue(any("Loops" in n for n in a["notes"]))

    def test_months_count_as_concrete(self):
        a = beats.analyse("Em setembro a praia está vazia.\nEm outubro também.\nEm novembro mais ainda.", lang="pt")
        self.assertFalse(any("nothing concrete" in n for n in a["notes"]))


class BeatsTTS(unittest.TestCase):

    def test_tts_flags_digits_and_symbols(self):
        a = beats.analyse("Você paga 30% a menos e anda 6 min.\nReserve direto.", lang="pt", tts=True)
        self.assertTrue(any(f.startswith("TTS:") for f in a["beats"][0]["flags"]))
        self.assertFalse(any(f.startswith("TTS:") for f in a["beats"][1]["flags"]))

    def test_tts_off_by_default(self):
        a = beats.analyse("Você paga 30% a menos.", lang="pt")
        self.assertFalse(any("TTS" in f for r in a["beats"] for f in r["flags"]))


class Caption(unittest.TestCase):

    def test_keyword_ask_pt(self):
        a = caption.analyse("Julho custa o dobro.\nComenta SETEMBRO que a gente manda as datas.", lang="pt")
        self.assertEqual(a["asks"], ["comentar palavra-chave"])

    def test_lowercase_comment_is_not_keyword(self):
        a = caption.analyse("Julho custa o dobro.\nComenta aqui o que achou.", lang="pt")
        self.assertNotIn("comentar palavra-chave", a["asks"])

    def test_generic_travel_tags(self):
        a = caption.analyse("Texto.\n\n#guarapari #praiadomorro #praia #viagem", lang="pt")
        status = {c["check"]: c["status"] for c in a["checks"]}
        self.assertEqual(status["HASHTAGS"], "WARN")

    def test_keyword_ask_es(self):
        a = caption.analyse("Julio cuesta el doble.\nComentá SEPTIEMBRE y te mandamos las fechas.", lang="es")
        self.assertEqual(a["asks"], ["comentar palabra clave"])


BROCHURE_PT = ("Descubra o paraíso escondido do Espírito Santo — uma experiência única e inesquecível! ✨\n"
               "Não é só uma viagem, é uma jornada de descanso. Praias deslumbrantes, gastronomia incrível "
               "e hospitalidade calorosa.\nAqui você vai recarregar as energias com quem você ama.\n"
               "Siga para mais dicas! Marque quem precisa ver isso 👇\n")

PLAIN_PT = ("Pagamos R$ 1.840 por três noites em julho. Em setembro, o mesmo quarto saiu por R$ 690. "
            "A gente não mudou nada, só a data. Tá vendo a piscina? Às 9h ela tá vazia. "
            "Comenta SETEMBRO que eu te mando a tabela com as tarifas e as datas da Praia do Morro.\n")


class Humanizer(unittest.TestCase):

    def test_pt_brochure_is_flagged(self):
        lex = detect.load_lexicon(LEX, "pt")
        self.assertEqual(detect.run(BROCHURE_PT, lex)[2], "FLAGGED")

    def test_pt_plain_scores_higher(self):
        lex = detect.load_lexicon(LEX, "pt")
        self.assertGreater(detect.run(PLAIN_PT, lex)[1], detect.run(BROCHURE_PT, lex)[1] + 25)

    def test_pt_cleanup(self):
        lex = humanize.load_lexicon(LEX, "pt")
        clean, report = humanize.humanize(BROCHURE_PT, lex)
        self.assertNotIn("—", clean)
        self.assertNotIn("Siga para mais", clean)
        self.assertNotIn("paraíso escondido", clean)
        # Adjectives are reported, never deleted: deleting breaks the sentence.
        self.assertIn("deslumbrantes", clean)
        self.assertIn("deslumbrantes", [h["find"] for h in report["flagged_words"]])
        self.assertIn("\"Não é só X, é Y\"", [s["name"] for s in report["structures"]])

    def test_es_cleanup(self):
        text = "Descubrí el paraíso escondido. Seguinos para más tips! Etiquetá a alguien que necesita esto.\n"
        lex = humanize.load_lexicon(LEX, "es")
        clean, report = humanize.humanize(text, lex)
        self.assertNotIn("paraíso escondido", clean)
        self.assertNotIn("Seguinos", clean)
        self.assertIn("Etiquetá a alguien que necesita esto", clean)   # flagged, not mangled
        self.assertNotIn("tips!", clean)

    def test_lexicons_compile(self):
        for lang in ("pt", "es"):
            lex = detect.load_lexicon(LEX, lang)
            self.assertTrue(lex["invisible"])          # inherited from slop.json
            for s in lex["structures"]:
                __import__("re").compile(s["regex"])


class Swipe(unittest.TestCase):

    def test_pt_formulas(self):
        f = swipe.load_formulas(swipe.HOOKS, "pt")
        self.assertEqual(len(f), 26)
        self.assertEqual(swipe.classify("Ninguém te conta que julho é caro", f)[1], "Ninguém Te Conta")
        self.assertEqual(swipe.classify("Pagamos R$ 1.840 por 3 noites", f)[1], "O Recibo")

    def test_es_formulas(self):
        f = swipe.load_formulas(swipe.HOOKS, "es")
        self.assertEqual(swipe.classify("Nadie te cuenta que julio es caro", f)[1], "Nobody Tells You")


class CLI(unittest.TestCase):
    """The scripts still run as commands, with --lang."""

    def run_cli(self, script, *args, stdin=""):
        return subprocess.run([sys.executable, script, *args], input=stdin, capture_output=True,
                              text=True, cwd=ROOT)

    def test_cli_lang_flag(self):
        r = self.run_cli(os.path.join(SK, "ig-reel", "hookscore.py"), "--hook", "Oi gente, tudo bem?",
                         "--lang", "pt", "--json")
        self.assertEqual(json.loads(r.stdout)["lang"], "pt")
        r = self.run_cli(os.path.join(SK, "ig-human", "detect.py"), "-", "--lang", "es", "--json",
                         stdin="Hola, esto es una prueba corta.")
        self.assertEqual(json.loads(r.stdout)["lang"], "es")


if __name__ == "__main__":
    unittest.main()
