import { Link } from 'react-router-dom'
import { Bell, Building2, LogOut, Mail, MapPin, Phone, Settings, Star } from 'lucide-react'
import { INR, todayKey } from '@/lib/format'
import { useStore, useUI, useUser } from '@/store'
import { Avatar, BellBtn, Label, SettingsBtn, Stat, Tag, Topbar } from '@/components/ui'
import { SettingsSheet } from '@/sheets/SettingsSheet'

export function OwnerProfile() {
  const s = useStore(); const u = useUser()!; const open = useUI(x => x.openSheet)
  const myT = s.turfs.filter(t => t.ownerId === u.id); const ids = new Set(myT.map(t => t.id)); const all = s.bookings.filter(b => ids.has(b.turfId)); const mk = todayKey().slice(0, 7)
  const paid = all.filter(b => b.status === 'completed' || b.status === 'confirmed')
  const monthRev = paid.filter(b => b.date.startsWith(mk)).reduce((a, b) => a + b.amount, 0); const pending = all.filter(b => b.status === 'confirmed' && b.date >= todayKey() && b.method !== 'Venue').reduce((a, b) => a + b.amount, 0); const lifetime = paid.reduce((a, b) => a + b.amount, 0)
  const avgRating = myT.length ? (myT.reduce((a, t) => a + t.rating, 0) / myT.length).toFixed(1) : '—'; const reviews = s.reviews.filter(r => ids.has(r.turfId)).length
  return (
    <>
      <Topbar title="Profile" actions={<><BellBtn /><SettingsBtn /></>} />
      <div className="card" style={{ textAlign: 'center', padding: '26px 16px', background: 'radial-gradient(80% 60% at 50% 0%,var(--accent-soft),transparent),var(--surface)' }}>
        <Avatar user={u} size="lg" /><div className="h2" style={{ marginTop: 12, textTransform: 'none' }}>{u.name}</div>
        <div className="row" style={{ justifyContent: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}><Tag tone="amber">Owner</Tag><Tag tone="grey">{myT.length} turfs</Tag><Tag>★ {avgRating} avg · {reviews} reviews</Tag></div>
        <div className="small muted" style={{ marginTop: 8 }}>{u.business}</div>
      </div>
      <div className="wide-grid">
        <section className="section"><Label style={{ marginBottom: 10 }}>Payouts</Label>
          <div className="card">
            <div className="row between" style={{ alignItems: 'flex-start' }}><div><div className="xs muted">This month</div><div className="num" style={{ fontSize: 34, color: 'var(--accent)', lineHeight: 1.1 }}>{INR(monthRev)}</div></div><div style={{ textAlign: 'right' }}><div className="xs muted">Upcoming (prepaid)</div><div className="num" style={{ fontSize: 22 }}>{INR(pending)}</div></div></div>
            <div className="hr" />
            <div className="row between small"><span className="muted">Lifetime revenue</span><strong>{INR(lifetime)}</strong></div>
            <div className="row between small" style={{ marginTop: 6 }}><span className="muted">Next payout</span><strong>Tuesday · HDFC ••4821</strong></div>
            <div className="row between small" style={{ marginTop: 6 }}><span className="muted">Platform fee</span><strong className="accent">0% — early partner</strong></div>
          </div>
        </section>
        <section className="section"><Label style={{ marginBottom: 10 }}>Quick stats</Label><div className="grid3"><Stat v={all.filter(b => b.status !== 'cancelled').length} k="Bookings" center accent /><Stat v={new Set(all.map(b => b.userId)).size} k="Players" center accent /><Stat v={`${Math.round((all.filter(b => b.status === 'cancelled').length / Math.max(1, all.length)) * 100)}%`} k="Cancel rate" center accent /></div></section>
        <section className="section"><Label style={{ marginBottom: 10 }}>Business</Label><div className="card tight stack s8">
          <div className="row" style={{ padding: '6px 4px' }}><Building2 className="ico sm" /><span className="small">{u.business ?? '—'} · GST 29ABCDE1234F1Z5</span></div>
          <div className="row" style={{ padding: '6px 4px' }}><Mail className="ico sm" /><span className="small">{u.email}</span></div>
          <div className="row" style={{ padding: '6px 4px' }}><Phone className="ico sm" /><span className="small">{u.phone}</span></div>
          <div className="row" style={{ padding: '6px 4px' }}><MapPin className="ico sm" /><span className="small">{u.city}</span></div>
          <div className="row" style={{ padding: '6px 4px' }}><Star className="ico sm" /><span className="small">Verified partner since 2024</span></div>
        </div></section>
        <section className="section"><Label style={{ marginBottom: 10 }}>Shortcuts</Label><div className="stack s8"><Link className="quick" to="/notifications"><span className="q-ico blue"><Bell className="ico" /></span><div style={{ flex: 1 }}><div className="h3">Notifications</div><div className="xs muted">New bookings, cancellations, reviews</div></div></Link><button className="quick" onClick={() => open(<SettingsSheet />)}><span className="q-ico"><Settings className="ico" /></span><div style={{ flex: 1 }}><div className="h3">Settings</div><div className="xs muted">Accent, alerts, demo tools</div></div></button></div></section>
      </div>
      <div className="grid2" style={{ marginTop: 20 }}><button className="btn ghost" onClick={() => open(<SettingsSheet />)}><Settings className="ico sm" /> Settings</button><button className="btn danger" onClick={() => s.signOut()}><LogOut className="ico sm" /> Log out</button></div>
    </>
  )
}
