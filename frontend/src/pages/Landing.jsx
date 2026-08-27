import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { BHC } from '../utils/bhc'

export default function Landing() {
  const [stats, setStats] = useState(null)
  const [query, setQuery] = useState('')
  const [hook, setHook] = useState(null)
  const [loadingHook, setLoadingHook] = useState(false)
  const [featured, setFeatured] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    client.get('/dashboard/stats').then(r => setStats(r.data)).catch(()=>{})
    client.get('/resources').then(r => setFeatured(r.data.slice(0,3))).catch(()=>{})
  }, [])

  const doSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoadingHook(true)
    try {
      const res = await client.get('/matches/search', { params: { q: query } })
      setHook(res.data)
    } catch (err) {
      setHook({ message: 'Search failed', total_compatible: 0, top_matches: [] })
    } finally {
      setLoadingHook(false)
    }
  }

  return (
    <div>
      {/* Hero - BHC */}
      <div className="bg-gradient-to-br from-spare-600 via-emerald-600 to-cyan-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="max-w-7xl mx-auto px-6 py-14 relative">
          <div className="max-w-3xl">
            <div className="inline-flex flex-wrap items-center gap-2 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full text-sm mb-4 border border-white/20">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span> {BHC.name} • Live sharing • {stats ? `${stats.total_resources} items` : 'Loading...'}
              <span className="hidden sm:inline opacity-80">•</span>
              <span className="hidden sm:inline text-xs opacity-90">📍 {BHC.address} • {BHC.phone}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-spare-700 text-xs font-black tracking-widest">
              BISHOP HEBER COLLEGE • TIRUCHIRAPPALLI • 620017 • NAAC A++
            </div>
            <h1 className="mt-3 text-4xl md:text-5xl font-black leading-[0.95] tracking-tight">
              Don't buy it yet —<br/> check <span className="bg-white text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-100">BHC campus</span> first.
            </h1>
            <p className="mt-4 text-lg text-white/90 leading-relaxed">
              Built for <b>{BHC.name}, {BHC.city}</b> — {BHC.campus.center.lat}, {BHC.campus.center.lng} • {BHC.campus.busStop} • {BHC.campus.railway}. SPARE finds textbooks, lab kits, electronics from {BHC.departments.length} departments. Understands “Arduino kit” ≈ “microcontroller board”.
            </p>

            {/* Search */}
            <form onSubmit={doSearch} className="mt-6 bg-white rounded-xl p-2 flex gap-2 shadow-lg">
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search for anything... e.g., Arduino Uno" className="flex-1 px-4 py-3 rounded-lg text-gray-900 outline-none" />
              <button type="submit" className="px-6 py-3 bg-spare-600 text-white rounded-lg font-semibold hover:bg-spare-700">
                {loadingHook ? '...' : 'Search'}
              </button>
            </form>

            {/* Hook */}
            {hook && (
              <div className="mt-4 bg-white text-gray-900 rounded-xl p-4 shadow">
                <div className={`font-bold ${hook.total_compatible>0 ? 'text-spare-700' : 'text-gray-700'}`}>
                  {hook.total_compatible > 0 ? `⚡ ${hook.message}` : hook.message}
                </div>
                {hook.top_matches?.length>0 && (
                  <div className="mt-3 grid sm:grid-cols-2 gap-3">
                    {hook.top_matches.map(m => (
                      <div key={m.resource.id} className="border rounded-lg p-3 flex gap-3">
                        <img src={m.resource.image_url} alt="" className="w-16 h-16 object-cover rounded" />
                        <div>
                          <div className="font-semibold text-sm">{m.resource.title}</div>
                          <div className="text-xs text-gray-600">{m.resource.category} • {m.match_score}% match {m.distance_km ? `• ${m.distance_km} km` : ''}</div>
                          <Link to={`/resources`} className="text-xs text-spare-600 font-semibold">View resources →</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {hook.total_compatible>0 && (
                  <button onClick={()=>navigate('/resources')} className="mt-3 text-sm bg-gray-900 text-white px-4 py-2 rounded-lg">Browse all compatible</button>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/post-resource" className="px-5 py-3 bg-white text-spare-700 rounded-lg font-bold shadow">Post a Resource</Link>
              <Link to="/post-need" className="px-5 py-3 bg-black/20 backdrop-blur border border-white/30 text-white rounded-lg font-semibold">Post a Need</Link>
              <Link to="/heatmap" className="px-5 py-3 bg-white/10 text-white rounded-lg font-semibold border border-white/20">Campus Heatmap</Link>
            </div>

            {stats && (
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/15">
                  <div className="text-2xl font-extrabold">{stats.total_resources}</div><div className="text-xs opacity-80">Items Shared</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/15">
                  <div className="text-2xl font-extrabold">₹{stats.money_saved.toLocaleString()}</div><div className="text-xs opacity-80">Money Saved</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/15">
                  <div className="text-2xl font-extrabold">{stats.items_reused}</div><div className="text-xs opacity-80">Items Reused</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-xl font-bold mb-4">How it works</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            {n:'1', t:'Post', d:'List resources or needs in 30 seconds'},
            {n:'2', t:'Smart Match', d:'AI understands semantics, not just keywords'},
            {n:'3', t:'Request & QR', d:'Owner accepts → QR handover'},
            {n:'4', t:'Return & Save', d:'Track returns, measure sustainability'},
          ].map(s=>(
            <div key={s.n} className="bg-white border rounded-xl p-5">
              <div className="w-8 h-8 rounded-full bg-spare-100 text-spare-700 flex items-center justify-center font-bold text-sm">{s.n}</div>
              <div className="font-bold mt-2">{s.t}</div>
              <div className="text-sm text-gray-600">{s.d}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex gap-4">
          <div className="text-2xl">🎓</div>
          <div>
            <div className="font-black text-slate-900">Demo tip — BHC</div>
            <div className="text-sm text-slate-700">Login as <b>demo@bhc.edu.in / password123</b> (also sparedemo) → Post Need “Arduino Uno” → See 86% match with Arjun’s kit at Bishop Solomon Doraiswamy Block (CS) 120m away → Request → Dashboard → QR scan. Full flow 2 min. Departments: {BHC.departments.slice(0,6).join(', ')}… ({BHC.departments.length} total).</div>
            <div className="mt-2 text-xs text-slate-600">📍 {BHC.campus.vistorGate} • Affiliated {BHC.affiliation} • {BHC.website}</div>
          </div>
        </div>

        {/* Featured BHC Resources — original images */}
        {featured.length>0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tight text-slate-900">Featured <span className="bg-gradient-to-r from-spare-600 to-cyan-600 bg-clip-text text-transparent">BHC resources</span> <span className="text-xs font-bold tracking-widest text-slate-500">• ORIGINAL IMAGES</span></h2>
              <Link to="/resources" className="text-sm font-bold text-spare-600 hover:text-spare-700 flex items-center gap-1">View all <span>→</span></Link>
            </div>
            <p className="text-xs text-slate-500 mt-1">Real images — Wikimedia Commons CC + Unsplash • Each card shows true resource photo, not placeholder</p>
            <div className="mt-4 grid md:grid-cols-3 gap-4 stagger">
              {featured.map(r=>(
                <Link key={r.id} to={`/resources/${r.id}`} className="group glass rounded-2xl overflow-hidden card-pro block">
                  <div className="relative h-44 overflow-hidden image-zoom bg-slate-100">
                    <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" onError={e=>e.target.style.display='none'} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition" />
                    <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur border text-xs font-bold text-slate-800">{r.category}</span>
                    <span className="absolute top-2 right-2 px-2 py-1 rounded-full bg-emerald-500/95 border border-emerald-400 text-white text-xs font-black">● {r.status}</span>
                    <span className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-white/95 backdrop-blur border font-mono text-xs font-bold">#{r.verification_code}</span>
                  </div>
                  <div className="p-4">
                    <div className="font-black text-sm leading-tight text-slate-900 group-hover:text-spare-700 transition line-clamp-1">{r.title}</div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{r.description}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs">
                      <span className="px-2 py-1 rounded-full bg-gradient-to-r from-spare-50 to-emerald-50 border border-spare-200 text-spare-700 font-bold">₹{r.estimated_value}</span>
                      <span className="text-slate-500 truncate">📍 {r.location_text}</span>
                    </div>
                    <div className="mt-2 text-xs font-bold text-spare-600 flex items-center gap-1">View details <span className="group-hover:translate-x-1 transition-transform">→</span></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Value prop */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-6 card-lift">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-spare-600 to-emerald-500 flex items-center justify-center text-white">⚡</div>
            <div className="font-black mt-3">Instant discovery</div><p className="text-sm text-slate-600 mt-1">Find a BHC resource within 2 minutes across {BHC.departments.length} departments.</p>
          </div>
          <div className="glass rounded-2xl p-6 card-lift">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-violet-600 flex items-center justify-center text-white">💸</div>
            <div className="font-black mt-3">Purchase avoidance</div><p className="text-sm text-slate-600 mt-1">“Don’t buy it yet” saves avg ₹2,500 per exchange at BHC.</p>
          </div>
          <div className="glass rounded-2xl p-6 card-lift">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">🌱</div>
            <div className="font-black mt-3">Sustainability</div><p className="text-sm text-slate-600 mt-1">Track reused items, waste avoided, CO₂ saved — NAAC A++ green campus.</p>
          </div>
        </div>

        {/* About SPARE — Project website data */}
        <div className="mt-12 glass-strong rounded-[28px] p-6 sm:p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-spare-100 to-cyan-100 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/3" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-black tracking-widest">ABOUT • SPARE × BHC</div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">Smart Platform for Resource Exchange</h2>
            <p className="text-sm text-slate-600 mt-1">A hackathon prototype solving <b>resource-discovery, not scarcity</b> at Bishop Heber College — where 1,247+ students share lab kits, textbooks, electronics, sports gear without duplicate purchases.</p>
            <div className="mt-5 grid md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-2xl bg-white border">
                <div className="font-black">🎯 Problem</div>
                <p className="text-slate-600 mt-1 leading-relaxed">BHC has 23 depts, 30+ UG + 22+ PG programmes, but no visibility into spare textbooks, lab gear, Arduino kits, projectors. Students buy new while identical items sit idle in hostels/auditorium.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border">
                <div className="font-black">💡 Solution</div>
                <p className="text-slate-600 mt-1 leading-relaxed">SPARE semantic search (TF-IDF + synonym boost, 86% for Arduino≈microcontroller) + distance + time + QR-signed handover + return tracking + heatmap. Runs offline, deploys free.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border">
                <div className="font-black">🏫 BHC Context</div>
                <p className="text-slate-600 mt-1 leading-relaxed">Puthur Nal Road 400m, Trichy Jn 3.5km, Airport 7.7km. Blocks: P. Vishwanathan (Arts), Doraiswamy (CS 10.8185,78.6749), HAIF, Library, Hostels. Affiliated Bharathidasan Univ, NAAC A++ CGPA 3.69.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-full bg-slate-900 text-white font-bold">React 18 + Vite</span>
              <span className="px-3 py-1.5 rounded-full bg-white border font-semibold">FastAPI + SQLAlchemy</span>
              <span className="px-3 py-1.5 rounded-full bg-white border font-semibold">Leaflet + OSM</span>
              <span className="px-3 py-1.5 rounded-full bg-white border font-semibold">QR + JWT + bcrypt</span>
              <span className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">bhc.edu.in only</span>
            </div>
          </div>
        </div>

        {/* How to use — detailed */}
        <div className="mt-10">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">How to use <span className="bg-gradient-to-r from-spare-600 to-cyan-600 bg-clip-text text-transparent">SPARE at BHC</span> <span className="text-sm font-bold tracking-widest text-slate-500">• 7 STEPS</span></h2>
          <p className="text-sm text-slate-600">From registration to sustainability — verified, QR-signed, audited.</p>
          <div className="mt-5 grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {[
              { n:'01', t:'Register with BHC ID', d:'Sign up with @bhc.edu.in, phone, student ID (e.g., BCA2023-001), department & year. 2FA optional. Verified in 18s.', icon:'🎓', c:'from-violet-500 to-indigo-600' },
              { n:'02', t:'Post Resource / Need', d:'Title, description, category, condition, deposit, location (choose BHC block), available till, image URL → auto pickup code.', icon:'📦', c:'from-spare-600 to-emerald-500' },
              { n:'03', t:'AI Semantic Search', d:'Type “Arduino” → “Don’t buy yet — 4 compat 84.8%” at Doraiswamy Block 120m. Category + distance + time weighted.', icon:'🔍', c:'from-cyan-600 to-violet-600' },
              { n:'04', t:'Request & Owner Accept', d:'Need owner taps Request → owner (e.g., arjun@bhc.edu.in) sees Dashboard → Accept. Status requested→accepted, QR generates.', icon:'🤝', c:'from-amber-500 to-orange-500' },
              { n:'05', t:'QR Handover at BHC', d:'Meet at location (e.g., HAIF 10.8180,78.6740). Owner scans QR / taps Confirm Handover → active. ID proof checked.', icon:'📱', c:'from-emerald-600 to-teal-600' },
              { n:'06', t:'Return & Verify', d:'Borrower taps Mark Returned → owner Confirms Return → completed. Resource status back to available. Need fulfilled.', icon:'↩️', c:'from-slate-800 to-slate-600' },
              { n:'07', t:'Track Impact', d:'Dashboard shows money saved (₹2500 per Arduino), items reused, heatmap clusters green/red at BHC. Export for NAAC.', icon:'🌱', c:'from-spare-600 to-cyan-600' },
            ].map(s=>(
              <div key={s.n} className="glass rounded-2xl p-5 card-lift group relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${s.c} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition`} />
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.c} flex items-center justify-center text-white text-lg`}>{s.icon}</div>
                  <span className="text-xs font-black tracking-widest text-slate-400">{s.n}</span>
                  <span className="ml-auto w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
                <div className="font-black mt-3 text-slate-900">{s.t}</div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/register" className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-bold hover:bg-black transition">Start at BHC → Register</Link>
            <Link to="/resources" className="px-5 py-2.5 rounded-full glass font-bold hover:bg-white transition">Browse BHC Resources</Link>
            <Link to="/heatmap" className="px-5 py-2.5 rounded-full bg-white border font-bold hover:bg-slate-50 transition">See BHC Heatmap 10.8188,78.6754</Link>
          </div>
        </div>

        {/* Features deep dive */}
        <div className="mt-10">
          <h2 className="text-xl font-black tracking-tight text-slate-900">Everything for a <span className="text-gradient-animate">modern campus</span></h2>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon:'🧠', t:'Semantic Matching', d:'86% for Arduino vs microcontroller board — synonym canon (arduino/microcontroller → electronics) + TF-IDF + Jaccard max. No exact keyword needed.' },
              { icon:'📍', t:'BHC-Aware Distance', d:'Haversine 10.8188,78.6754 center • exp(-km/3) • unknown→0.85. Puthur blocks within 120–500m typical.' },
              { icon:'🔐', t:'QR + 6-digit Code', d:'qrcode + Pillow → base64 Data URI. Owner scans at BHC block, signed timestamp, audit trail. Simulated tap for demo.' },
              { icon:'🛡️', t:'ID-Proof & Deposit', d:'Require student ID, optional ₹500/1000 deposit, contact pref in_app/email/phone, pickup instructions, max 14d.' },
              { icon:'🗺️', t:'Campus Heatmap', d:'Leaflet + OSM, no API key, green=resources red=needs, clustered at Doraiswamy, Vishwanathan, HAIF, Library, Hostels.' },
              { icon:'📊', t:'Sustainability', d:'₹ saved = sum estimated_value of completed. Items reused, active loans, my_resources. Export for Green Campus.' },
            ].map(f=>(
              <div key={f.t} className="glass rounded-2xl p-5 hover:shadow-glass-hover hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-lg">{f.icon}</div>
                <div className="font-black mt-3 text-sm">{f.t}</div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Departments showcase */}
        <div className="mt-10 glass rounded-[24px] p-6">
          <h3 className="font-black text-slate-900 flex items-center gap-2">🏛️ {BHC.name} — {BHC.departments.length} Departments <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">{BHC.accreditation}</span></h3>
          <p className="text-xs text-slate-600 mt-1">{BHC.address} • {BHC.phone} • {BHC.website} • Affiliated {BHC.affiliation} • Est. {BHC.established} • NIRF 2025: {BHC.nirf2025}</p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {BHC.departments.map(d=>(
              <div key={d} className="px-3 py-2.5 rounded-xl bg-white border hover:border-spare-200 hover:bg-spare-50 hover:text-spare-700 transition text-xs font-semibold text-center flex items-center justify-center min-h-[44px]">{d}</div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {BHC.campusLocations.map(l=> <span key={l.name} className="px-2 py-1 rounded-full bg-slate-900 text-white text-[11px] font-medium">📍 {l.name}</span>)}
          </div>
        </div>

        {/* Data / Stats expanded */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-5">
            <div className="text-xs font-black tracking-widest text-slate-500">BHC CAMPUS DATA</div>
            <div className="mt-2 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">Center</span><b>10.8188, 78.6754</b></div>
              <div className="flex justify-between"><span className="text-slate-600">Blocks</span><b>{BHC.campusLocations.length}</b></div>
              <div className="flex justify-between"><span className="text-slate-600">Departments</span><b>{BHC.departments.length}</b></div>
              <div className="flex justify-between"><span className="text-slate-600">Hostels</span><b>Men & Women + International</b></div>
            </div>
          </div>
          <div className="glass rounded-2xl p-5 bg-gradient-to-br from-emerald-50 to-cyan-50 border-emerald-200">
            <div className="text-xs font-black tracking-widest text-emerald-700">HOW MUCH SAVED?</div>
            <div className="mt-2 text-2xl font-black text-slate-900">₹{(stats?.money_saved || 0).toLocaleString()} <span className="text-sm font-bold text-emerald-600">on campus</span></div>
            <div className="text-xs text-slate-600">Avg ₹2,500 saved per Arduino exchange. If BHC shares 100 items/month → <b>₹3L/year</b> saved + 100kg e-waste avoided.</div>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="text-xs font-black tracking-widest text-slate-500">NEED A RESOURCE?</div>
            <p className="text-sm text-slate-600 mt-1">Post a Need → AI matches in 2s → Request → QR handshake at {BHC.campus.busStop}.</p>
            <Link to="/post-need" className="mt-3 inline-flex px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-bold">Post BHC Need →</Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-10">
          <h2 className="text-xl font-black tracking-tight text-slate-900">FAQ — Using SPARE at BHC</h2>
          <div className="mt-4 grid md:grid-cols-2 gap-3">
            {[
              { q:'Who can join?', a:'Only BHC students with @bhc.edu.in or campus email, verified student ID (e.g., BCA2023-001) and phone. Guest outsiders blocked.' },
              { q:'Is my item safe?', a:'Yes. 6-digit code + QR, ID proof, optional deposit (₹500/1000), timestamped audit, and rating. High-value items flagged for moderation.' },
              { q:'What if item is damaged?', a:'Report via Dashboard → dispute. Deposit held, admin via Staff Council reviews. History affects trust score.' },
              { q:'How does matching work?', a:'45% semantic (synonym boost: arduino≈microcontroller→electronics) +30% category +15% distance (BHC center) +10% time. 84–86% typical for Arduino.' },
              { q:'Where do we meet?', a:'At the resource location_text — e.g., Bishop Solomon Doraiswamy Block (CS) 10.8185,78.6749 or P. Vishwanathan Block. Map shows pins.' },
              { q:'Can I use mobile in hostel?', a:'As per BHC rules, use with discretion. SPARE works on campus Wi-Fi/LAN. Hostel wardens manage as per BHC policy.' },
            ].map(f=>(
              <details key={f.q} className="group glass rounded-2xl p-4 open:bg-white">
                <summary className="font-bold text-sm cursor-pointer list-none flex justify-between items-center">{f.q}<span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs group-open:rotate-45 transition">+</span></summary>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 glass-dark rounded-[28px] p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-spare-500 to-cyan-500 rounded-full blur-3xl opacity-30" />
          <div className="relative flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1">
              <h3 className="text-2xl font-black leading-tight">Ready to share at BHC?</h3>
              <p className="text-sm opacity-80 mt-1">Post Box 615, Vayalur Road, Puthur — join {BHC.departments.length} departments already sharing. No purchase before campus check.</p>
            </div>
            <div className="flex gap-2">
              <Link to="/register" className="px-6 py-3 rounded-full bg-white text-slate-900 font-black hover:bg-slate-100 transition">Register @bhc.edu.in</Link>
              <Link to="/resources" className="px-6 py-3 rounded-full bg-white/10 border border-white/20 backdrop-blur text-white font-bold hover:bg-white/15 transition">Explore →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

