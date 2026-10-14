(function(){
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],L=localStorage;
const page=(location.pathname.split('/').pop()||'index.html').replace('.html','');
if(['credit','products','clients','reports'].includes(page)&&!L.fiao_session){location.replace('login.html');return}
const ES={'Home':'Inicio','Credit':'Crédito','Products':'Productos','Clients':'Clientes','Reports':'Reportes','Contact':'Contacto',
'Your':'Tu cuaderno de','credit':'crédito','notebook, now digital.':'ahora digital.',
"FIA'O digitizes customer, debt, and payment management for convenience stores and small businesses in Panama, replacing the traditional paper ledger with a modern digital management system.":"FIA'O digitaliza la gestión de clientes, deudas y pagos de minisúpers y pequeños negocios en Panamá, reemplazando el cuaderno de papel por un sistema digital moderno.",
'Login':'Iniciar sesión','Sign up':'Registrarse','Log in':'Iniciar sesión','Log out':'Cerrar sesión','Go to dashboard':'Ir al panel',
'Debts':'Deudas','Payments':'Pagos','Manage customer debts, register payments, and track balances easily.':'Administra deudas, registra pagos y controla saldos fácilmente.',
'Select a customer':'Selecciona un cliente','Automatic blocking':'Bloqueo automático','Debt history':'Historial de deudas','Register payment':'Registrar pago','Payment amount':'Monto del pago','Mark as paid':'Marcar como pagado','Recent activity':'Actividad reciente','Debt overview':'Resumen de deudas',
'Current debt':'Deuda actual','Credit limit':'Límite de crédito','Outstanding debt':'Deuda pendiente','Payments today':'Pagos hoy','Customers with debt':'Clientes con deuda','Overdue':'Vencido',
'Inventory':'Inventario','Register fiado sale':'Registrar venta fiada','Your inventory, always exact':'Tu inventario, siempre exacto','Add new product':'Agregar producto','Create a new item':'Crea un artículo nuevo','Edit':'Editar','Delete':'Eliminar','Stock:':'Existencias:',
'Customer':'Cliente','Product':'Producto','Quantity':'Cantidad','Register sale':'Registrar venta',
'Client Management':'Gestión de clientes','Each client, with a clear account':'Cada cliente, con su cuenta clara','All':'Todos','On Time':'Al día','Pending':'Pendiente','Client':'Cliente','Purchases':'Compras','Pending debt':'Deuda pendiente','Status':'Estado','Actions':'Acciones','View detail →':'Ver detalle →','Automatic reminder sent':'Recordatorio automático','Send':'Enviar','+ New client':'+ Nuevo cliente',
"FIA'O Reports":"Reportes FIA'O",'Export PDF':'Exportar PDF','Export Excel':'Exportar Excel','Apply filters':'Aplicar filtros','Date range':'Rango de fechas','All Customers (All Names)':'Todos los clientes','Recent credit transactions':'Transacciones recientes',
'Contact and support':'Contacto y soporte','Does it work without internet?':'¿Funciona sin internet?','How to start using the app?':'¿Cómo empiezo a usar la app?','Do payment reminders arrive automatically?':'¿Los recordatorios de pago llegan solos?','Can I export my reports?':'¿Puedo exportar mis reportes?',"What if a customer doesn't pay?":'¿Y si un cliente no paga?','Name':'Nombre','Email':'Correo','Message':'Mensaje','Send message':'Enviar mensaje',
'Yes. You can record sales and payments offline and they sync when you are back online.':'Sí. Puedes registrar ventas y pagos sin conexión y se sincronizan al volver el internet.',
'Create an account, add your customers and products, then register your first fiado sale.':'Crea una cuenta, agrega tus clientes y productos y registra tu primera venta fiada.',
"Yes. FIA'O sends WhatsApp reminders to customers with pending balances.":"Sí. FIA'O envía recordatorios por WhatsApp a los clientes con saldo pendiente.",
'Yes. In Reports you can export to PDF or Excel.':'Sí. En Reportes puedes exportar a PDF o Excel.',
'Its account is marked Overdue and, with automatic blocking on, no new credit is allowed.':'Su cuenta se marca como Vencida y, con el bloqueo automático activo, no se le fía más.',
'Your name':'Tu nombre','Tell us how we can help you':'Cuéntanos cómo podemos ayudarte','Search products, pantry, drinks…':'Buscar productos, despensa, bebidas…','Search client by name or phone…':'Buscar cliente por nombre o teléfono…'};
const T=s=>L.fiao_lang==='ES'&&ES[s]||s,money=n=>'B/. '+n.toFixed(2),now=()=>new Date().toLocaleDateString();
const seed={c:[{n:'Ramón Batista',p:'6123-4567',d:35,l:100,k:14},{n:'Yolanda Pérez',p:'6234-8890',d:0,l:100,k:22},{n:'Carlos Ruiz',p:'6301-2245',d:62.5,l:100,k:9},{n:'Mireya Santos',p:'6415-7783',d:12,l:100,k:31}],
p:[{n:'Sugar',c:'Pantry',x:.85,s:25,u:'lb',e:'🍚'},{n:'Rice',c:'Pantry',x:.95,s:38,u:'lb',e:'🌾'},{n:'White Bread',c:'Bakery',x:1.5,s:12,u:'Unit',e:'🍞'},{n:'Coca Cola 2L',c:'Beverages',x:2.1,s:20,u:'Bottle',e:'🥤'},{n:'Eggs (Dozen)',c:'Dairy',x:3.2,s:15,u:'Pack',e:'🥚'}],a:[],b:true,pt:0};
let D=JSON.parse(L.fiao_data||'null')||seed;
const save=()=>L.fiao_data=JSON.stringify(D),log=(c,t)=>{D.a.unshift({c,t,d:now()});save()};
function tr(){const es=L.fiao_lang==='ES',w=document.createTreeWalker(document.body,4);let n;
while(n=w.nextNode()){if(n.parentNode.closest('script,style'))continue;const t=n.nodeValue.trim();if(!t)continue;
if(n.__o===undefined){if(!ES[t])continue;n.__o=n.nodeValue}
const k=n.__o.trim();n.nodeValue=es&&ES[k]?n.__o.replace(k,ES[k]):n.__o}
$$('[placeholder]').forEach(e=>{e.__p=e.__p||e.placeholder;e.placeholder=es&&ES[e.__p]||e.__p})}
// Botones de idioma y tema
const tools=document.createElement('div'),bl=document.createElement('button'),bt=document.createElement('button');
tools.className='tools';bl.className=bt.className='pill';tools.append(bl,bt);$('.nav').append(tools);
const th=()=>{document.documentElement.dataset.theme=L.fiao_theme||'light';bt.textContent=L.fiao_theme==='dark'?'☀️':'🌙';bl.textContent=L.fiao_lang==='ES'?'EN':'ES'};
bl.onclick=()=>{L.fiao_lang=L.fiao_lang==='ES'?'EN':'ES';th();tr()};
bt.onclick=()=>{L.fiao_theme=L.fiao_theme==='dark'?'light':'dark';th()};
const row=a=>`<div class="row"><span>${a.c}<br><small>${a.t}</small></span><small>${a.d}</small></div>`;
const st=c=>c.d>50?['over','Overdue']:c.d>0?['pend','Pending']:['ok','On Time'];

if(page==='credit'){
const sel=$('select'),m=$$('.mini b'),bar=$('.bar i'),pc=$('.card small'),amt=$('#amt'),chk=$('input[type=checkbox]'),rd=$$('input[type=radio]');
const cards=$$('.card'),act=cards.find(c=>$('h3',c).textContent==='Recent activity'),his=cards.find(c=>$('h3',c).textContent==='Debt history');
sel.innerHTML=D.c.map((c,i)=>`<option value="${i}">${c.n}</option>`).join('');chk.checked=D.b;chk.onchange=()=>{D.b=chk.checked;save()};
const show=()=>{const c=D.c[sel.value],p=Math.round(c.d/c.l*100);m[0].textContent=money(c.d);m[1].textContent=money(c.l);bar.style.width=Math.min(100,p)+'%';pc.textContent=p+'% · '+money(c.l);
m[2].textContent=money(D.c.reduce((s,x)=>s+x.d,0));m[3].textContent=money(D.pt);m[4].textContent=D.c.filter(x=>x.d>0).length;m[5].textContent=D.c.filter(x=>x.d>50).length;
act.innerHTML='<h3>Recent activity</h3>'+(D.a.slice(0,4).map(row).join('')||'<small>—</small>');
his.innerHTML='<h3>Debt history</h3>'+(D.a.filter(a=>a.c===c.n).slice(0,4).map(row).join('')||'<small>—</small>');tr()};
const pay=full=>{const c=D.c[sel.value];let v=full?c.d:parseFloat(amt.value);if(!(v>0))return alert(T('Enter a valid amount.'));v=Math.min(v,c.d);c.d-=v;D.pt+=v;log(c.n,T('Paid')+' '+money(v));amt.value='';show()};
$('.acts .pill').onclick=()=>pay(rd[1].checked);$('.acts .btn').onclick=()=>pay(true);sel.onchange=show;show()}

if(page==='products'){
const g=$('.g4'),q=$('input[type=search]'),tabs=$$('.tabs a'),sp=document.createElement('div');
sp.className='card';sp.hidden=true;sp.innerHTML='<h3>Register fiado sale</h3><label>Customer</label><select id="sc"></select><label>Product</label><select id="sp"></select><label>Quantity</label><input id="sq" type="number" min="1" value="1"><button class="btn" id="sb" style="margin-top:1rem">Register sale</button>';
$('.tabs').after(sp);
const r=()=>{const f=q.value.toLowerCase();
g.innerHTML=D.p.map((p,i)=>(p.n+p.c).toLowerCase().includes(f)?`<div class="card prod"><div class="top"><div class="thumb">${p.e}</div><div><span class="tag">${p.c}</span><br><b>${p.n}</b><br><span class="red-t">${money(p.x)}</span></div></div><div class="stock"><span>Stock:</span><b>${p.s} ${p.u}</b></div><div class="acts"><button class="btn line" data-e="${i}">Edit</button><button class="btn line" data-d="${i}">Delete</button></div></div>`:'').join('')+'<a class="card add" href="#" id="add"><b>+</b>Add new product<small>Create a new item</small></a>';
$('#sc').innerHTML=D.c.map((c,i)=>`<option value="${i}">${c.n}</option>`).join('');$('#sp').innerHTML=D.p.map((p,i)=>`<option value="${i}">${p.n} (${p.s})</option>`).join('');tr()};
q.oninput=r;
g.onclick=e=>{const b=e.target.closest('[data-e],[data-d],#add');if(!b)return;e.preventDefault();
if(b.id==='add'){const n=prompt(T('Product name')),c=n&&prompt(T('Category (Pantry, Dairy...)')),x=c&&parseFloat(prompt(T('Price in B/.'))),s=x>=0&&parseInt(prompt(T('Stock quantity')));
if(n&&c&&x>=0&&s>=0){D.p.push({n,c,x,s,u:'Unit',e:'📦'});save();r()}}
else if(b.dataset.d!==undefined){if(confirm(T('Delete this product?'))){D.p.splice(b.dataset.d,1);save();r()}}
else{const p=D.p[b.dataset.e],x=parseFloat(prompt(T('New price in B/.'),p.x)),s=parseInt(prompt(T('New stock'),p.s));if(x>=0)p.x=x;if(s>=0)p.s=s;save();r()}};
tabs.forEach((t,i)=>t.onclick=e=>{e.preventDefault();tabs.forEach(x=>x.classList.remove('on'));t.classList.add('on');g.hidden=q.hidden=!!i;sp.hidden=!i});
$('#sb').onclick=()=>{const c=D.c[$('#sc').value],p=D.p[$('#sp').value],n=parseInt($('#sq').value),tot=p.x*n;
if(!(n>0))return;if(n>p.s)return alert(T('Not enough stock.'));if(D.b&&c.d+tot>c.l)return alert(T('Credit limit exceeded. Customer is blocked.'));
c.d+=tot;c.k++;p.s-=n;log(c.n,T('New debt')+': '+money(tot));r();alert(T('Sale registered.'))};r()}

if(page==='clients'){
const tb=$('tbody'),q=$('input[type=search]'),chips=$$('.chip'),rem=$('.reminder'),nc=document.createElement('button');let f='All';
nc.className='btn';nc.textContent='+ New client';nc.type='button';$('.chips').append(nc);
const r=()=>{const s=q.value.toLowerCase();tb.innerHTML=D.c.map((c,i)=>{const t=st(c);return(c.n+c.p).toLowerCase().includes(s)&&(f==='All'||f===t[1])?`<tr><td><div class="who"><div class="av">${c.n.split(' ').map(w=>w[0]).join('').slice(0,2)}</div><div><b>${c.n}</b><br><small>${c.p}</small></div></div></td><td>${c.k} purchases</td><td><b>${c.d?money(c.d):'-'}</b></td><td><span class="badge ${t[0]}">${t[1]}</span></td><td><a href="#" data-v="${i}">View detail →</a></td></tr>`:''}).join('');
const top=[...D.c].sort((a,b)=>b.d-a.d)[0];$('small',rem).textContent=`WhatsApp to ${top.n}: "Hello ${top.n.split(' ')[0]}, you have ${money(top.d)} pending in Minisúper Doña Chela. See you soon!"`;tr()};
q.oninput=r;chips.forEach(c=>c.onclick=()=>{chips.forEach(x=>x.classList.remove('on'));c.classList.add('on');f=['All','On Time','Pending','Overdue'][chips.indexOf(c)];r()});
tb.onclick=e=>{const a=e.target.closest('[data-v]');if(!a)return;e.preventDefault();const c=D.c[a.dataset.v];alert(`${c.n}\n${c.p}\n${T('Pending debt')}: ${money(c.d)}\n${T('Purchases')}: ${c.k}`)};
nc.onclick=()=>{const n=prompt(T('Client name')),p=n&&prompt(T('Phone (e.g. 6123-4567)'));if(n&&p){D.c.push({n,p,d:0,l:100,k:0});save();r()}};
$('button',rem).onclick=()=>{const t=[...D.c].sort((a,b)=>b.d-a.d)[0];open('https://wa.me/507'+t.p.replace(/\D/g,'')+'?text='+encodeURIComponent(`Hello ${t.n.split(' ')[0]}, you have ${money(t.d)} pending in Minisúper Doña Chela. See you soon!`))};r()}

if(page==='reports'){
const rows=$$('.tablewrap tbody tr'),dt=$$('input[type=date]'),sl=$('select'),ex=$$('.acts .btn'),ap=$$('.btn').find(b=>b.textContent.trim()==='Apply filters');
sl.innerHTML='<option value="">All Customers (All Names)</option>'+rows.map(r=>`<option>${r.cells[0].textContent}</option>`).join('');
ap.onclick=()=>rows.forEach(r=>{const d=r.cells[3].textContent;r.hidden=!(d>=dt[0].value&&d<=dt[1].value&&(!sl.value||r.cells[0].textContent===sl.value))});
ex[0].onclick=()=>print();
ex[1].onclick=()=>{const csv=$$('.tablewrap tr').filter(r=>!r.hidden&&r.cells.length>1).map(r=>[...r.cells].map(c=>'"'+c.textContent.trim()+'"').join(',')).join('\n'),a=document.createElement('a');
a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv'}));a.download='fiao-report.csv';a.click()}}

if(page==='contact'){
const A=Object.keys(ES).filter(k=>/^(Yes\.|Create an account|Its account)/.test(k));
$$('details p').forEach((p,i)=>p.textContent=A[i]);
$('form').addEventListener('submit',e=>{e.preventDefault();const f=$$('input,textarea',e.target);if(f.some(x=>!x.value.trim()))return alert(T('Please fill in all fields.'));
D.m=(D.m||[]).concat({n:f[0].value,e:f[1].value,t:f[2].value});save();e.target.reset();alert(T('Message sent. We will reply soon.'))})}
th();tr();
})();
