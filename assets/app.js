/* =========================================================
   PadelMarket — shared script (all pages)
   - data (new rackets + second-hand listings)
   - mock auth (login required to sell) · cart count · listings stored in localStorage
   - header / footer injection · placeholder illustrations
   ========================================================= */
(function(){
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
window.$=$; window.$$=$$;
/* open every page at the top (or at its #section) — the artifact viewer otherwise keeps the previous scroll position */
try{history.scrollRestoration='manual'}catch(e){}
const toTop=()=>{const t=location.hash&&document.getElementById(location.hash.slice(1));if(t){t.scrollIntoView();return}window.scrollTo(0,0)};
addEventListener('pageshow',toTop);addEventListener('load',()=>{toTop();setTimeout(toTop,80)});
const uid=()=>'u'+Math.random().toString(36).slice(2,9);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- storage (falls back to memory if blocked) ---------- */
const mem={};
const store={
  get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return k in mem?mem[k]:d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){mem[k]=v;return false}},
  del(k){try{localStorage.removeItem(k)}catch(e){delete mem[k]}}
};

/* ---------- auth (prototype only — no real backend) ---------- */
const here=()=>(location.pathname.split('/').pop()||'index.html')+location.search+location.hash;
const auth={
  user:()=>store.get('pm_user',null),
  login(u){store.set('pm_user',u)},
  logout(){store.del('pm_user')},
  require(next){if(auth.user())return true;location.replace('login.html?next='+encodeURIComponent(next||here()));return false}
};

/* ---------- formatting ---------- */
const fmt=new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD',maximumFractionDigits:0});
const money=v=>fmt.format(+v||0);
function timeAgo(iso){
  const s=(Date.now()-new Date(iso))/1000;
  if(s<60)return'Just now';if(s<3600)return Math.floor(s/60)+'m ago';if(s<86400)return Math.floor(s/3600)+'h ago';if(s<86400*7)return Math.floor(s/86400)+'d ago';
  return new Date(iso).toLocaleDateString('en-AU',{day:'numeric',month:'short'});
}
const ago=(d,h=0)=>new Date(Date.now()-((d*24+h)*3600e3)).toISOString();

/* =========================================================
   DATA — edit here
   ========================================================= */
const BRANDS=['Adidas','Babolat','Bullpadel','Head','Joma','Lok','Nox','Oxdog','Royal Padel','Siux','StarVie','Wilson','Other'];
const CONDITIONS=['Like New','Good','Fair','Well Used'];
const LEVELS=['Beginner','Intermediate','Advanced','Pro'];
const SHAPES={Round:0,Teardrop:1,Hybrid:1,Diamond:2};

/* New rackets (shop catalogue) */
const NEW=[
 {id:'adidas-metalbone',brand:'Adidas',name:'Metalbone',price:479,shape:'Diamond',level:'Pro',game:'Attack',core:'Hard EVA',carbon:'18K',surface:'3D textured',weight:'360 g',balance:'High',finish:'Ivory / burgundy',photos:['images/rackets/adidas-metalbone.webp'],badges:['new'],stock:true,added:ago(2)},
 {id:'royal-padel-r30',brand:'Royal Padel',name:'R30 Golden White',price:349,shape:'Diamond',level:'Advanced',game:'Attack',core:'Medium EVA',carbon:'12K',surface:'Textured',weight:'360 g',balance:'High',finish:'White / gold',photos:['images/rackets/royal-padel-r30-white.webp'],badges:[],stock:true,added:ago(9)},
 {id:'royal-padel-carbon-pro',brand:'Royal Padel',name:'Carbon Pro',price:289,shape:'Diamond',level:'Intermediate',game:'Attack',core:'Medium EVA',carbon:'Carbon',surface:'Textured',weight:'360 g',balance:'Medium-high',finish:'Pink / black',photos:['images/rackets/royal-padel-carbon-pro-pink.webp'],badges:['new'],stock:true,added:ago(4)},
 {id:'oxdog-ultimate',brand:'Oxdog',name:'Ultimate',price:369,shape:'Teardrop',level:'Intermediate',game:'All-round',core:'Medium EVA',carbon:'12K',surface:'Textured',weight:'355 g',balance:'Medium',finish:'Silver / blue',photos:['images/rackets/oxdog-ultimate-trio.webp'],badges:['ltd'],stock:true,added:ago(12)},
 {id:'nox-at10',brand:'Nox',name:'AT10',price:449,shape:'Teardrop',level:'Advanced',game:'All-round',core:'Medium EVA',carbon:'18K',surface:'Textured',weight:'370 g',balance:'Medium',finish:'Black / gold',photos:['images/rackets/nox-at10.webp'],badges:[],stock:true,added:ago(20)},
 {id:'babolat-technical-viper',brand:'Babolat',name:'Technical Viper',price:419,shape:'Diamond',level:'Pro',game:'Attack',core:'Hard EVA',carbon:'3K',surface:'3D textured',weight:'365 g',balance:'High',finish:'Black / red',photos:['images/rackets/babolat-technical-viper.webp'],badges:[],stock:true,added:ago(15)},
 {id:'bullpadel-neuron',brand:'Bullpadel',name:'Neuron',price:399,shape:'Diamond',level:'Advanced',game:'Attack',core:'Hard EVA',carbon:'12K',surface:'Textured',weight:'359 g',balance:'High',finish:'Graphite / orange',photos:['images/rackets/bullpadel-neuron-orange.webp'],badges:[],stock:true,added:ago(30)},
 {id:'bullpadel-neuron-holo',brand:'Bullpadel',name:'Neuron Holo',price:429,shape:'Diamond',level:'Pro',game:'Attack',core:'Hard EVA',carbon:'12K',surface:'Textured',weight:'363 g',balance:'High',finish:'Holographic',photos:['images/rackets/bullpadel-neuron-holo.webp'],badges:['ltd'],stock:true,added:ago(6)},
 {id:'adidas-cross-it-light',brand:'Adidas',name:'Cross It Light',price:249,shape:'Round',level:'Beginner',game:'Control',core:'Soft EVA',carbon:'Fibreglass',surface:'Smooth',weight:'345 g',balance:'Low',finish:'Rose / silver',photos:['images/rackets/adidas-cross-it-light.webp'],badges:['new'],stock:true,added:ago(3)},
 {id:'joma-hyper-pro',brand:'Joma',name:'Hyper Pro HRD',price:329,shape:'Diamond',level:'Advanced',game:'Attack',core:'Hard EVA',carbon:'12K',surface:'Textured',weight:'365 g',balance:'High',finish:'Black / holographic',photos:['images/rackets/joma-hyper-pro.webp'],badges:[],stock:true,added:ago(25)},
 {id:'siux-fenix-pro',brand:'Siux',name:'Fenix Pro',price:389,shape:'Diamond',level:'Pro',game:'Attack',core:'Hard EVA',carbon:'12K',surface:'3D textured',weight:'365 g',balance:'High',finish:'Graphite / purple',photos:['images/rackets/siux-fenix-pro.webp'],badges:[],stock:true,added:ago(18)},
 {id:'nox-next-gen-hybrid',brand:'Nox',name:'Next Gen Hybrid',price:299,shape:'Hybrid',level:'Intermediate',game:'All-round',core:'Medium EVA',carbon:'12K',surface:'Textured',weight:'360 g',balance:'Medium',finish:'White / gold',photos:['images/rackets/nox-next-gen-white.webp'],badges:[],stock:true,added:ago(40)},
 {id:'lok-generation',brand:'Lok',name:'Generation',price:259,shape:'Round',level:'Intermediate',game:'Control',core:'Soft EVA',carbon:'3K',surface:'Smooth',weight:'355 g',balance:'Low',finish:'Black / red',photos:['images/rackets/lok-generation.webp'],badges:[],stock:false,added:ago(60)}
].map(p=>({...p,s:SHAPES[p.shape],desc:describe(p)}));
function describe(p){
  const style={Attack:'a fast, aggressive game with plenty of overheads',Control:'a patient game built on placement and consistency','All-round':'a balanced game from the back wall to the net'}[p.game];
  const feel={Diamond:'pushes the sweet spot higher for extra power on smashes',Teardrop:'blends power and control in one forgiving frame',Round:'keeps the sweet spot low and centred for easy, accurate contact',Hybrid:'sits between round and diamond for a versatile, all-court feel'}[p.shape];
  return `${p.brand} ${p.name} is made for ${p.level.toLowerCase()} players who enjoy ${style}. The ${p.shape.toLowerCase()} head ${feel}, while the ${p.core.toLowerCase()} core and ${p.carbon} face give a ${p.core.includes('Hard')?'firm, responsive':p.core.includes('Soft')?'soft, comfortable':'lively but stable'} response. At ${p.weight} with ${p.balance.toLowerCase()} balance and a ${p.surface.toLowerCase()} finish, it's a racket you can rely on set after set.`;
}

/* Second-hand listings — every field mirrors the "Post an Ad" form */
const SEED=[
 {id:'l1',title:'Nox AT10, new with tags, 370 g',brand:'Nox',model:'AT10',price:290,condition:'Like New',level:'Advanced',description:'Brand new, never played. Tags, grip wrap and the weight-adjustment kit are all still included. Selling because I was gifted the same racket twice.',location:'Richmond, VIC',photos:['images/rackets/nox-at10.webp'],seller:'Jess M.',created:ago(0,5),face:'#15171c',rim:'#d9dde5',s:1},
 {id:'l2',title:'Babolat Technical Viper, unused, tags on',brand:'Babolat',model:'Technical Viper',price:310,condition:'Like New',level:'Pro',description:'Unused with original tags and protective wrap on the handle. A firm, powerful racket for players who attack from the net.',location:'Bondi, NSW',photos:['images/rackets/babolat-technical-viper.webp'],seller:'Marco R.',created:ago(1,3),face:'#0b0c10',rim:'#1769BA',s:2},
 {id:'l3',title:'Bullpadel Neuron, 359 g, tags attached',brand:'Bullpadel',model:'Neuron',price:280,condition:'Like New',level:'Advanced',description:'Still in its plastic grip wrap with the swing tag attached. Bought for a tournament I ended up missing.',location:'New Farm, QLD',photos:['images/rackets/bullpadel-neuron-orange.webp'],seller:'Tom W.',created:ago(2),face:'#20232b',rim:'#ff7a3d',s:2},
 {id:'l4',title:'Bullpadel Neuron (holo edition), 363 g',brand:'Bullpadel',model:'Neuron',price:295,condition:'Like New',level:'Pro',description:'Holographic colourway, never hit. Swing tag and barcode still on. Happy to meet at a club in Perth.',location:'Fremantle, WA',photos:['images/rackets/bullpadel-neuron-holo.webp'],seller:'Priya K.',created:ago(3),face:'#20232b',rim:'#c9b28a',s:2},
 {id:'l5',title:'Adidas Cross It Light, great for beginners',brand:'Adidas',model:'Cross It Light',price:150,condition:'Like New',level:'Beginner',description:'Light and forgiving round racket. Comes with the accessory kit in the original envelope.',location:'Glenelg, SA',photos:['images/rackets/adidas-cross-it-light.webp'],seller:'Sam L.',created:ago(4),face:'#e9c9bd',rim:'#c0504d',s:0},
 {id:'l6',title:'Joma Hyper Pro HRD, hard core, attacking',brand:'Joma',model:'Hyper Pro HRD',price:220,condition:'Like New',level:'Advanced',description:'Hard-core attacking racket, 360 to 370 g. Unused with tags and barcode on the handle.',location:'Southport, QLD',photos:['images/rackets/joma-hyper-pro.webp'],seller:'Chris D.',created:ago(6),face:'#2a2c33',rim:'#d9d2a0',s:2},
 {id:'l7',title:'Siux Fenix Pro, purple grip, tags on',brand:'Siux',model:'Fenix Pro',price:260,condition:'Like New',level:'Pro',description:'Pro-series racket with the purple grip. Never played, still wrapped.',location:'Carlton, VIC',photos:['images/rackets/siux-fenix-pro.webp'],seller:'Ella P.',created:ago(8),face:'#3a3f4b',rim:'#7a3fb0',s:1},
 {id:'l8',title:'Nox Next Gen Hybrid, white, like new',brand:'Nox',model:'Next Gen Hybrid',price:230,condition:'Like New',level:'Intermediate',description:'Clean white finish with gold detailing. Tags and test strip still attached. Great all-rounder.',location:'Parramatta, NSW',photos:['images/rackets/nox-next-gen-white.webp'],seller:'Daniel H.',created:ago(10),face:'#f3f4f7',rim:'#c9b28a',s:1},
 {id:'l9',title:'Royal Padel R30 Golden White',brand:'Royal Padel',model:'R30 Golden White',price:240,condition:'Like New',level:'Advanced',description:'Diamond-shaped carbon racket in white and gold. Unused, comes with the original tag.',location:'Manly, NSW',photos:['images/rackets/royal-padel-r30-white.webp'],seller:'Olivia S.',created:ago(11),face:'#f3f4f7',rim:'#0A0B0E',s:2},
 {id:'l10',title:'Adidas Metalbone, new with accessory kit',brand:'Adidas',model:'Metalbone',price:320,condition:'Like New',level:'Pro',description:'Unused, still in the protective wrap with the accessory kit. A power racket for experienced players.',location:'South Yarra, VIC',photos:['images/rackets/adidas-metalbone.webp'],seller:'Ben T.',created:ago(12),face:'#f1ece4',rim:'#9e1b32',s:2},
 {id:'l11',title:'Royal Padel Carbon Pro, pink',brand:'Royal Padel',model:'Carbon Pro',price:210,condition:'Like New',level:'Intermediate',description:'Bold pink finish with carbon face. Never used, tag still attached.',location:'Subiaco, WA',photos:['images/rackets/royal-padel-carbon-pro-pink.webp'],seller:'Grace L.',created:ago(14),face:'#a01d4c',rim:'#0A0B0E',s:1},
 {id:'l12',title:'Lok Generation, round, control',brand:'Lok',model:'Generation',price:170,condition:'Good',level:'Intermediate',description:'Round control racket with a soft feel. Light marks on the frame from storage, face is clean.',location:'Norwood, SA',photos:['images/rackets/lok-generation.webp'],seller:'Hamish R.',created:ago(16),face:'#15171c',rim:'#d1343e',s:0},
 {id:'l13',title:'Oxdog Ultimate ×3, boxed, selling as a set',brand:'Oxdog',model:'Ultimate',price:690,condition:'Like New',level:'Advanced',description:'Three matching rackets, unused, in their original boxes. Ideal for a club or a doubles pair plus a spare. Will split if someone takes two.',location:'Fortitude Valley, QLD',photos:['images/rackets/oxdog-ultimate-trio.webp'],seller:'Ryan C.',created:ago(18),face:'#e9edf5',rim:'#1769BA',s:1}
];
const listings=()=>[...store.get('pm_listings',[]),...SEED].sort((a,b)=>new Date(b.created)-new Date(a.created));
function addListing(l){const all=store.get('pm_listings',[]);all.unshift(l);let ok=store.set('pm_listings',all);
  if(!ok&&l.photos.length){l.photos=l.photos.slice(0,1);ok=store.set('pm_listings',all)}return ok}
const getProduct=id=>NEW.find(p=>p.id===id);
const getListing=id=>listings().find(l=>l.id===id);
const condClass=c=>({'Like New':'c-like','Good':'c-good','Fair':'c-fair','Well Used':'c-used'}[c]||'c-good');

/* ---------- cart (new rackets + pre-loved listings) ---------- */
const MAX_QTY=5;
const cart={
  items:()=>store.get('pm_cart',[]).map(i=>({type:'new',...i})),
  save(it){store.set('pm_cart',it);renderCart()},
  count(){return cart.items().reduce((n,i)=>n+i.qty,0)},
  has(id,type='new'){return cart.items().some(i=>i.id===id&&i.type===type)},
  add(id,type='new'){const it=cart.items();const f=it.find(i=>i.id===id&&i.type===type);
    if(f){if(type==='listing'||f.qty>=MAX_QTY)return false;f.qty++}else it.push({id,type,qty:1});cart.save(it);return true},
  setQty(id,type,q){const it=cart.items();const f=it.find(i=>i.id===id&&i.type===type);if(!f)return;f.qty=Math.max(1,Math.min(type==='listing'?1:MAX_QTY,q));cart.save(it)},
  remove(id,type){cart.save(cart.items().filter(i=>!(i.id===id&&i.type===type)))},
  clear(){cart.save([])},
  lines(){return cart.items().map(i=>{
      if(i.type==='listing'){const l=getListing(i.id);if(!l)return null;
        return {...i,max:1,title:l.brand+' '+l.model,brand:l.brand,price:+l.price,photo:(l.photos||[])[0],href:'product.html?listing='+encodeURIComponent(l.id),meta:'Pre-loved · '+l.condition+' · sold by '+(l.seller||'a member')}}
      const p=getProduct(i.id);if(!p)return null;
      return {...i,max:MAX_QTY,title:p.brand+' '+p.name,brand:p.brand,price:p.price,photo:(p.photos||[])[0],href:'product.html?id='+p.id,meta:'New · '+p.shape+' · '+p.weight}
    }).filter(Boolean)},
  subtotal(){return cart.lines().reduce((t,l)=>t+l.price*l.qty,0)}
};
/* shipping options shown at checkout (placeholder rates) */
const SHIPPING=[{id:'standard',label:'Standard',eta:'3 to 6 business days',price:12.95},{id:'express',label:'Express',eta:'1 to 3 business days',price:19.95}];
const money2=v=>new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD',minimumFractionDigits:2}).format(+v||0);
const payIcons=(h=26)=>`<span class="payicons" aria-label="Visa, Mastercard and PayPal accepted">
  <svg height="${h}" viewBox="0 0 60 38" role="img" aria-label="Visa"><rect width="60" height="38" rx="6" fill="#fff" stroke="#dfe2e8"/><text x="30" y="25" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="16" font-weight="900" font-style="italic" fill="#1A1F71">VISA</text></svg>
  <svg height="${h}" viewBox="0 0 60 38" role="img" aria-label="Mastercard"><rect width="60" height="38" rx="6" fill="#fff" stroke="#dfe2e8"/><circle cx="25" cy="19" r="10" fill="#EB001B"/><circle cx="35" cy="19" r="10" fill="#F79E1B"/><path d="M30 10.3a10 10 0 0 1 0 17.4 10 10 0 0 1 0-17.4Z" fill="#FF5F00"/></svg>
  <svg height="${h}" viewBox="0 0 60 38" role="img" aria-label="PayPal"><rect width="60" height="38" rx="6" fill="#fff" stroke="#dfe2e8"/><text x="30" y="24" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="13" font-weight="900" font-style="italic"><tspan fill="#003087">Pay</tspan><tspan fill="#009CDE">Pal</tspan></text></svg></span>`;
function renderCart(){const n=$('#cartN');if(n)n.textContent=cart.count()}

/* =========================================================
   ILLUSTRATIONS (placeholders) — replace with photos via data-src="photo.jpg" on any .ph
   ========================================================= */
const SC={
  day:{sky:['#5d9fe0','#cfe4f7'],wall:'#0f1a2e',court:'#1769BA',lights:false},
  night:{sky:['#03050c','#0d1730'],wall:'#05070d',court:'#14579c',lights:true},
  dusk:{sky:['#0b1022','#2b4a8f'],wall:'#070a14',court:'#1769BA',lights:true}
};
function racketShape(face,rim,shape=0){
  const heads=[
    'M100 12 C152 12 178 52 178 102 C178 150 148 186 120 200 L112 214 H88 L80 200 C52 186 22 150 22 102 C22 52 48 12 100 12Z',
    'M100 8 C146 8 176 44 178 92 C180 146 150 184 120 200 L112 214 H88 L80 200 C50 184 20 146 22 92 C24 44 54 8 100 8Z',
    'M100 6 C138 6 172 34 180 78 C186 130 152 180 120 200 L112 214 H88 L80 200 C48 180 14 130 20 78 C28 34 62 6 100 6Z'];
  const id=uid();let holes='';
  for(let y=42;y<=168;y+=13)for(let x=46;x<=154;x+=13){const dx=(x-100)/66,dy=(y-100)/78;if(dx*dx+dy*dy<.78)holes+=`<circle cx="${x+(Math.floor(y/13)%2?6:0)}" cy="${y}" r="4.2"/>`}
  return `<defs><clipPath id="${id}"><path d="${heads[shape]}"/></clipPath></defs>
  <path d="${heads[shape]}" fill="${face}"/><g clip-path="url(#${id})" fill="#000" opacity=".5">${holes}</g>
  <path d="${heads[shape]}" fill="none" stroke="${rim}" stroke-width="5"/>
  <path d="M88 186 L112 186 L100 206Z" fill="#000" opacity=".9"/>
  <circle cx="100" cy="166" r="7" fill="none" stroke="${face==='#ffffff'||face.startsWith('#e')||face.startsWith('#f')||face.startsWith('#c')?'#0A0B0E':'#fff'}" stroke-width="2" opacity=".6"/>
  <rect x="89" y="212" width="22" height="80" rx="7" fill="#15161a"/><g stroke="#2c2f37" stroke-width="2">${[224,236,248,260,272].map(y=>`<path d="M90 ${y} L110 ${y-6}"/>`).join('')}</g><rect x="87" y="286" width="26" height="10" rx="4" fill="${rim}"/>`;
}
const racketSvg=(f,r,s,cls='rk',extra='')=>`<svg class="${cls}" viewBox="0 0 200 300" ${extra}>${racketShape(f,r,s)}</svg>`;
function court(k,o={}){
  const s=SC[k]||SC.day,g=uid(),gl=uid(),m=uid();
  const lights=s.lights?[220,600,1000,1380].map(x=>`<circle cx="${x}" cy="150" r="90" fill="url(#${gl})"/><rect x="${x-26}" y="140" width="52" height="16" rx="4" fill="#fff"/>`).join(''):'';
  const frames=Array.from({length:9},(_,i)=>`<rect x="${300+i*125}" y="300" width="5" height="300" fill="#111"/>`).join('');
  const rk=o.rk?`<g transform="translate(1180 380) rotate(-18) scale(1.5)">${racketShape('#0A0B0E','#4E97E0',0)}</g>`:'';
  const ball=o.ball?`<g transform="translate(1120 800)"><ellipse cx="8" cy="62" rx="60" ry="10" fill="#000" opacity=".3"/><circle r="52" fill="#D7F54A"/><path d="M-38-36c28 22 28 52 0 74M38-36c-28 22-28 52 0 74" stroke="#fff" stroke-width="6" fill="none"/></g>`:'';
  return `<svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.sky[0]}"/><stop offset="1" stop-color="${s.sky[1]}"/></linearGradient>
  <radialGradient id="${gl}"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <pattern id="${m}" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M0 0L9 9M9 0L0 9" stroke="#000" stroke-width="1.2" opacity=".6"/></pattern></defs>
  <rect width="1600" height="1000" fill="url(#${g})"/>${lights}
  ${o.wide?'<path d="M0 520 L220 380 L420 470 L640 330 L860 450 L1080 300 L1300 430 L1600 340 V600 H0Z" fill="#9fb4cc" opacity=".55"/>':''}
  <rect x="0" y="300" width="1600" height="300" fill="${s.wall}" opacity=".92"/>
  <rect x="300" y="300" width="1000" height="300" fill="#7fb2ff" opacity=".08"/>${frames}
  <polygon points="300,600 1300,600 1800,1000 -200,1000" fill="${s.court}"/>
  <polygon points="300,600 0,750 0,1000 -200,1000" fill="#fff" opacity=".05"/><polygon points="1300,600 1600,750 1600,1000 1800,1000" fill="#fff" opacity=".05"/>
  <g stroke="#fff" stroke-width="5" fill="none" opacity=".9"><polygon points="300,600 1300,600 1800,1000 -200,1000"/><path d="M800 600 V1000 M220 664 H1380 M60 920 H1540"/></g>
  <rect x="155" y="700" width="1290" height="64" fill="url(#${m})"/><rect x="155" y="696" width="1290" height="8" fill="#fff"/>
  ${rk}${ball}</svg>`;
}
function fillPh(root=document){$$('.ph',root).forEach(el=>{if(el.dataset.done)return;el.dataset.done=1;
  el.insertAdjacentHTML('afterbegin',el.dataset.src?`<img src="${el.dataset.src}" alt="" loading="lazy" style="object-position:${el.dataset.pos||'50% 50%'}">`:court(el.dataset.scene,{rk:el.dataset.rk,ball:el.dataset.ball,wide:el.dataset.wide}))})}

/* ---------- icons ---------- */
const I={
  bag:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  user:'<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  pin:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11Z"/></svg>',
  cam:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 8h3l2-3h6l2 3h3v11H4Z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  chev:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 15 6-6 6 6"/></svg>',
  check:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="m5 12 5 5 9-10"/></svg>',
  x:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  menu:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>'
};

/* ---------- cards ---------- */
function productCard(p){
  const b=(p.badges||[]).map(x=>x==='sale'?'<span class="bdg sale">Sale</span>':x==='new'?'<span class="bdg">New</span>':'<span class="bdg blue">Limited</span>').join('')+(p.stock?'':'<span class="bdg out">Sold out</span>');
  const img=p.photos&&p.photos.length?`<img class="pc__photo" src="${p.photos[0]}" alt="${esc(p.brand+' '+p.name)}" loading="lazy">`:racketSvg(p.face||'#15171c',p.rim||'#4E97E0',p.s??1);
  return `<a class="pc" href="product.html?id=${p.id}"><div class="pc__img"><div class="badges">${b}</div>${img}${p.stock?`<button class="qa" data-add="${p.id}" aria-label="Add ${esc(p.name)} to cart">${I.bag}</button>`:''}</div>
  <div class="pc__b"><span class="pc__brand">${p.brand}</span><h3>${p.name}</h3><div class="price">${money(p.price)}</div><div class="tags"><span>${p.shape}</span><span>${p.level}</span><span>${p.weight}</span></div></div></a>`;
}
const lImg=(l,cls='')=>l.photos&&l.photos.length?`<img src="${l.photos[0]}" alt="${esc(l.brand+' '+l.model)}" loading="lazy">`:racketSvg(l.face||'#15171c',l.rim||'#4E97E0',l.s??1,cls);
const favBtn=id=>`<button class="fav" data-fav="${esc(id)}" aria-label="Save to wishlist"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg></button>`;
/* Pre-loved listing — same card layout as New Rackets (data from the Post an Ad form) */
function listingTile(l,mine){
  const pic=l.photos&&l.photos.length?`<img class="pc__photo" src="${l.photos[0]}" alt="${esc(l.brand+' '+l.model)}" loading="lazy">`:racketSvg(l.face||'#15171c',l.rim||'#4E97E0',l.s??1);
  return `<a class="pc pc--l ${mine?'mine':''}" href="product.html?listing=${encodeURIComponent(l.id)}"><div class="pc__img"><div class="badges"><span class="bdg cond ${condClass(l.condition)}">${esc(l.condition)}</span>${mine?'<span class="bdg">Your listing</span>':''}</div>${pic}${favBtn(l.id).replace('class="fav"','class="qa fav"')}</div>
  <div class="pc__b"><span class="pc__brand">${esc(l.brand)}</span><h3>${esc(l.model)}</h3><div class="price">${money(l.price)}</div><div class="tags"><span>${esc(l.level)}</span><span>${esc(l.location||'Australia')}</span><span>${timeAgo(l.created)}</span></div></div></a>`;
}
const listingCard=listingTile;

/* =========================================================
   HEADER — logo · New Rackets · Second-Hand · Sell Your Racket · Community · user · cart
   ========================================================= */
const ANN=['Tracked shipping across Australia','Shop with confidence · 100% authentic','Sell your racket in 2 steps','PadelMarket Open · entries now open','Pay with Visa, Mastercard or PayPal','Join the community · social matches every week'];
const logo=()=>`<a href="index.html" class="logo" aria-label="PadelMarket.com.au home"><img src="assets/logo.webp" alt="PadelMarket.com.au"><span class="lt" aria-hidden="true"><span>Padel<em>Market</em></span><small>.com.au</small></span></a>`;
function header({active='',clear=false}={}){
  const u=auth.user();
  const L=[['new-rackets.html','New Rackets','new'],['second-hand.html','Second-Hand','second'],['sell-your-racket.html','Sell Your Racket','sell'],['index.html#community','Community','community']];
  const ini=u?(u.name||u.email).split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase():'';
  document.body.insertAdjacentHTML('afterbegin',`
  <div class="topbar ${clear?'clear':''}" id="topbar">
    <div class="mq announce"><div class="mq__t">${ANN.map(t=>`<span>${t}</span>`).join('').repeat(2)}</div><div class="mq__t" aria-hidden="true">${ANN.map(t=>`<span>${t}</span>`).join('').repeat(2)}</div></div>
    <header class="nav"><div class="nav__in">
      <button class="ib burger" id="burger" aria-label="Open menu">${I.menu}</button>
      ${logo()}
      <ul class="menu">${L.map(([h,t,k])=>`<li><a href="${h}" class="${k===active?'on':''}">${t}</a></li>`).join('')}</ul>
      <div class="icons">
        <div style="position:relative">
          <button class="ib" id="userBtn" aria-label="${u?'Account menu':'Log in'}">${u?`<span class="avatar">${esc(ini)}</span>`:I.user}</button>
          ${u?`<div class="umenu" id="umenu"><div class="hd"><b>${esc(u.name)}</b>${esc(u.email)}</div><a href="sell.html">Post an ad</a><a href="second-hand.html?mine=1">My listings</a><button id="logoutBtn">Log out</button></div>`:''}
        </div>
        <a href="cart.html" class="ib" id="cartBtn" aria-label="Cart">${I.bag}<span class="badge-n" id="cartN">0</span></a>
      </div>
    </div></header>
  </div>
  <div class="drawer" id="drawer"><div class="drawer__p">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">${logo()}<button class="ib" id="drawerX" aria-label="Close menu">${I.x}</button></div>
    ${L.map(([h,t])=>`<a class="m" href="${h}">${t}</a>`).join('')}
    <a class="m" href="${u?'#':'login.html?next='+encodeURIComponent(here())}" ${u?'id="logoutM"':''}>${u?'Log out':'Log in'}</a>
  </div></div>`);
  renderCart();
  // user menu
  $('#userBtn').onclick=e=>{e.stopPropagation();if(!u){location.href='login.html?next='+encodeURIComponent(here());return}$('#umenu').classList.toggle('on')};
  document.addEventListener('click',e=>{const m=$('#umenu');if(m&&!m.contains(e.target))m.classList.remove('on')});
  const out=()=>{auth.logout();toast('You have been logged out');setTimeout(()=>location.href='index.html',600)};
  if(u){$('#logoutBtn').onclick=out;$('#logoutM').onclick=e=>{e.preventDefault();out()}}
  // drawer
  const dr=$('#drawer');$('#burger').onclick=()=>dr.classList.add('on');$('#drawerX').onclick=()=>dr.classList.remove('on');dr.onclick=e=>{if(e.target===dr)dr.classList.remove('on')};
  // scroll: clear at top (home) · hide on scroll down · solid on scroll up
  const bar=$('#topbar');let last=scrollY;
  const st=()=>{const y=scrollY;
    if(y<=10){bar.classList.remove('hide');bar.classList.toggle('clear',clear)}
    else if(y>last&&y>120){bar.classList.add('hide');$('#umenu')?.classList.remove('on')}
    else if(y<last){bar.classList.remove('hide','clear')}
    last=y};
  addEventListener('scroll',st,{passive:true});st();
}

/* =========================================================
   FOOTER — bordered grid
   ========================================================= */
function footer(sel='#pmFooter',{bottom=true}={}){
  const el=$(sel);if(!el)return;
  el.outerHTML=`<footer class="final on-dark">
  <div class="fgrid">
    <div class="fc-logo">${logo()}</div>
    <div class="fc-main"><span class="glow"></span><h2>Your next rally<br><em>starts here</em></h2>
      <div class="cta-row"><a href="new-rackets.html" class="btn btn-blue">Shop new rackets</a><a href="sell-your-racket.html" class="btn btn-ghost">Sell your racket</a></div></div>
    <div class="fc-btn"><a href="${auth.user()?'index.html#community':'login.html?next=index.html%23community'}">Join</a></div>
    <div class="fc-links"><a href="new-rackets.html">New Rackets</a><a href="second-hand.html">Second-Hand</a><a href="sell-your-racket.html">Sell Your Racket</a><a href="index.html#community">Community</a><a href="contact.html">Contact us</a><a href="contact.html#faq">FAQ</a></div>
    <div class="fc-links"><a href="#">Instagram</a><a href="#">TikTok</a><a href="#">YouTube</a><a href="#">Facebook</a></div>
  </div>
  ${bottom?`<div class="fbot"><span>PadelMarket.com.au ${new Date().getFullYear()} ©</span><nav><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Shipping</a><a href="#">Returns</a></nav></div>`:''}
  </footer>`;
}

/* ---------- toast · reveal · global clicks ---------- */
let tt;
function toast(msg){let t=$('#toast');if(!t){document.body.insertAdjacentHTML('beforeend','<div class="toast" id="toast" role="status"><span style="color:var(--blue-2)">'+I.check+'</span><span></span></div>');t=$('#toast')}
  $('span:last-child',t).textContent=msg;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2400)}
function reveal(){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});$$('.rv-up:not(.in)').forEach(el=>io.observe(el))}
document.addEventListener('click',e=>{
  const add=e.target.closest('[data-add]');
  if(add){e.preventDefault();e.stopPropagation();const type=add.dataset.type||'new',id=add.dataset.add;
    const it=type==='listing'?getListing(id):getProduct(id),name=it?(type==='listing'?it.brand+' '+it.model:it.brand+' '+it.name):'Item';
    const ok=cart.add(id,type);toast(ok?`${name} added to cart`:(type==='listing'?`${name} is already in your cart`:`You can add up to ${MAX_QTY} of each racket`));
    if(add.dataset.after==='cart'&&ok)setTimeout(()=>location.href='cart.html',500);return}
  const fav=e.target.closest('[data-fav]');
  if(fav){e.preventDefault();e.stopPropagation();fav.classList.toggle('on');toast(fav.classList.contains('on')?'Saved to your wishlist':'Removed from your wishlist');return}
  if(e.target.closest('a[href="#"]'))e.preventDefault();
});

window.PM={store,auth,money,timeAgo,esc,uid,NEW,BRANDS,CONDITIONS,LEVELS,listings,addListing,getProduct,getListing,condClass,cart,SHIPPING,money2,payIcons,racketShape,racketSvg,court,fillPh,productCard,listingCard,listingTile,header,footer,toast,reveal,I,logo};
})();
