import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import client from '../api/client'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES } from '../utils/categories'
import { BHC } from '../utils/bhc'

const schema = z.object({
  title: z.string().min(3, 'Title too short'),
  description: z.string().min(10, 'Describe what you need (10+ chars)'),
  category: z.string().min(1),
  location_text: z.string().min(2),
  needed_by: z.string().optional(),
  purpose: z.string().min(5, 'Purpose required'),
  urgency: z.string(),
  budget: z.coerce.number().min(0).optional(),
  collateral_offered: z.string().optional(),
  contact_preference: z.string(),
  agree_terms: z.boolean().refine(v => v === true, 'Accept terms'),
  id_proof: z.boolean().refine(v => v === true, 'ID proof required for secure handover'),
  captcha: z.boolean().refine(v => v === true, 'Verify you are human'),
})

export default function PostNeed() {
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      category: 'electronics',
      location_text: "Women's Hostel, BHC",
      urgency: 'medium',
      contact_preference: 'in_app',
      agree_terms: false,
      id_proof: true,
      captcha: false,
    }
  })
  const urgency = watch('urgency')

  const onSubmit = async (data) => {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        category: data.category,
        location_text: data.location_text,
        needed_by: data.needed_by || null,
        purpose: data.purpose,
        urgency: data.urgency,
        budget: data.budget ? Number(data.budget) : null,
        collateral_offered: data.collateral_offered || null,
        contact_preference: data.contact_preference,
        requires_id_proof: data.id_proof ? 'true' : 'false',
        agree_terms: data.agree_terms ? 'true' : 'false',
        latitude: BHC.campus.center.lat + (Math.random() - 0.5) * 0.012,
        longitude: BHC.campus.center.lng + (Math.random() - 0.5) * 0.012,
      }
      const res = await client.post('/needs', payload)
      toast.success('Need posted — AI matching started 🔍')
      navigate(`/matches?need_id=${res.data.id}`)
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed — check security fields')
    }
  }

  const glassInput = "w-full px-3 py-3 rounded-xl glass-input text-sm font-medium placeholder:text-slate-400 focus-glow outline-none"
  const label = "text-xs font-bold tracking-widest text-slate-600"

  const urgencyTone = {
    low: 'bg-slate-100 border-slate-200 text-slate-700',
    medium: 'bg-amber-50 border-amber-200 text-amber-700',
    high: 'bg-orange-50 border-orange-200 text-orange-700',
    urgent: 'bg-red-50 border-red-200 text-red-700',
  }

  return (
    <div className="min-h-[calc(100vh-68px)] relative px-4 py-8 bg-gradient-to-br from-cyan-50/60 via-white to-violet-50/40 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="blob blob-2 opacity-20" />
        <div className="blob blob-3 opacity-15" />
        <div className="absolute inset-0 animated-grid opacity-30" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-bold text-slate-700">
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" /> AI MATCHING • VERIFIED REQUESTERS ONLY
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Post a <span className="bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-transparent">secure need</span> <span className="text-sm font-bold tracking-widest text-slate-500">• BHC TRICHY</span></h1>
          <p className="text-sm text-slate-600 mt-1">Tell us why, when, and how you’ll handle pickup at <b>{BHC.campus.vistorGate}</b>. Only {BHC.departments.length} verified BHC departments can respond.</p>
          <div className="mt-3 flex justify-center gap-1.5">
            <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">1 • Intent</span>
            <span className="px-3 py-1 rounded-full glass text-xs font-bold text-slate-600">2 • Trust</span>
            <span className="px-3 py-1 rounded-full glass text-xs font-bold text-slate-600">3 • Match</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.35fr_0.75fr] gap-6 items-start">
          <div className="relative animate-slide-up">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-[28px] blur-xl opacity-15" />
            <div className="relative glass-strong rounded-[28px] p-6 sm:p-7">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-600 to-violet-600 flex items-center justify-center text-white">⌖</div>
                <h2 className="font-black text-slate-900">What you need</h2>
                <span className={`ml-auto px-2.5 py-1 rounded-full border text-xs font-bold ${urgencyTone[urgency] || urgencyTone.medium}`}>{urgency.toUpperCase()}</span>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1.5">
                  <label className={label}>TITLE *</label>
                  <input {...register('title')} placeholder="e.g., Need Arduino Uno for IoT mini-project (2 weeks)" className={glassInput} />
                  {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className={label}>DESCRIPTION *</label>
                  <textarea {...register('description')} rows={3} placeholder="Specs, duration, condition expectations..." className={glassInput + " resize-none"} />
                  {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className={label}>PURPOSE (WHY YOU NEED IT) *</label>
                  <textarea {...register('purpose')} rows={2} placeholder="E.g., Final-year IoT project, need for 2 weeks, will return cleaned & tested..." className={glassInput + " resize-none"} />
                  {errors.purpose && <p className="text-xs text-red-600">{errors.purpose.message}</p>}
                  <p className="text-[11px] text-slate-500">Owners prioritize genuine academic needs — be specific.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className={label}>CATEGORY</label>
                    <select {...register('category')} className={glassInput}>
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className={label}>URGENCY</label>
                    <select {...register('urgency')} className={glassInput}>
                      <option value="low">Low — flexible</option>
                      <option value="medium">Medium — within 2 weeks</option>
                      <option value="high">High — within 3 days</option>
                      <option value="urgent">Urgent — within 24h</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className={label}>NEEDED BY</label>
                    <input type="date" {...register('needed_by')} className={glassInput} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={label}>BUDGET / DEPOSIT WILLING (₹)</label>
                    <input type="number" {...register('budget')} placeholder="0 if free, or e.g., 500" className={glassInput} />
                    <p className="text-[11px] text-slate-500">Optional — helps high-value items</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className={label}>LOCATION — BHC *</label>
                    <input {...register('location_text')} list="bhc-locs-need" placeholder="Women's Hostel, BHC" className={glassInput} />
                    <datalist id="bhc-locs-need">
                      {BHC.campusLocations.map(l => <option key={l.name} value={l.name} />)}
                    </datalist>
                  </div>
                  <div className="space-y-1.5">
                    <label className={label}>CONTACT PREFERENCE</label>
                    <select {...register('contact_preference')} className={glassInput}>
                      <option value="in_app">In-app chat</option>
                      <option value="email">Campus email</option>
                      <option value="phone">Phone (verified)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={label}>COLLATERAL OFFERED (OPTIONAL)</label>
                  <input {...register('collateral_offered')} placeholder="E.g., Will share my sensor kit as collateral, or student ID held" className={glassInput} />
                  <p className="text-[11px] text-slate-500">Builds trust for expensive gear (oscilloscope, projector...)</p>
                </div>

                <div className="glass rounded-2xl p-4 space-y-3 border border-cyan-200/50 bg-cyan-50/40">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-600 flex items-center justify-center text-white">🛡️</div>
                    <div>
                      <div className="font-black text-sm text-slate-900">Trust & safety</div>
                      <div className="text-xs text-slate-600">Required for secure handover</div>
                    </div>
                  </div>
                  <label className="flex gap-3 p-3 rounded-xl bg-white border hover:border-cyan-300 cursor-pointer">
                    <input type="checkbox" {...register('id_proof')} className="mt-0.5 w-4.5 h-4.5 rounded-md border-slate-300 text-cyan-600" />
                    <span className="text-sm"><b>Show ID at pickup</b> — I’ll present student ID + code.</span>
                  </label>
                  {errors.id_proof && <p className="text-xs text-red-600">{errors.id_proof.message}</p>}
                  <label className="flex gap-3 p-3 rounded-xl bg-white border cursor-pointer">
                    <input type="checkbox" {...register('agree_terms')} className="w-4.5 h-4.5 rounded-md border-slate-300 text-slate-900" />
                    <span className="text-sm">I’ll return on time, handle with care, and accept <b className="underline">Borrower Terms</b>.</span>
                  </label>
                  {errors.agree_terms && <p className="text-xs text-red-600">{errors.agree_terms.message}</p>}
                  <label className="flex gap-3 p-3 rounded-xl bg-white border cursor-pointer">
                    <input type="checkbox" {...register('captcha')} className="w-4.5 h-4.5 rounded-md border-slate-300 text-spare-600" />
                    <span className="text-sm"><b>I'm not a robot</b> — anti-spam verified</span>
                  </label>
                  {errors.captcha && <p className="text-xs text-red-600">{errors.captcha.message}</p>}
                </div>

                <button disabled={isSubmitting} className="group w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 overflow-hidden disabled:opacity-60">
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  {isSubmitting ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Posting securely...</> : <>Post need & find matches →</>}
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-strong rounded-[24px] p-5">
              <div className="text-xs font-black tracking-widest text-slate-500">HOW MATCHING SECURES YOU</div>
              <div className="mt-3 space-y-2.5">
                {[
                  { t: 'Semantic AI', d: 'Arduino ≈ microcontroller board • TF-IDF + synonym boost', p: '92%' },
                  { t: 'Trust score', d: 'Verified lenders • deposit • ID at handover', p: '100%' },
                  { t: 'Proximity', d: '50m–500m typical • boarding house aware', p: '85%' },
                ].map(s => (
                  <div key={s.t} className="flex gap-3 items-center">
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900">{s.t} <span className="text-emerald-600">{s.p}</span></div>
                      <div className="text-xs text-slate-600 leading-relaxed">{s.d}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black">{s.p}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-slate-900 text-white flex gap-2 items-center">
                <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">⚡</span>
                <div className="text-xs"><b>Before buying — 4 compat found</b><div className="opacity-70">We surface cheaper campus alternatives first</div></div>
              </div>
            </div>

            <div className="glass rounded-2xl p-4 border-amber-200 bg-amber-50/50">
              <div className="text-sm font-black text-amber-900">🔒 Borrower promise</div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">Late returns affect your trust rating. High urgency? Add collateral to get faster accepts. All handovers are QR-signed and timestamped for audit.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
