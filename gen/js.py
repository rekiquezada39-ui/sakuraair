# -*- coding: utf-8 -*-
"""Bloques de JavaScript del sitio (idénticos al sitio original, con textos parametrizados por idioma)."""
from i18n import T, ROUTES

_URLS = ("@@ANIME@@", "@@CATALOG@@", "@@SEARCH_JSON@@")

def _fill(src, lang):
    t = T[lang]
    rep = {"@@AIRED@@": t["aired"], "@@SAVE@@": t["a_save"], "@@SAVED@@": t["a_saved"],
           "@@N_UNSUP@@": t["n_unsup"], "@@N_UNAVAIL@@": t["n_unavail"], "@@N_ON@@": t["n_on"], "@@N_BTN@@": t["n_btn"],
           "@@N_TEST@@": t["n_test"], "@@N_BLOCKED@@": t["n_blocked"], "@@N_BLK_BTN@@": t["n_blk_btn"],
           "@@EPISODE@@": t["episode"].replace("{n}", ""), "@@ANIME@@": ROUTES[lang]["anime"],
           "@@CATALOG@@": ROUTES[lang]["catalog"], "@@SEARCHING@@": t["searching"], "@@NO_AIR@@": t["no_air"],
           "@@SEARCH_FULL@@": t["search_full"], "@@SEARCH_JSON@@": ROUTES[lang]["search"],
           "@@INTL@@": t["intl"], "@@LOCAL@@": t["local"],
           "@@P_THANKS@@": t["p_thanks"], "@@P_ERR@@": t["p_err"], "@@P_VOTES@@": t["p_votes"], "@@P_VOTE1@@": t["p_vote1"],
           "@@VS_ROUND@@": t["vs_round"], "@@VS_VOTES@@": t["vs_votes"], "@@VS_VOTE1@@": t["vs_vote1"], "@@VS_ERR@@": t["vs_err"]}
    for k, v in rep.items():
        src = src.replace(k, v if k in _URLS else v.replace("'", "\\'"))
    return src

SHARED = r"""<script>(function(){var b=document.getElementById('burger'),d=document.getElementById('drawer'),s=document.getElementById('scrim');
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
 if(window.DeviceOrientationEvent&&matchMedia('(hover:none)').matches){
  addEventListener('deviceorientation',function(ev){
   if(ev.gamma==null)return;
   mx=Math.max(-1,Math.min(1,ev.gamma/26));my=Math.max(-1,Math.min(1,((ev.beta||45)-45)/26));kick()},{passive:true})}
 if('IntersectionObserver' in window){new IntersectionObserver(function(en){
  vis=en[0].isIntersecting;h.style.animationPlayState=vis?'':'paused';
  h.querySelectorAll('.bgimg,.glow,.chica,.shine i').forEach(function(el){
   el.style.animationPlayState=vis?'running':'paused'});
  if(vis)kick()},{threshold:0}).observe(h)}
})();
document.addEventListener('visibilitychange',function(){
 var st=document.hidden?'paused':'running';
 document.querySelectorAll('.petal,.petal b').forEach(function(el){el.style.animationPlayState=st})});
function tick2(){var now=Math.floor(Date.now()/1000);
 document.querySelectorAll('[data-at]').forEach(function(el){
  var s=+el.getAttribute('data-at')-now;
  if(s<0){el.textContent='@@AIRED@@';return}
  var d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),sec=s%60;
  if(el.dataset.f==='full'){
   var p=el.parentNode.parentNode;
   var vs=p.querySelectorAll('.v');
   if(vs.length===4){vs[0].textContent=d;vs[1].textContent=h;vs[2].textContent=m;vs[3].textContent=sec}
  } else el.textContent=d>0?d+'d '+h+'h':(h>0?h+'h '+m+'m':m+'m '+sec+'s');
 })}
tick2();setInterval(tick2,1000);
try{document.querySelectorAll('[data-local]').forEach(function(el){var dt=new Date(+el.getAttribute('data-local')*1000);
 el.textContent=' · '+dt.toLocaleString('@@INTL@@',{weekday:'long',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})+' (@@LOCAL@@)'})}catch(e){}
})();</script>
<script>
window.SakuraList=(function(){var KEY='sakura_my_anime_v1';function all(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}}function put(a){var x=all();x[a.id]=Object.assign(x[a.id]||{},a,{savedAt:Date.now()});localStorage.setItem(KEY,JSON.stringify(x));return x[a.id]}function remove(id){var x=all();delete x[id];localStorage.setItem(KEY,JSON.stringify(x))}function has(id){return!!all()[id]}function toggle(button,a){if(has(a.id)){remove(a.id);button.classList.remove('saved');button.textContent='@@SAVE@@'}else{put(a);button.classList.add('saved');button.textContent='@@SAVED@@'}}function mount(button,a){if(!button)return;if(has(a.id)){button.classList.add('saved');button.textContent='@@SAVED@@'}button.onclick=function(){toggle(button,a)}}function watched(id,ep){var x=all();if(!x[id])return false;x[id].watchedEp=x[id].watchedEp===ep?0:ep;localStorage.setItem(KEY,JSON.stringify(x));return x[id].watchedEp===ep}return{all:all,put:put,remove:remove,has:has,mount:mount,watched:watched}})();
</script>
<script>
window.SakuraAlerts=(function(){var API='https://sakuraair-notifications.rekiquezada39.workers.dev',PUB='';function key(s){var b=atob((s+'='.repeat((4-s.length%4)%4)).replace(/-/g,'+').replace(/_/g,'/')),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}async function post(p,d){var r=await fetch(API+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(d)});if(!r.ok)throw Error('@@N_UNAVAIL@@');return r.json()}async function mount(el,m){if(!el)return;var b=el.querySelector('button'),h=el.querySelector('.installhelp');if(!('serviceWorker'in navigator)||!('PushManager'in window)){h.textContent='@@N_UNSUP@@';h.classList.add('on');b.disabled=true;return}var r=await navigator.serviceWorker.register('/sw.js');if(!PUB){var pk=await fetch(API+'/public-key').then(function(x){return x.json()});PUB=pk.publicKey}var sub=await r.pushManager.getSubscription(),oldKey='';try{oldKey=localStorage.getItem('sa_vapid_public')||''}catch(x){}if(sub&&oldKey!==PUB){await sub.unsubscribe();sub=null}try{localStorage.setItem('sa_vapid_public',PUB)}catch(x){}if(sub){var st=await post('/status',{endpoint:sub.endpoint,animeId:m.animeId}).catch(function(){return{subscribed:false}});if(st.subscribed){b.classList.add('on');b.textContent='@@N_ON@@'}}b.onclick=async function(){b.disabled=true;try{var sub=await r.pushManager.getSubscription();if(b.classList.contains('on')){await post('/unsubscribe',{endpoint:sub.endpoint,animeId:m.animeId});b.classList.remove('on');b.textContent='@@N_BTN@@'}else{var ios=/iphone|ipad|ipod/i.test(navigator.userAgent),standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;if(ios&&!standalone){h.classList.add('on');b.disabled=false;return}if(Notification.permission==='denied')throw Error('BLOCKED');var permission=Notification.permission==='granted'?'granted':await Notification.requestPermission();if(permission!=='granted')throw Error('BLOCKED');sub=sub||await r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key(PUB)});var saved=await post('/subscribe',{subscription:sub,animeId:m.animeId,title:m.title,episode:m.episode,airingAt:m.airingAt,url:location.href});if(!saved.confirmation)throw Error('@@N_TEST@@');b.classList.add('on');b.textContent='@@N_ON@@'}}catch(e){var blocked=Notification.permission==='denied'||e.message==='BLOCKED'||/permission denied/i.test(e.message);h.textContent=blocked?'@@N_BLOCKED@@':e.message;h.classList.add('on');if(blocked){b.textContent='@@N_BLK_BTN@@';b.classList.add('on')}}b.disabled=false}}return{mount:mount}})();
</script>
<script>window.__ZONAS=[["n6wxm.com/vignette.min.js","11970668"]];</script>
<script>
(function(){
 var URL='https://omg10.com/4/11715261',KEY='sa_direct_cap_v2',CADA=3,MAX=3,WINDOW=12*60*60*1000,now=Date.now();
 var state={startedAt:now,expiresAt:now+WINDOW,clicks:0,ads:0};
 function read(){try{var x=JSON.parse(localStorage.getItem(KEY)||'null');if(x&&x.expiresAt>Date.now()){state.startedAt=+x.startedAt||now;state.expiresAt=+x.expiresAt;state.clicks=Math.max(0,+x.clicks||0);state.ads=Math.min(MAX,Math.max(0,+x.ads||0));return true}}catch(e){}return false}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
 if(!read())save();
 window.addEventListener('storage',function(e){if(e.key===KEY)read()});
 document.addEventListener('click',function(){try{
  now=Date.now();if(now>=state.expiresAt){state={startedAt:now,expiresAt:now+WINDOW,clicks:0,ads:0};save()}
  if(state.ads>=MAX)return;
  state.clicks++;if(state.clicks%CADA!==0){save();return}
  state.ads++;save();var w=window.open(URL,'_blank','noopener');if(w&&w.focus)try{w.focus()}catch(e){}
 }catch(e){}},true);
})();
</script>
"""

SEARCH = r"""<script>
var DB=[],_bl=false;
function _load(cb){if(_bl){cb();return}
 fetch('@@SEARCH_JSON@@').then(function(r){return r.json()}).then(function(j){DB=j;_bl=true;cb()}).catch(function(){})}
function nrm(t){return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
document.getElementById('q').addEventListener('input',function(ev){
 var q=nrm(ev.target.value.trim()),o=document.getElementById('res');
 if(q.length<2){o.innerHTML='';return}
 if(!_bl){o.innerHTML='<p style="color:var(--tx2);font-size:.88rem;margin-top:11px">@@SEARCHING@@</p>';
  _load(function(){document.getElementById('q').dispatchEvent(new Event('input'))});return}
 var h=[];for(var i=0;i<DB.length&&h.length<10;i++){if(nrm(DB[i][0]).indexOf(q)>-1||(DB[i][4]&&nrm(DB[i][4]).indexOf(q)>-1))h.push(DB[i])}
 o.innerHTML=h.length?'<div class="rows" style="margin-top:12px">'+h.map(function(a){
  return '<a class="row" href="@@ANIME@@'+a[1]+'"><div class="in"><div class="t">'+a[0]+
   '</div><div class="s">@@EPISODE@@'+a[2]+'</div></div><div class="rt" data-at="'+a[3]+'"></div></a>'}).join('')+'</div>'
  :'<p style="color:var(--tx2);font-size:.88rem;margin-top:11px">@@NO_AIR@@ <a style="color:var(--sk2);font-weight:700" href="@@CATALOG@@?q='+encodeURIComponent(ev.target.value)+'">@@SEARCH_FULL@@</a></p>';
});
</script>"""

PERSONAL = r"""<script>document.addEventListener('DOMContentLoaded',function(){var x=Object.values(SakuraList.all()).filter(function(a){return a.airingAt>Date.now()/1000}).sort(function(a,b){return a.airingAt-b.airingAt}).slice(0,5);if(!x.length)return;var box=document.getElementById('personalHome'),o=document.getElementById('personalRows');box.classList.add('on');o.innerHTML='<div class="rows">'+x.map(function(a){var left=Math.max(0,a.airingAt-Math.floor(Date.now()/1000)),d=Math.floor(left/86400),h=Math.floor(left%86400/3600);return '<a class="row" href="'+a.url+'"><div class="th">'+(a.img?'<img src="'+a.img+'" alt="">':'')+'</div><div class="in"><div class="t">'+a.title+'</div><div class="s">@@EPISODE@@'+a.episode+'</div></div><div class="rt">'+(d?d+'d '+h+'h':h+'h')+'</div></a>'}).join('')+'</div>'});</script>"""

# Encuesta por capítulo. Votos agregados en Abacus (contador público gratuito, CORS abierto):
#   hit/<ns>/<key> incrementa y devuelve {"value":n}; get/<ns>/<key> lee (404 si no existe).
# Clave = <anilistId>-<capítulo>-<opción>; la misma para EN y ES (los votos se suman). 1 voto por capítulo vía localStorage.
POLL = r"""<script>(function(){var P=document.getElementById('poll');if(!P)return;
var API='https://abacus.jasoncameron.dev/',NS='sakuraair',id=P.dataset.id,next=+P.dataset.next,at=+P.dataset.at,ep=next-1;
var h=P.querySelector('h3'),btns=[].slice.call(P.querySelectorAll('.opt')),res=P.querySelector('.res'),tot=P.querySelector('.tot'),msg=P.querySelector('.pm');
if(at&&Date.now()/1000>=at){ep=next;h.textContent=P.dataset.q.replace('{n}',ep);var L=P.dataset.labels.split('|');btns.forEach(function(b,i){b.textContent=L[i]});P.dataset.back='';}
var LS='sa_poll_'+id+'_'+ep,mine=null;try{mine=localStorage.getItem(LS)}catch(e){}
function key(b){return NS+'/'+id+'-'+ep+'-'+b.dataset.v}
function get(){return Promise.all(btns.map(function(b){return fetch(API+'get/'+key(b)).then(function(r){return r.ok?r.json():{value:0}}).then(function(j){return j.value||0}).catch(function(){return null})}))}
function hit(b){return fetch(API+'hit/'+key(b)).then(function(r){return r.ok}).catch(function(){return false})}
function lock(){btns.forEach(function(b){b.disabled=true;b.classList.toggle('sel',b.dataset.v===mine)})}
function render(c){if(c.some(function(v){return v===null})){msg.textContent='@@P_ERR@@';return}
var sum=c.reduce(function(a,b){return a+b},0);res.innerHTML=btns.map(function(b,i){var p=sum?Math.round(c[i]*100/sum):0;return '<div class="r'+(b.dataset.v===mine?' mine':'')+'"><span>'+b.textContent+'</span><span>'+p+'%</span><div class="bar"><i data-w="'+p+'"></i></div></div>'}).join('');res.hidden=false;
requestAnimationFrame(function(){[].forEach.call(res.querySelectorAll('.bar i'),function(i){i.style.width=i.dataset.w+'%'})});
tot.textContent=(sum===1?'@@P_VOTE1@@':'@@P_VOTES@@'.replace('{n}',sum.toLocaleString()))+(P.dataset.back?' · '+P.dataset.back:'');tot.hidden=false;}
if(mine){lock();get().then(render)}
P.addEventListener('click',function(e){var b=e.target.closest('.opt');if(!b||mine)return;mine=b.dataset.v;try{localStorage.setItem(LS,mine)}catch(e){}
lock();msg.textContent='@@P_THANKS@@';hit(b).then(function(ok){if(!ok){msg.textContent='@@P_ERR@@';return}return get().then(render)})});
})();</script>"""


# Juego "Versus": dos portadas, un toque. Votos agregados en Abacus con clave vs-<idMenor>-<idMayor>-<idGanador>
# (misma clave en EN y ES). Un voto por par y dispositivo (localStorage); los pares ya votados no se repiten.
VERSUS = r"""<script>(function(){var D=window.__VS,A=document.getElementById('arena');if(!D||!A)return;
var R=document.getElementById('vsRound'),M=document.getElementById('vsMsg'),S=document.getElementById('vsSkip');
var API='https://abacus.jasoncameron.dev/',NS='sakuraair',LSK='sa_vs_n',n=0;try{n=+localStorage.getItem(LSK)||0}catch(e){}
var P=D.slice().sort(function(a,b){return b[5]-a[5]}),seen={},cur=null,busy=false,queue,pre={};
function val(r){return r.ok?r.json().then(function(x){return x.value||0}):(r.status===404?0:null)}
function prefetch(p){var k=p[2];if(pre[k])return;pre[k]=Promise.all([fetch(API+'get/'+NS+'/vs-'+k+'-'+p[0][0]).then(val),fetch(API+'get/'+NS+'/vs-'+k+'-'+p[1][0]).then(val)]).catch(function(){return[null,null]})}
var CHK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function pick(ex){var top=Math.random()<.65?Math.min(40,P.length):P.length;for(var k=0;k<30;k++){var it=P[Math.floor(Math.pow(Math.random(),1.5)*top)];if(it!==ex)return it}return P[0]}
function key(a,b){return Math.min(a[0],b[0])+'-'+Math.max(a[0],b[0])}
function voted(k){try{return localStorage.getItem('sa_vs_'+k)}catch(e){return null}}
function nextPair(){var a,b,k;for(var i=0;i<80;i++){a=pick(null);b=pick(a);k=key(a,b);if(!seen[k]&&!voted(k)){seen[k]=1;return[a,b,k]}}a=pick(null);b=pick(a);return[a,b,key(a,b)]}
function preload(p){[p[0],p[1]].forEach(function(it){var i=new Image();i.src=it[2]});prefetch(p)}
function guard(){[].forEach.call(A.querySelectorAll('.vc img'),function(im){var fb=im.dataset.fb;if(!fb)return;setTimeout(function(){if(!im.naturalWidth&&im.src!==fb){im.src=fb}},2200)})}
function card(it,side){return '<div class="vc" data-side="'+side+'" role="button" tabindex="0" aria-label="'+esc(it[1])+'"><div class="im"><img src="'+esc(it[2])+'" alt="" width="460" height="650" decoding="async" data-fb="'+esc(it[6])+'" onerror="this.onerror=null;this.src=this.dataset.fb"><div class="fill"></div><div class="pct"><span>0%</span><small></small></div><div class="chk">'+CHK+'</div></div><div class="nm">'+esc(it[1])+'</div><div class="mt">'+esc(it[4])+'</div></div>'}
function show(p){cur=p;busy=false;A.className='arena in';A.innerHTML=card(p[0],'a')+'<span class="vsb" aria-hidden="true">VS</span>'+card(p[1],'b');R.textContent='@@VS_ROUND@@'.replace('{n}',n+1);M.textContent='';guard();prefetch(p);queue=nextPair();preload(queue)}
function reveal(c,p,tot){c.querySelector('.fill').style.height=p+'%';var s=c.querySelector('.pct span'),sm=c.querySelector('.pct small');
sm.textContent=tot===1?'@@VS_VOTE1@@':'@@VS_VOTES@@'.replace('{n}',tot.toLocaleString());c.classList.add('show');var t0=performance.now();
(function f(t){var k=Math.min(1,(t-t0)/750);k=1-Math.pow(1-k,3);s.textContent=Math.round(p*k)+'%';if(k<1)requestAnimationFrame(f)})(t0)}
function burst(c){var r=c.getBoundingClientRect(),ar=A.getBoundingClientRect(),cx=r.left-ar.left+r.width/2,cy=r.top-ar.top+r.height*.38,h=document.createElement('div');h.className='petalburst';
for(var i=0;i<14;i++){var s=document.createElement('i'),an=Math.PI*2*i/14+Math.random()*.4,d=80+Math.random()*110;s.style.left=cx+'px';s.style.top=cy+'px';s.style.setProperty('--x',Math.cos(an)*d+'px');s.style.setProperty('--y',(Math.sin(an)*d-40)+'px');s.style.animationDelay=(Math.random()*.12)+'s';h.appendChild(s)}A.appendChild(h);setTimeout(function(){h.remove()},1100)}
function next(){[].forEach.call(A.querySelectorAll('.vc'),function(c){c.classList.add('out')});setTimeout(function(){show(queue)},330)}
function choose(c){if(!c||busy||!cur)return;busy=true;var side=c.dataset.side,w=side==='a'?cur[0]:cur[1],l=side==='a'?cur[1]:cur[0],cs=A.querySelectorAll('.vc'),lc=cs[0]===c?cs[1]:cs[0];
A.classList.add('done');c.classList.add('win');lc.classList.add('lose');burst(c);n++;try{localStorage.setItem(LSK,n);localStorage.setItem('sa_vs_'+cur[2],w[0])}catch(e){}
var kw=NS+'/vs-'+cur[2]+'-'+w[0],kl=NS+'/vs-'+cur[2]+'-'+l[0];
fetch(API+'hit/'+kw).catch(function(){});var shown=false;
function fin(a,b){if(shown)return;shown=true;if(a===null||b===null){M.textContent='@@VS_ERR@@';a=a||0;b=b||0}var tot=a+b+1,pw=Math.round((a+1)*100/tot);reveal(c,pw,tot);reveal(lc,100-pw,tot);setTimeout(next,1650)}
var wi=side==='a'?0:1,pk=cur[2];(pre[pk]||Promise.resolve([null,null])).then(function(v){fin(v[wi],v[1-wi])});setTimeout(function(){fin(null,null)},2500)}
A.addEventListener('click',function(e){choose(e.target.closest('.vc'))});
A.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){var c=e.target.closest('.vc');if(c){e.preventDefault();choose(c)}}});
document.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')choose(A.querySelector('[data-side=a]'));if(e.key==='ArrowRight')choose(A.querySelector('[data-side=b]'))});
S.addEventListener('click',function(){if(busy||!cur)return;busy=true;next()});
show(nextPair());})();</script>"""

def shared(lang):   return _fill(SHARED, lang)
def versus(lang):   return _fill(VERSUS, lang)
def poll(lang):     return _fill(POLL, lang)
def search(lang):   return _fill(SEARCH, lang)
def personal(lang): return _fill(PERSONAL, lang)
