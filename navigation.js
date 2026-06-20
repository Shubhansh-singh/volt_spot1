/* ══════════════════════════════════════════════════════
   NAVIGATION.JS — Turn-by-turn routing via OSRM,
                   nav panel controls, and format utils
   Depends on: map.js (leafletMap, setUserMarker),
               utils.js (showToast)
══════════════════════════════════════════════════════ */

let navLayers  = [];
let navActive  = false;
let pendingNav = null;

/* ── Navigate to last booked station (from confirmation screen) ── */
function navigateToLastBooked(){
  if(!lastBookedStation){showToast('No station to navigate to.','warn');return;}
  startNavigation(lastBookedStation.lat,lastBookedStation.lon,lastBookedStation.name);
}

/* ── Navigate from a bookings list entry by index ── */
function startNavigationByBooking(i){
  const key='voltspot_bookings_'+currentUser.email;
  const bookings=JSON.parse(localStorage.getItem(key)||'[]');
  const b=bookings[i];if(!b)return;
  const station=stations.find(s=>s.name===b.station)||MMR_STATIONS.find(s=>s.name===b.station);
  if(!station){showToast('Station coordinates not found.','warn');return;}
  startNavigation(station.lat,station.lon,b.station);
}

/* ── Main navigation function (OSRM routing) ── */
async function startNavigation(destLat,destLon,stationName){
  if(!navigator.geolocation){showToast('Geolocation not supported.','error');return;}
  showToast('Getting your location...','info',3500);
  navigator.geolocation.getCurrentPosition(async(pos)=>{
    const fromLat=pos.coords.latitude,fromLon=pos.coords.longitude;
    userLat=fromLat;userLon=fromLon;
    setUserMarker(fromLat,fromLon,pos.coords.accuracy);
    showToast('Calculating route...','info',3000);
    try{
      const url='https://router.project-osrm.org/route/v1/driving/'
        +fromLon+','+fromLat+';'+destLon+','+destLat
        +'?steps=true&geometries=geojson&overview=full';
      const res=await fetch(url);
      if(!res.ok)throw new Error('OSRM '+res.status);
      const data=await res.json();
      if(!data.routes||!data.routes.length){showToast('No route found to this station.','error');return;}
      clearNavLayers();
      const route=data.routes[0];
      const coords=route.geometry.coordinates.map(c=>[c[1],c[0]]);
      const shadow=L.polyline(coords,{color:'#000000',weight:9,opacity:0.2}).addTo(leafletMap);
      const line=L.polyline(coords,{color:'#00ff88',weight:5,opacity:0.95}).addTo(leafletMap);
      navLayers.push(shadow,line);
      const destIcon=L.divIcon({
        html:'<div style="width:20px;height:20px;border-radius:50%;background:#00ff88;border:3px solid #fff;box-shadow:0 0 16px #00ff8899"></div>',
        iconSize:[20,20],iconAnchor:[10,10],className:''
      });
      const destMarker=L.marker([destLat,destLon],{icon:destIcon}).addTo(leafletMap).bindPopup('<div class="pop-name">'+stationName+'</div>');
      navLayers.push(destMarker);
      leafletMap.fitBounds(L.latLngBounds(coords),{padding:[70,70]});
      const steps=route.legs.flatMap(leg=>leg.steps);
      document.getElementById('navDist').textContent=fmtDist(route.distance);
      document.getElementById('navTime').textContent=fmtDuration(route.duration);
      document.getElementById('navETA').textContent=fmtETA(route.duration);
      document.getElementById('navDestName').textContent=stationName;
      const html=steps.map((step,idx)=>{
        const icon=maneuverIcon(step.maneuver.type,step.maneuver.modifier||'');
        const label=step.name||(step.maneuver.type==='arrive'?'Destination':'Continue');
        const dist=step.distance>5?'<div class="nav-step-dist">'+fmtDist(step.distance)+'</div>':'';
        return '<div class="nav-step'+(idx===0?' active-step':'')+'"><div class="nav-step-icon">'+icon+'</div><div>'+label+'</div>'+dist+'</div>';
      }).join('');
      document.getElementById('navSteps').innerHTML=html;
      document.getElementById('navPanel').classList.add('active');
      navActive=true;
      showToast('🧭 '+fmtDist(route.distance)+' · '+fmtDuration(route.duration)+' to '+stationName,'success',5000);
    }catch(e){
      console.error('Nav error:',e);
      showToast('Routing failed. Check connection and try again.','error',4000);
    }
  },(err)=>{
    const msgs={1:'Location permission denied.',2:'Position unavailable.',3:'Timed out.'};
    showToast(msgs[err.code]||'Location error.','error',5000);
  },{enableHighAccuracy:true,timeout:12000,maximumAge:0});
}

/* ── Stop navigation ── */
function stopNavigation(){
  clearNavLayers();
  document.getElementById('navPanel').classList.remove('active');
  document.getElementById('navSteps').innerHTML='';
  navActive=false;
  showToast('Navigation stopped.','info',2000);
}

/* ── Remove nav route layers from map ── */
function clearNavLayers(){
  navLayers.forEach(l=>{try{leafletMap.removeLayer(l);}catch(e){}});
  navLayers=[];
}

/* ── Maneuver icon mapper ── */
function maneuverIcon(type,mod){
  if(type==='depart')return '🚦';
  if(type==='arrive')return '🏁';
  if(type==='roundabout'||type==='rotary')return '🔄';
  if(mod==='left'||mod==='sharp left')return '↰';
  if(mod==='right'||mod==='sharp right')return '↱';
  if(mod==='slight left')return '↖';
  if(mod==='slight right')return '↗';
  if(mod==='uturn')return '↩';
  return '↑';
}

/* ── Format helpers ── */
function fmtDist(m){return m>=1000?(m/1000).toFixed(1)+' km':Math.round(m)+' m';}
function fmtDuration(s){const h=Math.floor(s/3600),m=Math.floor((s%3600)/60);return h>0?h+'h '+m+'m':m+' min';}
function fmtETA(s){const d=new Date(Date.now()+s*1000);return d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');}