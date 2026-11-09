import { NavLink, useLocation } from 'react-router-dom'
import { Compass, Users, Calendar, User, BarChart3, LayoutGrid, Map, CalendarDays, type LucideIcon } from 'lucide-react'
import clsx from 'clsx'
import { useUser } from '@/store'

export interface NavItem { to: string; icon: LucideIcon; label: string; match?: string[] }
export const NAV_PLAYER: NavItem[] = [
  { to: '/discover', icon: Compass, label: 'Discover', match: ['/turf', '/leaderboard', '/assistant'] },
  { to: '/explore', icon: Map, label: 'Explore' },
  { to: '/matches', icon: Users, label: 'Matches' },
  { to: '/bookings', icon: Calendar, label: 'Bookings' },
  { to: '/profile', icon: User, label: 'Profile', match: ['/career'] },
]
export const NAV_OWNER: NavItem[] = [
  { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/turfs', icon: LayoutGrid, label: 'Turfs' },
  { to: '/bookings', icon: Calendar, label: 'Bookings' },
  { to: '/profile', icon: User, label: 'Profile' },
]
export const useNavItems = () => { const u = useUser(); return u?.role === 'owner' ? NAV_OWNER : NAV_PLAYER }

export function Nav() {
  const items = useNavItems(); const { pathname } = useLocation()
  return (
    <nav className="nav">
      {items.map(i => (
        <NavLink key={i.to} to={i.to} className={({ isActive }) => clsx('nav-item', (isActive || i.match?.some(m => pathname.startsWith(m))) && 'active')}><i.icon className="ico" /><span>{i.label}</span></NavLink>
      ))}
    </nav>
  )
}
