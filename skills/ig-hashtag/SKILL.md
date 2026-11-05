---
name: ig-hashtag
description: >-
  Build a sized set of 3 to 5 Instagram hashtags for one post: niche, mid and
  broad tiers, matched to the post and rotated so no two posts carry the same
  block. Use when the user asks which hashtags to use, has a caption or carousel
  ready, or is still pasting the same tags on every post.
  Also triggers in Portuguese ("quais hashtags usar", "monta as hashtags",
  "hashtag pro post") and Spanish ("qué hashtags uso", "armá los hashtags").
---

# ig-hashtag

Adaptado de `ig-hashtag-strategist`, do pacote
[sergebulaev/instagram-skills](https://github.com/sergebulaev/instagram-skills)
(MIT, Sergey Bulaev; aviso em `THIRD_PARTY_NOTICES.md`). Mudanças: PT-BR e
espanhol, exemplos de turismo, regra de rotação com registro, e o limite de 5
tags que o `caption.py` já aplica.

## Idioma (PT-BR e espanhol)

- Hashtags no idioma de quem busca. Post em espanhol leva tags em espanhol
  (#playasdebrasil, #vacacionesenbrasil), mais o nome do lugar.
- Nunca use travessão (—).

## O modelo: tamanho, não quantidade

O tamanho de uma hashtag é o número de posts que ela tem. Conta pequena numa
tag gigante some em segundos. O conjunto mistura tamanhos para o post
**aparecer** nas tags pequenas e só **tocar** as grandes.

| Faixa | Posts na tag | Papel | Quantas |
| --- | --- | --- | --- |
| Nicho | menos de 50 mil | onde a conta aparece por horas | 2 a 3 |
| Média | 50 mil a 500 mil | público relevante, concorrência possível | 1 a 2 |
| Ampla | mais de 500 mil | rótulo de categoria, aparece por minutos | 0 a 1 |

**Padrão: 3 a 5 no total** (o limite do Instagram é 5 desde dezembro de 2025).

## Passos

1. **Leia o post:** o assunto, o público e o tamanho aproximado da conta.
2. **Tire de 3 a 5 assuntos reais do post:** o lugar, o tipo de viagem, o
   público, o formato.
3. **Proponha candidatas por faixa.** Nicho é específico e longo
   (#praiadacerca, #morrodapescaria); ampla é uma palavra comum (#viagem).
4. **Estime a faixa e diga que é estimativa.** A contagem real aparece na
   busca do app: peça para conferir antes de publicar.
5. **Monte o conjunto:** 2 a 3 de nicho, 1 a 2 médias, no máximo 1 ampla.
   Sem ampla, se nenhuma servir.
6. **Confira o encaixe:** toda tag descreve o post. Tag popular fora do
   assunto ensina o Instagram a mostrar o post para o público errado.
7. **Rotacione:** nenhum post repete o conjunto do anterior. O mesmo bloco em
   todos os posts parece automação. Se existir `~/.claude/instagram/hashtags.md`,
   leia os últimos conjuntos e evite repetir mais de 2 tags seguidas; depois
   registre o novo conjunto lá.
8. **Entregue:** o conjunto com a faixa e o motivo de cada tag, e onde colocar
   (fim da legenda ou primeiro comentário).

## Saída

```
Conjunto (4 tags):
  #praiadacerca        nicho   a praia a 2 min da pousada; quem busca é quem vai
  #morrodapescaria     nicho   o parque do post; público de trilha leve
  #praiadomorro        média   o bairro; busca de quem planeja Guarapari
  #guarapari           ampla   rótulo do destino, um toque

Faixas estimadas: confira a contagem na busca do Instagram antes de publicar.
Onde: fim da legenda. Próximo post: troque pelo menos 2 tags de nicho.
```

## Regras

- De 3 a 5 tags. Nunca um bloco de 20 ou 30.
- Toda tag descreve o post.
- No máximo 1 ampla.
- Fora: tags de troca de seguidores (#sigoevolto, #like4like, #follow4follow)
  e tags genéricas de alcance (#viral, #fyp, #explorar, #reels).
- Nunca no meio de uma frase.
- Conjunto diferente a cada post.
