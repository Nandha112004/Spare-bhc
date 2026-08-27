import { useEffect, useState } from 'react'
import client from '../api/client'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [resources, setResources] = useState([])
  const [needs, setNeeds] = useState([])
  const [exchanges, setExchanges] = useState([])

  const load = async () => {
    try {
      const [s, r, n, e] = await Promise.all([
        client.get('/dashboard/stats'),
        client.get('/resources'),
        client.get('/needs'),
        client.get('/exchanges'),
      ])
      setStats(s.data)
      // filter my items client side (backend returns all)
      setResources(r.data.filter(x=>x.owner_id===s.data.my_resources || true).filter(x=> x.owner_email===user.email)) // simpler: fetch all and filter by current user email
      // Actually get user id from stats? use my_resources count not enough. Let's filter by owner_email
      // refetch with proper filtering: we already have user email
      setResources(r.data.filter(x=> x.owner_email===user.email))
      setNeeds(n.data.filter(x=> x.requester_name===user.name))
      setExchanges(e.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(()=>{ load() }, [])

  const handleStatus = async (id, action) => {
    try {
      await client.put(`/exchanges/${id}/status`, { action })
      toast.success(`Exchange ${action} successful`)
      load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Action failed')
    }
  }

  if (!stats) return <div className="p-8 text-center">Loading dashboard...</div>

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome, {user.name} • {user.department}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/post-resource" className="px-4 py-2 bg-spare-600 text-white rounded-lg font-semibold">+ Post Resource</Link>
          <Link to="/post-need" className="px-4 py-2 bg-white border rounded-lg font-semibold">+ Post Need</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white border rounded-xl p-4">
          <div className="text-xs text-gray-500">My Resources</div><div className="text-2xl font-extrabold">{stats.my_resources}</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-xs text-gray-500">My Needs</div><div className="text-2xl font-extrabold">{stats.my_needs}</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-xs text-gray-500">Active Exchanges</div><div className="text-2xl font-extrabold">{stats.my_active_exchanges}</div>
        </div>
        <div className="bg-gradient-to-br from-spare-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="text-xs opacity-80">Impact • Money Saved</div><div className="text-xl font-extrabold">₹{stats.money_saved.toLocaleString()}</div><div className="text-xs opacity-80">{stats.items_reused} items reused campus-wide</div>
        </div>
      </div>

      {/* Exchanges */}
      <div className="mt-8">
        <h2 className="font-bold text-lg">Active Loans & Requests</h2>
        {exchanges.length===0 ? <p className="text-sm text-gray-500 mt-2">No exchanges yet. Post a need and request a resource to start.</p> : (
          <div className="mt-3 grid gap-3">
            {exchanges.map(ex=>(
              <div key={ex.id} className="bg-white border rounded-xl p-4 flex flex-wrap justify-between gap-3">
                <div>
                  <div className="font-semibold">Exchange #{ex.id} • {ex.resource_title || 'Resource'} <span className={`ml-2 px-2 py-0.5 text-xs rounded-full font-bold ${
                    ex.status==='requested'?'bg-amber-100 text-amber-800': ex.status==='accepted'?'bg-blue-100 text-blue-800': ex.status==='active'?'bg-green-100 text-green-800': ex.status==='completed'?'bg-gray-200 text-gray-700':'bg-red-100 text-red-800'
                  }`}>{ex.status}</span></div>
                  <div className="text-xs text-gray-600">Borrower: {ex.borrower_name} • Owner: {ex.owner_name} {ex.expected_return?`• Return by ${ex.expected_return}`:''}</div>
                  {ex.qr_code && ex.status!=='completed' && ex.status!=='cancelled' && (
                    <img src={ex.qr_code} alt="QR" className="w-24 h-24 mt-2 border rounded" />
                  )}
                </div>
                <div className="flex flex-col gap-2 self-start">
                  <Link to={`/exchanges/${ex.id}`} className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm text-center">View Detail</Link>
                  {ex.status==='requested' && ex.owner_name===user.name && (
                    <div className="flex gap-2">
                      <button onClick={()=>handleStatus(ex.id,'accept')} className="px-3 py-1.5 bg-spare-600 text-white rounded-lg text-xs">Accept</button>
                      <button onClick={()=>handleStatus(ex.id,'decline')} className="px-3 py-1.5 bg-white border rounded-lg text-xs">Decline</button>
                    </div>
                  )}
                  {ex.status==='accepted' && (
                    <button onClick={()=>handleStatus(ex.id,'handover')} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs">Confirm Handover (Scan QR)</button>
                  )}
                  {ex.status==='active' && ex.borrower_name===user.name && (
                    <button onClick={()=>handleStatus(ex.id,'return')} className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs">Mark Returned</button>
                  )}
                  {ex.status==='return_pending' && ex.owner_name===user.name && (
                    <button onClick={()=>handleStatus(ex.id,'complete')} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs">Confirm Return</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-bold">My Resources ({resources.length})</h3>
          <div className="mt-3 space-y-2">
            {resources.length===0 ? <p className="text-sm text-gray-500">No resources posted yet.</p> : resources.map(r=>(
              <div key={r.id} className="flex gap-3 border rounded-lg p-3">
                <img src={r.image_url} alt="" className="w-14 h-14 rounded object-cover" />
                <div className="flex-1">
                  <div className="font-semibold text-sm">{r.title}</div>
                  <div className="text-xs text-gray-600">{r.category} • {r.status} • {r.location_text}</div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/resources" className="text-sm text-spare-600 font-semibold mt-3 inline-block">Browse all resources →</Link>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <h3 className="font-bold">My Needs ({needs.length})</h3>
          <div className="mt-3 space-y-2">
            {needs.length===0 ? <p className="text-sm text-gray-500">No needs posted yet.</p> : needs.map(n=>(
              <div key={n.id} className="border rounded-lg p-3">
                <div className="font-semibold text-sm">{n.title}</div>
                <div className="text-xs text-gray-600">{n.category} • {n.status} {n.needed_by?`• needed by ${n.needed_by}`:''}</div>
                <Link to={`/matches?need_id=${n.id}`} className="text-xs bg-spare-600 text-white px-2 py-1 rounded mt-2 inline-block">Find Matches</Link>
              </div>
            ))}
          </div>
          <Link to="/needs" className="text-sm text-spare-600 font-semibold mt-3 inline-block">Browse all needs →</Link>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
        <b>Sustainability Impact:</b> ₹{stats.money_saved.toLocaleString()} saved, {stats.items_reused} items reused, {stats.total_exchanges} total exchanges campus-wide. Keep sharing!
      </div>
    </div>
  )
}
