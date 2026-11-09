import { Link } from 'react-router-dom'
import { ChevronRight, LogOut, Mail, MapPin, Medal, Phone, Settings, Shield, Trophy } from 'lucide-react'
import { INR, sportLabel } from '@/lib/format'
import { career, leaderboard, tier } from '@/lib/logic'
import { useStore, useUI, useUser } from '@/store'
import { Avatar, Bar, BellBtn, Label, SectionHead, SettingsBtn, Stat, Tag, Topbar } from '@/components/ui'
import { TurfArt } from '@/components/TurfArt'
import { SettingsSheet } from '@/sheets/SettingsSheet'

export function Profile() {
  const s = useStore(); const u = useUser()!; const open = useUI(x => x.openSheet)
  const c = career(s, u.id); const tr = tier(u.pts); const favs = u.favs.map(id => s.turfs.find(t => t.id === id)).filter(Boolean) as typeof s.turfs; const rank = leaderboard(s).findIndex(x => x.u.id === u.id) + 1
  return (
    <>
      <Topbar title="Profile" actions={<><BellBtn /><SettingsBtn /></>} />
      <div className="card" style={{ textAlign: 'center', padding: '26px 16px', background: 'radial-gradient(80% 60% at 50% 0%,var(--accent-soft),transparent),var(--surface)' }}>
        <Avatar user={u} size="lg" /><div className="h2" style={{ marginTop: 12, textTransform: 'none' }}>{u.name}</div>
        <div className="row" style={{ justifyContent: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}><Tag>Player</Tag><Tag tone="grey">Level {c.level}</Tag>{rank > 0 && <Tag tone="amber">#{rank} overall</Tag>}</div>
        <div className="small muted" style={{ marginTop: 8 }}>{u.email}</div>
      </div>
      <div className="wide-grid">
        <section className="section"><SectionHead label="My stats" right={<Link className="link" to="/career">Full career <ChevronRight className="ico xs" /></Link>} />
          {c.m ? <div className="grid3"><Stat v={c.rating} k="Rating" center accent /><Stat v={c.m} k="Matches" center accent /><Stat v={`${c.winRate}%`} k="Win rate" center accent /></div> : <div className="card small muted">Play a match and log your score to build your stats.</div>}
        </section>
        <section className="section"><SectionHead label="Loyalty rewards" right={<Link className="link" to="/leaderboard"><Trophy className="ico xs" /> Leaderboard</Link>} />
          <div className="card">
            <div className="row between" style={{ alignItems: 'flex-start' }}><div><span className="num" style={{ fontSize: 40, color: 'var(--accent)', lineHeight: 1 }}>{u.pts}</span> <span className="muted">pts</span><div className="xs muted" style={{ marginTop: 4 }}>1 pt = ₹1 off · earn 5% back on every booking</div></div><span className="tier" style={{ color: tr.color, borderColor: tr.color + '66', background: tr.color + '1a' }}><Medal className="ico sm" />{tr.name}</span></div>
            {tr.next ? <><Bar pct={((u.pts - tr.min) / (tr.next - tr.min)) * 100} style={{ marginTop: 14 }} /><div className="xs muted" style={{ marginTop: 6 }}>{tr.next - u.pts} pts to {tier(tr.next).name}</div></> : <div className="xs accent" style={{ marginTop: 10 }}>Top tier unlocked 🏆</div>}
          </div>
        </section>
        {favs.length > 0 && <section className="section"><Label style={{ marginBottom: 10 }}>Favourite turfs</Label><div className="stack s8">{favs.map(t => <Link key={t.id} className="list-item" to={`/turf/${t.id}`}><div className="thumb"><TurfArt turf={t} /></div><div style={{ flex: 1, minWidth: 0 }}><strong className="small">{t.name}</strong><div className="xs muted">{sportLabel(t.sport)} · {t.area} · from {INR(t.price)}/hr</div></div><ChevronRight className="ico sm" /></Link>)}</div></section>}
        <section className="section"><Label style={{ marginBottom: 10 }}>Account</Label><div className="card tight stack s8">
          <div className="row" style={{ padding: '6px 4px' }}><Mail className="ico sm" /><span className="small">{u.email}</span></div>
          <div className="row" style={{ padding: '6px 4px' }}><Phone className="ico sm" /><span className="small">{u.phone}</span></div>
          <div className="row" style={{ padding: '6px 4px' }}><MapPin className="ico sm" /><span className="small">{u.city}</span></div>
          <div className="row" style={{ padding: '6px 4px' }}><Shield className="ico sm" /><span className="small">Role: player · {c.bookings.length} bookings · {INR(c.spend)} lifetime</span></div>
        </div></section>
      </div>
      <div className="grid2" style={{ marginTop: 20 }}><button className="btn ghost" onClick={() => open(<SettingsSheet />)}><Settings className="ico sm" /> Settings</button><button className="btn danger" onClick={() => s.signOut()}><LogOut className="ico sm" /> Log out</button></div>
    </>
  )
}
