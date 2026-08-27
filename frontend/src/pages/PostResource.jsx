import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import client from '../api/client'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES } from '../utils/categories'
import { BHC } from '../utils/bhc'
import { useState } from 'react'

const schema = z.object({
  title: z.string().min(3, 'Title too short'),
  description: z.string().min(10, 'Add condition & inclusions (10+ chars)'),
  category: z.string().min(1),
  location_text: z.string().min(2),
  lend_type: z.string(),
  estimated_value: z.coerce.number().min(0),
  condition: z.string(),
  serial_number: z.string().optional(),
  security_deposit: z.coerce.number().min(0).optional(),
  max_borrow_days: z.coerce.number().min(1).max(90),
  contact_preference: z.string(),
  pickup_instructions: z.string().optional(),
  available_until: z.string().optional(),
  image_url: z.string().optional(),
  agree_terms: z.boolean().refine(v => v === true, 'Accept exchange & security terms'),
  id_proof: z.boolean().refine(v => v === true, 'ID verification required for handover'),
  captcha: z.boolean().refine(v => v === true, 'Verify you are human'),
})

export default function PostResource() {
  const navigate = useNavigate()
  const [preview, setPreview] = useState('')
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      category: 'electronics',
      lend_type: 'lend',
      condition: 'good',
      location_text: 'Bishop Solomon Doraiswamy Block, BHC',
      estimated_value: 1500,
      security_deposit: 0,
      max_borrow_days: 14,
      contact_preference: 'in_app',
      agree_terms: false,
      id_proof: true,
      captcha: false,
    }
  })
  const watchImage = watch('image_url')
  const watchDeposit = watch('security_deposit')

  const onSubmit = async (data) => {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        category: data.category,
        location_text: data.location_text,
        lend_type: data.lend_type,
        estimated_value: Number(data.estimated_value),
        condition: data.condition,
        serial_number: data.serial_number || null,
        security_deposit: Number(data.security_deposit) || 0,
        max_borrow_days: Number(data.max_borrow_days),
        contact_preference: data.contact_preference,
        pickup_instructions: data.pickup_instructions || null,
        requires_id_proof: data.id_proof ? 'true' : 'false',
        image_url: data.image_url || `https://picsum.photos/seed/${Date.now()}/600/400`,
        latitude: BHC.campus.center.lat + (Math.random() - 0.5) * 0.012,
        longitude: BHC.campus.center.lng + (Math.random() - 0.5) * 0.012,
        available_from: new Date().toISOString().split('T')[0],
        available_until: data.available_until || new Date(Date.now() + Number(data.max_borrow_days) * 864e5).toISOString().split('T')[0],
      }
      const res = await client.post('/resources', payload)
      toast.success(`Resource posted — pickup code ${res.data.verification_code} generated ✓`)
      navigate('/resources')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to post — check security fields')
    }
  }

  const glassInput = "w-full px-3 py-3 rounded-xl glass-input text-sm font-medium placeholder:text-slate-400 focus-glow outline-none"
  const label = "text-xs font-bold tracking-widest text-slate-600"

  return (
    <div className="min-h-[calc(100vh-68px)] relative px-4 py-8 bg-gradient-to-br from-emerald-50/60 via-white to-cyan-50/40 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="blob blob-1 opacity-20" />
        <div className="blob blob-2 opacity-20" />
        <div className="absolute inset-0 animated-grid opacity-30" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-bold text-slate-700">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> SECURE LISTING • ID-VERIFIED HANDOVER
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Post a <span className="bg-gradient-to-r from-spare-600 to-cyan-600 bg-clip-text text-transparent">verified resource</span> <span className="text-sm font-bold tracking-widest text-slate-500">• BHC</span></h1>
          <p className="text-sm text-slate-600 mt-1">For <b>{BHC.name}</b> • {BHC.address} • 6-digit pickup code + QR. Only verified BHC students can request.</p>
          <div className="mt-3 flex justify-center gap-1.5">
            <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">1 • Details</span>
            <span className="px-3 py-1 rounded-full glass text-xs font-bold text-slate-600">2 • Security</span>
            <span className="px-3 py-1 rounded-full glass text-xs font-bold text-slate-600">3 • Publish</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.35fr_0.75fr] gap-6 items-start">
          {/* Form */}
          <div className="relative animate-slide-up">
            <div className="absolute -inset-1 bg-gradient-to-r from-spare-500 to-cyan-500 rounded-[28px] blur-xl opacity-15" />
            <div className="relative glass-strong rounded-[28px] p-6 sm:p-7">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-spare-600 to-emerald-500 flex items-center justify-center text-white">◆</div>
                <h2 className="font-black text-slate-900">Item details</h2>
                <span className="ml-auto px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">Encrypted</span>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1.5">
                  <label className={label}>ITEM TITLE *</label>
                  <input {...register('title')} placeholder="e.g., Arduino Uno Kit — with sensors & docs" className={glassInput} />
                  {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className={label}>DESCRIPTION & CONDITION *</label>
                  <textarea {...register('description')} rows={3} placeholder="What's included, condition, accessories, known issues, why you're sharing..." className={glassInput + " resize-none"} />
                  {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
                  <p className="text-[11px] text-slate-500">Be specific — better matching & trust. Mention condition honestly.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className={label}>CATEGORY</label>
                    <select {...register('category')} className={glassInput}>
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className={label}>CONDITION</label>
                    <select {...register('condition')} className={glassInput}>
                      <option value="new">New — sealed</option>
                      <option value="good">Good — lightly used</option>
                      <option value="fair">Fair — works, signs of use</option>
                      <option value="needs_repair">Needs minor repair</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className={label}>LENDING TYPE</label>
                    <select {...register('lend_type')} className={glassInput}>
                      <option value="lend">Lend</option>
                      <option value="give">Give away</option>
                      <option value="exchange">Exchange</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className={label}>VALUE (₹)</label>
                    <input type="number" {...register('estimated_value')} className={glassInput} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={label}>DEPOSIT (₹)</label>
                    <input type="number" {...register('security_deposit')} className={glassInput} />
                    {Number(watchDeposit) > 0 && <span className="text-[11px] text-amber-600 font-medium">Refundable at return</span>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className={label}>SERIAL / MODEL (OPTIONAL)</label>
                    <input {...register('serial_number')} placeholder="SN-XXXX or model" className={glassInput} />
                    <p className="text-[11px] text-slate-500">Helps verify authenticity at handover</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className={label}>MAX BORROW DAYS</label>
                    <select {...register('max_borrow_days')} className={glassInput}>
                      <option value={7}>7 days</option>
                      <option value={14}>14 days</option>
                      <option value={30}>30 days</option>
                      <option value={60}>60 days</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className={label}>LOCATION — BHC *</label>
                    <input {...register('location_text')} list="bhc-locs" placeholder="Bishop Solomon Doraiswamy Block, BHC" className={glassInput} />
                    <datalist id="bhc-locs">
                      {BHC.campusLocations.map(l => <option key={l.name} value={l.name} />)}
                    </datalist>
                  </div>
                  <div className="space-y-1.5">
                    <label className={label}>AVAILABLE UNTIL</label>
                    <input type="date" {...register('available_until')} className={glassInput} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className={label}>CONTACT PREFERENCE</label>
                    <select {...register('contact_preference')} className={glassInput}>
                      <option value="in_app">In-app chat (recommended)</option>
                      <option value="email">Campus email</option>
                      <option value="phone">Phone (verified only)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className={label}>IMAGE URL</label>
                    <input {...register('image_url')} onChange={e => setPreview(e.target.value)} placeholder="https://..." className={glassInput} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={label}>PICKUP INSTRUCTIONS (OPTIONAL)</label>
                  <textarea {...register('pickup_instructions')} rows={2} placeholder="E.g., Meet at lab lobby, call before, ID required, carry student card..." className={glassInput + " resize-none"} />
                </div>

                {/* Security section */}
                <div className="glass rounded-2xl p-4 space-y-3 border border-amber-200/50 bg-amber-50/40">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white">🛡️</div>
                    <div>
                      <div className="font-black text-sm text-slate-900">Security & verification</div>
                      <div className="text-xs text-slate-600">These protect you and the borrower</div>
                    </div>
                    <span className="ml-auto px-2 py-1 rounded-full bg-white border text-xs font-bold text-slate-700">Required</span>
                  </div>
                  <label className="flex gap-3 p-3 rounded-xl bg-white border hover:border-amber-300 cursor-pointer transition">
                    <input type="checkbox" {...register('id_proof')} className="mt-0.5 w-4.5 h-4.5 rounded-md border-slate-300 text-amber-600" />
                    <span className="text-sm"><b>Require ID proof at handover</b> — borrower shows student ID before taking item. Recommended.</span>
                  </label>
                  {errors.id_proof && <p className="text-xs text-red-600">{errors.id_proof.message}</p>}
                  <label className="flex gap-3 p-3 rounded-xl bg-white border hover:border-slate-300 cursor-pointer transition">
                    <input type="checkbox" {...register('agree_terms')} className="w-4.5 h-4.5 rounded-md border-slate-300 text-slate-900" />
                    <span className="text-sm">I confirm this item is mine to share, details are accurate, and I accept <b className="underline">Exchange Terms</b> & liability.</span>
                  </label>
                  {errors.agree_terms && <p className="text-xs text-red-600">{errors.agree_terms.message}</p>}
                  <label className="flex gap-3 p-3 rounded-xl bg-white border hover:border-spare-300 cursor-pointer transition">
                    <input type="checkbox" {...register('captcha')} className="w-4.5 h-4.5 rounded-md border-slate-300 text-spare-600" />
                    <span className="text-sm"><b>I'm not a robot</b> — campus bot shield enabled</span>
                  </label>
                  {errors.captcha && <p className="text-xs text-red-600">{errors.captcha.message}</p>}
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="px-2 py-1 rounded-full bg-white border">🔐 Auto pickup code</span>
                    <span>•</span>
                    <span>QR generated on accept</span>
                    <span>•</span>
                    <span>Signed handover</span>
                  </div>
                </div>

                <button disabled={isSubmitting} className="group w-full py-3.5 rounded-xl btn-primary flex items-center justify-center gap-2 overflow-hidden disabled:opacity-60">
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  {isSubmitting ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Publishing securely...</> : <>Publish verified resource →</>}
                </button>
              </form>
            </div>
          </div>

          {/* Preview panel */}
          <div className="space-y-4">
            <div className="glass-strong rounded-[24px] p-5 animate-float">
              <div className="text-xs font-black tracking-widest text-slate-500">LIVE PREVIEW</div>
              <div className="mt-3 rounded-2xl overflow-hidden bg-slate-900 aspect-[4/3] relative">
                {watchImage || preview ? (
                  <img src={watchImage || preview} alt="preview" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/80 p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl">🖼️</div>
                    <div className="text-sm font-bold mt-2">Image preview</div>
                    <div className="text-xs opacity-70">Paste URL or leave blank for auto</div>
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-bold text-slate-900">📦 Verified</div>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="h-3 rounded-full bg-slate-200 w-3/4 animate-pulse" />
                <div className="h-3 rounded-full bg-slate-200 w-1/2" />
                <div className="flex gap-1.5 mt-2">
                  <span className="px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">lend</span>
                  <span className="px-2 py-1 rounded-full bg-slate-100 border text-xs font-bold">good</span>
                  <span className="px-2 py-1 rounded-full bg-white border text-xs">₹1500</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="font-bold text-sm text-slate-900 flex items-center gap-2">🔒 Security perks <span className="ml-auto text-xs px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">Included</span></div>
              <ul className="mt-2 space-y-2 text-xs text-slate-600">
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> 6-digit pickup code auto-generated</li>
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> QR handover — signed & timestamped</li>
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> ID proof & student verification</li>
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> Deposit held & refunded on return</li>
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> Dispute & audit trail built-in</li>
              </ul>
            </div>

            <div className="glass rounded-2xl p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <div className="text-sm font-black text-amber-900">Before you publish</div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">Ensure item is functional, clean, and you’re authorized to lend it. Misrepresentation may flag your account. Campus moderators may verify high-value items.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
