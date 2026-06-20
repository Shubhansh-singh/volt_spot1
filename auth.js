/* ══════════════════════════════════════════════════════
   AUTH.JS — User authentication, session management
   Depends on: (none)
══════════════════════════════════════════════════════ */

let currentUser = null;

/* ── Helpers ── */
function simpleHash(s){
  let h=0;
  for(let i=0;i<s.length;i++){h=(Math.imul(31,h)+s.charCodeAt(i))|0;}
  return h.toString(36);
}

function getUsers(){return JSON.parse(localStorage.getItem('voltspot_users')||'[]');}
function saveUsers(u){localStorage.setItem('voltspot_users',JSON.stringify(u));}

function getSession(){
  const s=localStorage.getItem('voltspot_session');
  if(!s)return null;
  try{return JSON.parse(s);}catch{return null;}
}
function setSession(email){localStorage.setItem('voltspot_session',JSON.stringify({email}));}
function clearSession(){localStorage.removeItem('voltspot_session');}

function resolveUser(email){
  return getUsers().find(u=>u.email.toLowerCase()===email.toLowerCase())||null;
}

function seedDemo(){
  const users=getUsers();
  if(!users.find(u=>u.email==='demo@voltspot.in')){
    users.push({email:'demo@voltspot.in',passHash:simpleHash('demo123'),name:'Demo User',phone:'9876543210',city:'Mumbai',createdAt:Date.now()});
    saveUsers(users);
  }
}

/* ── Auth modal tab switching ── */
function switchAuthTab(tab){
  document.getElementById('tabLogin').classList.toggle('active',tab==='login');
  document.getElementById('tabRegister').classList.toggle('active',tab==='register');
  document.getElementById('panelLogin').classList.toggle('active',tab==='login');
  document.getElementById('panelRegister').classList.toggle('active',tab==='register');
  document.getElementById('loginErr').className='auth-err';
  document.getElementById('registerErr').className='auth-err';
}

function openAuthModal(tab='login'){
  switchAuthTab(tab);
  document.getElementById('authOverlay').classList.add('open');
}
function closeAuthModal(){
  document.getElementById('authOverlay').classList.remove('open');
}

/* ── Auth gate for protected actions ── */
function requireAuth(action){
  if(currentUser){action();return;}
  document.getElementById('modalTitle').textContent='Sign In Required';
  document.getElementById('modalSubtitle').textContent='Create a free account to book charging slots';
  document.getElementById('modalBody').innerHTML=`
    <div class="auth-required-banner">
      <div class="auth-required-icon">🔐</div>
      <div class="auth-required-title">Login to Continue</div>
      <div class="auth-required-sub">
        You need a VoltSpot account to reserve<br>charging slots and manage your bookings.
      </div>
      <button class="btn-primary" style="width:100%;padding:13px;margin-bottom:10px" onclick="closeModal();openAuthModal('login')">Sign In</button>
      <button class="btn-outline" style="width:100%;padding:12px" onclick="closeModal();openAuthModal('register')">Create Free Account</button>
    </div>`;
  document.getElementById('modalOverlay').classList.add('open');
}

/* ── Login ── */
function doLogin(){
  const email=document.getElementById('loginEmail').value.trim();
  const pass=document.getElementById('loginPass').value;
  const err=document.getElementById('loginErr');
  err.className='auth-err';
  if(!email||!pass){err.textContent='Please fill in all fields.';err.className='auth-err show';return;}
  const user=resolveUser(email);
  if(!user||user.passHash!==simpleHash(pass)){
    err.textContent='Incorrect email or password. Please try again.';
    err.className='auth-err show';
    return;
  }
  setSession(email);
  currentUser={...user};
  closeAuthModal();
  renderHeaderAuth();
  updateBookingsBadge();
  showToast(`Welcome back, ${user.name.split(' ')[0]}! ⚡`,'success');
}

/* ── Register ── */
function doRegister(){
  const first=document.getElementById('regFirst').value.trim();
  const last=document.getElementById('regLast').value.trim();
  const email=document.getElementById('regEmail').value.trim();
  const phone=document.getElementById('regPhone').value.trim();
  const pass=document.getElementById('regPass').value;
  const pass2=document.getElementById('regPass2').value;
  const err=document.getElementById('registerErr');
  err.className='auth-err';
  if(!first||!email||!pass){err.textContent='Name, email and password are required.';err.className='auth-err show';return;}
  if(!email.includes('@')||!email.includes('.')){err.textContent='Please enter a valid email address.';err.className='auth-err show';return;}
  if(phone&&phone.length!==10){err.textContent='Mobile number must be 10 digits.';err.className='auth-err show';return;}
  if(pass.length<6){err.textContent='Password must be at least 6 characters.';err.className='auth-err show';return;}
  if(pass!==pass2){err.textContent='Passwords do not match.';err.className='auth-err show';return;}
  const users=getUsers();
  if(users.find(u=>u.email.toLowerCase()===email.toLowerCase())){
    err.textContent='An account with this email already exists. Sign in instead.';
    err.className='auth-err show';
    return;
  }
  const newUser={email,passHash:simpleHash(pass),name:(first+' '+last).trim(),phone,city:'',createdAt:Date.now()};
  users.push(newUser);
  saveUsers(users);
  setSession(email);
  currentUser={...newUser};
  closeAuthModal();
  renderHeaderAuth();
  updateBookingsBadge();
  showToast(`Account created! Welcome, ${first}! ⚡`,'success');
}

/* ── Logout ── */
function doLogout(){
  clearSession();
  currentUser=null;
  renderHeaderAuth();
  updateBookingsBadge();
  showToast('You\'ve been signed out.','info');
}

/* ── Password helpers ── */
function togglePass(id,icon){
  const el=document.getElementById(id);
  el.type=el.type==='password'?'text':'password';
  icon.textContent=el.type==='password'?'👁':'🙈';
}

function checkStrength(v){
  const segs=[document.getElementById('seg1'),document.getElementById('seg2'),
               document.getElementById('seg3'),document.getElementById('seg4')];
  const lbl=document.getElementById('strengthLabel');
  segs.forEach(s=>s.className='strength-seg');
  if(!v){lbl.textContent='';return;}
  let score=0;
  if(v.length>=6)score++;
  if(v.length>=10)score++;
  if(/[A-Z]/.test(v)&&/[0-9]/.test(v))score++;
  if(/[^A-Za-z0-9]/.test(v))score++;
  const cls=['','weak','medium','medium','strong'];
  const labels=['','Weak','Fair','Good','Strong'];
  for(let i=0;i<score;i++)segs[i].className='strength-seg '+cls[score];
  lbl.textContent=score>0?labels[score]:'';
  lbl.style.color=score>=4?'var(--accent)':score>=3?'var(--warn)':'var(--danger)';
}

/* ── Header auth UI ── */
function renderHeaderAuth(){
  const hr=document.getElementById('headerRight');
  if(currentUser){
    const initials=currentUser.name.trim().split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
    hr.innerHTML=`
      <div class="user-pill" onclick="openProfileModal()">
        <div class="user-pill-avatar">${initials}</div>
        <div class="user-pill-name">${currentUser.name}</div>
      </div>
      <button class="btn-logout" onclick="doLogout()">Sign Out</button>
      <button class="btn-primary" onclick="openModal(null,true)">+ Reserve Spot</button>`;
  } else {
    hr.innerHTML=`
      <button class="btn-outline" onclick="openAuthModal('login')">Sign In</button>
      <button class="btn-primary" onclick="openAuthModal('register')">Join Free</button>`;
  }
}