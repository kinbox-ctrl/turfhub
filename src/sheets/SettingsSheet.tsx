import { useNavigate } from 'react-router-dom'
import { LogOut, Moon, RefreshCw, Sun, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import type { Accent } from '@/types'
import { useStore, useUI, useUser, toast } from '@/store'
import { SheetHead } from '@/components/ui'

export const ACCENTS: Record<Accent, [string, string, string]> = { green: ['#c9ff2f', '#a6db12', '201,255,47'], blue: ['#5cc8ff', '#2ea9ea', '92,200,255'], amber: ['#ffb547', '#f59e0b', '255,181,71'], violet: ['#b18cff', '#8b5cf6', '177,140,255'] }

export function SettingsSheet() {
  const u = useUser(); const st = useStore(s => s.settings); const { setAccent, toggleSetting, setTheme, signIn, signOut, reset } = useStore()
  const close = useUI(s => s.closeSheet); const nav = useNavigate()
  if (!u) return null
  return (
    <>
      <SheetHead title="Settings" sub="Preferences are saved on this device" />
      <div className="label" style={{ marginBottom: 10 }}>Appearance</div>
      <div className="seg" style={{ marginBottom: 18 }}><button className={clsx(st.theme !== 'light' && 'on')} onClick={() => setTheme('dark')}><Moon className="ico sm" /> Dark</button><button className={clsx(st.theme === 'light' && 'on')} onClick={() => setTheme('light')}><Sun className="ico sm" /> Light</button></div>
      <div className="label" style={{ marginBottom: 10 }}>Accent colour</div>
      <div className="row" style={{ gap: 12, marginBottom: 20 }}>
        {(Object.keys(ACCENTS) as Accent[]).map(k => <button key={k} title={k} onClick={() => setAccent(k)} style={{ width: 40, height: 40, borderRadius: '50%', background: ACCENTS[k][0], border: `3px solid ${st.accent === k ? '#fff' : 'transparent'}`, boxShadow: `0 0 0 2px var(--bg),0 0 18px ${ACCENTS[k][0]}66` }} />)}
      </div>
      <div className="card tight stack s8" style={{ marginBottom: 16 }}>
        {([['notifs', 'Push notifications', 'Bookings, matches, offers'], ['reminders', 'Slot reminders', '1 hour before your game']] as const).map(([k, t, d]) => (
          <div key={k} className="row between" style={{ padding: '6px 4px' }}><div><div className="small" style={{ fontWeight: 600 }}>{t}</div><div className="xs muted">{d}</div></div><button className={clsx('toggle', st[k] && 'on')} onClick={() => toggleSetting(k)} aria-label={t} /></div>
        ))}
      </div>
      <div className="label" style={{ marginBottom: 10 }}>Demo tools</div>
      <div className="stack s8">
        <button className="btn ghost block" onClick={() => { signIn(u.role === 'owner' ? 'u1' : 'o1'); close(); nav('/'); toast(`Switched to ${u.role === 'owner' ? 'player' : 'owner'} demo`) }}><RefreshCw className="ico sm" /> Switch to {u.role === 'owner' ? 'player' : 'owner'} demo</button>
        <button className="btn ghost block" onClick={() => { if (!confirm('Reset all demo data? Bookings, turfs and scores go back to the seed.')) return; reset(); close(); nav('/'); toast('Demo data reset') }}><Trash2 className="ico sm" /> Reset demo data</button>
        <button className="btn danger block" onClick={() => { signOut(); close(); nav('/') }}><LogOut className="ico sm" /> Log out</button>
      </div>
      <p className="xs dim" style={{ textAlign: 'center', marginTop: 16 }}>TurfHub · all data lives in this browser · ⌘K to search</p>
    </>
  )
}
