# Reels 04 · Recepção 24h: "Chegou às 2h da manhã? Você não fica esperando na porta."

| | |
| --- | --- |
| Quando | domingo, 22/11, 18h, último dia do feriado (quem está voltando da estrada se identifica) |
| Fórmula | #16 A Pergunta Literal |
| Nota do hook | 84 STRONG (`hookscore.py --lang pt`, na versão com dígitos) |
| Duração | ~22 s, 8 trechos, a 155 palavras/min (ajuste com o ritmo medido da voz) |
| Fecho | repete "duas da manhã", para o vídeo emendar no replay |
| Narração | sem dígitos nem símbolos (`beats.py --tts` sem alertas) |
| Legenda | READY no `caption.py`; 81 PASS no `detect.py` |

É o único fato de atendimento publicável enquanto não houver casos reais
documentados. O vídeo promete só o que é verdade: a recepção abre 24 horas.

**O hook foi dividido em duas falas.** Inteiro, ele leva 4,3 segundos para
ser falado. Separado, a pergunta cabe em 1,9 segundo, e o texto de tela
**CHEGOU ÀS 2H DA MANHÃ?** segura o primeiro quadro.

## Texto de tela, narração e imagem

| Tempo | Texto de tela | Narração (ElevenLabs) | Imagem |
| --- | --- | --- | --- |
| 0:00 | **CHEGOU ÀS 2H DA MANHÃ?** | Chegou às duas da manhã? | Farol de carro entrando na rua à noite, câmera em movimento. **A GRAVAR** |
| 0:02 | **SEM ESPERAR NA PORTA** | Você não fica esperando na porta. | Porta da recepção abrindo, luz acesa. **A GRAVAR** |
| 0:04 | **RECEPÇÃO 24 HORAS** | A recepção fica aberta vinte e quatro horas. | Balcão da recepção iluminado, à noite. **A GRAVAR** |
| 0:07 | **ALGUÉM TE RECEBE** | Depois da estrada, alguém te recebe na hora. | Mão entregando a chave, sem mostrar o rosto do hóspede. **A GRAVAR** |
| 0:10 | **ESTACIONAMENTO GRÁTIS** | O carro fica no estacionamento, sem custo. | Carro estacionando à noite. **A GRAVAR** (serve também para o slide 4 do Carrossel 01) |
| 0:13 | **CAFÉ DA MANHÃ INCLUSO** | E o café da manhã já vem na diária. | Café sendo servido de manhã (pasta CAFÉ DA MANHÃ). Corte de noite para dia. |
| 0:17 | **COMENTA DATAS** | Comenta datas e veja a disponibilidade. | Piscina de manhã (pasta JARDIM PISCINA). |
| 0:19 | **2H DA MANHÃ** | Duas da manhã, e a porta abre. | Volta ao farol do início. |

**Gravação:** uma única noite resolve os 5 planos que faltam. Grave tudo na
vertical, em clipes de 3 a 5 segundos, com alguém da equipe fazendo o papel
do hóspede. Nenhum hóspede real aparece sem autorização.

Narração para colar no ElevenLabs:

```
Chegou às duas da manhã?
Você não fica esperando na porta.
A recepção fica aberta vinte e quatro horas.
Depois da estrada, alguém te recebe na hora.
O carro fica no estacionamento, sem custo.
E o café da manhã já vem na diária.
Comenta datas e veja a disponibilidade.
Duas da manhã, e a porta abre.
```

## Legenda

```
Chegou às 2h da manhã depois de horas de estrada? Na Duas Praias, a recepção fica aberta 24 horas. Ninguém espera na porta.

Pra quem vem de carro, isso muda a viagem: dá pra sair depois do trabalho, chegar de madrugada e acordar com o café da manhã servido. O carro fica no estacionamento, sem custo, e a Praia da Cerca está a 2 minutos a pé. É o que muda numa pousada em Guarapari no bairro Praia do Morro: tudo perto, e alguém sempre na recepção.

Vai chegar de madrugada? Reserva a partir da noite anterior. O check-in abre às 14h e vale a qualquer hora depois, então às 2h o quarto já está te esperando.

Comenta DATAS que a gente te responde no direct com a disponibilidade das suas datas.

#guarapari #pousadaemguarapari #praiadomorro #viagemdecarro #espiritosanto
```

## Regra de check-in [empresa, 02/11/2026]

- O check-in abre às 14h e vale a qualquer hora depois (recepção 24 horas).
- Quem chega **depois da meia-noite** e quer entrar na hora paga a diária que
  começou às **14h do dia anterior**. Com ou sem reserva, a regra é a mesma.

Por isso a legenda orienta a reservar a partir da noite anterior: às 2h o
quarto já está pronto. O vídeo promete só que alguém recebe a pessoa, e isso
vale sempre. A resposta padrão para o direct está em
`respostas-automaticas.md`.
