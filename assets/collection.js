/* =========================================================
   Collection engine — filters · price range · sort · columns · pagination
   Used by new-rackets.html and second-hand.html
   ========================================================= */
PM.collection=function(cfg){
  const {items,groups,priceOf,sorts,card,perPage=9,leadTile,noun='items',priceAt=1}=cfg;
  const I=PM.I, side=$('#side'), grid=$('#grid');
  const qs=new URLSearchParams(location.search);
  const maxP=Math.max(10,Math.ceil(Math.max(0,...items.map(priceOf))/10)*10);
  const st={sel:{},min:0,max:maxP,sort:qs.get('sort')&&sorts[qs.get('sort')]?qs.get('sort'):Object.keys(sorts)[0],page:1,cols:3};
  groups.forEach(g=>st.sel[g.key]=new Set(qs.getAll(g.key)));
  try{st.cols=+localStorage.getItem('pm_cols')||3}catch(e){}

  /* ----- sidebar ----- */
  const optsOf=g=>g.options||[...new Set(items.map(g.get))].filter(Boolean).sort();
  const cnt=(g,o)=>items.filter(it=>g.get(it)===o).length;
  const grpHtml=g=>`<div class="fg" data-g="${g.key}"><button type="button" aria-expanded="true">${g.label}${I.chev}</button><div class="fg__body"><div><div class="fg__in">
    ${optsOf(g).map(o=>`<label class="ck"><input type="checkbox" value="${PM.esc(o)}" ${st.sel[g.key].has(o)?'checked':''}><span>${PM.esc(o)}</span><small>(${cnt(g,o)})</small></label>`).join('')}</div></div></div></div>`;
  const priceHtml=`<div class="fg" data-g="price"><button type="button" aria-expanded="true">Price${I.chev}</button><div class="fg__body"><div><div class="fg__in">
    <span style="font-size:13px;color:var(--ink-2)">The highest price is ${PM.money(maxP)}</span>
    <div class="range"><div class="trk"><i id="trk"></i></div><input type="range" id="rMin" min="0" max="${maxP}" step="10" value="0" aria-label="Minimum price"><input type="range" id="rMax" min="0" max="${maxP}" step="10" value="${maxP}" aria-label="Maximum price"></div>
    <div class="pr-in"><label>$<input id="nMin" type="number" min="0" max="${maxP}" value="0" aria-label="Minimum price"></label>to<label>$<input id="nMax" type="number" min="0" max="${maxP}" value="${maxP}" aria-label="Maximum price"></label></div>
  </div></div></div></div>`;
  const parts=groups.map(grpHtml);parts.splice(priceAt,0,priceHtml);
  side.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><h2>Filter and sort</h2><button class="ib filter-btn" id="sideX" aria-label="Close filters">${I.x}</button></div>${parts.join('')}<button class="clear" id="clearAll" type="button">Clear all</button>`;

  $$('.fg>button',side).forEach(b=>b.onclick=()=>{const g=b.parentElement;g.classList.toggle('closed');b.setAttribute('aria-expanded',!g.classList.contains('closed'))});
  side.addEventListener('change',e=>{const fg=e.target.closest('.fg');if(!fg||fg.dataset.g==='price')return;
    const set=st.sel[fg.dataset.g];e.target.checked?set.add(e.target.value):set.delete(e.target.value);st.page=1;apply()});
  const rMin=$('#rMin'),rMax=$('#rMax'),nMin=$('#nMin'),nMax=$('#nMax'),trk=$('#trk');
  function setPrice(a,b,from){a=Math.max(0,Math.min(+a||0,maxP));b=Math.max(0,Math.min(+b||0,maxP));if(a>b){from==='min'?b=a:a=b}
    st.min=a;st.max=b;rMin.value=nMin.value=a;rMax.value=nMax.value=b;trk.style.left=a/maxP*100+'%';trk.style.right=100-b/maxP*100+'%'}
  let pt;const priceChanged=from=>{clearTimeout(pt);pt=setTimeout(()=>{st.page=1;apply()},150)};
  rMin.oninput=()=>{setPrice(rMin.value,rMax.value,'min');priceChanged()};rMax.oninput=()=>{setPrice(rMin.value,rMax.value,'max');priceChanged()};
  nMin.onchange=()=>{setPrice(nMin.value,nMax.value,'min');priceChanged()};nMax.onchange=()=>{setPrice(nMin.value,nMax.value,'max');priceChanged()};
  setPrice(0,maxP);
  $('#clearAll').onclick=()=>{groups.forEach(g=>st.sel[g.key].clear());$$('input[type=checkbox]',side).forEach(c=>c.checked=false);setPrice(0,maxP);st.page=1;apply()};

  /* ----- mobile drawer ----- */
  const openF=$('#openFilters');if(openF)openF.onclick=()=>side.classList.add('on');
  $('#sideX').onclick=()=>side.classList.remove('on');
  document.addEventListener('click',e=>{if(side.classList.contains('on')&&!side.contains(e.target)&&!e.target.closest('#openFilters'))side.classList.remove('on')});

  /* ----- toolbar ----- */
  const sortSel=$('#sort');sortSel.innerHTML=Object.entries(sorts).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('');sortSel.value=st.sort;
  sortSel.onchange=()=>{st.sort=sortSel.value;st.page=1;apply()};
  const colsEl=$('#cols');
  if(colsEl){colsEl.innerHTML=[2,3,4].map(n=>`<button type="button" data-c="${n}" aria-label="${n} columns"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">${Array.from({length:n},(_,i)=>`<rect x="${i*(16/n)+.5}" y="1" width="${16/n-1.5}" height="14" rx="1"/>`).join('')}</svg></button>`).join('');
    colsEl.onclick=e=>{const b=e.target.closest('button');if(!b)return;st.cols=+b.dataset.c;try{localStorage.setItem('pm_cols',st.cols)}catch(x){}setCols()}}
  function setCols(){if(cfg.fixedCols){grid.style.setProperty('--cols',cfg.fixedCols);return}grid.style.setProperty('--cols',st.cols);$$('#cols button').forEach(b=>b.classList.toggle('on',+b.dataset.c===st.cols))}
  setCols();

  /* ----- apply ----- */
  function filtered(){
    let r=items.filter(it=>groups.every(g=>!st.sel[g.key].size||st.sel[g.key].has(g.get(it))));
    r=r.filter(it=>{const p=priceOf(it);return p>=st.min&&p<=st.max});
    return r.sort(sorts[st.sort].fn);
  }
  function apply(){
    const r=filtered(),pages=Math.max(1,Math.ceil(r.length/perPage));st.page=Math.min(st.page,pages);
    const from=(st.page-1)*perPage,slice=r.slice(from,from+perPage);
    $('#count').textContent=r.length?`Showing ${from+1} to ${from+slice.length} of ${r.length} ${noun}`:`0 ${noun}`;
    const lead=leadTile&&st.page===1?leadTile():'';
    grid.innerHTML=lead+(slice.length?slice.map(card).join(''):`<div class="empty"><h3 style="font-size:22px;margin-bottom:6px">No ${noun} match those filters</h3><p>Try removing a filter or widening the price range.</p><button class="btn btn-dark btn-sm" style="margin-top:16px" onclick="document.getElementById('clearAll').click()">Clear all filters</button></div>`);
    // active chips
    const chips=[];groups.forEach(g=>st.sel[g.key].forEach(v=>chips.push([g.key,v,`${g.label}: ${v}`])));
    if(st.min>0||st.max<maxP)chips.push(['price','',`${PM.money(st.min)} to ${PM.money(st.max)}`]);
    $('#chips').innerHTML=chips.map(([k,v,t])=>`<button type="button" data-k="${k}" data-v="${PM.esc(v)}">${PM.esc(t)} ${I.x.replace('width="18" height="18"','width="12" height="12"')}</button>`).join('');
    // pager
    $('#pager').innerHTML=pages>1?Array.from({length:pages},(_,i)=>`<button type="button" class="${i+1===st.page?'on':''}" data-p="${i+1}">${i+1}</button>`).join('')+(st.page<pages?`<button type="button" data-p="${st.page+1}" aria-label="Next page">›</button>`:''):'';
    // sync URL (shareable filters)
    const u=new URLSearchParams();groups.forEach(g=>st.sel[g.key].forEach(v=>u.append(g.key,v)));if(st.sort!==Object.keys(sorts)[0])u.set('sort',st.sort);
    if(qs.get('mine'))u.set('mine',qs.get('mine'));
    try{history.replaceState(null,'',location.pathname+(u.toString()?'?'+u:''))}catch(e){}
  }
  $('#chips').onclick=e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.k==='price')setPrice(0,maxP);else{st.sel[b.dataset.k].delete(b.dataset.v);const c=$(`.fg[data-g="${b.dataset.k}"] input[value="${CSS.escape(b.dataset.v)}"]`,side);if(c)c.checked=false}
    st.page=1;apply()};
  $('#pager').onclick=e=>{const b=e.target.closest('button');if(!b)return;st.page=+b.dataset.p;apply();window.scrollTo({top:grid.getBoundingClientRect().top+scrollY-170,behavior:'smooth'})};

  apply();
  return {select(key,val){groups.forEach(g=>st.sel[g.key].clear());$$('input[type=checkbox]',side).forEach(c=>c.checked=false);st.sel[key].add(val);const c=$(`.fg[data-g="${key}"] input[value="${CSS.escape(val)}"]`,side);if(c)c.checked=true;st.page=1;apply();window.scrollTo({top:grid.getBoundingClientRect().top+scrollY-200,behavior:'smooth'})}};
};
