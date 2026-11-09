import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { INR, byTimeAsc, byTimeDesc } from '@/lib/format'
import { isUpcoming } from '@/lib/logic'
import { useStore, useUser } from '@/store'
import { BellBtn, Empty, Seg, Topbar } from '@/components/ui'
import { BookingCard } from '@/components/cards'

type Tab = 'upcoming' | 'past' | 'cancelled'
export function Bookings() {
  const s = useStore(); const u = useUser()!; const [tab, setTab] = useState<Tab>('upcoming')
  const all = s.bookings.filter(b => b.userId === u.id)
  const lists: Record<Tab, typeof all> = { upcoming: all.filter(isUpcoming).sort(byTimeAsc), past: all.filter(b => !isUpcoming(b) && b.status !== 'cancelled').sort(byTimeDesc), cancelled: all.filter(b => b.status === 'cancelled').sort(byTimeDesc) }
  const spent = all.filter(b => b.status === 'completed').reduce((a, b) => a + b.amount, 0)
  return (
    <>
      <Topbar eyebrow={`${all.length} bookings · ${INR(spent)} spent`} title="My bookings" actions={<BellBtn />} />
      <Seg value={tab} onChange={setTab} options={(['upcoming', 'past', 'cancelled'] as Tab[]).map(k => ({ v: k, label: <>{k[0].toUpperCase() + k.slice(1)} <span style={{ opacity: .6 }}>{lists[k].length}</span></> }))} />
      <div className="turf-grid" style={{ marginTop: 16 }}>
        {lists[tab].length ? lists[tab].map(b => <BookingCard key={b.id} b={b} />) : <Empty icon={Calendar} title={tab === 'upcoming' ? 'No upcoming games' : 'Nothing here yet'} sub={tab === 'upcoming' ? 'Grab a slot — your next match is a tap away.' : 'Completed and cancelled bookings will show here.'} cta={tab === 'upcoming' ? <Link className="btn primary sm" to="/discover">Find a turf</Link> : undefined} />}
      </div>
    </>
  )
}
