import { useMemo, useState } from 'react'
import { Check, Gift, Lock, Plus } from 'lucide-react'
import clsx from 'clsx'
import type { PayMethod, Turf } from '@/types'
import { COUPONS } from '@/data/seed'
import { INR, dateLabel, genCode, rangeLabel, relDay, sportLabel, uid, hourLabel } from '@/lib/format'
import { canStart, price } from '@/lib/logic'
import { useStore, useUser, openSheet, closeSheet, toast } from '@/store'
import { TurfArt } from '@/components/TurfArt'
import { Seg, SheetHead, Tag } from '@/components/ui'
import { TicketSheet } from '@/sheets/TicketSheet'

export function BookSheet({ turf: t, date, hour, dur, onBooked }: { turf: Turf; date: string; hour: number; dur: number; onBooked?: () => void }) {
  const s = useStore(); const u = useUser()!
  const [addons, setAddons] = useState<string[]>([]); const [coupon, setCoupon] = useState<string | null>(null); const [couponIn, setCouponIn] = useState(''); const [usePts, setUsePts] = useState(false); const [method, setMethod] = useState<PayMethod>('UPI')
  const c = useMemo(() => {
    const hours = Array.from({ length: dur }, (_, k) => price(s, t, date, hour + k, u.id))
    const base = hours.reduce((a, p) => a + p.base, 0), sub = hours.reduce((a, p) => a + p.final, 0)
    const addonsSum = t.addons.filter(a => addons.includes(a.id)).reduce((a, x) => a + x.price, 0)
    let couponOff = 0; if (coupon) { const cp = COUPONS[coupon]; couponOff = Math.min(cp.max, Math.round(((sub + addonsSum) * cp.pct) / 100)) }
    const afterC = sub + addonsSum - couponOff; const pts = usePts ? Math.min(u.pts, Math.floor(afterC * 0.2)) : 0; const total = Math.max(0, afterC - pts)
    return { base, sub, offerDisc: base - sub, addonsSum, couponOff, pts, total, earn: Math.round(total * 0.05) }
  }, [s, t, date, hour, dur, u, addons, coupon, usePts])

  const applyCoupon = () => { const code = couponIn.trim().toUpperCase(); const cp = COUPONS[code]; if (!cp) return toast('Invalid coupon code', 'err'); if (cp.weekend && ![0, 6].includes(new Date(date + 'T00:00:00').getDay())) return toast('WEEKEND15 only works for Saturday & Sunday slots', 'err'); setCoupon(code); toast(`Coupon applied — ${cp.desc}`) }
  const confirm = () => {
    if (!canStart(s, t, date, hour, dur)) { toast('That slot was just taken', 'err'); closeSheet(); return }
    const bk = { id: uid('b'), turfId: t.id, userId: u.id, userName: u.name, date, hour, duration: dur, amount: c.total, status: 'confirmed' as const, sport: t.sport, code: genCode(), createdAt: new Date().toISOString(), method, addons: t.addons.filter(a => addons.includes(a.id)).map(a => a.name), ptsUsed: c.pts, coupon }
    s.addBooking(bk, c.earn - c.pts)
    s.notify(u.id, 'booking', 'Booking confirmed', `${t.name} · ${relDay(date)} · ${hourLabel(hour)} · +${c.earn} pts`)
    s.notify(t.ownerId, 'booking', `New booking: ${u.name}`, `${t.name} · ${relDay(date)} · ${rangeLabel(hour, dur)} · ${INR(c.total)}`)
    onBooked?.(); openSheet(<TicketSheet booking={bk} fresh />)
  }
  return (
    <>
      <SheetHead title="Review & pay" sub={t.name} />
      <div className="card tight row" style={{ gap: 12, marginBottom: 14 }}><div className="thumb"><TurfArt turf={t} /></div><div style={{ flex: 1, minWidth: 0 }}><strong className="small">{t.name}</strong><div className="xs muted">{relDay(date)}, {dateLabel(date, 'd MMM')} · {rangeLabel(hour, dur)}</div><div className="xs muted">{dur}h · {sportLabel(t.sport)} · {t.area}</div></div></div>
      {t.addons.length > 0 && <><div className="label" style={{ marginBottom: 8 }}>Add-ons</div><div className="stack s8" style={{ marginBottom: 14 }}>{t.addons.map(a => { const on = addons.includes(a.id); return <button key={a.id} className="row between card tight" style={{ width: '100%', textAlign: 'left', borderColor: on ? 'var(--accent)' : undefined }} onClick={() => setAddons(x => on ? x.filter(i => i !== a.id) : [...x, a.id])}><span className="row small">{on ? <Check className="ico sm" /> : <Plus className="ico sm" />}{a.name}</span><span className="small" style={{ fontWeight: 600 }}>+{INR(a.price)}</span></button> })}</div></>}
      <div className="label" style={{ marginBottom: 8 }}>Coupon</div>
      <div className="row" style={{ marginBottom: 14 }}>{coupon ? <><Tag style={{ height: 36, padding: '0 14px', fontSize: 12, letterSpacing: 0, textTransform: 'none' }}>{coupon} · {COUPONS[coupon].desc}</Tag><button className="btn ghost xs" onClick={() => setCoupon(null)}>Remove</button></> : <><input className="input" placeholder="FIRST10 · TURF20 · WEEKEND15" style={{ height: 42, textTransform: 'uppercase' }} value={couponIn} onChange={e => setCouponIn(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyCoupon()} /><button className="btn ghost sm" onClick={applyCoupon}>Apply</button></>}</div>
      <button className="row between card tight" style={{ width: '100%', textAlign: 'left', marginBottom: 14 }} onClick={() => { if (!u.pts) return toast('No points yet — earn 5% back on every booking', 'err'); setUsePts(v => !v) }}><div className="row"><Gift className="ico sm" /><div><div className="small" style={{ fontWeight: 600 }}>Use loyalty points</div><div className="xs muted">{u.pts} pts available · up to 20% of the bill</div></div></div><span className={clsx('toggle', usePts && 'on')} /></button>
      <div className="label" style={{ marginBottom: 8 }}>Pay with</div>
      <Seg value={method} onChange={setMethod} style={{ marginBottom: 16 }} options={[{ v: 'UPI', label: 'UPI' }, { v: 'Card', label: 'Card' }, { v: 'Venue', label: 'Pay at venue' }]} />
      <div className="card tight">
        <div className="sum-row"><span className="muted">{dur} × hourly rate</span><span>{INR(c.base)}</span></div>
        {c.offerDisc > 0 && <div className="sum-row accent"><span>Turf offer</span><span>−{INR(c.offerDisc)}</span></div>}
        {c.addonsSum > 0 && <div className="sum-row"><span className="muted">Add-ons</span><span>{INR(c.addonsSum)}</span></div>}
        {c.couponOff > 0 && <div className="sum-row accent"><span>Coupon {coupon}</span><span>−{INR(c.couponOff)}</span></div>}
        {c.pts > 0 && <div className="sum-row accent"><span>Points redeemed</span><span>−{INR(c.pts)}</span></div>}
        <div className="sum-row"><span className="muted">Convenience fee</span><span className="accent">Free</span></div>
        <div className="sum-row total"><span>Total</span><span>{INR(c.total)}</span></div>
      </div>
      <button className="btn primary block" style={{ marginTop: 16 }} onClick={confirm}><Lock className="ico sm" /> {method === 'Venue' ? 'Reserve' : 'Pay'} {INR(c.total)} · earn {c.earn} pts</button>
      <p className="xs dim" style={{ textAlign: 'center', marginTop: 10 }}>100% refund up to 24h before · 50% up to 2h before</p>
    </>
  )
}
