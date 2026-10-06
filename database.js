export const APP_ID='martin-ruta-ventas',APP_NAME='RutaVentas',APP_VERSION='1.0.0',SCHEMA=1,DB_NAME='martin-ruta-ventas-db';
export const STORES=['products','categories','clients','routes','visits','orders','sales','saleLines','payments','credits','abonos','purchases','inventory','movements','expenses','cancellations','settings','backups','audit','counters'];
let db;
export const open=()=>new Promise((ok,ko)=>{const r=indexedDB.open(DB_NAME,SCHEMA);
r.onupgradeneeded=()=>{STORES.forEach(s=>{if(!r.result.objectStoreNames.contains(s))r.result.createObjectStore(s,{keyPath:'id'})})};
r.onsuccess=()=>{db=r.result;ok(db)};r.onerror=()=>ko(r.error)});
const rq=r=>new Promise((ok,ko)=>{r.onsuccess=()=>ok(r.result);r.onerror=()=>ko(r.error)});
export const all=s=>rq(db.transaction(s).objectStore(s).getAll());
export const stamp=o=>{const n=new Date().toISOString();return{id:crypto.randomUUID(),created:n,status:'active',...o,modified:n}};
/** Guarda varios registros en UNA transacción (todo o nada). */
export const batch=ops=>new Promise((ok,ko)=>{const t=db.transaction([...new Set(ops.map(o=>o[0]))],'readwrite');
ops.forEach(([s,o])=>{o.modified=new Date().toISOString();t.objectStore(s).put(o)});t.oncomplete=ok;t.onerror=t.onabort=()=>ko(t.error)});
export const folio=(key,fmt)=>new Promise((ok,ko)=>{const t=db.transaction('counters','readwrite'),s=t.objectStore('counters'),g=s.get(key);
g.onsuccess=()=>{const c=g.result||{id:key,n:0};c.n++;s.put(c);t.oncomplete=()=>ok(fmt(c.n))};t.onerror=()=>ko(t.error)});
/** Reemplazo total atómico: si algo falla, la transacción se revierte. */
export const replaceAll=data=>new Promise((ok,ko)=>{const t=db.transaction(STORES,'readwrite');
STORES.forEach(s=>{if(s==='backups')return;const o=t.objectStore(s);o.clear();(data[s]||[]).forEach(x=>o.put(x))});
t.oncomplete=ok;t.onerror=t.onabort=()=>ko(t.error)});
