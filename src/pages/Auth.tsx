import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BarChart3, LayoutGrid, User, Zap } from 'lucide-react'
import type { Role } from '@/types'
import { first } from '@/lib/format'
import { useStore, useUI, toast } from '@/store'
import { Avatar, Seg, Tag } from '@/components/ui'
import { TurfArt } from '@/components/TurfArt'
import { SignupSheet } from '@/sheets/SignupSheet'

export function Auth() {
  const { users, turfs, bookings, signIn } = useStore(); const role = useUI(s => s.authRole); const setRole = useUI(s => s.setAuthRole); const open = useUI(s => s.openSheet)
  const [email, setEmail] = useState(''); const [pass, setPass] = useState('demo1234')
  const demo = (r: Role) => { const u = users.find(x => x.id === (r === 'owner' ? 'o1' : 'u1'))!; signIn(u.id); toast(`Welcome back, ${first(u.name)} 👋`) }
  const login = (e: React.FormEvent) => { e.preventDefault(); const em = (email || (role === 'player' ? 'player@turfhub.app' : 'owner@turfhub.app')).trim().toLowerCase(); const u = users.find(x => x.email.toLowerCase() === em && x.role === role); if (!u) return toast(`No ${role} account for ${em}. Try the demo buttons.`, 'err'); signIn(u.id); toast(`Welcome back, ${first(u.name)} 👋`) }
  const quoteUser = users.find(u => u.id === (role === 'owner' ? 'o1' : 'u1'))!
  return (
    <div className="auth">
      <aside className="auth-side">
        <div style={{ position: 'absolute', inset: 0, opacity: .55 }}><TurfArt turf={turfs[role === 'owner' ? 0 : 5] ?? turfs[0]} /></div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(10,13,20,.3),rgba(10,13,20,.95))' }} />
        <Link className="brand" to="/" style={{ position: 'relative' }}><span className="brand-mark"><Zap className="ico" /></span>Turf<span style={{ color: 'var(--accent)' }}>Hub</span></Link>
        <div style={{ position: 'relative' }}>
          <Tag tone="solid">{role === 'owner' ? 'Owner console' : 'Player app'}</Tag>
          <p className="quote" style={{ marginTop: 18 }}>{role === 'owner' ? '“We stopped taking WhatsApp bookings. The calendar and no-show tracking alone saved us hours every week.”' : '“Booked a 7 PM slot while walking out of office. Scanned in, played, logged a 3–1.”'}</p>
          <div className="row" style={{ marginTop: 18, gap: 10 }}><Avatar user={quoteUser} /><div><div className="small" style={{ fontWeight: 700 }}>{quoteUser.name}</div><div className="xs muted">{quoteUser.business ?? `Player · ${quoteUser.city}`}</div></div></div>
          <div className="row" style={{ marginTop: 36, gap: 24 }}>{[[turfs.length, 'venues'], [bookings.length.toLocaleString('en-IN'), 'bookings'], ['0%', 'convenience fee']].map(([v, k]) => <div key={k}><div className="num" style={{ fontSize: 26, color: 'var(--accent)' }}>{v}</div><div className="xs muted">{k}</div></div>)}</div>
        </div>
      </aside>
      <div className="auth-form"><div className="auth-card fade-in">
        <Link to="/" className="link muted" style={{ marginBottom: 20 }}><ArrowLeft className="ico xs" /> Back to site</Link>
        <h1 className="auth-title">Welcome back</h1>
        <p className="muted" style={{ marginBottom: 22 }}>Sign in to book, join matches and track your game.</p>
        <Seg value={role} onChange={r => { setRole(r); setEmail('') }} style={{ marginBottom: 16 }} options={[{ v: 'player', label: <><User className="ico sm" /> I'm a player</> }, { v: 'owner', label: <><LayoutGrid className="ico sm" /> I own a turf</> }]} />
        <form className="stack" onSubmit={login}>
          <div className="field"><label>Email</label><input className="input" type="email" autoComplete="username" placeholder={role === 'player' ? 'player@turfhub.app' : 'owner@turfhub.app'} value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div className="field"><label>Password</label><input className="input" type="password" autoComplete="current-password" value={pass} onChange={e => setPass(e.target.value)} /></div>
          <button className="btn primary block" type="submit">Sign in <ArrowRight className="ico sm" /></button>
        </form>
        <div className="grid2" style={{ marginTop: 10 }}><button className="btn ghost" onClick={() => demo('player')}><Zap className="ico sm" /> Demo as player</button><button className="btn ghost" onClick={() => demo('owner')}><BarChart3 className="ico sm" /> Demo as owner</button></div>
        <div className="divider">or</div>
        <button className="btn light block" onClick={() => demo(role)}><svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 2.9-2.2 5.4-4.7 7.1l7.6 5.9c4.4-4.1 6.9-10.1 6.9-17.5z" /><path fill="#FBBC05" d="M10.5 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.8-4.6l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.9-6.1z" /><path fill="#34A853" d="M24 48c6.3 0 11.7-2.1 15.6-5.7l-7.6-5.9c-2.1 1.4-4.8 2.3-8 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" /></svg>Continue with Google as {role}</button>
        <p className="small muted" style={{ textAlign: 'center', marginTop: 18 }}>New here? <button className="link" onClick={() => open(<SignupSheet />)}>Create an account</button></p>
      </div></div>
    </div>
  )
}
