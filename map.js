/* ══════════════════════════════════════════════════════
   MAP.JS — Leaflet map, markers, geolocation, geocoding,
            Overpass API station fetching
   Depends on: data.js, sidebar.js, utils.js
══════════════════════════════════════════════════════ */

let leafletMap = null;
let mapMarkers  = [];
let userMarker  = null;
let accuracyCircle = null;
let userLat = null, userLon = null;

/* ── Map initialisation ── */
function initMap(){
  leafletMap=L.map('map',{zoomControl:false}).setView([19.076,72.877],11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',maxZoom:19
  }).addTo(leafletMap);
  L.control.zoom({position:'bottomright'}).addTo(leafletMap);
}

/* ── Marker icons ── */
function makeMarkerIcon(status,isReal=false){
  const cols={available:'#00ff88',busy:'#ffb300',full:'#ff4444'};
  const col=cols[status]||'#00ff88';
  const glow=status==='available'?`box-shadow:0 0 10px ${col}88`:'';
  const ring=isReal?`border:2px solid #4af;outline:2px solid rgba(68,170,255,.3);outline-offset:2px;`:`border:2px solid rgba(255,255,255,.7);`;
  return L.divIcon({html:`<div style="width:14px;height:14px;border-radius:50%;background:${col};${ring}${glow}"></div>`,iconSize:[14,14],iconAnchor:[7,7],className:''});
}

function makeUserIcon(){
  return L.divIcon({html:`<div style="width:16px;height:16px;border-radius:50%;background:#44aaff;border:2px solid #fff;box-shadow:0 0 14px #44aaffaa,0 0 28px #44aaff44"></div>`,iconSize:[16,16],iconAnchor:[8,8],className:''});
}

function clearMapMarkers(){mapMarkers.forEach(m=>leafletMap.removeLayer(m));mapMarkers=[];}

/* ── Plot stations on map ── */
function plotStations(list,fitBounds){
  clearMapMarkers();
  list.forEach(s=>{
    const marker=L.marker([s.lat,s.lon],{icon:makeMarkerIcon(s.status,s.isReal)})
      .addTo(leafletMap).bindPopup(buildPopup(s),{maxWidth:260,className:'vs-popup'});
    marker.on('click',()=>{
      selectStation(s);
      document.querySelectorAll('.station-card').forEach(c=>c.classList.toggle('selected',c.dataset.sid===String(s.id)));
    });
    mapMarkers.push(marker);
  });
  if(fitBounds&&list.length>0){
    const bounds=L.latLngBounds(list.map(s=>[s.lat,s.lon]));
    leafletMap.fitBounds(bounds,{padding:[48,48]});
  }
}

/* ── Popup HTML builder ── */
function buildPopup(s){
  const statusLabel=s.status==='available'?'Available':s.status==='busy'?'Busy':'Full';
  const sourceTag=s.isReal?'<span class="pop-source">LIVE</span>':'';
  const distStr=(userLat&&userLon)?`📏 ${haversine(userLat,userLon,s.lat,s.lon).toFixed(1)} km · `:'';
  const btn=currentUser
    ?`<button class="pop-btn" onclick="openModal(null,false,'${s.id}')">Reserve Slot</button>`
    :`<button class="pop-btn-locked" onclick="openAuthModal('login')">🔐 Sign in to Reserve</button>`;
  return `
    <div class="pop-name">${s.name}${sourceTag}</div>
    <div class="pop-addr">${s.city} · ${s.addr}</div>
    <span class="pop-status ${s.status}">${statusLabel}</span>
    <div class="pop-meta">
      <span>⚡ ${s.kw} kW</span><span>🔌 ${s.avail}/${s.plugs} free</span>
      <span>${distStr}⭐ ${s.rating}</span>
    </div>${btn}`;
}

/* ── User location marker ── */
function setUserMarker(lat,lon,acc){
  if(userMarker)leafletMap.removeLayer(userMarker);
  if(accuracyCircle)leafletMap.removeLayer(accuracyCircle);
  userMarker=L.marker([lat,lon],{icon:makeUserIcon()}).addTo(leafletMap).bindPopup('<div class="pop-name">📍 You are here</div>');
  if(acc&&acc<5000){
    accuracyCircle=L.circle([lat,lon],{radius:acc,color:'#44aaff',weight:1,opacity:.5,fillColor:'#44aaff',fillOpacity:.04}).addTo(leafletMap);
  }
}

/* ── Haversine distance (km) ── */
function haversine(a,b,c,d){
  const R=6371,r=Math.PI/180,dL=(c-a)*r,dn=(d-b)*r;
  const x=Math.sin(dL/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin(dn/2)**2;
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}

/* ── GPS "Use My Location" ── */
async function useMyLocation(){
  if(!navigator.geolocation){showToast('Geolocation not supported.','error');return;}
  const locBtn=document.getElementById('locateBtn');
  const mapBtn=document.getElementById('mapLocateBtn');
  locBtn.classList.add('locating');
  locBtn.querySelector('span').textContent='🔍 Locating…';
  if(mapBtn)mapBtn.classList.add('locating');
  showToast('Requesting your location…','info',4000);
  showLoader(true);

  navigator.geolocation.getCurrentPosition(
    async(pos)=>{
      const lat=pos.coords.latitude,lon=pos.coords.longitude,acc=pos.coords.accuracy;
      userLat=lat;userLon=lon;
      leafletMap.setView([lat,lon],14);
      setUserMarker(lat,lon,acc);
      locBtn.classList.remove('locating');
      locBtn.querySelector('span').textContent='✅ Location found';
      setTimeout(()=>{locBtn.querySelector('span').textContent='📍 Use My Location';},3000);
      if(mapBtn)mapBtn.classList.remove('locating');
      showToast(`Location found (±${Math.round(acc)}m). Fetching stations…`,'success',3000);
      try{
        const rg=await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const rj=await rg.json();
        document.getElementById('locationInput').value=rj.address?.suburb||rj.address?.city_district||rj.address?.city||'Your Area';
      }catch(e){}
      await fetchNearbyStations(lat,lon,true);
    },
    (err)=>{
      showLoader(false);
      locBtn.classList.remove('locating');
      locBtn.querySelector('span').textContent='📍 Use My Location';
      if(mapBtn)mapBtn.classList.remove('locating');
      const msgs={1:'Location permission denied.',2:'Position unavailable.',3:'Request timed out.'};
      showToast(msgs[err.code]||'Location error.','error',5000);
    },
    {enableHighAccuracy:true,timeout:12000,maximumAge:0}
  );
}

/* ── Known city lookup table ── */
const KNOWN_CITIES = {
  'thane':{lat:19.2183,lon:72.9781,zoom:13,label:'Thane, Maharashtra'},
  'thane city':{lat:19.2183,lon:72.9781,zoom:13,label:'Thane, Maharashtra'},
  'mumbai':{lat:19.0760,lon:72.8777,zoom:12,label:'Mumbai, Maharashtra'},
  'navi mumbai':{lat:19.0330,lon:73.0297,zoom:12,label:'Navi Mumbai, Maharashtra'},
  'kalyan':{lat:19.2437,lon:73.1355,zoom:13,label:'Kalyan, Maharashtra'},
  'dombivli':{lat:19.2153,lon:73.0867,zoom:13,label:'Dombivli, Maharashtra'},
  'andheri':{lat:19.1197,lon:72.8468,zoom:14,label:'Andheri, Mumbai'},
  'bandra':{lat:19.0596,lon:72.8295,zoom:14,label:'Bandra, Mumbai'},
  'borivali':{lat:19.2307,lon:72.8567,zoom:14,label:'Borivali, Mumbai'},
  'malad':{lat:19.1872,lon:72.8484,zoom:14,label:'Malad, Mumbai'},
  'powai':{lat:19.1175,lon:72.9063,zoom:14,label:'Powai, Mumbai'},
  'ghatkopar':{lat:19.0867,lon:72.9085,zoom:14,label:'Ghatkopar, Mumbai'},
  'kurla':{lat:19.0726,lon:72.8852,zoom:14,label:'Kurla, Mumbai'},
  'vashi':{lat:19.0771,lon:73.0085,zoom:13,label:'Vashi, Navi Mumbai'},
  'belapur':{lat:19.0222,lon:73.0347,zoom:13,label:'CBD Belapur, Navi Mumbai'},
  'panvel':{lat:18.9894,lon:73.1175,zoom:13,label:'Panvel, Maharashtra'},
  'badlapur':{lat:19.1646,lon:73.2611,zoom:13,label:'Badlapur, Maharashtra'},
  'ambernath':{lat:19.1981,lon:73.1940,zoom:13,label:'Ambernath, Maharashtra'},
  'ulhasnagar':{lat:19.2201,lon:73.1535,zoom:13,label:'Ulhasnagar, Maharashtra'},
  'bhiwandi':{lat:19.2969,lon:73.0540,zoom:13,label:'Bhiwandi, Maharashtra'},
  'mira road':{lat:19.2869,lon:72.8709,zoom:13,label:'Mira Road, Maharashtra'},
  'vasai':{lat:19.3621,lon:72.8374,zoom:13,label:'Vasai, Maharashtra'},
  'virar':{lat:19.4649,lon:72.8063,zoom:13,label:'Virar, Maharashtra'},
  'karjat':{lat:18.9136,lon:73.3192,zoom:13,label:'Karjat, Maharashtra'},
  'kharghar':{lat:19.0477,lon:73.0710,zoom:13,label:'Kharghar, Navi Mumbai'},
  'nerul':{lat:19.0335,lon:73.0158,zoom:13,label:'Nerul, Navi Mumbai'},
  'airoli':{lat:19.1552,lon:72.9990,zoom:13,label:'Airoli, Navi Mumbai'},
  'colaba':{lat:18.9067,lon:72.8147,zoom:14,label:'Colaba, Mumbai'},
  'worli':{lat:19.0048,lon:72.8178,zoom:14,label:'Worli, Mumbai'},
  'juhu':{lat:19.1001,lon:72.8271,zoom:14,label:'Juhu, Mumbai'},
  'goregaon':{lat:19.1663,lon:72.8526,zoom:14,label:'Goregaon, Mumbai'},
  'mulund':{lat:19.1726,lon:72.9562,zoom:14,label:'Mulund, Mumbai'},
  'vikhroli':{lat:19.1091,lon:72.9271,zoom:14,label:'Vikhroli, Mumbai'},
  'shahapur':{lat:19.4565,lon:73.3301,zoom:13,label:'Shahapur, Maharashtra'},
  'pen':{lat:18.7427,lon:73.0947,zoom:13,label:'Pen, Maharashtra'},
  'uran':{lat:18.8857,lon:72.9436,zoom:13,label:'Uran, Maharashtra'},
};

/* ── Geocode search ── */
async function doSearch(){
  const q=document.getElementById('locationInput').value.trim();
  if(!q)return;
  const key=q.toLowerCase().trim();
  showLoader(true);

  if(KNOWN_CITIES[key]){
    const c=KNOWN_CITIES[key];
    userLat=c.lat;userLon=c.lon;
    leafletMap.setView([c.lat,c.lon],c.zoom);
    setUserMarker(c.lat,c.lon,null);
    showToast('Found: '+c.label,'success',3000);
    await fetchNearbyStations(c.lat,c.lon,false);
    return;
  }

  showToast('Searching for "'+q+'"...','info',3000);
  try{
    const structUrl='https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1'
      +'&city='+encodeURIComponent(q)
      +'&state=Maharashtra&country=India&countrycodes=in';
    let res=await fetch(structUrl);
    let data=await res.json();

    const filtered=data.filter(d=>{
      const addr=d.address||{};
      const cityName=(addr.city||addr.town||addr.suburb||'').toLowerCase();
      return cityName.includes(key)||key.includes(cityName.split(' ')[0]);
    });
    if(filtered.length) data=filtered;

    if(!data.length){
      const freeUrl='https://nominatim.openstreetmap.org/search?format=json&limit=10&addressdetails=1'
        +'&q='+encodeURIComponent(q+', Maharashtra, India')+'&countrycodes=in';
      res=await fetch(freeUrl);
      data=await res.json();
    }

    if(!data.length){showToast('Location not found. Try a pincode or full city name.','warn');showLoader(false);return;}

    function score(d){
      const cls=d.class||'',typ=d.type||'',rank=+(d.place_rank||99);
      if(cls==='place'&&typ==='city')return 0;
      if(cls==='place'&&(typ==='town'||typ==='municipality'))return 1;
      if(cls==='place'&&typ==='suburb')return 2;
      if(rank<=16)return 3;
      if(cls==='boundary'&&typ==='administrative')return 10;
      return 99;
    }
    const best=[...data].sort((a,b)=>score(a)-score(b))[0];
    const lat=+best.lat,lon=+best.lon;
    userLat=lat;userLon=lon;
    const zoom=score(best)<=1?14:score(best)<=3?13:12;
    leafletMap.setView([lat,lon],zoom);
    setUserMarker(lat,lon,null);
    const label=best.display_name.split(',').slice(0,3).join(',');
    showToast('Found: '+label,'success',3500);
    await fetchNearbyStations(lat,lon,false);
  }catch(e){showToast('Network error. Showing demo stations.','warn');loadMMR();}
}

/* ── Overpass API ── */
async function fetchOverpass(lat,lon,radiusM){
  const query=`[out:json][timeout:20];(node["amenity"="charging_station"](around:${radiusM},${lat},${lon});way["amenity"="charging_station"](around:${radiusM},${lat},${lon}););out center;`;
  const res=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'data='+encodeURIComponent(query)});
  if(!res.ok)throw new Error('Overpass '+res.status);
  return res.json();
}

function parseOverpassElement(e){
  const tags=e.tags||{};
  const elat=e.lat??e.center?.lat??null;
  const elon=e.lon??e.center?.lon??null;
  if(!elat||!elon)return null;
  const capacity=+(tags.capacity||0)||(Math.floor(Math.random()*3)+2);
  const avail=Math.min(capacity,Math.max(1,Math.floor(Math.random()*capacity)));
  const kw=+(tags['socket:type2:output']||tags['socket:ccs:output']||0)||(tags.motorcar==='yes'?50:22);
  const types=[];
  if(tags['socket:type2'])types.push('Type 2');
  if(tags['socket:ccs'])types.push('CCS');
  if(tags['socket:chademo'])types.push('CHAdeMO');
  if(!types.length)types.push('Type 2');
  return{id:'real_'+e.id,name:tags.name||`EV Charger #${String(e.id).slice(-4)}`,
    city:tags['addr:city']||tags['addr:suburb']||'',
    addr:tags['addr:street']||(tags['addr:city']||'See map'),
    lat:elat,lon:elon,plugs:capacity,avail,kw,price:18,type:types,fast:kw>=50,
    rating:(4.0+Math.random()*.9).toFixed(1),isReal:true,operator:tags.operator||null};
}

/* ── Fetch & merge nearby stations ── */
async function fetchNearbyStations(lat,lon,fromGPS=false){
  showLoader(true);
  let apiStations=[];
  for(const radius of[5000,15000]){
    try{
      const data=await fetchOverpass(lat,lon,radius);
      const seen=new Set();
      apiStations=(data.elements||[]).map(e=>parseOverpassElement(e)).filter(s=>{
        if(!s||seen.has(s.id))return false;seen.add(s.id);return true;
      }).map(s=>({...s,status:s.avail===0?'full':s.avail<s.plugs/2?'busy':'available'}));
      if(apiStations.length>=3)break;
    }catch(e){break;}
  }
  const nearDemo=MMR_STATIONS.map(d=>({...d,dist:haversine(lat,lon,d.lat,d.lon)})).filter(d=>d.dist<=25).sort((a,b)=>a.dist-b.dist);
  const realIds=new Set(apiStations.map(s=>s.id));
  const merged=[...apiStations,...nearDemo.filter(d=>!realIds.has(d.id))];
  merged.forEach(s=>{s.dist=haversine(lat,lon,s.lat,s.lon);});
  merged.sort((a,b)=>a.dist-b.dist);
  stations=merged;
  if(fromGPS)showToast(apiStations.length>0?`Found ${apiStations.length} live + ${nearDemo.length} demo stations`:'No live stations found — showing demo data',apiStations.length>0?'success':'warn');
  renderSidebar(stations);plotStations(stations,true);updateStats();updateResultCount();showLoader(false);
}

/* ── Load/reset helpers ── */
function resetToMMR(){
  if(userMarker){leafletMap.removeLayer(userMarker);userMarker=null;}
  if(accuracyCircle){leafletMap.removeLayer(accuracyCircle);accuracyCircle=null;}
  userLat=null;userLon=null;
  stations=[...MMR_STATIONS].map(s=>({...s}));
  renderSidebar(stations);
  plotStations(stations,false);
  updateStats();
  updateResultCount();
}

function loadMMR(){
  stations=[...MMR_STATIONS].map(s=>({...s}));
  userLat=null;userLon=null;
  if(userMarker){leafletMap.removeLayer(userMarker);userMarker=null;}
  if(accuracyCircle){leafletMap.removeLayer(accuracyCircle);accuracyCircle=null;}
  renderSidebar(stations);plotStations(stations,true);updateStats();updateResultCount();
}