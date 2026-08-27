import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Layout/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PostResource from './pages/PostResource'
import PostNeed from './pages/PostNeed'
import Resources from './pages/Resources'
import ResourceDetail from './pages/ResourceDetail'
import Needs from './pages/Needs'
import MatchList from './pages/MatchList'
import ExchangeDetail from './pages/ExchangeDetail'
import AdminHeatmap from './pages/AdminHeatmap'
import { useAuth } from './context/AuthContext'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#f8fafc] relative">
      {/* Global subtle background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30" />
        <div className="absolute inset-0 animated-grid opacity-[0.25]" />
      </div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/resources/:id" element={<ResourceDetail />} />
        <Route path="/needs" element={<Needs />} />
        <Route path="/post-resource" element={<Protected><PostResource /></Protected>} />
        <Route path="/post-need" element={<Protected><PostNeed /></Protected>} />
        <Route path="/matches" element={<MatchList />} />
        <Route path="/exchanges/:id" element={<Protected><ExchangeDetail /></Protected>} />
        <Route path="/heatmap" element={<AdminHeatmap />} />
        <Route path="*" element={<div className="p-12 text-center"><div className="glass inline-block px-6 py-4 rounded-2xl">404 — Not Found</div></div>} />
      </Routes>
      <footer className="mt-12">
        <div className="glass border-t border-white/50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-spare-600 to-cyan-600 flex items-center justify-center text-white font-black text-xs">S</span>
                <span className="font-bold text-slate-900">SPARE × BHC</span>
                <span className="hidden sm:inline text-slate-500">Bishop Heber College (Autonomous), Tiruchirappalli • 620017 • bhc.edu.in</span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> 10.8188, 78.6754</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="px-2.5 py-1 rounded-full bg-white border">23 Depts • NAAC A++</span>
                <span className="px-2.5 py-1 rounded-full bg-white border">React + FastAPI + Semantic AI</span>
                <span className="hidden sm:inline px-2.5 py-1 rounded-full bg-white border">QR • Puthur Nal Rd 400m</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
