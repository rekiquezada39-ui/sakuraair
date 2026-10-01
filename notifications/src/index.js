import { sendPushNotification } from '@mmmike/web-push/send';

const CORS={
 'Access-Control-Allow-Origin':'https://sakuraair.pages.dev',
 'Access-Control-Allow-Headers':'content-type',
 'Access-Control-Allow-Methods':'GET,POST,DELETE,OPTIONS',
 'Vary':'Origin'
};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...CORS,'content-type':'application/json;charset=UTF-8'}});
const allowedEndpoint=(u)=>{try{const h=new URL(u).hostname;return h==='fcm.googleapis.com'||h.endsWith('.push.apple.com')||h.endsWith('.push.services.mozilla.com')||h.endsWith('.notify.windows.com')}catch{return false}};

async function sendOne(env,row){
 const sub=JSON.parse(row.subscription);
 const payload={title:`${row.title} is airing now`,body:`Episode ${row.episode} has just aired. Tap to see the updated schedule.`,icon:'https://sakuraair.pages.dev/icon-192.png',badge:'https://sakuraair.pages.dev/favicon.ico',url:row.url||'https://sakuraair.pages.dev/'};
 try{
  const r=await sendPushNotification(sub,payload,{subject:'mailto:contact.sakuraair@gmail.com',publicKey:env.VAPID_PUBLIC_KEY,privateKey:env.VAPID_PRIVATE_KEY,ttl:86400,urgency:'high'});
  if(r.status===404||r.status===410)await env.DB.prepare('DELETE FROM alerts WHERE endpoint=?').bind(row.endpoint).run();
  return r.ok;
 }catch{return false}
}

export default {
 async fetch(request,env){
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:CORS});
  const u=new URL(request.url);
  if(u.pathname==='/health')return json({ok:true});
  if(u.pathname==='/subscribe'&&request.method==='POST'){
   let b;try{b=await request.json()}catch{return json({error:'Invalid request'},400)}
   const s=b.subscription;
   if(!s?.endpoint||!s?.keys?.p256dh||!s?.keys?.auth||!allowedEndpoint(s.endpoint)||!Number.isFinite(+b.animeId)||!Number.isFinite(+b.episode)||!Number.isFinite(+b.airingAt))return json({error:'Invalid subscription'},400);
   await env.DB.prepare(`INSERT INTO alerts(endpoint,subscription,anime_id,title,episode,airing_at,url,created_at)
    VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(endpoint,anime_id) DO UPDATE SET subscription=excluded.subscription,title=excluded.title,episode=excluded.episode,airing_at=excluded.airing_at,url=excluded.url,created_at=excluded.created_at`)
    .bind(s.endpoint,JSON.stringify(s),+b.animeId,String(b.title||'Anime').slice(0,160),+b.episode,+b.airingAt,String(b.url||'https://sakuraair.pages.dev/').slice(0,500),Date.now()).run();
   // Confirmation push proves this device can receive alerts before the real premiere.
   try{await sendPushNotification(s,{title:'Episode alert enabled',body:`We’ll notify you when episode ${+b.episode} of ${String(b.title||'this anime')} airs.`,icon:'https://sakuraair.pages.dev/icon-192.png',badge:'https://sakuraair.pages.dev/favicon.ico',url:String(b.url||'https://sakuraair.pages.dev/')},{subject:'mailto:contact.sakuraair@gmail.com',publicKey:env.VAPID_PUBLIC_KEY,privateKey:env.VAPID_PRIVATE_KEY,ttl:300,urgency:'normal'})}catch{}
   return json({ok:true});
  }
  if(u.pathname==='/unsubscribe'&&request.method==='POST'){
   let b;try{b=await request.json()}catch{return json({error:'Invalid request'},400)}
   if(b.endpoint&&b.animeId)await env.DB.prepare('DELETE FROM alerts WHERE endpoint=? AND anime_id=?').bind(b.endpoint,+b.animeId).run();
   return json({ok:true});
  }
  if(u.pathname==='/status'&&request.method==='POST'){
   let b;try{b=await request.json()}catch{return json({subscribed:false})}
   const x=await env.DB.prepare('SELECT 1 FROM alerts WHERE endpoint=? AND anime_id=?').bind(b.endpoint||'',+b.animeId||0).first();
   return json({subscribed:!!x});
  }
  return json({error:'Not found'},404);
 },
 async scheduled(event,env,ctx){
  ctx.waitUntil((async()=>{
   const now=Math.floor(Date.now()/1000);
   const {results=[]}=await env.DB.prepare('SELECT * FROM alerts WHERE airing_at<=? ORDER BY airing_at LIMIT 200').bind(now).all();
   for(const row of results){
    const delivered=await sendOne(env,row);
    if(delivered)await env.DB.prepare('DELETE FROM alerts WHERE endpoint=? AND anime_id=?').bind(row.endpoint,row.anime_id).run();
   }
  })());
 }
};
