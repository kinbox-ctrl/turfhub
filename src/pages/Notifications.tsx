import { Bell, Calendar, Users, Tag, Gift, Sparkles, Wallet, Ban, Star, type LucideIcon } from 'lucide-react'
import type { NotifType } from '@/types'
import { timeAgo } from '@/lib/format'
import { useStore, useUser } from '@/store'
import { Empty, Topbar } from '@/components/ui'

const ICONS: Record<NotifType, LucideIcon> = { booking: Calendar, match: Users, offer: Tag, points: Gift, insight: Sparkles, payout: Wallet, cancel: Ban, review: Star }

export function Notifications() {
  const s = useStore(); const u = useUser()!; const list = s.notifs.filter(n => n.for === u.id)
  return (
    <>
      <Topbar title="Notifications" back actions={list.some(n => !n.read) ? <button className="btn ghost sm" onClick={() => s.markRead()}>Mark all read</button> : undefined} />
      <div className="stack s8">{list.length ? list.map(n => { const Ico = ICONS[n.type] ?? Bell; return (
        <button key={n.id} className="list-item" style={{ textAlign: 'left', opacity: n.read ? 0.6 : 1, borderColor: n.read ? undefined : 'var(--line-2)' }} onClick={() => s.markRead(n.id)}>
          <div style={{ width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'var(--accent-soft)', color: 'var(--accent)', flexShrink: 0 }}><Ico className="ico" /></div>
          <div style={{ flex: 1, minWidth: 0 }}><div className="row between"><strong className="small">{n.title}</strong><span className="xs dim">{timeAgo(n.at)}</span></div><div className="small muted ellipsis">{n.body}</div></div>
          {!n.read && <span className="live-dot" style={{ background: 'var(--accent)', animation: 'none' }} />}
        </button>
      ) }) : <Empty icon={Bell} title="You're all caught up" sub="New bookings, matches and offers will land here." />}</div>
    </>
  )
}
