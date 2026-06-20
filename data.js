/* ══════════════════════════════════════════════════════
   DATA.JS — MMR Station data + initialization
══════════════════════════════════════════════════════ */

const MMR_STATIONS=[
  {id:'d001',name:'BEST EV Hub — Colaba',addr:'Shahid Bhagat Singh Marg, Colaba',city:'Mumbai South',lat:18.9067,lon:72.8147,plugs:6,avail:4,kw:50,price:22,type:['CCS','CHAdeMO'],fast:true},
  {id:'d002',name:'Atal Setu EV Charge Point',addr:'Nariman Point, Marine Drive',city:'Mumbai South',lat:18.9256,lon:72.8242,plugs:4,avail:2,kw:22,price:18,type:['Type 2'],fast:false},
  {id:'d003',name:'Fort Business Park Charger',addr:'Horniman Circle, Fort',city:'Mumbai South',lat:18.9342,lon:72.8353,plugs:3,avail:1,kw:7,price:15,type:['Type 2'],fast:false},
  {id:'d004',name:'Worli Charging Plaza',addr:'Dr Annie Besant Rd, Worli',city:'Mumbai South',lat:19.0048,lon:72.8178,plugs:8,avail:5,kw:60,price:24,type:['CCS','CHAdeMO'],fast:true},
  {id:'d005',name:'Lower Parel Hub — Phoenix',addr:'Senapati Bapat Marg, Lower Parel',city:'Mumbai South',lat:18.9983,lon:72.8304,plugs:6,avail:3,kw:50,price:22,type:['CCS'],fast:true},
  {id:'d006',name:'Bandra Station Road EV Point',addr:'Linking Road, Bandra West',city:'Bandra',lat:19.0596,lon:72.8295,plugs:4,avail:4,kw:22,price:18,type:['Type 2'],fast:false},
  {id:'d007',name:'Andheri Metro EV Station',addr:'Andheri Station Complex, West',city:'Andheri',lat:19.1197,lon:72.8464,plugs:10,avail:6,kw:50,price:22,type:['CCS','Type 2'],fast:true},
  {id:'d008',name:'Juhu Beach Fast Charger',addr:'Juhu Tara Rd, Juhu',city:'Juhu',lat:19.1001,lon:72.8271,plugs:3,avail:2,kw:25,price:20,type:['CCS'],fast:false},
  {id:'d009',name:'Santacruz Airport EV Lounge',addr:'CSIA Domestic Terminal',city:'Santacruz',lat:19.0896,lon:72.8656,plugs:8,avail:0,kw:60,price:24,type:['CCS','CHAdeMO'],fast:true},
  {id:'d010',name:'Malad InOrbit Mall Charger',addr:'InOrbit Mall, Mindspace, Malad West',city:'Malad',lat:19.1813,lon:72.8480,plugs:6,avail:5,kw:22,price:18,type:['Type 2'],fast:false},
  {id:'d011',name:'Borivali Station EV Bay',addr:'S.V. Road, Borivali West',city:'Borivali',lat:19.2307,lon:72.8567,plugs:5,avail:3,kw:7,price:15,type:['Type 2'],fast:false},
  {id:'d012',name:'Kandivali West EV Stop',addr:'New Link Rd, Kandivali West',city:'Kandivali',lat:19.2061,lon:72.8415,plugs:4,avail:4,kw:22,price:18,type:['Type 2'],fast:false},
  {id:'d013',name:'Goregaon FilmCity Charger',addr:'Film City Rd, Goregaon East',city:'Goregaon',lat:19.1607,lon:72.8740,plugs:4,avail:2,kw:22,price:18,type:['Type 2'],fast:false},
  {id:'d014',name:'Kurla LBS Road EV Hub',addr:'LBS Marg, Kurla West',city:'Kurla',lat:19.0726,lon:72.8804,plugs:6,avail:3,kw:50,price:22,type:['CCS','CHAdeMO'],fast:true},
  {id:'d015',name:'Ghatkopar Metro Charger',addr:'Jawahar Nagar, Ghatkopar East',city:'Ghatkopar',lat:19.0867,lon:72.9085,plugs:8,avail:5,kw:50,price:22,type:['CCS','Type 2'],fast:true},
  {id:'d016',name:'Vikhroli Godrej EV Station',addr:'Godrej Colony, Vikhroli East',city:'Vikhroli',lat:19.1091,lon:72.9271,plugs:4,avail:4,kw:22,price:18,type:['Type 2'],fast:false},
  {id:'d017',name:'Mulund Check Naka Charger',addr:'L.B.S. Marg, Mulund West',city:'Mulund',lat:19.1726,lon:72.9562,plugs:5,avail:3,kw:25,price:20,type:['CCS'],fast:false},
  {id:'d018',name:'Powai Hiranandani EV Point',addr:'Hiranandani Gardens, Powai',city:'Powai',lat:19.1175,lon:72.9063,plugs:6,avail:6,kw:22,price:18,type:['Type 2'],fast:false},
  {id:'d019',name:'Thane Station EV Hub',addr:'Thane Station Rd, Thane West',city:'Thane',lat:19.1972,lon:72.9641,plugs:10,avail:7,kw:60,price:24,type:['CCS','CHAdeMO'],fast:true},
  {id:'d020',name:'Viviana Mall Fast Charger',addr:'Viviana Mall, Pokhran Rd 2',city:'Thane',lat:19.2100,lon:72.9782,plugs:8,avail:4,kw:50,price:22,type:['CCS','Type 2'],fast:true},
  {id:'d021',name:'Ghodbunder Rd EV Station',addr:'Ghodbunder Road, Thane West',city:'Thane',lat:19.2419,lon:72.9640,plugs:6,avail:3,kw:22,price:18,type:['Type 2'],fast:false},
  {id:'d022',name:'Wagle Estate Charger',addr:'Wagle Industrial Estate, Thane',city:'Thane',lat:19.2033,lon:73.0009,plugs:4,avail:2,kw:7,price:15,type:['Type 2'],fast:false},
  {id:'d023',name:'Kolshet Rd EV Bay',addr:'Kolshet Road, Thane West',city:'Thane',lat:19.2286,lon:72.9705,plugs:5,avail:5,kw:22,price:18,type:['Type 2'],fast:false},
  {id:'d024',name:'Vashi CBD EV Plaza',addr:'Vashi CBD, Sector 30A',city:'Navi Mumbai',lat:19.0743,lon:73.0074,plugs:12,avail:8,kw:60,price:24,type:['CCS','CHAdeMO','Type 2'],fast:true},
  {id:'d025',name:'Nerul Station Charger',addr:'Nerul Station Complex, Sector 23',city:'Navi Mumbai',lat:19.0366,lon:73.0163,plugs:6,avail:4,kw:22,price:18,type:['Type 2'],fast:false},
  {id:'d026',name:'Belapur CBD Fast Hub',addr:'CBD Belapur, Sector 11',city:'Navi Mumbai',lat:19.0222,lon:73.0347,plugs:8,avail:5,kw:50,price:22,type:['CCS','CHAdeMO'],fast:true},
  {id:'d027',name:'Kharghar Hills EV Point',addr:'Kharghar Sector 3',city:'Navi Mumbai',lat:19.0477,lon:73.0710,plugs:5,avail:3,kw:25,price:20,type:['CCS'],fast:false},
  {id:'d028',name:'Palm Beach Rd Charger',addr:'Palm Beach Rd, Sanpada',city:'Navi Mumbai',lat:19.0539,lon:73.0088,plugs:4,avail:4,kw:22,price:18,type:['Type 2'],fast:false},
  {id:'d029',name:'Airoli EV Station',addr:'Airoli Knowledge Park, Sector 1',city:'Navi Mumbai',lat:19.1552,lon:72.9990,plugs:6,avail:4,kw:50,price:22,type:['CCS','Type 2'],fast:true},
  {id:'d030',name:'Ghansoli IT Park Charger',addr:'TTC Industrial Area, Ghansoli',city:'Navi Mumbai',lat:19.1234,lon:73.0161,plugs:4,avail:2,kw:22,price:18,type:['Type 2'],fast:false},
  {id:'d031',name:'Kalyan Station EV Hub',addr:'Kalyan Station Rd, Kalyan West',city:'Kalyan',lat:19.2437,lon:73.1355,plugs:8,avail:5,kw:50,price:22,type:['CCS','CHAdeMO'],fast:true},
  {id:'d032',name:'Dombivli East Charger',addr:'M.I.D.C. Rd, Dombivli East',city:'Dombivli',lat:19.2153,lon:73.0889,plugs:5,avail:3,kw:22,price:18,type:['Type 2'],fast:false},
  {id:'d033',name:'Kalyan Srinagar EV Bay',addr:'Srinagar, Kalyan East',city:'Kalyan',lat:19.2612,lon:73.1590,plugs:4,avail:4,kw:7,price:15,type:['Type 2'],fast:false},
  {id:'d034',name:'Mira Road Station Charger',addr:'Mira Road Station, Eastern Exp Hwy',city:'Mira Road',lat:19.2869,lon:72.8709,plugs:6,avail:3,kw:50,price:22,type:['CCS','CHAdeMO'],fast:true},
  {id:'d035',name:'Bhayander West EV Point',addr:'Bhayander West, Near Flyover',city:'Bhayander',lat:19.3024,lon:72.8541,plugs:4,avail:2,kw:22,price:18,type:['Type 2'],fast:false},
  {id:'d036',name:'Golden Nest Circle Charger',addr:'Golden Nest, Mira Road East',city:'Mira Road',lat:19.2780,lon:72.8782,plugs:3,avail:3,kw:7,price:15,type:['Type 2'],fast:false},
  {id:'d037',name:'Vasai Road EV Hub',addr:'Vasai Road Station, Vasai West',city:'Vasai',lat:19.3621,lon:72.8374,plugs:6,avail:4,kw:50,price:22,type:['CCS','Type 2'],fast:true},
  {id:'d038',name:'Virar Station Charger',addr:'Virar Station East, Sopara Rd',city:'Virar',lat:19.4649,lon:72.8063,plugs:5,avail:3,kw:22,price:18,type:['Type 2'],fast:false},
  {id:'d039',name:'Nalasopara Fast Charger',addr:'S.V. Road, Nalasopara West',city:'Nalasopara',lat:19.4151,lon:72.8127,plugs:4,avail:2,kw:25,price:20,type:['CCS'],fast:false},
  {id:'d040',name:'Panvel Bus Depot EV Hub',addr:'Old Panvel, Near ST Bus Stand',city:'Panvel',lat:18.9894,lon:73.1175,plugs:8,avail:5,kw:60,price:24,type:['CCS','CHAdeMO'],fast:true},
  {id:'d041',name:'NMIA Airport EV Lounge',addr:'Navi Mumbai Intl Airport, Ulwe',city:'Panvel',lat:18.9761,lon:73.0765,plugs:12,avail:9,kw:100,price:26,type:['CCS','CHAdeMO','Type 2'],fast:true},
  {id:'d042',name:'Khopoli Expressway Charger',addr:'Mumbai-Pune Expressway, Khopoli Exit',city:'Panvel',lat:18.9631,lon:73.1450,plugs:6,avail:4,kw:50,price:22,type:['CCS'],fast:true},
  {id:'d043',name:'Badlapur Station EV Bay',addr:'Badlapur Station Rd, Badlapur West',city:'Badlapur',lat:19.1646,lon:73.2611,plugs:4,avail:3,kw:22,price:18,type:['Type 2'],fast:false},
  {id:'d044',name:'Ambernath MIDC Charger',addr:'MIDC Industrial Area, Ambernath',city:'Ambernath',lat:19.1981,lon:73.1940,plugs:4,avail:2,kw:22,price:18,type:['Type 2'],fast:false},
  {id:'d045',name:'Ulhasnagar Camp 4 EV Point',addr:'Camp 4, Ulhasnagar',city:'Ulhasnagar',lat:19.2201,lon:73.1535,plugs:3,avail:1,kw:7,price:15,type:['Type 2'],fast:false},
  {id:'d046',name:'Bhiwandi Logistics Hub',addr:'Purna Village, Bhiwandi Bypass',city:'Bhiwandi',lat:19.2969,lon:73.0540,plugs:6,avail:4,kw:50,price:22,type:['CCS','CHAdeMO'],fast:true},
  {id:'d047',name:'Shahapur NH-3 EV Stop',addr:'National Highway 3, Shahapur',city:'Shahapur',lat:19.4565,lon:73.3301,plugs:4,avail:2,kw:25,price:20,type:['CCS'],fast:false},
  {id:'d048',name:'Karjat Expressway Charger',addr:'NH-48, Karjat Toll Plaza',city:'Karjat',lat:18.9136,lon:73.3192,plugs:4,avail:3,kw:50,price:22,type:['CCS'],fast:true},
  {id:'d049',name:'Uran EV Charging Station',addr:'Uran Rd, Near JNPT Gate',city:'Uran',lat:18.8857,lon:72.9436,plugs:6,avail:5,kw:22,price:18,type:['Type 2'],fast:false},
  {id:'d050',name:'Pen Toll Naka EV Bay',addr:'Mumbai-Goa Highway, Pen',city:'Pen',lat:18.7427,lon:73.0947,plugs:4,avail:2,kw:25,price:20,type:['CCS'],fast:false},
];

/* Seed computed fields on each station */
MMR_STATIONS.forEach(s=>{
  s.status=s.avail===0?'full':s.avail<s.plugs/2?'busy':'available';
  s.rating=(4.0+Math.random()).toFixed(1);
  s.isReal=false;
});