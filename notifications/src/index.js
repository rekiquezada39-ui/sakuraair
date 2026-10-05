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
  return await sendPushNotification(sub,payload,{subject:'mailto:contact.sakuraair@gmail.com',publicKey:env.VAPID_PUBLIC_KEY,privateKey:env.VAPID_PRIVATE_KEY},{ttl:86400,urgency:'high'});
 }catch(err){
  if(err?.status===404||err?.status===410||err?.statusCode===404||err?.statusCode===410)await env.DB.prepare('DELETE FROM alerts WHERE endpoint=?').bind(row.endpoint).run();
  return false
 }
}

export default {
 async fetch(request,env){
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:CORS});
  const u=new URL(request.url);
  if(u.pathname==='/health')return json({ok:true});
  if(u.pathname==='/public-key')return json({publicKey:env.VAPID_PUBLIC_KEY});
  if(u.pathname==='/subscribe'&&request.method==='POST'){
   let b;try{b=await request.json()}catch{return json({error:'Invalid request'},400)}
   const s=b.subscription;
   if(!s?.endpoint||!s?.keys?.p256dh||!s?.keys?.auth||!allowedEndpoint(s.endpoint)||!Number.isFinite(+b.animeId)||!Number.isFinite(+b.episode)||!Number.isFinite(+b.airingAt))return json({error:'Invalid subscription'},400);
   await env.DB.prepare(`INSERT INTO alerts(endpoint,subscription,anime_id,title,episode,airing_at,url,created_at)
    VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(endpoint,anime_id) DO UPDATE SET subscription=excluded.subscription,title=excluded.title,episode=excluded.episode,airing_at=excluded.airing_at,url=excluded.url,created_at=excluded.created_at`)
    .bind(s.endpoint,JSON.stringify(s),+b.animeId,String(b.title||'Anime').slice(0,160),+b.episode,+b.airingAt,String(b.url||'https://sakuraair.pages.dev/').slice(0,500),Date.now()).run();
   // Confirmation push proves this device can receive alerts before the real premiere.
   let confirmation=false;
   try{confirmation=await sendPushNotification(s,{title:'Episode alert enabled',body:+b.episode>0?`We’ll notify you when episode ${+b.episode} of ${String(b.title||'this anime')} airs.`:`We’ll notify you when the next episode of ${String(b.title||'this anime')} is scheduled.`,icon:'https://sakuraair.pages.dev/icon-192.png',badge:'https://sakuraair.pages.dev/favicon.ico',url:String(b.url||'https://sakuraair.pages.dev/')},{subject:'mailto:contact.sakuraair@gmail.com',publicKey:env.VAPID_PUBLIC_KEY,privateKey:env.VAPID_PRIVATE_KEY},{ttl:300,urgency:'high'})}catch(err){console.error('confirmation push failed',err)}
   return json({ok:true,confirmation});
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
   if(Math.floor(now/60)%15===0){
    const {results:waiting=[]}=await env.DB.prepare('SELECT DISTINCT anime_id FROM alerts WHERE episode=0 LIMIT 20').all();
    for(const item of waiting){try{const q='query($id:Int){Media(id:$id,type:ANIME){nextAiringEpisode{episode airingAt}relations{nodes{id type title{english romaji}nextAiringEpisode{episode airingAt}}}}}',r=await fetch('https://graphql.anilist.co',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query:q,variables:{id:item.anime_id}})}),j=await r.json(),m=j?.data?.Media;let n=m?.nextAiringEpisode,title='';if(!n){const candidates=(m?.relations?.nodes||[]).filter(x=>x.type==='ANIME'&&x.nextAiringEpisode).sort((a,b)=>a.nextAiringEpisode.airingAt-b.nextAiringEpisode.airingAt);if(candidates[0]){n=candidates[0].nextAiringEpisode;title=candidates[0].title.english||candidates[0].title.romaji||''}}if(n)await env.DB.prepare('UPDATE alerts SET episode=?,airing_at=?,title=CASE WHEN ?="" THEN title ELSE ? END WHERE anime_id=? AND episode=0').bind(n.episode,n.airingAt,title,title,item.anime_id).run()}catch{}}
   }
   const {results=[]}=await env.DB.prepare('SELECT * FROM alerts WHERE airing_at<=? AND episode>0 ORDER BY airing_at LIMIT 200').bind(now).all();
   for(const row of results){
    const delivered=await sendOne(env,row);
    if(delivered)await env.DB.prepare('DELETE FROM alerts WHERE endpoint=? AND anime_id=?').bind(row.endpoint,row.anime_id).run();
   }
  })());
 }
};
