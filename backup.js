import{APP_ID,APP_VERSION,SCHEMA,STORES,all,stamp,batch,replaceAll}from'./database.js';
const sha=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
export async function snapshot(){const data={},counts={};for(const s of STORES){data[s]=await all(s);counts[s]=data[s].length}
const meta={appId:APP_ID,appVersion:APP_VERSION,schema:SCHEMA,exported:new Date().toISOString(),backupId:crypto.randomUUID(),counts};
return{meta,data,checksum:await sha(JSON.stringify({meta,data}))}}
export async function exportAll(){const o=await snapshot(),d=new Date(),p=n=>String(n).padStart(2,'0');
const name=`RutaVentas_respaldo_v${APP_VERSION}_${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}.json`;
const f=new File([JSON.stringify(o)],name,{type:'application/json'});
try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f]});return o}}catch(e){if(e.name==='AbortError')return o}
const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=name;a.click();return o}
export async function validate(text){const o=JSON.parse(text);if(!o.meta||o.meta.appId!==APP_ID)throw Error('APP_ID no coincide');
if(o.checksum!==await sha(JSON.stringify({meta:o.meta,data:o.data})))throw Error('Checksum inválido');
if(o.meta.schema>SCHEMA)throw Error('Respaldo de un esquema más nuevo');return o}
export async function restoreReplace(o){await batch([['backups',stamp({kind:'pre-restore',snapshot:(await snapshot()).data})]]);await replaceAll(o.data)}
