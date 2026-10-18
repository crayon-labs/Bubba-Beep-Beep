const C='bubba-v28';const FILES=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// The page itself is network-first so updates show on the next load; everything else is cache-first. Both fall back to the cache offline.
const put=(req,res)=>{if(res.ok&&new URL(req.url).origin===location.origin){const cp=res.clone();caches.open(C).then(c=>c.put(req,cp))}return res};
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
  if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>put(r,res)).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));return}
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>put(r,res)).catch(()=>caches.match('./index.html'))))});
// Tapping the workout notification brings the app back to the front.
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>cs.length?cs[0].focus():self.clients.openWindow('./')))});
