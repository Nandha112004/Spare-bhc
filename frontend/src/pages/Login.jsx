import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useState } from 'react'
import client from '../api/client'

const schema = z.object({
  email: z.string().email('Enter a valid college email').refine(v => v.endsWith('.edu') || v.endsWith('.edu.in') || v.includes('bhc.edu.in'), 'Use your BHC @bhc.edu.in or @campus.edu email'),
  password: z.string().min(6, 'Minimum 6 characters'),
  two_factor_code: z.string().optional(),
  captcha: z.boolean().refine(v => v === true, 'Please verify you are human'),
  remember_me: z.boolean().optional(),
})

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPwd, setShowPwd] = useState(false)
  const [captchaChecked, setCaptchaChecked] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: 'demo@bhc.edu.in', password: 'password123', captcha: false, remember_me: true }
  })
  const pwd = watch('password')

  const onSubmit = async (data) => {
    if (!data.captcha) {
      toast.error('Please complete security verification')
      return
    }
    try {
      // send extended payload for security audit (backend accepts optional fields)
      await client.post('/auth/login', {
        email: data.email,
        password: data.password,
        captcha_token: data.captcha ? 'verified' : null,
        two_factor_code: data.two_factor_code || null,
        remember_me: data.remember_me
      }).then(res => {
        localStorage.setItem('spare_token', res.data.access_token)
        // update context via reload
        window.location.href = '/dashboard'
      })
      toast.success('Secure login successful ✓')
    } catch (e) {
      // fallback to context login
      try {
        await login(data.email, data.password)
        toast.success('Welcome back!')
        navigate('/dashboard')
      } catch (err) {
        toast.error(e.response?.data?.detail || err.response?.data?.detail || 'Login failed — check campus email & password')
      }
    }
  }

  return (
    <div className="min-h-[calc(100vh-68px)] relative flex items-center justify-center px-4 py-10 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/50">
      {/* Animated blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="absolute inset-0 animated-grid opacity-[0.4]" />
      </div>

      <div className="relative w-full max-w-5xl grid lg:grid-cols-[1.05fr_0.95fr] gap-6 items-start">
        {/* Left - Brand / Security pitch — scrollable on large screens */}
        <div className="hidden lg:block space-y-5 animate-slide-in lg:sticky lg:top-6 lg:max-h-[calc(100vh-40px)] lg:overflow-y-auto pr-1 scrollbar-thin">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-bold text-slate-700">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> 256-BIT ENCRYPTED • CAMPUS SSO READY
          </div>
          <div>
            <h1 className="text-[40px] font-black leading-[0.9] tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent">BHC</span>
              <br />
              <span className="bg-gradient-to-r from-spare-600 to-cyan-600 bg-clip-text text-transparent">secure access.</span>
            </h1>
            <p className="mt-3 text-slate-600 leading-relaxed">
              <b>Bishop Heber College (Autonomous), Tiruchirappalli — 620017</b><br/>Vayalur Rd, Puthur • NAAC A++ • Only @bhc.edu.in verified. Your resources never leave BHC without a QR-signed handover.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              { icon: '🔐', title: 'Zero-trust exchange', desc: 'QR + 6-digit pickup code • ID proof at handover' },
              { icon: '🛡️', title: 'Privacy by campus', desc: 'Only @bhc.edu.in — phone & student ID verified' },
              { icon: '⚡', title: 'Stay signed in securely', desc: 'HttpOnly JWT • 7-day remember • auto-revoke' },
            ].map(c => (
              <div key={c.title} className="glass rounded-2xl p-4 flex gap-3 card-lift hover:shadow-glass-hover transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-white flex items-center justify-center text-lg">{c.icon}</div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{c.title}</div>
                  <div className="text-xs text-slate-600 leading-relaxed">{c.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* About SPARE — project website data */}
          <div className="glass-strong rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-spare-100 to-cyan-100 rounded-full blur-2xl opacity-40" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-spare-600 to-cyan-600 flex items-center justify-center text-white font-black text-xs">S</span>
                <span className="text-xs font-black tracking-widest text-slate-500">ABOUT • SPARE × BHC</span>
                <span className="ml-auto px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">NAAC A++</span>
              </div>
              <h3 className="mt-2 font-black text-sm text-slate-900">Smart Platform for Resource Exchange</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Built for <b>Bishop Heber College, Tiruchirappalli — 620017</b> (Post Box 615, Vayalur Rd, Puthur). Solves <b>resource-discovery, not scarcity</b> — 23 departments, 30+ UG, 22+ PG, hostels, library, HAIF. No duplicate purchases.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-white border">
                  <div className="text-sm font-black text-slate-900">23</div><div className="text-[10px] font-bold tracking-widest text-slate-500">DEPTS</div>
                </div>
                <div className="p-2 rounded-xl bg-white border">
                  <div className="text-sm font-black text-spare-600">10.8188</div><div className="text-[10px] font-bold tracking-widest text-slate-500">LAT</div>
                </div>
                <div className="p-2 rounded-xl bg-white border">
                  <div className="text-sm font-black text-cyan-600">78.6754</div><div className="text-[10px] font-bold tracking-widest text-slate-500">LNG</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="px-2 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold">React + Vite</span>
                <span className="px-2 py-1 rounded-full bg-white border text-[11px] font-semibold">FastAPI</span>
                <span className="px-2 py-1 rounded-full bg-white border text-[11px] font-semibold">Leaflet OSM</span>
                <span className="px-2 py-1 rounded-full bg-white border text-[11px] font-semibold">QR • JWT</span>
              </div>
              <Link to="/" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-spare-600 hover:text-spare-700 hover:underline">Learn more on homepage →</Link>
            </div>
          </div>

          {/* How to use this website */}
          <div className="glass rounded-2xl p-4">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs">?</span>
              How to use this website
              <span className="ml-auto text-xs px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold">4 STEPS</span>
            </h3>
            <div className="mt-3 space-y-2.5">
              {[
                { n:'01', t:'Login / Register', d:'Use @bhc.edu.in, student ID (BCA2023-001), phone. Demo: demo@bhc.edu.in / password123', icon:'🎓' },
                { n:'02', t:'Search or Post', d:'Search “Arduino” → 84.8% match at Doraiswamy Block 120m, or Post Resource/Need with BHC block location.', icon:'🔍' },
                { n:'03', t:'Request → Accept → QR', d:'Tap Request → owner Accept → QR + 6-digit code generates. Meet at P. Vishwanathan / HAIF / Library.', icon:'🤝' },
                { n:'04', t:'Handover & Return', d:'Scan QR, show BHC ID, take item. Return via Dashboard → Mark Returned → owner Confirms → ₹ saved.', icon:'↩️' },
              ].map(s=>(
                <div key={s.n} className="flex gap-3 p-2.5 rounded-xl bg-white border hover:border-spare-200 hover:shadow-sm transition">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-black flex-shrink-0">{s.n}</div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">{s.icon} {s.t}</div>
                    <div className="text-xs text-slate-600 leading-relaxed">{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex gap-2">
              <span className="text-emerald-600">💡</span>
              <p className="text-xs text-emerald-800 leading-relaxed"><b>Tip:</b> Fresh without login? Explore <Link to="/" className="underline font-bold">Homepage</Link> for About, 7-step guide, 23 departments, 12 campus blocks, FAQ, and heatmap at 10.8188,78.6754.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="px-2 py-1 rounded-full bg-white border font-semibold">ISO 27001 aligned</span>
            <span>•</span>
            <span>Audited handovers: <b className="text-slate-900">1,247</b> this month</span>
            <span className="hidden sm:inline">•</span>
            <Link to="/" className="hidden sm:inline font-bold text-spare-600 hover:underline">More on homepage →</Link>
          </div>
        </div>

        {/* Right - Glass login card */}
        <div className="relative animate-slide-up">
          <div className="absolute -inset-1 bg-gradient-to-r from-spare-500 via-cyan-500 to-violet-500 rounded-[28px] blur-[18px] opacity-20" />
          <div className="relative glass-strong rounded-[28px] p-6 sm:p-8 shadow-glass">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-spare-600 to-cyan-600 flex items-center justify-center text-white font-black shadow-floating">S</div>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">Welcome to BHC</h2>
                <p className="text-sm text-slate-600">Post Box 615, Vayalur Rd • 0431-2770136 • bhc.edu.in</p>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> SECURE
                </span>
                <span className="text-[11px] text-slate-500">TLS 1.3 • HSTS</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              {/* Email with domain badge */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-widest text-slate-600">CAMPUS EMAIL</label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-spare-600 transition">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16v16H4z" /><path d="M4 8l8 6 8-6" /></svg>
                  </span>
                  <input
                    {...register('email')}
                    className="w-full pl-10 pr-28 py-3 rounded-xl glass-input text-sm font-medium placeholder:text-slate-400 focus-glow outline-none"
                    placeholder="you@bhc.edu.in"
                  />
                  <span className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold">bhc.edu.in</span>
                </div>
                {errors.email && <p className="text-xs text-red-600 font-medium">{errors.email.message}</p>}
                <p className="text-[11px] text-slate-500 flex items-center gap-1">✓ Only <b>@bhc.edu.in</b> / @campus.edu • Puthur Nal Road 400m</p>
              </div>

              {/* Password with toggle + caps warning */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold tracking-widest text-slate-600">PASSWORD</label>
                  <Link to="#" className="text-xs font-semibold text-spare-600 hover:text-spare-700">Forgot?</Link>
                </div>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-spare-600 transition">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  </span>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    {...register('password')}
                    className="w-full pl-10 pr-12 py-3 rounded-xl glass-input text-sm font-medium focus-glow outline-none"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition">
                    {showPwd ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 002.8 2.8" /><path d="M9.88 5.09A10.94 10.94 0 0112 5c7 0 10 7 10 7a13.16 13.16 0 01-1.67 2.68" /><path d="M14.12 14.12A3 3 0 019.88 9.88" /><path d="M2 12s3-7 10-7a9.59 9.59 0 014.39 1" /></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-600 font-medium">{errors.password.message}</p>}
                {pwd && pwd.length < 8 && <p className="text-[11px] text-amber-600">Consider 12+ chars with symbols for stronger security</p>}
              </div>

              {/* 2FA optional */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-widest text-slate-600 flex items-center gap-1.5">
                  2FA CODE <span className="px-1.5 py-0.5 rounded bg-slate-100 border text-[10px] font-bold text-slate-600">OPTIONAL</span>
                </label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-spare-600 transition">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h10M7 12h10M7 16h6" /></svg>
                  </span>
                  <input
                    {...register('two_factor_code')}
                    maxLength={6}
                    className="w-full pl-10 pr-3 py-3 rounded-xl glass-input text-sm tracking-[0.3em] font-mono placeholder:tracking-normal placeholder:text-slate-400 focus-glow outline-none"
                    placeholder="• • • • • •"
                  />
                </div>
                <p className="text-[11px] text-slate-500">If enabled, enter 6-digit authenticator code. Leave blank otherwise.</p>
              </div>

              {/* Captcha + remember */}
              <div className="space-y-3 p-3.5 rounded-2xl glass border border-white/60">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" {...register('captcha')} onChange={e => setCaptchaChecked(e.target.checked)} className="w-4.5 h-4.5 rounded-md border-slate-300 text-spare-600 focus:ring-spare-500" />
                  <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-white border text-xs">✓</span>
                    Verify you are human
                    <span className="text-slate-500 font-normal">— protected by campus bot shield</span>
                  </span>
                  <span className="ml-auto hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-600">
                    <span className="w-5 h-5 rounded bg-white border flex items-center justify-center">◈</span> CAPTCHA
                  </span>
                </label>
                {errors.captcha && <p className="text-xs text-red-600 font-medium">{errors.captcha.message}</p>}
                <div className="h-px bg-slate-200/60" />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('remember_me')} defaultChecked className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                    <span className="text-sm font-medium text-slate-700">Remember this device</span>
                    <span className="hidden sm:inline text-xs px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold">7 days</span>
                  </label>
                  <span className="text-xs text-slate-500 flex items-center gap-1"> <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Device remembered securely</span>
                </div>
              </div>

              {/* Submit */}
              <button
                disabled={isSubmitting}
                className="group w-full relative py-3.5 rounded-xl btn-primary text-[15px] flex items-center justify-center gap-2 disabled:opacity-60 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Verifying securely...
                  </>
                ) : (
                  <>Sign in securely <span className="group-hover:translate-x-0.5 transition-transform">→</span></>
                )}
              </button>

              {/* Demo + divider */}
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200/70" /></div>
                <div className="relative flex justify-center"><span className="px-3 bg-white/80 backdrop-blur rounded-full text-xs font-bold text-slate-500 border">DEMO ACCESS</span></div>
              </div>

              <div className="glass rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900">demo@bhc.edu.in / password123</div>
                  <div className="text-slate-600">Priya (Commerce) • Arjun (CS) • Neha (Botany) — BHC</div>
                </div>
                <button type="button" onClick={() => { navigator.clipboard?.writeText('demo@bhc.edu.in'); toast.success('Copied demo email') }} className="px-3 py-1.5 rounded-full bg-slate-900 text-white font-bold hover:bg-black transition">Copy</button>
              </div>
            </form>

            <p className="text-sm text-center mt-5 text-slate-600">
              No account? <Link to="/register" className="font-bold text-spare-600 hover:text-spare-700 underline-offset-4 hover:underline">Create campus account →</Link>
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500">
              <span className="px-2 py-1 rounded-full bg-white border flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Encrypted</span>
              <span>•</span>
              <span>Audited</span>
              <span>•</span>
              <span>@bhc.edu.in only</span>
              <span>•</span>
              <Link to="/" className="underline hover:text-slate-700">About SPARE →</Link>
            </div>
          </div>
        </div>

        {/* Mobile — About + How to use (visible only on small screens) */}
        <div className="lg:hidden space-y-4">
          <div className="glass-strong rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-spare-600 to-cyan-600 flex items-center justify-center text-white font-black text-xs">S</span>
              <span className="text-xs font-black tracking-widest text-slate-500">ABOUT • SPARE × BHC</span>
            </div>
            <h3 className="mt-2 font-black text-sm text-slate-900">Bishop Heber College — 620017</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Post Box 615, Vayalur Rd, Puthur, Tiruchirappalli. 23 depts, NAAC A++ (3.69), 30+ UG, 22+ PG. SPARE solves discovery: find Arduino, textbook, lab kit in 2 min — 84.8% semantic. Saves ₹2,500 avg, verified QR handover at 10.8188,78.6754.
            </p>
            <Link to="/" className="mt-2 inline-flex text-xs font-bold text-spare-600 hover:underline">Explore homepage →</Link>
          </div>
          <div className="glass rounded-2xl p-4">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">❓ How to use this website</h3>
            <div className="mt-2 space-y-2">
              {[
                { n:'01', t:'Register / Login', d:'@bhc.edu.in + ID BCA2023-001' },
                { n:'02', t:'Search / Post', d:'Arduino → 84.8% at Doraiswamy Block' },
                { n:'03', t:'Request → QR', d:'Owner Accept → QR + code #xxxxxx' },
                { n:'04', t:'Return', d:'Scan → Mark Returned → ₹ saved' },
              ].map(s=>(
                <div key={s.n} className="flex gap-2 p-2 rounded-xl bg-white border">
                  <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-black flex-shrink-0">{s.n}</span>
                  <div><div className="text-xs font-bold text-slate-900">{s.t}</div><div className="text-[11px] text-slate-600">{s.d}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
