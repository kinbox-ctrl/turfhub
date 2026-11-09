import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowRight, Ban, Calendar, CalendarDays, ChevronLeft, Clock, Edit3, Heart, MapPin, Share2, Star } from 'lucide-react'
import clsx from 'clsx'
import { INR, addDays, dateLabel, dk, hourLabel, hourShort, rangeLabel, relDay, shareText, sportLabel, todayKey } from '@/lib/format'
import { canStart, isTaken, price, slotsLeft } from '@/lib/logic'
import { useStore, useUser, openSheet, toast } from '@/store'
import { TurfArt } from '@/components/TurfArt'
import { Amenity, Avatar, Empty, Label, SectionHead, Seg, Tag, Topbar } from '@/components/ui'
import { BookSheet } from '@/sheets/BookSheet'
import { RateSheet } from '@/sheets/RateSheet'

export function TurfPage() {
  const { id } = useParams(); const [sp] = useSearchParams(); const nav = useNavigate()
  const s = useStore(); const u = useUser()!; const t = s.turfs.find(x => x.id === id)
  const [date, setDate] = useState(sp.get('date') && sp.get('date')! >= todayKey() ? sp.get('date')! : todayKey()); const [dur, setDur] = useState(Number(sp.get('dur')) || 1); const [hour, setHour] = useState<number | null>(null); const [view, setView] = useState<'day' | 'week'>(() => (window.innerWidth >= 700 ? 'week' : 'day'))
  useEffect(() => { document.querySelector('.date.on')?.scrollIntoView({ inline: 'center', block: 'nearest' }) }, [date])
  const dates = useMemo(() => Array.from({ length: 14 }, (_, i) => dk(addDays(new Date(), i))), [])
  if (!t) return <><Topbar title="Turf" back /><Empty icon={Ban} title="Turf not found" sub="It may have been removed." /></>
  if (hour != null && !canStart(s, t, date, hour, dur)) setHour(null)
  const fav = u.favs.includes(t.id)
  const slots = Array.from({ length: t.close - t.open }, (_, i) => { const hh = t.open + i; const state = isTaken(s, t, date, hh); return { hh, state, ok: !state && canStart(s, t, date, hh, dur), p: price(s, t, date, hh, u.id) } })
  const reviews = s.reviews.filter(r => r.turfId === t.id).sort((a, b) => b.date.localeCompare(a.date))
  const total = hour != null ? Array.from({ length: dur }, (_, k) => price(s, t, date, hour + k, u.id).final).reduce((a, b) => a + b, 0) : 0
  const owner = s.users.find(x => x.id === t.ownerId); const left = slotsLeft(s, t, date)
  const share = async () => { const r = await shareText(`${t.name} — ${sportLabel(t.sport)} in ${t.area}, ${t.city}. From ${INR(t.price)}/hr${t.offer ? ' · ' + t.offer.label : ''}. Book on TurfHub: ${location.href}`); if (r === 'copied') toast('Link copied') }
  return (
    <>
      <div className="hero"><TurfArt turf={t} />
        <div className="over">
          <div className="row between"><button className="icon-btn" onClick={() => (history.length > 1 ? nav(-1) : nav('/discover'))}><ChevronLeft className="ico" /></button><div className="row"><button className="icon-btn" onClick={share}><Share2 className="ico" /></button><button className={clsx('icon-btn', fav && 'red')} onClick={() => { s.toggleFav(t.id); toast(fav ? 'Removed from favourites' : 'Saved to favourites ❤️') }}><Heart className="ico" /></button></div></div>
          <div><div className="row wrap" style={{ gap: 8, marginBottom: 8 }}><Tag>{sportLabel(t.sport)}</Tag>{t.offer && <Tag tone="solid">{t.offer.label}</Tag>}{t.peakPct > 0 && <Tag tone="amber">Peak +{t.peakPct}% from {hourLabel(t.peakFrom)}</Tag>}</div><h1 className="h1" style={{ fontSize: 30 }}>{t.name}</h1></div>
        </div>
      </div>
      <div className="wide-grid">
        <div>
          <div className="row between" style={{ marginTop: 14, alignItems: 'flex-start' }}>
            <div><div className="row wrap" style={{ gap: 12 }}><span className="rating"><Star className="ico sm" />{t.reviews ? <>{t.rating} <span className="muted" style={{ fontWeight: 400 }}>({t.reviews} reviews)</span></> : 'New'}</span><span className="meta"><MapPin className="ico sm" />{t.area}, {t.city}</span></div><div className="meta" style={{ marginTop: 6 }}><Clock className="ico sm" />{hourLabel(t.open)} – {hourLabel(t.close)} · by {owner?.business ?? owner?.name ?? 'TurfHub partner'}</div></div>
            <div className="price" style={{ textAlign: 'right' }}>{INR(t.price)}<small>/hr</small></div>
          </div>
          <p className="small muted" style={{ marginTop: 14, lineHeight: 1.65 }}>{t.desc}</p>
          <section className="section"><Label style={{ marginBottom: 10 }}>Amenities</Label><div className="amen">{t.amenities.map(a => <Amenity key={a} id={a} />)}</div></section>
          <section className="section"><SectionHead label="Reviews" right={<button className="link" onClick={() => openSheet(<RateSheet turfId={t.id} />)}><Edit3 className="ico xs" /> Write a review</button>} />
            <div className="stack s8">{reviews.length ? reviews.slice(0, 3).map(r => <div key={r.id} className="card tight"><div className="row between"><div className="row"><Avatar user={s.users.find(x => x.id === r.userId) ?? { name: r.name, color: '#666' }} size="sm" /><strong className="small">{r.name}</strong></div><span className="amber small">{'★'.repeat(r.stars)}<span className="dim">{'★'.repeat(5 - r.stars)}</span></span></div><p className="small muted" style={{ marginTop: 8 }}>{r.text}</p><div className="xs dim" style={{ marginTop: 6 }}>{dateLabel(r.date)}</div></div>) : <div className="card small muted">No reviews yet — be the first.</div>}</div>
          </section>
        </div>
        <div>
          <section className="section card">
            <SectionHead label={<><Calendar className="ico sm" /> {view === 'week' ? 'Pick a slot this week' : 'Pick a date'}</>} right={<div className="row" style={{ gap: 8 }}><span className={clsx('xs', left < 4 ? 'amber' : 'muted')}>{left} free {relDay(date).toLowerCase()}</span><div className="seg" style={{ padding: 3 }}><button className={clsx(view === 'day' && 'on')} style={{ height: 28, padding: '0 10px', fontSize: 12 }} onClick={() => setView('day')}>Day</button><button className={clsx(view === 'week' && 'on')} style={{ height: 28, padding: '0 10px', fontSize: 12 }} onClick={() => setView('week')}><CalendarDays className="ico xs" /> Week</button></div></div>} />
            <SectionHead label={<><Clock className="ico sm" /> Duration</>} right={<div className="legend"><span><i style={{ background: 'var(--amber)' }} />Peak</span><span><i style={{ background: 'var(--accent)' }} />Offer</span><span><i style={{ background: 'var(--surface-3)' }} />Taken</span></div>} />
            <Seg value={String(dur)} onChange={v => setDur(+v)} options={[1, 2, 3].map(d => ({ v: String(d), label: `${d} hour${d > 1 ? 's' : ''}` }))} />
            {view === 'week' ? (
              <div className="week" style={{ marginTop: 16 }}>
                <span />{dates.slice(0, 7).map(d => { const dd = new Date(d + 'T00:00:00'); return <div key={d} className={clsx('wh', d === todayKey() && 'today')}>{dd.toLocaleDateString('en-IN', { weekday: 'short' })}<b>{dd.getDate()}</b></div> })}
                {Array.from({ length: t.close - t.open }, (_, i) => t.open + i).map(hh => [
                  <div key={'t' + hh} className="wt">{hourShort(hh)}</div>,
                  ...dates.slice(0, 7).map(d => { const st = isTaken(s, t, d, hh); const ok = !st && canStart(s, t, d, hh, dur); const p = price(s, t, d, hh, u.id); const on = d === date && hh === hour; return <button key={d + hh} className={clsx('wk', on && 'on', ok && p.pct > 0 && 'deal', ok && p.peak && !p.pct && 'peak', st === 'booked' && 'booked')} disabled={!ok} title={st ? st : `${dateLabel(d)} ${hourLabel(hh)} · ${INR(p.final)}`} onClick={() => { setDate(d); setHour(on ? null : hh) }}>{st === 'booked' ? '·' : st ? '' : ok ? (p.final >= 1000 ? `${(p.final / 1000).toFixed(p.final % 1000 === 0 ? 0 : 1)}k` : p.final) : '–'}</button> }),
                ])}
              </div>
            ) : (<>
            <div className="dates" style={{ marginTop: 16 }}>{dates.map(d => { const dd = new Date(d + 'T00:00:00'); return <button key={d} className={clsx('date', d === date && 'on')} onClick={() => { setDate(d); setHour(null) }}><div className="d1">{d === todayKey() ? 'Today' : dd.toLocaleDateString('en-IN', { weekday: 'short' })}</div><div className="d2">{dd.getDate()}</div><div className="d3">{dd.toLocaleDateString('en-IN', { month: 'short' })}</div></button> })}</div>
            <div className="slots" style={{ marginTop: 14 }}>{slots.map(sl => <button key={sl.hh} className={clsx('slot', sl.hh === hour && 'on', sl.p.peak && sl.ok && 'peak', sl.state === 'blocked' && 'blocked')} disabled={!sl.ok} onClick={() => setHour(hour === sl.hh ? null : sl.hh)}><div className="t">{hourShort(sl.hh)}</div><div className="p">{sl.state === 'booked' ? 'Booked' : sl.state === 'blocked' ? 'Closed' : sl.state === 'past' ? 'Past' : !sl.ok ? `No ${dur}h` : INR(sl.p.final)}</div></button>)}</div>
            </>)}
            <p className="xs dim" style={{ marginTop: 12 }}>{t.offer ? `${t.offer.label} · ` : ''}Prices per hour after offers · No convenience fee · Free cancellation up to 24h before.</p>
          </section>
        </div>
      </div>
      {hour != null && <div className="book-bar"><div className="inner"><div style={{ flex: 1, minWidth: 0 }}><div className="xs muted">{relDay(date)} · {rangeLabel(hour, dur)}</div><div className="price">{INR(total)} <small>for {dur}h</small></div></div><button className="btn primary" onClick={() => openSheet(<BookSheet turf={t} date={date} hour={hour} dur={dur} onBooked={() => setHour(null)} />)}>Book now <ArrowRight className="ico sm" /></button></div></div>}
    </>
  )
}
