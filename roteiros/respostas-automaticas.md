# Respostas automáticas · DATAS e MOQUECA · @duaspraias

Para configurar **antes** de publicar os Reels 01 (DATAS) e 02 (MOQUECA).
Palavra-chave sem resposta queima a pessoa mais interessada que o post trouxe.

## Onde configurar: Meta Business Suite [empresa: ferramenta nativa]

As fontes abaixo são blogs de fornecedores, não a documentação do Meta.
Confira cada passo na tela antes de publicar.

1. Abra o **Meta Business Suite no computador**. A automação por palavra-chave
   em comentário, segundo essas fontes, só se configura pelo desktop.
2. **Caixa de entrada > Automações > Criar automação**, e escolha o modelo de
   resposta a comentário com palavra-chave.
3. Crie **uma automação por palavra**: uma para DATAS, outra para MOQUECA.
   Escolha o post certo em cada uma (Reels 01 para DATAS, Reels 02 para
   MOQUECA).
4. Cole a **Mensagem 1** de cada palavra (abaixo) como mensagem automática.
5. Teste com uma conta pessoal antes de publicar: comente a palavra e veja se
   a mensagem chega.

**Limites da ferramenta nativa, segundo as mesmas fontes:**

- Manda **a mesma mensagem para todo mundo**. Por isso as mensagens abaixo não
  usam o nome da pessoa.
- **Uma resposta privada por comentário**, dentro de 7 dias depois do
  comentário. Depois que a pessoa responde no direct, a conversa segue à mão.
- A **resposta pública no comentário** ("Mandei no direct") pode não existir
  na ferramenta nativa. Se não existir, responda à mão: além de avisar a
  pessoa, comentário respondido ajuda o post.

## Regras

1. **Entregue primeiro, pergunte depois.** A primeira mensagem já leva a
   tabela ou a lista, sem condição. Nada de "antes de mandar, me fala...". Isso
   é lembrado como isca.
2. **Uma pergunta só, que se responde em poucas palavras.** É ela que abre a
   conversa. Responder é opcional para a pessoa.
3. **A automação só cobre a primeira mensagem.** Quando a pessoa responder
   com datas, quem continua é uma pessoa da equipe.
4. **Dois lembretes, no máximo, e só se a pessoa não responder.** Cada um traz
   um fato novo. Nunca "só passando para lembrar". Mande pelo app, à mão.

---

## DATAS (Reels 01)

**Gatilho:** comentário com a palavra DATAS (aceite também "datas" e "Datas").

### Resposta pública no comentário

Alterne entre as três para não repetir o mesmo texto em todo comentário:

```
Mandei no direct, {nome}.
```
```
Tá no seu direct, {nome}. Qualquer dúvida sobre as datas, responde por lá.
```
```
Enviado! Olha o direct.
```

### Mensagem 1, automática, na hora

```
Oi! Aqui estão as tarifas da temporada: {{link ou imagem da tabela}}.

A diária já inclui café da manhã, estacionamento e internet. E a Praia da Cerca fica a 2 minutos a pé.

Pra quais datas, e quantas pessoas?
```

Quando a pessoa responder, a equipe confere a disponibilidade e manda o valor
fechado com o link de reserva direta: {{link do motor de reserva ou WhatsApp}}.

### Lembrete 1, à mão, 4 dias depois, só se não houve resposta

```
{nome}, uma coisa que não estava na tabela: {{fato novo e verdadeiro, ex.: de domingo a quinta a diária sai R$ X menor}}. Se quiser, eu vejo a disponibilidade pras suas datas.
```

### Lembrete 2, à mão, 7 dias depois do primeiro, e é o último

```
{nome}, última mensagem minha sobre isso: {{fato real de calendário, ex.: o feriado de X costuma lotar até a data Y}}. Se for pra essa época, me fala.
```

Só use o lembrete 2 se o fato for verdadeiro. Urgência inventada destrói a
confiança que o post construiu. Sem fato real, pare no lembrete 1.

---

## MOQUECA (Reels 02)

**Gatilho:** comentário com a palavra MOQUECA.

### Resposta pública no comentário

```
Lista no seu direct, {nome}.
```
```
Mandei no direct, com preço e distância de cada lugar.
```
```
Enviado, {nome}! Bom apetite.
```

### Mensagem 1, automática, na hora

```
Oi! Aqui está a lista: {{link ou imagem}}. São {{N}} lugares, todos a até 20 minutos a pé da pousada, com o preço médio e a distância de cada um. Tem supermercado e padaria também, pra quem quiser usar a cozinha e a churrasqueira da pousada.

Vocês vêm em qual mês?
```

### Lembrete 1, à mão, 4 dias depois, só se não houve resposta

```
{nome}, pra quem vem com criança: {{restaurante}} tem {{cardápio infantil ou espaço kids}} e fica a {{N}} minutos a pé. Se quiser, te mando as tarifas pras suas datas.
```

O lembrete leva a conversa da comida para a reserva. Não mande um segundo
lembrete na MOQUECA: quem pediu lista de restaurante ainda está pesquisando, e
insistir afasta.

### A lista que a mensagem entrega

A lista em si, com os 19 lugares, está em [`lista-restaurantes.md`](lista-restaurantes.md). O modelo abaixo fica como referência rápida.

Prepare em imagem (para o direct) ou numa página simples. Formato:

| Restaurante | O que pedir | Preço médio (nov/2026) | A pé da pousada |
| --- | --- | --- | --- |
| {{nome}} | Moqueca para 3 | menos de R$ 220 | 20 min |
| {{nome}} | {{almoço / PF}} | R$ {{valor}} | {{N}} min |
| {{nome}} | {{lanche, padaria}} | R$ {{valor}} | {{N}} min |
| {{nome}} | {{jantar}} | R$ {{valor}} | {{N}} min |

- **Inclua os lugares mais perto do que 20 minutos.** Se o mais próximo da
  lista for a moqueca a 20 minutos, a lista contradiz o pilar de proximidade.
- Data do levantamento sempre visível. Revise antes de cada alta temporada.
- Combine com os restaurantes antes de citar o nome. Vale propor troca: eles
  indicam a pousada, a pousada indica eles.

---

## Pergunta frequente: "Posso chegar de madrugada?" (Reels 04)

Resposta à mão, no direct. Não é automação: cada caso tem datas diferentes.
Passou no `detect.py --lang pt` (79, PASS).

```
Pode sim! A recepção da Duas Praias funciona 24 horas, então sempre tem alguém pra te receber, e o carro já fica no estacionamento, sem custo.

Só um detalhe: o check-in abre às 14h. Se você chega depois da meia-noite e quer ir direto pro quarto, a reserva começa no dia anterior, às 14h. Aí o quarto já está pronto.

Que dia você chega? E mais ou menos que horas? A gente vê a melhor opção.
```

Se a pessoa não quiser pagar a noite anterior, ofereça a alternativa
honesta: a recepção recebe, o carro fica no estacionamento e o quarto é
liberado às 14h.

