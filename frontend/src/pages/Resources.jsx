import { useEffect, useState } from 'react'
import client from '../api/client'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../utils/categories'
import { BHC } from '../utils/bhc'

export default function Resources() {
  const [resources, setResources] = useState([])
  const [filterCat, setFilterCat] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [failedImgs, setFailedImgs] = useState({})

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterCat) params.category = filterCat
      if (search) params.search = search
      const res = await client.get('/resources', { params })
      setResources(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ load() }, [filterCat])
  const handleSearch = (e) => { e.preventDefault(); load() }

  const handleImgError = (id) => setFailedImgs(prev => ({ ...prev, [id]: true }))

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header — BHC branded */}
      <div className="flex flex-wrap justify-between gap-4 items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            BHC <span className="bg-gradient-to-r from-spare-600 to-cyan-600 bg-clip-text text-transparent">Resources</span>
          </h1>
          <p className="text-xs font-bold tracking-widest text-slate-500 flex flex-wrap items-center gap-1.5">
            <span className="px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">VERIFIED</span> 
            <span>QR • ID-CHECKED • {BHC.campus.center.lat}, {BHC.campus.center.lng}</span>
            <span className="hidden sm:inline">• {BHC.departments.length} Depts</span>
          </p>
        </div>
        <Link to="/post-resource" className="group relative px-6 py-3 rounded-full bg-gradient-to-r from-spare-600 via-emerald-500 to-cyan-600 text-white font-black shadow-floating hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 overflow-hidden">
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <span className="relative flex items-center gap-1.5">+ Post Resource <span className="group-hover:translate-x-0.5 transition-transform">→</span></span>
        </Link>
      </div>

      {/* Search — glass */}
      <form onSubmit={handleSearch} className="mt-5 flex flex-wrap gap-3 glass-strong rounded-[20px] p-3 sm:p-4 shadow-glass">
        <div className="flex-1 min-w-[220px] relative group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-spare-600 transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
          </span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Arduino, textbook, lab kit… (BHC-aware semantics)" className="w-full pl-10 pr-3 py-3 rounded-xl glass-input text-sm font-medium placeholder:text-slate-400 focus-glow outline-none" />
        </div>
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} className="glass-input px-4 py-3 rounded-xl text-sm font-medium min-w-[160px]">
          <option value="">All categories</option>
          {CATEGORIES.map(c=> <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <button type="submit" className="px-7 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-black hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg> Search
        </button>
      </form>

      {/* BHC location chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {BHC.campusLocations.slice(0,6).map(l => (
          <span key={l.name} className="px-2.5 py-1 rounded-full bg-white border text-xs font-medium text-slate-600 hover:border-spare-200 hover:text-spare-700 hover:bg-spare-50 transition cursor-default">📍 {l.name}</span>
        ))}
        <span className="px-2.5 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">+{BHC.campusLocations.length - 6} more blocks</span>
      </div>

      {/* Grid — perspective + stagger */}
      <div className="mt-6 perspective">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="glass rounded-2xl overflow-hidden p-0 animate-pulse">
                <div className="h-48 bg-slate-200 shimmer" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
            {resources.map(r=>(
              <div key={r.id} className="group card-pro glass-reflection perspective">
                {/* Image */}
                <div className="relative image-zoom h-52 bg-slate-100 overflow-hidden">
                  {!failedImgs[r.id] && r.image_url ? (
                    <img
                      src={r.image_url}
                      alt={r.title}
                      loading="lazy"
                      onError={() => handleImgError(r.id)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full img-fallback flex flex-col items-center justify-center gap-2 p-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white text-xl">📦</div>
                      <span className="text-xs font-bold text-slate-500">Image unavailable • BHC verified</span>
                    </div>
                  )}
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                  {/* Top badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black backdrop-blur-xl border shadow-lg ${r.status==='available'?'bg-emerald-500/95 border-emerald-400 text-white':'bg-amber-500/95 border-amber-400 text-white'}`}>
                      ● {r.status.toUpperCase()}
                    </span>
                    <span className="hidden sm:inline-flex px-2 py-1 rounded-full bg-white/90 backdrop-blur border text-[11px] font-bold text-slate-700">BHC ✓</span>
                  </div>
                  <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                    {r.verification_code && (
                      <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xl border border-white/50 shadow-lg font-mono text-xs font-black text-slate-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> #{r.verification_code}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-bold backdrop-blur-xl border shadow ${r.condition==='new'?'bg-emerald-50/90 border-emerald-200 text-emerald-700': r.condition==='good'?'bg-white/90 border-white/50 text-slate-700':'bg-amber-50/90 border-amber-200 text-amber-700'}`}>
                      {r.condition === 'new' ? '✨ NEW' : r.condition === 'good' ? '✓ GOOD' : '◐ FAIR'}
                    </span>
                  </div>
                  {/* Bottom quick action on hover — FIXED to navigate */}
                  <div className="absolute bottom-3 left-3 right-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex gap-2">
                    <Link to={`/resources/${r.id}`} className="flex-1 py-2 rounded-xl bg-white/95 backdrop-blur text-center text-xs font-black text-slate-900 shadow-lg flex items-center justify-center gap-1.5 hover:bg-white">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> View details
                    </Link>
                    <span className="px-3 py-2 rounded-xl bg-slate-900/90 backdrop-blur text-white text-xs font-bold">₹{r.estimated_value}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 bg-gradient-to-b from-white/80 to-white/95 backdrop-blur">
                  <div className="flex justify-between items-start gap-2">
                    <Link to={`/resources/${r.id}`} className="font-black text-[15px] leading-tight text-slate-900 group-hover:text-spare-700 transition line-clamp-1 hover:underline">{r.title}</Link>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{r.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-full font-bold text-slate-700 hover:border-spare-200 hover:text-spare-700 transition">{r.category}</span>
                    <span className="text-xs bg-slate-900 text-white px-2.5 py-1 rounded-full font-bold">{r.lend_type}</span>
                    <span className="text-xs bg-gradient-to-r from-spare-500 to-emerald-500 text-white px-2.5 py-1 rounded-full font-black shadow-sm">₹{r.estimated_value.toLocaleString()}</span>
                    {r.security_deposit>0 && <span className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full font-bold">🔒 ₹{r.security_deposit}</span>}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black">{r.owner_name?.[0]}</span>
                    <span className="font-semibold text-slate-800">{r.owner_name}</span>
                    <span className="opacity-40">•</span>
                    <span className="truncate">{r.location_text}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">🛡️ ID required</span>
                    <span>Till {r.available_until || '—'}</span>
                    <Link to={`/resources/${r.id}`} className="ml-auto px-2.5 py-1 rounded-full bg-slate-900 text-white font-bold hover:bg-black transition">View →</Link>
                  </div>
                </div>
                {/* Bottom glow line */}
                <div className="h-1 bg-gradient-to-r from-spare-500 via-cyan-500 to-violet-500 opacity-0 group-hover:opacity-100 transition duration-500" />
              </div>
            ))}
          </div>
        )}
        {!loading && resources.length===0 && (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mx-auto">📭</div>
            <p className="text-slate-600 mt-3 font-medium">No BHC resources found. Be the first to post!</p>
            <Link to="/post-resource" className="mt-3 inline-flex px-5 py-2.5 rounded-full bg-slate-900 text-white font-bold">Post now →</Link>
          </div>
        )}
      </div>
      <p className="text-center text-xs text-slate-400 mt-6">Showing {resources.length} verified resources • Bishop Heber College, Vayalur Road, Puthur • 10.8188, 78.6754 • NAAC A++</p>
    </div>
  )
}
