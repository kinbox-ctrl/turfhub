import type { Booking, DataState, MatchResult, Sport, Turf, User } from '@/types'
import { slotPrice } from '@/data/seed'
import { INR, byTimeAsc, sportLabel, todayKey } from '@/lib/format'

type S = Pick<DataState, 'bookings' | 'turfs' | 'users' | 'results' | 'matches' | 'notifs'>

export const bookingsFor = (s: S, turfId: string, date: string) => s.bookings.filter(b => b.turfId === turfId && b.date === date && b.status !== 'cancelled')

export type SlotState = 'blocked' | 'booked' | 'past' | null
export function isTaken(s: S, t: Turf, date: string, hour: number): SlotState {
  if (t.blocked.includes(`${date}|${hour}`)) return 'blocked'
  if (bookingsFor(s, t.id, date).some(b => hour >= b.hour && hour < b.hour + b.duration)) return 'booked'
  const tk = todayKey(); if (date < tk) return 'past'; if (date === tk && hour <= new Date().getHours()) return 'past'
  return null
}
export function canStart(s: S, t: Turf, date: string, hour: number, dur: number) {
  if (hour + dur > t.close) return false
  for (let k = 0; k < dur; k++) if (isTaken(s, t, date, hour + k)) return false
  return true
}
export function price(s: S, t: Turf, date: string, hour: number, userId?: string) {
  const firstTime = !!userId && t.offer?.type === 'first' && !s.bookings.some(b => b.userId === userId && b.turfId === t.id && b.status !== 'cancelled')
  return slotPrice(t, date, hour, firstTime)
}
export function slotsLeft(s: S, t: Turf, date: string) { let n = 0; for (let h = t.open; h < t.close; h++) if (!isTaken(s, t, date, h)) n++; return n }
export const outcome = (r: MatchResult): 'W' | 'L' | 'D' => (r.scoreA > r.scoreB ? 'W' : r.scoreA < r.scoreB ? 'L' : 'D')

export interface Career {
  rs: MatchResult[]; w: number; l: number; d: number; m: number; winRate: number; streak: number; best: number; avg: number; rating: number
  bookings: Booking[]; hours: number; spend: number; xp: number; level: number; levelXp: number; form: Array<'W' | 'L' | 'D'>
}
export function career(s: S, userId: string, sport?: Sport): Career {
  const rs = s.results.filter(r => r.userId === userId && (!sport || r.sport === sport)).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1))
  const w = rs.filter(r => outcome(r) === 'W').length, l = rs.filter(r => outcome(r) === 'L').length, m = rs.length, d = m - w - l
  const winRate = m ? Math.round((w / m) * 100) : 0
  let streak = 0; for (let i = rs.length - 1; i >= 0; i--) { if (outcome(rs[i]) === 'W') streak++; else break }
  const best = m ? Math.max(...rs.map(r => r.scoreA)) : 0; const avg = m ? Math.round(rs.reduce((a, r) => a + r.scoreA, 0) / m) : 0
  const rating = m ? Math.min(99, Math.round(38 + winRate * 0.42 + Math.min(m, 15) * 1.3 + streak * 2.5)) : 0
  const bookings = s.bookings.filter(b => b.userId === userId && b.status !== 'cancelled' && (!sport || b.sport === sport))
  const hours = bookings.reduce((a, b) => a + b.duration, 0); const spend = bookings.filter(b => b.status !== 'no-show').reduce((a, b) => a + b.amount, 0)
  const xp = m * 60 + w * 40 + bookings.length * 25
  return { rs, w, l, d, m, winRate, streak, best, avg, rating, bookings, hours, spend, xp, level: Math.floor(xp / 400) + 1, levelXp: xp % 400, form: rs.slice(-5).map(outcome) }
}
export function leaderboard(s: S, sport?: Sport) {
  return s.users.filter(u => u.role === 'player').map(u => ({ u, c: career(s, u.id, sport) })).filter(x => x.c.m > 0).sort((a, b) => b.c.rating - a.c.rating || b.c.w - a.c.w)
}
export function tier(pts: number) {
  return pts >= 1500 ? { name: 'Gold', color: '#ffd166', next: null as number | null, min: 1500 } : pts >= 500 ? { name: 'Silver', color: '#cbd5e1', next: 1500 as number | null, min: 500 } : { name: 'Bronze', color: '#ffb547', next: 500 as number | null, min: 0 }
}
export type BadgeIcon = 'zap' | 'flame' | 'refresh' | 'sun' | 'moon' | 'target'
export function badges(c: Career) {
  return [
    { id: 'sharp', name: 'Sharpshooter', desc: 'Score 40+ in a match', ico: 'zap' as BadgeIcon, color: '#ffb547', ok: c.best >= 40 },
    { id: 'mara', name: 'Marathoner', desc: '20+ hours played', ico: 'flame' as BadgeIcon, color: '#3dff8a', ok: c.hours >= 20 },
    { id: 'reg', name: 'Regular', desc: '10+ bookings', ico: 'refresh' as BadgeIcon, color: '#5cc8ff', ok: c.bookings.length >= 10 },
    { id: 'fire', name: 'On Fire', desc: '3 wins in a row', ico: 'flame' as BadgeIcon, color: '#ff5d6c', ok: c.streak >= 3 },
    { id: 'early', name: 'Early Bird', desc: '3 bookings before 8 AM', ico: 'sun' as BadgeIcon, color: '#ffd166', ok: c.bookings.filter(b => b.hour < 8).length >= 3 },
    { id: 'night', name: 'Night Owl', desc: '3 bookings after 8 PM', ico: 'moon' as BadgeIcon, color: '#b18cff', ok: c.bookings.filter(b => b.hour >= 20).length >= 3 },
    { id: 'multi', name: 'All-Rounder', desc: 'Play 3 different sports', ico: 'target' as BadgeIcon, color: '#5cc8ff', ok: new Set(c.bookings.map(b => b.sport)).size >= 3 },
  ]
}
export function occupancy(s: S, turfs: Turf[], date: string) {
  let avail = 0, used = 0
  turfs.forEach(t => { avail += t.close - t.open; used += bookingsFor(s, t.id, date).reduce((a, b) => a + b.duration, 0) })
  return avail ? Math.min(100, Math.round((used / avail) * 100)) : 0
}
export function refundPct(b: Booking) { const start = new Date(b.date + 'T00:00:00'); start.setHours(b.hour); const hrs = (start.getTime() - Date.now()) / 36e5; return hrs >= 24 ? 100 : hrs >= 2 ? 50 : 0 }
export const isUpcoming = (b: Booking) => b.status === 'confirmed' && (b.date > todayKey() || (b.date === todayKey() && b.hour + b.duration > new Date().getHours()))

export interface SmartPick { text: string; best?: Turf; next?: Booking; favSport?: Sport; tonight?: { t: Turf; final: number } }
export function smartPick(s: S, u: User): SmartPick {
  const bs = s.bookings.filter(b => b.userId === u.id && b.status !== 'cancelled')
  const count: Partial<Record<Sport, number>> = {}; bs.forEach(b => (count[b.sport] = (count[b.sport] ?? 0) + 1))
  const favSport = (Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] as Sport | undefined)
  const next = bs.filter(isUpcoming).sort(byTimeAsc)[0]
  const visited = new Set(bs.map(b => b.turfId))
  const cands = s.turfs.filter(t => t.active && t.city === u.city)
  const best = cands.filter(t => t.sport === favSport && !visited.has(t.id))[0] ?? cands.filter(t => t.offer && t.offer.pct >= 15).sort((a, b) => b.offer!.pct - a.offer!.pct)[0] ?? [...cands].sort((a, b) => b.rating - a.rating)[0]
  const tk = todayKey()
  const tonightX = cands.map(t => ({ t, final: price(s, t, tk, 20, u.id).final })).filter(x => !isTaken(s, x.t, tk, 20)).sort((a, b) => a.final - b.final)[0]
  let text = bs.length ? `You've booked <b>${bs.length} times</b>${favSport ? ` — ${sportLabel(favSport).toLowerCase()} is clearly your game` : ''}. ` : 'New here? '
  if (best) text += `<b>${best.name}</b> in ${best.area}${best.offer ? ` has ${best.offer.label.toLowerCase()}` : ' is the top-rated pick'}${!visited.has(best.id) ? " and you haven't tried it yet" : ''}.`
  if (tonightX) text += ` Cheapest 8 PM slot tonight: <b>${tonightX.t.name}</b> at ${INR(tonightX.final)}.`
  return { text, best, next, favSport, tonight: tonightX }
}
