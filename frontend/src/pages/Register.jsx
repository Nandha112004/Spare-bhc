import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useState, useMemo } from 'react'
import { BHC, departmentOptions } from '../utils/bhc'

const schema = z.object({
  name: z.string().min(2, 'Full name required').max(60),
  email: z.string().email().refine(v => v.endsWith('.edu') || v.endsWith('.edu.in') || v.includes('bhc.edu.in'), 'Use your @bhc.edu.in email'),
  phone: z.string().min(10, 'Enter 10-digit phone').max(15),
  student_id: z.string().min(4, 'Student ID required'),
  year: z.string().min(1, 'Select year'),
  department: z.string().min(1, 'Select department'),
  password: z.string().min(8, '8+ chars').max(72),
  confirm_password: z.string(),
  captcha: z.boolean().refine(v => v === true, 'Verify you are human'),
  terms: z.boolean().refine(v => v === true, 'Accept terms to continue'),
  two_factor: z.boolean().optional(),
}).refine(d => d.password === d.confirm_password, { message: "Passwords don't match", path: ['confirm_password'] })

function strength(pwd) {
  if (!pwd) return { label: '—', pct: 0, color: 'bg-slate-200' }
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  const pct = Math.min(100, (score / 5) * 100)
  if (pct < 40) return { label: 'Weak', pct, color: 'bg-red-500' }
  if (pct < 70) return { label: 'Fair', pct, color: 'bg-amber-500' }
  if (pct < 90) return { label: 'Strong', pct, color: 'bg-emerald-500' }
  return { label: 'Excellent', pct, color: 'bg-spare-600' }
}

export default function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { year: '3rd', department: 'Computer Science', two_factor: false }
  })
  const pwd = watch('password') || ''
  const s = useMemo(() => strength(pwd), [pwd])

  const onSubmit = async (data) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        department: data.department,
        phone: data.phone,
        student_id: data.student_id,
        year: data.year,
        two_factor_enabled: data.two_factor ? 'true' : 'false',
      })
      toast.success('Campus account created — verified ✓')
      navigate('/dashboard')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Registration failed')
    }
  }

  const inputBase = "w-full pl-10 pr-3 py-3 rounded-xl glass-input text-sm font-medium placeholder:text-slate-400 focus-glow outline-none"

  return (
    <div className="min-h-[calc(100vh-68px)] relative flex items-center justify-center px-4 py-10 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-violet-50/50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="absolute inset-0 animated-grid opacity-[0.35]" />
      </div>

      <div className="relative w-full max-w-6xl grid lg:grid-cols-[0.95fr_1.15fr] gap-6 items-start">
        {/* Left pitch */}
        <div className="hidden lg:block sticky top-10 space-y-5 animate-slide-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-bold text-slate-700">
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" /> CAMPUS-VERIFIED IDENTITY • GDPR ALIGNED
          </div>
          <div>
            <h1 className="text-[38px] font-black leading-[0.9] tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Join</span><br />
              <span className="bg-gradient-to-r from-spare-600 via-emerald-500 to-cyan-600 bg-clip-text text-transparent">BHC verified</span><br />
              <span className="text-[16px] font-bold tracking-widest text-slate-500">BISHOP HEBER COLLEGE, TRICHY • 620017</span>
            </h1>
            <p className="mt-2 text-slate-600"><b>{BHC.name}</b> — {BHC.campus.vistorGate}. Only @bhc.edu.in / campus emails verified.</p>
          </div>

          <div className="glass rounded-2xl p-4 space-y-3">
            <div className="text-xs font-black tracking-widest text-slate-500">WHY WE VERIFY</div>
            {[
              { k: 'Student ID', v: 'Prevents outsiders • matches registrar', ok: true },
              { k: 'Phone + email', v: 'OTP ready • recovery • alerts', ok: true },
              { k: 'Dept & year', v: 'Better matching • proximity', ok: true },
            ].map(r => (
              <div key={r.k} className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">✓</div>
                <div><div className="text-sm font-bold text-slate-900">{r.k}</div><div className="text-xs text-slate-600">{r.v}</div></div>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">🎓</div>
            <div className="text-sm">
              <div className="font-bold text-slate-900">Already have 1,247 verified students</div>
              <div className="text-xs text-slate-600">Avg verification 18s • 99.2% success</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="relative animate-slide-up">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-spare-500 to-cyan-500 rounded-[28px] blur-[18px] opacity-15" />
          <div className="relative glass-strong rounded-[28px] p-6 sm:p-7 shadow-glass">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white font-black">S</div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 leading-none">Create BHC account</h2>
                <p className="text-xs text-slate-600">Post Box 615, Vayalur Rd, Puthur • {BHC.phone}</p>
              </div>
              <span className="ml-auto hidden sm:inline-flex px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">SECURE • 2 MIN</span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              {/* Name + Email */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-widest text-slate-600">FULL NAME</label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-spare-600 transition">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" /></svg>
                    </span>
                    <input {...register('name')} placeholder="Priya Sharma" className={inputBase} />
                  </div>
                  {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-widest text-slate-600">CAMPUS EMAIL</label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-spare-600 transition">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16v16H4z" /><path d="M4 8l8 6 8-6" /></svg>
                    </span>
                    <input {...register('email')} placeholder="you@bhc.edu.in" className={inputBase} />
                  </div>
                  {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
                </div>
              </div>

              {/* Phone + Student ID */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-widest text-slate-600">PHONE (OTP READY)</label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-spare-600 transition">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 2H8a2 2 0 00-2 2v16a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2z" /><path d="M12 18h.01" /></svg>
                    </span>
                    <input {...register('phone')} placeholder="+91 9xxxx xxxxx" className={inputBase} />
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">VERIFIED</span>
                  </div>
                  {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-widest text-slate-600">STUDENT ID</label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-spare-600 transition">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h4v4H7zM15 8h2M15 12h2M7 16h10" /></svg>
                    </span>
                    <input {...register('student_id')} placeholder="CSE2023-045" className={inputBase} />
                  </div>
                  {errors.student_id && <p className="text-xs text-red-600">{errors.student_id.message}</p>}
                </div>
              </div>

              {/* Year + Dept */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-widest text-slate-600">YEAR</label>
                  <select {...register('year')} className={inputBase.replace('pl-10','px-3')}>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                    <option value="PG">PG</option>
                    <option value="PhD">PhD</option>
                  </select>
                  {errors.year && <p className="text-xs text-red-600">{errors.year.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-widest text-slate-600">DEPARTMENT — BHC</label>
                  <select {...register('department')} className={inputBase.replace('pl-10','px-3')}>
                    {departmentOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <p className="text-[11px] text-slate-500">{BHC.departments.length} departments • {BHC.accreditation}</p>
                  {errors.department && <p className="text-xs text-red-600">{errors.department.message}</p>}
                </div>
              </div>

              {/* Passwords */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-widest text-slate-600">PASSWORD</label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-spare-600 transition">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </span>
                    <input type={showPwd ? 'text' : 'password'} {...register('password')} placeholder="••••••••" className={`${inputBase} pr-12`} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white border flex items-center justify-center text-slate-600 hover:text-slate-900">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
                  {/* Strength */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div className={`h-full ${s.color} transition-all duration-500`} style={{ width: `${s.pct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-600">{s.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Use 12+ chars, mixed case, number & symbol • encrypted with bcrypt</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-widest text-slate-600">CONFIRM PASSWORD</label>
                  <div className="relative group">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-spare-600 transition">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12l5 5L20 7" /></svg>
                    </span>
                    <input type={showConfirm ? 'text' : 'password'} {...register('confirm_password')} placeholder="••••••••" className={`${inputBase} pr-12`} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white border flex items-center justify-center text-slate-600">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    </button>
                  </div>
                  {errors.confirm_password && <p className="text-xs text-red-600">{errors.confirm_password.message}</p>}
                  <p className="text-[11px] text-slate-500">Both must match exactly • case-sensitive</p>
                </div>
              </div>

              {/* Security toggles */}
              <div className="glass rounded-2xl p-3.5 space-y-3">
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center">◈</span>
                    Enable 2FA authenticator
                    <span className="hidden sm:inline px-1.5 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-xs text-violet-700 font-bold">RECOMMENDED</span>
                  </span>
                  <input type="checkbox" {...register('two_factor')} className="w-10 h-6 rounded-full appearance-none bg-slate-200 checked:bg-spare-600 relative before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 before:transition-all checked:before:translate-x-4 before:shadow" />
                </label>
                <div className="h-px bg-slate-200/60" />
                <label className="flex gap-3 cursor-pointer">
                  <input type="checkbox" {...register('captcha')} className="mt-0.5 w-4.5 h-4.5 rounded-md border-slate-300 text-spare-600 focus:ring-spare-500" />
                  <span className="text-sm text-slate-700"><b>Verify you are human</b> — protected by campus bot shield + rate limiting</span>
                </label>
                {errors.captcha && <p className="text-xs text-red-600">{errors.captcha.message}</p>}
                <label className="flex gap-3 cursor-pointer">
                  <input type="checkbox" {...register('terms')} className="mt-0.5 w-4.5 h-4.5 rounded-md border-slate-300 text-slate-900 focus:ring-slate-900" />
                  <span className="text-sm text-slate-700">I agree to <Link to="#" className="font-bold underline">Campus Exchange Terms</Link> & <Link to="#" className="font-bold underline">Privacy Policy</Link> • ID may be verified at pickup</span>
                </label>
                {errors.terms && <p className="text-xs text-red-600">{errors.terms.message}</p>}
              </div>

              <button disabled={isSubmitting} className="group w-full relative py-3.5 rounded-xl btn-primary text-[15px] flex items-center justify-center gap-2 overflow-hidden disabled:opacity-60">
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {isSubmitting ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating verified account...</> : <>Create verified account →</>}
              </button>

              <p className="text-sm text-center text-slate-600">Already verified? <Link to="/login" className="font-bold text-spare-600 hover:text-spare-700 underline-offset-4 hover:underline">Sign in →</Link></p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
