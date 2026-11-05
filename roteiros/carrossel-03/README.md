# Carrossel 03 · "Você não precisa da nossa palavra: a equipe tem nota 9,5"

| | |
| --- | --- |
| Quando | quinta, 26/11, 19h30 (semana 3) |
| Tipo | PROVA (acolhimento) |
| Nota do hook | 81 STRONG |
| Slides | 7, em 1080x1350, nas cores do logo, só texto |
| Legenda | READY no `caption.py`; 77 PASS no `detect.py` |

O acolhimento é provado pelos hóspedes, sem mostrar a equipe. Os trechos e as
notas estão em `../avaliacoes.md`.

## Os slides

| # | Conteúdo |
| --- | --- |
| 1 | Capa: "Você não precisa da nossa palavra. 9,5 é a nota da equipe, dada por quem se hospedou." Fonte no rodapé: Momondo, 221 avaliações, nov/2026 |
| 2 | "os funcionários e os proprietários são pessoas boas demais!!!" (Tripadvisor, mar/2024) |
| 3 | "Local top de extrema atenção com os hospedes, local limpo, café farto, piscina estacionamento, segurança tudo de bom." (nov/2023) |
| 4 | "Equipe de excelência, prestativa e acolhedora" (mai/2023) |
| 5 | "Café da manhã com várias opções , bem localizado tendo proximidade com a Praia do Morro" (out/2024) |
| 6 | As notas mais altas: Equipe 9,5 e Localização 9,5 |
| 7 | Comenta DATAS, com o logo |

## Antes de publicar

1. **Abra cada avaliação completa no Tripadvisor** e confira se o trecho está
   igual. As páginas consultadas cortavam o texto em 125 caracteres.
2. **Confira a nota 9,5 no dia.** Se mudar, troque nos slides 1 e 6 e na
   legenda. O texto está em `build/gen.py`; depois rode `python3 gen.py` e
   `node render.js` dentro da pasta `build`.
3. **Sem nomes.** Nem do hóspede nem da equipe (a avaliação de maio/2023 cita
   funcionários pelo nome; por isso só o título entrou).
4. **Grafia original mantida** ("hospedes", "opções , bem"). Corrigir seria
   editar a fala do hóspede.

## Legenda

```
Você não precisa da nossa palavra: quem se hospedou na nossa pousada em Guarapari deu 9,5 para a equipe.

Os trechos do carrossel foram copiados de avaliações públicas do Tripadvisor, sem edição. A nota 9,5 é a da categoria equipe no Momondo, com 221 avaliações, em novembro de 2026. Localização também tirou 9,5, e não é à toa: nossa pousada em Guarapari fica no bairro Praia do Morro, com a Praia da Cerca a 2 minutos a pé.

A gente gosta de receber como quem recebe em casa. Ver isso escrito por quem passou por aqui é o melhor retorno que existe. Obrigado a cada hóspede que tirou um tempo pra contar.

Comenta DATAS que a gente te responde no direct com a disponibilidade das suas datas.

#pousadaemguarapari #guaraparies #hospedagemfamiliar #viagememfamilia
```
