import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const loc = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLink = (to, label) => {
    const active = loc.pathname === to
    return (
      <Link
        to={to}
        className={`relative px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 group ${
          active
            ? 'bg-slate-900 text-white shadow-md'
            : 'text-slate-700 hover:bg-white/80 hover:shadow-sm hover:text-slate-900'
        }`}
      >
        <span className="relative z-10">{label}</span>
        {!active && <span className="absolute inset-0 rounded-full bg-gradient-to-r from-spare-500/0 to-cyan-500/0 group-hover:from-spare-500/10 group-hover:to-cyan-500/10 transition-all duration-300" />}
      </Link>
    )
  }

  return (
    <nav className="sticky top-0 z-50 nav-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[68px] items-center gap-4">
          {/* Logo - glass + gradient + hover */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-spare-600 to-cyan-600 rounded-xl blur-[6px] opacity-60 group-hover:opacity-80 group-hover:blur-[8px] transition-all duration-300" />
              <div className="relative w-9 h-9 bg-gradient-to-br from-spare-600 to-cyan-600 rounded-xl flex items-center justify-center text-white font-black text-[18px] shadow-lg group-hover:scale-105 group-hover:rotate-[-3deg] transition-all duration-300">
                S
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse-slow" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[20px] tracking-tight leading-none bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent group-hover:from-spare-600 group-hover:to-cyan-600 transition-all duration-300">
                SPARE
              </span>
              <span className="hidden sm:block text-[10px] tracking-widest font-semibold text-slate-500 -mt-0.5 flex items-center gap-1">
                BISHOP HEBER COLLEGE • TRICHY <span className="hidden xl:inline opacity-60">— Vayalur Rd, Puthur 620017</span>
              </span>
            </div>
            <span className="hidden lg:inline-flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> BHC • NAAC A++
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1.5">
            {user ? (
              <>
                <div className="flex items-center gap-1 p-1 rounded-full bg-white/60 backdrop-blur border border-white/50 shadow-sm">
                  {navLink('/', 'Home')}
                  {navLink('/dashboard', 'Dashboard')}
                  {navLink('/resources', 'Resources')}
                  {navLink('/needs', 'Needs')}
                  {navLink('/heatmap', 'Heatmap')}
                </div>
                <div className="h-6 w-px bg-slate-200 mx-2" />
                <div className="flex items-center gap-2 pl-2">
                  <div className="hidden xl:flex flex-col items-end leading-tight">
                    <span className="text-sm font-bold text-slate-900">{user.name}</span>
                    <span className="text-xs text-slate-500">{user.department} • {user.email?.split('@')[0]}</span>
                  </div>
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-1 px-3.5 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-black hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 hover:bg-white/80 hover:shadow transition-all">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="group relative px-5 py-2.5 rounded-full bg-gradient-to-r from-spare-600 to-emerald-500 text-white text-sm font-bold shadow-floating hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-1.5">Register <span className="group-hover:translate-x-0.5 transition-transform">→</span></span>
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 rounded-xl bg-white/80 border border-white/50 flex items-center justify-center text-slate-700 hover:bg-white transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-slide-up">
            <div className="glass rounded-2xl p-3 flex flex-col gap-1.5">
              {user ? (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">{user.name?.[0]}</div>
                    <div>
                      <div className="font-bold text-sm">{user.name}</div>
                      <div className="text-xs opacity-80">{user.department} • {user.email}</div>
                    </div>
                  </div>
                  <Link to="/" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-white/80 font-medium">Home</Link>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-white/80 font-medium">Dashboard</Link>
                  <Link to="/resources" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-white/80 font-medium">Resources</Link>
                  <Link to="/needs" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-white/80 font-medium">Needs</Link>
                  <Link to="/heatmap" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-white/80 font-medium">Heatmap</Link>
                  <button onClick={handleLogout} className="mt-2 w-full py-3 rounded-xl bg-slate-900 text-white font-semibold">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl bg-white font-semibold text-center border">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl bg-gradient-to-r from-spare-600 to-emerald-500 text-white font-bold text-center">Register →</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
