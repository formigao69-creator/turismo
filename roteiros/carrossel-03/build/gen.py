head = open('/home/user/jakeschincariol/instagram-agent-skill/roteiros/carrossel-01/build/slides.html', encoding='utf-8').read()
style = head[:head.index('</style>')] + """
.q{font:700 74px/1.18 'Baloo 2';color:var(--tinta)}
.qm{font:800 260px/0.6 'Baloo 2';color:var(--azul);height:120px}
.src{font:600 34px/1.4 'Inter';color:var(--verde);margin-top:40px}
</style></head><body>"""
def num(i, c=''): return f'<div class="num" style="{c}">{i}/7</div>'
H = '<div class="handle">@duaspraias</div>'
def quote(i, text, src, size=74):
    return f'''<section>{num(i)}<div class="pad" style="display:flex;flex-direction:column;justify-content:center">
<div class="qm">&ldquo;</div><div class="q" style="font-size:{size}px">{text}</div>
<div class="src">{src}</div></div>{H}</section>'''
sl = []
sl.append(f'''<section>{num(1)}
<div class="pad" style="display:flex;flex-direction:column;justify-content:center">
<p style="font:600 48px 'Inter'">Você não precisa da nossa palavra.</p>
<div class="big" style="font-size:380px;font-weight:800;color:var(--azul);line-height:.9;margin-top:20px">9,5</div>
<h1 style="font-size:104px;font-weight:800">é a nota da equipe</h1>
<p style="font:600 44px/1.3 'Inter';margin-top:30px">dada por quem se hospedou.</p></div>
<div style="position:absolute;left:0;right:0;bottom:0;height:34px;background:var(--azul)"></div>
<div class="handle" style="bottom:70px">@duaspraias</div>
<div class="credit" style="bottom:74px">Momondo · 221 avaliações · nov/2026</div></section>''')
sl.append(quote(2, "os funcionários e os proprietários são pessoas boas demais!!!", "Hóspede no Tripadvisor · março de 2024 · nota 5 de 5", 84))
sl.append(quote(3, "Local top de extrema atenção com os hospedes, local limpo, café farto, piscina estacionamento, segurança tudo de bom.", "Hóspede no Tripadvisor · novembro de 2023 · nota 5 de 5", 66))
sl.append(quote(4, "Equipe de excelência, prestativa e acolhedora", "Hóspede no Tripadvisor · maio de 2023 · nota 4 de 5", 92))
sl.append(quote(5, "Café da manhã com várias opções , bem localizado tendo proximidade com a Praia do Morro", "Hóspede no Tripadvisor · outubro de 2024 · nota 5 de 5", 72))
sl.append(f'''<section>{num(6)}<div class="pad" style="display:flex;flex-direction:column;justify-content:center">
<div class="kicker">As notas mais altas</div>
<div style="display:flex;gap:60px;margin-top:40px">
<div><div class="big" style="font-size:230px;font-weight:800;color:var(--azul)">9,5</div><p style="font:700 60px 'Baloo 2'">Equipe</p></div>
<div><div class="big" style="font-size:230px;font-weight:800;color:var(--azul)">9,5</div><p style="font:700 60px 'Baloo 2'">Localização</p></div></div>
<p style="font:600 40px/1.35 'Inter';margin-top:50px">Gente que recebe bem, a 2 minutos a pé da Praia da Cerca.</p></div>
{H}<div class="credit">Momondo · 221 avaliações · nov/2026</div></section>''')
sl.append(f'''<section style="background:var(--azul);color:#fff">{num(7,'color:#fff')}
<div class="pad" style="display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center">
<p style="font:600 52px 'Inter'">Vem conhecer de perto. Comenta</p>
<div class="big" style="font-size:230px;font-weight:800;color:var(--creme)">DATAS</div>
<p style="font:600 48px/1.3 'Inter';margin-top:10px">que a gente responde com a disponibilidade das suas datas.</p>
<img src="logo.png" style="width:240px;margin-top:80px;border-radius:50%"></div></section>''')
open('slides.html', 'w', encoding='utf-8').write(style + '\n'.join(sl) + '</body></html>')
