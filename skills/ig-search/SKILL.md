---
name: ig-search
description: >-
  Make Instagram posts and the profile findable in Instagram search: collect the
  phrases people actually type, map each one to the spots Instagram reads
  (first caption line, on-screen text, spoken first line, alt text, Name field,
  bio, hashtag form) and rewrite what is missing. Use when the user asks about
  Instagram SEO, keywords for Reels, why posts are not found in search, or how
  to fill the profile name and bio.
  Also triggers in Portuguese ("SEO no Instagram", "palavra-chave pro reels",
  "como aparecer na busca", "o que pôr no nome do perfil") and Spanish ("SEO en
  Instagram", "cómo aparecer en la búsqueda").
---

# ig-search

Adaptado de `social-search-optimizer`, do pacote
[Insightful-Pipe/social-media-skills](https://github.com/Insightful-Pipe/social-media-skills)
(MIT, InsightfulPipe; aviso em `THIRD_PARTY_NOTICES.md`). Mudanças: só
Instagram, PT-BR e espanhol, negócio local, sem conector pago (tudo por dados
colados pelo usuário).

## Idioma (PT-BR e espanhol)

- A frase de busca é a que o público digita, no idioma dele. Argentino busca
  "posada en guarapari", não "pousada em guarapari".
- Nunca use travessão (—).

## Antes de começar

1. **Do que é a conta e onde fica.** Negócio local sempre leva o lugar.
2. **De 3 a 8 assuntos-semente** (ex.: pousada em guarapari, praia do morro,
   praia da cerca, morro da pescaria).
3. **Sugestões da busca do Instagram.** Não existe dado público de busca do
   Instagram, então peça ao usuário: digitar cada semente na busca do app e
   copiar as sugestões que aparecem. É a melhor prova do que as pessoas
   digitam. Sem isso, diga que a lista é **estimativa**.
4. **Para a auditoria:** legenda, data e visualizações de cada post dos
   últimos 90 dias (Insights ou exportação do Meta Business Suite).

## Passo 1: a lista de frases

- Junte sementes e sugestões coladas, em minúsculas, sem repetição.
- **Faixa A:** apareceu na sugestão da busca. **Faixa B:** só semente.
- Agrupe por assunto. A frase principal de cada assunto vai em todos os lugares
  abaixo; as outras, uma por post. **Nunca empilhe frases sem relação na mesma
  legenda.**

## Passo 2: onde cada frase vai

| Lugar | Regra |
| --- | --- |
| Primeira linha da legenda | a frase antes da primeira quebra de linha |
| Texto de tela do Reels e capa do carrossel | a frase em 6 palavras ou menos |
| Primeira fala do Reels | dita em voz alta; legenda automática ligada |
| Hashtag | 1 tag com a frase junta (#pousadaemguarapari), dentro do conjunto do `/ig-hashtag` |
| Campo Nome do perfil | é pesquisável separado do @; leva a frase principal (limite curto: confira no app) |
| Bio | 1 ou 2 frases da faixa A e o lugar (até 150 caracteres) |
| Texto alternativo | em foto e carrossel (Configurações avançadas), descrevendo a imagem com a frase |

Palavra-chave vai na legenda, não nos comentários.

## Passo 3: auditoria dos posts

Só posts com mais de 7 dias e até 90 dias. Para cada um: a primeira linha tem
frase? Compare as visualizações com a **mediana da própria conta**:

- **Acima da mediana e sem frase:** primeira correção. O tema já atrai, e a
  busca não acha. Reescreva a primeira linha (o Instagram deixa editar a
  legenda de post publicado).
- **Com frase e abaixo da mediana:** confira texto de tela e primeira fala.
- **Com frase e acima:** manter o padrão.

## Saída

1. Lista de frases (faixa, frase, onde apareceu).
2. Mapa de lugares para as 2 frases principais.
3. Perfil: Nome, bio e texto alternativo, com a correção.
4. Até 5 posts a corrigir, com a nova primeira linha.
5. O que ficou desconhecido e por quê.

## Regras

- Frase com fonte, ou marcada como estimativa.
- Nunca publica, agenda nem edita nada: entrega o texto para o usuário.
- Respeita as regras do perfil de voz (sem preço, sem travessão).
