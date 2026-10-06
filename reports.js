const sum=(a,f)=>a.reduce((t,x)=>t+f(x),0);
export function summarize(sales,abonos,purchases,expenses){const s=sales.filter(x=>x.status==='active'),ab=abonos.filter(x=>x.status==='active');
const ventas=sum(s,x=>x.total),costo=sum(s,x=>x.cost),cobros=sum(s,x=>x.paid),abon=sum(ab,x=>x.amount),compras=sum(purchases,x=>x.cost),gastos=sum(expenses,x=>x.amount);
return{ventas,cobros,abonos:abon,creditos:sum(s,x=>x.credit),costo,bruta:ventas-costo,gastos,neta:ventas-costo-gastos,compras,flujo:cobros+abon-compras-gastos}}
export const csv=rows=>'\ufeff'+rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\r\n');
