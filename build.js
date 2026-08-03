const f=require('fs'),P=require('path'),O='dist',z=require('zlib');
// ══════════ CONFIGURA AQUI ══════════
const N='SakuraAir',DOM='https://sakuraair.pages.dev';
const MAIL='contact.sakuraair@gmail.com';
const MVERIFY='<meta name="monetag" content="20276d347c7d19d7d24cea04109c96d1"><meta name="google-site-verification" content="U9iGxs4sIb4prXPIHujTEdxOh7eu-x9UDdaeqOjKHjE">';
const ZONAS=[];                          // [['dominio/tag.js?z=NNN',''] o ['dominio/tag.min.js','NNN']]
// ════════════════════════════════════
const s=x=>String(x||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70);
const e=x=>String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const strip=h=>String(h||'').replace(/<[^>]*>/g,'').replace(/&[a-z]+;/g,' ').replace(/\s+/g,' ').trim();

const HIST='history.json';
const HOY_ISO=new Date().toISOString().slice(0,10);
const MESES=['January','February','March','April','May','June','July','August','September','October','November','December'];
const DIAS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const fFecha=ts=>{const d=new Date(ts*1000);
 return `${DIAS[d.getUTCDay()]}, ${MESES[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`};
const fCorta=ts=>{const d=new Date(ts*1000);return `${MESES[d.getUTCMonth()].slice(0,3)} ${d.getUTCDate()}`};
const fISO=ts=>new Date(ts*1000).toISOString().slice(0,10);
const HOY=fFecha(Math.floor(Date.now()/1000));
const cuenta=seg=>{
 if(seg<0)return 'Aired';
 const d=Math.floor(seg/86400),h=Math.floor((seg%86400)/3600),m=Math.floor((seg%3600)/60);
 if(d>0)return `${d}d ${h}h`;
 if(h>0)return `${h}h ${m}m`;
 return `${m}m`;
};

// ══ CSS ══
const CSS=`
:root{
 --sk:#f3a8c4;      /* sakura rosa */
 --sk2:#e87fa8;     /* rosa fuerte */
 --sk3:#fdeef4;     /* rosa muy claro */
 --gd:#c9a227;      /* dorado */
 --tx:#2b2028;      /* texto */
 --tx2:#8a7480;     /* texto suave */
 --bg:#fffbfd;      /* fondo */
 --bg2:#fdf5f8;     /* fondo suave */
 --bd:#f0dae4;      /* borde */
 --bd2:#f7e9ef;
 --sh:rgba(180,120,150,.16);
 --ok:#59b88a; --wr:#e0a44a;
}
*{margin:0;padding:0;box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Hiragino Sans',sans-serif;
 background:var(--bg);color:var(--tx);line-height:1.55;-webkit-font-smoothing:antialiased;
 letter-spacing:-.008em;overflow-x:hidden}
a{color:inherit;text-decoration:none}
::selection{background:var(--sk);color:#fff}
body.lock{overflow:hidden}
img{display:block;max-width:100%}

/* ══ PETALOS CAYENDO — 2 ejes: caida + giro 3D + vaiven ══ */
.petals{position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden;
 perspective:600px;contain:strict}
/* el <i> cae zigzagueando; el <b> de adentro gira en 3D.
   Todo es transform puro = lo mueve la GPU, no repinta nada */
.petal{position:absolute;top:0;will-change:transform;animation:linear infinite}
.petal b{display:block;width:14px;height:12px;opacity:.9;
 background:radial-gradient(ellipse at 32% 26%,#fff0f6,#ffc4dc 42%,#f3a8c4 72%,#e87fa8);
 border-radius:100% 12% 100% 12%;
 box-shadow:inset -1px -2px 3px rgba(200,110,150,.28);
 transform-style:preserve-3d;will-change:transform;
 animation:gira linear infinite}
/* tres rutas distintas para que no caigan todos igual */
@keyframes cae1{
 0%{transform:translate3d(0,-9vh,0)}   25%{transform:translate3d(3.2vw,22vh,0)}
 50%{transform:translate3d(-1.8vw,52vh,0)} 75%{transform:translate3d(3.6vw,82vh,0)}
 100%{transform:translate3d(-.8vw,113vh,0)}}
@keyframes cae2{
 0%{transform:translate3d(0,-9vh,0)}   30%{transform:translate3d(-2.6vw,28vh,0)}
 60%{transform:translate3d(2.4vw,64vh,0)} 100%{transform:translate3d(-3.4vw,113vh,0)}}
@keyframes cae3{
 0%{transform:translate3d(0,-9vh,0)}   20%{transform:translate3d(1.4vw,20vh,0)}
 45%{transform:translate3d(-3.8vw,46vh,0)} 70%{transform:translate3d(1.2vw,74vh,0)}
 100%{transform:translate3d(4.2vw,113vh,0)}}
/* el giro 3D: el petalo se voltea y por momentos se ve de canto */
@keyframes gira{
 0%{transform:rotate3d(1,.7,.3,0deg)}
 100%{transform:rotate3d(1,.7,.3,360deg)}}
/* pétalos grandes al frente, chicos al fondo — da profundidad */
.petal.f b{width:19px;height:16px;opacity:.95;filter:blur(.2px)}
.petal.d b{width:9px;height:8px;opacity:.5;filter:blur(1.1px)}
@media(prefers-reduced-motion:reduce){.petals{display:none}
 .hero .bgimg,.hero .glow,.hero .chica,.hero .shine i{animation:none!important}}

/* ══ HEADER ══ */
header{background:rgba(255,251,253,.9);backdrop-filter:saturate(180%) blur(18px);
 -webkit-backdrop-filter:saturate(180%) blur(18px);border-bottom:1px solid var(--bd);
 position:sticky;top:0;z-index:9000}
header:after{content:'';position:absolute;left:0;right:0;bottom:-2px;height:2px;
 background:linear-gradient(90deg,transparent,var(--sk),var(--gd),var(--sk),transparent)}
.hin{max-width:1180px;margin:0 auto;padding:0 24px;height:66px;display:flex;align-items:center;gap:26px}
.burger{display:none;flex-direction:column;justify-content:center;gap:5px;width:40px;height:40px;
 background:none;border:0;cursor:pointer;margin-left:-8px;flex-shrink:0}
.burger span{display:block;width:20px;height:2px;background:var(--tx);border-radius:2px;
 transition:transform .3s cubic-bezier(.16,1,.3,1),opacity .2s;margin:0 auto}
.burger.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.burger.open span:nth-child(2){opacity:0}
.burger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.lg{display:flex;align-items:center;gap:10px;flex-shrink:0;color:var(--tx)}
.lgt{font-size:1.32rem;font-weight:700;letter-spacing:-.03em}
.lgt em{font-style:normal;background:linear-gradient(120deg,var(--sk2),var(--gd));
 -webkit-background-clip:text;background-clip:text;color:transparent}
.jp{font-size:.62rem;color:var(--tx2);letter-spacing:.22em;display:block;margin-top:-3px;font-weight:600}
.hnav{display:flex;gap:24px;font-size:.89rem;font-weight:550;margin-left:8px}
.hnav a{color:var(--tx2);transition:color .2s;position:relative}
.hnav a:after{content:'';position:absolute;left:0;right:0;bottom:-6px;height:2px;
 background:var(--sk2);transform:scaleX(0);transition:transform .3s cubic-bezier(.16,1,.3,1);border-radius:2px}
.hnav a:hover{color:var(--tx)}.hnav a:hover:after{transform:scaleX(1)}
.upd{margin-left:auto;font-size:.74rem;color:var(--tx2);white-space:nowrap}
.scrim{display:none;position:fixed;inset:0;background:rgba(43,32,40,.42);z-index:9400;opacity:0;
 transition:opacity .3s;backdrop-filter:blur(3px)}
.scrim.on{display:block;opacity:1}
.drawer{position:fixed;top:0;left:0;bottom:0;width:min(85vw,310px);background:var(--bg);z-index:9500;
 transform:translateX(-100%);transition:transform .38s cubic-bezier(.32,.72,0,1);overflow-y:auto;
 box-shadow:2px 0 30px var(--sh)}
.drawer.on{transform:translateX(0)}
.dhead{display:flex;align-items:center;gap:10px;padding:20px 22px 18px;border-bottom:1px solid var(--bd);
 position:sticky;top:0;background:var(--bg)}
.dbody{padding:12px 12px 40px}
.dttl{font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:var(--sk2);padding:16px 12px 7px}
.drawer a{display:flex;align-items:center;justify-content:space-between;padding:11px 12px;font-size:.93rem;
 border-radius:11px;transition:background .16s}
.drawer a:active{background:var(--bg2)}
.drawer a .n{font-size:.76rem;color:var(--tx2)}
.dsep{height:1px;background:var(--bd);margin:10px 12px}

/* ══ HERO POR CAPAS (parallax + respiracion) ══ */
.hero{position:relative;min-height:min(78vh,560px);display:flex;align-items:center;
 overflow:hidden;background:linear-gradient(160deg,#fef7fa,#fdeef4 45%,#fce4ee);
 perspective:900px;isolation:isolate}
/* capa 1 — fondo: zoom lento infinito */
.hero .bgimg{position:absolute;inset:-3%;background-size:cover;background-position:center right;
 opacity:.94;z-index:1;will-change:transform;
 animation:kenburns 34s ease-in-out infinite alternate;
 transform:translate3d(var(--px,0px),var(--py,0px),0) scale(1.05)}
.hero .bgimg:after{content:'';position:absolute;inset:0;
 background:linear-gradient(100deg,rgba(255,251,253,.97) 0%,rgba(255,251,253,.86) 34%,rgba(255,251,253,.18) 62%,transparent 82%)}
@keyframes kenburns{
 0%{transform:translate3d(var(--px,0px),var(--py,0px),0) scale(1.045)}
 100%{transform:translate3d(calc(var(--px,0px) - 10px),calc(var(--py,0px) - 6px),0) scale(1.11)}}
/* capa 2 — luz calida del atardecer que late */
.hero .glow{position:absolute;z-index:2;right:26%;top:44%;width:52vw;height:52vw;
 max-width:620px;max-height:620px;transform:translate(50%,-50%);pointer-events:none;
 background:radial-gradient(circle,rgba(255,201,120,.5) 0%,rgba(255,167,150,.24) 34%,transparent 66%);
 mix-blend-mode:screen;will-change:opacity,transform;
 animation:breathe 7.5s ease-in-out infinite}
@keyframes breathe{0%,100%{opacity:.6;transform:translate(50%,-50%) scale(1)}
 50%{opacity:1;transform:translate(50%,-50%) scale(1.12)}}
/* capa 3 — la chica: entra flotando y respira */
.hero .chica{position:absolute;z-index:4;right:3.5vw;bottom:0;height:96%;width:auto;
 pointer-events:none;user-select:none;
 filter:drop-shadow(-14px 16px 26px rgba(150,80,110,.24));
 will-change:transform,opacity;
 animation:entra 1.25s cubic-bezier(.16,1,.3,1) both, flota 6.5s 1.25s ease-in-out infinite}
@keyframes entra{from{opacity:0;transform:translate3d(56px,18px,0) scale(1.03)}
 to{opacity:1;transform:none}}
@keyframes flota{0%,100%{transform:translate3d(var(--gx,0px),0,0)}
 50%{transform:translate3d(var(--gx,0px),-13px,0)}}
/* capa 4 — pelo/manga: brillo que barre */
.hero .shine{position:absolute;z-index:5;inset:0;pointer-events:none;overflow:hidden}
.hero .shine i{position:absolute;top:-40%;left:-30%;width:22%;height:190%;
 background:linear-gradient(100deg,transparent,rgba(255,255,255,.5),transparent);
 transform:rotate(14deg) translate3d(0,0,0);filter:blur(9px);
 animation:barre 9s 2s ease-in-out infinite}
@keyframes barre{0%{left:-30%;opacity:0}12%{opacity:.85}34%{left:118%;opacity:0}100%{left:118%;opacity:0}}
.hero .in{position:relative;z-index:6;max-width:1180px;margin:0 auto;padding:52px 24px;width:100%}
.hero h1{font-size:clamp(2rem,5.2vw,3.3rem);font-weight:800;letter-spacing:-.04em;line-height:1.07;
 max-width:15ch;margin-bottom:16px;
 animation:slideUp .7s cubic-bezier(.16,1,.3,1) both}
.hero h1 b{font-weight:800;background:linear-gradient(115deg,var(--sk2),var(--gd));
 -webkit-background-clip:text;background-clip:text;color:transparent}
.hero p{font-size:1.06rem;color:var(--tx2);max-width:40ch;margin-bottom:26px;
 animation:slideUp .7s .1s cubic-bezier(.16,1,.3,1) both}
.hero .cta{display:flex;gap:11px;flex-wrap:wrap;animation:slideUp .7s .2s cubic-bezier(.16,1,.3,1) both}
@keyframes slideUp{from{opacity:0;transform:translate3d(0,26px,0)}to{opacity:1;transform:none}}

/* ══ SIGUIENTE EPISODIO (destacado) ══ */
.next{position:relative;z-index:3;max-width:1180px;margin:-58px auto 0;padding:0 24px}
.nextc{background:#fff;border:1px solid var(--bd);border-radius:22px;padding:24px 26px;
 box-shadow:0 14px 44px var(--sh);display:flex;gap:20px;align-items:center;
 animation:slideUp .7s .3s cubic-bezier(.16,1,.3,1) both;position:relative;overflow:hidden}
.nextc:before{content:'';position:absolute;top:0;left:0;right:0;height:3px;
 background:linear-gradient(90deg,var(--sk),var(--gd),var(--sk2))}
.nextc .po{width:84px;flex-shrink:0;border-radius:12px;overflow:hidden;box-shadow:0 5px 18px var(--sh)}
.nextc .po img{width:100%;aspect-ratio:2/3;object-fit:cover}
.nextc .inf{flex:1;min-width:0}
.nextc .k{font-size:.68rem;text-transform:uppercase;letter-spacing:.11em;color:var(--sk2);font-weight:750;margin-bottom:5px}
.nextc .t{font-size:1.24rem;font-weight:700;letter-spacing:-.024em;line-height:1.24;margin-bottom:5px}
.nextc .d{font-size:.89rem;color:var(--tx2)}
.cdown{text-align:center;flex-shrink:0;padding-left:18px;border-left:1px solid var(--bd)}
.cdown .num{font-size:1.9rem;font-weight:800;letter-spacing:-.035em;line-height:1;
 background:linear-gradient(135deg,var(--sk2),var(--gd));-webkit-background-clip:text;background-clip:text;color:transparent;
 font-variant-numeric:tabular-nums}
.cdown .lb{font-size:.66rem;text-transform:uppercase;letter-spacing:.09em;color:var(--tx2);font-weight:650;margin-top:4px}

/* ══ LAYOUT ══ */
.shell{max-width:1180px;margin:0 auto;padding:0 24px;position:relative;z-index:2}
main{padding:44px 0 80px}
h2{font-size:1.5rem;font-weight:750;letter-spacing:-.03em;margin:58px 0 20px;
 display:flex;align-items:baseline;gap:13px;position:relative;padding-left:16px}
h2:before{content:'';position:absolute;left:0;top:.18em;bottom:.18em;width:4px;border-radius:3px;
 background:linear-gradient(var(--sk),var(--gd))}
h2:first-of-type{margin-top:6px}
h2 .ver{margin-left:auto;font-size:.84rem;font-weight:550;color:var(--sk2);white-space:nowrap;padding-left:10px}
h2 .ver:hover{text-decoration:underline}
h3{font-size:1.08rem;font-weight:700;letter-spacing:-.022em}
.crumb{font-size:.79rem;color:var(--tx2);margin-bottom:16px}
.crumb a:hover{color:var(--sk2)}
.sub{color:var(--tx2);font-size:1.02rem;margin-bottom:34px;max-width:64ch}

/* ══ TARJETAS ══ */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(184px,1fr));gap:18px}
.card{border-radius:17px;overflow:hidden;background:#fff;border:1px solid var(--bd2);
 transition:transform .34s cubic-bezier(.16,1,.3,1),box-shadow .34s,border-color .24s;
 display:flex;flex-direction:column;position:relative}
.card:hover{transform:translate3d(0,-6px,0);box-shadow:0 16px 38px var(--sh);border-color:var(--sk)}
.card .im{aspect-ratio:2/3;background:var(--bg2);position:relative;overflow:hidden}
.card .im img{width:100%;height:100%;object-fit:cover;transition:transform .5s cubic-bezier(.16,1,.3,1)}
.card:hover .im img{transform:scale(1.06)}
.card .im .ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;
 color:var(--sk);font-size:2.2rem;font-weight:800;background:var(--sk3)}
.card .ep{position:absolute;top:9px;right:9px;background:rgba(43,32,40,.82);color:#fff;
 font-size:.7rem;font-weight:700;padding:4px 9px;border-radius:980px;backdrop-filter:blur(6px);
 letter-spacing:.02em}
.card .sc{position:absolute;top:9px;left:9px;background:rgba(255,255,255,.94);color:var(--gd);
 font-size:.7rem;font-weight:750;padding:4px 8px;border-radius:980px;backdrop-filter:blur(6px)}
.card .bd{padding:12px 13px 14px;flex:1;display:flex;flex-direction:column}
.card .nm{font-size:.91rem;font-weight:650;letter-spacing:-.017em;line-height:1.32;margin-bottom:6px;
 display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card .tm{margin-top:auto;font-size:.76rem;font-weight:700;color:var(--sk2);
 display:inline-flex;align-items:center;gap:5px}
.card .tm.soon{color:var(--ok)}
.card .tm:before{content:'';width:5px;height:5px;border-radius:50%;background:currentColor;
 animation:pulse 2.2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.75)}}

/* ══ FILAS ══ */
.rows{border:1px solid var(--bd2);border-radius:17px;overflow:hidden;background:#fff}
.row{display:flex;align-items:center;gap:14px;padding:13px 16px;border-bottom:1px solid var(--bd2);
 transition:background .18s}
.row:last-child{border-bottom:0}
.row:hover{background:var(--sk3)}
.row .th{width:42px;height:60px;border-radius:8px;background:var(--bg2);flex-shrink:0;overflow:hidden}
.row .th img{width:100%;height:100%;object-fit:cover}
.row .in{flex:1;min-width:0}
.row .in .t{font-size:.93rem;font-weight:620;letter-spacing:-.016em;white-space:nowrap;
 overflow:hidden;text-overflow:ellipsis}
.row .in .s{font-size:.78rem;color:var(--tx2);margin-top:2px}
.row .rt{font-size:.79rem;font-weight:700;color:var(--sk2);white-space:nowrap;flex-shrink:0;
 font-variant-numeric:tabular-nums}

/* ══ CHIPS ══ */
.chips{display:grid;grid-template-columns:repeat(auto-fill,minmax(158px,1fr));gap:9px}
.chips a{border:1px solid var(--bd);border-radius:13px;padding:12px 14px;font-size:.87rem;
 font-weight:600;display:flex;align-items:center;justify-content:space-between;gap:8px;background:#fff;
 transition:transform .22s cubic-bezier(.16,1,.3,1),border-color .2s,background .2s,box-shadow .24s}
.chips a:hover{transform:translate3d(0,-3px,0);border-color:var(--sk);background:var(--sk3);
 box-shadow:0 8px 20px var(--sh)}
.chips a .n{font-size:.75rem;color:var(--tx2);font-variant-numeric:tabular-nums}

/* ══ FICHA ══ */
.showhd{display:flex;gap:26px;margin-bottom:26px;flex-wrap:wrap}
.showhd .po{width:200px;flex-shrink:0;border-radius:17px;overflow:hidden;background:var(--bg2);
 box-shadow:0 12px 34px var(--sh);position:relative}
.showhd .po img{width:100%;aspect-ratio:2/3;object-fit:cover}
.showhd .inf{flex:1;min-width:250px}
.showhd h1{font-size:clamp(1.5rem,3.6vw,2.1rem);font-weight:800;letter-spacing:-.034em;line-height:1.14}
.jptitle{font-size:.92rem;color:var(--tx2);margin-top:5px}
.meta{display:flex;flex-wrap:wrap;gap:7px;margin:14px 0 16px}
.meta span{font-size:.77rem;font-weight:650;padding:5px 12px;border-radius:980px;
 background:var(--sk3);color:var(--sk2);border:1px solid var(--bd)}
.meta span.gd{background:#fdf6e3;color:var(--gd);border-color:#f0e4c0}
.meta span.on{background:#e8f7ef;color:var(--ok);border-color:#cceadb}
.desc{font-size:.95rem;line-height:1.72;color:var(--tx)}
.box{border:1px solid var(--bd2);border-radius:18px;padding:22px 24px;margin:22px 0;background:#fff}
.box h3{margin-bottom:12px}
.box p{font-size:.94rem;line-height:1.7}
.box p+p{margin-top:11px}
.box.big{background:linear-gradient(135deg,#fdeef4,#fce4ee);border-color:var(--sk)}

/* ══ CUENTA REGRESIVA GRANDE ══ */
.bigcd{display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin:18px 0 4px}
.bigcd div{background:#fff;border:1px solid var(--bd);border-radius:14px;padding:15px 8px;text-align:center}
.bigcd .v{font-size:1.7rem;font-weight:800;letter-spacing:-.04em;line-height:1;
 background:linear-gradient(135deg,var(--sk2),var(--gd));-webkit-background-clip:text;background-clip:text;
 color:transparent;font-variant-numeric:tabular-nums}
.bigcd .l{font-size:.64rem;text-transform:uppercase;letter-spacing:.1em;color:var(--tx2);
 font-weight:700;margin-top:6px}

/* ══ TABLA ══ */
.tb{width:100%;border-collapse:collapse;font-size:.9rem}
.tb th{text-align:left;font-size:.67rem;text-transform:uppercase;letter-spacing:.07em;color:var(--tx2);
 font-weight:750;padding:0 12px 10px 0;border-bottom:1px solid var(--bd)}
.tb td{padding:12px 12px 12px 0;border-bottom:1px solid var(--bd2)}
.tb tr:last-child td{border-bottom:0}
.tb .ep{font-weight:750;color:var(--sk2);white-space:nowrap;font-variant-numeric:tabular-nums}
.tb .da{white-space:nowrap;color:var(--tx2)}

/* ══ BUSCADOR ══ */
.finder{background:linear-gradient(135deg,var(--sk3),#fdf0f6);border-radius:18px;padding:24px;
 margin-bottom:22px;border:1px solid var(--bd)}
#q{width:100%;padding:14px 17px;border-radius:12px;border:1px solid var(--bd);font-size:16px;
 font-family:inherit;background:#fff;transition:border-color .2s,box-shadow .2s}
#q:focus{outline:none;border-color:var(--sk2);box-shadow:0 0 0 4px rgba(232,127,168,.14)}
#res{margin-top:13px}

/* ══ FAQ ══ */
.faq details{border:1px solid var(--bd2);border-radius:14px;margin-bottom:9px;overflow:hidden;background:#fff}
.faq summary{padding:15px 18px;font-size:.95rem;font-weight:650;cursor:pointer;list-style:none;
 display:flex;align-items:center;gap:12px;transition:background .18s}
.faq summary::-webkit-details-marker{display:none}
.faq summary:after{content:'✦';margin-left:auto;font-size:.9rem;color:var(--sk);
 transition:transform .34s cubic-bezier(.16,1,.3,1)}
.faq details[open] summary:after{transform:rotate(180deg) scale(1.15)}
.faq summary:hover{background:var(--sk3)}
.faq details[open] summary{border-bottom:1px solid var(--bd2)}
.faq p{padding:14px 18px 18px;font-size:.92rem;line-height:1.7}

/* ══ BOTONES ══ */
.btn{display:inline-flex;align-items:center;gap:8px;
 background:linear-gradient(120deg,var(--sk2),#d9689a);color:#fff;border:0;
 padding:13px 26px;border-radius:980px;font-size:.92rem;font-weight:650;font-family:inherit;
 cursor:pointer;box-shadow:0 6px 20px rgba(232,127,168,.34);
 transition:transform .24s cubic-bezier(.16,1,.3,1),box-shadow .28s}
.btn:hover{transform:translate3d(0,-2px,0);box-shadow:0 10px 28px rgba(232,127,168,.42)}
.btn:active{transform:scale(.97)}
.btn.g{background:#fff;color:var(--tx);border:1px solid var(--bd);box-shadow:0 4px 14px var(--sh)}
.btn.g:hover{background:var(--sk3);border-color:var(--sk)}
.up{position:fixed;right:18px;bottom:18px;width:46px;height:46px;border-radius:50%;
 background:linear-gradient(135deg,var(--sk2),var(--gd));color:#fff;border:0;cursor:pointer;z-index:8000;
 display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px var(--sh);
 opacity:0;pointer-events:none;transform:translate3d(0,14px,0) scale(.85);
 transition:opacity .3s,transform .34s cubic-bezier(.16,1,.3,1)}
.up.on{opacity:1;pointer-events:auto;transform:none}
.up svg{width:18px;height:18px}

/* ══ REVEAL ══ */
@media(prefers-reduced-motion:no-preference){
 .rv{opacity:0;will-change:transform,opacity}
 .rv.on{animation:slideUp .62s cubic-bezier(.16,1,.3,1) both}
}

/* ══ FOOTER ══ */
footer{border-top:1px solid var(--bd);margin-top:70px;padding:40px 24px 48px;
 font-size:.85rem;color:var(--tx2);background:var(--bg2);position:relative}
footer:before{content:'';position:absolute;top:0;left:0;right:0;height:2px;
 background:linear-gradient(90deg,transparent,var(--sk),var(--gd),var(--sk),transparent)}
.fin{max-width:1180px;margin:0 auto}
.fnav{display:flex;gap:20px;margin-top:14px;flex-wrap:wrap}
.fnav a:hover{color:var(--sk2)}

/* ══ COOKIES ══ */
#ck{position:fixed;left:16px;right:16px;bottom:16px;max-width:520px;margin:0 auto;background:#fff;
 border:1px solid var(--bd);border-radius:18px;padding:18px 20px;box-shadow:0 16px 48px var(--sh);
 z-index:9700;display:none;font-size:.86rem;line-height:1.55}
#ck.on{display:block;animation:slideUp .5s cubic-bezier(.16,1,.3,1) both}
#ck a{color:var(--sk2);text-decoration:underline}
.ckb{display:flex;gap:9px;margin-top:14px;flex-wrap:wrap}
.ckb button{flex:1;min-width:118px;padding:11px 18px;border-radius:980px;font-size:.87rem;
 font-family:inherit;font-weight:650;cursor:pointer;border:1px solid var(--bd);background:#fff;color:var(--tx)}
.ckb #ckSi{background:linear-gradient(120deg,var(--sk2),#d9689a);color:#fff;border-color:transparent}

/* ══ LEGAL ══ */
.legal{max-width:740px}
.legal h2{font-size:1.14rem;margin:30px 0 10px;padding-left:14px}
.legal p,.legal li{font-size:.93rem;line-height:1.75;margin-bottom:11px}
.legal ul{padding-left:22px}

/* ══ MOVIL ══ */
@media(max-width:1000px){.burger{display:flex}.hnav{display:none}}
@media(max-width:734px){
 .hin{height:58px;gap:10px;padding:0 14px}.lgt{font-size:1.14rem}.upd{display:none}
 .hero{min-height:auto;padding-bottom:150px}
 .hero .in{padding:40px 16px 20px}
 .hero .bgimg{background-position:72% center}
 .hero .bgimg:after{background:linear-gradient(172deg,rgba(255,251,253,.95) 0%,rgba(255,251,253,.84) 40%,rgba(255,251,253,.3) 74%,transparent 100%)}
 .hero p{font-size:.96rem;margin-bottom:20px}
 /* en movil la chica se va abajo a la derecha, chiquita, sin tapar el texto */
 .hero .chica{height:auto;width:min(46vw,215px);right:-2vw;bottom:-6px;
  filter:drop-shadow(-8px 10px 16px rgba(150,80,110,.2))}
 .hero .glow{right:14%;top:60%;width:74vw;height:74vw}
 .hero .shine{display:none}
 .next{margin-top:-40px;padding:0 14px}
 .nextc{padding:17px;gap:13px;border-radius:17px;flex-wrap:wrap}
 .nextc .po{width:60px}
 .nextc .t{font-size:1.04rem}
 .cdown{padding-left:0;border-left:0;border-top:1px solid var(--bd);padding-top:12px;width:100%;
  display:flex;align-items:baseline;justify-content:center;gap:9px}
 .cdown .num{font-size:1.4rem}.cdown .lb{margin-top:0}
 .shell{padding:0 14px}main{padding:32px 0 60px}
 h2{font-size:1.24rem;margin:42px 0 16px;padding-left:13px}
 .grid{grid-template-columns:repeat(auto-fill,minmax(138px,1fr));gap:12px}
 .card .nm{font-size:.85rem}.card .bd{padding:10px 11px 12px}
 .card .ep,.card .sc{font-size:.64rem;padding:3px 7px}
 .row{padding:11px 13px;gap:11px}.row .th{width:36px;height:52px}
 .row .in .t{font-size:.88rem}
 .chips{grid-template-columns:1fr 1fr}
 .showhd{gap:16px}.showhd .po{width:126px}
 .box{padding:17px 18px;border-radius:15px}
 .bigcd{gap:7px}.bigcd div{padding:12px 4px;border-radius:11px}.bigcd .v{font-size:1.28rem}
 .bigcd .l{font-size:.58rem;letter-spacing:.06em}
 .finder{padding:18px}
 .tb{font-size:.85rem}.tb th:nth-child(3),.tb td:nth-child(3){display:none}
 .up{right:14px;bottom:14px}
 .petal{width:10px;height:10px}
}
@media(max-width:400px){.grid{grid-template-columns:1fr 1fr;gap:10px}}
`;

const LOGO='<svg viewBox="0 0 34 34" width="30" height="30" fill="none" aria-hidden="true"><g><circle cx="17" cy="8.4" r="4.6" fill="#f3a8c4"/><circle cx="25.2" cy="14.3" r="4.6" fill="#f0b8cd"/><circle cx="22" cy="24" r="4.6" fill="#f3a8c4"/><circle cx="12" cy="24" r="4.6" fill="#f0b8cd"/><circle cx="8.8" cy="14.3" r="4.6" fill="#f3a8c4"/><circle cx="17" cy="17" r="3.5" fill="#c9a227"/></g></svg>';

let SIDE='',DRAWER='',PRE='';
// [izq vw, dur caida s, retraso s, dur giro s, ruta 1-3, capa]
const PETALOS=(()=>{let h='<div class="petals" aria-hidden="true">';
 const cfg=[
  [ 3,13,0  ,2.6,1,'f'],[11,17,2.1,4.1,2,'d'],[19,10,5.3,1.9,3,'' ],
  [27,15,1.2,3.3,2,'' ],[35,12,6.4,2.2,1,'f'],[43,18,3.7,4.8,3,'d'],
  [51,11,0.8,2.0,3,'' ],[58,14,4.9,3.6,1,'' ],[66,16,2.6,4.2,2,'d'],
  [73,10,7.1,1.7,1,'f'],[81,15,1.9,3.1,3,'' ],[88,12,5.8,2.4,2,'' ],
  [95,17,3.2,4.5,1,'d'],[ 7,11,8.2,2.1,2,'' ],[63,13,6.9,2.8,3,'f']];
 cfg.forEach(([l,d,de,gr,ru,cl])=>{
  h+=`<i class="petal ${cl}" style="left:${l}vw;animation-name:cae${ru};animation-duration:${d}s;animation-delay:-${de}s">`+
     `<b style="animation-duration:${gr}s;animation-delay:-${de}s"></b></i>`});
 return h+'</div>'})();

const HEAD=(t,d,c,r,nx,hp)=>`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${e(t)}</title><meta name="description" content="${e(d)}"><link rel="canonical" href="${c}">${nx?'<meta name="robots" content="noindex,follow">':''}${MVERIFY}<meta property="og:title" content="${e(t)}"><meta property="og:description" content="${e(d)}"><meta property="og:type" content="website"><meta property="og:url" content="${c}"><meta property="og:site_name" content="${N}"><meta property="og:locale" content="en_US"><meta property="og:image" content="${DOM}/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${e(t)}"><meta name="twitter:image" content="${DOM}/og.png"><meta name="theme-color" content="#fffbfd"><link rel="icon" href="${r}favicon.ico" sizes="32x32"><link rel="icon" type="image/svg+xml" href="${r}favicon.svg"><link rel="manifest" href="${r}manifest.json"><link rel="apple-touch-icon" href="${r}icon-192.png"><link rel="preconnect" href="https://s4.anilist.co">${hp?PRE:''}<link rel="stylesheet" href="${r}s.css"></head><body>
${PETALOS}
<header><div class="hin">
<button class="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>
<a href="${r}" class="lg">${LOGO}<span><span class="lgt">Sakura<em>Air</em></span><span class="jp">アニメ放送</span></span></a>
<nav class="hnav"><a href="${r}">Airing now</a><a href="${r}schedule">Schedule</a><a href="${r}season">This season</a><a href="${r}genres">Genres</a></nav>
<span class="upd">Updated ${HOY}</span>
</div></header>
<div class="scrim" id="scrim"></div>
<aside class="drawer" id="drawer"><div class="dhead">${LOGO}<span class="lgt">Sakura<em>Air</em></span></div><div class="dbody">${DRAWER.replace(/href="/g,'href="'+r)}</div></aside>`;

const FOOT=(r)=>`<footer><div class="fin"><p><strong>${N}</strong> — Anime episode countdowns, air dates and seasonal schedules.</p>
<p style="margin-top:8px">Data from the AniList public API. Air times can shift; check the official broadcast before planning. Last updated ${HOY}.</p>
<nav class="fnav"><a href="${r}about">About</a><a href="${r}privacy">Privacy</a><a href="${r}terms">Terms</a><a href="${r}contact">Contact</a></nav></div></footer>
<div id="ck" role="dialog" aria-label="Cookie notice"><p>We use cookies and third-party services to show ads and measure traffic. See our <a href="${r}privacy">privacy policy</a>.</p><div class="ckb"><button id="ckNo" type="button">Necessary only</button><button id="ckSi" type="button">Accept</button></div></div>
<button class="up" id="up" type="button" aria-label="Back to top"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>
<script>(function(){var b=document.getElementById('burger'),d=document.getElementById('drawer'),s=document.getElementById('scrim');
function t(o){b.classList.toggle('open',o);d.classList.toggle('on',o);s.classList.toggle('on',o);document.body.classList.toggle('lock',o)}
if(b){b.addEventListener('click',function(){t(!d.classList.contains('on'))});s.addEventListener('click',function(){t(false)});
document.addEventListener('keydown',function(ev){if(ev.key==='Escape')t(false)});d.addEventListener('click',function(ev){if(ev.target.closest('a'))t(false)})}
var KEY='ck_sa',box=document.getElementById('ck');
var _adsYa=false;
function _iny(){if(_adsYa)return;var Z=window.__ZONAS;if(!Z||!Z.length)return;
 var host=document.body||document.documentElement;if(!host)return;_adsYa=true;
 for(var i=0;i<Z.length;i++){(function(sc,zn){
  if(zn[1]){sc.dataset.zone=zn[1]}else{sc.setAttribute('data-cfasync','false');sc.async=true}
  sc.src='https://'+zn[0]})(host.appendChild(document.createElement('script')),Z[i])}}
function ads(){if(window.__ZONAS&&document.body){_iny();return}
 if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){_iny()},{once:true})}
 else{setTimeout(_iny,0)}}
try{var v=localStorage.getItem(KEY);
 if(v==='1'){ads()}else if(v!=='0'&&box){box.classList.add('on')}
 if(box){document.getElementById('ckSi').addEventListener('click',function(){try{localStorage.setItem(KEY,'1')}catch(e){}box.classList.remove('on');ads()});
 document.getElementById('ckNo').addEventListener('click',function(){try{localStorage.setItem(KEY,'0')}catch(e){}box.classList.remove('on')})}
}catch(e){}
var ub=document.getElementById('up');
if(ub){var vis=false,tick=false;
 function chk(){var y=window.pageYOffset||document.documentElement.scrollTop;var q=y>600;
  if(q!==vis){vis=q;ub.classList.toggle('on',q)}tick=false}
 addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(chk)}},{passive:true});
 ub.addEventListener('click',function(){scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'})});chk()}
if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion:reduce)').matches){
 var io=new IntersectionObserver(function(en){en.forEach(function(x){
  if(x.isIntersecting){x.target.classList.add('on');io.unobserve(x.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.05});
 document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
} else {document.querySelectorAll('.rv').forEach(function(el){el.classList.add('on')})}
// ── parallax del hero: fondo y chica se mueven a distinta velocidad
(function(){var h=document.getElementById('hero');
 if(!h||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 var bg=h.querySelector('.bgimg'),ch=h.querySelector('.chica');
 if(!bg)return;
 var mx=0,my=0,cx=0,cy=0,run=false,vis=true;
 function loop(){cx+=(mx-cx)*.075;cy+=(my-cy)*.075;
  bg.style.setProperty('--px',(cx*-16).toFixed(2)+'px');
  bg.style.setProperty('--py',(cy*-10).toFixed(2)+'px');
  if(ch)ch.style.setProperty('--gx',(cx*7).toFixed(2)+'px');
  if(Math.abs(mx-cx)>.002||Math.abs(my-cy)>.002){requestAnimationFrame(loop)}else{run=false}}
 function kick(){if(!run&&vis){run=true;requestAnimationFrame(loop)}}
 h.addEventListener('pointermove',function(ev){var r=h.getBoundingClientRect();
  mx=(ev.clientX-r.left)/r.width*2-1;my=(ev.clientY-r.top)/r.height*2-1;kick()},{passive:true});
 h.addEventListener('pointerleave',function(){mx=0;my=0;kick()},{passive:true});
 // en movil: se inclina con el giroscopio
 if(window.DeviceOrientationEvent&&matchMedia('(hover:none)').matches){
  addEventListener('deviceorientation',function(ev){
   if(ev.gamma==null)return;
   mx=Math.max(-1,Math.min(1,ev.gamma/26));my=Math.max(-1,Math.min(1,((ev.beta||45)-45)/26));kick()},{passive:true})}
 // apagar todo cuando el hero sale de pantalla (no quema bateria)
 if('IntersectionObserver' in window){new IntersectionObserver(function(en){
  vis=en[0].isIntersecting;h.style.animationPlayState=vis?'':'paused';
  h.querySelectorAll('.bgimg,.glow,.chica,.shine i').forEach(function(el){
   el.style.animationPlayState=vis?'running':'paused'});
  if(vis)kick()},{threshold:0}).observe(h)}
})();
// ── pausar los petalos si la pestaña esta en segundo plano
document.addEventListener('visibilitychange',function(){
 var st=document.hidden?'paused':'running';
 document.querySelectorAll('.petal,.petal b').forEach(function(el){el.style.animationPlayState=st})});
// cuenta regresiva viva
function tick2(){var now=Math.floor(Date.now()/1000);
 document.querySelectorAll('[data-at]').forEach(function(el){
  var s=+el.getAttribute('data-at')-now;
  if(s<0){el.textContent='Aired';return}
  var d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),sec=s%60;
  if(el.dataset.f==='full'){
   var p=el.parentNode.parentNode;
   var vs=p.querySelectorAll('.v');
   if(vs.length===4){vs[0].textContent=d;vs[1].textContent=h;vs[2].textContent=m;vs[3].textContent=sec}
  } else el.textContent=d>0?d+'d '+h+'h':(h>0?h+'h '+m+'m':m+'m '+sec+'s');
 })}
tick2();setInterval(tick2,1000);
})();<\/script>
<script>window.__ZONAS=${JSON.stringify(ZONAS)};<\/script>`;

const L=(t,d,c,b,r='',nx=false)=>HEAD(t,d,c,r,nx)+`<div class="shell"><main>${b}</main></div>`+FOOT(r);
const LH=(t,d,c,hero,b,r='')=>HEAD(t,d,c,r,false,true)+hero+`<div class="shell"><main>${b}</main></div>`+FOOT(r);

// ══ PNG ══
const FK='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$.,-:/|!?()+% ';
const FD='ehhvhhhuhhuhhuehgggheuhhhhhuvgguggvvggugggehgnhhfhhhvhhhe44444e72222ichikokihggggggvhrllhhhhpljhhhehhhhheuhhugggehhhliduhhukihfgge11uv444444hhhhhhehhhhha4hhhllrhhha4ahhhha4444v1248gvehjlphe4c4444eeh1248vv2421he26aiv22vgu11he68guhhev124888ehhehheehhf12c4fke5u400000cc0000c48000v0000cc0cc0122488g44444444444404eh1640424888428422248044v440h1248gh0000000';
const AL='0123456789abcdefghijklmnopqrstuv';
const GLY={};
for(let i=0;i<FK.length;i++){const r=[];for(let j=0;j<7;j++)r.push(AL.indexOf(FD[i*7+j]));GLY[FK[i]]=r}
const SS=2;
function _lz(w,h,r,g,b){const W=w*SS,H=h*SS,p=Buffer.alloc(W*H*3);
 for(let i=0;i<W*H;i++){p[i*3]=r;p[i*3+1]=g;p[i*3+2]=b}return{w,h,W,H,p}}
function _rc(c,x,y,w,h,r,g,b){const X=Math.round(x*SS),Y=Math.round(y*SS),Wd=Math.round(w*SS),Ht=Math.round(h*SS);
 for(let j=Y;j<Y+Ht;j++){if(j<0||j>=c.H)continue;for(let i=X;i<X+Wd;i++){if(i<0||i>=c.W)continue;
  const k=(j*c.W+i)*3;c.p[k]=r;c.p[k+1]=g;c.p[k+2]=b}}}
function _ci(c,cx,cy,rad,r,g,b){const X=cx*SS,Y=cy*SS,R=rad*SS;
 for(let j=Math.max(0,Y-R);j<Math.min(c.H,Y+R);j++)for(let i=Math.max(0,X-R);i<Math.min(c.W,X+R);i++){
  const dx=i-X,dy=j-Y;if(dx*dx+dy*dy<=R*R){const k=(j*c.W+i)*3;c.p[k]=r;c.p[k+1]=g;c.p[k+2]=b}}}
const ACC=t=>String(t).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function _tx(c,t,x0,y0,es,r,g,b){let x=x0;
 for(const ch of ACC(t)){const gl=GLY[ch];
  if(gl)for(let ry=0;ry<7;ry++)for(let rx=0;rx<5;rx++){if((gl[ry]>>(4-rx))&1)_rc(c,x+rx*es,y0+ry*es,es,es,r,g,b)}
  x+=6*es}return x}
const _an=(t,es)=>String(t).length*6*es-es;
const _fit=(t,max,ini)=>{let e2=ini;while(e2>1&&_an(t,e2)>max)e2--;return e2};
function _png(c){
 const w=c.w,h=c.h,out=Buffer.alloc(w*h*3),n=SS*SS;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let R=0,G=0,B=0;
  for(let j=0;j<SS;j++)for(let i=0;i<SS;i++){const k=(((y*SS+j)*c.W)+(x*SS+i))*3;R+=c.p[k];G+=c.p[k+1];B+=c.p[k+2]}
  const o=(y*w+x)*3;out[o]=R/n;out[o+1]=G/n;out[o+2]=B/n}
 const raw=Buffer.alloc(h*(w*3+1));
 for(let y=0;y<h;y++){raw[y*(w*3+1)]=0;out.copy(raw,y*(w*3+1)+1,y*w*3,(y+1)*w*3)}
 const T=[];for(let m=0;m<256;m++){let k=m;for(let j=0;j<8;j++)k=k&1?0xEDB88320^(k>>>1):k>>>1;T[m]=k>>>0}
 const crc=b=>{let k=0xFFFFFFFF;for(const x of b)k=T[(k^x)&255]^(k>>>8);return(k^0xFFFFFFFF)>>>0};
 const ck=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);
  const cb=Buffer.alloc(4);cb.writeUInt32BE(crc(td));return Buffer.concat([l,td,cb])};
 const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=2;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),ck('IHDR',ih),
  ck('IDAT',z.deflateSync(raw,{level:9})),ck('IEND',Buffer.alloc(0))]);}
function iconPNG(px){
 const S=px/512,c=_lz(px,px,253,238,244);
 const CI=(x,y,r,R,G,B)=>_ci(c,x*S,y*S,r*S,R,G,B);
 CI(256,126,70,243,168,196); CI(379,215,70,240,184,205);
 CI(331,360,70,243,168,196); CI(181,360,70,240,184,205);
 CI(133,215,70,243,168,196); CI(256,256,52,201,162,39);
 return _png(c);}

// ══ HISTORIAL ══
let H={dates:[],anime:{}};
try{H=JSON.parse(f.readFileSync(HIST,'utf8'))}catch(x){}

// ══ DESCARGA con reintentos ══
async function gql(query,variables={},intentos=5){
 for(let i=1;i<=intentos;i++){
  try{
   const ctrl=new AbortController();
   const t=setTimeout(()=>ctrl.abort(),40000);
   const r=await fetch('https://graphql.anilist.co',{
    method:'POST',signal:ctrl.signal,
    headers:{'Content-Type':'application/json','Accept':'application/json','User-Agent':'SakuraAir/1.0'},
    body:JSON.stringify({query,variables})});
   clearTimeout(t);
   if(r.status===429){const w=(i*8);console.log(`   rate limit — esperando ${w}s...`);
    await new Promise(x=>setTimeout(x,w*1000));continue}
   if(!r.ok)throw new Error('HTTP '+r.status);
   const j=await r.json();
   if(j.errors)throw new Error(j.errors[0].message);
   return j.data;
  }catch(err){
   const m=(err&&err.cause&&err.cause.code)||err.code||err.message||'error';
   if(i===intentos)throw new Error(`AniList fallo tras ${intentos} intentos: ${m}`);
   const w=i*3;
   console.log(`   intento ${i}/${intentos} fallo (${m}) — reintentando en ${w}s...`);
   await new Promise(x=>setTimeout(x,w*1000));
  }
 }
}

(async()=>{
console.log(`\n🌸 Building ${N}...\n📥 Fetching AniList:`);

const Q=`query($page:Int){Page(page:$page,perPage:50){pageInfo{hasNextPage total}
media(type:ANIME,status:RELEASING,sort:POPULARITY_DESC){
 id idMal title{romaji english native} description(asHtml:false)
 episodes duration format season seasonYear averageScore meanScore popularity favourites
 genres countryOfOrigin isAdult
 coverImage{large medium color} bannerImage
 startDate{year month day}
 nextAiringEpisode{episode airingAt timeUntilAiring}
 studios(isMain:true){nodes{name}}
 externalLinks{site url}
}}}`;

let ANIME=[],page=1;
while(page<=8){
 const d=await gql(Q,{page});
 const m=d.Page.media.filter(a=>!a.isAdult&&a.nextAiringEpisode);
 ANIME.push(...m);
 process.stdout.write(`   page ${page} — ${ANIME.length} anime\r`);
 if(!d.Page.pageInfo.hasNextPage)break;
 page++;
 await new Promise(r=>setTimeout(r,700));
}
console.log(`   ✓ ${ANIME.length} currently airing anime with a scheduled episode     `);

// normalizar
const A=ANIME.map(a=>({
 id:a.id, mal:a.idMal,
 t:a.title.english||a.title.romaji,
 tr:a.title.romaji, tj:a.title.native||'',
 slug:(s(a.title.romaji)||'anime')+'-'+a.id,
 desc:strip(a.description).slice(0,600),
 eps:a.episodes||0, dur:a.duration||0, fmt:a.format||'TV',
 season:a.season?`${a.season[0]}${a.season.slice(1).toLowerCase()} ${a.seasonYear}`:'',
 sc:a.averageScore||0, pop:a.popularity||0, fav:a.favourites||0,
 gen:a.genres||[], jp:a.countryOfOrigin==='JP',
 img:a.coverImage?.large||a.coverImage?.medium||'',
 col:a.coverImage?.color||'#f3a8c4',
 ban:a.bannerImage||'',
 ep:a.nextAiringEpisode.episode,
 at:a.nextAiringEpisode.airingAt,
 studio:a.studios?.nodes?.[0]?.name||'',
 links:(a.externalLinks||[]).filter(l=>['Crunchyroll','Netflix','Hulu','Funimation','HIDIVE','Official Site'].includes(l.site)).slice(0,3)
})).sort((x,y)=>x.at-y.at);

// historial
if(H.dates[H.dates.length-1]!==HOY_ISO)H.dates.push(HOY_ISO);
if(H.dates.length>60)H.dates=H.dates.slice(-60);
A.forEach(a=>{const k=String(a.id);
 if(!H.anime[k])H.anime[k]={first:HOY_ISO};
 H.anime[k].seen=HOY_ISO;H.anime[k].ep=a.ep});
try{f.writeFileSync(HIST,JSON.stringify(H))}catch(x){}
console.log(`   ✓ history: ${H.dates.length} day(s), ${Object.keys(H.anime).length} anime known`);

// indices
const byGen={},byDay={},byStudio={};
const DOW=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
A.forEach(a=>{
 a.gen.forEach(g=>(byGen[g]=byGen[g]||[]).push(a));
 const d=DOW[new Date(a.at*1000).getUTCDay()];
 a.day=d;(byDay[d]=byDay[d]||[]).push(a);
 if(a.studio)(byStudio[a.studio]=byStudio[a.studio]||[]).push(a);
});
const gens=Object.entries(byGen).filter(([,v])=>v.length>=3).sort((a,b)=>b[1].length-a[1].length);
const studios=Object.entries(byStudio).filter(([,v])=>v.length>=2).sort((a,b)=>b[1].length-a[1].length);

DRAWER=`<a href="">Airing now</a><a href="schedule">Weekly schedule</a><a href="season">This season</a><a href="genres">All genres</a><div class="dsep"></div><div class="dttl">Days</div>`+
 DOW.map(d=>byDay[d]?`<a href="day-${s(d)}">${d}<span class="n">${byDay[d].length}</span></a>`:'').join('')+
 `<div class="dttl">Top genres</div>`+gens.slice(0,10).map(([g,v])=>`<a href="genre-${s(g)}">${g}<span class="n">${v.length}</span></a>`).join('');

f.rmSync(O,{recursive:true,force:true});f.mkdirSync(O,{recursive:true});
// ── capas del hero: si no estan locales se bajan del repo (asi build.js viaja solo)
const CAPAS={};
for(const x of ['bg.webp','girl.webp']){
 const loc=P.join(__dirname,x);
 if(f.existsSync(loc)){f.copyFileSync(loc,P.join(O,x));CAPAS[x]=1;continue}
 try{
  const r=await fetch(`https://raw.githubusercontent.com/rekiquezada39-ui/sakuraair/main/${x}`);
  if(r.ok){const b=Buffer.from(await r.arrayBuffer());
   f.writeFileSync(loc,b);f.writeFileSync(P.join(O,x),b);CAPAS[x]=1;
   console.log(`   \u2713 ${x} (${(b.length/1024).toFixed(0)} KB)`)}
 }catch(err){}
}
const HAY_BG=!!CAPAS['bg.webp'],HAY_GIRL=!!CAPAS['girl.webp'];
PRE=(HAY_GIRL?'<link rel="preload" as="image" href="girl.webp" type="image/webp" fetchpriority="high">':'')
   +(HAY_BG?'<link rel="preload" as="image" href="bg.webp" type="image/webp">':'');
if(!HAY_BG||!HAY_GIRL)console.log(`   \u26a0 faltan capas (fondo:${HAY_BG?'si':'no'} chica:${HAY_GIRL?'si':'no'}) — el hero usa el degradado`);

console.log('📄 Generating HTML:');

// ── componentes
const img=a=>a.img?`<img src="${e(a.img)}" alt="${e(a.t)} cover" loading="lazy" width="184" height="276">`
 :`<div class="ph">${e(a.t.slice(0,1))}</div>`;
const card=(a,r='')=>`<a class="card" href="${r}anime/${a.slug}">
<div class="im">${img(a)}<span class="ep">EP ${a.ep}</span>${a.sc?`<span class="sc">★ ${(a.sc/10).toFixed(1)}</span>`:''}</div>
<div class="bd"><div class="nm">${e(a.t)}</div>
<span class="tm${a.at-Math.floor(Date.now()/1000)<86400?' soon':''}" data-at="${a.at}">${cuenta(a.at-Math.floor(Date.now()/1000))}</span></div></a>`;
const grid=(arr,r='')=>`<div class="grid">${arr.map(a=>card(a,r)).join('')}</div>`;
const row=(a,r='')=>`<a class="row" href="${r}anime/${a.slug}">
<div class="th">${img(a)}</div>
<div class="in"><div class="t">${e(a.t)}</div><div class="s">Episode ${a.ep}${a.studio?' · '+e(a.studio):''}</div></div>
<div class="rt" data-at="${a.at}">${cuenta(a.at-Math.floor(Date.now()/1000))}</div></a>`;
const rows=(arr,r='')=>`<div class="rows">${arr.map(a=>row(a,r)).join('')}</div>`;

const prox=A[0];
const now=Math.floor(Date.now()/1000);
const hoy=A.filter(a=>fISO(a.at)===HOY_ISO);
const sem=A.filter(a=>a.at-now<=604800);
const top=[...A].filter(a=>a.sc>=75).sort((a,b)=>b.pop-a.pop);

f.writeFileSync(P.join(O,'search.json'),JSON.stringify(A.map(a=>[a.t,a.slug,a.ep,a.at])));

const HERO=`<section class="hero" id="hero">
${HAY_BG?`<div class="bgimg" style="background-image:url('bg.webp')"></div>`:''}
<div class="glow" aria-hidden="true"></div>
${HAY_GIRL?`<img class="chica" src="girl.webp" alt="" width="432" height="820" fetchpriority="high" decoding="async">
<div class="shine" aria-hidden="true"><i></i></div>`:''}
<div class="in">
<h1>When does the <b>next episode</b> come out?</h1>
<p>Live countdowns for ${A.length} currently airing anime. Know the exact minute your show drops.</p>
<div class="cta"><a class="btn" href="#now">See what's airing</a><a class="btn g" href="schedule">Weekly schedule</a></div>
</div></section>
${prox?`<div class="next"><div class="nextc">
<div class="po">${img(prox)}</div>
<div class="inf"><div class="k">Next episode worldwide</div>
<div class="t">${e(prox.t)}</div>
<div class="d">Episode ${prox.ep} · ${fFecha(prox.at)}${prox.studio?' · '+e(prox.studio):''}</div></div>
<div class="cdown"><div class="num" data-at="${prox.at}">${cuenta(prox.at-now)}</div><div class="lb">remaining</div></div>
</div></div>`:''}`;

const JLD=`<script type="application/ld+json">${JSON.stringify([
 {'@context':'https://schema.org','@type':'WebSite',name:N,
  alternateName:['Sakura Air','sakuraair','Anime Countdown'],url:DOM+'/',inLanguage:'en-US',
  description:'Live anime episode countdowns and air dates. Updated daily.',
  publisher:{'@type':'Organization',name:N,url:DOM+'/'}},
 {'@context':'https://schema.org','@type':'Organization',name:N,url:DOM+'/',
  logo:{'@type':'ImageObject',url:DOM+'/icon-512.png',width:512,height:512},email:MAIL}
])}<\/script>`;

f.writeFileSync(P.join(O,'index.html'),LH(
 `Anime Countdown — When Does the Next Episode Come Out? | ${N}`,
 `Live countdowns for ${A.length} currently airing anime. Exact air dates and times for every next episode. Updated daily.`,
 DOM+'/',HERO,
`<h2 id="now">Airing today<span class="ver">${hoy.length} anime</span></h2>
${hoy.length?rows(hoy.slice(0,10)):'<p class="sub">Nothing new airs today. Check the schedule below.</p>'}

<div class="finder rv" style="margin-top:34px"><h3 style="margin-bottom:11px">Find your anime</h3>
<input id="q" placeholder="Type a title — Mushoku Tensei, Bleach, Grand Blue..." autocomplete="off" enterkeyhint="search">
<div id="res"></div></div>

<h2 class="rv">Dropping next<a class="ver" href="schedule">Full schedule →</a></h2>
${grid(A.slice(0,12))}

<h2 class="rv">This week</h2>
${rows(sem.slice(0,14))}

${top.length?`<h2 class="rv">Top rated right now</h2>${grid(top.slice(0,12))}`:''}

<h2 class="rv">By day of the week</h2>
<div class="chips">${DOW.filter(d=>byDay[d]).map(d=>`<a href="day-${s(d)}">${d}<span class="n">${byDay[d].length}</span></a>`).join('')}</div>

<h2 class="rv">Browse genres<a class="ver" href="genres">All ${gens.length} →</a></h2>
<div class="chips">${gens.slice(0,12).map(([g,v])=>`<a href="genre-${s(g)}">${g}<span class="n">${v.length}</span></a>`).join('')}</div>

<h2 class="rv">Questions</h2>
<div class="faq">
<details><summary>How accurate are these countdowns?</summary><p>Times come straight from AniList's broadcast data, which tracks the official Japanese air time down to the minute. The countdown on this page updates live in your own timezone. We refresh the whole database every day.</p></details>
<details><summary>Why is my anime not listed?</summary><p>We only list shows that are <strong>currently airing</strong> and have a confirmed next episode. Finished series, shows on hiatus, and titles with no announced date won't appear until a new episode is scheduled.</p></details>
<details><summary>Does this include simulcasts?</summary><p>The countdown shows the <strong>Japanese broadcast time</strong>. Streaming platforms like Crunchyroll usually release within an hour of that, though some titles have a delay of a day or more depending on your region.</p></details>
<details><summary>What time zone is used?</summary><p>Countdowns run in real time on your device, so they always match your local clock. Air dates shown in text are in UTC.</p></details>
<details><summary>How often does this update?</summary><p>Every day, automatically. A scheduled job pulls the latest data each morning and rebuilds every page, so nothing here is more than 24 hours old.</p></details>
<details><summary>Is it free?</summary><p>Completely free, no account. Ads keep it running.</p></details>
</div>
<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'FAQPage',mainEntity:[
 ['How accurate are these countdowns?','Times come from AniList broadcast data tracking the official Japanese air time to the minute, refreshed daily.'],
 ['Why is my anime not listed?','We only list currently airing shows with a confirmed next episode.'],
 ['Does this include simulcasts?','The countdown shows Japanese broadcast time. Streaming usually follows within an hour.'],
 ['What time zone is used?','Countdowns run live in your local device time.'],
 ['How often does this update?','Every day, automatically.'],
 ['Is it free?','Yes, completely free with no account required.']
].map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))})}<\/script>
${JLD}
<script>
var DB=[],_bl=false;
function _load(cb){if(_bl){cb();return}
 fetch('search.json').then(function(r){return r.json()}).then(function(j){DB=j;_bl=true;cb()}).catch(function(){})}
function nrm(t){return t.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'')}
document.getElementById('q').addEventListener('input',function(ev){
 var q=nrm(ev.target.value.trim()),o=document.getElementById('res');
 if(q.length<2){o.innerHTML='';return}
 if(!_bl){o.innerHTML='<p style="color:var(--tx2);font-size:.88rem;margin-top:11px">Searching…</p>';
  _load(function(){document.getElementById('q').dispatchEvent(new Event('input'))});return}
 var h=[];for(var i=0;i<DB.length&&h.length<10;i++){if(nrm(DB[i][0]).indexOf(q)>-1)h.push(DB[i])}
 o.innerHTML=h.length?'<div class="rows" style="margin-top:12px">'+h.map(function(a){
  return '<a class="row" href="anime/'+a[1]+'"><div class="in"><div class="t">'+a[0]+
   '</div><div class="s">Episode '+a[2]+'</div></div><div class="rt" data-at="'+a[3]+'"></div></a>'}).join('')+'</div>'
  :'<p style="color:var(--tx2);font-size:.88rem;margin-top:11px">No anime found for "'+ev.target.value+'"</p>';
});
<\/script>`));
console.log('   ✓ homepage');

// ── fichas
f.mkdirSync(P.join(O,'anime'),{recursive:true});
A.forEach(a=>{
 const sim=(byGen[a.gen[0]]||[]).filter(x=>x.id!==a.id).slice(0,6);
 const d=new Date(a.at*1000);
 const jld={'@context':'https://schema.org','@type':'TVSeries',name:a.t,
  url:`${DOM}/anime/${a.slug}`,
  ...(a.img?{image:a.img}:{}),
  ...(a.desc?{description:a.desc.slice(0,300)}:{}),
  ...(a.gen.length?{genre:a.gen}:{}),
  ...(a.sc?{aggregateRating:{'@type':'AggregateRating',ratingValue:(a.sc/10).toFixed(1),bestRating:10,ratingCount:Math.max(a.fav,50)}}:{}),
  ...(a.studio?{productionCompany:{'@type':'Organization',name:a.studio}}:{}),
  ...(a.eps?{numberOfEpisodes:a.eps}:{})};

 f.writeFileSync(P.join(O,'anime',a.slug+'.html'),L(
  `${a.t} Episode ${a.ep} Release Date & Countdown | ${N}`,
  `${a.t} episode ${a.ep} airs ${fFecha(a.at)}. Live countdown, full schedule${a.studio?', animated by '+a.studio:''}. Updated daily.`,
  `${DOM}/anime/${a.slug}`,
`<p class="crumb"><a href="../">Home</a> › ${a.gen[0]?`<a href="../genre-${s(a.gen[0])}">${e(a.gen[0])}</a> › `:''}${e(a.t)}</p>
<div class="showhd">
 <div class="po">${img(a)}</div>
 <div class="inf">
  <h1>${e(a.t)}</h1>
  ${a.tj?`<div class="jptitle">${e(a.tj)}</div>`:(a.tr!==a.t?`<div class="jptitle">${e(a.tr)}</div>`:'')}
  <div class="meta">
   ${a.sc?`<span class="gd">★ ${(a.sc/10).toFixed(1)}</span>`:''}
   <span class="on">Airing</span>
   ${a.fmt?`<span>${e(a.fmt)}</span>`:''}
   ${a.eps?`<span>${a.eps} eps</span>`:''}
   ${a.dur?`<span>${a.dur} min</span>`:''}
   ${a.studio?`<span>${e(a.studio)}</span>`:''}
   ${a.gen.slice(0,3).map(g=>`<span>${e(g)}</span>`).join('')}
  </div>
 </div>
</div>

<div class="box big">
<h3>Episode ${a.ep} airs in</h3>
<div class="bigcd">
 <div><div class="v">–</div><div class="l">Days</div></div>
 <div><div class="v">–</div><div class="l">Hours</div></div>
 <div><div class="v">–</div><div class="l">Minutes</div></div>
 <div><div class="v">–</div><div class="l">Seconds</div></div>
</div>
<span data-at="${a.at}" data-f="full" style="display:none"></span>
<p style="margin-top:14px;font-size:.88rem;color:var(--tx2)">${fFecha(a.at)} at ${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')} UTC</p>
</div>

<div class="box rv"><h3>When does ${e(a.t)} episode ${a.ep} come out?</h3>
<p><strong>${e(a.t)}</strong> releases <strong>episode ${a.ep}</strong> on <strong>${fFecha(a.at)}</strong>${a.studio?`. The series is animated by ${e(a.studio)}`:''}${a.eps?` and runs for ${a.eps} episodes`:''}.</p>
<p>New episodes drop every <strong>${a.day}</strong>${a.dur?`, each around ${a.dur} minutes long`:''}. ${a.sc?`It currently holds a score of <strong>${(a.sc/10).toFixed(1)}/10</strong> with ${a.pop.toLocaleString('en-US')} people tracking it.`:''}</p>
${a.desc?`<p style="color:var(--tx2);font-size:.9rem">${e(a.desc.slice(0,340))}${a.desc.length>340?'…':''}</p>`:''}
${a.links.length?`<p style="margin-top:14px">${a.links.map(l=>`<a class="btn g" style="margin-right:8px;margin-bottom:6px" href="${e(l.url)}" target="_blank" rel="noopener nofollow">Watch on ${e(l.site)}</a>`).join('')}</p>`:''}
</div>

${sim.length?`<h2 class="rv">More ${e(a.gen[0])} anime airing</h2>${grid(sim,'../')}`:''}
<script type="application/ld+json">${JSON.stringify(jld)}<\/script>
<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[
 {'@type':'ListItem',position:1,name:N,item:DOM+'/'},
 ...(a.gen[0]?[{'@type':'ListItem',position:2,name:a.gen[0],item:`${DOM}/genre-${s(a.gen[0])}`}]:[]),
 {'@type':'ListItem',position:a.gen[0]?3:2,name:a.t,item:`${DOM}/anime/${a.slug}`}
]})}<\/script>`,'../'));
});
console.log(`   ✓ ${A.length} anime pages`);

// ── schedule
f.writeFileSync(P.join(O,'schedule.html'),L(
 `Weekly Anime Schedule — What Airs Every Day | ${N}`,
 `Full weekly anime broadcast schedule. ${A.length} shows sorted by day with live countdowns to each next episode.`,
 DOM+'/schedule',
`<p class="crumb"><a href="./">Home</a> › Schedule</p>
<h1 style="font-size:2rem;font-weight:800;letter-spacing:-.035em">Weekly schedule</h1>
<p class="sub">${A.length} anime currently airing, organized by broadcast day.</p>
${DOW.filter(d=>byDay[d]).map(d=>`<h2 class="rv">${d}<span class="ver">${byDay[d].length}</span></h2>${rows(byDay[d].slice(0,20))}`).join('')}`));

DOW.filter(d=>byDay[d]).forEach(d=>{
 const v=byDay[d];
 f.writeFileSync(P.join(O,`day-${s(d)}.html`),L(
  `Anime Airing on ${d} — Schedule & Countdowns | ${N}`,
  `${v.length} anime air every ${d}. Live countdowns, episode numbers and exact release times.`,
  `${DOM}/day-${s(d)}`,
`<p class="crumb"><a href="./">Home</a> › <a href="schedule">Schedule</a> › ${d}</p>
<h1 style="font-size:2rem;font-weight:800;letter-spacing:-.035em">${d} anime</h1>
<p class="sub">${v.length} shows drop new episodes every ${d}.</p>
${grid(v)}`));
});
console.log(`   ✓ schedule + ${DOW.filter(d=>byDay[d]).length} day pages`);

// ── season
const bySeason={};A.forEach(a=>{if(a.season)(bySeason[a.season]=bySeason[a.season]||[]).push(a)});
const seasons=Object.entries(bySeason).sort((a,b)=>b[1].length-a[1].length);
f.writeFileSync(P.join(O,'season.html'),L(
 `This Season's Anime — Currently Airing | ${N}`,
 `Every anime airing this season with live countdowns. ${A.length} shows tracked, sorted by popularity.`,
 DOM+'/season',
`<p class="crumb"><a href="./">Home</a> › This season</p>
<h1 style="font-size:2rem;font-weight:800;letter-spacing:-.035em">Currently airing</h1>
<p class="sub">All ${A.length} anime with a scheduled episode, sorted by how soon they drop.</p>
${grid(A.slice(0,60))}`));

// ── genres
f.writeFileSync(P.join(O,'genres.html'),L(
 `Anime by Genre — Browse ${gens.length} Categories | ${N}`,
 `Browse currently airing anime by genre: action, romance, comedy, fantasy and more.`,
 DOM+'/genres',
`<p class="crumb"><a href="./">Home</a> › Genres</p>
<h1 style="font-size:2rem;font-weight:800;letter-spacing:-.035em">Genres</h1>
<p class="sub">${gens.length} genres with anime currently on air.</p>
<div class="chips">${gens.map(([g,v])=>`<a href="genre-${s(g)}">${g}<span class="n">${v.length}</span></a>`).join('')}</div>`));

gens.forEach(([g,v])=>{
 const ord=[...v].sort((a,b)=>a.at-b.at);
 f.writeFileSync(P.join(O,`genre-${s(g)}.html`),L(
  `${g} Anime Airing Now — Release Dates | ${N}`,
  `${v.length} ${g.toLowerCase()} anime currently airing with live countdowns to each next episode.`,
  `${DOM}/genre-${s(g)}`,
`<p class="crumb"><a href="./">Home</a> › <a href="genres">Genres</a> › ${e(g)}</p>
<h1 style="font-size:2rem;font-weight:800;letter-spacing:-.035em">${e(g)} anime</h1>
<p class="sub">${v.length} ${g.toLowerCase()} series airing right now. Next up: <strong>${e(ord[0].t)}</strong>.</p>
${grid(ord.slice(0,48))}`));
});
console.log(`   ✓ season + genres + ${gens.length} genre pages`);

// ── legales
const pgL=(file,title,body)=>f.writeFileSync(P.join(O,file+'.html'),L(
 `${title} | ${N}`,`${title} for ${N}.`,`${DOM}/${file}`,
 `<p class="crumb"><a href="./">Home</a> › ${title}</p><div class="legal"><h1 style="font-size:1.9rem;font-weight:800;letter-spacing:-.035em">${title}</h1>${body}</div>`));

pgL('about','About',`
<p>${N} answers one question: <strong>when does the next episode come out?</strong></p>
<p>We track ${A.length} currently airing anime and show a live countdown to each next episode, accurate to the second. No account, no paywall.</p>
<h2>Where the data comes from</h2>
<p>All schedule data comes from the <a href="https://anilist.co" rel="noopener nofollow" target="_blank">AniList</a> public API, a community-maintained anime database. We pull a fresh copy every day and rebuild the entire site automatically.</p>
<h2>Accuracy</h2>
<p>Countdowns use the official Japanese broadcast time. Streaming platforms usually release within the hour, but simulcast timing varies by region and platform.</p>
<h2>Contact</h2>
<p>Wrong time or missing show? Email <a href="mailto:${MAIL}">${MAIL}</a>.</p>`);

pgL('privacy','Privacy Policy',`
<p><em>Last updated: ${HOY}</em></p>
<h2>What we collect</h2>
<p>${N} has no accounts and asks for no personal information. This is a static website with no server-side storage.</p>
<h2>Local storage</h2>
<p>We store one item in your browser: your cookie preference. Nothing else.</p>
<h2>Advertising</h2>
<p>We show ads through third-party networks. <strong>Ad scripts load only after you press "Accept"</strong> on the cookie banner. Choose "Necessary only" and no advertising or tracking script loads at all.</p>
<h2>Third-party content</h2>
<p>Anime cover art is served from AniList's servers. Your browser fetches those images directly.</p>
<h2>Children</h2>
<p>Not directed at children under 13. We do not knowingly collect their information.</p>
<h2>Contact</h2>
<p><a href="mailto:${MAIL}">${MAIL}</a></p>`);

pgL('terms','Terms of Use',`
<p><em>Last updated: ${HOY}</em></p>
<h2>Service</h2>
<p>${N} provides anime schedule information free of charge, as is, for personal use.</p>
<h2>Accuracy</h2>
<p>Air times come from a third-party community database and can change. We make no guarantee any time shown is correct. Confirm with the official broadcaster or streaming platform before relying on it.</p>
<h2>Copyright</h2>
<p>Anime titles, cover art, and related material are the property of their respective rights holders. ${N} is not affiliated with, endorsed by, or sponsored by any studio, publisher, or streaming service. Cover images are displayed for identification purposes under fair use and are served directly from AniList.</p>
<h2>Acceptable use</h2>
<p>Do not scrape or mirror this site in bulk. The underlying data is freely available from the AniList API.</p>
<h2>Contact</h2>
<p><a href="mailto:${MAIL}">${MAIL}</a></p>`);

pgL('contact','Contact',`
<p>Questions, corrections, or business enquiries:</p>
<p><a class="btn" href="mailto:${MAIL}">${MAIL}</a></p>
<h2>Reporting a wrong air time</h2>
<p>Our times mirror the AniList database. If a time is wrong here it is almost certainly wrong there too — reporting it directly to <a href="https://anilist.co" rel="noopener nofollow" target="_blank">AniList</a> is the fastest fix, and our copy picks up the correction within 24 hours.</p>
<h2>Rights holders</h2>
<p>If you represent a rights holder and want content removed, email us with the details.</p>`);
console.log('   ✓ 4 legal pages');

f.writeFileSync(P.join(O,'404.html'),L(
 `Page not found | ${N}`,'That page does not exist. Browse anime countdowns and air dates.',DOM+'/404',
`<div class="legal" style="text-align:center;padding:52px 0">
<h1 style="font-size:4rem;font-weight:800">404</h1>
<p class="sub" style="margin:0 auto 26px">This page drifted away like a petal. The anime may have finished airing.</p>
<p><a class="btn" href="/">Go home</a> <a class="btn g" href="/schedule">See schedule</a></p>
</div>`,'',true));

// ── estáticos
f.writeFileSync(P.join(O,'s.css'),CSS);
f.writeFileSync(P.join(O,'manifest.json'),JSON.stringify({
 name:N+' — Anime Countdowns',short_name:N,
 description:'Live countdowns for currently airing anime episodes.',
 start_url:'/?s=pwa',scope:'/',display:'standalone',
 background_color:'#fffbfd',theme_color:'#e87fa8',lang:'en-US',
 categories:['entertainment'],
 icons:[{src:'/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
        {src:'/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},
        {src:'/icon-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]
},null,1));
try{
 f.writeFileSync(P.join(O,'icon-192.png'),iconPNG(192));
 f.writeFileSync(P.join(O,'icon-512.png'),iconPNG(512));
 const ic=iconPNG(32),hd=Buffer.alloc(22);
 hd.writeUInt16LE(0,0);hd.writeUInt16LE(1,2);hd.writeUInt16LE(1,4);
 hd[6]=32;hd[7]=32;hd.writeUInt16LE(1,10);hd.writeUInt16LE(32,12);
 hd.writeUInt32LE(ic.length,14);hd.writeUInt32LE(22,18);
 f.writeFileSync(P.join(O,'favicon.ico'),Buffer.concat([hd,ic]));
 console.log('   ✓ manifest + icons');
}catch(err){console.log('   icons failed: '+err.message)}

f.writeFileSync(P.join(O,'favicon.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34"><circle cx="17" cy="8.4" r="4.6" fill="#f3a8c4"/><circle cx="25.2" cy="14.3" r="4.6" fill="#f0b8cd"/><circle cx="22" cy="24" r="4.6" fill="#f3a8c4"/><circle cx="12" cy="24" r="4.6" fill="#f0b8cd"/><circle cx="8.8" cy="14.3" r="4.6" fill="#f3a8c4"/><circle cx="17" cy="17" r="3.5" fill="#c9a227"/></svg>');

try{
 const c=_lz(1200,630,253,244,248);
 _rc(c,0,0,1200,14,232,127,168);
 _ci(c,86,96,17,243,168,196);_ci(c,116,118,17,240,184,205);
 _ci(c,104,152,17,243,168,196);_ci(c,68,152,17,240,184,205);
 _ci(c,56,118,17,243,168,196);_ci(c,86,126,13,201,162,39);
 _tx(c,'SAKURAAIR',152,110,7,43,32,40);
 _rc(c,70,196,1060,2,240,218,228);
 const t1='ANIME COUNTDOWN';
 _tx(c,t1,70,232,_fit(t1,1060,11),43,32,40);
 _tx(c,`LIVE TIMERS FOR ${A.length} AIRING ANIME`,70,322,5,138,116,128);
 if(prox){
  _rc(c,70,380,1060,164,255,255,255);
  _rc(c,70,380,6,164,232,127,168);
  _tx(c,'NEXT EPISODE',102,410,4,138,116,128);
  const nm=ACC(prox.t).slice(0,26);
  _tx(c,nm,102,444,_fit(nm,900,8),43,32,40);
  _tx(c,`EPISODE ${prox.ep} - ${ACC(fFecha(prox.at))}`,102,506,4,232,127,168);
 }
 _tx(c,'SAKURAAIR.PAGES.DEV  -  UPDATED DAILY',70,570,4,138,116,128);
 _rc(c,0,616,1200,14,201,162,39);
 f.writeFileSync(P.join(O,'og.png'),_png(c));
 console.log('   ✓ og.png');
}catch(err){console.log('   og.png failed: '+err.message)}

f.writeFileSync(P.join(O,'_redirects'),'/index.html / 200\n');
f.writeFileSync(P.join(O,'_headers'),
`/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Cache-Control: public, max-age=600, stale-while-revalidate=86400

/*.json
  Cache-Control: public, max-age=600, s-maxage=3600, stale-while-revalidate=86400

/s.css
  Cache-Control: public, max-age=3600, stale-while-revalidate=604800
/bg.webp
  Cache-Control: public, max-age=604800, immutable
/girl.webp
  Cache-Control: public, max-age=604800, immutable
/favicon.ico
  Cache-Control: public, max-age=86400
/favicon.svg
  Cache-Control: public, max-age=86400
/og.png
  Cache-Control: public, max-age=3600, stale-while-revalidate=86400
`);

const U=['','schedule','season','genres','about','privacy','terms','contact']
 .concat(DOW.filter(d=>byDay[d]).map(d=>`day-${s(d)}`))
 .concat(gens.map(([g])=>`genre-${s(g)}`))
 .concat(A.map(a=>`anime/${a.slug}`));
f.writeFileSync(P.join(O,'sitemap.xml'),
 '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
 U.map(u=>`<url><loc>${DOM}/${u}</loc><lastmod>${HOY_ISO}</lastmod></url>`).join('\n')+
 '\n</urlset>');
f.writeFileSync(P.join(O,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${DOM}/sitemap.xml\n`);
console.log(`   ✓ sitemap.xml (${U.length} URLs) + robots.txt`);

let by=0,ct=0;(function W(d){f.readdirSync(d,{withFileTypes:true}).forEach(x=>{
 const p=P.join(d,x.name);x.isDirectory()?W(p):(by+=f.statSync(p).size,ct++)})})(O);
console.log(`\n✅ DONE — ${ct} files, ${(by/1048576).toFixed(1)} MB\n`);
})();
