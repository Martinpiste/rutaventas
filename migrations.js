import{all,batch,stamp,SCHEMA,STORES}from'./database.js';
/** Migraciones progresivas: idempotentes, no destructivas, sin borrar almacenes. */
export async function migrateSchema1To2(){/* futuro: añadir campos nuevos solo si faltan */}
export const MIGRATIONS={2:migrateSchema1To2};
export async function runMigrations(from=SCHEMA,to=SCHEMA){
 if(from>=to)return{migrated:false};
 const counts={};for(const s of STORES)counts[s]=(await all(s)).length;
 await batch([['backups',stamp({kind:'pre-migration',from,to,counts,snapshot:Object.fromEntries(await Promise.all(STORES.filter(s=>s!=='backups').map(async s=>[s,await all(s)])))})]]);
 for(let v=from+1;v<=to;v++)await MIGRATIONS[v]();
 return{migrated:true,counts};}
