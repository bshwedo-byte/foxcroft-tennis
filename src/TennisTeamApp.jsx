import React, { useState, useRef, useEffect } from 'react';
import { Bell, Users, TrendingUp, Clock, Check, X, HelpCircle, ChevronLeft, ChevronRight, Search, MapPin, Calendar, ArrowUpDown, Download, Mail, MessageSquare, Edit2, Plus, Trash2, LogOut } from 'lucide-react';
import { useTeamData } from './hooks/useTeamData';

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
function generateTimeOptions(){const o=[];for(let h=6;h<=22;h++){for(let m of[0,15,30,45]){if(h===22&&m>30)break;const hh=h>12?h-12:h===0?12:h;const ap=h<12?'AM':'PM';const mm=m.toString().padStart(2,'0');o.push({value:`${h.toString().padStart(2,'0')}:${mm}`,label:`${hh}:${mm} ${ap}`});}}return o;}
const TIME_OPTIONS=generateTimeOptions();
const SATURDAYS=getUpcomingSaturdays(NUM_WEEKS);

// Convert a JS Date to a YYYY-MM-DD string for DB week_start keys
function toDateStr(d){return d.toISOString().split('T')[0];}

function mapsLink(d){const a=[d.street,d.city,d.state,d.zip].filter(Boolean).join(', ');if(!a)return null;return `https://maps.apple.com/?q=${encodeURIComponent(a)}`;}
function initials(name){if(!name)return '?';return name.split(' ').map(n=>n[0]).join('');}
function formatTime(t){const o=TIME_OPTIONS.find(o=>o.value===t);return o?o.label:t;}
function formatAddress(d){if(!d)return '';return[d.street,d.city,d.state,d.zip].filter(Boolean).join(', ');}
function formatResponseTime(ts){if(!ts)return '—';return new Date(ts).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});}
function getTypeBadgeColor(type){return({practice:'bg-blue-100 text-blue-700',lesson:'bg-purple-100 text-purple-700',clinic:'bg-orange-100 text-orange-700',match:'bg-green-100 text-green-700'})[type]||'bg-green-100 text-green-700';}
function getTypeLabel(type){return({match:'Match',practice:'Practice',lesson:'Lesson',clinic:'Clinic'})[type]||type;}
function timeToMinutes(t){if(!t)return 0;const[h,m]=t.split(':').map(Number);return h*60+m;}

function generateICS(items){
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//TennisTeamApp//EN','CALSCALE:GREGORIAN'];
  items.forEach((item,idx)=>{
    if(!item.date&&!item.day)return;
    const now=new Date();
    let start,end;
    if(item.date){
      const d=new Date(item.date);
      if(item.start_time){const[h,m]=item.start_time.split(':');d.setHours(parseInt(h),parseInt(m),0);}
      start=new Date(d);end=new Date(d);
      if(item.end_time){const[h,m]=item.end_time.split(':');end.setHours(parseInt(h),parseInt(m),0);}
      else{end.setHours(end.getHours()+2);}
    } else {
      const dayIdx=DAY_ORDER.indexOf(item.day);
      const today=new Date();const diff=(dayIdx-today.getDay()+7)%7||7;
      start=new Date(today);start.setDate(today.getDate()+diff);
      if(item.start_time){const[h,m]=item.start_time.split(':');start.setHours(parseInt(h),parseInt(m),0);}
      end=new Date(start);
      if(item.end_time){const[h,m]=item.end_time.split(':');end.setHours(parseInt(h),parseInt(m),0);}
      else{end.setHours(end.getHours()+2);}
    }
    const fmt=d=>`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}00`;
    lines.push('BEGIN:VEVENT',`UID:tennis-${idx}-${now.getTime()}@foxcrofthills`,`DTSTAMP:${fmt(now)}`,`DTSTART:${fmt(start)}`,`DTEND:${fmt(end)}`,`SUMMARY:${item.label}${item.detail?' - '+item.detail:''}`,item.address?`LOCATION:${item.address}`:'','END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.filter(l=>l!=='').join('\r\n');
}

function AddressAutocomplete({value, onChange, placeholder}) {
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const debRef = useRef(null);

  const search = async (q) => {
    if (q.length < 3) { setSuggestions([]); return; }
    setLoading(true);
    try {
      // Use Nominatim with a broader search area for Charlotte NC region
      const params = new URLSearchParams({
        format: 'json', q, limit: '8', countrycodes: 'us',
        addressdetails: '1', dedupe: '1',
        viewbox: '-81.5,35.6,-80.4,34.8', bounded: '0'
      });
      const r = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'FoxcroftTennisApp/1.0' }
      });
      const results = await r.json();

      // Also try with "Charlotte NC" appended if query doesn't mention a city
      const hasCityHint = /charlotte|nc|matthews|huntersville|concord|kannapolis/i.test(q);
      let extra = [];
      if (!hasCityHint && results.length < 3) {
        const params2 = new URLSearchParams({
          format: 'json', q: q + ' Charlotte NC', limit: '5', countrycodes: 'us',
          addressdetails: '1', dedupe: '1'
        });
        const r2 = await fetch(`https://nominatim.openstreetmap.org/search?${params2}`, {
          headers: { 'Accept-Language': 'en', 'User-Agent': 'FoxcroftTennisApp/1.0' }
        });
        extra = await r2.json();
      }

      // Merge and dedupe by place_id
      const seen = new Set();
      const merged = [...results, ...extra].filter(s => {
        if (!s.address || seen.has(s.place_id)) return false;
        seen.add(s.place_id);
        return true;
      });

      // Sort: prefer results with house numbers
      merged.sort((a, b) => {
        const aHas = !!(a.address?.house_number || a.address?.street_number);
        const bHas = !!(b.address?.house_number || b.address?.street_number);
        return bHas - aHas;
      });

      setSuggestions(merged);
    } catch(e) { setSuggestions([]); }
    setLoading(false);
  };

  const sel = (s) => {
    const a = s.address || {};
    const num = a.house_number || a.street_number || '';
    const road = a.road || a.street || a.pedestrian || a.path || '';
    // If no house number, try to extract from display_name (e.g. "8601 Bain Rd, ...")
    let street;
    if (num && road) {
      street = `${num} ${road}`;
    } else {
      // Try extracting "number name" pattern from the first part of display_name
      const firstPart = s.display_name.split(',')[0].trim();
      street = firstPart;
    }
    onChange('street', street);
    onChange('city', a.city || a.town || a.village || a.suburb || a.county || 'Charlotte');
    onChange('state', a.state || 'NC');
    onChange('zip', a.postcode || '');
    setShow(false);
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <input
        type="text" value={value}
        onChange={e => { onChange('street', e.target.value); setShow(true); clearTimeout(debRef.current); debRef.current = setTimeout(() => search(e.target.value), 400); }}
        onFocus={() => suggestions.length > 0 && setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        placeholder={placeholder || 'Search address...'}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
      />
      {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">...</div>}
      {show && suggestions.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-56 overflow-y-auto">
          {suggestions.map((s, i) => {
            const a = s.address || {};
            const num = a.house_number || a.street_number || '';
            const road = a.road || a.street || a.pedestrian || '';
            const firstLine = num && road ? `${num} ${road}` : s.display_name.split(',')[0];
            const city = a.city || a.town || a.village || a.suburb || '';
            const state = a.state || '';
            const zip = a.postcode || '';
            const secondLine = [city, state, zip].filter(Boolean).join(', ');
            return (
              <button key={i} onMouseDown={e => { e.preventDefault(); sel(s); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-gray-900 font-medium">{firstLine}</div>
                    {secondLine && <div className="text-gray-500 text-xs">{secondLine}</div>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Toast({toasts}){return(<div className="fixed top-4 right-4 z-[100] space-y-2 max-w-xs">{toasts.map(t=><div key={t.id} className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg text-sm flex items-start gap-2"><span className="text-lg">🔔</span><span>{t.message}</span></div>)}</div>);}

function ProfileModal({user,onSave,onClose}){
  const[form,setForm]=useState({name:user.name||'',email:user.email||'',phone:user.phone||'',ntrp:user.ntrp||'3.5',password:'',passwordConfirm:''});
  const[error,setError]=useState('');const[saving,setSaving]=useState(false);
  const save=async()=>{
    if(!form.name.trim()){setError('Name is required.');return;}
    if(form.password&&form.password!==form.passwordConfirm){setError('Passwords do not match.');return;}
    setSaving(true);
    await onSave({name:form.name,email:form.email,phone:form.phone,ntrp:form.ntrp},form.password||null);
    setSaving(false);
  };
  return(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5"><h3 className="font-bold text-gray-900 text-lg">Edit Profile</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button></div>
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
          <button onClick={save} disabled={saving} className="w-full py-3 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50">{saving?'Saving...':'Save Changes'}</button>
        </div>
      </div>

      {/* ══════ DELETE PLAYER MODAL ══════ */}
      {deletePlayerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Remove Player</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to remove <span className="font-semibold">{deletePlayerModal.name}</span> from the roster?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletePlayerModal(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium">Cancel</button>
              <button onClick={async () => {
                const pid = deletePlayerModal.id;
                setDeletePlayerModal(null);
                const { error } = await deletePlayer(pid);
                if (error) alert('Error removing player: ' + error.message);
              }} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerEditModal({player,onSave,onClose,isNew}){
  const[form,setForm]=useState(player?{...player,phone:player.phone||'',ntrp:player.ntrp||'3.5'}:{name:'',email:'',phone:'',ntrp:'3.5',is_pro:false,is_admin:false});
  const[error,setError]=useState('');const[saving,setSaving]=useState(false);
  const save=async()=>{if(!form.name.trim()){setError('Name is required.');return;}if(!form.email.trim()){setError('Email is required.');return;}setSaving(true);await onSave(form);setSaving(false);};
  return(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5"><h3 className="font-bold text-gray-900 text-lg">{isNew?'Add Player':'Edit Player'}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button></div>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">NTRP Rating</label><select value={form.ntrp} onChange={e=>setForm({...form,ntrp:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">{SKILL_LEVELS.map(l=><option key={l} value={l}>{l}</option>)}</select></div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!!form.is_pro} onChange={e=>setForm({...form,is_pro:e.target.checked})} className="w-4 h-4"/><span className="text-sm font-medium text-gray-700">PRO / Instructor</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!!form.is_admin} onChange={e=>setForm({...form,is_admin:e.target.checked})} className="w-4 h-4"/><span className="text-sm font-medium text-gray-700">Admin</span></label>
          </div>
          {error&&<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
          <button onClick={save} disabled={saving} className="w-full py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50">{saving?'Saving...':isNew?'Add Player':'Save Changes'}</button>
        </div>
      </div>

      {/* ══════ DELETE PLAYER MODAL ══════ */}
      {deletePlayerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Remove Player</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to remove <span className="font-semibold">{deletePlayerModal.name}</span> from the roster?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletePlayerModal(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium">Cancel</button>
              <button onClick={async () => {
                const pid = deletePlayerModal.id;
                setDeletePlayerModal(null);
                const { error } = await deletePlayer(pid);
                if (error) alert('Error removing player: ' + error.message);
              }} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WindowFormModal({window:win,onSave,onClose,currentUser}){
  const getDefaultDate=()=>{const t=new Date();const d=t.getDay();const diff=d===6?0:(6-d);const sat=new Date(t);sat.setDate(t.getDate()+diff);return sat.toISOString().split('T')[0];};
  const[form,setForm]=useState(win?{...win,session_date:win.session_date||getDefaultDate(),start_time:win.start_time||'',end_time:win.end_time||''}:{session_date:getDefaultDate(),start_time:'',end_time:'',type:'match',match_type:'singles',ntrp_min:'',ntrp_max:'',practice_spots:2,lesson_instructor:'',lesson_spots:1,clinic_title:'',clinic_instructor:'',clinic_spots:4});
  const save=()=>{if(!form.session_date||!form.start_time||!form.end_time){alert('Please fill in date and times.');return;}if(timeToMinutes(form.end_time)<=timeToMinutes(form.start_time)){alert('End time must be after start time.');return;}onSave(form);};
  return(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-900">{win?'Edit Window':'Add Availability Window'}</h3><button onClick={onClose} className="text-gray-500"><X size={20}/></button></div>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
            <div className="grid grid-cols-4 gap-2">
              {[{value:'match',label:'Match',icon:'🎾'},{value:'practice',label:'Practice',icon:'🏃'},{value:'lesson',label:'Lesson',icon:'📚'},{value:'clinic',label:'Clinic',icon:'🏫',pro:true}].map(t=>(
                <button key={t.value} onClick={()=>setForm({...form,type:t.value})} disabled={t.pro&&!currentUser.is_pro} className={`py-3 rounded-lg border-2 text-center transition-all ${form.type===t.value?'border-blue-500 bg-blue-50':'border-gray-200'} ${t.pro&&!currentUser.is_pro?'opacity-40 cursor-not-allowed':''}`}>
                  <div className="text-xl mb-1">{t.icon}</div>
                  <div className={`text-xs font-semibold ${form.type===t.value?'text-blue-700':'text-gray-700'}`}>{t.label}</div>
                  {t.pro&&<div className="text-xs text-purple-500">PRO</div>}
                </button>
              ))}
            </div>
          </div>
          {form.type==='match'&&<div><label className="block text-sm font-medium text-gray-700 mb-1">Match Format</label><div className="flex gap-2">{[{v:'singles',l:'Singles'},{v:'doubles',l:'Doubles'}].map(({v,l})=><button key={v} onClick={()=>setForm({...form,match_type:v})} className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold ${form.match_type===v?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200 text-gray-700'}`}>{l}</button>)}</div></div>}
          {form.type==='practice'&&<div><label className="block text-sm font-medium text-gray-700 mb-1">Players needed</label><div className="flex gap-2">{[1,2,3,4,5,6].map(n=><button key={n} onClick={()=>setForm({...form,practice_spots:n})} className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold ${form.practice_spots===n?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200 text-gray-700'}`}>{n}</button>)}</div></div>}
          {form.type==='lesson'&&<><div><label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label><input type="text" value={form.lesson_instructor} onChange={e=>setForm({...form,lesson_instructor:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Spots</label><div className="flex gap-2">{[1,2,3,4,5,6].map(n=><button key={n} onClick={()=>setForm({...form,lesson_spots:n})} className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold ${form.lesson_spots===n?'border-purple-500 bg-purple-50 text-purple-700':'border-gray-200 text-gray-700'}`}>{n}</button>)}</div></div></>}
          {form.type==='clinic'&&<><div><label className="block text-sm font-medium text-gray-700 mb-1">Clinic Title</label><input type="text" value={form.clinic_title} onChange={e=>setForm({...form,clinic_title:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label><input type="text" value={form.clinic_instructor} onChange={e=>setForm({...form,clinic_instructor:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Total spots</label><div className="flex gap-2">{[4,6,8,10,12].map(n=><button key={n} onClick={()=>setForm({...form,clinic_spots:n})} className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold ${form.clinic_spots===n?'border-orange-500 bg-orange-50 text-orange-700':'border-gray-200 text-gray-700'}`}>{n}</button>)}</div></div></>}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" value={form.session_date||''} onChange={e=>setForm({...form,session_date:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"/></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label><select value={form.start_time} onChange={e=>setForm({...form,start_time:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="">Select start time</option>{TIME_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">End Time</label><select value={form.end_time} onChange={e=>setForm({...form,end_time:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="">Select end time</option>{TIME_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">NTRP Range (optional)</label><div className="flex gap-3 items-center"><div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Min</label><select value={form.ntrp_min} onChange={e=>setForm({...form,ntrp_min:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="">Any</option>{SKILL_LEVELS.map(l=><option key={l} value={l}>{l}</option>)}</select></div><div className="text-gray-400 mt-4">—</div><div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Max</label><select value={form.ntrp_max} onChange={e=>setForm({...form,ntrp_max:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="">Any</option>{SKILL_LEVELS.map(l=><option key={l} value={l}>{l}</option>)}</select></div></div></div>
          <button onClick={save} className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{win?'Save Changes':'Add Window'}</button>
        </div>
      </div>

      {/* ══════ DELETE PLAYER MODAL ══════ */}
      {deletePlayerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Remove Player</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to remove <span className="font-semibold">{deletePlayerModal.name}</span> from the roster?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletePlayerModal(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium">Cancel</button>
              <button onClick={async () => {
                const pid = deletePlayerModal.id;
                setDeletePlayerModal(null);
                const { error } = await deletePlayer(pid);
                if (error) alert('Error removing player: ' + error.message);
              }} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TennisTeamApp({ session, onSignOut }) {
  const db = useTeamData(session);
  const {
    players, responses, designations, weekDetails,
    myWindows, allWindows, joins,
    userId, loading,
    updatePlayer, insertPlayer, deletePlayer,
    upsertResponse, upsertDesignation, upsertWeekDetail,
    saveWindow, deleteWindow, joinSession, leaveSession,
  } = db;

  const currentUser = players.find(p => p.id === userId) || { name: session?.user?.email || 'You', ntrp: '—', is_pro: false, is_admin: false };

  const [view, setView] = useState('respond');
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [weather, setWeather] = useState({});
  const [expandedScheduleItem, setExpandedScheduleItem] = useState(null);
  const [contactPopup, setContactPopup] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [smsModal, setSmsModal] = useState(null);
  const [withdrawModal, setWithdrawModal] = useState(null);
  const [removeResponseModal, setRemoveResponseModal] = useState(false);
  const [editWindowModal, setEditWindowModal] = useState(null);
  const [playerEditModal, setPlayerEditModal] = useState(null);
  const [showMatchFinder, setShowMatchFinder] = useState(false);
  const [showBrowseSchedules, setShowBrowseSchedules] = useState(false);
  const [browseFilter, setBrowseFilter] = useState('all');
  const [joinModal, setJoinModal] = useState(null);
  const [joinTimeStart, setJoinTimeStart] = useState('');
  const [joinTimeEnd, setJoinTimeEnd] = useState('');
  const [editingDetails, setEditingDetails] = useState(false);
  const [draftDetails, setDraftDetails] = useState(null);
  const [quickActionMethod, setQuickActionMethod] = useState('email');
  const [quickActionFilters, setQuickActionFilters] = useState(['yes']);
  const [rosterFilter, setRosterFilter] = useState('all');
  const [deletePlayerModal, setDeletePlayerModal] = useState(null);
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const showToast = (message) => { const id = Date.now(); setToasts(prev => [...prev, { id, message }]); setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000); };

  // Derived: current week's date string for DB lookups
  const currentSaturday = SATURDAYS[selectedWeek];
  const weekStart = toDateStr(currentSaturday);

  // Get week detail for selected week
  const currentDetails = weekDetails.find(d => d.week_start === weekStart) || { subtitle: '', street: '', city: '', state: '', zip: '', start_time: '08:00', end_time: '10:30' };

  // Get designations for selected week
  const weekDesig = designations.filter(d => d.week_start === weekStart);
  const selectedIds = weekDesig.filter(d => d.designation === 'selected').map(d => d.player_id);
  const alternateIds = weekDesig.filter(d => d.designation === 'alternate').map(d => d.player_id);
  const notThisWeekIds = weekDesig.filter(d => d.designation === 'notThisWeek').map(d => d.player_id);

  // Build week roster with responses
  const weekRoster = players.map(p => {
    const resp = responses.find(r => r.player_id === p.id && r.week_start === weekStart);
    return { ...p, response: resp?.response || null, responseTime: resp?.responded_at || null };
  });

  const rosterCounts = weekRoster.reduce((acc, m) => {
    if (m.response) acc[m.response] = (acc[m.response] || 0) + 1;
    else acc.noResponse = (acc.noResponse || 0) + 1;
    return acc;
  }, { yes: 0, maybe: 0, ifNeeded: 0, no: 0, noResponse: 0 });

  const myResponse = responses.find(r => r.player_id === userId && r.week_start === weekStart)?.response || null;
  console.log('[app] responses count:', responses.length, 'weekStart:', weekStart, 'myResponse:', myResponse, 'counts:', JSON.stringify(rosterCounts), 'rows:', JSON.stringify(responses.map(r=>({pid:r.player_id?.slice(-4), ws:r.week_start, resp:r.response}))));

  // Weather
  const fetchWeather = async (weekIdx) => {
    if (weather[weekIdx] !== undefined) return;
    const sat = SATURDAYS[weekIdx];
    const diffDays = Math.round((sat - new Date()) / 86400000);
    if (diffDays > 15) { setWeather(prev => ({ ...prev, [weekIdx]: null })); return; }
    try {
      const dateStr = sat.toISOString().split('T')[0];
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${CHARLOTTE_LAT}&longitude=${CHARLOTTE_LON}&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&timezone=America%2FNew_York&start_date=${dateStr}&end_date=${dateStr}`;
      const res = await fetch(url); const data = await res.json();
      if (data.daily) { const code = data.daily.weathercode[0]; setWeather(prev => ({ ...prev, [weekIdx]: { hi: Math.round(data.daily.temperature_2m_max[0]), lo: Math.round(data.daily.temperature_2m_min[0]), icon: WMO_ICONS[code] || '🌡️', label: WMO_LABELS[code] || '' } })); }
    } catch (e) { setWeather(prev => ({ ...prev, [weekIdx]: null })); }
  };
  useEffect(() => { fetchWeather(0); }, []);
  useEffect(() => { if (view === 'respond') fetchWeather(selectedWeek); }, [selectedWeek, view]);

  // Response handlers
  const handleResponse = (response) => {
    if (myResponse === response) { setRemoveResponseModal(true); return; }
    upsertResponse(weekStart, response);
  };
  const confirmRemoveResponse = () => { upsertResponse(weekStart, null); setRemoveResponseModal(false); };

  // NTRP qualification check
  const checkQualified = (w) => {
    const u = parseFloat(currentUser.ntrp);
    if (w.ntrp_min && u < parseFloat(w.ntrp_min)) return false;
    if (w.ntrp_max && u > parseFloat(w.ntrp_max)) return false;
    return true;
  };

  // Slots info — host counts as 1
  const getSlotsInfo = (w) => {
    const windowJoins = joins.filter(j => j.window_id === w.id);
    const total = 1 + windowJoins.length; // 1 = host
    if (w.type === 'match') { const needed = w.match_type === 'singles' ? 2 : 4; return { total, needed, filled: total >= needed }; }
    if (w.type === 'practice') return { total, needed: (w.practice_spots || 2) + 1, filled: total >= (w.practice_spots || 2) + 1 };
    if (w.type === 'clinic') return { total, needed: w.clinic_spots || 8, filled: total >= (w.clinic_spots || 8) };
    if (w.type === 'lesson') return { total, needed: (w.lesson_spots || 1) + 1, filled: total >= (w.lesson_spots || 1) + 1 };
    return null;
  };

  // All windows for browse (other players)
  const getAllWindowsForBrowse = () => {
    return allWindows.map(w => ({ ...w, playerName: w.player?.name || 'Unknown', playerNtrp: w.player?.ntrp || '—', playerEmail: w.player?.email, playerPhone: w.player?.phone, qualified: checkQualified(w) }))
      .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) || timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
  };
  const getFilteredBrowseWindows = () => { let w = getAllWindowsForBrowse(); if (browseFilter !== 'all') w = w.filter(x => x.type === browseFilter); return w; };

  const calculateOverlap = (w1, w2) => {
    const d1 = w1.session_date || w1.day; const d2 = w2.session_date || w2.day; if (d1 !== d2) return 0;
    const s = Math.max(timeToMinutes(w1.start_time), timeToMinutes(w2.start_time));
    const e = Math.min(timeToMinutes(w1.end_time), timeToMinutes(w2.end_time));
    return Math.max(0, (e - s) / 60);
  };

  const findMatches = () => {
    const matches = { strong: [], potential: [] };
    allWindows.forEach(w => {
      let mx = 0;
      myWindows.forEach(mw => { mx = Math.max(mx, calculateOverlap(mw, w)); });
      const player = players.find(p => p.id === w.player_id);
      if (!player) return;
      if (mx >= 1.5) matches.strong.push({ ...player, maxOverlap: mx });
      else if (mx >= 1.0) matches.potential.push({ ...player, maxOverlap: mx });
    });
    return matches;
  };

  const openJoinModal = (w) => { setJoinModal(w); setJoinTimeStart(w.start_time); setJoinTimeEnd(w.end_time); };
  const confirmJoin = () => {
    if (!joinModal) return;
    if (joinModal.type === 'match') { const dur = timeToMinutes(joinTimeEnd) - timeToMinutes(joinTimeStart); if (dur < 90) { alert('Time window must be at least 1.5 hours.'); return; } }
    joinSession(joinModal.id, joinTimeStart, joinTimeEnd);
    showToast('Joined ' + getTypeLabel(joinModal.type) + ' with ' + (joinModal.playerName || 'player'));
    setJoinModal(null);
  };

  const handleWithdraw = (windowId, sessionLabel, participantPlayers, isFull) => setWithdrawModal({ window_id: windowId, sessionLabel, players: participantPlayers, isFull });
  const confirmWithdraw = (notifyMethod) => {
    if (!withdrawModal) return;
    leaveSession(withdrawModal.window_id);
    if (notifyMethod === 'email' && withdrawModal.players.length > 0) window.location.href = 'mailto:' + withdrawModal.players.map(p => p.email).filter(Boolean).join(',');
    else if (notifyMethod === 'text' && withdrawModal.players.length > 0) {
      const nums = withdrawModal.players.map(p => (p.phone || '').replace(/\D/g, '')).filter(Boolean);
      if (nums.length === 1) window.location.href = 'sms:+1' + nums[0];
      else setSmsModal({ numbers: nums, names: withdrawModal.players.map(p => p.name) });
    }
    showToast('Withdrawn from ' + withdrawModal.sessionLabel);
    setWithdrawModal(null);
  };

  // Profile save — updates DB
  const handleProfileSave = async (updates, newPassword) => {
    const { error } = await updatePlayer(userId, updates);
    if (error) { showToast('Error saving profile: ' + error.message); return; }
    if (newPassword) {
      const { supabase } = await import('./lib/supabase');
      await supabase.auth.updateUser({ password: newPassword });
    }
    showToast('Profile updated!');
    setShowProfileModal(false);
  };

  // Player save (admin)
  const handlePlayerSave = async (form) => {
    if (playerEditModal === 'new') {
      const { error } = await insertPlayer({ name: form.name, email: form.email, phone: form.phone, ntrp: form.ntrp, is_pro: form.is_pro, is_admin: form.is_admin });
      if (error) { showToast('Error: ' + error.message); return; }
      showToast('Player added!');
    } else {
      const { error } = await updatePlayer(form.id, { name: form.name, email: form.email, phone: form.phone, ntrp: form.ntrp, is_pro: form.is_pro, is_admin: form.is_admin });
      if (error) { showToast('Error: ' + error.message); return; }
      showToast('Player updated!');
    }
    setPlayerEditModal(null);
  };

  // Window save
  const handleWindowSave = async (form) => {
    await saveWindow(form);
    setEditWindowModal(null);
  };

  // Designation toggle
  const setDesignation = async (playerId, type) => {
    const current = weekDesig.find(d => d.player_id === playerId)?.designation;
    await upsertDesignation(playerId, weekStart, current === type ? null : type);
  };
  const canDesignate = (member) => member.response === 'yes' || member.response === 'ifNeeded';

  const toggleQuickActionFilter = (filter) => setQuickActionFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]);
  const getFilteredRoster = () => {
    const seen = new Set(); const result = [];
    quickActionFilters.forEach(filter => {
      weekRoster.forEach(m => {
        if (seen.has(m.id)) return;
        const match = (filter === 'noResponse' && !m.response) || (filter === 'selected' && selectedIds.includes(m.id)) || (filter === 'alternates' && alternateIds.includes(m.id)) || (filter === 'available' && (m.response === 'yes' || m.response === 'ifNeeded')) || m.response === filter;
        if (match) { result.push(m); seen.add(m.id); }
      });
    });
    return result;
  };
  const fireQuickAction = () => {
    const filtered = getFilteredRoster();
    if (filtered.length === 0) { alert('No members match the selected filters.'); return; }
    if (quickActionMethod === 'email') { window.location.href = 'mailto:' + filtered.map(m => m.email).join(','); }
    else { if (filtered.length === 1) window.location.href = 'sms:+1' + filtered[0].phone.replace(/\D/g, ''); else setSmsModal({ numbers: filtered.map(m => m.phone.replace(/\D/g, '')), names: filtered.map(m => m.name) }); }
  };

  const handleSort = (col) => { if (sortColumn === col) setSortDirection(d => d === 'asc' ? 'desc' : 'asc'); else { setSortColumn(col); setSortDirection('asc'); } };
  const getDisplayRoster = () => {
    let r = [...weekRoster];
    if (rosterFilter === 'available') r = r.filter(m => m.response === 'yes' || m.response === 'ifNeeded');
    return r.sort((a, b) => {
      let av = a[sortColumn], bv = b[sortColumn];
      if (sortColumn === 'ntrp') { av = parseFloat(av); bv = parseFloat(bv); }
      else if (sortColumn === 'responseTime') { av = av ? new Date(av).getTime() : 0; bv = bv ? new Date(bv).getTime() : 0; }
      else if (typeof av === 'string') { av = av.toLowerCase(); bv = bv ? bv.toLowerCase() : ''; }
      if (av < bv) return sortDirection === 'asc' ? -1 : 1;
      if (av > bv) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Participants for a schedule item
  const getSessionParticipants = (item) => {
    if (item.type === 'league') {
      return players.filter(p => selectedIds.includes(p.id) && p.id !== userId);
    }
    const windowJoins = joins.filter(j => j.window_id === item.window_id && j.player_id !== userId);
    // Use embedded player data from join, fall back to players array
    return windowJoins.map(j => j.player || players.find(p => p.id === j.player_id)).filter(Boolean);
  };

  // My schedule items
  const getMyScheduleItems = () => {
    const items = [];
    for (let i = 0; i < NUM_WEEKS; i++) {
      const ws = toDateStr(SATURDAYS[i]);
      const resp = responses.find(r => r.player_id === userId && r.week_start === ws);
      if (resp?.response === 'yes' || resp?.response === 'ifNeeded') {
        const det = weekDetails.find(d => d.week_start === ws) || {};
        const desigs = designations.filter(d => d.week_start === ws);
        const isSel = desigs.some(d => d.player_id === userId && d.designation === 'selected');
        const isAlt = desigs.some(d => d.player_id === userId && d.designation === 'alternate');
        const isOut = desigs.some(d => d.player_id === userId && d.designation === 'notThisWeek');
        const status = isSel ? 'Selected' : isAlt ? 'Alternate' : isOut ? 'Not This Week' : 'Pending';
        items.push({ type: 'league', label: 'League Match', detail: det.subtitle, date: SATURDAYS[i], day: 'Saturday', start_time: det.start_time, end_time: det.end_time, address: formatAddress(det), status, week_start: ws });
      }
    }
    myWindows.forEach(w => {
      const info = getSlotsInfo(w);
      items.push({ type: w.type, label: getTypeLabel(w.type) + ' (Open Request)', session_date: w.session_date, day: w.session_date ? new Date(w.session_date+'T00:00:00').toLocaleDateString('en-US',{weekday:'long'}) : w.day, start_time: w.start_time, end_time: w.end_time, joinedPlayers: joins.filter(j => j.window_id === w.id), info, date: null, window_id: w.id });
    });
    joins.filter(j => j.player_id === userId).forEach(j => {
      const w = allWindows.find(w => w.id === j.window_id);
      if (w) {
        const info = getSlotsInfo(w);
        items.push({ type: w.type, label: getTypeLabel(w.type) + ' with ' + (w.player?.name || ''), session_date: w.session_date, day: w.session_date ? new Date(w.session_date+'T00:00:00').toLocaleDateString('en-US',{weekday:'long'}) : w.day, start_time: j.join_start_time, end_time: j.join_end_time, info, status: info?.filled ? 'Confirmed' : 'Pending', date: null, window_id: w.id });
      }
    });
    return items.sort((a, b) => {
      const aMs = a.date ? a.date.getTime() : a.session_date ? new Date(a.session_date+'T'+(a.start_time||'08:00')+':00').getTime() : Date.now();
      const bMs = b.date ? b.date.getTime() : b.session_date ? new Date(b.session_date+'T'+(b.start_time||'08:00')+':00').getTime() : Date.now();
      return aMs - bMs;
    });
  };

  const exportICS = () => {
    const items = getMyScheduleItems();
    const ics = generateICS(items);
    const blob = new Blob([ics], { type: 'text/calendar' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'foxcroft-schedule.ics'; a.click();
    showToast('Calendar exported!');
  };

  const weekLabel = (i) => i === 0 ? 'This Saturday' : i === 1 ? 'Next Saturday' : formatShortDate(SATURDAYS[i]);
  const SortBtn = ({ col, label }) => (<button onClick={() => handleSort(col)} className="flex items-center gap-1 hover:text-gray-900 text-left">{label}{sortColumn === col && <ArrowUpDown size={12} />}</button>);
  const saveDetails = async () => { await upsertWeekDetail(weekStart, draftDetails); setEditingDetails(false); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1e4d2b' }}>
      <div className="text-white text-lg animate-pulse">Loading team data...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" onClick={() => contactPopup && setContactPopup(null)}>
      <Toast toasts={toasts} />

      {/* Modals */}
      {showProfileModal && <ProfileModal user={currentUser} onSave={handleProfileSave} onClose={() => setShowProfileModal(false)} />}
      {playerEditModal && <PlayerEditModal player={playerEditModal === 'new' ? null : playerEditModal} isNew={playerEditModal === 'new'} onSave={handlePlayerSave} onClose={() => setPlayerEditModal(null)} />}
      {editWindowModal && <WindowFormModal window={editWindowModal === 'new' ? null : editWindowModal} onSave={handleWindowSave} onClose={() => setEditWindowModal(null)} currentUser={currentUser} />}

      {removeResponseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Remove Response?</h3>
            <p className="text-sm text-gray-600 mb-5">Are you sure you want to clear your response for this week?</p>
            <div className="flex gap-3">
              <button onClick={() => setRemoveResponseModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">Cancel</button>
              <button onClick={confirmRemoveResponse} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold">Remove</button>
            </div>
          </div>
        </div>
      )}

      {withdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Withdraw from Session?</h3>
            <p className="text-sm text-gray-600 mb-2">Withdraw from <span className="font-semibold">{withdrawModal.sessionLabel}</span>?</p>
            {withdrawModal.isFull && withdrawModal.players.length > 0 && <p className="text-sm text-orange-600 mb-4 bg-orange-50 border border-orange-200 rounded-lg p-2">This session is full. Notify the other players?</p>}
            <div className="space-y-2">
              {withdrawModal.isFull && withdrawModal.players.length > 0 && (<>
                <button onClick={() => confirmWithdraw('email')} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold">Withdraw & Notify by Email</button>
                <button onClick={() => confirmWithdraw('text')} className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold">Withdraw & Notify by Text</button>
                <button onClick={() => confirmWithdraw(null)} className="w-full py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">Withdraw Without Notifying</button>
              </>)}
              {(!withdrawModal.isFull || withdrawModal.players.length === 0) && <button onClick={() => confirmWithdraw(null)} className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold">Confirm Withdraw</button>}
              <button onClick={() => setWithdrawModal(null)} className="w-full py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {smsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4" onClick={() => setSmsModal(null)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3"><h3 className="font-semibold text-gray-900">Text {smsModal.names.length} Members</h3><button onClick={() => setSmsModal(null)} className="text-gray-400"><X size={20} /></button></div>
            <p className="text-sm text-gray-600 mb-3">iOS supports one number at a time via link. Copy all numbers and paste into a new group message.</p>
            <div className="bg-gray-50 rounded-lg p-3 mb-2"><div className="text-xs text-gray-500 mb-1 font-medium">Phone numbers:</div><div className="font-mono text-sm text-gray-800 break-all select-all">{smsModal.numbers.join(', ')}</div></div>
            <div className="text-xs text-gray-400 mb-4">{smsModal.names.join(', ')}</div>
            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(smsModal.numbers.join(', ')); showToast('Numbers copied!'); setSmsModal(null); }} className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold">Copy Numbers</button>
              <a href={'sms:+1' + smsModal.numbers[0]} onClick={() => setSmsModal(null)} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold text-center">Text First Only</a>
            </div>
          </div>
        </div>
      )}

      {contactPopup && (
        <div className="fixed z-[200] bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-48" style={{ top: contactPopup.y, left: Math.min(contactPopup.x, window.innerWidth - 210) }} onClick={e => e.stopPropagation()}>
          <div className="font-semibold text-gray-900 text-sm mb-2 px-1">{contactPopup.name}</div>
          <a href={'mailto:' + contactPopup.email} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"><Mail size={14} className="text-blue-500" /> Email</a>
          <a href={'sms:+1' + (contactPopup.phone || '').replace(/\D/g, '')} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"><MessageSquare size={14} className="text-green-500" /> Text</a>
        </div>
      )}

      {/* HEADER */}
      <div style={{ backgroundColor: '#1e4d2b' }} className="border-b border-green-900">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-2xl">🎾</div>
              <div><h1 className="text-xl font-bold text-white leading-tight">Foxcroft Hills</h1><p className="text-xs text-green-300">{players.length} members</p></div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onSignOut} className="text-green-300 hover:text-white p-1" title="Sign out"><LogOut size={16} /></button>
              <button onClick={() => setShowProfileModal(true)} className="text-right hover:opacity-80 transition-opacity">
                <div className="font-semibold text-white flex items-center gap-1 justify-end text-sm">{currentUser.name}{currentUser.is_pro && <span className="text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded font-medium">PRO</span>}</div>
                <div className="text-xs text-green-300">NTRP {currentUser.ntrp} · tap to edit</div>
              </button>
            </div>
          </div>
          <div className="flex gap-1 bg-green-900 bg-opacity-60 rounded-lg p-1">
            {[['respond', 'This Week'], ['availability', 'Play!'], ['schedule', 'My Schedule'], ...(currentUser.is_admin ? [['admin', 'Admin']] : [])].map(([v, l]) => (
              <button key={v} onClick={() => setView(v)} className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-green-200 hover:text-white'}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* ══════ THIS WEEK ══════ */}
        {view === 'respond' && (<>
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))} disabled={selectedWeek === 0} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={20} /></button>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">{weekLabel(selectedWeek)}</div>
                <div className="text-lg font-bold text-blue-600">{formatSaturdayDate(currentSaturday)}</div>
                {currentDetails.subtitle && <div className="text-sm font-medium text-orange-600 mt-1">{currentDetails.subtitle}</div>}
              </div>
              <button onClick={() => setSelectedWeek(Math.min(NUM_WEEKS - 1, selectedWeek + 1))} disabled={selectedWeek === NUM_WEEKS - 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 mb-4">
            {weather[selectedWeek] === undefined ? (
              <div className="text-center text-sm text-gray-400 animate-pulse">Fetching forecast...</div>
            ) : weather[selectedWeek] === null ? (
              <div className="text-center text-sm text-gray-400">Forecast unavailable for this date</div>
            ) : (
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

          {formatAddress(currentDetails) && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex items-start gap-3">
              <MapPin size={20} className="text-blue-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-blue-900">Location</div>
                <a href={mapsLink(currentDetails)} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-700 underline underline-offset-2">
                  {currentDetails.street}{currentDetails.city && ', ' + currentDetails.city}{currentDetails.state && ', ' + currentDetails.state}{currentDetails.zip && ' ' + currentDetails.zip}
                </a>
                {currentDetails.start_time && <div className="text-xs text-blue-700 mt-0.5">{formatTime(currentDetails.start_time)} – {formatTime(currentDetails.end_time)}</div>}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Are you playing?</h2>
            <div className="grid grid-cols-2 gap-3">
              {[{ v: 'yes', icon: <Check size={24} />, label: 'Yes', sel: 'border-green-500 bg-green-50', txt: 'text-green-700', cnt: rosterCounts.yes }, { v: 'maybe', icon: <HelpCircle size={24} />, label: 'Maybe', sel: 'border-yellow-500 bg-yellow-50', txt: 'text-yellow-700', cnt: rosterCounts.maybe }, { v: 'ifNeeded', icon: <Users size={24} />, label: 'If Needed', sel: 'border-blue-500 bg-blue-50', txt: 'text-blue-700', cnt: rosterCounts.ifNeeded }, { v: 'no', icon: <X size={24} />, label: 'No', sel: 'border-red-500 bg-red-50', txt: 'text-red-700', cnt: rosterCounts.no }].map(({ v, icon, label, sel, txt, cnt }) => (
                <button key={v} onClick={() => handleResponse(v)} className={`py-4 px-4 rounded-xl border-2 transition-all ${myResponse === v ? sel : 'border-gray-200'}`}>
                  <div className={`mx-auto mb-2 w-fit ${myResponse === v ? txt : 'text-gray-400'}`}>{icon}</div>
                  <div className={`font-semibold ${myResponse === v ? txt : 'text-gray-700'}`}>{label}</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{cnt}</div>
                </button>
              ))}
            </div>
            {myResponse && <div className="mt-4 p-3 bg-gray-50 rounded-lg"><p className="text-sm text-gray-600 text-center">Your response: <span className="font-semibold text-gray-900">{{ yes: 'Yes', maybe: 'Maybe', ifNeeded: 'If Needed', no: 'No' }[myResponse]}</span> <span className="text-xs text-gray-400">(tap again to remove)</span></p></div>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-4"><div className="flex items-center gap-3"><div className="p-3 bg-green-100 rounded-lg"><TrendingUp size={24} className="text-green-600" /></div><div><div className="text-2xl font-bold text-gray-900">{Math.round((rosterCounts.yes / Math.max(players.length, 1)) * 100)}%</div><div className="text-sm text-gray-600">Playing</div></div></div></div>
            <div className="bg-white rounded-xl shadow-sm p-4"><div className="flex items-center gap-3"><div className="p-3 bg-blue-100 rounded-lg"><Clock size={24} className="text-blue-600" /></div><div><div className="text-2xl font-bold text-gray-900">{rosterCounts.noResponse}</div><div className="text-sm text-gray-600">Pending</div></div></div></div>
          </div>
        </>)}

        {/* ══════ PLAY! ══════ */}
        {view === 'availability' && (<>
          <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Your Availability Windows</h3>
              <button onClick={() => setEditWindowModal('new')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">+ Add Window</button>
            </div>
            {myWindows.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No time windows added yet.</p>
            ) : (
              <div className="space-y-2">
                {myWindows.map((w) => (
                  <div key={w.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="font-medium text-gray-900">{w.session_date ? new Date(w.session_date+'T00:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}) : (w.day||'')}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeBadgeColor(w.type)}`}>{w.type === 'match' ? (w.match_type === 'singles' ? 'Singles' : 'Doubles') : getTypeLabel(w.type)}</span>
                      </div>
                      <div className="text-sm text-gray-600">{formatTime(w.start_time)} – {formatTime(w.end_time)}</div>
                      {(w.ntrp_min || w.ntrp_max) && <div className="text-xs text-gray-500">NTRP {w.ntrp_min || 'any'} – {w.ntrp_max || 'any'}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditWindowModal(w)} className="text-blue-400 hover:text-blue-600"><Edit2 size={16} /></button>
                      <button onClick={() => deleteWindow(w.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {myWindows.length > 0 && (
              <button onClick={() => { const m = findMatches(); if (m.strong.length > 0 || m.potential.length > 0) setShowMatchFinder(true); else alert('No matches found!'); }} className="bg-green-600 text-white rounded-xl p-4 hover:bg-green-700 text-center">
                <Search size={20} className="mx-auto mb-1" /><div className="text-sm font-semibold">Find Matches</div><div className="text-xs opacity-90">1+ hour overlap</div>
              </button>
            )}
            <button onClick={() => setShowBrowseSchedules(true)} className={`bg-purple-600 text-white rounded-xl p-4 hover:bg-purple-700 text-center ${myWindows.length === 0 ? 'col-span-2' : ''}`}>
              <Users size={20} className="mx-auto mb-1" /><div className="text-sm font-semibold">Browse Requests</div><div className="text-xs opacity-90">View open sessions</div>
            </button>
          </div>

          {showMatchFinder && (() => { const matches = findMatches(); return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-900 text-lg">Available Players</h3><button onClick={() => setShowMatchFinder(false)} className="text-gray-500"><X size={20} /></button></div>
                {matches.strong.length === 0 && matches.potential.length === 0 && <div className="text-center py-8 text-gray-500">No matches found.</div>}
                {matches.strong.length > 0 && <div className="mb-4"><h4 className="text-sm font-semibold text-green-700 mb-2">Strong Matches (1.5+ hours)</h4><div className="space-y-3">{matches.strong.map(p => <div key={p.id} className="border-2 border-green-200 bg-green-50 rounded-lg p-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">{initials(p.name)}</div><div><div className="font-semibold">{p.name}</div><div className="text-xs text-gray-600">NTRP {p.ntrp}</div></div></div><div className="text-lg font-bold text-green-700">{p.maxOverlap.toFixed(2)}h</div></div>)}</div></div>}
                {matches.potential.length > 0 && <div className="mb-4"><h4 className="text-sm font-semibold text-yellow-700 mb-2">Potential Matches (1–1.5 hours)</h4><div className="space-y-3">{matches.potential.map(p => <div key={p.id} className="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">{initials(p.name)}</div><div><div className="font-semibold">{p.name}</div><div className="text-xs text-gray-600">NTRP {p.ntrp}</div></div></div><div className="text-lg font-bold text-yellow-700">{p.maxOverlap.toFixed(2)}h</div></div>)}</div></div>}
              </div>
            </div>
          ); })()}

          {showBrowseSchedules && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-900 text-lg">Open Sessions</h3><button onClick={() => setShowBrowseSchedules(false)} className="text-gray-500"><X size={20} /></button></div>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {[{ value: 'all', label: 'All' }, { value: 'match', label: 'Match' }, { value: 'practice', label: 'Practice' }, { value: 'lesson', label: 'Lesson' }, { value: 'clinic', label: 'Clinic' }].map(f => (
                    <button key={f.value} onClick={() => setBrowseFilter(f.value)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${browseFilter === f.value ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{f.label}</button>
                  ))}
                </div>
                <div className="space-y-3">
                  {getFilteredBrowseWindows().map(w => {
                    const isJoined = joins.some(j => j.window_id === w.id && j.player_id === userId);
                    const overlap = myWindows.map(mw => calculateOverlap(mw, w)).reduce((mx, c) => Math.max(mx, c), 0);
                    const info = getSlotsInfo(w);
                    return (
                      <div key={w.id} className={`border rounded-lg p-4 ${w.qualified ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`flex items-center gap-3 ${!w.qualified ? 'opacity-60' : ''}`}>
                            <button onClick={e => { e.stopPropagation(); setContactPopup({ name: w.playerName, email: w.playerEmail, phone: w.playerPhone || '', y: e.clientY + 8, x: e.clientX - 80 }); }} className={`w-10 h-10 bg-gradient-to-br ${w.qualified ? 'from-purple-400 to-purple-600' : 'from-gray-300 to-gray-500'} rounded-full flex items-center justify-center text-white text-sm font-semibold cursor-pointer`}>{initials(w.playerName)}</button>
                            <div><div className={`font-semibold text-sm ${w.qualified ? 'text-gray-900' : 'text-gray-500 italic'}`}>{w.playerName}</div><div className="text-xs text-gray-500">NTRP {w.playerNtrp}</div></div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!w.qualified && <span className="text-xs text-gray-400 italic">Outside NTRP range</span>}
                            {w.qualified && !isJoined && <button onClick={() => openJoinModal(w)} className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700">Join</button>}
                            {isJoined && <span className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium flex items-center gap-1"><Check size={12} /> Joined!</span>}
                          </div>
                        </div>
                        <div className={`text-sm ${!w.qualified ? 'opacity-60' : ''}`}>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium mr-2 ${getTypeBadgeColor(w.type)}`}>{w.type === 'match' ? (w.match_type === 'singles' ? 'Singles' : 'Doubles') : getTypeLabel(w.type)}</span>
                          <span className={`font-medium ${!w.qualified ? 'text-gray-500 italic' : 'text-gray-900'}`}>{w.session_date ? new Date(w.session_date+'T00:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}) : w.day}</span>
                          <span className={`ml-2 text-xs ${!w.qualified ? 'text-gray-400 italic' : 'text-gray-600'}`}>{formatTime(w.start_time)} – {formatTime(w.end_time)}</span>
                        </div>
                        {(w.ntrp_min || w.ntrp_max) && <div className={`text-xs mt-1 ${!w.qualified ? 'text-gray-400 italic' : 'text-gray-500'}`}>NTRP {w.ntrp_min || 'any'} – {w.ntrp_max || 'any'}</div>}
                        {info && <div className={`text-xs mt-1 font-medium ${info.filled ? 'text-green-600' : 'text-blue-600'}`}>{info.total}/{info.needed} joined {info.filled ? '✓' : ''}</div>}
                        {overlap >= 1.0 && <div className="mt-1"><span className={`text-xs px-2 py-0.5 rounded-full ${overlap >= 1.5 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{overlap.toFixed(2)}h overlap</span></div>}
                      </div>
                    );
                  })}
                  {getFilteredBrowseWindows().length === 0 && <div className="text-center py-8 text-gray-500">No sessions found.</div>}
                </div>
              </div>
            </div>
          )}

          {joinModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
              <div className="bg-white rounded-xl p-6 max-w-sm w-full max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-900">Confirm Join</h3><button onClick={() => setJoinModal(null)} className="text-gray-500"><X size={20} /></button></div>
                <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium text-gray-900">{joinModal.playerName}</div>
                  <div className="text-sm text-gray-600">{joinModal.type === 'match' ? (joinModal.match_type === 'singles' ? 'Singles' : 'Doubles') : getTypeLabel(joinModal.type)} · {joinModal.day}</div>
                  <div className="text-xs text-gray-500">Available: {formatTime(joinModal.start_time)} – {formatTime(joinModal.end_time)}</div>
                </div>
                {joinModal.type === 'match' && (<>
                  <p className="text-sm text-gray-600 mb-3">Narrow your time window (min 1.5 hrs):</p>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Your Start</label><select value={joinTimeStart} onChange={e => setJoinTimeStart(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">{TIME_OPTIONS.filter(o => o.value >= joinModal.start_time && o.value <= joinModal.end_time).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Your End</label><select value={joinTimeEnd} onChange={e => setJoinTimeEnd(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">{TIME_OPTIONS.filter(o => o.value >= joinModal.start_time && o.value <= joinModal.end_time).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                  </div>
                  {(() => { const dur = timeToMinutes(joinTimeEnd) - timeToMinutes(joinTimeStart); const hrs = Math.floor(dur / 60); const mins = dur % 60; return dur < 90 ? <p className="text-xs text-red-500 mb-3">Minimum 1.5 hours required</p> : <p className="text-xs text-green-600 mb-3">{hrs}h{mins > 0 ? ' ' + mins + 'm' : ''} selected</p>; })()}
                </>)}
                <button onClick={confirmJoin} className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">Confirm &amp; Join</button>
              </div>
            </div>
          )}
        </>)}

        {/* ══════ MY SCHEDULE ══════ */}
        {view === 'schedule' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-sm p-5 text-white">
              <div className="flex items-center justify-between">
                <div><h2 className="text-xl font-bold flex items-center gap-2"><Calendar size={24} /> My Schedule</h2><p className="text-sm opacity-90 mt-1">League matches, open requests &amp; sessions joined</p></div>
                <button onClick={exportICS} className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg text-sm font-medium"><Download size={16} /> Export .ics</button>
              </div>
            </div>
            {getMyScheduleItems().length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center"><Calendar size={48} className="mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No upcoming sessions yet.</p><p className="text-sm text-gray-400 mt-1">Respond to this week&apos;s poll or browse open requests in Play!</p></div>
            ) : (
              <div className="space-y-3">
                {getMyScheduleItems().map((item, idx) => {
                  const isAlt = item.status === 'Alternate';
                  const isOut = item.status === 'Not This Week';
                  const isExpanded = expandedScheduleItem === idx;
                  const canExpand = item.type === 'league' ? item.status === 'Selected' : true;
                  const participants = getSessionParticipants(item);
                  const info = item.info;
                  const isFull = info?.filled || false;
                  return (
                    <div key={idx} className={`bg-white rounded-xl shadow-sm border-l-4 relative overflow-hidden ${isOut ? 'border-red-400 opacity-60' : isAlt ? 'border-yellow-400' : item.type === 'league' ? 'border-blue-500' : item.type === 'match' ? 'border-green-500' : item.type === 'practice' ? 'border-blue-400' : item.type === 'lesson' ? 'border-purple-500' : item.type === 'clinic' ? 'border-orange-500' : 'border-gray-300'}`}>
                      <button className={`w-full text-left p-4 ${canExpand ? 'cursor-pointer' : 'cursor-default'}`} onClick={() => canExpand && setExpandedScheduleItem(isExpanded ? null : idx)}>
                        <div className={isAlt ? 'italic' : ''}>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeBadgeColor(item.type === 'league' ? 'match' : item.type)}`}>{item.type === 'league' ? 'League' : getTypeLabel(item.type)}</span>
                            {item.status && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.status === 'Selected' ? 'bg-green-100 text-green-700' : item.status === 'Alternate' ? 'bg-yellow-100 text-yellow-700' : item.status === 'Not This Week' ? 'bg-red-100 text-red-600' : item.status === 'Confirmed' || item.status === 'Joined' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{item.status}</span>}
                            {info && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${info.filled ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{info.filled ? 'Confirmed' : 'Pending'} {info.total}/{info.needed}</span>}
                          </div>
                          <div className={`font-semibold ${isAlt ? 'text-gray-500' : isOut ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.label}</div>
                          {item.detail && <div className={`text-sm font-medium ${isAlt ? 'text-orange-400 italic' : 'text-orange-600'}`}>{item.detail}</div>}
                          <div className={`text-sm mt-0.5 ${isAlt ? 'text-gray-400 italic' : 'text-gray-500'}`}>
                            {item.date ? formatShortDate(item.date) + ' · ' : item.session_date ? new Date(item.session_date+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}) + ' · ' : ''}{item.day}{item.start_time ? ' · ' + formatTime(item.start_time) + ' – ' + formatTime(item.end_time) : ''}
                          </div>
                          {item.address && <a href={mapsLink({ street: item.address, city: '', state: '', zip: '' })} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className={`text-xs mt-0.5 flex items-center gap-1 underline ${isAlt ? 'text-gray-400 italic' : 'text-blue-500'}`}><MapPin size={11} />{item.address}</a>}
                          {canExpand && <div className={`text-xs mt-1 ${isAlt ? 'text-gray-400' : 'text-indigo-400'}`}>{isExpanded ? '▲ Hide' : '▼ Who\'s in'}</div>}
                        </div>
                      </button>
                      <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
                        {participants.length > 0 && (<>
                          <button onClick={() => window.location.href = 'mailto:' + participants.map(p => p.email).join(',')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100"><Mail size={12} /> Email Group</button>
                          <button onClick={() => { if (participants.length === 1) window.location.href = 'sms:+1' + participants[0].phone.replace(/\D/g, ''); else setSmsModal({ numbers: participants.map(p => p.phone.replace(/\D/g, '')), names: participants.map(p => p.name) }); }} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100"><MessageSquare size={12} /> Text Group</button>
                        </>)}
                        {item.window_id && <button onClick={() => handleWithdraw(item.window_id, item.label, participants, isFull)} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100"><LogOut size={12} /> Withdraw</button>}
                      </div>
                      {isExpanded && canExpand && (
                        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                          {item.type === 'league' && (players.filter(p => selectedIds.includes(p.id)).length === 0 ? <p className="text-xs text-gray-400">No players selected yet.</p> : <div><div className="text-xs font-semibold text-gray-500 uppercase mb-2">Selected Players</div><div className="flex flex-wrap gap-2">{players.filter(p => selectedIds.includes(p.id)).map(p => <div key={p.id} className="flex items-center gap-1 bg-green-50 border border-green-200 px-2 py-1 rounded-full"><div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{initials(p.name)}</div><span className="text-xs text-green-800 font-medium">{p.name}</span></div>)}</div></div>)}
                          {item.type !== 'league' && (participants.length === 0 ? <p className="text-xs text-gray-400">No one else signed up yet.</p> : <div><div className="text-xs font-semibold text-gray-500 uppercase mb-2">Signed Up</div><div className="flex flex-wrap gap-2">{participants.map(p => <span key={p.id} className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">{p.name}</span>)}</div></div>)}
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
        {view === 'admin' && currentUser.is_admin && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-sm p-5 text-white"><h2 className="text-xl font-bold mb-1">Team Captain Dashboard</h2><p className="text-sm opacity-90">Manage roster, responses, and match details</p></div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <button onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))} disabled={selectedWeek === 0} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={20} /></button>
                <div className="text-center"><div className="text-sm font-semibold text-gray-900">{weekLabel(selectedWeek)}</div><div className="text-base font-bold text-blue-600">{formatSaturdayDate(currentSaturday)}</div>{currentDetails.subtitle && <div className="text-sm text-orange-600 font-medium">{currentDetails.subtitle}</div>}</div>
                <button onClick={() => setSelectedWeek(Math.min(NUM_WEEKS - 1, selectedWeek + 1))} disabled={selectedWeek === NUM_WEEKS - 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={20} /></button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-900">Match Details</h3>{!editingDetails ? <button onClick={() => { setDraftDetails({ ...currentDetails }); setEditingDetails(true); }} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">Edit</button> : <div className="flex gap-2"><button onClick={() => setEditingDetails(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">Cancel</button><button onClick={saveDetails} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">Save</button></div>}</div>
              {!editingDetails ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"><Bell size={18} className="text-orange-500 mt-0.5 shrink-0" /><div><div className="text-xs text-gray-500 font-medium uppercase">Subtitle</div><div className="text-sm text-gray-900">{currentDetails.subtitle || 'Not set'}</div></div></div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"><MapPin size={18} className="text-orange-500 mt-0.5 shrink-0" /><div><div className="text-xs text-gray-500 font-medium uppercase">Location</div>{formatAddress(currentDetails) ? <a href={mapsLink(currentDetails)} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline">{formatAddress(currentDetails)}</a> : <div className="text-sm text-gray-900">Not set</div>}</div></div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"><Clock size={18} className="text-orange-500 mt-0.5 shrink-0" /><div><div className="text-xs text-gray-500 font-medium uppercase">Match Time</div><div className="text-sm text-gray-900">{currentDetails.start_time ? formatTime(currentDetails.start_time) + ' – ' + formatTime(currentDetails.end_time) : 'Not set'}</div></div></div>
                </div>
              ) : draftDetails && (
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label><input type="text" value={draftDetails.subtitle || ''} onChange={e => setDraftDetails({ ...draftDetails, subtitle: e.target.value })} placeholder="e.g. Home vs Carmel Valley" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><AddressAutocomplete value={draftDetails.street || ''} onChange={(field, val) => setDraftDetails(prev => ({ ...prev, [field]: val }))} placeholder="Search for venue..." /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Start</label><select value={draftDetails.start_time || '08:00'} onChange={e => setDraftDetails({ ...draftDetails, start_time: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">{TIME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">End</label><select value={draftDetails.end_time || '10:30'} onChange={e => setDraftDetails({ ...draftDetails, end_time: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">{TIME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
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
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Contact Method</label>
                  <div className="flex gap-2">
                    <button onClick={() => setQuickActionMethod('email')} className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium ${quickActionMethod === 'email' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600'}`}>Email</button>
                    <button onClick={() => setQuickActionMethod('text')} className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium ${quickActionMethod === 'text' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600'}`}>Text (iPhone)</button>
                  </div>
                </div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Send To</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[{ value: 'yes', label: 'Yes', count: rosterCounts.yes }, { value: 'maybe', label: 'Maybe', count: rosterCounts.maybe }, { value: 'ifNeeded', label: 'If Needed', count: rosterCounts.ifNeeded }, { value: 'no', label: 'No', count: rosterCounts.no }, { value: 'noResponse', label: 'No Reply', count: rosterCounts.noResponse }, { value: 'selected', label: 'Selected', count: selectedIds.length }, { value: 'alternates', label: 'Alternates', count: alternateIds.length }, { value: 'available', label: 'Available', count: weekRoster.filter(m => m.response === 'yes' || m.response === 'ifNeeded').length }].map(opt => (
                      <button key={opt.value} onClick={() => toggleQuickActionFilter(opt.value)} className={`py-2 px-1 rounded-lg border-2 text-center ${quickActionFilters.includes(opt.value) ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                        <div className={`text-base font-bold ${quickActionFilters.includes(opt.value) ? 'text-orange-700' : 'text-gray-700'}`}>{opt.count}</div>
                        <div className={`text-xs font-medium ${quickActionFilters.includes(opt.value) ? 'text-orange-600' : 'text-gray-500'}`}>{opt.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={fireQuickAction} disabled={quickActionFilters.length === 0} className="w-full py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {quickActionMethod === 'email' ? '📧' : '📱'} {quickActionMethod === 'email' ? 'Open Email' : 'Open Messages'} to {getFilteredRoster().length} member{getFilteredRoster().length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">Team Roster</h3>
                  <div className="flex gap-1">
                    <button onClick={() => setRosterFilter('all')} className={`px-3 py-1 rounded-lg text-xs font-medium ${rosterFilter === 'all' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'}`}>All</button>
                    <button onClick={() => setRosterFilter('available')} className={`px-3 py-1 rounded-lg text-xs font-medium ${rosterFilter === 'available' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Available</button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setPlayerEditModal('new')} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-1"><Plus size={14} /> Add Player</button>
                  <button onClick={() => { const rows = [['Name', 'NTRP', 'Response', 'Phone', 'Email']]; getDisplayRoster().forEach(m => rows.push([m.name, m.ntrp, m.response || 'Pending', m.phone, m.email])); const blob = new Blob([rows.map(r => r.map(v => '"' + v + '"').join(',')).join('\n')], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'roster.csv'; a.click(); }} className="px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">Export CSV</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-28">Flags</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase"><SortBtn col="name" label="Name" /></th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase"><SortBtn col="ntrp" label="NTRP" /></th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase"><SortBtn col="response" label="Response" /></th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getDisplayRoster().map(member => {
                      const isSel = selectedIds.includes(member.id);
                      const isAlt = alternateIds.includes(member.id);
                      const isOut = notThisWeekIds.includes(member.id);
                      const eligible = canDesignate(member);
                      return (
                        <tr key={member.id} className={`hover:bg-gray-50 ${member.id === userId ? 'bg-blue-50' : ''}`}>
                          <td className="px-3 py-3">{eligible ? <div className="flex gap-1">
                            <button onClick={() => setDesignation(member.id, 'selected')} title="Selected" className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center ${isSel ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>✓</button>
                            <button onClick={() => setDesignation(member.id, 'alternate')} title="Alternate" className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center ${isAlt ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>?</button>
                            <button onClick={() => setDesignation(member.id, 'notThisWeek')} title="Not This Week" className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center ${isOut ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>✕</button>
                          </div> : <span className="text-xs text-gray-300 pl-2">—</span>}</td>
                          <td className="px-3 py-3"><div className="flex items-center gap-2"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${member.id === userId ? 'bg-blue-500' : 'bg-gradient-to-br from-orange-400 to-orange-600'}`}>{initials(member.name)}</div><div><span className="font-medium text-gray-900 text-sm">{member.name}</span>{member.is_pro && <span className="ml-1 text-xs bg-purple-100 text-purple-700 px-1 py-0.5 rounded">PRO</span>}{member.is_admin && <span className="ml-1 text-xs bg-orange-100 text-orange-700 px-1 py-0.5 rounded">Admin</span>}</div></div></td>
                          <td className="px-3 py-3 text-sm font-semibold text-gray-700">{member.ntrp}</td>
                          <td className="px-3 py-3">{member.response === 'yes' && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Yes</span>}{member.response === 'maybe' && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Maybe</span>}{member.response === 'ifNeeded' && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">If Needed</span>}{member.response === 'no' && <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">No</span>}{!member.response && <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Pending</span>}</td>
                          <td className="px-3 py-3"><a href={'tel:+1' + (member.phone || '').replace(/\D/g, '')} className="text-xs text-gray-700 hover:text-blue-600 whitespace-nowrap">{member.phone}</a></td>
                          <td className="px-3 py-3"><a href={'mailto:' + member.email} className="text-xs text-blue-600 hover:underline">{member.email}</a></td>
                          <td className="px-3 py-3"><div className="flex items-center gap-2"><button onClick={() => setPlayerEditModal(member)} className="text-orange-400 hover:text-orange-600"><Edit2 size={16} /></button>{member.id !== userId && <button onClick={() => setDeletePlayerModal(member)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>}</div></td>
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

      {/* ══════ DELETE PLAYER MODAL ══════ */}
      {deletePlayerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Remove Player</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to remove <span className="font-semibold">{deletePlayerModal.name}</span> from the roster?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletePlayerModal(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium">Cancel</button>
              <button onClick={async () => {
                const pid = deletePlayerModal.id;
                setDeletePlayerModal(null);
                const { error } = await deletePlayer(pid);
                if (error) alert('Error removing player: ' + error.message);
              }} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
