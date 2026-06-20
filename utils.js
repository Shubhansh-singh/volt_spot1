/* ══════════════════════════════════════════════════════
   UTILS.JS — Toast notifications, loader, misc helpers
   Depends on: (none)
══════════════════════════════════════════════════════ */

/* ── Toast notifications ── */
function showToast(msg, type='info', duration=3500){
  const icons={success:'✅',warn:'⚠️',error:'❌',info:'🔵'};
  const tc=document.getElementById('toastContainer');
  const t=document.createElement('div');
  t.className=`toast ${type}`;
  t.innerHTML=`<span class="toast-icon">${icons[type]||'ℹ️'}</span><span class="toast-text">${msg}</span>`;
  tc.appendChild(t);
  setTimeout(()=>{t.classList.add('toast-out');setTimeout(()=>t.remove(),300);},duration);
}

/* ── Map loader overlay ── */
function showLoader(on){
  document.getElementById('mapLoader').style.display=on?'flex':'none';
}

/* ── View switcher stub (extend if multi-view layout is used) ── */
function showView(v){}