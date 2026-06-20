/* ══════════════════════════════════════════════════════
   APP.JS — Global state, live simulation, boot sequence
   Load order in HTML:
     1. utils.js
     2. data.js
     3. auth.js
     4. map.js
     5. sidebar.js
     6. booking.js
     7. navigation.js
     8. app.js   ← this file, last
══════════════════════════════════════════════════════ */

/* ── Shared app state ── */
let stations        = [];
let selectedStation = null;

/* ══ LIVE AVAILABILITY SIMULATION ══
   Every 5 s, randomly nudge available plug counts
   on demo stations and refresh the UI.              */
setInterval(()=>{
  if(!stations.length)return;
  stations.forEach(s=>{
    if(!s.isReal&&Math.random()>.88){
      const delta=Math.random()>.5?1:-1;
      s.avail=Math.max(0,Math.min(s.plugs,s.avail+delta));
      s.status=s.avail===0?'full':s.avail<s.plugs/2?'busy':'available';
    }
  });
  applyFilters(document.getElementById('nameFilterInput').value||'');
  updateStats();
  mapMarkers.forEach((m,i)=>{const s=stations[i];if(s)m.setIcon(makeMarkerIcon(s.status,s.isReal));});
},5000);

/* ══ BOOT ══ */
window.addEventListener('load',()=>{
  seedDemo();   // ensure demo account exists
  initMap();    // set up Leaflet
  loadMMR();    // populate with demo stations

  // Restore session
  const sess=getSession();
  if(sess&&sess.email){
    const user=resolveUser(sess.email);
    if(user){currentUser={...user};}
  }

  renderHeaderAuth();
  updateBookingsBadge();

  if(!currentUser){
    setTimeout(()=>openAuthModal('login'),600);
    showToast('Sign in to reserve EV charging slots','info',4000);
  } else {
    showToast(`Welcome back, ${currentUser.name.split(' ')[0]}! ⚡`,'success',3000);
  }
});