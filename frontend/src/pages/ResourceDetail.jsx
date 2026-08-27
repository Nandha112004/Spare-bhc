import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import client from '../api/client'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { BHC } from '../utils/bhc'

export default function ResourceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [res, setRes] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgFailed, setImgFailed] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [needs, setNeeds] = useState([])
  const [selectedNeed, setSelectedNeed] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const r = await client.get(`/resources/${id}`)
        setRes(r.data)
        if (user) {
          const n = await client.get('/needs')
          setNeeds(n.data.filter(x => x.requester_name === user.name || x.requester_id === user?.id))
        }
      } catch (e) {
        toast.error('Resource not found')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, user])

  const handleRequest = async () => {
    if (!user) {
      toast.error('Please login to request')
      navigate('/login')
      return
    }
    if (res.owner_id === user.id || res.owner_email === user.email) {
      toast.error("You can't request your own resource")
      return
    }
    setRequesting(true)
    try {
      const payload = {
        resource_id: Number(id),
        need_id: selectedNeed ? Number(selectedNeed) : null,
        expected_return: new Date(Date.now() + 14 * 864e5).toISOString().split('T')[0],
      }
      const r = await client.post('/exchanges', payload)
      toast.success(`Request sent! Exchange #${r.data.id} • Pickup code ${res.verification_code}`)
      navigate(`/exchanges/${r.data.id}`)
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Request failed')
    } finally {
      setRequesting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="glass rounded-2xl p-8 animate-pulse">
          <div className="h-64 bg-slate-200 rounded-xl shimmer" />
          <div className="mt-4 h-6 bg-slate-200 rounded w-1/2" />
          <div className="mt-2 h-4 bg-slate-200 rounded w-3/4" />
        </div>
      </div>
    )
  }
  if (!res) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-center">
        <div className="glass rounded-2xl p-8">
          <div className="text-4xl">📭</div>
          <h2 className="mt-2 font-black text-xl">Resource not found</h2>
          <Link to="/resources" className="mt-4 inline-flex px-5 py-2.5 rounded-full bg-slate-900 text-white font-bold">Back to Resources</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <Link to="/resources" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg> Back to BHC Resources
      </Link>

      <div className="mt-4 grid lg:grid-cols-[1.25fr_0.85fr] gap-6 items-start">
        {/* Image + gallery */}
        <div className="space-y-4">
          <div className="relative glass-strong rounded-[24px] overflow-hidden group">
            <div className="relative h-[420px] bg-slate-100 overflow-hidden image-zoom">
              {!imgFailed && res.image_url ? (
                <img src={res.image_url} alt={res.title} onError={() => setImgFailed(true)} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full img-fallback flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-spare-600 to-cyan-600 flex items-center justify-center text-white text-2xl">📦</div>
                  <span className="text-sm font-bold text-slate-600">BHC verified • Image preview</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-black backdrop-blur-xl border shadow-lg ${res.status==='available'?'bg-emerald-500/95 border-emerald-400 text-white':'bg-amber-500/95 border-amber-400 text-white'}`}>● {res.status.toUpperCase()}</span>
                <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur border text-xs font-bold text-slate-800">{res.category}</span>
              </div>
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                <span className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur border shadow font-mono text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> #{res.verification_code}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur border ${res.condition==='new'?'bg-emerald-50/90 border-emerald-200 text-emerald-700':'bg-white/90 border-white/50 text-slate-700'}`}>{res.condition}</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="px-3 py-2 rounded-xl bg-slate-900/85 backdrop-blur text-white text-xs">
                  <div className="font-bold">{res.location_text}</div>
                  <div className="opacity-80 text-[11px]">{BHC.address} • {res.latitude?.toFixed(4)}, {res.longitude?.toFixed(4)}</div>
                </div>
                <div className="px-3 py-2 rounded-xl bg-white/95 backdrop-blur text-slate-900 font-black">₹{res.estimated_value?.toLocaleString()}</div>
              </div>
            </div>
            {/* Thumbs */}
            <div className="p-3 flex gap-2 overflow-auto">
              {[res.image_url, res.image_url, res.image_url].slice(0,3).map((u,i)=>(
                <div key={i} className={`w-20 h-16 rounded-xl overflow-hidden border-2 ${i===0?'border-spare-500':'border-white'} flex-shrink-0`}>
                  <img src={u} alt="" className="w-full h-full object-cover" onError={e=>e.target.style.display='none'} />
                </div>
              ))}
              <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> BHC verified • {res.is_verified}
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="font-black text-slate-900 flex items-center gap-2">📖 Description <span className="ml-auto text-xs px-2 py-1 rounded-full bg-slate-900 text-white">{res.lend_type}</span></h3>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed">{res.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border">
                <div className="font-bold text-slate-500 tracking-widest text-[10px]">OWNER</div>
                <div className="font-black text-slate-900 flex items-center gap-1.5 mt-1">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs">{res.owner_name?.[0]}</span> {res.owner_name}
                </div>
                <div className="text-slate-600 truncate">{res.owner_email}</div>
              </div>
              <div className="p-3 rounded-xl bg-white border">
                <div className="font-bold text-slate-500 tracking-widest text-[10px]">AVAILABILITY</div>
                <div className="font-bold text-slate-900 mt-1">{res.available_from} → {res.available_until}</div>
                <div className="text-slate-600">{res.max_borrow_days} days max • {res.lend_type}</div>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <div className="text-xs font-black text-amber-900 flex items-center gap-1.5">🛡️ Pickup instructions</div>
              <p className="text-xs text-amber-800 mt-1">{res.pickup_instructions || 'Bring student ID • verify code at handover at BHC gate'}</p>
              {res.security_deposit>0 && <div className="mt-1 text-xs font-bold text-amber-800">🔒 Security deposit ₹{res.security_deposit} (refundable)</div>}
            </div>
          </div>
        </div>

        {/* Action panel */}
        <div className="space-y-4 sticky top-[80px]">
          <div className="glass-strong rounded-[24px] p-6">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-black leading-tight text-slate-900">{res.title}</h1>
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-700">BHC ✓ VERIFIED</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">{res.category}</span>
              <span className="px-2.5 py-1 rounded-full bg-white border text-xs font-bold">{res.condition}</span>
              <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-spare-50 to-emerald-50 border border-spare-200 text-spare-700 text-xs font-black">₹{res.estimated_value?.toLocaleString()}</span>
              {res.serial_number && <span className="px-2.5 py-1 rounded-full bg-white border text-xs font-mono">SN {res.serial_number}</span>}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-white border">
                <div className="text-lg font-black text-slate-900">{res.verification_code}</div>
                <div className="text-[10px] font-bold tracking-widest text-slate-500">PICKUP CODE</div>
              </div>
              <div className="p-3 rounded-xl bg-white border">
                <div className="text-lg font-black text-slate-900">{res.max_borrow_days}d</div>
                <div className="text-[10px] font-bold tracking-widest text-slate-500">MAX BORROW</div>
              </div>
              <div className="p-3 rounded-xl bg-white border">
                <div className="text-lg font-black text-emerald-600">✓</div>
                <div className="text-[10px] font-bold tracking-widest text-slate-500">ID CHECK</div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {needs.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-widest text-slate-600">LINK TO YOUR NEED (OPTIONAL)</label>
                  <select value={selectedNeed} onChange={e=>setSelectedNeed(e.target.value)} className="w-full px-3 py-3 rounded-xl glass-input text-sm">
                    <option value="">— No need, just request —</option>
                    {needs.map(n=> <option key={n.id} value={n.id}>{n.title} • {n.category}</option>)}
                  </select>
                </div>
              )}
              <button onClick={handleRequest} disabled={requesting || res.status!=='available'} className="w-full py-3.5 rounded-xl btn-primary font-black flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {requesting ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> Requesting...</> : res.status!=='available' ? `Not available (${res.status})` : 'Request this resource →'}
              </button>
              <p className="text-xs text-slate-500 text-center">By requesting you agree to return on time and show BHC ID at {res.location_text}. QR will generate on owner accept.</p>
              <div className="flex gap-2">
                <Link to="/resources" className="flex-1 py-2.5 rounded-xl bg-white border text-center text-sm font-bold hover:bg-slate-50">Back</Link>
                <Link to="/heatmap" className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-center text-sm font-bold hover:bg-black">View on BHC Map</Link>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-slate-900 text-white flex gap-3">
              <span className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">🔒</span>
              <div className="text-xs">
                <div className="font-bold">Secure handover</div>
                <div className="opacity-80">Code #{res.verification_code} + QR • {res.contact_preference} • {BHC.phone}</div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="text-xs font-black tracking-widest text-slate-500">BHC CAMPUS INFO</div>
            <div className="mt-2 space-y-1.5 text-xs text-slate-700">
              <div>📍 {BHC.address}</div>
              <div>📞 {BHC.phone} • {BHC.email}</div>
              <div>🚌 {BHC.campus.busStop} • {BHC.campus.railway}</div>
              <div>🎓 {res.owner_name} — {BHC.departments.find(d=> d===res.category) || res.category} • BHC verified</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {BHC.campusLocations.slice(0,4).map(l=> <span key={l.name} className="px-2 py-1 rounded-full bg-white border text-[11px]">📍 {l.name}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
