import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import client from '../api/client'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function ExchangeDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [ex, setEx] = useState(null)
  const [qr, setQr] = useState(null)

  const load = async () => {
    try {
      const res = await client.get(`/exchanges/${id}`)
      setEx(res.data)
      if (res.data.qr_code) setQr(res.data.qr_code)
      else if (['accepted','active','completed','return_pending'].includes(res.data.status)) {
        const q = await client.get(`/exchanges/${id}/qr`)
        setQr(q.data.qr_code)
      }
    } catch (e) {
      toast.error('Failed to load')
    }
  }

  useEffect(()=>{ load() }, [id])

  const doAction = async (action) => {
    try {
      await client.put(`/exchanges/${id}/status`, { action })
      toast.success(`${action} done`)
      load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Action failed')
    }
  }

  if (!ex) return <div className="p-8 text-center">Loading exchange...</div>

  const isOwner = ex.owner_name===user.name || ex.owner_id===user?.id
  const isBorrower = ex.borrower_name===user.name || ex.borrower_id===user?.id

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <Link to="/dashboard" className="text-sm text-gray-600">← Back to Dashboard</Link>
      <div className="mt-3 bg-white border rounded-xl p-6">
        <div className="flex flex-wrap justify-between gap-3">
          <h1 className="text-xl font-bold">Exchange #{ex.id} — {ex.resource_title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-bold h-fit ${
            ex.status==='requested'?'bg-amber-100 text-amber-800': ex.status==='accepted'?'bg-blue-100 text-blue-800': ex.status==='active'?'bg-green-100 text-green-800': ex.status==='completed'?'bg-gray-800 text-white': 'bg-red-100 text-red-800'
          }`}>{ex.status}</span>
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Borrower: {ex.borrower_name} • Owner: {ex.owner_name} • Requested {new Date(ex.requested_at).toLocaleString()}
          {ex.expected_return && <span> • Return by {ex.expected_return}</span>}
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold">Workflow</h3>
            <ol className="mt-2 space-y-2 text-sm">
              <li className={`${['requested','accepted','active','return_pending','completed'].includes(ex.status)?'text-green-700 font-semibold':'text-gray-400'}`}>1. Requested {ex.status!=='requested'?'✓':''}</li>
              <li className={`${['accepted','active','return_pending','completed'].includes(ex.status)?'text-green-700 font-semibold':'text-gray-400'}`}>2. Accepted & QR Generated {['accepted','active','return_pending','completed'].includes(ex.status)?'✓':''}</li>
              <li className={`${['active','return_pending','completed'].includes(ex.status)?'text-green-700 font-semibold':'text-gray-400'}`}>3. Handed Over (Scanned) {['active','return_pending','completed'].includes(ex.status)?'✓':''}</li>
              <li className={`${['completed'].includes(ex.status)?'text-green-700 font-semibold':'text-gray-400'}`}>4. Returned & Completed {ex.status==='completed'?'✓':''}</li>
            </ol>

            <div className="mt-4 flex flex-wrap gap-2">
              {ex.status==='requested' && isOwner && (
                <>
                  <button onClick={()=>doAction('accept')} className="px-4 py-2 bg-spare-600 text-white rounded-lg text-sm">Accept</button>
                  <button onClick={()=>doAction('decline')} className="px-4 py-2 bg-white border rounded-lg text-sm">Decline</button>
                </>
              )}
              {ex.status==='accepted' && (
                <button onClick={()=>doAction('handover')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Scan QR / Confirm Handover</button>
              )}
              {ex.status==='active' && isBorrower && (
                <button onClick={()=>doAction('return')} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm">Mark as Returned</button>
              )}
              {ex.status==='return_pending' && isOwner && (
                <button onClick={()=>doAction('complete')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Confirm Return (Complete)</button>
              )}
              {ex.status==='requested' && (isOwner||isBorrower) && (
                <button onClick={()=>doAction('cancel')} className="px-4 py-2 bg-white border rounded-lg text-sm">Cancel</button>
              )}
            </div>

            <div className="mt-4 bg-gray-50 border rounded-lg p-3 text-xs">
              <b>Demo simulation:</b> “Scan QR” is a button — no camera needed for hackathon. In production, owner scans borrower’s QR with phone camera.
            </div>
          </div>

          <div className="bg-gray-50 border rounded-xl p-4 text-center">
            <div className="text-sm font-semibold">QR Code for Handover</div>
            {qr ? (
              <>
                <img src={qr} alt="QR" className="w-56 h-56 mx-auto mt-3 bg-white p-2 rounded-lg border" />
                <div className="text-xs text-gray-600 mt-2">Payload: SPARE-EXCHANGE-{ex.id}</div>
                <div className="text-xs text-gray-500">Owner scans this to confirm pickup</div>
                <button onClick={async()=>{ try{ await client.post(`/exchanges/${id}/scan`); toast.success('Scanned!'); load()} catch(e){ toast.error(e.response?.data?.detail||'Scan failed')}}} className="mt-3 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs">Simulate Scan</button>
              </>
            ) : (
              <div className="mt-6 text-sm text-gray-500">QR will appear once owner accepts the request.</div>
            )}
              <div className="mt-4 text-xs text-left bg-white border rounded p-2">
                <div>Exchange ID: {ex.id}</div>
                <div>Status: {ex.status}</div>
                <div>Accepted: {ex.accepted_at ? new Date(ex.accepted_at).toLocaleString() : '—'}</div>
                <div>Returned: {ex.returned_at ? new Date(ex.returned_at).toLocaleString() : '—'}</div>
              </div>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-spare-50 border border-spare-200 rounded-xl p-4 text-sm">
        Return tracking: borrower taps “Mark as Returned”, owner confirms. Dashboard updates sustainability stats instantly.
      </div>
    </div>
  )
}
