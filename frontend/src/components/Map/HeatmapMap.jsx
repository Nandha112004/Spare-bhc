import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useEffect, useState } from 'react'
import client from '../../api/client'

// Fix leaflet default icon issue in Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

export default function HeatmapMap({ points }) {
  if (!points || points.length === 0) {
    return <div className="bg-gray-50 border rounded-lg p-8 text-center text-gray-500">No locations to display yet. Post resources/needs to populate the map.</div>
  }
  const center = [points[0].latitude, points[0].longitude]
  return (
    <MapContainer center={center} zoom={14} style={{ height: '520px', width: '100%' }} className="rounded-xl overflow-hidden border">
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p) => (
        <Marker key={`${p.type}-${p.id}`} position={[p.latitude, p.longitude]} icon={p.type === 'resource' ? greenIcon : redIcon}>
          <Popup>
            <div className="text-sm">
              <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold mb-1 ${p.type === 'resource' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{p.type.toUpperCase()}</div>
              <div className="font-semibold">{p.title}</div>
              <div className="text-gray-600">{p.category} • {p.status}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
