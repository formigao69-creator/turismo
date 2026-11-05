---
name: ig-plan
description: >-
  Build the week on Instagram - what to post, which format, when, and who to
  engage with. Use when the user says "plan my week", "what should I post",
  "content calendar", "I have nothing to post about", or wants a posting
  schedule and an engagement list.
  Also triggers in Portuguese ("planeja minha semana", "o que eu posto",
  "calendário de conteúdo", "não sei o que postar") and Spanish ("planificá mi
  semana", "qué publico", "calendario de contenido").
---

# ig-plan

The control room. Everything else in this pack executes; this decides what gets
executed. Run it once a week, on the same day.

## Idioma (PT-BR e espanhol)

Esta cópia foi adaptada para português do Brasil e espanhol. As regras abaixo
valem por cima do resto deste arquivo.

- Escreva no idioma do público do post. Sem indicação, PT-BR. Em espanhol, use
  a variante definida em `voice.md` (seção Idiomas).
- Não traduza o texto em PT palavra por palavra para ES. Reescreva o hook no
  idioma: fórmula, número falado e ritmo mudam.
- Nunca use travessão (—). Use vírgula, ponto ou dois-pontos.
- Moeda e datas no padrão do idioma: R$ 1.840, 12/07, 12 de julho / 12 de julio.
  Nunca invente câmbio; se o post em ES precisar de valor em pesos ou dólares,
  peça a cotação ao usuário.

## Input

If `~/.claude/instagram/voice.md`, `swipe.md` and `log.md` exist, read them.
The swipe file is the user's own evidence from `/ig-viral` about which formulas
are landing in their niche right now, and it outranks anything in this file.
The log stops the plan repeating a theme from the last fortnight.

If they do not exist, ask for four things and write them down:

1. What the user sells, and to whom.
2. The three or four themes they want to be known for.
3. What actually happened this week: a client call, a number, a mistake, a
   thing they built, an argument they had. This is where posts come from.
4. Ten accounts worth being visible to.

## Objetivo de cada post

Adaptado de [sergebulaev/instagram-skills](https://github.com/sergebulaev/instagram-skills)
(MIT; ver `THIRD_PARTY_NOTICES.md`).

Cada post tem **um** objetivo, e o pedido final serve a ele:

| Objetivo | O que conta | Formato que rende |
| --- | --- | --- |
| **Envios** | mandar para alguém no direct, repostar no story | verdade com que a pessoa se identifica, "manda pra quem..." |
| **Salvamentos** | guardar para depois | guia, lista, roteiro, antes e depois |
| **Comentários** | conversa, palavra-chave | pergunta real, palavra-chave com motivo |
| **Seguidores** | visita ao perfil que vira follow | prova (avaliações, bastidor sem rosto) |

- **Curtida não é meta.** Planeje por envios e salvamentos.
- **Na semana, pelo menos 1 post para salvar e 1 para enviar.** Se todos os
  posts terminam no mesmo pedido de comentário, o público cansa, e pedido de
  comentário repetido pode ser lido como isca.
- **Primeira hora:** responda todo comentário logo depois de publicar.
- **Repost no story** no mesmo dia: é o jeito mais simples de gerar envio.
- **Hashtags:** use `/ig-hashtag`. Conjunto diferente a cada post.

## What to post

Four to five posts a week, and at least three of them Reels. Reels are the only
format on Instagram that reliably reaches people who do not follow the account.
Carousels go deep with the people who already do. Stories are daily and are
planned separately.

Mix across the week, never two of the same type back to back:

| type | share | job |
| --- | --- | --- |
| **Proof** | 1 per week | something that happened, with a number. Reel. |
| **Teach** | 1 to 2 per week | one thing the viewer can do today. Reel or carousel. |
| **Opinion** | 1 per week | a position that could lose you followers. Reel. |
| **Story** | 1 per fortnight | a scene with a cost. Reel. |
| **Offer** | 1 per fortnight | what you sell, said plainly, no apology. Carousel or stories. |

For each slot give: the theme, the specific angle from what actually happened
this week, the format, and the hook formula number from `ig-reel/hooks.json`.
Not a topic, an angle. "AI" is not a plan. "The proposal we lost because the
draft had an em dash in it" is a Reel.

## When to post

Post when the user's audience is awake and not at work. For most consumer
audiences that is early evening local time; for a business audience, early
morning.

But say this plainly: **the hour matters far less than the first two seconds.**
Instagram will keep showing a Reel for days if it performs, and will bury a
well-timed one that does not. If the user is optimising posting times before
their hooks work, they are polishing the wrong thing, and you should say so.

Anchor times to the audience's timezone, not the user's, if those differ.

## The engagement round, which is not optional

20 minutes a day, before posting, not after. Build a list of 10:

- **5 reach** - accounts with an audience the user wants, where a good comment
  gets seen. Comment early, before the thread is 200 deep.
- **3 peers** - same size, same field. This is the group that reciprocates.
- **2 buyers** - people who could actually buy. Comment for weeks before any
  DM, and never pitch in a comment.

Hand the list to `/ig-comment`.

## Output

```
WEEK OF SEP 15

MON  engage only  (20 min, list below)
TUE  7:30pm  REEL      PROOF    #5  Time Collapse   - 5hr proposal to 20 min
WED  stories only + engage
THU  7:00pm  CAROUSEL  TEACH    Job B caption       - the 4-slide clause breakdown
FRI  7:30pm  REEL      OPINION  #2  Negative Command - stop doing discovery calls
SAT  -
SUN  6:00pm  REEL      STORY    #21 Mid-Sentence    - the refund email

STORIES  every day, 3 to 5 frames, question box on Thursday.

ENGAGE  (5 reach / 3 peers / 2 buyers)
  ...

Say "write Tuesday" and I will draft it.
```

Write the plan to `~/.claude/instagram/plan.md` so the other skills can read
it. Nothing is scheduled or posted anywhere. This is a plan and the user runs
it.
