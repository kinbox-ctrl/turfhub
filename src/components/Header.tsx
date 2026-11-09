import { Link, NavLink, useLocation } from 'react-router-dom'
import { Bell, Moon, Search, Sun, Zap } from 'lucide-react'
import clsx from 'clsx'
import { useStore, useUI, useUser } from '@/store'
import { useNavItems } from '@/components/Nav'
import { Avatar } from '@/components/ui'
import { SettingsSheet } from '@/sheets/SettingsSheet'
import { first } from '@/lib/format'

export function Header() {
  const u = useUser(); const items = useNavItems(); const { pathname } = useLocation()
  const unread = useStore(s => s.notifs.filter(n => n.for === u?.id && !n.read).length)
  const theme = useStore(s => s.settings.theme); const setTheme = useStore(s => s.setTheme)
  const open = useUI(s => s.openSheet); const setPalette = useUI(s => s.setPalette)
  const isMac = /Mac|iPhone/.test(navigator.platform)
  return (
    <header className="hdr"><div className="hdr-inner">
      <Link className="brand" to="/"><span className="brand-mark"><Zap className="ico" /></span>Turf<span style={{ color: 'var(--accent)' }}>Hub</span></Link>
      <nav className="hdr-nav">{items.map(i => <NavLink key={i.to} to={i.to} className={({ isActive }) => clsx('hdr-link', (isActive || i.match?.some(m => pathname.startsWith(m))) && 'active')}><i.icon className="ico sm" />{i.label}</NavLink>)}</nav>
      <div className="hdr-right">
        <button className="hdr-search" onClick={() => setPalette(true)}><Search className="ico sm" />Search turfs, pages…<span className="kbd">{isMac ? '⌘' : 'Ctrl'} K</span></button>
        <button className="icon-btn" style={{ width: 40, height: 40 }} title="Toggle theme" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Moon className="ico sm" /> : <Sun className="ico sm" />}</button>
        <Link className="icon-btn" style={{ width: 40, height: 40 }} to="/notifications" title="Notifications"><Bell className="ico sm" />{unread > 0 && <span className="dot" />}</Link>
        <button className="avatar-btn" onClick={() => open(<SettingsSheet />)}><Avatar user={u} size="sm" />{first(u?.name)}</button>
      </div>
    </div></header>
  )
}
