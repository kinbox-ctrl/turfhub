import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, MapPin, Moon, Sparkles, Sun, Trophy, type LucideIcon } from 'lucide-react'
import clsx from 'clsx'
import { useStore, useUI, useUser } from '@/store'
import { useNavItems } from '@/components/Nav'
import { INR, sportLabel } from '@/lib/format'

interface Item { id: string; group: string; label: string; sub?: string; icon: LucideIcon; run: () => void }

export function CommandPalette() {
  const open = useUI(s => s.palette); const setOpen = useUI(s => s.setPalette)
  const u = useUser(); const s = useStore(); const nav = useNavigate(); const items = useNavItems()
  const [q, setQ] = useState(''); const [idx, setIdx] = useState(0); const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(!useUI.getState().palette) } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [setOpen])
  useEffect(() => { if (open) { setQ(''); setIdx(0); setTimeout(() => inputRef.current?.focus(), 20) } }, [open])
  const all = useMemo<Item[]>(() => {
    if (!u) return []
    const go = (to: string) => () => { nav(to); setOpen(false) }
    const pages: Item[] = items.map(i => ({ id: i.to, group: 'Pages', label: i.label, icon: i.icon, run: go(i.to) }))
    if (u.role === 'player') pages.push({ id: '/leaderboard', group: 'Pages', label: 'Leaderboard', icon: Trophy, run: go('/leaderboard') }, { id: '/assistant', group: 'Pages', label: 'Smart assistant', icon: Sparkles, run: go('/assistant') })
    pages.push({ id: '/notifications', group: 'Pages', label: 'Notifications', icon: Bell, run: go('/notifications') })
    const turfs: Item[] = (u.role === 'owner' ? s.turfs.filter(t => t.ownerId === u.id) : s.turfs.filter(t => t.active)).map(t => ({ id: 't' + t.id, group: 'Turfs', label: t.name, sub: `${sportLabel(t.sport)} · ${t.area} · ${INR(t.price)}/hr`, icon: MapPin, run: u.role === 'owner' ? go('/turfs') : go(`/turf/${t.id}`) }))
    const theme = s.settings.theme
    const actions: Item[] = [
      { id: 'theme', group: 'Actions', label: theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme', icon: theme === 'light' ? Moon : Sun, run: () => { s.setTheme(theme === 'light' ? 'dark' : 'light'); setOpen(false) } },
      { id: 'logout', group: 'Actions', label: 'Log out', icon: LogOut, run: () => { s.signOut(); setOpen(false); nav('/') } },
    ]
    return [...pages, ...turfs, ...actions]
  }, [u, s, items, nav, setOpen])
  const list = useMemo(() => { const ql = q.trim().toLowerCase(); return (ql ? all.filter(i => `${i.label} ${i.sub ?? ''}`.toLowerCase().includes(ql)) : all).slice(0, 14) }, [all, q])
  useEffect(() => setIdx(0), [q])
  if (!open || !u) return null
  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(list.length - 1, i + 1)) } else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(0, i - 1)) } else if (e.key === 'Enter') { list[idx]?.run() } else if (e.key === 'Escape') setOpen(false) }
  let lastGroup = ''
  return (
    <div className="cmdk-scrim" onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false) }}>
      <div className="cmdk" onKeyDown={onKey}>
        <input ref={inputRef} placeholder="Search turfs, pages, actions…" value={q} onChange={e => setQ(e.target.value)} />
        <div className="cmdk-list">{list.length ? list.map((it, i) => { const g = it.group !== lastGroup ? it.group : ''; lastGroup = it.group; return (
          <div key={it.id}>{g && <div className="cmdk-group">{g}</div>}<button className={clsx('cmdk-item', i === idx && 'on')} onMouseEnter={() => setIdx(i)} onClick={it.run}><it.icon className="ico sm" />{it.label}{it.sub && <span className="sub">{it.sub}</span>}</button></div>
        ) }) : <div className="cmdk-group" style={{ padding: 20, textAlign: 'center' }}>No matches</div>}</div>
      </div>
    </div>
  )
}
