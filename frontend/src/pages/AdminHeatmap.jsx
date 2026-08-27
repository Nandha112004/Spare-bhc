import { useEffect, useState } from 'react'
import client from '../api/client'
import HeatmapMap from '../components/Map/HeatmapMap'

export default function AdminHeatmap() {
  const [points, setPoints] = useState([])
  const [filter, setFilter] = useState('all')
  const [stats, setStats] = useState(null)

  useEffect(()=>{
    client.get('/heatmap').then(r=>setPoints(r.data)).catch(()=>{})
    client.get('/dashboard/stats').then(r=>setStats(r.data)).catch(()=>{})
  }, [])

  const filtered = points.filter(p=> filter==='all' ? true : p.type===filter)

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <h1 className="text-2xl font-bold">Campus Resource Heatmap</h1>
      <p className="text-sm text-gray-600">Visualize supply/demand hotspots. Green = resources, Red = needs. Leaflet + OpenStreetMap, no API key.</p>

      {stats && (
        <div className="mt-4 grid grid-cols-3 gap-3 max-w-xl">
          <div className="bg-white border rounded-lg p-3 text-center"><div className="text-lg font-bold">{stats.total_resources}</div><div className="text-xs text-gray-600">Resources</div></div>
          <div className="bg-white border rounded-lg p-3 text-center"><div className="text-lg font-bold">{stats.total_needs}</div><div className="text-xs text-gray-600">Needs</div></div>
          <div className="bg-white border rounded-lg p-3 text-center"><div className="text-lg font-bold">{filtered.length}</div><div className="text-xs text-gray-600">Pins shown</div></div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button onClick={()=>setFilter('all')} className={`px-3 py-1.5 rounded-lg text-sm border ${filter==='all'?'bg-gray-900 text-white':'bg-white'}`}>All</button>
        <button onClick={()=>setFilter('resource')} className={`px-3 py-1.5 rounded-lg text-sm border ${filter==='resource'?'bg-green-600 text-white':'bg-white'}`}>🔵 Resources</button>
        <button onClick={()=>setFilter('need')} className={`px-3 py-1.5 rounded-lg text-sm border ${filter==='need'?'bg-red-600 text-white':'bg-white'}`}>🔴 Needs</button>
      </div>

      <div className="mt-4">
        <HeatmapMap points={filtered} />
      </div>

      <div className="mt-4 bg-white border rounded-xl p-4">
        <h3 className="font-semibold text-sm">Legend & Filters</h3>
        <div className="text-xs text-gray-600 mt-1">Category filter coming soon. For demo, all pins are shown. Clustering optional with markerCluster.</div>
        <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs max-h-64 overflow-auto">
          {filtered.map(p=> (
            <div key={`${p.type}-${p.id}`} className="flex justify-between border rounded px-2 py-1">
              <span>{p.type==='resource'?'🟢':'🔴'} {p.title} — {p.category}</span><span className="text-gray-500">{p.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
