import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Clock, Eye, Heart, MapPin, RefreshCw, Share2, Star, Trophy } from 'lucide-react'
import clsx from 'clsx'
import type { Booking, LiveMatch, OpenMatch, Turf } from '@/types'
import { INR, dateLabel, first, hourLabel, hourShort, icsFor, download, rangeLabel, relDay, shareText, sportLabel, todayKey } from '@/lib/format'
import { price, slotsLeft } from '@/lib/logic'
import { useStore, useUser, openSheet, toast } from '@/store'
import { TurfArt } from '@/components/TurfArt'
import { Avatar, Bar, StatusTag, Tag } from '@/components/ui'
import { TicketSheet } from '@/sheets/TicketSheet'
import { CancelSheet } from '@/sheets/CancelSheet'
import { RateSheet } from '@/sheets/RateSheet'
import { LogScoreSheet } from '@/sheets/LogScoreSheet'

export function TurfCard({ turf }: { turf: Turf }) {
  const s = useStore(); const u = useUser()!; const nav = useNavigate()
  const fav = u.favs.includes(turf.id); const p = price(s, turf, todayKey(), turf.open, u.id); const left = slotsLeft(s, turf, todayKey())
  return (
    <article className="turf-card" onClick={() => nav(`/turf/${turf.id}`)}>
      <div className="turf-art"><TurfArt turf={turf} />
        <div className="over">
          <div className="row between" style={{ alignItems: 'flex-start' }}>{turf.offer ? <Tag tone="solid">{turf.offer.label}</Tag> : <span />}<button className={clsx('fav', fav && 'on')} aria-label="Favourite" onClick={e => { e.stopPropagation(); s.toggleFav(turf.id); toast(fav ? 'Removed from favourites' : 'Saved to favourites ❤️') }}><Heart className="ico sm" /></button></div>
          <div><div className="row" style={{ gap: 8, marginBottom: 6 }}><Tag>{sportLabel(turf.sport)}</Tag><span className="rating"><Star className="ico xs" />{turf.reviews ? <>{turf.rating} <span className="muted" style={{ fontWeight: 400 }}>({turf.reviews})</span></> : 'New'}</span></div><div className="h3">{turf.name}</div></div>
        </div>
      </div>
      <div className="turf-body">
        <div className="row between"><div className="meta"><MapPin className="ico sm" />{turf.area}, {turf.city}</div><div className="price">{p.pct > 0 && <span className="strike">{INR(turf.price)}</span>}{INR(p.final)}<small>/hr</small></div></div>
        <div className="row between xs muted" style={{ marginTop: 8 }}><span className="row" style={{ gap: 4 }}><Clock className="ico xs" />{hourLabel(turf.open)} – {hourLabel(turf.close)}</span><span className={left === 0 ? 'red' : left < 4 ? 'amber' : 'accent'} style={{ fontWeight: 600 }}>{left === 0 ? 'Full today' : `${left} slots left today`}</span></div>
      </div>
    </article>
  )
}

function Score({ v }: { v: number }) {
  const [bump, setBump] = useState(false); const prev = useRef(v)
  useEffect(() => { if (prev.current !== v) { prev.current = v; setBump(true); const t = setTimeout(() => setBump(false), 700); return () => clearTimeout(t) } }, [v])
  return <span className={clsx('pts', bump && 'bump')}>{v}</span>
}
export function LiveCard({ live }: { live: LiveMatch }) {
  const t = useStore(s => s.turfs.find(x => x.id === live.turfId)); const nav = useNavigate()
  if (!t) return null
  return (
    <div className="live-card" style={{ cursor: 'pointer' }} onClick={() => nav(`/turf/${t.id}`)}>
      <div className="row between"><span className="row xs red" style={{ gap: 6, fontWeight: 700, letterSpacing: '.08em' }}><span className="live-dot" />LIVE · {sportLabel(live.sport).toUpperCase()}</span><span className="xs dim">{live.info}</span></div>
      <div className="small muted ellipsis" style={{ marginTop: 6 }}>{t.name}</div>
      <div className="score"><span className="team ellipsis">{live.a}</span><span className="row" style={{ gap: 6 }}><Score v={live.sa} /><span className="dim">–</span><Score v={live.sb} /></span><span className="team ellipsis" style={{ textAlign: 'right' }}>{live.b}</span></div>
    </div>
  )
}

export function BookingCard({ b }: { b: Booking }) {
  const s = useStore(); const nav = useNavigate(); const t = s.turfs.find(x => x.id === b.turfId)
  if (!t) return null
  const hasResult = s.results.some(r => r.bookingId === b.id); const up = b.status === 'confirmed'
  const st = new Date(b.date + 'T00:00:00'); st.setHours(b.hour); const live = up && Date.now() >= st.getTime() && Date.now() < st.getTime() + b.duration * 36e5
  const rebook = () => nav(`/turf/${t.id}?date=${b.date}&dur=${b.duration}`)
  const ics = () => { download(`turfhub-${b.code}.ics`, icsFor(b, `${sportLabel(t.sport)} at ${t.name}`, `${t.area}, ${t.city}`), 'text/calendar'); toast('Calendar event downloaded') }
  return (
    <div className="card tight">
      <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
        <div className="thumb"><TurfArt turf={t} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row between">{live ? <Tag tone="red"><span className="live-dot" style={{ background: '#fff' }} /> Live now</Tag> : <Tag>{sportLabel(t.sport)}</Tag>}<StatusTag status={b.status} /></div>
          <div className="h3 ellipsis" style={{ marginTop: 6 }}>{t.name}</div>
          <div className="xs muted">{relDay(b.date)}, {dateLabel(b.date, 'd MMM')} · {rangeLabel(b.hour, b.duration)}</div>
          <div className="row between" style={{ marginTop: 6 }}><span className="small" style={{ fontWeight: 700 }}>{INR(b.amount)}</span><span className="xs dim">#{b.code}</span></div>
        </div>
      </div>
      <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        {up ? <>
          <button className="btn ghost xs" onClick={() => openSheet(<TicketSheet booking={b} />)}><Eye className="ico xs" /> Ticket</button>
          <button className="btn ghost xs" onClick={ics}><Calendar className="ico xs" /> Calendar</button>
          <button className="btn ghost xs" onClick={rebook}><RefreshCw className="ico xs" /> Rebook</button>
          <button className="btn danger xs" style={{ marginLeft: 'auto' }} onClick={() => openSheet(<CancelSheet booking={b} />)}>Cancel</button>
        </> : b.status === 'completed' ? <>
          {hasResult ? <Tag tone="grey">Score logged</Tag> : <button className="btn ghost xs" onClick={() => openSheet(<LogScoreSheet bookingId={b.id} />)}><Trophy className="ico xs" /> Log score</button>}
          <button className="btn ghost xs" onClick={() => openSheet(<RateSheet turfId={t.id} />)}><Star className="ico xs" /> Rate</button>
          <button className="btn primary xs" style={{ marginLeft: 'auto' }} onClick={rebook}>Book again</button>
        </> : <>
          {b.refund != null && <span className="xs muted">Refunded {INR(b.refund)}</span>}
          <button className="btn ghost xs" style={{ marginLeft: 'auto' }} onClick={rebook}>Book again</button>
        </>}
      </div>
    </div>
  )
}

export function MatchCard({ m, compact }: { m: OpenMatch; compact?: boolean }) {
  const s = useStore(); const u = useUser()!; const t = s.turfs.find(x => x.id === m.turfId); const host = s.users.find(x => x.id === m.hostId)
  if (!t) return null
  const joined = m.players.includes(u.id); const full = m.players.length >= m.needed; const isHost = m.hostId === u.id
  const share = async () => { const r = await shareText(`${sportLabel(m.sport)} at ${t.name}, ${relDay(m.date)} ${hourLabel(m.hour)} — ${m.needed - m.players.length} spots left, ${INR(m.fee)}/player. Join on TurfHub!`); if (r === 'copied') toast('Invite copied to clipboard') }
  return (
    <div className="card" style={compact ? { width: 270, flexShrink: 0 } : undefined}>
      <div className="row between"><span className="row" style={{ gap: 6 }}><Tag>{sportLabel(m.sport)}</Tag><Tag tone={m.level === 'Advanced' ? 'red' : m.level === 'Intermediate' ? 'amber' : 'blue'}>{m.level}</Tag></span><span className="xs muted">{relDay(m.date)} · {hourLabel(m.hour)}</span></div>
      <div className="h3" style={{ marginTop: 10 }}>{t.name}</div>
      <div className="meta"><MapPin className="ico xs" />{t.area} · {m.duration}h · {INR(m.fee)}/player</div>
      {m.note && !compact && <p className="small muted" style={{ marginTop: 8 }}>“{m.note}”</p>}
      <div className="row between" style={{ marginTop: 12 }}>
        <div className="avatars">{m.players.slice(0, 5).map(id => <Avatar key={id} user={s.users.find(x => x.id === id)} size="sm" />)}{m.players.length > 5 && <span className="avatar sm" style={{ background: 'var(--surface-3)', color: 'var(--text)' }}>+{m.players.length - 5}</span>}</div>
        <div className="xs muted">{m.players.length}/{m.needed} in · host {first(host?.name) || '—'}</div>
      </div>
      <Bar pct={(m.players.length / m.needed) * 100} color={full ? 'var(--amber)' : undefined} style={{ marginTop: 10, height: 5 }} />
      <div className="row" style={{ marginTop: 12, gap: 8 }}>
        {isHost ? <><Tag tone="amber">You're hosting</Tag><button className="btn ghost xs" style={{ marginLeft: 'auto' }} onClick={share}><Share2 className="ico xs" /> Invite</button><button className="btn danger xs" onClick={() => { if (!confirm('Cancel this match for everyone?')) return; m.players.filter(id => id !== u.id).forEach(id => s.notify(id, 'match', 'Match cancelled by host', `${t.name} · ${relDay(m.date)} ${hourLabel(m.hour)}`)); s.cancelMatch(m.id); toast('Match cancelled') }}>Cancel</button></>
          : joined ? <><Tag>You're in ✓</Tag><button className="btn ghost xs" style={{ marginLeft: 'auto' }} onClick={share}><Share2 className="ico xs" /> Invite</button><button className="btn ghost xs" onClick={() => { s.leaveMatch(m.id, u.id); toast('You left the match') }}>Leave</button></>
            : full ? <Tag tone="grey">Full</Tag>
              : <button className="btn primary sm block" onClick={() => { s.joinMatch(m.id, u.id); s.notify(m.hostId, 'match', `${u.name} joined your match`, `${t.name} · now ${m.players.length + 1}/${m.needed}`); toast(`You're in! ${INR(m.fee)} due to the host 🤝`) }}>Join · {INR(m.fee)}</button>}
      </div>
    </div>
  )
}

export function TurfMini({ turf }: { turf: Turf }) {
  return <Link className="turf-mini" to={`/turf/${turf.id}`}><div className="thumb"><TurfArt turf={turf} /></div><div style={{ flex: 1, minWidth: 0 }}><strong className="small">{turf.name}</strong><div className="xs muted">{sportLabel(turf.sport)} · {turf.area} · {INR(turf.price)}/hr{turf.offer ? ` · ${turf.offer.label}` : ''}</div></div></Link>
}
export const slotText = (h: number) => hourShort(h)
