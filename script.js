let S={acc:null,products:[],invoices:[],user:false},tab='home',cart=[],msg='';
try{const d=JSON.parse(localStorage.getItem('garea')||'null');if(d)S=Object.assign(S,d)}catch(e){}
const save=()=>{try{localStorage.setItem('garea',JSON.stringify(S))}catch(e){}};
const $=s=>document.querySelector(s),esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const m=n=>'$'+(+n).toFixed(2),uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const go=t=>{tab=t;msg='';render()};
function render(){
 const a=$('#app');
 if(!S.acc||!S.user){a.innerHTML=authView();return}
 const tabs=[['home','Home'],['invoice','Invoice'],['stock','Stock'],['report','Report'],['account','Account']];
 a.innerHTML=`<header><span class="logo">Garea</span><nav>${tabs.map(t=>`<button class="${tab==t[0]?'on':''}" onclick="go('${t[0]}')">${t[1]}</button>`).join('')}</nav>${themeSwitch()}</header><main>${{home,invoice,stock,report,account}[tab]()}</main>`;
}
function authView(){
 const su=!S.acc;
 return `<div class="auth"><div style="text-align:right;margin-bottom:8px">${themeSwitch()}</div><div class="card"><h2 class="logo">Garea</h2><p class="mu">${su?'Create your store account':'Sign in to your store'}</p>
 ${su?`<div><label>Store name</label><input id="sn"></div><div><label>Telephone</label><input id="ph"></div><div><label>Location</label><input id="lo"></div>`:`<div><label>Telephone</label><input id="ph"></div>`}
 <div><label>Password</label><input id="pw" type="password"></div><div class="err">${msg}</div>
 <button class="btn" style="width:100%" onclick="${su?'signup()':'signin()'}">${su?'Sign up':'Sign in'}</button></div></div>`;
}
function signup(){
 const v=i=>$('#'+i).value.trim();
 if(!v('sn')||!v('ph')||!v('pw')){msg='Please fill store name, telephone and password.';return render()}
 S.acc={name:v('sn'),phone:v('ph'),loc:v('lo'),pw:v('pw')};S.user=true;msg='';save();render();
}
function signin(){
 if($('#ph').value.trim()==S.acc.phone&&$('#pw').value==S.acc.pw){S.user=true;msg='';save();render()}
 else{msg='Wrong telephone or password.';render()}
}
function home(){
 const units=S.products.reduce((s,p)=>s+p.qty,0),val=S.products.reduce((s,p)=>s+p.qty*p.price,0),
 sales=S.invoices.reduce((s,i)=>s+i.total,0),low=S.products.filter(p=>p.qty<=5);
 return `<h2>${esc(S.acc.name)}</h2><div class="grid">
 <div class="stat"><small>Products</small><b>${S.products.length}</b></div>
 <div class="stat"><small>Units in stock</small><b>${units}</b></div>
 <div class="stat"><small>Stock value</small><b>${m(val)}</b></div>
 <div class="stat"><small>Invoices</small><b>${S.invoices.length}</b></div>
 <div class="stat"><small>Total sales</small><b>${m(sales)}</b></div></div>
 <div class="card"><h2>Low stock (5 or fewer)</h2>${low.length?low.map(p=>`<div>${esc(p.name)} – <span class="low">${p.qty} left</span></div>`).join(''):'<span class="mu">All products are well stocked.</span>'}</div>
 <div class="card"><h2>Recent invoices</h2><div class="tw"><table><tr><th>No.</th><th>Date</th><th>Customer</th><th class="r">Total</th><th></th></tr>
 ${S.invoices.slice(-6).reverse().map(i=>`<tr><td>#${i.no}</td><td>${i.date}</td><td>${esc(i.cust||'-')}</td><td class="r">${m(i.total)}</td><td class="r"><button class="btn g" onclick="dl('pdf',${i.no})">PDF</button> <button class="btn g" onclick="dl('png',${i.no})">Photo</button></td></tr>`).join('')||'<tr><td colspan="5" class="mu">No invoices yet.</td></tr>'}</table></div></div>
 <div class="card"><h2>Current stock</h2><div class="pg">${S.products.map(p=>`<div class="pc">${p.img?`<img class="im" src="${p.img}" alt="" onclick="showPh(this.src)">`:'<div class="im"></div>'}<div style="margin-top:6px;font-weight:600">${esc(p.name)}</div><div class="mu">${m(p.price)}</div><div class="q ${p.qty<=5?'low':''}">Qty: ${p.qty}</div></div>`).join('')||'<span class="mu">No products yet. Add them in Stock.</span>'}</div></div>`;
}
function stockTable(del){
 return `<div class="tw"><table><tr><th></th><th>Product</th><th class="r">Price</th><th class="r">Qty</th>${del?'<th></th>':''}</tr>
 ${S.products.map(p=>`<tr><td>${p.img?`<img class="th" src="${p.img}" alt="" onclick="showPh(this.src)">`:'<span class="th"></span>'}</td><td>${esc(p.name)}</td><td class="r">${m(p.price)}</td><td class="r ${p.qty<=5?'low':''}">${p.qty}</td>${del?`<td class="r"><button class="btn g" onclick="chgPhoto('${p.id}')">Photo</button> <button class="btn g" onclick="adj('${p.id}',1)">+1</button> <button class="btn g" onclick="adj('${p.id}',-1)">−1</button> <button class="btn d" onclick="rem('${p.id}')">Remove</button></td>`:''}</tr>`).join('')||`<tr><td colspan="5" class="mu">No products yet. Add them in Stock.</td></tr>`}</table></div>`;
}
function stock(){
 return `<div class="card"><h2>Add product</h2><div class="row"><div><label>Name</label><input id="pn"></div><div><label>Price (USD)</label><input id="pp" type="number" min="0" step="0.01"></div><div><label>Quantity</label><input id="pq" type="number" min="0" step="1"></div><div><label>Photo (optional)</label><input id="pi" type="file" accept="image/*"></div><div style="flex:0"><button class="btn" onclick="addP()">Add</button></div></div><div class="err">${msg}</div></div>
 <input type="file" id="chg" accept="image/*" hidden onchange="setPhoto(this)"><div class="card"><h2>Stock</h2>${stockTable(true)}</div>`;
}
async function addP(){
 const n=$('#pn').value.trim(),p=parseFloat($('#pp').value),q=parseInt($('#pq').value);
 if(!n||isNaN(p)||isNaN(q)||p<0||q<0){msg='Enter a name, price and quantity.';return render()}
 const ex=S.products.find(x=>x.name.toLowerCase()==n.toLowerCase());
 const f=$('#pi').files[0],img=f?await readImg(f):'';
 if(f&&!img){alert('Could not read this photo. Try another picture.');return}
 if(ex){ex.qty+=q;ex.price=p;if(img)ex.img=img}else S.products.push({id:uid(),name:n,price:p,qty:q,img});
 msg='';save();render();
}
function adj(id,d){const p=S.products.find(x=>x.id==id);if(p){p.qty=Math.max(0,p.qty+d);save();render()}}
function rem(id){if(confirm('Remove this product from stock?')){S.products=S.products.filter(x=>x.id!=id);cart=cart.filter(c=>c.id!=id);save();render()}}
function addI(){
 const p=S.products.find(x=>x.id==$('#ip').value),q=parseInt($('#iq').value);
 if(!p||!q||q<1){msg='Choose a product and quantity.';return render()}
 const c=cart.find(x=>x.id==p.id),have=(c?c.qty:0)+q;
 if(have>p.qty){msg='Only '+p.qty+' of '+p.name+' in stock.';return render()}
 if(c)c.qty=have;else cart.push({id:p.id,name:p.name,price:p.price,qty:q});
 msg='';render();
}
function toPdf(c){
 const bin=atob(c.toDataURL('image/jpeg',0.92).split(',')[1]),n=bin.length,img=new Uint8Array(n);
 for(let i=0;i<n;i++)img[i]=bin.charCodeAt(i);
 const W=c.width,H=c.height,pw=595,ph=Math.round(595*H/W),enc=new TextEncoder(),ch=[],xr=[];let off=0;
 const add=d=>{const b=typeof d=='string'?enc.encode(d):d;ch.push(b);off+=b.length};
 add('%PDF-1.4\n');
 xr[1]=off;add('1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n');
 xr[2]=off;add('2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n');
 xr[3]=off;add('3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 '+pw+' '+ph+']/Resources<</XObject<</I 4 0 R>>>>/Contents 5 0 R>>endobj\n');
 xr[4]=off;add('4 0 obj<</Type/XObject/Subtype/Image/Width '+W+'/Height '+H+'/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length '+n+'>>stream\n');add(img);add('\nendstream endobj\n');
 const cs='q '+pw+' 0 0 '+ph+' 0 0 cm /I Do Q';
 xr[5]=off;add('5 0 obj<</Length '+cs.length+'>>stream\n'+cs+'\nendstream endobj\n');
 const xo=off;add('xref\n0 6\n0000000000 65535 f \n'+[1,2,3,4,5].map(k=>String(xr[k]).padStart(10,'0')+' 00000 n \n').join('')+'trailer<</Size 6/Root 1 0 R>>\nstartxref\n'+xo+'\n%%EOF');
 return new Blob(ch,{type:'application/pdf'});
}
async function dl(kind,no){
 const inv=no?S.invoices.find(x=>x.no==no):cur();
 if(!inv||!inv.items.length){alert('Add at least one item first.');return}
 const canvas=drawInv(inv),name='Garea-invoice-'+inv.no;
 try{
  const blob=kind==='pdf'?toPdf(canvas):await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Image export failed')),'image/png'));
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=name+(kind==='pdf'?'.pdf':'.png');
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 }catch(e){console.error(e);alert('Could not create the file. Please try again or use Print.');}
}
function isoD(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function ik(i){return i.iso||(isNaN(new Date(i.date))?'':isoD(new Date(i.date)))}
let rp={d:isoD(new Date()),m:isoD(new Date()).slice(0,7)};
function sumOf(l){return{n:l.length,items:l.reduce((s,i)=>s+i.items.reduce((a,c)=>a+c.qty,0),0),tax:l.reduce((s,i)=>s+(i.tax||0),0),total:l.reduce((s,i)=>s+i.total,0)}}
function sumHtml(s){return `<div class="grid"><div class="stat"><small>Invoices</small><b>${s.n}</b></div><div class="stat"><small>Items sold</small><b>${s.items}</b></div><div class="stat"><small>Tax</small><b>${m(s.tax)}</b></div><div class="stat"><small>Total sales</small><b>${m(s.total)}</b></div></div>`}
function prodTable(l){const o={};l.forEach(i=>i.items.forEach(c=>{o[c.name]=o[c.name]||{q:0,a:0};o[c.name].q+=c.qty;o[c.name].a+=c.qty*c.price}));const a=Object.entries(o);return `<div class="tw"><table><tr><th>Product</th><th class="r">Qty sold</th><th class="r">Amount</th></tr>${a.map(([n,v])=>`<tr><td>${esc(n)}</td><td class="r">${v.q}</td><td class="r">${m(v.a)}</td></tr>`).join('')||'<tr><td colspan="3" class="mu">No sales.</td></tr>'}</table></div>`}
function report(){
 const day=S.invoices.filter(i=>ik(i)==rp.d),mon=S.invoices.filter(i=>ik(i).slice(0,7)==rp.m),bd={};
 mon.forEach(i=>{const k=ik(i);bd[k]=bd[k]||{n:0,t:0};bd[k].n++;bd[k].t+=i.total});
 const days=Object.keys(bd).sort();
 return `<div class="card"><h2>End of day</h2><div class="row noprint" style="margin-bottom:12px"><div style="max-width:220px"><label>Date</label><input type="date" value="${rp.d}" onchange="rp.d=this.value||rp.d;render()"></div><div style="flex:0"><button class="btn g" onclick="window.print()">Print</button></div></div>${sumHtml(sumOf(day))}${prodTable(day)}</div>
 <div class="card"><h2>End of month</h2><div class="row noprint" style="margin-bottom:12px"><div style="max-width:220px"><label>Month</label><input type="month" value="${rp.m}" onchange="rp.m=this.value||rp.m;render()"></div><div style="flex:0"><button class="btn g" onclick="window.print()">Print</button></div></div>${sumHtml(sumOf(mon))}<div class="tw"><table><tr><th>Date</th><th class="r">Invoices</th><th class="r">Total</th></tr>${days.map(k=>`<tr><td>${k}</td><td class="r">${bd[k].n}</td><td class="r">${m(bd[k].t)}</td></tr>`).join('')||'<tr><td colspan="3" class="mu">No sales.</td></tr>'}</table></div><h2 style="margin-top:16px">Products sold</h2>${prodTable(mon)}</div>`;
}
let meta={cu:'',tx:0,du:''};
function cur(){const sub=cart.reduce((s,c)=>s+c.qty*c.price,0),t=parseFloat(meta.tx)||0,tax=sub*t/100;return{no:S.invoices.length+1,date:new Date().toLocaleDateString(),iso:isoD(new Date()),cust:meta.cu,due:meta.du,taxPct:t,items:cart,sub,tax,total:sub+tax}}
function invoice(){
 const v=cur(),opts=S.products.filter(p=>p.qty>0),pd=String(v.no).padStart(5,'0'),bank=S.acc.bank||'',terms=S.acc.terms||'';
 return `<div class="card noprint"><h2>Add item</h2><div class="row"><div style="flex:2"><label>Product (from stock)</label><select id="ip">${opts.map(p=>`<option value="${p.id}">${esc(p.name)} – ${m(p.price)} (${p.qty} in stock)</option>`).join('')||'<option value="">No products in stock</option>'}</select></div><div><label>Qty</label><input id="iq" type="number" min="1" value="1"></div><div style="flex:0"><button class="btn" onclick="addI()">Add</button></div></div>
 <div class="row" style="margin-top:12px"><div><label>Customer</label><input value="${esc(meta.cu)}" onchange="meta.cu=this.value;render()"></div><div><label>Tax (%)</label><input type="number" min="0" step="0.1" value="${meta.tx}" onchange="meta.tx=this.value;render()"></div><div><label>Due date</label><input type="date" value="${esc(meta.du)}" onchange="meta.du=this.value;render()"></div></div><div class="err">${msg}</div></div>
 <div class="paper"><div class="ph"><div class="nm">${esc(S.acc.name)}</div><div class="big">INVOICE</div></div>
 <div class="pi"><div>${esc(S.acc.phone)}<br>${esc(S.acc.loc||'')}</div><div>${v.cust?'Billed to: '+esc(v.cust):'&nbsp;'}<br>${v.date}</div><div style="text-align:right;font-size:18px">#${pd}</div></div>
 <h3 class="dh">Description</h3><div class="ln"></div>
 ${v.items.map((c,i)=>`<div class="it"><span>${esc(c.name)} <span class="mu">× ${c.qty} @ ${m(c.price)}</span></span><span>${m(c.qty*c.price)} <button class="btn d noprint" onclick="cart.splice(${i},1);render()">✕</button></span></div>`).join('')||'<div class="it mu">No items yet.</div>'}
 <div class="ln"></div><div class="sm"><div><span>Subtotal</span><span>${m(v.sub)}</span></div><div><span>Tax (${v.taxPct}%)</span><span>${m(v.tax)}</span></div><div><b>Total</b><b>${m(v.total)}</b></div>${v.due?`<div class="ln" style="margin:6px 0"></div><div><span>Due Date</span><span>${esc(v.due)}</span></div>`:''}</div>
 ${bank||terms?`<div class="bt"><div><h3>Bank Details</h3><p>${esc(bank)}</p></div><div><h3>Terms</h3><p>${esc(terms)}</p></div></div>`:''}</div>
 <div class="row noprint" style="justify-content:center"><div style="flex:0"><button class="btn g" onclick="window.print()">Print</button></div><div style="flex:0"><button class="btn g" onclick="dl('pdf')">Save PDF</button></div><div style="flex:0"><button class="btn g" onclick="dl('png')">Save photo</button></div><div style="flex:0"><button class="btn" onclick="saveI()">Save invoice</button></div></div>`;
}
function saveI(){
 if(!cart.length){msg='Add at least one item.';return render()}
 const inv=cur();inv.items=cart.map(c=>({...c}));
 cart.forEach(c=>{const p=S.products.find(x=>x.id==c.id);if(p)p.qty-=c.qty});
 S.invoices.push(inv);cart=[];meta={cu:'',tx:meta.tx,du:''};save();go('home');
}
function wrap(x,t,w){const out=[];t.split('\n').forEach(p=>{let l='';p.split(' ').forEach(wd=>{const n=l?l+' '+wd:wd;if(x.measureText(n).width>w&&l){out.push(l);l=wd}else l=n});out.push(l)});return out}
function drawInv(inv){
 inv=Object.assign({sub:inv.total,tax:0,taxPct:0,due:''},inv);
 const W=800,c=document.createElement('canvas');c.width=W;c.height=2400;
 const x=c.getContext('2d'),F=(s,b)=>x.font=(b?'500 ':'')+s+'px system-ui,sans-serif',L=(a,b,y)=>{x.fillStyle='#bbb';x.fillRect(a,y,b-a,1)},K='#111',G='#666';
 x.fillStyle='#fafaf8';x.fillRect(0,0,W,2400);
 x.fillStyle=K;F(26,1);x.textAlign='left';x.fillText(S.acc.name.slice(0,22),60,95);
 x.textAlign='right';F(54);x.fillText('INVOICE',740,100);
 F(16);x.textAlign='left';x.fillStyle=G;x.fillText(S.acc.phone,60,175);x.fillText(S.acc.loc||'',60,205);
 x.fillText(inv.cust?'Billed to: '+inv.cust:'',330,175);x.fillText(inv.date,330,205);
 x.fillStyle=K;F(24);x.textAlign='right';x.fillText('#'+String(inv.no).padStart(5,'0'),740,178);
 x.textAlign='left';F(34);x.fillText('Description',60,300);L(60,740,325);
 let y=365;x.fillStyle=K;F(18);
 inv.items.forEach(it=>{x.textAlign='left';x.fillText(it.name.slice(0,34)+'  × '+it.qty,60,y);x.textAlign='right';x.fillText(m(it.qty*it.price),740,y);y+=38});
 L(60,740,y-14);y+=28;
 const row=(a,b,bold)=>{x.fillStyle=K;x.textAlign='left';F(18,bold);x.fillText(a,470,y);x.textAlign='right';x.fillText(b,740,y);y+=38};
 row('Subtotal',m(inv.sub));row('Tax ('+inv.taxPct+'%)',m(inv.tax));row('Total',m(inv.total),1);
 if(inv.due){L(470,740,y-16);y+=18;row('Due Date',inv.due)}
 const bank=(S.acc.bank||'').split('\n').filter(Boolean),terms=S.acc.terms||'';
 if(bank.length||terms){
  y+=6;L(60,740,y);y+=48;x.fillStyle=K;x.textAlign='left';F(26);x.fillText('Bank Details',60,y);x.fillText('Terms',420,y);y+=34;F(15);x.fillStyle=G;
  let yb=y;bank.forEach(l=>{x.fillText(l.slice(0,40),60,yb);yb+=26});
  let yt=y;wrap(x,terms,320).forEach(l=>{x.fillText(l,420,yt);yt+=24});
  y=Math.max(yb,yt);
 }
 const o=document.createElement('canvas');o.width=W;o.height=y+50;o.getContext('2d').drawImage(c,0,0);return o;
}
function account(){
 return `<div class="card" style="max-width:480px;margin:0 auto 16px"><h2>Account</h2>
 <div style="margin-bottom:10px"><label>Store name</label><input id="an" value="${esc(S.acc.name)}"></div>
 <div style="margin-bottom:10px"><label>Telephone</label><input id="ap" value="${esc(S.acc.phone)}"></div>
 <div style="margin-bottom:10px"><label>Location</label><input id="al" value="${esc(S.acc.loc)}"></div>
 <div style="margin-bottom:10px"><label>Bank details (shown on invoice, one per line)</label><textarea id="ab">${esc(S.acc.bank||'')}</textarea></div>
 <div style="margin-bottom:10px"><label>Terms (shown on invoice)</label><textarea id="at">${esc(S.acc.terms||'')}</textarea></div>
 <div style="margin-bottom:10px"><label>Password</label><input id="aw" type="password" value="${esc(S.acc.pw)}"></div>
 <div class="err">${msg}</div>
 <div class="row"><div style="flex:0"><button class="btn" onclick="saveA()">Save</button></div><div style="flex:0"><button class="btn g" onclick="S.user=false;save();render()">Sign out</button></div></div></div>`;
}
function saveA(){
 const n=$('#an').value.trim(),p=$('#ap').value.trim(),w=$('#aw').value;
 if(!n||!p||!w){msg='Name, telephone and password are required.';return render()}
 S.acc={name:n,phone:p,loc:$('#al').value.trim(),bank:$('#ab').value.trim(),terms:$('#at').value.trim(),pw:w};msg='Saved.';save();render();
}
function readImg(f){return new Promise(r=>{const fr=new FileReader();fr.onload=()=>{const i=new Image();i.onload=()=>{const k=Math.min(1,480/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=Math.round(i.width*k);c.height=Math.round(i.height*k);c.getContext('2d').drawImage(i,0,0,c.width,c.height);r(c.toDataURL('image/jpeg',0.8))};i.onerror=()=>r('');i.src=fr.result};fr.onerror=()=>r('');fr.readAsDataURL(f)})}
function showPh(s){const d=document.createElement('div'),img=document.createElement('img');d.className='ov';img.alt='Product photo';img.src=s;d.appendChild(img);d.onclick=()=>d.remove();document.body.appendChild(d)}
let pid=null;
function chgPhoto(id){pid=id;$('#chg').click()}
async function setPhoto(el){const f=el.files[0],p=S.products.find(x=>x.id==pid);if(f&&p){p.img=await readImg(f);save();render()}}
let T=null;try{T=localStorage.getItem('garea-theme')}catch(e){}
function applyTheme(){if(T)document.documentElement.dataset.theme=T;else delete document.documentElement.dataset.theme}
function eff(){return T||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}
function themeLabel(){return eff()=='dark'?'☀ Light':'🌙 Dark'}
function themeSwitch(){const d=eff()=='dark';return `<button class="sw ${d?'on':''}" role="switch" aria-checked="${d}" aria-label="Dark mode" onclick="toggleTheme()"><i></i></button>`}
function toggleTheme(){T=eff()=='dark'?'light':'dark';try{localStorage.setItem('garea-theme',T)}catch(e){}applyTheme();render()}
applyTheme();
render();
