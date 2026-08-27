import { useSearchParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import client from '../api/client'
import toast from 'react-hot-toast'

export default function MatchList() {
  const [params] = useSearchParams()
  const needId = params.get('need_id')
  const [need, setNeed] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if (!needId) return
    const load = async () => {
      setLoading(true)
      try {
        const [nRes, mRes] = await Promise.all([
          client.get(`/needs/${needId}`),
          client.get('/matches', { params: { need_id: needId, top_k: 10 } })
        ])
        setNeed(nRes.data)
        setMatches(mRes.data)
      } catch (e) {
        toast.error('Failed to load matches')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [needId])

  const requestResource = async (resource) => {
    try {
      const expected = new Date(Date.now()+14*864e5).toISOString().split('T')[0]
      const res = await client.post('/exchanges', { resource_id: resource.id, need_id: Number(needId), expected_return: expected })
      toast.success(`Requested "${resource.title}"! Exchange #${res.data.id} created.`)
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Request failed')
    }
  }

  if (!needId) return <div className="max-w-3xl mx-auto mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">No need_id provided. Go to <Link to="/needs" className="text-spare-600 font-bold">Needs</Link> and click “Find Matches”.</div>
  if (loading) return <div className="p-8 text-center">Computing smart matches...</div>

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      <Link to="/needs" className="text-sm text-gray-600">← Back to Needs</Link>
      <div className="mt-2 bg-gradient-to-r from-spare-600 to-cyan-600 text-white rounded-xl p-5">
        <div className="text-sm opacity-80">Results for need #{need.id}</div>
        <h1 className="text-xl font-bold">“{need.title}”</h1>
        <p className="text-sm opacity-90 mt-1">{need.description} • {need.category} • Needed by {need.needed_by || '—'}</p>
        <div className="mt-3 inline-flex items-center gap-2 bg-white text-spare-700 px-3 py-1.5 rounded-full text-sm font-bold">
          ⚡ Before buying: {matches.length} compatible resources found
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {matches.length===0 ? <div className="bg-white border rounded-xl p-8 text-center text-gray-500">No compatible resources yet. Try adjusting category or check <Link to="/resources" className="text-spare-600 font-bold">all resources</Link>.</div> : matches.map((m, idx)=>(
          <div key={m.resource.id} className="bg-white border rounded-xl p-4 flex gap-4 hover:shadow transition">
            <div className="hidden sm:block text-center min-w-[56px]">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-white ${m.match_score>=80?'bg-green-600': m.match_score>=60?'bg-amber-500':'bg-gray-400'}`}>{m.match_score}%</div>
              <div className="text-xs text-gray-500 mt-1">#{idx+1} match</div>
            </div>
            <img src={m.resource.image_url} alt="" className="w-24 h-24 rounded-lg object-cover border" />
            <div className="flex-1">
              <div className="flex flex-wrap justify-between gap-2">
                <h3 className="font-bold">{m.resource.title}</h3>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded h-fit">{m.resource.lend_type} • {m.resource.status}</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{m.resource.description}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="bg-spare-50 text-spare-700 px-2 py-1 rounded">Semantic {m.semantic_score*100|0}%</span>
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">Category {m.category_score*100|0}%</span>
                {m.distance_km!=null && <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded">{m.distance_km} km away</span>}
                <span className="bg-gray-100 px-2 py-1 rounded">{m.resource.location_text}</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">Owner: {m.resource.owner_name} • ₹{m.resource.estimated_value} • Available till {m.resource.available_until}</div>
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer text-spare-600 font-semibold">Why this match?</summary>
                <ul className="list-disc ml-5 mt-1 text-gray-600">
                  {m.reasons.map((r,i)=><li key={i}>{r}</li>)}
                </ul>
              </details>
            </div>
            <div className="flex flex-col gap-2 self-center">
              <span className="sm:hidden text-center font-extrabold text-lg">{m.match_score}%</span>
              <button onClick={()=>requestResource(m.resource)} className="px-4 py-2 bg-spare-600 text-white rounded-lg text-sm font-semibold hover:bg-spare-700">Request</button>
              <span className="text-xs text-gray-500 text-center">650m–1.2km typical</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
        <b>How matching works:</b> 50% semantic (TF-IDF + MiniLM if installed), 25% category overlap, 15% distance (exp decay), 10% time availability. Arduino kit ↔ microcontroller board scores ~85% even without exact keyword.
      </div>
    </div>
  )
}
