/** Nota PNG para el cliente. NO incluye costos ni utilidad. */
export function receipt(s,client,seller){const L=s.lines,h=340+L.length*28+(s.credit||s.abono?90:30),c=document.createElement('canvas');c.width=520;c.height=h;
const g=c.getContext('2d'),m=n=>'$'+(+n).toLocaleString('es-MX',{maximumFractionDigits:2});g.fillStyle='#fff';g.fillRect(0,0,520,h);g.fillStyle='#4c1d95';g.fillRect(0,0,520,60);
g.fillStyle='#fff';g.font='bold 26px sans-serif';g.fillText(seller||'RutaVentas',20,40);g.fillStyle='#111';g.font='18px sans-serif';let y=95;
const t=(a,b)=>{g.textAlign='left';g.fillText(a,20,y);if(b!==undefined){g.textAlign='right';g.fillText(b,500,y)}y+=28};
t('Folio: '+s.folio);t('Fecha: '+s.date);t('Cliente: '+client.name);y+=8;
L.forEach(l=>t(`${l.qty} ${l.name} × ${m(l.total/l.qty)}`,m(l.total)));
const dsc=L.reduce((a,l)=>a+Math.max(0,l.list*l.qty-l.total),0);if(dsc>0)t('Descuento',m(dsc));
g.font='bold 20px sans-serif';t('TOTAL',m(s.total));g.font='18px sans-serif';t('Pago',m(s.paid));
if(s.credit)t('Crédito nuevo',m(s.credit));if(s.abono)t('Abono anterior',m(s.abono));t('Saldo final',m(s.balance));
if(client.next)t('Próxima visita: '+client.next);y+=10;g.textAlign='center';g.fillText('¡Gracias por su compra!',260,y);return c}
