import*as D from'./database.js';import{runMigrations}from'./migrations.js';import*as B from'./backup.js';import{summarize,csv}from'./reports.js';import{receipt}from'./receipts.js';
const $=document.getElementById('app'),m=n=>'$'+(+n).toLocaleString('es-MX',{maximumFractionDigits:2}),today=()=>new Date().toISOString().slice(0,10),pad=n=>String(n).padStart(4,'0');
let tab='hoy',cart=[],cli='',P=[],C=[];const A=window.A={};
const load=async()=>{P=await D.all('products');C=(await D.all('clients')).filter(c=>c.status!=='inactive')};
async function seed(){if((await D.all('products')).length)return;const k=(name,icon,unit,box,price)=>['products',D.stamp({name,icon,unit,box,half:box/2,cost:0,price,stock:0,min:0,freq:true})];
await D.batch([k('Huevo','🥚','cono',12,65),k('Chivacola bot.','🥤','pieza',24,20),k('Chivacola lata','🥫','pieza',24,20)])}
const tot=()=>cart.reduce((t,l)=>t+l.total,0),cost=()=>cart.reduce((t,l)=>t+l.qty*l.cost,0);
const line=(l,i)=>{const u=l.total-l.qty*l.cost,d=l.list*l.qty?100*(l.list*l.qty-l.total)/(l.list*l.qty):0;
return`<div class=line><b>${l.icon} ${l.name}</b> <small>(${l.unit})</small><button onclick="A.del(${i})" style="float:right">✕</button><br>
<button onclick="A.q(${i},-1)">−</button> ${l.qty} <button onclick="A.q(${i},1)">+</button> × ${m(l.total/l.qty)} = <input type=number inputmode=decimal value="${l.total}" onchange="A.t(${i},this.value)">
<br><small>Costo ${m(l.cost)} · <span class="${u<0?'ko':u==0?'wa':'ok'}">Utilidad ${m(u)}</span> · Desc ${d.toFixed(2)}%</small></div>`};
const install=()=>navigator.standalone||matchMedia('(display-mode: standalone)').matches?'':`<div class=card><b>Instalar en iPhone</b><ol><li>Abre esta app en Safari.</li><li>Toca Compartir.</li><li>Selecciona “Agregar a pantalla de inicio”.</li><li>Confirma el nombre.</li><li>Abre desde su nuevo icono.</li></ol></div>`;
const V={
async hoy(){const f=x=>x.date===today(),r=summarize((await D.all('sales')).filter(f),(await D.all('abonos')).filter(f),(await D.all('purchases')).filter(f),(await D.all('expenses')).filter(f));
const rows=[['Ventas',r.ventas],['Cobrado en ventas',r.cobros],['Abonos recibidos',r.abonos],['Créditos nuevos',r.creditos],['Total por cobrar',C.reduce((t,c)=>t+(c.balance||0),0)],['Utilidad bruta',r.bruta],['Gastos',r.gastos],['Utilidad neta',r.neta],['Compras',r.compras],['Flujo de efectivo',r.flujo]];
return`<h2>Hoy · ${today()}</h2>`+rows.map(([a,b])=>`<div class=row><span>${a}</span><b>${m(b)}</b></div>`).join('')+`<div class=row><span>Inventario bajo</span><b class=wa>${P.filter(p=>p.stock<=p.min).length}</b></div>`+install()},
ruta:()=>`<h2>Ruta</h2>`+(C.map(c=>`<div class=card><b>${c.name}</b> ${c.biz||''}<br><small>Saldo ${m(c.balance||0)} · ${c.state||'Pendiente'}</small><br><button class=pri onclick="A.visit('${c.id}')">Visitar</button> <button onclick="A.st('${c.id}','No compró')">No compró</button> <button onclick="A.st('${c.id}','No estaba')">No estaba</button></div>`).join('')||'<p>Agrega clientes.</p>'),
venta:()=>`<select onchange="A.cli(this.value)"><option value="">Cliente…</option>${C.map(c=>`<option value="${c.id}" ${cli==c.id?'selected':''}>${c.name}</option>`).join('')}</select>
<div class=grid>${P.filter(p=>p.freq&&p.status!=='inactive').map(p=>`<button class=pb onclick="A.add('${p.id}')">${p.icon}<small>${p.name}</small></button>`).join('')}</div>${cart.map(line).join('')}
<div id=bar><span>${cart.length} prod. | ${m(tot())} | Ut. ${m(tot()-cost())}</span><button onclick="A.pay()">COBRAR</button></div>`,
clientes:()=>`<h2>Clientes</h2><button class=pri onclick="A.newc()">+ Cliente</button>`+C.map(c=>`<div class=card><b>${c.name}</b> ${c.biz||''}<br><small>${c.phone||''} · Saldo ${m(c.balance||0)}</small></div>`).join(''),
más:()=>`<h2>Más</h2>`+[['Producto nuevo','newp'],['Compra','buy'],['Conteo físico','count'],['Gasto','exp'],['Historial / cancelar venta','hist'],['Exportar CSV de ventas','csv'],['Crear respaldo general','bk'],['Restaurar respaldo','rs'],['Buscar actualización','upd']].map(([a,b])=>`<button style="width:100%;margin:4px 0" onclick="A.${b}()">${a}</button>`).join('')+`<p class=wa>Si borras la aplicación o los datos de Safari, la información local puede eliminarse. Conserva un respaldo en Archivos o iCloud Drive.</p><div id=out></div>`};
async function show(){await load();$.innerHTML=await V[tab]();document.getElementById('nav').innerHTML=[['hoy','Hoy'],['ruta','Ruta'],['venta','Venta'],['clientes','Clientes'],['más','Más']].map(([k,l])=>`<button class="${tab==k?'on':''}" onclick="A.go('${k}')">${l}</button>`).join('')}
A.go=t=>{tab=t;show()};A.cli=v=>{cli=v};
A.add=id=>{const p=P.find(x=>x.id==id),c=C.find(x=>x.id==cli),pr=c?.prices?.[id]??p.price,l=cart.find(x=>x.pid==id);if(l){l.qty++;l.total=l.qty*l.price}else cart.push({pid:id,name:p.name,icon:p.icon,unit:p.unit,qty:1,price:pr,list:p.price,total:pr,cost:p.cost});show()};
A.q=(i,d)=>{const l=cart[i];l.qty=Math.max(1,l.qty+d);l.total=l.qty*l.price;show()};
A.t=(i,v)=>{const l=cart[i];l.total=+v;l.price=l.total/l.qty;show()}; // total exacto; precio unitario recalculado
A.del=i=>{cart.splice(i,1);show()};
A.visit=id=>{cli=id;tab='venta';show()};
A.st=async(id,s)=>{const c=C.find(x=>x.id==id);c.state=s;await D.batch([['clients',c]]);show()};
A.newc=async()=>{const name=prompt('Nombre');if(!name)return;await D.batch([['clients',D.stamp({name,biz:prompt('Negocio')||'',phone:prompt('Teléfono')||'',balance:0,prices:{}})]]);show()};
A.newp=async()=>{const name=prompt('Nombre');if(!name)return;const box=+prompt('Unidades por caja',1)||1;await D.batch([['products',D.stamp({name,icon:'📦',unit:'unidad',box,half:box/2,cost:+prompt('Costo unitario',0)||0,price:+prompt('Precio unidad',0)||0,stock:0,min:0,freq:true})]]);show()};
async function move(p,type,q,reason,ref){const prev=p.stock;p.stock+=q;return['movements',D.stamp({folio:await D.folio('M',n=>'M-'+pad(n)),type,productId:p.id,qty:q,prev,final:p.stock,reason,ref})]}
const pick=()=>P[+prompt(P.map((p,i)=>`${i+1}. ${p.name}`).join('\n'))-1];
A.buy=async()=>{const p=pick();if(!p)return;const q=+prompt('Cantidad (unidades base)'),c=+prompt('Costo total');if(!q||!(c>=0))return;
p.cost=(p.stock*p.cost+c)/(p.stock+q); // costo promedio ponderado
await D.batch([await move(p,'compra',q,'Compra'),['products',p],['purchases',D.stamp({date:today(),productId:p.id,qty:q,cost:c,supplier:prompt('Proveedor')||''})]]);show()};
A.count=async()=>{const p=pick();if(!p)return;const r=+prompt(`Registrado: ${p.stock}. Existencia real:`);if(isNaN(r)||r==p.stock)return;await D.batch([await move(p,'conteo',r-p.stock,'Conteo físico'),['products',p]]);show()};
A.exp=async()=>{const amount=+prompt('Importe');if(!amount)return;await D.batch([['expenses',D.stamp({date:today(),amount,cat:prompt('Categoría (Gasolina, Mantenimiento, Estacionamiento, Comida de ruta, Papelería, Otros)')||'Otros',desc:prompt('Descripción')||''})]]);show()};
A.pay=async()=>{const c=C.find(x=>x.id==cli);if(!cart.length)return;if(!c)return alert('Elige un cliente');const t=tot(),u=t-cost();let reason='';
if(u<0){if(!confirm('Utilidad total negativa. ¿Permitir?'))return;reason=prompt('Motivo obligatorio');if(!reason)return}
const paid=+prompt(`Total ${m(t)}. Pago de esta venta:`,t),ab=+prompt(`Saldo anterior ${m(c.balance||0)}. Abono a deuda anterior:`,0)||0;if(isNaN(paid))return;
const credit=t-paid,bal=(c.balance||0)+credit-ab,ops=[],fv=await D.folio('V'+today(),n=>`V-${today().replace(/-/g,'')}-${pad(n)}`);
const s=D.stamp({folio:fv,date:today(),clientId:c.id,clientName:c.name,lines:cart.map(l=>({...l})),total:t,cost:cost(),paid,credit,abono:ab,balance:bal,negReason:reason});
ops.push(['sales',s]);for(const l of cart){const p=P.find(x=>x.id==l.pid);ops.push(await move(p,'salida',-l.qty,'Venta',fv),['products',p])}
if(ab>0)ops.push(['abonos',D.stamp({date:today(),clientId:c.id,amount:ab,ref:fv})]);c.balance=bal;c.last=today();c.state='Compró';ops.push(['clients',c]);
await D.batch(ops);cart=[];showReceipt(s,c)};
function showReceipt(s,c){const cv=receipt(s,c,'RutaVentas'),url=cv.toDataURL('image/png');document.getElementById('ov').innerHTML=`<img src="${url}"><br><button class=pri id=sh>Compartir</button> <a download="${s.folio}.png" href="${url}"><button>Descargar PNG</button></a> <button onclick="print()">Imprimir/PDF</button> <button onclick="document.getElementById('ov').innerHTML='';A.go('hoy')">Cerrar</button>`;
document.getElementById('sh').onclick=()=>cv.toBlob(async b=>{try{await navigator.share({files:[new File([b],s.folio+'.png',{type:'image/png'})]})}catch{}})}
A.hist=async()=>{const s=(await D.all('sales')).sort((a,b)=>b.created.localeCompare(a.created));document.getElementById('out').innerHTML=s.slice(0,30).map(x=>`<div class=card>${x.folio} · ${x.clientName} · ${m(x.total)} <b class=${x.status=='active'?'ok':'ko'}>${x.status}</b>${x.status=='active'?` <button onclick="A.cancel('${x.id}')">Cancelar</button>`:''}</div>`).join('')};
A.cancel=async id=>{const s=(await D.all('sales')).find(x=>x.id==id),reason=prompt('Motivo de cancelación');if(!reason||!confirm('¿Cancelar '+s.folio+'?'))return;const ops=[];
for(const l of s.lines){const p=P.find(x=>x.id==l.pid);ops.push(await move(p,'devolución',l.qty,'Cancelación '+s.folio,s.folio),['products',p])}
const c=C.find(x=>x.id==s.clientId);c.balance=(c.balance||0)-s.credit;ops.push(['clients',c]);s.status='cancelled';s.cancelReason=reason;ops.push(['sales',s],['cancellations',D.stamp({saleId:s.id,folio:s.folio,reason})]);
await D.batch(ops);show()}; // el abono anterior se conserva
A.csv=async()=>{const s=(await D.all('sales')).map(x=>[x.folio,x.date,x.clientName,x.total,x.paid,x.credit,x.status]);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv([['Folio','Fecha','Cliente','Total','Pago','Crédito','Estado'],...s])],{type:'text/csv'}));a.download='ventas.csv';a.click()};
A.bk=async()=>{await B.exportAll();localStorage.setItem('lastBackup',Date.now())};
A.rs=()=>{const i=document.createElement('input');i.type='file';i.accept='.json';i.onchange=async()=>{try{const o=await B.validate(await i.files[0].text()),n=o.meta.counts;
if(confirm(`Reemplazar TODO con: ${n.clients} clientes, ${n.products} productos, ${n.sales} ventas, ${n.movements} movimientos?`)){await B.restoreReplace(o);alert('Restaurado');show()}}catch(e){alert('Error: '+e.message)}};i.click()};
A.upd=async()=>{try{const v=await(await fetch('version.json',{cache:'no-store'})).json();if(v.version===D.APP_VERSION)return alert('Estás al día');
document.getElementById('upd').innerHTML=`Actualización ${v.version} disponible<br><small>${v.notes}</small><br><button class=pri onclick="A.doUpd()">Actualizar ahora</button> <button onclick="document.getElementById('upd').innerHTML=''">Después</button>`}catch{alert('Sin conexión')}};
A.doUpd=async()=>{if(cart.length)return alert('Termina la venta abierta primero');await B.exportAll();if(!confirm('¿Guardaste el respaldo en Archivos o iCloud Drive?'))return;
const r=await navigator.serviceWorker.getRegistration();await r.update();r.waiting?.postMessage('SKIP');setTimeout(()=>location.reload(),1500)};
const net=()=>document.getElementById('net').textContent=navigator.onLine?'● Conectado':'○ Sin conexión';addEventListener('online',net);addEventListener('offline',net);
(async()=>{await D.open();await runMigrations();await seed();net();if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js');show()})();
