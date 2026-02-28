import React, { useState, useRef, useEffect } from 'react';
import { Bell, Users, TrendingUp, Clock, Check, X, HelpCircle, ChevronLeft, ChevronRight, Search, MapPin, Calendar, ArrowUpDown, Download, Mail, MessageSquare, Edit2, Plus, Trash2, LogOut } from 'lucide-react';

const FOX_LOGO = "data:image/jpeg;base64,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";

const NUM_WEEKS = 26;
const CHARLOTTE_LAT = 35.2271;
const CHARLOTTE_LON = -80.8431;
const DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const SKILL_LEVELS = ['1.0','1.5','2.0','2.5','3.0','3.5','4.0','4.5','5.0','5.5'];
const WMO_ICONS = {0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',71:'❄️',73:'❄️',75:'❄️',80:'🌦️',81:'🌧️',82:'⛈️',95:'⛈️',96:'⛈️',99:'⛈️'};
const WMO_LABELS = {0:'Sunny',1:'Mostly Sunny',2:'Partly Cloudy',3:'Cloudy',45:'Foggy',48:'Foggy',51:'Light Drizzle',53:'Drizzle',55:'Heavy Drizzle',61:'Light Rain',63:'Rain',65:'Heavy Rain',71:'Light Snow',73:'Snow',75:'Heavy Snow',80:'Showers',81:'Rain Showers',82:'Violent Showers',95:'Thunderstorm',96:'Thunderstorm',99:'Thunderstorm'};

function getUpcomingSaturdays(count=NUM_WEEKS){const s=[];const t=new Date();const d=t.getDay();const u=d===6?0:(6-d);for(let i=0;i<count;i++){const sat=new Date(t);sat.setDate(t.getDate()+u+(i*7));s.push(sat);}return s;}
function formatSaturdayDate(d){return d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});}
function formatShortDate(d){return d.toLocaleDateString('en-US',{month:'short',day:'numeric'});}
function formatLongDate(d){return d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});}
function generateTimeOptions(){const o=[];for(let h=6;h<=22;h++){for(let m of[0,15,30,45]){if(h===22&&m>30)break;const hh=h>12?h-12:h===0?12:h;const ap=h<12?'AM':'PM';const mm=m.toString().padStart(2,'0');o.push({value:`${h.toString().padStart(2,'0')}:${mm}`,label:`${hh}:${mm} ${ap}`});}}return o;}
const TIME_OPTIONS=generateTimeOptions();
const SATURDAYS=getUpcomingSaturdays(NUM_WEEKS);

function mapsLink(d){const a=[d.street,d.city,d.state,d.zip].filter(Boolean).join(', ');if(!a)return null;return `https://maps.apple.com/?q=${encodeURIComponent(a)}`;}
function initials(name){return name.split(' ').map(n=>n[0]).join('');}
function formatTime(t){const o=TIME_OPTIONS.find(o=>o.value===t);return o?o.label:t;}
function formatAddress(d){return[d.street,d.city,d.state,d.zip].filter(Boolean).join(', ');}
function formatResponseTime(ts){if(!ts)return'—';return new Date(ts).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});}
function getTypeBadgeColor(type){return({practice:'bg-blue-100 text-blue-700',lesson:'bg-purple-100 text-purple-700',clinic:'bg-orange-100 text-orange-700',match:'bg-green-100 text-green-700'})[type]||'bg-green-100 text-green-700';}
function getTypeLabel(type){return({match:'Match',practice:'Practice',lesson:'Lesson',clinic:'Clinic'})[type]||type;}
function timeToMinutes(t){if(!t)return 0;const[h,m]=t.split(':').map(Number);return h*60+m;}

const INITIAL_ROSTER = [
  {id:0,name:'Blair Shwedo',email:'blair@tennis.com',phone:'7045550100',ntrp:'4.0',isPro:true,isAdmin:true},
  {id:1,name:'Alex Morgan',email:'alex@tennis.com',phone:'7045550101',ntrp:'3.5',isPro:false,isAdmin:false},
  {id:2,name:'Jamie Chen',email:'jamie@tennis.com',phone:'7045550102',ntrp:'4.0',isPro:false,isAdmin:false},
  {id:3,name:'Sam Rivera',email:'sam@tennis.com',phone:'7045550103',ntrp:'4.5',isPro:false,isAdmin:false},
  {id:4,name:'Taylor Kim',email:'taylor@tennis.com',phone:'7045550104',ntrp:'3.0',isPro:false,isAdmin:false},
  {id:5,name:'Jordan Wells',email:'jordan@tennis.com',phone:'7045550105',ntrp:'2.5',isPro:false,isAdmin:false},
  {id:6,name:'Casey Park',email:'casey@tennis.com',phone:'7045550106',ntrp:'3.5',isPro:false,isAdmin:false},
  {id:7,name:'Drew Patel',email:'drew@tennis.com',phone:'7045550107',ntrp:'3.5',isPro:false,isAdmin:false},
  {id:8,name:'Riley Scott',email:'riley@tennis.com',phone:'7045550108',ntrp:'5.0',isPro:false,isAdmin:false},
  {id:9,name:'Coach Martinez',email:'coach@tennis.com',phone:'7045550109',ntrp:'5.5',isPro:true,isAdmin:false},
];
const RESPONSE_TIMES={1:'2026-02-16T10:23:00',2:'2026-02-16T09:15:00',3:'2026-02-16T14:30:00',4:'2026-02-15T18:45:00',5:'2026-02-16T11:00:00',6:'2026-02-16T08:20:00',8:'2026-02-16T07:30:00'};

function initWeekDetails(){const d={};for(let i=0;i<NUM_WEEKS;i++)d[i]={subtitle:'',street:'',city:'',state:'',zip:'',startTime:'08:00',endTime:'10:30'};d[0]={subtitle:'Home vs Carmel Valley',street:'4301 Barclay Downs Dr',city:'Charlotte',state:'NC',zip:'28209',startTime:'08:00',endTime:'10:30'};d[2]={subtitle:'Away vs Providence',street:'5301 Randolph Rd',city:'Charlotte',state:'NC',zip:'28211',startTime:'09:00',endTime:'11:30'};return d;}
function initWeekDesignations(){const d={};for(let i=0;i<NUM_WEEKS;i++)d[i]={selected:[],alternates:[],notThisWeek:[]};d[0]={selected:[2,4,8],alternates:[1],notThisWeek:[]};return d;}
function initWeeklyResponses(){const r={};for(let i=0;i<NUM_WEEKS;i++)r[i]={};r[0]={1:'yes',2:'yes',3:'maybe',4:'yes',5:'ifNeeded',6:'no',7:null,8:'yes',9:null};return r;}

function generateICS(items){
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//TennisTeamApp//EN','CALSCALE:GREGORIAN'];
  items.forEach((item,idx)=>{
    if(!item.date&&!item.day)return;
    const now=new Date();
    let start,end;
    if(item.date){
      const d=new Date(item.date);
      if(item.startTime){const[h,m]=item.startTime.split(':');d.setHours(parseInt(h),parseInt(m),0);}
      start=new Date(d);
      end=new Date(d);
      if(item.endTime){const[h,m]=item.endTime.split(':');end.setHours(parseInt(h),parseInt(m),0);}
      else{end.setHours(end.getHours()+2);}
    } else {
      const dayIdx=DAY_ORDER.indexOf(item.day);
      const today=new Date();
      const diff=(dayIdx-today.getDay()+7)%7||7;
      start=new Date(today);start.setDate(today.getDate()+diff);
      if(item.startTime){const[h,m]=item.startTime.split(':');start.setHours(parseInt(h),parseInt(m),0);}
      end=new Date(start);
      if(item.endTime){const[h,m]=item.endTime.split(':');end.setHours(parseInt(h),parseInt(m),0);}
      else{end.setHours(end.getHours()+2);}
    }
    const fmt=d=>`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}00`;
    lines.push('BEGIN:VEVENT',`UID:tennis-${idx}-${now.getTime()}@foxcrofthills`,`DTSTAMP:${fmt(now)}`,`DTSTART:${fmt(start)}`,`DTEND:${fmt(end)}`,`SUMMARY:${item.label}${item.detail?' - '+item.detail:''}`,item.address?`LOCATION:${item.address}`:'','END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.filter(l=>l!=='').join('\r\n');
}

function AddressAutocomplete({value,onChange,placeholder}){
  const[suggestions,setSuggestions]=useState([]);
  const[show,setShow]=useState(false);
  const[loading,setLoading]=useState(false);
  const debRef=useRef(null);
  const fetch_=async(q)=>{if(q.length<2){setSuggestions([]);return;}setLoading(true);try{const box='&viewbox=-81.2,35.4,-80.6,35.0&bounded=1';const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=us&addressdetails=1${box}`,{headers:{'Accept-Language':'en'}});setSuggestions(await r.json());}catch(e){setSuggestions([]);}setLoading(false);};
  const sel=(s)=>{const a=s.address||{};onChange('street',`${a.house_number||''} ${a.road||''}`.trim()||s.display_name.split(',')[0]);onChange('city',a.city||a.town||a.village||'Charlotte');onChange('state',a.state||'NC');onChange('zip',a.postcode||'');setShow(false);setSuggestions([]);};
  return(<div className="relative"><input type="text" value={value} onChange={e=>{onChange('street',e.target.value);setShow(true);clearTimeout(debRef.current);debRef.current=setTimeout(()=>fetch_(e.target.value),400);}} onFocus={()=>suggestions.length>0&&setShow(true)} onBlur={()=>setShow(false)} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/>{loading&&<div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">...</div>}{show&&suggestions.length>0&&<div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">{suggestions.map((s,i)=><button key={i} onMouseDown={e=>{e.preventDefault();sel(s);}} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"><div className="flex items-start gap-2"><MapPin size={14} className="text-gray-400 mt-0.5 shrink-0"/><span className="text-gray-700">{s.display_name}</span></div></button>)}</div>}</div>);
}

function Toast({toasts}){return(<div className="fixed top-4 right-4 z-[100] space-y-2 max-w-xs">{toasts.map(t=><div key={t.id} className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg text-sm flex items-start gap-2"><span className="text-lg">🔔</span><span>{t.message}</span></div>)}</div>);}

function ProfileModal({user, onSave, onClose}){
  const[form,setForm]=useState({name:user.name,email:user.email,phone:user.phone,ntrp:user.ntrp,password:'',passwordConfirm:''});
  const[error,setError]=useState('');
  const save=()=>{
    if(!form.name.trim()){setError('Name is required.');return;}
    if(form.password&&form.password!==form.passwordConfirm){setError('Passwords do not match.');return;}
    onSave({...user,...form,password:undefined,passwordConfirm:undefined});
  };
  return(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-lg">Edit Profile</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">NTRP Rating</label><select value={form.ntrp} onChange={e=>setForm({...form,ntrp:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">{SKILL_LEVELS.map(l=><option key={l} value={l}>{l}</option>)}</select></div>
          <div className="border-t border-gray-100 pt-4"><div className="text-xs font-semibold text-gray-500 uppercase mb-3">Change Password</div>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">New Password</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Leave blank to keep current" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label><input type="password" value={form.passwordConfirm} onChange={e=>setForm({...form,passwordConfirm:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/></div>
            </div>
          </div>
          {error&&<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
          <button onClick={save} className="w-full py-3 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function PlayerEditModal({player, onSave, onClose, isNew}){
  const[form,setForm]=useState(player?{...player}:{id:Date.now(),name:'',email:'',phone:'',ntrp:'3.5',isPro:false,isAdmin:false});
  const[error,setError]=useState('');
  const save=()=>{if(!form.name.trim()){setError('Name is required.');return;}if(!form.email.trim()){setError('Email is required.');return;}onSave(form);};
  return(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-lg">{isNew?'Add Player':'Edit Player'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">NTRP Rating</label><select value={form.ntrp} onChange={e=>setForm({...form,ntrp:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">{SKILL_LEVELS.map(l=><option key={l} value={l}>{l}</option>)}</select></div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isPro} onChange={e=>setForm({...form,isPro:e.target.checked})} className="w-4 h-4"/><span className="text-sm font-medium text-gray-700">PRO / Instructor</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isAdmin} onChange={e=>setForm({...form,isAdmin:e.target.checked})} className="w-4 h-4"/><span className="text-sm font-medium text-gray-700">Admin</span></label>
          </div>
          {error&&<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
          <button onClick={save} className="w-full py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700">{isNew?'Add Player':'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
}

function WindowFormModal({window:win, onSave, onClose, currentUser}){
  const[form,setForm]=useState(win?{...win}:{day:'Saturday',startTime:'',endTime:'',type:'match',matchType:'singles',ntrpMin:'',ntrpMax:'',practiceSpots:2,lessonInstructor:'',lessonSpots:1,clinicTitle:'',clinicInstructor:'',clinicSpots:4});
  const save=()=>{
    if(!form.day||!form.startTime||!form.endTime){alert('Please fill in day and times.');return;}
    if(timeToMinutes(form.endTime)<=timeToMinutes(form.startTime)){alert('End time must be after start time.');return;}
    onSave(form);
  };
  return(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{win?'Edit Window':'Add Availability Window'}</h3>
          <button onClick={onClose} className="text-gray-500"><X size={20}/></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
            <div className="grid grid-cols-4 gap-2">
              {[{value:'match',label:'Match',icon:'🎾'},{value:'practice',label:'Practice',icon:'🏃'},{value:'lesson',label:'Lesson',icon:'📚'},{value:'clinic',label:'Clinic',icon:'🏫',pro:true}].map(t=>(
                <button key={t.value} onClick={()=>setForm({...form,type:t.value})} className={`py-3 rounded-lg border-2 text-center transition-all ${form.type===t.value?'border-blue-500 bg-blue-50':'border-gray-200'} ${t.pro&&!currentUser.isPro?'opacity-40 cursor-not-allowed':''}`} disabled={t.pro&&!currentUser.isPro}>
                  <div className="text-xl mb-1">{t.icon}</div>
                  <div className={`text-xs font-semibold ${form.type===t.value?'text-blue-700':'text-gray-700'}`}>{t.label}</div>
                  {t.pro&&<div className="text-xs text-purple-500">PRO</div>}
                </button>
              ))}
            </div>
          </div>
          {form.type==='match'&&<div><label className="block text-sm font-medium text-gray-700 mb-1">Match Format</label><div className="flex gap-2">{[{v:'singles',l:'Singles 🎾'},{v:'doubles',l:'Doubles 👥'}].map(({v,l})=><button key={v} onClick={()=>setForm({...form,matchType:v})} className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold ${form.matchType===v?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200 text-gray-700'}`}>{l}</button>)}</div></div>}
          {form.type==='practice'&&<div><label className="block text-sm font-medium text-gray-700 mb-1">Players needed</label><div className="flex gap-2">{[1,2,3,4,5,6].map(n=><button key={n} onClick={()=>setForm({...form,practiceSpots:n})} className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold ${form.practiceSpots===n?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200 text-gray-700'}`}>{n}</button>)}</div></div>}
          {form.type==='lesson'&&<><div><label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label><input type="text" value={form.lessonInstructor} onChange={e=>setForm({...form,lessonInstructor:e.target.value})} placeholder="e.g. Coach Martinez" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Spots</label><div className="flex gap-2">{[1,2,3,4,5,6].map(n=><button key={n} onClick={()=>setForm({...form,lessonSpots:n})} className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold ${form.lessonSpots===n?'border-purple-500 bg-purple-50 text-purple-700':'border-gray-200 text-gray-700'}`}>{n}</button>)}</div></div></>}
          {form.type==='clinic'&&<><div><label className="block text-sm font-medium text-gray-700 mb-1">Clinic Title</label><input type="text" value={form.clinicTitle} onChange={e=>setForm({...form,clinicTitle:e.target.value})} placeholder="e.g. Serve & Volley Clinic" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label><input type="text" value={form.clinicInstructor} onChange={e=>setForm({...form,clinicInstructor:e.target.value})} placeholder="e.g. Coach Martinez" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Total spots</label><div className="flex gap-2">{[4,6,8,10,12].map(n=><button key={n} onClick={()=>setForm({...form,clinicSpots:n})} className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold ${form.clinicSpots===n?'border-orange-500 bg-orange-50 text-orange-700':'border-gray-200 text-gray-700'}`}>{n}</button>)}</div></div></>}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Day</label><select value={form.day} onChange={e=>setForm({...form,day:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">{['Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'].map(d=><option key={d}>{d}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label><select value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="">Select start time</option>{TIME_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">End Time</label><select value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="">Select end time</option>{TIME_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">NTRP Range (optional)</label><div className="flex gap-3 items-center"><div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Min</label><select value={form.ntrpMin} onChange={e=>setForm({...form,ntrpMin:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="">Any</option>{SKILL_LEVELS.map(l=><option key={l} value={l}>{l}</option>)}</select></div><div className="text-gray-400 mt-4">—</div><div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Max</label><select value={form.ntrpMax} onChange={e=>setForm({...form,ntrpMax:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="">Any</option>{SKILL_LEVELS.map(l=><option key={l} value={l}>{l}</option>)}</select></div></div></div>
          <button onClick={save} className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{win?'Save Changes':'Add Window'}</button>
        </div>
      </div>
    </div>
  );
}

export default function TennisTeamApp({ session, onSignOut }){
  const[roster,setRoster]=useState(INITIAL_ROSTER);
  const[currentUserId]=useState(0);
  const currentUser=roster.find(r=>r.id===currentUserId)||roster[0];

  const[view,setView]=useState('respond');
  const[selectedWeek,setSelectedWeek]=useState(0);
  const[weeklyResponses,setWeeklyResponses]=useState(initWeeklyResponses);
  const[toasts,setToasts]=useState([]);
  const[weather,setWeather]=useState({});
  const[expandedScheduleItem,setExpandedScheduleItem]=useState(null);
  const[contactPopup,setContactPopup]=useState(null);
  const[showProfileModal,setShowProfileModal]=useState(false);
  const[smsModal,setSmsModal]=useState(null);
  const[withdrawModal,setWithdrawModal]=useState(null); // {sessionId, sessionLabel, players, isFull}
  const[removeResponseModal,setRemoveResponseModal]=useState(false);
  const[editWindowModal,setEditWindowModal]=useState(null); // window object or 'new'
  const[playerEditModal,setPlayerEditModal]=useState(null); // player obj or 'new'

  const showToast=(message)=>{const id=Date.now();setToasts(prev=>[...prev,{id,message}]);setTimeout(()=>setToasts(prev=>prev.filter(t=>t.id!==id)),4000);};

  const[userAvailability,setUserAvailability]=useState({customWindows:[]});
  const[showMatchFinder,setShowMatchFinder]=useState(false);
  const[showBrowseSchedules,setShowBrowseSchedules]=useState(false);
  const[browseFilter,setBrowseFilter]=useState('all');
  const[joinedSessions,setJoinedSessions]=useState({});
  const[joinModal,setJoinModal]=useState(null);
  const[joinTimeStart,setJoinTimeStart]=useState('');
  const[joinTimeEnd,setJoinTimeEnd]=useState('');

  const[weekDetails,setWeekDetails]=useState(initWeekDetails);
  const[editingDetails,setEditingDetails]=useState(false);
  const[draftDetails,setDraftDetails]=useState(null);
  const[quickActionMethod,setQuickActionMethod]=useState('email');
  const[quickActionFilters,setQuickActionFilters]=useState(['yes']);
  const[rosterFilter,setRosterFilter]=useState('all');
  const[weekDesignations,setWeekDesignations]=useState(initWeekDesignations);
  const[sortColumn,setSortColumn]=useState('name');
  const[sortDirection,setSortDirection]=useState('asc');

  const[allPlayerAvailability,setAllPlayerAvailability]=useState({
    1:{name:'Alex Morgan',ntrp:'3.5',windows:[
      {day:'Wednesday',startTime:'18:00',endTime:'20:00',id:'alex-wed',type:'match',matchType:'singles',ntrpMin:'3.0',ntrpMax:'4.0',joinedPlayers:[]},
      {day:'Saturday',startTime:'10:00',endTime:'12:00',id:'alex-sat',type:'practice',ntrpMin:'3.0',ntrpMax:'4.0',practiceSpots:3,joinedPlayers:['Sam Rivera']},
    ]},
    2:{name:'Jamie Chen',ntrp:'4.0',windows:[
      {day:'Tuesday',startTime:'17:30',endTime:'19:30',id:'jamie-tue',type:'practice',ntrpMin:'3.5',ntrpMax:'4.5',practiceSpots:2,joinedPlayers:[]},
      {day:'Thursday',startTime:'19:00',endTime:'21:00',id:'jamie-thu',type:'match',matchType:'doubles',ntrpMin:'3.5',ntrpMax:'4.5',joinedPlayers:['Riley Scott','Taylor Kim']},
    ]},
    3:{name:'Sam Rivera',ntrp:'4.5',windows:[
      {day:'Thursday',startTime:'19:00',endTime:'21:00',id:'sam-thu',type:'match',matchType:'singles',ntrpMin:'4.0',ntrpMax:'5.0',joinedPlayers:[]},
    ]},
    5:{name:'Jordan Wells',ntrp:'2.5',windows:[
      {day:'Monday',startTime:'07:00',endTime:'08:30',id:'jordan-mon',type:'practice',ntrpMin:'2.0',ntrpMax:'3.5',practiceSpots:2,joinedPlayers:[]},
    ]},
    6:{name:'Casey Park',ntrp:'3.5',windows:[
      {day:'Saturday',startTime:'10:00',endTime:'12:00',id:'casey-sat',type:'match',matchType:'singles',ntrpMin:'3.0',ntrpMax:'4.5',joinedPlayers:[]},
    ]},
    8:{name:'Riley Scott',ntrp:'5.0',windows:[
      {day:'Friday',startTime:'18:00',endTime:'20:00',id:'riley-fri',type:'practice',ntrpMin:'4.0',ntrpMax:'5.5',practiceSpots:3,joinedPlayers:['Drew Patel','Jordan Wells']},
    ]},
    9:{name:'Coach Martinez',ntrp:'5.5',windows:[
      {day:'Sunday',startTime:'09:00',endTime:'11:00',id:'coach-clinic',type:'clinic',ntrpMin:'3.0',ntrpMax:'5.5',clinicTitle:'Weekend Warriors Clinic',clinicInstructor:'Coach Martinez',clinicSpots:8,joinedPlayers:['Alex Morgan','Casey Park','Taylor Kim']},
      {day:'Wednesday',startTime:'17:00',endTime:'18:00',id:'coach-lesson',type:'lesson',ntrpMin:'3.0',ntrpMax:'5.5',lessonInstructor:'Coach Martinez',lessonSpots:1,joinedPlayers:[]},
    ]},
  });

  const fetchWeather=async(weekIdx)=>{
    if(weather[weekIdx]!==undefined)return;
    const sat=SATURDAYS[weekIdx];
    const diffDays=Math.round((sat-new Date())/86400000);
    if(diffDays>15){setWeather(prev=>({...prev,[weekIdx]:null}));return;}
    try{
      const dateStr=sat.toISOString().split('T')[0];
      const url=`https://api.open-meteo.com/v1/forecast?latitude=${CHARLOTTE_LAT}&longitude=${CHARLOTTE_LON}&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&timezone=America%2FNew_York&start_date=${dateStr}&end_date=${dateStr}`;
      const res=await fetch(url);const data=await res.json();
      if(data.daily){const code=data.daily.weathercode[0];setWeather(prev=>({...prev,[weekIdx]:{hi:Math.round(data.daily.temperature_2m_max[0]),lo:Math.round(data.daily.temperature_2m_min[0]),icon:WMO_ICONS[code]||'🌡️',label:WMO_LABELS[code]||''}}));}
    }catch(e){setWeather(prev=>({...prev,[weekIdx]:null}));}
  };

  useEffect(()=>{fetchWeather(0);},[]);
  useEffect(()=>{if(view==='respond')fetchWeather(selectedWeek);},[selectedWeek,view]);

  const currentSaturday=SATURDAYS[selectedWeek];
  const currentDetails=weekDetails[selectedWeek];
  const currentDesignations=weekDesignations[selectedWeek];
  const currentWeekResponses=weeklyResponses[selectedWeek]||{};
  const userResponse=currentWeekResponses.blair||null;

  const getWeekRoster=(weekIdx)=>{
    const responses=weeklyResponses[weekIdx]||{};
    return roster.map(m=>({...m,response:m.id===0?(weeklyResponses[weekIdx]?.blair||null):(responses[m.id]??null),responseTime:m.id===0?(weeklyResponses[weekIdx]?.blairTime||null):(responses[m.id]?RESPONSE_TIMES[m.id]||null:null)}));
  };
  const weekRoster=getWeekRoster(selectedWeek);
  const rosterCounts=weekRoster.reduce((acc,m)=>{if(m.response)acc[m.response]=(acc[m.response]||0)+1;else acc.noResponse=(acc.noResponse||0)+1;return acc;},{yes:0,maybe:0,ifNeeded:0,no:0,noResponse:0});

  const handleResponse=(response)=>{
    if(userResponse===response){setRemoveResponseModal(true);return;}
    const now=new Date().toISOString();
    setWeeklyResponses(prev=>({...prev,[selectedWeek]:{...prev[selectedWeek],blair:response,blairTime:now}}));
  };
  const confirmRemoveResponse=()=>{
    setWeeklyResponses(prev=>({...prev,[selectedWeek]:{...prev[selectedWeek],blair:null,blairTime:null}}));
    setRemoveResponseModal(false);
  };

  const checkQualified=(w)=>{const u=parseFloat(currentUser.ntrp);if(w.ntrpMin&&u<parseFloat(w.ntrpMin))return false;if(w.ntrpMax&&u>parseFloat(w.ntrpMax))return false;return true;};

  // Host counts as 1, so existing joinedPlayers are the additional ones
  const getSlotsInfo=(w)=>{
    const extraJoined=(w.joinedPlayers||[]).length;
    const blairJoined=joinedSessions[w.id]?1:0;
    const total=1+extraJoined+blairJoined; // 1 = host
    if(w.type==='match'){const needed=w.matchType==='singles'?2:4;return{total,needed,filled:total>=needed};}
    if(w.type==='practice')return{total,needed:(w.practiceSpots||2)+1,filled:total>=(w.practiceSpots||2)+1};
    if(w.type==='clinic')return{total,needed:w.clinicSpots||8,filled:total>=(w.clinicSpots||8)};
    if(w.type==='lesson')return{total,needed:(w.lessonSpots||1)+1,filled:total>=(w.lessonSpots||1)+1};
    return null;
  };

  const getAllWindowsForBrowse=()=>{
    const windows=[];
    Object.entries(allPlayerAvailability).forEach(([playerId,player])=>{
      const re=roster.find(r=>r.id===parseInt(playerId));
      player.windows.forEach(w=>windows.push({...w,playerId,playerName:player.name,playerNtrp:player.ntrp,playerEmail:re?.email,playerPhone:re?.phone,qualified:checkQualified(w)}));
    });
    return windows.sort((a,b)=>DAY_ORDER.indexOf(a.day)-DAY_ORDER.indexOf(b.day)||timeToMinutes(a.startTime)-timeToMinutes(b.startTime));
  };

  const getFilteredBrowseWindows=()=>{let w=getAllWindowsForBrowse();if(browseFilter!=='all')w=w.filter(x=>x.type===browseFilter);return w;};

  const calculateOverlap=(w1,w2)=>{if(w1.day!==w2.day)return 0;const s=Math.max(timeToMinutes(w1.startTime),timeToMinutes(w2.startTime));const e=Math.min(timeToMinutes(w1.endTime),timeToMinutes(w2.endTime));return Math.max(0,(e-s)/60);};
  const findMatches=()=>{const matches={strong:[],potential:[]};Object.entries(allPlayerAvailability).forEach(([id,player])=>{let mx=0;userAvailability.customWindows.forEach(uw=>{player.windows.forEach(pw=>{mx=Math.max(mx,calculateOverlap(uw,pw));});});if(mx>=1.5)matches.strong.push({...player,id,maxOverlap:mx});else if(mx>=1.0)matches.potential.push({...player,id,maxOverlap:mx});});return matches;};

  const openJoinModal=(w)=>{setJoinModal(w);setJoinTimeStart(w.startTime);setJoinTimeEnd(w.endTime);};
  const confirmJoin=()=>{
    if(!joinModal)return;
    if(joinModal.type==='match'){const dur=timeToMinutes(joinTimeEnd)-timeToMinutes(joinTimeStart);if(dur<90){alert('Time window must be at least 1.5 hours.');return;}}
    // Only update joinedSessions (blair joined flag) - don't push to joinedPlayers array to avoid double count
    setJoinedSessions(prev=>({...prev,[joinModal.id]:{startTime:joinModal.type==='match'?joinTimeStart:joinModal.startTime,endTime:joinModal.type==='match'?joinTimeEnd:joinModal.endTime}}));
    showToast('Push sent to ' + joinModal.playerName + ': Blair joined your ' + (joinModal.matchType||'') + ' ' + getTypeLabel(joinModal.type) + ' on ' + joinModal.day);
    setJoinModal(null);
  };

  const handleWithdraw=(sessionId,sessionLabel,players,isFull)=>{
    setWithdrawModal({sessionId,sessionLabel,players,isFull});
  };
  const confirmWithdraw=(notifyMethod)=>{
    if(!withdrawModal)return;
    setJoinedSessions(prev=>{const n={...prev};delete n[withdrawModal.sessionId];return n;});
    if(notifyMethod==='email'&&withdrawModal.players.length>0){window.location.href='mailto:'+withdrawModal.players.map(p=>p.email).filter(Boolean).join(',');}
    else if(notifyMethod==='text'&&withdrawModal.players.length>0){
      const nums=withdrawModal.players.map(p=>(p.phone||'').replace(/\D/g,'')).filter(Boolean);
      if(nums.length===1)window.location.href='sms:+1'+nums[0];
      else setSmsModal({numbers:nums,names:withdrawModal.players.map(p=>p.name)});
    }
    showToast('You have withdrawn from ' + withdrawModal.sessionLabel);
    setWithdrawModal(null);
  };

  const getSessionStatusLabel=(w)=>{if(w.type==='lesson'||w.type==='clinic')return null;const info=getSlotsInfo(w);return info?(info.filled?'Confirmed':'Pending'):null;};

  const toggleQuickActionFilter=(filter)=>setQuickActionFilters(prev=>prev.includes(filter)?prev.filter(f=>f!==filter):[...prev,filter]);
  const getFilteredRoster=()=>{const seen=new Set();const result=[];quickActionFilters.forEach(filter=>{weekRoster.forEach(m=>{if(seen.has(m.id))return;const match=(filter==='noResponse'&&!m.response)||(filter==='selected'&&currentDesignations.selected.includes(m.id))||(filter==='alternates'&&currentDesignations.alternates.includes(m.id))||(filter==='available'&&(m.response==='yes'||m.response==='ifNeeded'))||m.response===filter;if(match){result.push(m);seen.add(m.id);}});});return result;};
  const fireQuickAction=()=>{const filtered=getFilteredRoster();if(filtered.length===0){alert('No members match the selected filters.');return;}if(quickActionMethod==='email'){window.location.href='mailto:'+filtered.map(m=>m.email).join(',');}else{if(filtered.length===1){window.location.href='sms:+1'+filtered[0].phone.replace(/\D/g,'');}else{setSmsModal({numbers:filtered.map(m=>m.phone.replace(/\D/g,'')),names:filtered.map(m=>m.name)});}}};

  const handleSort=(col)=>{if(sortColumn===col)setSortDirection(d=>d==='asc'?'desc':'asc');else{setSortColumn(col);setSortDirection('asc');}};
  const canDesignate=(member)=>member.response==='yes'||member.response==='ifNeeded';
  const setDesignation=(memberId,type)=>{const desig={...currentDesignations};desig.selected=desig.selected.filter(id=>id!==memberId);desig.alternates=desig.alternates.filter(id=>id!==memberId);desig.notThisWeek=(desig.notThisWeek||[]).filter(id=>id!==memberId);const wasIn=weekDesignations[selectedWeek][type]?.includes(memberId);if(!wasIn)desig[type]=[...(desig[type]||[]),memberId];setWeekDesignations({...weekDesignations,[selectedWeek]:desig});};
  const getDisplayRoster=()=>{let r=[...weekRoster];if(rosterFilter==='available')r=r.filter(m=>m.response==='yes'||m.response==='ifNeeded');return r.sort((a,b)=>{let av=a[sortColumn],bv=b[sortColumn];if(sortColumn==='ntrp'){av=parseFloat(av);bv=parseFloat(bv);}else if(sortColumn==='responseTime'){av=av?new Date(av).getTime():0;bv=bv?new Date(bv).getTime():0;}else if(typeof av==='string'){av=av.toLowerCase();bv=bv?bv.toLowerCase():'';}if(av<bv)return sortDirection==='asc'?-1:1;if(av>bv)return sortDirection==='asc'?1:-1;return 0;});};

  // Get participants for a schedule item (for contact action)
  const getSessionParticipants=(item)=>{
    if(item.type==='league'){
      const weekSel=weekDesignations[item.weekIdx]?.selected||[];
      return roster.filter(m=>weekSel.includes(m.id)&&m.id!==0);
    }
    // For joined sessions, get the host + other joiners
    const players=[];
    if(item.hostId){const h=roster.find(r=>r.id===parseInt(item.hostId));if(h)players.push(h);}
    (item.joinedPlayers||[]).forEach(name=>{const p=roster.find(r=>r.name===name);if(p)players.push(p);});
    return players.filter(p=>p.id!==0);
  };

  const getMyScheduleItems=()=>{
    const items=[];
    for(let i=0;i<NUM_WEEKS;i++){
      const resp=weeklyResponses[i]?.blair;
      if(resp==='yes'||resp==='ifNeeded'){
        const desig=weekDesignations[i];const det=weekDetails[i];
        const status=desig.selected.includes(0)?'Selected':desig.alternates.includes(0)?'Alternate':(desig.notThisWeek||[]).includes(0)?'Not This Week':'Pending';
        items.push({type:'league',label:'League Match',detail:det.subtitle,date:SATURDAYS[i],day:'Saturday',startTime:det.startTime,endTime:det.endTime,address:formatAddress(det),status,weekIdx:i});
      }
    }
    userAvailability.customWindows.forEach((w)=>{
      const info=getSlotsInfo(w);
      items.push({type:w.type,label:getTypeLabel(w.type)+' (Open Request)',day:w.day,startTime:w.startTime,endTime:w.endTime,joinedPlayers:w.joinedPlayers||[],info,date:null,windowId:w.id});
    });
    Object.entries(joinedSessions).forEach(([wid,times])=>{
      Object.entries(allPlayerAvailability).forEach(([pid,player])=>{
        const w=player.windows.find(pw=>pw.id===wid);
        if(w){const info=getSlotsInfo(w);items.push({type:w.type,label:getTypeLabel(w.type)+' with '+player.name,day:w.day,startTime:times.startTime,endTime:times.endTime,joinedPlayers:w.joinedPlayers||[],info,status:'Joined',date:null,sessionId:wid,hostId:pid,hostName:player.name});}
      });
    });
    return items.sort((a,b)=>{const aMs=a.date?a.date.getTime():(Date.now()+DAY_ORDER.indexOf(a.day)*10000000+timeToMinutes(a.startTime||'08:00')*60000);const bMs=b.date?b.date.getTime():(Date.now()+DAY_ORDER.indexOf(b.day)*10000000+timeToMinutes(b.startTime||'08:00')*60000);return aMs-bMs;});
  };

  const exportICS=()=>{const items=getMyScheduleItems();const ics=generateICS(items);const blob=new Blob([ics],{type:'text/calendar'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='foxcroft-schedule.ics';a.click();showToast('Calendar exported!');};

  const weekLabel=(i)=>i===0?'This Saturday':i===1?'Next Saturday':formatShortDate(SATURDAYS[i]);
  const SortBtn=({col,label})=>(<button onClick={()=>handleSort(col)} className="flex items-center gap-1 hover:text-gray-900 text-left">{label}{sortColumn===col&&<ArrowUpDown size={12}/>}</button>);

  const startEditingDetails=()=>{setDraftDetails({...currentDetails});setEditingDetails(true);};
  const saveDetails=()=>{setWeekDetails({...weekDetails,[selectedWeek]:draftDetails});setEditingDetails(false);};

  const saveWindow=(form)=>{
    if(editWindowModal&&editWindowModal!=='new'){
      setUserAvailability(prev=>({...prev,customWindows:prev.customWindows.map(w=>w.id===editWindowModal.id?{...form,id:w.id,joinedPlayers:w.joinedPlayers}:w)}));
    } else {
      setUserAvailability(prev=>({...prev,customWindows:[...prev.customWindows,{...form,id:'my-'+Date.now(),joinedPlayers:[]}]}));
    }
    setEditWindowModal(null);
  };

  const savePlayer=(form)=>{
    if(playerEditModal==='new'){setRoster(prev=>[...prev,{...form,id:Date.now()}]);}
    else{setRoster(prev=>prev.map(p=>p.id===form.id?form:p));}
    setPlayerEditModal(null);
    showToast(playerEditModal==='new'?'Player added!':'Player updated!');
  };
  const saveProfile=(updated)=>{setRoster(prev=>prev.map(p=>p.id===updated.id?updated:p));setShowProfileModal(false);showToast('Profile updated!');};

  return(
    <div className="min-h-screen bg-gray-50" onClick={()=>contactPopup&&setContactPopup(null)}>
      <Toast toasts={toasts}/>

      {/* Modals */}
      {showProfileModal&&<ProfileModal user={currentUser} onSave={saveProfile} onClose={()=>setShowProfileModal(false)}/>}
      {playerEditModal&&<PlayerEditModal player={playerEditModal==='new'?null:playerEditModal} isNew={playerEditModal==='new'} onSave={savePlayer} onClose={()=>setPlayerEditModal(null)}/>}
      {editWindowModal&&<WindowFormModal window={editWindowModal==='new'?null:editWindowModal} onSave={saveWindow} onClose={()=>setEditWindowModal(null)} currentUser={currentUser}/>}

      {/* Remove Response Confirm */}
      {removeResponseModal&&(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Remove Response?</h3>
            <p className="text-sm text-gray-600 mb-5">Are you sure you want to clear your response for this week?</p>
            <div className="flex gap-3">
              <button onClick={()=>setRemoveResponseModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">Cancel</button>
              <button onClick={confirmRemoveResponse} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold">Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {withdrawModal&&(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Withdraw from Session?</h3>
            <p className="text-sm text-gray-600 mb-2">Are you sure you want to withdraw from <span className="font-semibold">{withdrawModal.sessionLabel}</span>?</p>
            {withdrawModal.isFull&&withdrawModal.players.length>0&&<p className="text-sm text-orange-600 mb-4 bg-orange-50 border border-orange-200 rounded-lg p-2">This session is full. Would you like to notify the other players?</p>}
            <div className="space-y-2">
              {withdrawModal.isFull&&withdrawModal.players.length>0&&(
                <>
                  <button onClick={()=>confirmWithdraw('email')} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">Withdraw & Notify by Email</button>
                  <button onClick={()=>confirmWithdraw('text')} className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">Withdraw & Notify by Text</button>
                  <button onClick={()=>confirmWithdraw(null)} className="w-full py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Withdraw Without Notifying</button>
                </>
              )}
              {(!withdrawModal.isFull||withdrawModal.players.length===0)&&(
                <button onClick={()=>confirmWithdraw(null)} className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold">Confirm Withdraw</button>
              )}
              <button onClick={()=>setWithdrawModal(null)} className="w-full py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Modal */}
      {smsModal&&(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4" onClick={()=>setSmsModal(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3"><h3 className="font-semibold text-gray-900">Text {smsModal.names.length} Members</h3><button onClick={()=>setSmsModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button></div>
            <p className="text-sm text-gray-600 mb-3">iOS only supports one number at a time via link. Copy all numbers and paste into a new group message in Messages.</p>
            <div className="bg-gray-50 rounded-lg p-3 mb-2"><div className="text-xs text-gray-500 mb-1 font-medium">Phone numbers:</div><div className="font-mono text-sm text-gray-800 break-all select-all">{smsModal.numbers.join(', ')}</div></div>
            <div className="text-xs text-gray-400 mb-4">{smsModal.names.join(', ')}</div>
            <div className="flex gap-2">
              <button onClick={()=>{navigator.clipboard.writeText(smsModal.numbers.join(', '));showToast('Numbers copied!');setSmsModal(null);}} className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold">Copy Numbers</button>
              <a href={'sms:+1'+smsModal.numbers[0]} onClick={()=>setSmsModal(null)} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold text-center">Text First Only</a>
            </div>
          </div>
        </div>
      )}

      {/* Contact popup */}
      {contactPopup&&(
        <div className="fixed z-[200] bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-48" style={{top:contactPopup.y,left:Math.min(contactPopup.x,window.innerWidth-210)}} onClick={e=>e.stopPropagation()}>
          <div className="font-semibold text-gray-900 text-sm mb-2 px-1">{contactPopup.name}</div>
          <a href={'mailto:'+contactPopup.email} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"><Mail size={14} className="text-blue-500"/> Email</a>
          <a href={'sms:+1'+(contactPopup.phone||'').replace(/\D/g,'')} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"><MessageSquare size={14} className="text-green-500"/> Text</a>
        </div>
      )}

      {/* HEADER */}
      <div style={{backgroundColor:'#1e4d2b'}} className="border-b border-green-900">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img src={FOX_LOGO} alt="Foxcroft Hills" className="w-12 h-12 object-cover rounded-lg border-2 border-green-600"/>
              <div><h1 className="text-xl font-bold text-white leading-tight">Foxcroft Hills</h1><p className="text-xs text-green-300">{roster.length} members</p></div>
            </div>
            <div className="flex items-center gap-2"><button onClick={onSignOut} className="text-green-300 hover:text-white p-1" title="Sign out"><LogOut size={16}/></button><button onClick={()=>setShowProfileModal(true)} className="text-right hover:opacity-80 transition-opacity">
              <div className="font-semibold text-white flex items-center gap-1 justify-end text-sm">{currentUser.name}<span className="text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded font-medium">PRO</span></div>
              <div className="text-xs text-green-300">NTRP {currentUser.ntrp} · tap to edit</div>
            </button></div>
          </div>
          <div className="flex gap-1 bg-green-900 bg-opacity-60 rounded-lg p-1">
            {[['respond','This Week'],['availability','Play!'],['schedule','My Schedule'],['admin','Admin']].map(([v,l])=>(
              <button key={v} onClick={()=>setView(v)} className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${view===v?'bg-white text-gray-900 shadow-sm':'text-green-200 hover:text-white'}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* ══════ THIS WEEK ══════ */}
        {view==='respond'&&(
          <>
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <div className="flex items-center justify-between">
                <button onClick={()=>setSelectedWeek(Math.max(0,selectedWeek-1))} disabled={selectedWeek===0} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={20}/></button>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-900">{weekLabel(selectedWeek)}</div>
                  <div className="text-lg font-bold text-blue-600">{formatSaturdayDate(currentSaturday)}</div>
                  {currentDetails.subtitle&&<div className="text-sm font-medium text-orange-600 mt-1">{currentDetails.subtitle}</div>}
                </div>
                <button onClick={()=>setSelectedWeek(Math.min(NUM_WEEKS-1,selectedWeek+1))} disabled={selectedWeek===NUM_WEEKS-1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={20}/></button>
              </div>
            </div>

            {/* Weather */}
            <div className="bg-white rounded-xl shadow-sm p-3 mb-4">
              {weather[selectedWeek]===undefined?(
                <div className="text-center text-sm text-gray-400 animate-pulse">Fetching forecast...</div>
              ):weather[selectedWeek]===null?(
                <div className="text-center text-sm text-gray-400">Forecast unavailable for this date</div>
              ):(
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl">{weather[selectedWeek].icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{formatSaturdayDate(currentSaturday)}</div>
                    <div className="text-sm font-medium text-gray-600">{weather[selectedWeek].label}</div>
                    <div className="text-sm text-gray-600">
                      <span className="font-bold text-red-500">{weather[selectedWeek].hi}°</span>
                      <span className="mx-1 text-gray-400">/</span>
                      <span className="font-bold text-blue-500">{weather[selectedWeek].lo}°</span>
                      <span className="ml-1 text-xs text-gray-400">F</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {formatAddress(currentDetails)&&(
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                <MapPin size={20} className="text-blue-600 mt-0.5 shrink-0"/>
                <div>
                  <div className="text-sm font-semibold text-blue-900">Location</div>
                  <a href={mapsLink(currentDetails)} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-700 underline underline-offset-2 hover:text-blue-900">
                    {currentDetails.street}{currentDetails.city&&', '+currentDetails.city}{currentDetails.state&&', '+currentDetails.state}{currentDetails.zip&&' '+currentDetails.zip}
                  </a>
                  {currentDetails.startTime&&<div className="text-xs text-blue-700 mt-0.5">{formatTime(currentDetails.startTime)} – {formatTime(currentDetails.endTime)}</div>}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Are you playing?</h2>
              <div className="grid grid-cols-2 gap-3">
                {[{v:'yes',icon:<Check size={24}/>,label:'Yes',sel:'border-green-500 bg-green-50',txt:'text-green-700',cnt:rosterCounts.yes},{v:'maybe',icon:<HelpCircle size={24}/>,label:'Maybe',sel:'border-yellow-500 bg-yellow-50',txt:'text-yellow-700',cnt:rosterCounts.maybe},{v:'ifNeeded',icon:<Users size={24}/>,label:'If Needed',sel:'border-blue-500 bg-blue-50',txt:'text-blue-700',cnt:rosterCounts.ifNeeded},{v:'no',icon:<X size={24}/>,label:'No',sel:'border-red-500 bg-red-50',txt:'text-red-700',cnt:rosterCounts.no}].map(({v,icon,label,sel,txt,cnt})=>(
                  <button key={v} onClick={()=>handleResponse(v)} className={`py-4 px-4 rounded-xl border-2 transition-all ${userResponse===v?sel:'border-gray-200'}`}>
                    <div className={`mx-auto mb-2 w-fit ${userResponse===v?txt:'text-gray-400'}`}>{icon}</div>
                    <div className={`font-semibold ${userResponse===v?txt:'text-gray-700'}`}>{label}</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{cnt}</div>
                  </button>
                ))}
              </div>
              {userResponse&&<div className="mt-4 p-3 bg-gray-50 rounded-lg"><p className="text-sm text-gray-600 text-center">Your response: <span className="font-semibold text-gray-900">{{yes:'Yes',maybe:'Maybe',ifNeeded:'If Needed',no:'No'}[userResponse]}</span> <span className="text-xs text-gray-400">(tap again to remove)</span></p></div>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-4"><div className="flex items-center gap-3"><div className="p-3 bg-green-100 rounded-lg"><TrendingUp size={24} className="text-green-600"/></div><div><div className="text-2xl font-bold text-gray-900">{Math.round((rosterCounts.yes/roster.length)*100)}%</div><div className="text-sm text-gray-600">Playing</div></div></div></div>
              <div className="bg-white rounded-xl shadow-sm p-4"><div className="flex items-center gap-3"><div className="p-3 bg-blue-100 rounded-lg"><Clock size={24} className="text-blue-600"/></div><div><div className="text-2xl font-bold text-gray-900">{rosterCounts.noResponse}</div><div className="text-sm text-gray-600">Pending</div></div></div></div>
            </div>
          </>
        )}

        {/* ══════ PLAY! ══════ */}
        {view==='availability'&&(
          <>
            <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Your Availability Windows</h3>
                <button onClick={()=>setEditWindowModal('new')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">+ Add Window</button>
              </div>
              {userAvailability.customWindows.length===0?(
                <p className="text-sm text-gray-500 text-center py-6">No time windows added yet.</p>
              ):(
                <div className="space-y-2">
                  {userAvailability.customWindows.map((w,idx)=>(
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="font-medium text-gray-900">{w.day}</div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeBadgeColor(w.type)}`}>{w.type==='match'?(w.matchType==='singles'?'Singles':'Doubles'):getTypeLabel(w.type)}</span>
                        </div>
                        <div className="text-sm text-gray-600">{formatTime(w.startTime)} – {formatTime(w.endTime)}</div>
                        {(w.ntrpMin||w.ntrpMax)&&<div className="text-xs text-gray-500">NTRP {w.ntrpMin||'any'} – {w.ntrpMax||'any'}</div>}
                        {w.type==='practice'&&<div className="text-xs text-blue-600">Looking for {w.practiceSpots} players</div>}
                        {w.type==='lesson'&&<div className="text-xs text-purple-600">w/ {w.lessonInstructor} · {w.lessonSpots} spot{w.lessonSpots!==1?'s':''}</div>}
                        {w.type==='clinic'&&<div className="text-xs text-orange-600">{w.clinicTitle&&<span className="font-medium">{w.clinicTitle} · </span>}w/ {w.clinicInstructor} · {w.clinicSpots} spots</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={()=>setEditWindowModal(w)} className="text-blue-400 hover:text-blue-600"><Edit2 size={16}/></button>
                        <button onClick={()=>setUserAvailability(prev=>({...prev,customWindows:prev.customWindows.filter((_,i)=>i!==idx)}))} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {userAvailability.customWindows.length>0&&(
                <button onClick={()=>{const m=findMatches();if(m.strong.length>0||m.potential.length>0)setShowMatchFinder(true);else alert('No matches found!');}} className="bg-green-600 text-white rounded-xl p-4 hover:bg-green-700 text-center">
                  <Search size={20} className="mx-auto mb-1"/><div className="text-sm font-semibold">Find Matches</div><div className="text-xs opacity-90">1+ hour overlap</div>
                </button>
              )}
              <button onClick={()=>setShowBrowseSchedules(true)} className={`bg-purple-600 text-white rounded-xl p-4 hover:bg-purple-700 text-center ${userAvailability.customWindows.length===0?'col-span-2':''}`}>
                <Users size={20} className="mx-auto mb-1"/><div className="text-sm font-semibold">Browse Requests</div><div className="text-xs opacity-90">View open sessions</div>
              </button>
            </div>

            {showMatchFinder&&(()=>{const matches=findMatches();return(
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-900 text-lg">Available Players</h3><button onClick={()=>setShowMatchFinder(false)} className="text-gray-500"><X size={20}/></button></div>
                  {matches.strong.length===0&&matches.potential.length===0&&<div className="text-center py-8 text-gray-500">No matches found.</div>}
                  {matches.strong.length>0&&<div className="mb-4"><h4 className="text-sm font-semibold text-green-700 mb-2">Strong Matches (1.5+ hours)</h4><div className="space-y-3">{matches.strong.map(p=><div key={p.id} className="border-2 border-green-200 bg-green-50 rounded-lg p-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">{initials(p.name)}</div><div><div className="font-semibold">{p.name}</div><div className="text-xs text-gray-600">NTRP {p.ntrp}</div></div></div><div className="text-lg font-bold text-green-700">{p.maxOverlap.toFixed(2)}h</div></div>)}</div></div>}
                  {matches.potential.length>0&&<div className="mb-4"><h4 className="text-sm font-semibold text-yellow-700 mb-2">Potential Matches (1–1.5 hours)</h4><div className="space-y-3">{matches.potential.map(p=><div key={p.id} className="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">{initials(p.name)}</div><div><div className="font-semibold">{p.name}</div><div className="text-xs text-gray-600">NTRP {p.ntrp}</div></div></div><div className="text-lg font-bold text-yellow-700">{p.maxOverlap.toFixed(2)}h</div></div>)}</div></div>}
                </div>
              </div>
            );})()}

            {showBrowseSchedules&&(
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-900 text-lg">Open Sessions</h3><button onClick={()=>setShowBrowseSchedules(false)} className="text-gray-500"><X size={20}/></button></div>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {[{value:'all',label:'All'},{value:'match',label:'Match'},{value:'practice',label:'Practice'},{value:'lesson',label:'Lesson'},{value:'clinic',label:'Clinic'}].map(f=>(
                      <button key={f.value} onClick={()=>setBrowseFilter(f.value)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${browseFilter===f.value?'bg-purple-600 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{f.label}</button>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {getFilteredBrowseWindows().map(w=>{
                      const isJoined=!!joinedSessions[w.id];
                      const overlap=userAvailability.customWindows.map(uw=>calculateOverlap(uw,w)).reduce((mx,c)=>Math.max(mx,c),0);
                      const info=getSlotsInfo(w);
                      const statusLabel=getSessionStatusLabel(w);
                      return(
                        <div key={w.playerId+'-'+w.id} className={`border rounded-lg p-4 ${w.qualified?'border-purple-200 bg-purple-50':'border-gray-200 bg-gray-50'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className={`flex items-center gap-3 ${!w.qualified?'opacity-60':''}`}>
                              <button onClick={e=>{e.stopPropagation();setContactPopup({name:w.playerName,email:w.playerEmail,phone:w.playerPhone||'',y:e.clientY+8,x:e.clientX-80});}} className={`w-10 h-10 bg-gradient-to-br ${w.qualified?'from-purple-400 to-purple-600':'from-gray-300 to-gray-500'} rounded-full flex items-center justify-center text-white text-sm font-semibold hover:opacity-80 cursor-pointer`}>{initials(w.playerName)}</button>
                              <div><div className={`font-semibold text-sm ${w.qualified?'text-gray-900':'text-gray-500 italic'}`}>{w.playerName}</div><div className="text-xs text-gray-500">NTRP {w.playerNtrp}</div></div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!w.qualified&&<span className="text-xs text-gray-400 italic">Outside NTRP range</span>}
                              {w.qualified&&!isJoined&&<button onClick={()=>openJoinModal(w)} className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700">Join</button>}
                              {isJoined&&<span className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium flex items-center gap-1"><Check size={12}/> Joined!</span>}
                            </div>
                          </div>
                          <div className={`text-sm ${!w.qualified?'opacity-60':''}`}>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium mr-2 ${getTypeBadgeColor(w.type)}`}>{w.type==='match'?(w.matchType==='singles'?'Singles':'Doubles'):getTypeLabel(w.type)}</span>
                            <span className={`font-medium ${!w.qualified?'text-gray-500 italic':'text-gray-900'}`}>{w.day}</span>
                            <span className={`ml-2 text-xs ${!w.qualified?'text-gray-400 italic':'text-gray-600'}`}>{formatTime(w.startTime)} – {formatTime(w.endTime)}</span>
                          </div>
                          {(w.ntrpMin||w.ntrpMax)&&<div className={`text-xs mt-1 ${!w.qualified?'text-gray-400 italic':'text-gray-500'}`}>NTRP {w.ntrpMin||'any'} – {w.ntrpMax||'any'}</div>}
                          {info&&w.type!=='lesson'&&<div className={`text-xs mt-1 font-medium ${!w.qualified?'text-gray-400 italic':info.filled?'text-green-600':'text-blue-600'}`}>{info.total}/{info.needed} joined {info.filled?'✓':''}</div>}
                          {w.type==='lesson'&&<div className={`text-xs mt-1 ${!w.qualified?'text-gray-400 italic':'text-purple-600'}`}>w/ {w.lessonInstructor} · {w.lessonSpots} spot{w.lessonSpots!==1?'s':''}</div>}
                          {(w.joinedPlayers||[]).length>0&&<div className="mt-2 flex flex-wrap gap-1">{w.joinedPlayers.map(name=><span key={name} className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-600">{name}</span>)}</div>}
                          {statusLabel&&<div className="mt-1"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusLabel==='Confirmed'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{statusLabel}</span></div>}
                          {overlap>=1.0&&<div className="mt-1"><span className={`text-xs px-2 py-0.5 rounded-full ${overlap>=1.5?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{overlap.toFixed(2)}h overlap</span></div>}
                        </div>
                      );
                    })}
                    {getFilteredBrowseWindows().length===0&&<div className="text-center py-8 text-gray-500">No sessions match this filter.</div>}
                  </div>
                </div>
              </div>
            )}

            {joinModal&&(
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                <div className="bg-white rounded-xl p-6 max-w-sm w-full max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-900">Confirm Join</h3><button onClick={()=>setJoinModal(null)} className="text-gray-500"><X size={20}/></button></div>
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                    <div className="font-medium text-gray-900">{joinModal.playerName}</div>
                    <div className="text-sm text-gray-600">{joinModal.type==='match'?(joinModal.matchType==='singles'?'Singles 🎾':'Doubles 👥'):getTypeLabel(joinModal.type)} · {joinModal.day}</div>
                    <div className="text-xs text-gray-500">Available: {formatTime(joinModal.startTime)} – {formatTime(joinModal.endTime)}</div>
                  </div>
                  {(joinModal.joinedPlayers||[]).length>0&&<div className="mb-4"><div className="text-xs font-semibold text-gray-500 uppercase mb-1">Already signed up</div><div className="flex flex-wrap gap-1">{joinModal.joinedPlayers.map(name=><span key={name} className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">{name}</span>)}</div></div>}
                  {joinModal.type==='match'&&(
                    <>
                      <p className="text-sm text-gray-600 mb-3">Narrow your time window (min 1.5 hrs):</p>
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div><label className="block text-xs font-medium text-gray-600 mb-1">Your Start</label><select value={joinTimeStart} onChange={e=>setJoinTimeStart(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">{TIME_OPTIONS.filter(o=>o.value>=joinModal.startTime&&o.value<=joinModal.endTime).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                        <div><label className="block text-xs font-medium text-gray-600 mb-1">Your End</label><select value={joinTimeEnd} onChange={e=>setJoinTimeEnd(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">{TIME_OPTIONS.filter(o=>o.value>=joinModal.startTime&&o.value<=joinModal.endTime).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                      </div>
                      {(()=>{const dur=timeToMinutes(joinTimeEnd)-timeToMinutes(joinTimeStart);const hrs=Math.floor(dur/60);const mins=dur%60;return dur<90?<p className="text-xs text-red-500 mb-3">Minimum 1.5 hours required</p>:<p className="text-xs text-green-600 mb-3">{hrs}h{mins>0?' '+mins+'m':''} selected</p>;})()}
                    </>
                  )}
                  <button onClick={confirmJoin} className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">Confirm & Notify Players</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════ MY SCHEDULE ══════ */}
        {view==='schedule'&&(
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-sm p-5 text-white">
              <div className="flex items-center justify-between">
                <div><h2 className="text-xl font-bold flex items-center gap-2"><Calendar size={24}/> My Schedule</h2><p className="text-sm opacity-90 mt-1">League matches, open requests & sessions joined</p></div>
                <button onClick={exportICS} className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg text-sm font-medium transition-all"><Download size={16}/> Export .ics</button>
              </div>
            </div>
            {getMyScheduleItems().length===0?(
              <div className="bg-white rounded-xl shadow-sm p-12 text-center"><Calendar size={48} className="mx-auto text-gray-300 mb-3"/><p className="text-gray-500">No upcoming sessions yet.</p><p className="text-sm text-gray-400 mt-1">Respond to this week's poll or browse open requests in Play!</p></div>
            ):(
              <div className="space-y-3">
                {getMyScheduleItems().map((item,idx)=>{
                  const isAlt=item.status==='Alternate';
                  const isOut=item.status==='Not This Week';
                  const isExpanded=expandedScheduleItem===idx;
                  const canExpand=item.type==='league'?item.status==='Selected':true;
                  const weekSelPlayers=item.weekIdx!==undefined?roster.filter(m=>(weekDesignations[item.weekIdx]?.selected||[]).includes(m.id)):[];
                  const participants=getSessionParticipants(item);
                  const sessionInfo=item.sessionId?getSlotsInfo(getAllWindowsForBrowse().find(w=>w.id===item.sessionId)||{}):null;
                  const isFull=sessionInfo?sessionInfo.filled:false;
                  return(
                    <div key={idx} className={`bg-white rounded-xl shadow-sm border-l-4 relative overflow-hidden ${isOut?'border-red-400 opacity-60':isAlt?'border-yellow-400':item.type==='league'?'border-blue-500':item.type==='match'?'border-green-500':item.type==='practice'?'border-blue-400':item.type==='lesson'?'border-purple-500':item.type==='clinic'?'border-orange-500':'border-gray-300'}`}>
                      {isOut&&<div className="absolute inset-0 flex items-center justify-center pointer-events-none"><X size={64} className="text-red-300 opacity-60"/></div>}
                      <button className={`w-full text-left p-4 ${canExpand?'cursor-pointer':'cursor-default'}`} onClick={()=>canExpand&&setExpandedScheduleItem(isExpanded?null:idx)}>
                        <div className={isAlt?'italic':''}>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeBadgeColor(item.type==='league'?'match':item.type)}`}>{item.type==='league'?'League':getTypeLabel(item.type)}</span>
                            {item.status&&<span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.status==='Selected'?'bg-green-100 text-green-700':item.status==='Alternate'?'bg-yellow-100 text-yellow-700':item.status==='Not This Week'?'bg-red-100 text-red-600':item.status==='Confirmed'||item.status==='Joined'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{item.status}</span>}
                            {item.info&&item.type!=='lesson'&&item.type!=='clinic'&&<span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.info.filled?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{item.info.filled?'Confirmed':'Pending'} {item.info.total}/{item.info.needed}</span>}
                          </div>
                          <div className={`font-semibold ${isAlt?'text-gray-500':isOut?'text-gray-400 line-through':'text-gray-900'}`}>{item.label}</div>
                          {item.detail&&<div className={`text-sm font-medium ${isAlt?'text-orange-400 italic':'text-orange-600'}`}>{item.detail}</div>}
                          <div className={`text-sm mt-0.5 ${isAlt?'text-gray-400 italic':'text-gray-500'}`}>
                            {item.date?formatShortDate(item.date)+' · ':''}{item.day}{item.startTime?' · '+formatTime(item.startTime)+' – '+formatTime(item.endTime):''}
                          </div>
                          {item.address&&<a href={mapsLink({street:item.address,city:'',state:'',zip:''})} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className={`text-xs mt-0.5 flex items-center gap-1 underline underline-offset-1 ${isAlt?'text-gray-400 italic':'text-blue-500'}`}><MapPin size={11}/>{item.address}</a>}
                          {canExpand&&<div className={`text-xs mt-1 ${isAlt?'text-gray-400':'text-indigo-400'}`}>{isExpanded ? '▲ Hide' : '▼ Who’s in'}</div>}
                        </div>
                      </button>

                      {/* Contact + Withdraw row */}
                      <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
                        {participants.length>0&&(
                          <>
                            <button onClick={()=>window.location.href='mailto:'+participants.map(p=>p.email).join(',')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100"><Mail size={12}/> Email Group</button>
                            <button onClick={()=>{if(participants.length===1){window.location.href='sms:+1'+participants[0].phone.replace(/\D/g,'');}else{setSmsModal({numbers:participants.map(p=>p.phone.replace(/\D/g,'')),names:participants.map(p=>p.name)});}}} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100"><MessageSquare size={12}/> Text Group</button>
                          </>
                        )}
                        {item.sessionId&&(
                          <button onClick={()=>handleWithdraw(item.sessionId,item.label,participants,isFull)} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100"><LogOut size={12}/> Withdraw</button>
                        )}
                        {item.type==='lesson'&&item.sessionId&&<button onClick={()=>handleWithdraw(item.sessionId,item.label,[],false)} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100"><LogOut size={12}/> Withdraw</button>}
                        {item.type==='clinic'&&item.sessionId&&<button onClick={()=>handleWithdraw(item.sessionId,item.label,[],false)} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100"><LogOut size={12}/> Withdraw</button>}
                      </div>

                      {isExpanded&&canExpand&&(
                        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                          {item.type==='league'&&(weekSelPlayers.length===0?<p className="text-xs text-gray-400">No players selected yet.</p>:<div><div className="text-xs font-semibold text-gray-500 uppercase mb-2">Selected Players</div><div className="flex flex-wrap gap-2">{weekSelPlayers.map(p=><div key={p.id} className="flex items-center gap-1 bg-green-50 border border-green-200 px-2 py-1 rounded-full"><div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{initials(p.name)}</div><span className="text-xs text-green-800 font-medium">{p.name}</span></div>)}</div></div>)}
                          {item.type!=='league'&&((item.joinedPlayers||[]).length===0?<p className="text-xs text-gray-400">No one else signed up yet.</p>:<div><div className="text-xs font-semibold text-gray-500 uppercase mb-2">Signed Up</div><div className="flex flex-wrap gap-2">{item.joinedPlayers.map(name=><span key={name} className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">{name}</span>)}</div></div>)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════ ADMIN ══════ */}
        {view==='admin'&&(
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-sm p-5 text-white"><h2 className="text-xl font-bold mb-1">Team Captain Dashboard</h2><p className="text-sm opacity-90">Manage team roster, responses, and match details</p></div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <button onClick={()=>setSelectedWeek(Math.max(0,selectedWeek-1))} disabled={selectedWeek===0} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={20}/></button>
                <div className="text-center"><div className="text-sm font-semibold text-gray-900">{weekLabel(selectedWeek)}</div><div className="text-base font-bold text-blue-600">{formatSaturdayDate(currentSaturday)}</div>{currentDetails.subtitle&&<div className="text-sm text-orange-600 font-medium">{currentDetails.subtitle}</div>}</div>
                <button onClick={()=>setSelectedWeek(Math.min(NUM_WEEKS-1,selectedWeek+1))} disabled={selectedWeek===NUM_WEEKS-1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={20}/></button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-900">Match Details</h3>{!editingDetails?<button onClick={startEditingDetails} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">Edit</button>:<div className="flex gap-2"><button onClick={()=>setEditingDetails(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">Cancel</button><button onClick={saveDetails} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">Save</button></div>}</div>
              {!editingDetails?(
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"><Bell size={18} className="text-orange-500 mt-0.5 shrink-0"/><div><div className="text-xs text-gray-500 font-medium uppercase">Subtitle</div><div className="text-sm text-gray-900">{currentDetails.subtitle||'Not set'}</div></div></div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"><MapPin size={18} className="text-orange-500 mt-0.5 shrink-0"/><div><div className="text-xs text-gray-500 font-medium uppercase">Location</div>{formatAddress(currentDetails)?<a href={mapsLink(currentDetails)} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline hover:text-blue-800">{formatAddress(currentDetails)}</a>:<div className="text-sm text-gray-900">Not set</div>}</div></div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"><Clock size={18} className="text-orange-500 mt-0.5 shrink-0"/><div><div className="text-xs text-gray-500 font-medium uppercase">Match Time</div><div className="text-sm text-gray-900">{currentDetails.startTime?formatTime(currentDetails.startTime)+' – '+formatTime(currentDetails.endTime):'Not set'}</div></div></div>
                </div>
              ):draftDetails&&(
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label><input type="text" value={draftDetails.subtitle} onChange={e=>setDraftDetails({...draftDetails,subtitle:e.target.value})} placeholder="e.g. Home vs Carmel Valley" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><AddressAutocomplete value={draftDetails.street} onChange={(field,val)=>setDraftDetails(prev=>({...prev,[field]:val}))} placeholder="Search for venue or type address…"/></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Match Start</label><select value={draftDetails.startTime} onChange={e=>setDraftDetails({...draftDetails,startTime:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">{TIME_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Match End</label><select value={draftDetails.endTime} onChange={e=>setDraftDetails({...draftDetails,endTime:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">{TIME_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Responses for {formatSaturdayDate(currentSaturday)}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center"><div className="text-2xl font-bold text-green-700">{rosterCounts.yes}</div><div className="text-xs text-green-600">Yes</div></div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center"><div className="text-2xl font-bold text-yellow-700">{rosterCounts.maybe}</div><div className="text-xs text-yellow-600">Maybe</div></div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center"><div className="text-2xl font-bold text-blue-700">{rosterCounts.ifNeeded}</div><div className="text-xs text-blue-600">If Needed</div></div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center"><div className="text-2xl font-bold text-red-700">{rosterCounts.no}</div><div className="text-xs text-red-600">No</div></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-4">
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Contact Method</label><div className="flex gap-2"><button onClick={()=>setQuickActionMethod('email')} className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium ${quickActionMethod==='email'?'border-orange-500 bg-orange-50 text-orange-700':'border-gray-200 text-gray-600'}`}>Email</button><button onClick={()=>setQuickActionMethod('text')} className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium ${quickActionMethod==='text'?'border-orange-500 bg-orange-50 text-orange-700':'border-gray-200 text-gray-600'}`}>Text (iPhone)</button></div></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Send To</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[{value:'yes',label:'Yes',count:rosterCounts.yes},{value:'maybe',label:'Maybe',count:rosterCounts.maybe},{value:'ifNeeded',label:'If Needed',count:rosterCounts.ifNeeded},{value:'no',label:'No',count:rosterCounts.no},{value:'noResponse',label:'No Reply',count:rosterCounts.noResponse},{value:'selected',label:'Selected',count:currentDesignations.selected.length},{value:'alternates',label:'Alternates',count:currentDesignations.alternates.length},{value:'available',label:'Available',count:weekRoster.filter(m=>m.response==='yes'||m.response==='ifNeeded').length}].map(opt=>(
                      <button key={opt.value} onClick={()=>toggleQuickActionFilter(opt.value)} className={`py-2 px-1 rounded-lg border-2 text-center ${quickActionFilters.includes(opt.value)?'border-orange-500 bg-orange-50':'border-gray-200'}`}>
                        <div className={`text-base font-bold ${quickActionFilters.includes(opt.value)?'text-orange-700':'text-gray-700'}`}>{opt.count}</div>
                        <div className={`text-xs font-medium ${quickActionFilters.includes(opt.value)?'text-orange-600':'text-gray-500'}`}>{opt.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={fireQuickAction} disabled={quickActionFilters.length===0} className="w-full py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {quickActionMethod==='email'?'📧':'📱'} {quickActionMethod==='email'?'Open Email':'Open Messages'} to {getFilteredRoster().length} member{getFilteredRoster().length!==1?'s':''}
                </button>
              </div>
            </div>

            {/* Roster Management */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">Team Roster</h3>
                  <div className="flex gap-1">
                    <button onClick={()=>setRosterFilter('all')} className={`px-3 py-1 rounded-lg text-xs font-medium ${rosterFilter==='all'?'bg-orange-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
                    <button onClick={()=>setRosterFilter('available')} className={`px-3 py-1 rounded-lg text-xs font-medium ${rosterFilter==='available'?'bg-green-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Available</button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>setPlayerEditModal('new')} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-1"><Plus size={14}/> Add Player</button>
                  <button onClick={()=>{const rows=[['Name','NTRP','Response','Response Time','Phone','Email','Status']];getDisplayRoster().forEach(m=>{const status=currentDesignations.selected.includes(m.id)?'Selected':currentDesignations.alternates.includes(m.id)?'Alternate':(currentDesignations.notThisWeek||[]).includes(m.id)?'Not This Week':'';rows.push([m.name,m.ntrp,m.response||'Pending',formatResponseTime(m.responseTime),m.phone,m.email,status]);});const blob=new Blob([rows.map(r=>r.map(v=>'"'+v+'"').join(',')).join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='roster-week'+selectedWeek+'.csv';a.click();}} className="px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">Export CSV</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-28">Flags</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase"><SortBtn col="name" label="Name"/></th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase"><SortBtn col="ntrp" label="NTRP"/></th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase"><SortBtn col="response" label="Response"/></th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase"><SortBtn col="responseTime" label="Resp. Time"/></th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getDisplayRoster().map(member=>{
                      const isSel=currentDesignations.selected.includes(member.id);
                      const isAlt=currentDesignations.alternates.includes(member.id);
                      const isOut=(currentDesignations.notThisWeek||[]).includes(member.id);
                      const eligible=canDesignate(member);
                      return(
                        <tr key={member.id} className={`hover:bg-gray-50 ${member.id===0?'bg-blue-50':''}`}>
                          <td className="px-3 py-3">{eligible?<div className="flex gap-1"><button onClick={()=>setDesignation(member.id,'selected')} title="Selected" className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center ${isSel?'bg-green-600 text-white shadow-sm':'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>✓</button><button onClick={()=>setDesignation(member.id,'alternates')} title="Alternate" className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center ${isAlt?'bg-yellow-500 text-white shadow-sm':'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>?</button><button onClick={()=>setDesignation(member.id,'notThisWeek')} title="Not This Week" className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center ${isOut?'bg-red-500 text-white shadow-sm':'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>✕</button></div>:<span className="text-xs text-gray-300 pl-2">—</span>}</td>
                          <td className="px-3 py-3"><div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${member.id===0?'bg-blue-500':'bg-gradient-to-br from-orange-400 to-orange-600'}`}>{initials(member.name)}</div><div><span className="font-medium text-gray-900 text-sm">{member.name}</span>{member.isPro&&<span className="ml-1 text-xs bg-purple-100 text-purple-700 px-1 py-0.5 rounded">PRO</span>}{member.isAdmin&&<span className="ml-1 text-xs bg-orange-100 text-orange-700 px-1 py-0.5 rounded">Admin</span>}</div></div></td>
                          <td className="px-3 py-3 text-sm font-semibold text-gray-700">{member.ntrp}</td>
                          <td className="px-3 py-3">{member.response==='yes'&&<span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Yes</span>}{member.response==='maybe'&&<span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Maybe</span>}{member.response==='ifNeeded'&&<span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">If Needed</span>}{member.response==='no'&&<span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">No</span>}{!member.response&&<span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Pending</span>}</td>
                          <td className="px-3 py-3"><a href={'tel:+1'+member.phone.replace(/\D/g,'')} className="text-xs text-gray-700 hover:text-blue-600 whitespace-nowrap">{member.phone}</a></td>
                          <td className="px-3 py-3"><a href={'mailto:'+member.email} className="text-xs text-blue-600 hover:underline">{member.email}</a></td>
                          <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{formatResponseTime(member.responseTime)}</td>
                          <td className="px-3 py-3"><button onClick={()=>setPlayerEditModal(member)} className="text-orange-400 hover:text-orange-600"><Edit2 size={16}/></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
