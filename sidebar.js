/* ══════════════════════════════════════════════════════
   SIDEBAR.JS — Station list rendering, filters, selection
   Depends on: map.js (plotStations), utils.js (showToast)
══════════════════════════════════════════════════════ */

let currentFilter = 'all';

/* ── Render station cards ── */
function renderSidebar(list){
  const container=document.getElementById('stationList');
  if(!list.length){
    container.innerHTML='<div style="padding:30px 14px;text-align:center;color:var(--muted);font-size:11px">No stations found nearby</div>';
    return;
  }
  container.innerHTML='';
  list.forEach((s,idx)=>{
    const dots=Array.from({length:Math.min(s.plugs,12)},(_,i)=>`<div class="plug-dot ${i<s.avail?'avail':'inuse'}"></div>`).join('');
    const distStr=s.dist!=null?`<span class="dist-badge">📏 ${s.dist.toFixed(1)} km</span>`:'';
    const sourceStr=s.isReal?'<span class="source-label source-real">Live</span>':'<span class="source-label source-demo">Demo</span>';
    const card=document.createElement('div');
    card.className='station-card';card.dataset.sid=String(s.id);card.style.animationDelay=0.03*idx+'s';
    card.onclick=()=>{selectStation(s);leafletMap.setView([s.lat,s.lon],15);const m=mapMarkers[list.indexOf(s)];if(m)m.openPopup();};
    card.innerHTML=`
      <div class="station-top">
        <div><div class="station-name">${s.name}</div><div class="station-addr">${s.city}${s.city?' · ':''}${s.addr}</div></div>
        <div class="station-badges"><span class="status-badge ${s.status}">${s.status}</span>${sourceStr}</div>
      </div>
      <div class="station-meta">
        <span>⚡ ${s.kw} kW</span><span>🔌 ${s.avail}/${s.plugs} free</span><span>⭐ ${s.rating}</span>${distStr}
        <span>${(s.type||[]).join(' · ')}</span>${s.operator?`<span>🏢 ${s.operator}</span>`:''}
      </div>
      <div class="plug-dots">${dots}</div>`;
    container.appendChild(card);
  });
}

/* ── Select a station ── */
function selectStation(s){
  selectedStation=s;
  document.querySelectorAll('.station-card').forEach(c=>c.classList.toggle('selected',c.dataset.sid===String(s.id)));
}

/* ── Filter + search ── */
function applyFilters(q=''){
  let list=stations.filter(s=>{
    const mq=!q||s.name.toLowerCase().includes(q.toLowerCase())||s.addr.toLowerCase().includes(q.toLowerCase())||(s.city||'').toLowerCase().includes(q.toLowerCase());
    const mf=currentFilter==='all'||(currentFilter==='available'&&s.status==='available')||(currentFilter==='fast'&&s.fast)||(currentFilter==='real'&&s.isReal);
    return mq&&mf;
  });
  renderSidebar(list);plotStations(list,false);updateStats(list);updateResultCount(list);
}

function setFilter(f,btn){
  currentFilter=f;
  document.querySelectorAll('.filter-chip').forEach(c=>c.classList.remove('active'));
  btn.classList.add('active');
  applyFilters(document.getElementById('nameFilterInput').value||'');
}

/* ── Result count bar ── */
function updateResultCount(list){
  list=list||stations;
  const bar=document.getElementById('resultCountBar');
  const text=document.getElementById('resultCountText');
  const real=document.getElementById('resultRealCount');
  if(!list.length){bar.style.display='none';return;}
  bar.style.display='flex';
  text.textContent=`${list.length} station${list.length>1?'s':''} shown`;
  const rc=list.filter(s=>s.isReal).length;
  real.textContent=rc>0?`🔵 ${rc} live`:'';
}

/* ── Stats (stub — extend as needed) ── */
function updateStats(list){}