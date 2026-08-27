import { useEffect, useState } from 'react'
import client from '../api/client'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../utils/categories'

export default function Needs() {
  const [needs, setNeeds] = useState([])
  const [filterCat, setFilterCat] = useState('')
  const [search, setSearch] = useState('')

  const load = async () => {
    const params = {}
    if (filterCat) params.category = filterCat
    if (search) params.search = search
    const res = await client.get('/needs', { params })
    setNeeds(res.data)
  }

  useEffect(()=>{ load() }, [filterCat])

  const handleSearch = (e) => { e.preventDefault(); load() }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex flex-wrap justify-between gap-4 items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Open Needs</h1>
          <p className="text-xs text-slate-500 font-semibold tracking-widest">TRUST-SCORED • URGENCY TAGGED</p>
        </div>
        <Link to="/post-need" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-600 to-violet-600 text-white font-bold shadow-lg hover:scale-[1.02] transition">+ Post Need</Link>
      </div>

      <form onSubmit={handleSearch} className="mt-4 flex flex-wrap gap-3 glass-strong rounded-2xl p-4">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search needs..." className="flex-1 min-w-[200px] glass-input px-3 py-2.5 rounded-xl" />
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} className="glass-input px-3 py-2.5 rounded-xl">
          <option value="">All categories</option>
          {CATEGORIES.map(c=> <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <button type="submit" className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition">Search</button>
      </form>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {needs.map(n=>(
          <div key={n.id} className="glass rounded-2xl p-4 card-lift group">
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-cyan-700 transition line-clamp-1">{n.title}</h3>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold border backdrop-blur ${n.status==='open'?'bg-emerald-50 border-emerald-200 text-emerald-700':'bg-slate-100 border-slate-200 text-slate-600'}`}>{n.status}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.description}</p>
            {n.purpose && <p className="text-xs text-slate-500 mt-1 line-clamp-1">🎯 {n.purpose}</p>}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="text-xs bg-white border px-2.5 py-1 rounded-full font-medium">{n.category}</span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${n.urgency==='urgent'?'bg-red-50 border-red-200 text-red-700': n.urgency==='high'?'bg-orange-50 border-orange-200 text-orange-700':'bg-amber-50 border-amber-200 text-amber-700'}`}>{n.urgency || 'medium'}</span>
              {n.needed_by && <span className="text-xs bg-white border px-2.5 py-1 rounded-full">📅 {n.needed_by}</span>}
            </div>
            <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">📍 {n.location_text} • {n.requester_name}</div>
            <Link to={`/matches?need_id=${n.id}`} className="mt-3 flex items-center justify-center gap-1.5 w-full text-center px-3 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black hover:shadow transition">Find Matches <span className="group-hover:translate-x-0.5 transition">→</span></Link>
          </div>
        ))}
      </div>
      {needs.length===0 && <p className="text-center text-gray-500 mt-8">No needs found.</p>}
    </div>
  )
}
