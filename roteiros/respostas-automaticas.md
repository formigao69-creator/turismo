# Respostas automáticas · DATAS e LISTA · @duaspraias

Para configurar **antes** de publicar. DATAS fecha quase todos os posts; LISTA
fecha o Reels 02. Palavra-chave sem resposta queima a pessoa mais interessada
que o post trouxe.

**Regra de preço [empresa, 02/11/2026]:** nenhuma mensagem automática leva
tabela ou valor fixo. A diária varia com a ocupação, e uma tabela enviada hoje
vira argumento de negociação amanhã. O valor sai na hora, para as datas da
pessoa: pelo link de reserva direta (que calcula sozinho) ou pela equipe, à
mão.

## Onde configurar: Meta Business Suite [empresa: ferramenta nativa]

As fontes abaixo são blogs de fornecedores, não a documentação do Meta.
Confira cada passo na tela antes de publicar.

1. Abra o **Meta Business Suite no computador**. A automação por palavra-chave
   em comentário, segundo essas fontes, só se configura pelo desktop.
2. **Caixa de entrada > Automações > Criar automação**, e escolha o modelo de
   resposta a comentário com palavra-chave.
3. Crie **uma automação por palavra**: uma para DATAS, outra para LISTA.
   Escolha o post certo em cada uma.
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

1. **Entregue primeiro, pergunte depois.** A primeira mensagem já leva algo
   útil: o link que mostra disponibilidade e valor na hora, ou a lista. Nada de
   "antes de mandar, me fala...". Isso é lembrado como isca.
2. **Uma pergunta só, que se responde em poucas palavras.** É ela que abre a
   conversa. Responder é opcional para a pessoa.
3. **A automação só cobre a primeira mensagem.** Quando a pessoa responder
   com datas, quem continua é uma pessoa da equipe, com calor e sem pressa.
4. **Dois lembretes, no máximo, e só se a pessoa não responder.** Cada um traz
   um fato novo. Nunca "só passando para lembrar". Mande pelo app, à mão.
5. **Valor só por escrito no direct, para datas definidas.** Nunca mande
   "tabela da temporada".

---

## DATAS

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

Passou no `detect.py --lang pt` (84, PASS).

```
Oi, que bom! Por este link você vê a disponibilidade e o valor na hora, pras datas que quiser, e reservando direto por ele a condição é sempre melhor que nos sites de reserva: https://book.omnibees.com/hotelresults?c=4023&q=7189&currencyId=16&lang=pt-BR

A diária já inclui café da manhã, estacionamento e internet. E a Praia da Cerca fica a 2 minutos a pé.

Prefere que a gente veja pra você? Me fala as datas e quantas pessoas.
```

**Reserva direta [empresa, 02/11/2026]:** o site tem motor de reserva, e a
condição direta é melhor que na Booking em qualquer data. A mensagem diz
"melhor que nos sites de reserva", sem citar a marca.

Quando a pessoa responder, a equipe confere a disponibilidade e manda o valor
para aquelas datas, com o link de reserva direta ou o WhatsApp.

### Lembrete 1, à mão, 4 dias depois, só se não houve resposta

```
{nome}, uma dica que não estava na mensagem: {{chave de oportunidade verdadeira, sem valor. Ex.: no meio da semana costuma ter mais quarto livre e condição melhor}}. Quer que eu veja as suas datas?
```

### Lembrete 2, à mão, 7 dias depois do primeiro, e é o último

```
{nome}, última mensagem minha sobre isso: {{fato real de calendário, ex.: o feriado de X costuma lotar até a data Y}}. Se for pra essa época, me fala.
```

Só use os lembretes com fatos verdadeiros. Urgência ou vantagem inventada
destrói a confiança que o post construiu. Sem fato real, pare no lembrete 1.

---

## LISTA (Reels 02)

**Gatilho:** comentário com a palavra LISTA.

### Resposta pública no comentário

```
Lista no seu direct, {nome}.
```
```
Mandei no direct, com a distância de cada lugar.
```
```
Enviado, {nome}! Bom apetite.
```

### Mensagem 1, automática, na hora

```
Oi! Aqui está a lista: {{link ou imagem}}. São {{N}} lugares pra comer, todos a até 20 minutos a pé da pousada, com a distância de cada um. Tem mercado e padaria também, pra quem quiser usar a cozinha e a churrasqueira da pousada.

Vocês vêm em qual mês?
```

### Lembrete 1, à mão, 4 dias depois, só se não houve resposta

```
{nome}, pra quem vem com criança: {{restaurante}} tem {{cardápio infantil ou espaço kids}} e fica a {{N}} minutos a pé. Se quiser, vejo a disponibilidade pras suas datas.
```

O lembrete leva a conversa da comida para a reserva. Não mande um segundo
lembrete na LISTA: quem pediu lista de restaurante ainda está pesquisando, e
insistir afasta.

### A lista que a mensagem entrega

A lista em si está em [`lista-restaurantes.md`](lista-restaurantes.md).
Sem preço: cada lugar leva o tipo, o que pedir, uma faixa ($ a $$$) e os
minutos a pé.

- **Comece pelos lugares mais perto.** Se o primeiro da lista ficar a 20
  minutos, a lista contradiz o pilar de proximidade.
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

---

## FECHAS (Reels 08, em espanhol)

**Gatilho:** comentário com a palavra FECHAS. Crie uma terceira automação no
Meta Business Suite, só para o Reels 08 e para o bloco em espanhol da
legenda do Reels 01. Passou no `detect.py --lang es` (86, PASS).

### Resposta pública no comentário

```
¡Te escribimos por DM!
```

### Mensagem 1, automática, na hora

```
¡Hola, qué bueno! En este link ves la disponibilidad y el valor al instante, para las fechas que quieras, y reservando directo por ahí la condición siempre es mejor que en las apps de reservas: https://book.omnibees.com/hotelresults?c=4023&q=7189&currencyId=16&lang=pt-BR

La diaria ya incluye desayuno, estacionamiento y wifi. Y la Praia da Cerca queda a 2 minutos caminando.

¿Preferís que lo veamos nosotros? Dale, pasanos las fechas y cuántas personas viajan con vos.
```

O motor de reserva está em português (`lang=pt-BR`). Se ele tiver versão em
espanhol, troque o final do link por `lang=es-ES` e teste antes.

Quando o argentino responder, a equipe continua em espanhol simples. Se
ninguém da equipe escreve bem em espanhol, use um tradutor e revise, e diga
isso com honestidade no destaque "Español" (pergunta "¿Hablan español?").

