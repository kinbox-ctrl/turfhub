import { useMemo, useState } from 'react'
import { Ban, Calendar, Check, Download, Phone, Plus, Search, User } from 'lucide-react'
import type { Booking } from '@/types'
import { INR, byTimeAsc, byTimeDesc, download, hourLabel, rangeLabel, relDay, sportLabel, todayKey } from '@/lib/format'
import { useStore, useUI, useUser, openSheet, toast } from '@/store'
import { Chip, Empty, SectionHead, StatusTag, Topbar } from '@/components/ui'
import { TurfArt } from '@/components/TurfArt'
import { ManualBookingSheet } from '@/sheets/OwnerSheets'

type Tab = 'all' | 'today' | 'upcoming' | 'completed' | 'cancelled'
const TABS: Tab[] = ['all', 'today', 'upcoming', 'completed', 'cancelled']

export function OwnerBookings() {
  const s = useStore(); const u = useUser()!; const filter = useUI(x => x.bookingsFilter); const setFilter = useUI(x => x.setBookingsFilter)
  const [tab, setTab] = useState<Tab>('all'); const [q, setQ] = useState(''); const [limit, setLimit] = useState(40)
  const myT = s.turfs.filter(t => t.ownerId === u.id); const tf = filter.turf ?? ''
  const { list, total, lifetime } = useMemo(() => {
    const ids = new Set(myT.map(t => t.id)); const all = s.bookings.filter(b => ids.has(b.turfId)); const tk = todayKey(); const nowH = new Date().getHours()
    const tabs: Record<Tab, (b: Booking) => boolean> = { all: () => true, today: b => b.date === tk, upcoming: b => b.status === 'confirmed' && (b.date > tk || (b.date === tk && b.hour > nowH)), completed: b => b.status === 'completed', cancelled: b => b.status === 'cancelled' || b.status === 'no-show' }
    const ql = q.toLowerCase()
    const list = all.filter(tabs[tab]).filter(b => !tf || b.turfId === tf).filter(b => !ql || `${b.userName} ${s.turfs.find(t => t.id === b.turfId)?.name ?? ''} ${b.code}`.toLowerCase().includes(ql)).sort(tab === 'upcoming' || tab === 'today' ? byTimeAsc : byTimeDesc)
    return { list, total: all.length, lifetime: all.filter(b => b.status === 'completed' || b.status === 'confirmed').reduce((a, b) => a + b.amount, 0) }
  }, [s, myT, tab, q, tf])
  const exportCsv = () => { const rows = [['Code', 'Turf', 'Player', 'Date', 'Start', 'Hours', 'Amount', 'Status', 'Method'], ...list.map(b => [b.code, s.turfs.find(t => t.id === b.turfId)?.name ?? '', b.userName, b.date, hourLabel(b.hour), b.duration, b.amount, b.status, b.method])]; download(`turfhub-bookings-${todayKey()}.csv`, rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n'), 'text/csv'); toast(`Exported ${list.length} bookings`) }
  const setStatus = (b: Booking, st: Booking['status']) => {
    if (st === 'cancelled' && !confirm(`Cancel ${b.userName}'s booking? They'll be notified and fully refunded.`)) return
    s.setBookingStatus(b.id, st, st === 'cancelled' ? b.amount : undefined)
    const t = s.turfs.find(x => x.id === b.turfId)
    if (st === 'cancelled') s.notify(b.userId, 'cancel', 'Booking cancelled by venue', `${t?.name} · ${relDay(b.date)} ${hourLabel(b.hour)} · full refund of ${INR(b.amount)}`)
    toast(st === 'completed' ? `${b.userName} checked in ✓` : st === 'no-show' ? 'Marked as no-show' : 'Booking cancelled & refunded')
  }
  const shown = list.slice(0, limit); const shownRev = list.filter(b => b.status !== 'cancelled' && b.status !== 'no-show').reduce((a, b) => a + b.amount, 0)
  return (
    <>
      <Topbar eyebrow={`${total} bookings · ${INR(lifetime)} lifetime`} title="All bookings" actions={<><button className="icon-btn" title="Export CSV" onClick={exportCsv}><Download className="ico" /></button><button className="btn primary sm" onClick={() => openSheet(<ManualBookingSheet turfs={myT} />)}><Plus className="ico sm" /> Add</button></>} />
      <div className="search"><Search className="ico" /><input className="input" placeholder="Search player, turf or code…" value={q} onChange={e => setQ(e.target.value)} /></div>
      <div className="chips" style={{ marginTop: 10 }}>{TABS.map(k => <Chip key={k} on={tab === k} onClick={() => { setTab(k); setLimit(40) }}>{k[0].toUpperCase() + k.slice(1)}</Chip>)}</div>
      <select className="input" style={{ height: 40, marginTop: 10 }} value={tf} onChange={e => setFilter({ turf: e.target.value || undefined })}><option value="">All turfs</option>{myT.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
      <SectionHead label={`${list.length} results`} right={<span className="xs dim">{INR(shownRev)}</span>} />
      <div className="stack s8">
        {shown.length ? shown.map(b => { const t = s.turfs.find(x => x.id === b.turfId); const pu = s.users.find(x => x.id === b.userId); if (!t) return null; const up = b.status === 'confirmed'; return (
          <div key={b.id} className="card tight">
            <div className="row" style={{ gap: 12 }}>
              <div className="thumb" style={{ width: 50, height: 50 }}><TurfArt turf={t} /></div>
              <div style={{ flex: 1, minWidth: 0 }}><div className="row between"><span className="xs accent" style={{ fontWeight: 700, letterSpacing: '.06em' }}>{sportLabel(t.sport).toUpperCase()}</span><StatusTag status={b.status} /></div><div className="small ellipsis" style={{ fontWeight: 700, marginTop: 2 }}>{t.name}</div><div className="xs muted row" style={{ gap: 4 }}><User className="ico xs" /> {b.userName} · {relDay(b.date)} · {rangeLabel(b.hour, b.duration)}</div></div>
              <div style={{ textAlign: 'right' }}><div className="num" style={{ fontSize: 20, color: 'var(--accent)' }}>{INR(b.amount)}</div><div className="xs dim">{b.method} · #{b.code}</div></div>
            </div>
            {up && <div className="row" style={{ gap: 8, marginTop: 10, flexWrap: 'wrap' }}><button className="btn ghost xs" onClick={() => setStatus(b, 'completed')}><Check className="ico xs" /> Check in</button><button className="btn ghost xs" onClick={() => setStatus(b, 'no-show')}><Ban className="ico xs" /> No-show</button>{pu?.phone && <a className="btn ghost xs" href={`tel:${pu.phone.replace(/\s/g, '')}`}><Phone className="ico xs" /> Call</a>}<button className="btn danger xs" style={{ marginLeft: 'auto' }} onClick={() => setStatus(b, 'cancelled')}>Cancel</button></div>}
          </div>
        ) }) : <Empty icon={Calendar} title="No bookings match" sub="Try another filter or search." />}
        {list.length > shown.length && <button className="btn ghost block" onClick={() => setLimit(l => l + 40)}>Show more ({list.length - shown.length})</button>}
      </div>
    </>
  )
}
