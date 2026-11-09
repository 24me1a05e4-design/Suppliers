const KEY='supplierpro_v1';
let db=JSON.parse(localStorage.getItem(KEY)||'{"suppliers":[],"products":[],"assignments":[]}');
let editing={type:null,id:null};
const $=id=>document.getElementById(id);
const save=()=>{localStorage.setItem(KEY,JSON.stringify(db));render();};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initials=s=>String(s||'?').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
const statusBadge=s=>`<span class="status ${s==='ACTIVE'?'active':'inactive'}">${s==='ACTIVE'?'Active':'Inactive'}</span>`;
function navigate(page){document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page));document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===page));$('crumbName').textContent=({dashboard:'Dashboard',suppliers:'Suppliers',products:'Products',assignments:'Assignments'})[page];$('sidebar').classList.remove('open');render();}
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));
$('mobileMenu').onclick=()=>$('sidebar').classList.toggle('open');
$('today').textContent=new Intl.DateTimeFormat('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'}).format(new Date());
function render(){
 $('statSuppliers').textContent=db.suppliers.length;$('statActive').textContent=db.suppliers.filter(s=>s.status==='ACTIVE').length;$('statProducts').textContent=db.products.length;$('statAssignments').textContent=db.assignments.length;
 $('supplierNavCount').textContent=db.suppliers.length;$('productNavCount').textContent=db.products.length;
 const recent=[...db.suppliers].slice(-5).reverse();$('recentSuppliers').innerHTML=recent.map(s=>`<tr><td><div class="supplier-cell"><div class="mini-avatar">${esc(initials(s.name))}</div><span class="supplier-name">${esc(s.name)}</span></div></td><td>${esc(s.email||'—')}</td><td>${statusBadge(s.status)}</td></tr>`).join('');$('recentEmpty').style.display=recent.length?'none':'block';
 renderSuppliers();renderProducts();renderAssignments();populateAssignmentChoices();
}
function renderSuppliers(){
 const q=$('supplierSearch').value.toLowerCase(),st=$('supplierStatus').value;
 const rows=db.suppliers.filter(s=>(st==='ALL'||s.status===st)&&[s.name,s.email,s.phone,s.address].join(' ').toLowerCase().includes(q));
 $('supplierRows').innerHTML=rows.map(s=>`<tr><td><div class="supplier-cell"><div class="mini-avatar">${esc(initials(s.name))}</div><span class="supplier-name">${esc(s.name)}</span></div></td><td>${esc(s.email||'—')}</td><td>${esc(s.phone||'—')}</td><td>${esc(s.address||'—')}</td><td>${statusBadge(s.status)}</td><td><button class="action-btn" onclick="editSupplier('${s.id}')">Edit</button><button class="action-btn delete" onclick="deleteSupplier('${s.id}')">Delete</button></td></tr>`).join('');
 $('supplierCount').textContent=`${rows.length} record${rows.length===1?'':'s'}`;$('supplierEmpty').style.display=rows.length?'none':'block';
}
function renderProducts(){
 const q=$('productSearch').value.toLowerCase();const rows=db.products.filter(p=>[p.name,p.sku,p.description].join(' ').toLowerCase().includes(q));
 $('productRows').innerHTML=rows.map(p=>{const names=db.assignments.filter(a=>a.productId===p.id).map(a=>db.suppliers.find(s=>s.id===a.supplierId)?.name).filter(Boolean);return `<tr><td><span class="product-name">${esc(p.name)}</span></td><td>${esc(p.sku||'—')}</td><td>${esc(p.description||'—')}</td><td>${names.length?esc(names.join(', ')):'—'}</td><td><button class="action-btn" onclick="editProduct('${p.id}')">Edit</button><button class="action-btn delete" onclick="deleteProduct('${p.id}')">Delete</button></td></tr>`}).join('');
 $('productCount').textContent=`${rows.length} record${rows.length===1?'':'s'}`;$('productEmpty').style.display=rows.length?'none':'block';
}
function renderAssignments(){
 $('assignmentList').innerHTML=db.assignments.map(a=>{const s=db.suppliers.find(x=>x.id===a.supplierId),p=db.products.find(x=>x.id===a.productId);if(!s||!p)return '';return `<div class="assignment-item"><div class="link-icon">⇄</div><div><b>${esc(p.name)}</b><small>Supplied by ${esc(s.name)} · ${s.status==='ACTIVE'?'Active supplier':'Inactive supplier'}</small></div><button class="action-btn delete" onclick="removeAssignment('${a.id}')">Remove</button></div>`}).join('');
 $('assignmentCount').textContent=db.assignments.length;$('assignmentEmpty').style.display=db.assignments.length?'none':'block';
}
function populateAssignmentChoices(){
 const s=$('assignSupplier'),p=$('assignProduct'),sv=s.value,pv=p.value;
 s.innerHTML='<option value="">Select a supplier</option>'+db.suppliers.filter(x=>x.status==='ACTIVE').map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('');
 p.innerHTML='<option value="">Select a product</option>'+db.products.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('');s.value=sv;p.value=pv;
}
$('supplierSearch').addEventListener('input',renderSuppliers);$('supplierStatus').addEventListener('change',renderSuppliers);$('productSearch').addEventListener('input',renderProducts);
function showModal(type,record=null){
 editing={type,id:record?.id||null};$('modalBackdrop').classList.add('show');$('modalEyebrow').textContent=type==='supplier'?'SUPPLIER DETAILS':'PRODUCT DETAILS';$('modalTitle').textContent=(record?'Edit ':'Add ')+(type==='supplier'?'supplier':'product');$('saveRecord').textContent=record?'Save changes':'Save '+type;
 const fields=type==='supplier'?[['name','Supplier name *','text',true],['email','Email address','email'],['phone','Phone number','tel'],['address','Address','text',true],['status','Status','select']]:[['name','Product name *','text',true],['sku','SKU','text'],['description','Description','textarea',true]];
 $('formFields').innerHTML=fields.map(([key,label,kind,full])=>`<div class="field ${full?'full-field':''}"><label for="field_${key}">${label}</label>${kind==='select'?`<select id="field_${key}"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>`:kind==='textarea'?`<textarea id="field_${key}" placeholder="${label}">${esc(record?.[key]||'')}</textarea>`:`<input id="field_${key}" type="${kind}" placeholder="${label}" value="${esc(record?.[key]||'')}" ${key==='name'?'required':''}>`}</div>`).join('');
 fields.forEach(([key])=>{if(record&&key==='status')$('field_status').value=record.status;});
}
function openSupplierModal(){showModal('supplier')}function openProductModal(){showModal('product')}
function editSupplier(id){const s=db.suppliers.find(x=>x.id===id);if(s)showModal('supplier',s)}function editProduct(id){const p=db.products.find(x=>x.id===id);if(p)showModal('product',p)}
$('recordForm').addEventListener('submit',e=>{e.preventDefault();const type=editing.type;const keys=type==='supplier'?['name','email','phone','address','status']:['name','sku','description'];const item={};keys.forEach(k=>item[k]=$('field_'+k).value.trim());if(!item.name){toast('Name is required');return;}if(editing.id){Object.assign((type==='supplier'?db.suppliers:db.products).find(x=>x.id===editing.id),item);toast((type==='supplier'?'Supplier':'Product')+' updated');}else{item.id=crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random());if(type==='supplier')db.suppliers.push(item);else db.products.push(item);toast((type==='supplier'?'Supplier':'Product')+' added');}$('modalBackdrop').classList.remove('show');save();});
function deleteSupplier(id){const s=db.suppliers.find(x=>x.id===id);if(!s||!confirm(`Delete supplier "${s.name}"? Its assignments will also be removed.`))return;db.suppliers=db.suppliers.filter(x=>x.id!==id);db.assignments=db.assignments.filter(a=>a.supplierId!==id);save();toast('Supplier deleted');}
function deleteProduct(id){const p=db.products.find(x=>x.id===id);if(!p||!confirm(`Delete product "${p.name}" and its assignments?`))return;db.products=db.products.filter(x=>x.id!==id);db.assignments=db.assignments.filter(a=>a.productId!==id);save();toast('Product deleted');}
function removeAssignment(id){db.assignments=db.assignments.filter(a=>a.id!==id);save();toast('Assignment removed');}
$('assignmentForm').addEventListener('submit',e=>{e.preventDefault();const supplierId=$('assignSupplier').value,productId=$('assignProduct').value;if(!supplierId||!productId){toast('Select a supplier and product');return;}if(db.assignments.some(a=>a.supplierId===supplierId&&a.productId===productId)){toast('This assignment already exists');return;}db.assignments.push({id:String(Date.now()),supplierId,productId});save();$('assignmentForm').reset();toast('Assignment created successfully');});
$('closeModal').onclick=$('cancelModal').onclick=()=>$('modalBackdrop').classList.remove('show');$('modalBackdrop').addEventListener('click',e=>{if(e.target===$('modalBackdrop'))$('modalBackdrop').classList.remove('show')});
let toastTimer;function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2600);}
render();
