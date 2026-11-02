# Instagram agent skill · edição PT-BR e espanhol

Adaptação do pacote [instagram-agent-skill](https://github.com/Jakeschincariol/instagram-agent-skill)
(MIT, Jake Schincariol) para português do Brasil e espanhol, configurada para a
conta da empresa **@duaspraias**.

As 13 skills continuam as mesmas. A mudança está nos 5 scripts que dão nota e
limpam o texto: no original eles só entendiam inglês e davam resultado errado
em português sem avisar.

## O que mudou

| Antes (só inglês) | Agora |
| --- | --- |
| "férias" virava `f` + `rias`; `#maceió` virava `#macei` | Acentos, `ñ`, `¿¡` e hashtags acentuadas tratados como texto normal |
| `R$ 1.840` não era reconhecido como preço | `R$`, `US$`, `€` e milhar com ponto (`1.840`) |
| "Oi gente, hoje eu vou mostrar..." passava como hook normal | Saudações, "para de rolar" e "neste vídeo" em PT e ES derrubam a nota |
| 154 clichês, todos em inglês | +118 em PT e +107 em ES, com um bloco só de turismo ("paraíso escondido", "águas cristalinas", "experiência inesquecível") |
| 26 fórmulas de hook reconhecidas só em inglês | As 26 com nome, modelo e reconhecimento em PT e ES |
| `#praia`, `#viagem` contavam como hashtag útil | Marcadas como genéricas: com o limite de 5, cada uma é uma vaga perdida |
| "Comenta SETEMBRO" não era lido como CTA | CTAs em PT e ES, incluindo reserva direta e direct/WhatsApp |
| Ritmo de fala fixo em 165 palavras/min | 155 em PT e 170 em ES (estimativas; meça o seu) |

O inglês continua dando exatamente os números do README original. Isso faz
parte dos testes.

## Instalação

**Opção 1, pelo zip.** Descompacte e copie as pastas `skills/ig-*` para
`~/.claude/skills/`.

**Opção 2, pelo GitHub.** O pacote está na branch `instagram-skill-ptes` de
[formigao69-creator/turismo](https://github.com/formigao69-creator/turismo/tree/instagram-skill-ptes),
separada do aplicativo (a branch `main` e o deploy não são afetados):

```bash
git clone -b instagram-skill-ptes https://github.com/formigao69-creator/turismo.git instagram-skill
```

```bash
cp -r instagram-skill/skills/ig-* ~/.claude/skills/
```

Depois, **antes de qualquer post**:

1. Copie `templates/voice.duaspraias.md` para `~/.claude/instagram/voice.md`.
2. Preencha os campos `{{preencher}}`. O mais importante é colar três legendas
   ou reels que já soam como a pousada. Sem isso, o texto sai genérico.
3. Confira os itens marcados **[público]**. Vieram de sites de reserva e podem
   estar desatualizados.

## Uso

Peça em português normalmente: "faz um reels sobre setembro em Guarapari",
"escreve a legenda", "humaniza esse texto", "planeja minha semana". Para
espanhol: "hacé un reel sobre..." ou "faz a versão em espanhol".

Os scripts, se quiser rodar à mão:

```bash
python3 skills/ig-reel/hookscore.py hooks.txt --lang pt
python3 skills/ig-reel/beats.py roteiro.txt --lang pt --target 30
python3 skills/ig-caption/caption.py legenda.txt --lang pt --keywords "pousada em guarapari,praia do morro"
python3 skills/ig-human/humanize.py rascunho.txt --lang pt --report
python3 skills/ig-human/detect.py rascunho.txt limpo.txt --lang pt
python3 skills/ig-viral/swipe.py capturados.tsv --lang pt
```

Troque `pt` por `es` para espanhol. Sem `--lang`, o script usa a variável
`IG_LANG` e, se ela não existir, tenta adivinhar; em frase curta ele erra, por
isso as skills sempre passam o idioma.

Testes: `python3 -m unittest discover -s tests -v`

## Limites

- **As fórmulas e os clichês em PT/ES não foram validados com dados.** O autor
  original testou o inglês em 74 hooks reais. Os padrões em português e
  espanhol foram escritos a partir de linguagem de turismo e hotelaria, e a
  taxa de acerto deles é desconhecida. A forma de validar está abaixo.
- **A nota do hook não prevê viralização em nenhum idioma.** No teste do autor,
  separar o hit do fracasso de um mesmo criador deu AUC 0,56, quase cara ou
  coroa. Use a nota para descartar hooks fracos, não para escolher o vencedor.
- **O ritmo de fala de 155 (PT) e 170 (ES) palavras/min é estimativa.**
  Cronometre quem grava os vídeos e passe `--wpm`.
- **Adjetivos de folheto não são apagados automaticamente.** Apagar
  "incrível" de "a vista é incrível" quebra a frase. Eles aparecem no relatório
  para você trocar por um fato: distância, preço, horário.
- **Nada é postado.** Como no original, as skills escrevem e você publica.

## Como validar com dados da @duaspraias

1. Exporte os 20 reels com mais alcance e os 20 com menos dos últimos 12 meses
   (Insights > Conteúdo).
2. Copie a primeira frase falada ou o texto de tela de cada um para
   `capturados.tsv` (colunas: `account`, `median`, `views`, `hook`).
3. Rode `swipe.py capturados.tsv --lang pt`.
4. Se a nota mediana do terço de cima não superar a do terço de baixo em pelo
   menos 10 pontos, a nota não está ajudando nesse perfil: use só o
   humanizador e a janela de 125 caracteres da legenda.
