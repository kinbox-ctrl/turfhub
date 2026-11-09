import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ReactNode } from 'react'
import type { Accent, Booking, BookingStatus, DataState, MatchResult, NotifType, Offer, OpenMatch, Review, Turf, User } from '@/types'
import { seed } from '@/data/seed'
import { uid } from '@/lib/format'

const DATA_KEYS: (keyof DataState)[] = ['users', 'turfs', 'bookings', 'results', 'matches', 'reviews', 'notifs', 'live', 'settings']

interface Store extends DataState {
  session: string | null
  version: number
  mutate: (fn: (d: DataState) => void) => void
  signIn: (id: string) => void
  signOut: () => void
  signUp: (u: User) => void
  toggleFav: (turfId: string) => void
  notify: (forId: string, type: NotifType, title: string, body: string) => void
  markRead: (id?: string) => void
  setAccent: (a: Accent) => void
  toggleSetting: (k: 'notifs' | 'reminders') => void
  setTheme: (t: 'dark' | 'light') => void
  addBooking: (b: Booking, ptsDelta: number) => void
  setBookingStatus: (id: string, status: BookingStatus, refund?: number) => void
  addReview: (r: Review) => void
  addResult: (r: MatchResult) => void
  joinMatch: (id: string, userId: string) => void
  leaveMatch: (id: string, userId: string) => void
  hostMatch: (m: OpenMatch) => void
  cancelMatch: (id: string) => void
  upsertTurf: (t: Turf) => void
  deleteTurf: (id: string) => void
  setOffer: (id: string, offer: Offer | null) => void
  setBlocked: (id: string, date: string, hours: number[]) => void
  tickLive: () => void
  reset: () => void
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...seed(),
      session: null,
      version: 1,
      mutate: fn => set(s => { const d = structuredClone(Object.fromEntries(DATA_KEYS.map(k => [k, s[k]])) as unknown as DataState); fn(d); return d }),
      signIn: id => set({ session: id }),
      signOut: () => set({ session: null }),
      signUp: u => { get().mutate(d => { d.users.push(u) }); set({ session: u.id }) },
      toggleFav: turfId => get().mutate(d => { const u = d.users.find(x => x.id === get().session); if (!u) return; const i = u.favs.indexOf(turfId); i >= 0 ? u.favs.splice(i, 1) : u.favs.push(turfId) }),
      notify: (forId, type, title, body) => get().mutate(d => { d.notifs.unshift({ id: uid('n'), for: forId, type, title, body, at: new Date().toISOString(), read: false }) }),
      markRead: id => get().mutate(d => { d.notifs.forEach(n => { if ((id ? n.id === id : n.for === get().session)) n.read = true }) }),
      setAccent: accent => get().mutate(d => { d.settings.accent = accent }),
      toggleSetting: k => get().mutate(d => { d.settings[k] = !d.settings[k] }),
      setTheme: theme => get().mutate(d => { d.settings.theme = theme }),
      addBooking: (b, ptsDelta) => get().mutate(d => { d.bookings.push(b); const u = d.users.find(x => x.id === b.userId); if (u) u.pts = Math.max(0, u.pts + ptsDelta) }),
      setBookingStatus: (id, status, refund) => get().mutate(d => { const b = d.bookings.find(x => x.id === id); if (b) { b.status = status; if (refund != null) b.refund = refund } }),
      addReview: r => get().mutate(d => { d.reviews.unshift(r); const t = d.turfs.find(x => x.id === r.turfId); if (t) { t.rating = Math.round(((t.rating * t.reviews + r.stars) / (t.reviews + 1)) * 10) / 10; t.reviews++ } const u = d.users.find(x => x.id === r.userId); if (u) u.pts += 20 }),
      addResult: r => get().mutate(d => { d.results.push(r) }),
      joinMatch: (id, userId) => get().mutate(d => { const m = d.matches.find(x => x.id === id); if (m && !m.players.includes(userId) && m.players.length < m.needed) m.players.push(userId) }),
      leaveMatch: (id, userId) => get().mutate(d => { const m = d.matches.find(x => x.id === id); if (m) m.players = m.players.filter(p => p !== userId) }),
      hostMatch: m => get().mutate(d => { d.matches.push(m) }),
      cancelMatch: id => get().mutate(d => { d.matches = d.matches.filter(m => m.id !== id) }),
      upsertTurf: t => get().mutate(d => { const i = d.turfs.findIndex(x => x.id === t.id); i >= 0 ? (d.turfs[i] = t) : d.turfs.push(t) }),
      deleteTurf: id => get().mutate(d => { d.turfs = d.turfs.filter(t => t.id !== id) }),
      setOffer: (id, offer) => get().mutate(d => { const t = d.turfs.find(x => x.id === id); if (t) t.offer = offer }),
      setBlocked: (id, date, hours) => get().mutate(d => { const t = d.turfs.find(x => x.id === id); if (!t) return; t.blocked = t.blocked.filter(k => !k.startsWith(date + '|')); hours.forEach(h => t.blocked.push(`${date}|${h}`)) }),
      tickLive: () => set(s => ({
        live: s.live.map(l => {
          const n = { ...l }
          if (n.sport === 'football') n.info = `${(parseInt(n.info) || 0) + 1}'`
          if (Math.random() > 0.4) return n
          const side: 'sa' | 'sb' = Math.random() < 0.55 ? 'sa' : 'sb'
          if (n.sport === 'cricket' && side === 'sb') return n
          if (n.sport === 'football' && Math.random() < 0.85) return n
          n[side] += n.sport === 'cricket' ? [1, 1, 2, 4, 6][Math.floor(Math.random() * 5)] : 1
          return n
        }),
      })),
      reset: () => set({ ...seed(), session: null }),
    }),
    { name: 'turfhub.v3', version: 3 },
  ),
)

export const useUser = () => useStore(s => (s.session ? s.users.find(u => u.id === s.session) ?? null : null))
export const useTurf = (id?: string) => useStore(s => s.turfs.find(t => t.id === id))
export const userById = (users: User[], id?: string | null) => users.find(u => u.id === id)

/* ---------- transient UI store ---------- */
export interface Toast { id: number; msg: string; type: 'ok' | 'err' }
interface UIStore {
  sheet: ReactNode | null
  openSheet: (n: ReactNode) => void
  closeSheet: () => void
  toasts: Toast[]
  toast: (msg: string, type?: 'ok' | 'err') => void
  dismiss: (id: number) => void
  authRole: 'player' | 'owner'
  setAuthRole: (r: 'player' | 'owner') => void
  chat: Array<{ who: 'bot' | 'me'; text: string; turfs?: string[]; actions?: Array<{ label: string; to: string }> }> | null
  setChat: (c: UIStore['chat']) => void
  bookingsFilter: { turf?: string }
  setBookingsFilter: (f: { turf?: string }) => void
  palette: boolean
  setPalette: (v: boolean) => void
}
let toastId = 0
export const useUI = create<UIStore>()(set => ({
  sheet: null,
  openSheet: n => { document.body.style.overflow = 'hidden'; set({ sheet: n }) },
  closeSheet: () => { document.body.style.overflow = ''; set({ sheet: null }) },
  toasts: [],
  toast: (msg, type = 'ok') => { const id = ++toastId; set(s => ({ toasts: [...s.toasts, { id, msg, type }] })); setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 2800) },
  dismiss: id => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
  authRole: 'player',
  setAuthRole: r => set({ authRole: r }),
  chat: null,
  setChat: chat => set({ chat }),
  bookingsFilter: {},
  setBookingsFilter: bookingsFilter => set({ bookingsFilter }),
  palette: false,
  setPalette: palette => set({ palette }),
}))
export const toast = (msg: string, type: 'ok' | 'err' = 'ok') => useUI.getState().toast(msg, type)
export const openSheet = (n: ReactNode) => useUI.getState().openSheet(n)
export const closeSheet = () => useUI.getState().closeSheet()
