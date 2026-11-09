import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import clsx from 'clsx'
import type { Offer, PayMethod, Sport, Turf } from '@/types'
import { SPORTS, SPORT_KEYS, addDays, dk, genCode, hourLabel, hourShort, INR, rangeLabel, relDay, todayKey, uid } from '@/lib/format'
import { canStart, isTaken, price } from '@/lib/logic'
import { CITY_CENTER } from '@/data/seed'
import { useStore, useUI, useUser, toast } from '@/store'
import { AMENITIES, Chip, Seg, SheetHead } from '@/components/ui'

const Hours = ({ from, to }: { from: number; to: number }) => <>{Array.from({ length: to - from + 1 }, (_, i) => from + i).map(h => <option key={h} value={h}>{hourLabel(h)}</option>)}</>

export function TurfEditorSheet({ turf }: { turf?: Turf }) {
  const s = useStore(); const u = useUser()!; const close = useUI(x => x.closeSheet)
  const [f, setF] = useState(() => turf ?? { id: uid('t'), name: '', sport: 'football' as Sport, city: u.city || 'Bangalore', area: '', price: 1000, rating: 0, reviews: 0, offer: null, amenities: [] as string[], ownerId: u.id, desc: '', open: 6, close: 23, peakFrom: 18, peakPct: 20, addons: [], active: true, blocked: [], lat: 0, lng: 0 })
  const [addonsText, setAddonsText] = useState(f.addons.map(a => `${a.name}:${a.price}`).join(', '))
  const set = <K extends keyof Turf>(k: K, v: Turf[K]) => setF(x => ({ ...x, [k]: v }))
  const submit = (e: React.FormEvent) => {
    e.preventDefault(); if (!f.name.trim() || !f.area.trim()) return toast('Name and area are required', 'err'); if (f.close <= f.open) return toast('Closing time must be after opening', 'err')
    const addons = addonsText.split(',').map(x => x.trim()).filter(Boolean).map((x, i) => { const [name, p] = x.split(':'); return { id: `a${i}`, name: name.trim(), price: Math.max(0, +p || 0) } }).filter(a => a.name)
    const c = CITY_CENTER[f.city] ?? CITY_CENTER.Bangalore; const jitter = () => (Math.random() - 0.5) * 0.08
    s.upsertTurf({ ...f, name: f.name.trim(), area: f.area.trim(), addons, lat: f.lat || c[0] + jitter(), lng: f.lng || c[1] + jitter() }); close(); toast(turf ? 'Turf updated' : 'Turf published — players can book it now')
  }
  return (
    <>
      <SheetHead title={turf ? 'Edit turf' : 'New turf'} sub={turf ? turf.name : 'Goes live instantly'} />
      <form className="stack" onSubmit={submit}>
        <div className="field"><label>Name</label><input className="input" required value={f.name} onChange={e => set('name', e.target.value)} /></div>
        <div className="grid2"><div className="field"><label>Sport</label><select className="input" value={f.sport} onChange={e => set('sport', e.target.value as Sport)}>{SPORT_KEYS.map(k => <option key={k} value={k}>{SPORTS[k]}</option>)}</select></div><div className="field"><label>City</label><select className="input" value={f.city} onChange={e => set('city', e.target.value)}>{['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune'].map(c => <option key={c}>{c}</option>)}</select></div></div>
        <div className="field"><label>Area / locality</label><input className="input" required value={f.area} onChange={e => set('area', e.target.value)} /></div>
        <div className="grid3"><div className="field"><label>Base ₹/hr</label><input className="input" type="number" min={100} step={50} value={f.price} onChange={e => set('price', +e.target.value)} /></div><div className="field"><label>Opens</label><select className="input" value={f.open} onChange={e => set('open', +e.target.value)}><Hours from={0} to={23} /></select></div><div className="field"><label>Closes</label><select className="input" value={f.close} onChange={e => set('close', +e.target.value)}><Hours from={1} to={24} /></select></div></div>
        <div className="grid2"><div className="field"><label>Peak from</label><select className="input" value={f.peakFrom} onChange={e => set('peakFrom', +e.target.value)}><Hours from={12} to={23} /></select></div><div className="field"><label>Peak surcharge %</label><input className="input" type="number" min={0} max={100} value={f.peakPct} onChange={e => set('peakPct', +e.target.value)} /></div></div>
        <div className="field"><label>Amenities</label><div className="row wrap" style={{ gap: 8 }}>{Object.entries(AMENITIES).map(([k, a]) => <Chip key={k} on={f.amenities.includes(k)} onClick={() => set('amenities', f.amenities.includes(k) ? f.amenities.filter(x => x !== k) : [...f.amenities, k])}>{a.label}</Chip>)}</div></div>
        <div className="field"><label>Add-ons (name:price, comma separated)</label><input className="input" placeholder="Match ball:100, Referee:400" value={addonsText} onChange={e => setAddonsText(e.target.value)} /></div>
        <div className="field"><label>Description</label><textarea className="input" rows={3} style={{ height: 'auto', padding: '12px 16px' }} value={f.desc} onChange={e => set('desc', e.target.value)} /></div>
        <div className="row" style={{ gap: 10 }}>{turf && <button type="button" className="btn danger" onClick={() => { if (!confirm(`Delete ${turf.name}? Existing bookings stay in history.`)) return; s.deleteTurf(turf.id); close(); toast('Turf removed') }}><Trash2 className="ico sm" /></button>}<button className="btn primary block" type="submit">{turf ? 'Save changes' : 'Publish turf'}</button></div>
      </form>
    </>
  )
}

export function OfferSheet({ turf }: { turf: Turf }) {
  const s = useStore(); const close = useUI(x => x.closeSheet)
  const [type, setType] = useState<Offer['type'] | 'none'>(turf.offer?.type ?? 'none'); const [pct, setPct] = useState(turf.offer?.pct ?? 10); const [after, setAfter] = useState(turf.offer?.after ?? 20)
  const label = type === 'all' ? `${pct}% OFF every slot` : type === 'after' ? `Night deal: ${pct}% OFF after ${hourLabel(after)}` : type === 'weekday' ? `Weekday Power Play: ${pct}% OFF` : type === 'first' ? `Welcome deal: ${pct}% OFF` : ''
  return (
    <>
      <SheetHead title="Offer" sub={turf.name} />
      <div className="stack">
        <div className="field"><label>Type</label><select className="input" value={type} onChange={e => setType(e.target.value as Offer['type'] | 'none')}><option value="none">No offer</option><option value="all">Every slot</option><option value="after">After a certain hour</option><option value="weekday">Weekdays only</option><option value="first">First booking (welcome)</option></select></div>
        {type !== 'none' && <div className="grid2"><div className="field"><label>Discount %</label><input className="input" type="number" min={5} max={70} value={pct} onChange={e => setPct(+e.target.value)} /></div>{type === 'after' && <div className="field"><label>After</label><select className="input" value={after} onChange={e => setAfter(+e.target.value)}><Hours from={12} to={23} /></select></div>}</div>}
        {type !== 'none' && <div className="card tight small"><span className="muted">Players will see: </span><b className="accent">{label}</b><div className="xs muted" style={{ marginTop: 6 }}>Example: {INR(turf.price)}/hr → {INR(price(s, { ...turf, offer: { type, pct, label, after } }, todayKey(), type === 'after' ? after : turf.open, undefined).final)}/hr</div></div>}
        <button className="btn primary block" onClick={() => { s.setOffer(turf.id, type === 'none' ? null : { type, pct, label, after: type === 'after' ? after : undefined }); close(); toast(type === 'none' ? 'Offer removed' : 'Offer is live') }}>Save offer</button>
      </div>
    </>
  )
}

export function BlockSheet({ turf }: { turf: Turf }) {
  const s = useStore(); const close = useUI(x => x.closeSheet)
  const [date, setDate] = useState(todayKey()); const [sel, setSel] = useState<number[]>(() => turf.blocked.filter(k => k.startsWith(todayKey() + '|')).map(k => +k.split('|')[1]))
  const changeDate = (d: string) => { setDate(d); setSel(turf.blocked.filter(k => k.startsWith(d + '|')).map(k => +k.split('|')[1])) }
  const hours = Array.from({ length: turf.close - turf.open }, (_, i) => turf.open + i)
  return (
    <>
      <SheetHead title="Block slots" sub="Maintenance, private events, tournaments" />
      <div className="field" style={{ marginBottom: 14 }}><label>Date</label><input className="input" type="date" min={todayKey()} max={dk(addDays(new Date(), 60))} value={date} onChange={e => changeDate(e.target.value)} /></div>
      <div className="slots" style={{ marginBottom: 14 }}>{hours.map(h => { const st = isTaken(s, turf, date, h); const booked = st === 'booked'; const on = sel.includes(h); return <button key={h} className={clsx('slot', on && 'on')} disabled={booked} title={booked ? 'Has a booking' : ''} onClick={() => setSel(x => on ? x.filter(v => v !== h) : [...x, h])}><div className="t">{hourShort(h)}</div><div className="p">{booked ? 'Booked' : on ? 'Blocked' : 'Open'}</div></button> })}</div>
      <div className="row" style={{ gap: 8 }}><button className="btn ghost sm" onClick={() => setSel(hours.filter(h => isTaken(s, turf, date, h) !== 'booked'))}>Block whole day</button><button className="btn ghost sm" onClick={() => setSel([])}>Clear</button><button className="btn primary block" style={{ flex: 1 }} onClick={() => { s.setBlocked(turf.id, date, sel); close(); toast(sel.length ? `${sel.length} slot${sel.length > 1 ? 's' : ''} blocked on ${relDay(date)}` : `All slots open on ${relDay(date)}`) }}>Save</button></div>
    </>
  )
}

export function ManualBookingSheet({ turfs }: { turfs: Turf[] }) {
  const s = useStore(); const close = useUI(x => x.closeSheet)
  const [turfId, setTurfId] = useState(turfs[0]?.id ?? ''); const [name, setName] = useState(''); const [phone, setPhone] = useState(''); const [date, setDate] = useState(todayKey()); const [hour, setHour] = useState(18); const [dur, setDur] = useState(1); const [method, setMethod] = useState<PayMethod>('Venue')
  const t = turfs.find(x => x.id === turfId)
  const amount = t ? Array.from({ length: dur }, (_, k) => price(s, t, date, hour + k).final).reduce((a, b) => a + b, 0) : 0
  const ok = t ? canStart(s, t, date, hour, dur) : false
  return (
    <>
      <SheetHead title="Add booking" sub="Walk-in or phone booking" />
      <form className="stack" onSubmit={e => { e.preventDefault(); if (!t) return; if (!ok) return toast('That slot is not available', 'err'); if (!name.trim()) return toast('Player name is required', 'err'); s.addBooking({ id: uid('b'), turfId: t.id, userId: 'walkin-' + phone.replace(/\D/g, ''), userName: name.trim(), date, hour, duration: dur, amount, status: 'confirmed', sport: t.sport, code: genCode(), createdAt: new Date().toISOString(), method, addons: [] }, 0); close(); toast(`Booked ${name.trim()} · ${relDay(date)} ${rangeLabel(hour, dur)}`) }}>
        <div className="field"><label>Turf</label><select className="input" value={turfId} onChange={e => setTurfId(e.target.value)}>{turfs.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
        <div className="grid2"><div className="field"><label>Player name</label><input className="input" required value={name} onChange={e => setName(e.target.value)} /></div><div className="field"><label>Phone</label><input className="input" placeholder="+91" value={phone} onChange={e => setPhone(e.target.value)} /></div></div>
        <div className="grid3"><div className="field"><label>Date</label><input className="input" type="date" min={todayKey()} value={date} onChange={e => setDate(e.target.value)} /></div><div className="field"><label>Start</label><select className="input" value={hour} onChange={e => setHour(+e.target.value)}>{t && <Hours from={t.open} to={t.close - 1} />}</select></div><div className="field"><label>Hours</label><select className="input" value={dur} onChange={e => setDur(+e.target.value)}><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option></select></div></div>
        <div className="field"><label>Payment</label><Seg value={method} onChange={setMethod} options={[{ v: 'Venue', label: 'Pay at venue' }, { v: 'UPI', label: 'UPI' }, { v: 'Card', label: 'Card' }]} /></div>
        <div className="card tight row between small"><span className="muted">{ok ? 'Available' : 'Not available'} · {dur}h</span><b className={ok ? 'accent' : 'red'}>{INR(amount)}</b></div>
        <button className="btn primary block" type="submit" disabled={!ok}>Confirm booking</button>
      </form>
    </>
  )
}
