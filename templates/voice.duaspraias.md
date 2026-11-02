# voice.md · @duaspraias

Perfil de voz da conta da empresa. Copie para `~/.claude/instagram/voice.md`.
Todas as skills leem este arquivo antes de escrever.

Como ler este arquivo:

- **[empresa]** foi definido pela empresa em 02/11/2026.
- **[público]** veio de páginas públicas de reserva (Expedia, Hotels.com,
  Kayak, Omnibees) em 02/11/2026. Confirme antes de usar em post.
- **{{preencher}}** é informação que só a empresa tem. Enquanto estiver vazio,
  as skills devolvem o texto com `{{seu número}}` no lugar e avisam, em vez de
  inventar.

---

## Quem somos

- **Nome:** Duas Praias Hotel Pousada **[público]**
- **Perfil:** @duaspraias
- **Onde:** bairro Praia do Morro, Guarapari (ES) **[público]**
- **Origem do nome [empresa]:** a pousada fica entre duas praias, a Praia da
  Cerca (50 m) e a Praia do Morro (300 m). O nome é o endereço.
- **Posicionamento [empresa]:** pousada tranquila, de alto custo-benefício,
  perto de tudo: praias, restaurantes e comércio a pé, com atendimento atento.
- **O que NÃO somos [empresa]:** não somos pé na areia. Não somos pousada de
  luxo nem de charme. Nunca escreva nada que sugira uma dessas três coisas.
- **Os quatro pilares, em ordem de prioridade [empresa]:**
  1. **Proximidade.** Praia, restaurante, padaria, farmácia e mercado a pé.
     Sempre em minutos a pé ou metros, medidos. Nunca "pertinho" ou "a poucos
     passos".
  2. **Tranquilidade.** Ambiente calmo para descansar. Mostre com o que se vê e
     se ouve (piscina sem fila, rua sem barulho à noite, horário de silêncio),
     não com o adjetivo.
  3. **Comodidade e custo-benefício.** Incluído na diária, sem custo extra
     **[empresa]**: café da manhã, estacionamento, internet rápida, recepção
     24 horas, piscinas, jardim, playground, área de jogos, churrasqueira e
     cozinha para hóspedes.
     **Regra:** comodidade nunca entra como lista. Entra convertida em dinheiro
     ou tempo poupado. "Cozinha para hóspedes" é um item de lista; "você
     economiza R$ {{valor}} em 5 dias cozinhando na pousada" é um motivo para
     reservar. O teste do `hookscore.py` confirma: lista de comodidades tirou
     40 a 52, a mesma comodidade convertida em economia tirou 82 a 84.
     O maior trunfo é **cozinha + churrasqueira + estacionamento**: para
     família que vem de carro, corta o maior gasto da viagem depois da diária,
     que é comer fora.
  4. **Atendimento.** Ainda não há casos reais documentados **[empresa]**.
     Até haver, o único fato publicável é a **recepção 24 horas** (chegada de
     madrugada, problema à noite). Não use "atendimento especial" sem um
     caso. Ver "Como juntar casos de atendimento" no fim deste arquivo.
- **Diferenciais citados nas páginas de reserva:** duas piscinas externas e
  piscina infantil, café da manhã incluído, perfil familiar, caminhada curta até
  as praias do Morro e da Cerca **[público, confirmar cada um]**
- **Nota média dos hóspedes:** entre 8 e 9 de 10, varia por site **[público]**.
  Antes de citar, escolha uma plataforma e use o número exato dela, com a data.
- **Para quem falamos:** {{preencher. Seja específico: "famílias de Minas
  Gerais com filhos pequenos que vêm de carro e querem ir a pé para a praia e
  para o restaurante", não "turistas"}}
- **O que vendemos:** diárias. Canal de reserva direta: {{site / motor de
  reserva / WhatsApp}}

## Fonte de imagens e vídeos

Pasta do Google Drive **DUAS PRAIAS MARKETING**:
<https://drive.google.com/drive/folders/1mSlQ3A3t44Q4bWp8iQ63cOA4IskP6Tzx>.
O catálogo, com o uso e os direitos de cada pasta, está em
`roteiros/acervo-midia.md`. Regras para as skills:

- Ao escrever um roteiro, indique o arquivo do acervo para cada trecho. Se
  não houver, escreva "A GRAVAR" e descreva o plano.
- **Imagem de terceiro sempre com crédito na legenda.** Fotos e mapas do
  Marcelo Moryan: "Foto: Marcelo Moryan" (liberado pela empresa com crédito).
  Fotos de Fernando Otávio Campos: liberadas; crédito recomendado.

## Idiomas

- **Principal:** PT-BR. É onde está quase todo o público.
- **Espanhol [empresa]:** cerca de 1% dos hóspedes hoje, mercado começando.
  Maioria argentina.
- **Variante do espanhol:** rioplatense (vos: "vení", "mirá", "reservá").
  Moeda sempre em R$; valor em pesos ou dólares só com cotação informada no dia.
- **Quanto produzir em espanhol:** pouco, até haver sinal de demanda. Ver
  "Regra do espanhol" no fim deste arquivo.
- **Regra:** o post em espanhol é reescrito, não traduzido.

## Atenção ao "pé na areia"

Com a Praia da Cerca a 50 metros, a pousada está quase na areia. Por isso o
conteúdo **não deve citar "pé na areia"** nem para negar: a comparação coloca a
pousada como a segunda opção. Abra com o número ("50 metros", "2 minutos") e
deixe a pessoa concluir. Os hooks da tabela abaixo que citam "pé na areia"
ficam só como reserva, para responder a objeção nos comentários.

## Formato dos Reels [empresa]

**Sem rosto: só imagens, texto na tela e narração.** Isso muda o roteiro:

- **O primeiro quadro é o hook.** Texto na tela desde o quadro 1, com
  movimento (câmera andando, água da piscina, porta abrindo). Sem logo de
  abertura, sem fachada parada.
- **O texto de tela carrega o vídeo.** Quase todo mundo assiste sem som
  primeiro. O texto de tela tem que contar a história sozinho; a narração
  completa, não repete.
- **Proximidade se prova em trajeto.** O melhor formato para o pilar 1 é o
  trajeto filmado, da porta da pousada até a areia ou até o restaurante, com
  cronômetro na tela. Um número real na tela vale mais que qualquer frase.
- **Narração [empresa]:** voz sintética gerada no ElevenLabs. Consequências:
  - **Dois textos por Reels.** O de narração vai com números por extenso e sem
    símbolos ("seis minutos", "trinta por cento", "seiscentos reais"). O de
    tela vai com dígitos ("6 MIN", "30%", "R$ 600"). Rode `beats.py --tts`
    no texto de narração: ele aponta dígitos, símbolos, siglas e abreviações.
  - **Ritmo:** gere um áudio de teste de 30 segundos com a voz e as
    configurações definitivas, cronometre e passe o valor em `--wpm`. Voz
    sintética é constante, então uma medição serve para todos os vídeos.
    Ritmo medido: {{preencher}} palavras por minuto.
  - **Nome da voz e configurações usadas:** {{preencher, para manter a mesma
    voz em todos os vídeos}}
  - **Rótulo de IA:** o Meta pede que conteúdo com áudio realista criado por
    IA seja identificado com o rótulo "Informações de IA". Confira a regra
    vigente na Central de Ajuda do Instagram antes do primeiro post
    **[a confirmar]**.
  - **Licença:** uso comercial no ElevenLabs depende do plano. Confira se o
    plano contratado cobre uso comercial **[a confirmar]**.
- **Troca de imagem a cada 2 a 4 segundos.** Cada trecho de narração (beat)
  tem a sua imagem.
- **Legenda queimada no vídeo** acompanhando a narração.

**Fórmulas de hook que combinam com este posicionamento** (ver `hooks.json`):

Notas do `hookscore.py --lang pt` em 02/11/2026, com números de teste no
lugar das lacunas (6 minutos, 30%, R$ 900). Troque pelos reais e rode de novo.

| Fórmula | Hook falado | Texto de tela (até 6 palavras) | Nota |
| --- | --- | --- | --- |
| #6 O Recibo | Você paga {{X}}% a menos e anda só {{N}} minutos até a praia. | {{X}}% MENOS, {{N}} MIN A PÉ | 94 |
| #17 Frente a Frente | Pé na areia ou {{N}} minutos a pé? Você economiza R$ {{valor}}. | PÉ NA AREIA x {{N}} MIN | 84 |
| #20 Permissão | Você não precisa de pé na areia: são {{N}} minutos a pé. | {{N}} MINUTOS ATÉ A AREIA | 81 |
| #12 A Objeção | "Não é pé na areia." Justo. São {{N}} minutos, e a diária é {{X}}% menor. | NÃO É PÉ NA AREIA | 54, longo: corte |
| #16 A Pergunta Literal | Fica longe da praia? Cronometramos: {{N}} minutos a pé. | FICA LONGE DA PRAIA? | 47, falta tensão |
| #20 Permissão | Você não precisa comer fora {{3}} vezes por dia em Guarapari. | COZINHA INCLUÍDA | 84 |
| #6 O Recibo | Você cozinha na pousada e economiza R$ {{valor}} em {{5}} dias de praia. | R$ {{valor}} A MENOS | 82 |
| #16 A Pergunta Literal | Chegou às 2h da manhã? Você tem recepção 24 horas. | RECEPÇÃO 24H | 58 |

Os dois últimos ficaram fracos na versão de teste: use como ponto de partida,
não como roteiro. Para comparação, "Descubra o refúgio perfeito para sua
família" tirou 38.

Evite fórmulas que pedem rosto ou depoimento pessoal (#8 Vazamento de
Bastidor, #15 Histórico de Fracasso) até haver narração que sustente isso.

## Como soamos

- **Três legendas ou narrações nossas que mais soam como a gente:** {{colar
  aqui. Isto vale mais do que todo o resto da seção}}
- **Tom:** calmo, direto e acolhedor. Fala como um bom recepcionista que conhece
  o bairro: dá a informação útil antes de vender.
- **Palavras que usamos de verdade:** pousada, café da manhã, a pé, minutos,
  Praia do Morro, Praia da Cerca, {{nomes de restaurantes, padarias e lojas
  próximas, se for usar}}
- **Palavras que nunca usamos:**
  - Que contradizem o posicionamento: **pé na areia, frente para o mar, beira-mar,
    luxo, luxuoso, charme, charmosa, boutique, exclusivo, sofisticado,
    requintado**
  - Que soam como folheto: paraíso escondido, experiência inesquecível,
    deslumbrante, de tirar o fôlego, venha viver, águas cristalinas, refúgio
  - Que prometem sem prova: pertinho, a poucos passos, tudo perto, o melhor
    atendimento, atendimento de excelência
- **Emoji na legenda:** {{nunca / um, às vezes / livre}}

## Nossas posições

Coisas em que acreditamos e que parte do público não acredita. É daqui que
saem os reels que viajam. Cada uma só vai ao ar com o número que a sustenta.

1. **Para quem vai à praia todo dia, pé na areia não compensa o preço.**
   Prova: diferença de diária entre a pousada e um pé na areia da região em
   {{mês}}: R$ {{valor}}; tempo a pé até a areia: {{N}} min.
2. **Perto de tudo vale mais que vista para o mar** para família com criança:
   restaurante, farmácia e mercado a pé. Prova: {{lista com minutos a pé,
   medidos}}.
3. **Tranquilidade é um diferencial, não um defeito.** Quem quer agito tem o
   centro a {{N}} min; quem quer dormir cedo fica aqui.
4. {{preencher}}

## Fora de questão

- **Assuntos que não postamos:** {{preencher}}
- **Hóspedes e nomes:** fotos e nomes de hóspedes só com autorização por escrito.
- **Promessas que não fazemos:** clima, temperatura da água, praia vazia ou
  disponibilidade sem confirmação. Preço só com validade e condições.
- **Comparação com concorrente:** nunca citar outra pousada ou hotel pelo nome.
  Comparar com "pé na areia da região" como categoria, com número médio.

## Provas que podemos usar

Números e casos reais que a empresa assina. As skills nunca inventam um.

- Distâncias a pé **[empresa]**: Praia da Cerca, menos de 2 min (50 m); Praia
  do Morro, menos de 6 min (300 m); entrada do Parque Morro da Pescaria, menos
  de 8 min (400 m); mais de 16 praias num raio de 3 km. Confirmar com
  cronômetro na gravação.
- Comer fora no bairro **[empresa, nov/2026]**: família de 3 almoça, lancha e
  janta por R$ 180 a R$ 240 por dia; moqueca para 3 por menos de R$ 220, a
  20 min a pé (longe demais para ser argumento de proximidade).
  Citar sempre com o mês do levantamento.
- {{minutos a pé até restaurante, padaria, farmácia e mercado, medidos}}
- {{tarifa média por temporada, com datas}}
- Incluído na diária **[empresa]**: café da manhã, estacionamento, internet
  rápida, recepção 24 horas, piscinas, jardim, playground, área de jogos,
  churrasqueira, cozinha para hóspedes.
- {{quanto cada item custaria fora, levantado no bairro e com data: café da
  manhã por pessoa, estacionamento por dia na temporada, almoço e jantar de
  uma família de 4}}. É este número que transforma o pilar 3 em hook.
- {{diferença de preço entre reserva direta e plataforma}}
- Casos de atendimento: nenhum documentado ainda **[empresa]**.
- {{uma avaliação de hóspede com autorização, copiada sem edição}}

## O pedido

- **Palavra-chave do CTA:** {{uma palavra, fácil de falar, sem espaço. Ex.:
  DATAS, JULHO}}
- **O que a palavra entrega:** {{ex.: tabela de tarifas da temporada por DM}}
- **Para onde vai o link da bio:** {{motor de reserva direta ou WhatsApp}}
- **Hashtags fixas (até 2 das 5):** {{ex.: #guarapari #praiadomorro}}

## Regra do espanhol

Com 1% dos hóspedes falando espanhol, conteúdo em espanhol é teste, não
estratégia. Até haver sinal de demanda:

- **No feed:** 1 post em espanhol a cada 8 a 10 em português, ou legenda
  bilíngue (PT primeiro, ES abaixo da dobra) em posts com tema que interessa a
  argentino: proximidade, preço em R$, café da manhã incluído.
- **Destaque fixo "Español"** no perfil, com 4 a 6 stories respondendo o que
  argentino pergunta: como chegar, distâncias, pagamento, idioma no
  atendimento.
- **Sinal para aumentar:** reservas ou mensagens em espanhol crescendo por 3
  meses seguidos. Sem esse sinal, não aumentar a produção.

## Como juntar casos de atendimento

Hoje não há casos, e sem caso o pilar 4 não vai ao ar. O processo para criar
estoque em 60 dias:

1. **Registrar na hora.** Toda vez que a equipe resolver algo fora do comum
   (chegada de madrugada, remédio à noite, ajuda com criança, informação que
   salvou o passeio), anotar em uma planilha: data, o que aconteceu, o que a
   equipe fez, em quanto tempo.
2. **Pedir autorização no check-out.** Ao hóspede que elogiar: "Podemos contar
   essa história no Instagram, sem foto e sem nome?" Guardar o sim por escrito
   (WhatsApp serve).
3. **Ler as avaliações públicas toda semana.** Avaliação que cita alguém da
   equipe ou uma situação concreta é um caso pronto. Copie sem editar e cite a
   plataforma e o mês.
4. **Meta:** três casos com autorização antes do primeiro post sobre
   atendimento.

