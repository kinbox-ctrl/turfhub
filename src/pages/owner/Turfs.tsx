import { useNavigate } from 'react-router-dom'
import { Ban, Calendar, Edit3, MapPin, Plus, Star, Tag as TagIcon } from 'lucide-react'
import clsx from 'clsx'
import { INR, hourLabel, sportLabel, todayKey } from '@/lib/format'
import { slotsLeft } from '@/lib/logic'
import { useStore, useUI, useUser, openSheet, toast } from '@/store'
import { Empty, Stat, Tag, Topbar } from '@/components/ui'
import { TurfArt } from '@/components/TurfArt'
import { BlockSheet, OfferSheet, TurfEditorSheet } from '@/sheets/OwnerSheets'

export function OwnerTurfs() {
  const s = useStore(); const u = useUser()!; const nav = useNavigate(); const setFilter = useUI(x => x.setBookingsFilter)
  const myT = s.turfs.filter(t => t.ownerId === u.id); const mk = todayKey().slice(0, 7)
  return (
    <>
      <Topbar eyebrow={`${myT.length} venues · ${myT.filter(t => t.active).length} live`} title="My turfs" actions={<button className="btn primary sm" onClick={() => openSheet(<TurfEditorSheet />)}><Plus className="ico sm" /> New</button>} />
      <div className="turf-grid">{myT.length ? myT.map(t => {
        const bs = s.bookings.filter(b => b.turfId === t.id && b.date.startsWith(mk) && b.status !== 'cancelled'); const rev = bs.filter(b => b.status !== 'no-show').reduce((a, b) => a + b.amount, 0); const left = slotsLeft(s, t, todayKey())
        return (
          <article key={t.id} className="turf-card" style={{ cursor: 'default', transform: 'none' }}>
            <div className="turf-art" style={{ aspectRatio: '16/7' }}><TurfArt turf={t} />
              <div className="over"><div className="row between" style={{ alignItems: 'flex-start' }}><Tag tone={t.active ? 'solid' : 'grey'}>{t.active ? 'Live' : 'Paused'}</Tag><button className={clsx('toggle', t.active && 'on')} title="Pause / resume" onClick={() => { s.upsertTurf({ ...t, active: !t.active }); toast(t.active ? `${t.name} paused — hidden from players` : `${t.name} is live`) }} /></div>
                <div><div className="row" style={{ gap: 8, marginBottom: 4 }}><Tag>{sportLabel(t.sport)}</Tag><span className="rating"><Star className="ico xs" />{t.reviews ? t.rating : 'New'}</span></div><div className="h3">{t.name}</div></div></div>
            </div>
            <div className="turf-body">
              <div className="row between"><div className="meta"><MapPin className="ico sm" />{t.area}, {t.city}</div><div className="price">{INR(t.price)}<small>/hr</small></div></div>
              <div className="row between xs" style={{ marginTop: 6 }}><span className={clsx('row', t.offer ? 'amber' : 'dim')} style={{ gap: 4 }}><TagIcon className="ico xs" /> {t.offer ? t.offer.label : 'No active offer'}</span><span className="muted">Peak +{t.peakPct}% from {hourLabel(t.peakFrom)}</span></div>
              <div className="grid3" style={{ marginTop: 12 }}><Stat v={bs.length} k="This month" center accent style={{ padding: 10 }} /><Stat v={INR(rev)} k="Revenue" center accent style={{ padding: 10 }} /><Stat v={left} k="Free today" center accent style={{ padding: 10 }} /></div>
              <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <button className="btn ghost xs" onClick={() => openSheet(<TurfEditorSheet turf={t} />)}><Edit3 className="ico xs" /> Edit</button>
                <button className="btn ghost xs" onClick={() => openSheet(<OfferSheet turf={t} />)}><TagIcon className="ico xs" /> Offer</button>
                <button className="btn ghost xs" onClick={() => openSheet(<BlockSheet turf={t} />)}><Ban className="ico xs" /> Block slots</button>
                <button className="btn ghost xs" style={{ marginLeft: 'auto' }} onClick={() => { setFilter({ turf: t.id }); nav('/bookings') }}><Calendar className="ico xs" /> Bookings</button>
              </div>
            </div>
          </article>
        )
      }) : <Empty icon={Plus} title="No turfs yet" sub="Publish your first venue and start taking bookings." cta={<button className="btn primary sm" onClick={() => openSheet(<TurfEditorSheet />)}>Add a turf</button>} />}</div>
    </>
  )
}
