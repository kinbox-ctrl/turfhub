import { useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import confetti from 'canvas-confetti'
import { Calendar, Check, MapPin, Share2 } from 'lucide-react'
import type { Booking } from '@/types'
import { INR, dateLabel, download, hourLabel, icsFor, shareText, sportLabel, relDay, rangeLabel } from '@/lib/format'
import { useStore, useUI, toast } from '@/store'
import { SheetHead, StatusTag, Tag } from '@/components/ui'

export function TicketSheet({ booking: b, fresh }: { booking: Booking; fresh?: boolean }) {
  const t = useStore(s => s.turfs.find(x => x.id === b.turfId)); const close = useUI(s => s.closeSheet)
  useEffect(() => { if (fresh) confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 }, colors: ['#3dff8a', '#ffffff', '#ffb547'] }) }, [fresh])
  if (!t) return null
  const ics = () => { download(`turfhub-${b.code}.ics`, icsFor(b, `${sportLabel(t.sport)} at ${t.name}`, `${t.area}, ${t.city}`), 'text/calendar'); toast('Calendar event downloaded') }
  const share = async () => { const r = await shareText(`I've booked ${t.name} (${sportLabel(t.sport)}) on ${relDay(b.date)} ${rangeLabel(b.hour, b.duration)}. Join me! 🏟️`); if (r === 'copied') toast('Copied to clipboard') }
  return (
    <>
      {fresh ? <><div className="success-ring"><Check className="ico" /></div><div className="h2" style={{ textAlign: 'center' }}>You're booked!</div><p className="small muted" style={{ textAlign: 'center', margin: '4px 0 18px' }}>Show this code at the venue. {b.method === 'Venue' ? 'Pay at the counter.' : 'Payment received.'}</p></> : <SheetHead title="Your ticket" sub={t.name} />}
      <div className="ticket">
        <div className="tk-top">
          <div className="row between"><Tag>{sportLabel(t.sport)}</Tag><StatusTag status={b.status} /></div>
          <div className="h2" style={{ marginTop: 10 }}>{t.name}</div>
          <div className="meta" style={{ marginTop: 4 }}><MapPin className="ico sm" />{t.area}, {t.city}</div>
          <div className="grid3" style={{ marginTop: 14 }}><div><div className="xs muted">Date</div><strong className="small">{dateLabel(b.date)}</strong></div><div><div className="xs muted">Time</div><strong className="small">{hourLabel(b.hour)}</strong></div><div><div className="xs muted">Duration</div><strong className="small">{b.duration}h</strong></div></div>
          {b.addons.length > 0 && <div className="xs muted" style={{ marginTop: 10 }}>Add-ons: {b.addons.join(', ')}</div>}
        </div>
        <div className="tk-cut" />
        <div className="tk-bot">
          <div className="qr"><QRCodeSVG value={`turfhub://checkin/${b.code}`} size={84} level="M" bgColor="#ffffff" fgColor="#000000" /></div>
          <div style={{ flex: 1 }}><div className="xs muted">Check-in code</div><div className="num" style={{ fontSize: 30, letterSpacing: '.14em' }}>{b.code}</div><div className="xs muted" style={{ marginTop: 6 }}>{INR(b.amount)} · {b.method} · {b.userName}</div></div>
        </div>
      </div>
      <div className="grid2" style={{ marginTop: 14 }}><button className="btn ghost sm" onClick={ics}><Calendar className="ico sm" /> Add to calendar</button><button className="btn ghost sm" onClick={share}><Share2 className="ico sm" /> Share</button></div>
      <button className="btn primary block" style={{ marginTop: 10 }} onClick={close}>Done</button>
    </>
  )
}
