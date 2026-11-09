import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import clsx from 'clsx'
import type { Booking, Sport } from '@/types'
import { INR, addDays, dateLabel, dk, hourLabel, rangeLabel, relDay, sportLabel, todayKey } from '@/lib/format'
import { useStore, useUI, useUser, openSheet, toast } from '@/store'
import { BellBtn, SheetHead, Stat, StatusTag, Tag, Topbar } from '@/components/ui'
import { ManualBookingSheet } from '@/sheets/OwnerSheets'

const COLORS: Record<Sport, string> = { cricket: '#2f8f47', football: '#1f6fd1', badminton: '#0f8a86', tt: '#7c3aed', tennis: '#b85c32', basketball: '#d97706' }
const H0 = 6, ROWS = 18, RH = 52

function BookingDetail({ b }: { b: Booking }) {
  const s = useStore(); const close = useUI(x => x.closeSheet); const t = s.turfs.find(x => x.id === b.turfId); const pu = s.users.find(x => x.id === b.userId)
  if (!t) return null
  const set = (st: Booking['status']) => { if (st === 'cancelled' && !confirm(`Cancel ${b.userName}'s booking? They'll be refunded ${INR(b.amount)}.`)) return; s.setBookingStatus(b.id, st, st === 'cancelled' ? b.amount : undefined); if (st === 'cancelled') s.notify(b.userId, 'cancel', 'Booking cancelled by venue', `${t.name} · ${relDay(b.date)} ${hourLabel(b.hour)} · full refund`); close(); toast(st === 'completed' ? 'Checked in ✓' : st === 'no-show' ? 'Marked no-show' : 'Cancelled & refunded') }
  return (
    <>
      <SheetHead title={b.userName} sub={`${t.name} · ${relDay(b.date)}, ${dateLabel(b.date, 'd MMM')}`} />
      <div className="card tight" style={{ marginBottom: 14 }}>
        <div className="sum-row"><span className="muted">Slot</span><span>{rangeLabel(b.hour, b.duration)} · {b.duration}h</span></div>
        <div className="sum-row"><span className="muted">Sport</span><span>{sportLabel(b.sport)}</span></div>
        <div className="sum-row"><span className="muted">Payment</span><span>{INR(b.amount)} · {b.method}</span></div>
        <div className="sum-row"><span className="muted">Code</span><span className="num">#{b.code}</span></div>
        <div className="sum-row"><span className="muted">Status</span><StatusTag status={b.status} /></div>
        {pu?.phone && <div className="sum-row"><span className="muted">Phone</span><a href={`tel:${pu.phone.replace(/\s/g, '')}`} className="accent">{pu.phone}</a></div>}
      </div>
      {b.status === 'confirmed' && <div className="grid3"><button className="btn ghost sm" onClick={() => set('completed')}>Check in</button><button className="btn ghost sm" onClick={() => set('no-show')}>No-show</button><button className="btn danger sm" onClick={() => set('cancelled')}>Cancel</button></div>}
    </>
  )
}

export function OwnerCalendar() {
  const s = useStore(); const u = useUser()!; const [off, setOff] = useState(0); const [turf, setTurf] = useState('')
  const myT = s.turfs.filter(t => t.ownerId === u.id); const ids = new Set(myT.map(t => t.id))
  const monday = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); const wd = (d.getDay() + 6) % 7; return addDays(d, -wd + off * 7) }, [off])
  const days = Array.from({ length: 7 }, (_, i) => dk(addDays(monday, i))); const tk = todayKey()
  const week = s.bookings.filter(b => ids.has(b.turfId) && (!turf || b.turfId === turf) && days.includes(b.date))
  const live = week.filter(b => b.status !== 'cancelled'); const rev = live.filter(b => b.status !== 'no-show').reduce((a, b) => a + b.amount, 0)
  const hoursBooked = live.reduce((a, b) => a + b.duration, 0); const avail = (turf ? myT.filter(t => t.id === turf) : myT).reduce((a, t) => a + (t.close - t.open), 0) * 7
  const now = new Date(); const nowY = ((now.getHours() + now.getMinutes() / 60) - H0) * RH
  return (
    <>
      <Topbar eyebrow={`${dateLabel(days[0], 'd MMM')} – ${dateLabel(days[6], 'd MMM yyyy')}`} title="Calendar" actions={<><BellBtn /><button className="btn primary sm" onClick={() => openSheet(<ManualBookingSheet turfs={myT} />)}><Plus className="ico sm" /> Add</button></>} />
      <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <div className="row" style={{ gap: 4 }}><button className="icon-btn" style={{ width: 38, height: 38 }} onClick={() => setOff(o => o - 1)}><ChevronLeft className="ico sm" /></button><button className="btn ghost sm" onClick={() => setOff(0)}>This week</button><button className="icon-btn" style={{ width: 38, height: 38 }} onClick={() => setOff(o => o + 1)}><ChevronRight className="ico sm" /></button></div>
        <select className="input" style={{ height: 38, width: 'auto', padding: '0 34px 0 12px', fontSize: 13 }} value={turf} onChange={e => setTurf(e.target.value)}><option value="">All turfs</option>{myT.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
        <div className="row" style={{ marginLeft: 'auto', gap: 10, flexWrap: 'wrap' }}>{myT.map(t => t.sport).filter((v, i, a) => a.indexOf(v) === i).map(sp => <span key={sp} className="xs muted row" style={{ gap: 5 }}><i style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[sp], display: 'inline-block' }} />{sportLabel(sp)}</span>)}</div>
      </div>
      <div className="grid3" style={{ marginBottom: 14 }}><Stat v={live.length} k="Bookings" center accent /><Stat v={INR(rev)} k="Revenue" center accent /><Stat v={`${avail ? Math.round(hoursBooked / avail * 100) : 0}%`} k="Occupancy" center accent /></div>
      <div className="cal-wrap"><div className="cal" style={{ gridTemplateRows: 'auto 1fr' }}>
        <div className="cal-h" style={{ borderLeft: 0 }} />
        {days.map(d => { const dd = new Date(d + 'T00:00:00'); return <div key={d} className={clsx('cal-h', d === tk && 'today')}>{dd.toLocaleDateString('en-IN', { weekday: 'short' })}<b>{dd.getDate()}</b></div> })}
        <div style={{ display: 'flex', flexDirection: 'column' }}>{Array.from({ length: ROWS }, (_, i) => <div key={i} className="cal-t">{hourLabel(H0 + i)}</div>)}</div>
        {days.map(d => (
          <div key={d} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {Array.from({ length: ROWS }, (_, i) => <div key={i} className={clsx('cal-c', (d < tk || (d === tk && H0 + i < now.getHours())) && 'past')} />)}
            {week.filter(b => b.date === d).map(b => { const t = s.turfs.find(x => x.id === b.turfId); return <button key={b.id} className={clsx('cal-b', b.status === 'cancelled' && 'cancelled')} style={{ top: (b.hour - H0) * RH + 2, height: b.duration * RH - 4, background: COLORS[b.sport], opacity: b.status === 'no-show' ? .55 : undefined }} onClick={() => openSheet(<BookingDetail b={b} />)} title={`${b.userName} · ${t?.name}`}><b>{b.userName}</b>{t?.name}{b.duration > 1 && <><br />{rangeLabel(b.hour, b.duration)} · {INR(b.amount)}</>}</button> })}
            {d === tk && nowY > 0 && nowY < ROWS * RH && <div className="cal-now" style={{ top: nowY }} />}
          </div>
        ))}
      </div></div>
      <p className="xs dim" style={{ marginTop: 10 }}>Tap a booking for check-in, no-show or cancellation. <Tag tone="grey">Striped = past</Tag></p>
    </>
  )
}
