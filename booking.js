/* ══════════════════════════════════════════════════════
   BOOKING.JS — Booking modal, confirmations,
                bookings list, user profile
   Depends on: auth.js (currentUser, requireAuth),
               map.js (stations, selectedStation),
               navigation.js (startNavigation),
               utils.js (showToast)
══════════════════════════════════════════════════════ */

let selectedTime = null;
let lastBookedStation = null;

/* ── Open booking modal ── */
function openModal(ev, fresh=false, stationId=null){
  requireAuth(()=>{
    let s;
    if(stationId)s=stations.find(x=>String(x.id)===String(stationId))||MMR_STATIONS.find(x=>String(x.id)===String(stationId));
    else s=selectedStation||stations[0];
    if(!s){showToast('Select a station first.','warn');return;}
    selectedStation=s;selectedTime=null;

    document.getElementById('modalTitle').textContent=s.name;
    document.getElementById('modalSubtitle').textContent=(s.city?s.city+' · ':'')+s.addr;

    const slots=['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'];
    const takenIdx=new Set([1,3,7,9,12,15,18]);

    document.getElementById('modalBody').innerHTML=`
      <div class="modal-station-info">
        <div>
          <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:15px">${s.avail} plugs available</div>
          <div style="font-size:10px;color:var(--muted);margin-top:3px">Up to ${s.kw} kW · ${(s.type||[]).join(', ')}${s.isReal?' · <span style="color:#4af">Live</span>':''}</div>
        </div>
        <span class="status-badge ${s.status}">${s.status}</span>
      </div>
      <div style="background:rgba(0,255,136,.05);border:1px solid rgba(0,255,136,.12);padding:9px 13px;margin-bottom:18px;font-size:10px;color:var(--muted);display:flex;align-items:center;gap:8px">
        <span style="color:var(--accent)">👤</span> Booking as <strong style="color:var(--text)">${currentUser.name}</strong>
      </div>
      <div class="form-group">
        <label class="form-label">Your Vehicle</label>
        <select class="form-control" id="bkVehicle">
          <option>Tata Nexon EV</option><option>Tata Tiago EV</option><option>Tata Punch EV</option>
          <option>MG ZS EV</option><option>MG Comet EV</option>
          <option>Hyundai Kona Electric</option><option>Hyundai IONIQ 5</option>
          <option>Kia EV6</option><option>BYD Atto 3</option><option>BYD Seal</option>
          <option>Mahindra XUV400</option><option>Mahindra BE 6</option>
          <option>BMW iX</option><option>Mercedes EQS</option><option>Volvo XC40 Recharge</option>
          <option>Ather 450X</option><option>Ola S1 Pro</option><option>Tesla Model 3</option><option>Other</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Date</label>
        <input type="date" class="form-control" id="bookingDate"
          value="${new Date().toISOString().split('T')[0]}" min="${new Date().toISOString().split('T')[0]}" onchange="updatePrice()">
      </div>
      <div class="form-group">
        <label class="form-label">Plug Type</label>
        <select class="form-control" id="bkPlug">${(s.type||['CCS']).map(t=>`<option>${t}</option>`).join('')}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Select Time Slot</label>
        <div class="time-slots" id="timeSlots">
          ${slots.map((t,i)=>`<div class="time-slot${takenIdx.has(i)?' taken':''}" onclick="pickTime(this,'${t}')">${t}${takenIdx.has(i)?' ✕':''}</div>`).join('')}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Charging Duration</label>
        <select class="form-control" id="duration" onchange="updatePrice()">
          <option value="0.5">30 minutes</option><option value="1" selected>1 hour</option>
          <option value="1.5">1.5 hours</option><option value="2">2 hours</option>
          <option value="3">3 hours</option><option value="4">4 hours</option>
        </select>
      </div>
      <div class="price-summary">
        <div class="price-row"><span>Rate</span><span>₹${s.price}/kWh</span></div>
        <div class="price-row"><span>Estimated energy</span><span id="estKwh">—</span></div>
        <div class="price-row"><span>Service fee</span><span>₹10</span></div>
        <div class="price-row total"><span>Estimated Total</span><span class="val" id="estTotal">—</span></div>
      </div>
      <button class="btn-primary" style="width:100%;padding:13px;font-size:12px" onclick="confirmBooking()">
        ${s.status==='full'?'Join Waitlist':'⚡ Confirm Booking'}
      </button>`;
    updatePrice();
    document.getElementById('modalOverlay').classList.add('open');
  });
}

/* ── Time slot picker ── */
function pickTime(el,time){
  if(el.classList.contains('taken'))return;
  document.querySelectorAll('.time-slot').forEach(s=>s.classList.remove('chosen'));
  el.classList.add('chosen');selectedTime=time;
}

/* ── Price calculator ── */
function updatePrice(){
  const s=selectedStation;if(!s)return;
  const dur=parseFloat(document.getElementById('duration')?.value||1);
  const kwh=(s.kw*dur*0.85).toFixed(1);
  const total=Math.round(kwh*s.price+10);
  const ke=document.getElementById('estKwh');if(ke)ke.textContent=kwh+' kWh';
  const te=document.getElementById('estTotal');if(te)te.textContent='₹'+total;
}

/* ── Confirm booking ── */
function confirmBooking(){
  const s=selectedStation;if(!s||!currentUser)return;
  const dur=parseFloat(document.getElementById('duration')?.value||1);
  const vehicle=document.getElementById('bkVehicle')?.value||'EV';
  const plug=document.getElementById('bkPlug')?.value||'CCS';
  const time=selectedTime||'09:00';
  const date=document.getElementById('bookingDate')?.value||new Date().toISOString().split('T')[0];
  const kwh=(s.kw*dur*0.85).toFixed(1);
  const total=Math.round(kwh*s.price+10);
  const bId='VS-'+Math.random().toString(36).substr(2,6).toUpperCase();
  lastBookedStation={lat:s.lat, lon:s.lon, name:s.name};

  const key=`voltspot_bookings_${currentUser.email}`;
  const bookings=JSON.parse(localStorage.getItem(key)||'[]');
  bookings.unshift({bookingId:bId,station:s.name,city:s.city,addr:s.addr,date,time,dur,kw:s.kw,kwh,total,vehicle,plug,status:'Confirmed',isReal:s.isReal});
  localStorage.setItem(key,JSON.stringify(bookings));
  updateBookingsBadge();

  document.getElementById('modalTitle').textContent='Booking Confirmed';
  document.getElementById('modalSubtitle').textContent='Your charging slot is reserved';
  document.getElementById('modalBody').innerHTML=`
    <div class="confirm-screen">
      <div class="confirm-icon">✓</div>
      <div class="confirm-title">You're all set!</div>
      <div class="confirm-id">Booking ID: ${bId}</div>
      <div class="booking-details-grid">
        <div class="bd-item"><div class="bd-label">Station</div><div class="bd-value">${s.name}</div></div>
        <div class="bd-item"><div class="bd-label">City</div><div class="bd-value">${s.city||'—'}</div></div>
        <div class="bd-item"><div class="bd-label">Date</div><div class="bd-value">${date}</div></div>
        <div class="bd-item"><div class="bd-label">Time · Duration</div><div class="bd-value">${time} · ${dur}h</div></div>
        <div class="bd-item"><div class="bd-label">Charger</div><div class="bd-value">${s.kw} kW</div></div>
        <div class="bd-item"><div class="bd-label">Plug</div><div class="bd-value">${plug}</div></div>
        <div class="bd-item"><div class="bd-label">Est. Energy</div><div class="bd-value">${kwh} kWh</div></div>
        <div class="bd-item"><div class="bd-label">Est. Cost</div><div class="bd-value" style="color:var(--accent)">₹${total}</div></div>
      </div>
      <div style="font-size:10px;color:var(--muted);margin-bottom:18px">Manage this booking under "My Bookings".</div>
      <button class="btn-primary" style="width:100%;padding:13px;margin-bottom:10px" onclick="closeModal();setTimeout(navigateToLastBooked,300)">🧭 Navigate to Station</button>
      <button class="btn-outline" style="width:100%;padding:12px" onclick="closeModal()">Done</button>
    </div>`;
}

/* ── Close booking modal ── */
function closeModal(e){
  if(e&&e.target!==document.getElementById('modalOverlay'))return;
  document.getElementById('modalOverlay').classList.remove('open');
}

/* ═══════════════════════════════════════════
   BOOKINGS LIST
═══════════════════════════════════════════ */

function updateBookingsBadge(){
  if(!currentUser){const b=document.getElementById('bookingsBadge');if(b)b.textContent='';return;}
  const bookings=JSON.parse(localStorage.getItem(`voltspot_bookings_${currentUser.email}`)||'[]');
  const active=bookings.filter(b=>b.status==='Confirmed').length;
  let badge=document.getElementById('bookingsBadge');
  const link=document.getElementById('navBookings');
  if(!badge&&link){badge=document.createElement('span');badge.id='bookingsBadge';badge.className='badge';link.appendChild(badge);}
  if(badge)badge.textContent=active>0?active:'';
}

function openBookingsModal(){
  if(!currentUser){
    showToast('Sign in to view your bookings.','warn');
    openAuthModal('login');
    return;
  }
  const key=`voltspot_bookings_${currentUser.email}`;
  const bookings=JSON.parse(localStorage.getItem(key)||'[]');
  const container=document.getElementById('bookingsList');
  if(!bookings.length){
    container.innerHTML=`<div style="text-align:center;padding:50px 20px;color:var(--muted)">
      <div style="font-size:34px;margin-bottom:14px">🔌</div>
      <div style="font-family:'Syne',sans-serif;font-size:15px;margin-bottom:7px;color:var(--text)">No bookings yet</div>
      <div style="font-size:11px">Reserve a charging slot to see it here</div></div>`;
  } else {
    container.innerHTML=bookings.map((b,i)=>`
      <div class="booking-entry" id="bentry-${i}">
        <div class="booking-entry-top">
          <div>
            <div class="booking-entry-id">${b.bookingId}${b.isReal?'  🔵':'  ⚫'}</div>
            <div class="booking-entry-name">${b.station}</div>
            <div class="booking-entry-addr">${b.city||''}${b.city?' · ':''}${b.addr||''}</div>
          </div>
          <span class="${b.status==='Cancelled'?'cancelled-tag':'confirmed-tag'}">${b.status}</span>
        </div>
        <div class="booking-entry-grid">
          <div class="beg-cell"><div class="beg-label">Vehicle</div><div class="beg-val">${b.vehicle}</div></div>
          <div class="beg-cell"><div class="beg-label">Date</div><div class="beg-val">${b.date}</div></div>
          <div class="beg-cell"><div class="beg-label">Time · Dur</div><div class="beg-val">${b.time} · ${b.dur}h</div></div>
          <div class="beg-cell"><div class="beg-label">Charger</div><div class="beg-val">${b.kw} kW</div></div>
          <div class="beg-cell"><div class="beg-label">Est. Energy</div><div class="beg-val">${b.kwh} kWh</div></div>
          <div class="beg-cell"><div class="beg-label">Est. Cost</div><div class="beg-val" style="color:var(--accent)">₹${b.total}</div></div>
        </div>
        ${b.status==='Confirmed'?`<div style='display:flex;gap:8px;margin-top:10px'><button class='cancel-btn' style='margin-top:0;flex:1' onclick='cancelBooking(${i})'>✕ Cancel</button><button style='flex:2;background:rgba(0,255,136,.1);border:1px solid rgba(0,255,136,.3);color:var(--accent);font-family:Syne,sans-serif;font-weight:700;font-size:9px;padding:5px 10px;cursor:pointer;letter-spacing:.8px;text-transform:uppercase;transition:all .2s' onmouseover="this.style.background='rgba(0,255,136,.2)'" onmouseout="this.style.background='rgba(0,255,136,.1)'" onclick='closeBookingsModal();startNavigationByBooking(${i})'>🧭 Navigate</button></div>`:''}
      </div>`).join('');
  }
  document.getElementById('bookingsOverlay').classList.add('open');
}

function cancelBooking(i){
  const key=`voltspot_bookings_${currentUser.email}`;
  const bookings=JSON.parse(localStorage.getItem(key)||'[]');
  bookings[i].status='Cancelled';
  localStorage.setItem(key,JSON.stringify(bookings));
  updateBookingsBadge();
  openBookingsModal();
}

function closeBookingsModal(e){
  if(e&&e.target!==document.getElementById('bookingsOverlay'))return;
  document.getElementById('bookingsOverlay').classList.remove('open');
}

/* ═══════════════════════════════════════════
   PROFILE
═══════════════════════════════════════════ */

function liveUpdateProfile(){
  const name=document.getElementById('profileName').value;
  const dn=document.getElementById('profileDisplayName');
  const av=document.getElementById('avatarCircle');
  if(dn)dn.textContent=name||'—';
  if(av)av.textContent=name?name.trim().split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase():'👤';
}

function openProfileModal(){
  if(!currentUser){openAuthModal('login');return;}
  document.getElementById('profileName').value=currentUser.name||'';
  document.getElementById('profileEmail').value=currentUser.email||'';
  document.getElementById('profilePhone').value=currentUser.phone||'';
  document.getElementById('profileCity').value=currentUser.city||'';
  document.getElementById('profileDisplayName').textContent=currentUser.name||'—';
  document.getElementById('profileDisplayEmail').textContent=currentUser.email||'—';
  const initials=currentUser.name?currentUser.name.trim().split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase():'👤';
  document.getElementById('avatarCircle').textContent=initials;
  document.getElementById('profileMsg').style.display='none';
  document.getElementById('profileOverlay').classList.add('open');
}

function saveProfile(){
  if(!currentUser)return;
  const name=document.getElementById('profileName').value.trim();
  const phone=document.getElementById('profilePhone').value.trim();
  const city=document.getElementById('profileCity').value.trim();
  if(!name){showToast('Please enter your name.','warn');return;}
  if(phone&&phone.length!==10){showToast('Phone must be 10 digits.','warn');return;}
  const users=getUsers();
  const idx=users.findIndex(u=>u.email===currentUser.email);
  if(idx>=0){users[idx].name=name;users[idx].phone=phone;users[idx].city=city;saveUsers(users);}
  currentUser={...currentUser,name,phone,city};
  setSession(currentUser.email);
  renderHeaderAuth();
  liveUpdateProfile();
  const msg=document.getElementById('profileMsg');msg.style.display='block';
  showToast('Profile saved!','success');
  setTimeout(()=>{msg.style.display='none';closeProfileModal();},1400);
}

function closeProfileModal(e){
  if(e&&e.target!==document.getElementById('profileOverlay'))return;
  document.getElementById('profileOverlay').classList.remove('open');
}