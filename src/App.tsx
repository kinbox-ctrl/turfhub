import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useStore, useUI, useUser } from '@/store'
import { Nav } from '@/components/Nav'
import { Header } from '@/components/Header'
import { CommandPalette } from '@/components/CommandPalette'
import { SheetHost, Toasts } from '@/components/ui'
import { ACCENTS } from '@/sheets/SettingsSheet'
import { Landing } from '@/pages/Landing'
import { Auth } from '@/pages/Auth'
import { Discover } from '@/pages/Discover'
import { Explore } from '@/pages/Explore'
import { TurfPage } from '@/pages/Turf'
import { Matches } from '@/pages/Matches'
import { Bookings } from '@/pages/Bookings'
import { Profile } from '@/pages/Profile'
import { Career } from '@/pages/Career'
import { Leaderboard } from '@/pages/Leaderboard'
import { Assistant } from '@/pages/Assistant'
import { Notifications } from '@/pages/Notifications'
import { Dashboard } from '@/pages/owner/Dashboard'
import { OwnerCalendar } from '@/pages/owner/Calendar'
import { OwnerTurfs } from '@/pages/owner/Turfs'
import { OwnerBookings } from '@/pages/owner/Bookings'
import { OwnerProfile } from '@/pages/owner/Profile'

function Shell() {
  const { pathname } = useLocation(); const close = useUI(s => s.closeSheet)
  useEffect(() => { window.scrollTo(0, 0); close() }, [pathname, close])
  return <div className="shell"><Header /><AnimatePresence mode="wait" initial={false}><motion.main className="main" key={pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}><Outlet /></motion.main></AnimatePresence><Nav /><CommandPalette /></div>
}

export default function App() {
  const user = useUser(); const accent = useStore(s => s.settings.accent); const theme = useStore(s => s.settings.theme)
  useEffect(() => { const a = ACCENTS[accent] ?? ACCENTS.green; const r = document.documentElement.style; r.setProperty('--accent', a[0]); r.setProperty('--accent-2', a[1]); r.setProperty('--accent-soft', `rgba(${a[2]},.12)`); r.setProperty('--accent-rgb', a[2]) }, [accent])
  useEffect(() => { document.documentElement.dataset.theme = theme ?? 'dark'; const m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', theme === 'light' ? '#f5f6fa' : '#0a0d14') }, [theme])
  const owner = user?.role === 'owner'
  return (
    <>
      {!user ? (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<Navigate to={owner ? '/dashboard' : '/discover'} replace />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/bookings" element={owner ? <OwnerBookings /> : <Bookings />} />
            <Route path="/profile" element={owner ? <OwnerProfile /> : <Profile />} />
            {owner ? (
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/calendar" element={<OwnerCalendar />} />
                <Route path="/turfs" element={<OwnerTurfs />} />
              </>
            ) : (
              <>
                <Route path="/discover" element={<Discover />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/turf/:id" element={<TurfPage />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/career" element={<Career />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/assistant" element={<Assistant />} />
              </>
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      )}
      <SheetHost />
      <Toasts />
    </>
  )
}
