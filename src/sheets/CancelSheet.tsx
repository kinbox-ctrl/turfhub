import type { Booking } from '@/types'
import { INR, hourLabel, rangeLabel, relDay } from '@/lib/format'
import { refundPct } from '@/lib/logic'
import { useStore, useUI, toast } from '@/store'
import { SheetHead } from '@/components/ui'

export function CancelSheet({ booking: b }: { booking: Booking }) {
  const s = useStore(); const close = useUI(x => x.closeSheet); const t = s.turfs.find(x => x.id === b.turfId)
  if (!t) return null
  const pct = refundPct(b); const refund = Math.round((b.amount * pct) / 100)
  const doCancel = () => {
    s.setBookingStatus(b.id, 'cancelled', refund)
    s.notify(b.userId, 'cancel', 'Booking cancelled', `${t.name} · refund of ${INR(refund)} initiated`)
    s.notify(t.ownerId, 'cancel', `Cancellation: ${b.userName}`, `${t.name} · ${relDay(b.date)} ${rangeLabel(b.hour, b.duration)} is free again`)
    close(); toast(refund ? `Cancelled · ${INR(refund)} refund on its way` : 'Booking cancelled')
  }
  return (
    <>
      <SheetHead title="Cancel booking?" sub={t.name} />
      <div className="card tight" style={{ marginBottom: 14 }}>
        <div className="sum-row"><span className="muted">Slot</span><span>{relDay(b.date)} · {rangeLabel(b.hour, b.duration)}</span></div>
        <div className="sum-row"><span className="muted">{b.method === 'Venue' ? 'Due at venue' : 'Paid'}</span><span>{INR(b.amount)}</span></div>
        <div className="sum-row total"><span>Refund ({pct}%)</span><span className={pct ? 'accent' : 'red'}>{INR(refund)}</span></div>
      </div>
      <p className="small muted" style={{ marginBottom: 16 }}>{pct === 100 ? 'More than 24 hours to go — full refund to your original payment method within 3–5 days.' : pct === 50 ? 'Less than 24 hours to go — 50% refund as per policy.' : `Less than 2 hours to the ${hourLabel(b.hour)} start — this slot is non-refundable.`}</p>
      <div className="grid2"><button className="btn ghost" onClick={close}>Keep booking</button><button className="btn danger" onClick={doCancel}>Cancel booking</button></div>
    </>
  )
}
