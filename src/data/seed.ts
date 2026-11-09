import type { Booking, DataState, LiveMatch, MatchResult, Notif, OpenMatch, PayMethod, PriceQuote, Review, Sport, Turf, User } from '@/types'
import { addDays, dk } from '@/lib/format'

export function rng(a: number) {
  return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

export const CITY_CENTER: Record<string, [number, number]> = { Bangalore: [12.9716, 77.5946], Mumbai: [19.076, 72.8777], Delhi: [28.6139, 77.209], Hyderabad: [17.385, 78.4867], Pune: [18.5204, 73.8567] }

export const COUPONS: Record<string, { pct: number; max: number; desc: string; weekend?: boolean }> = {
  FIRST10: { pct: 10, max: 200, desc: '10% off (max ₹200)' },
  TURF20: { pct: 20, max: 300, desc: '20% off (max ₹300)' },
  WEEKEND15: { pct: 15, max: 400, desc: '15% off weekends (max ₹400)', weekend: true },
}

export function slotPrice(t: Turf, dateKey: string, hour: number, isFirst = false): PriceQuote {
  let base = t.price
  const peak = hour >= t.peakFrom
  if (peak) base = Math.round(base * (1 + t.peakPct / 100))
  let pct = 0
  const o = t.offer
  if (o) {
    const wd = new Date(dateKey + 'T00:00:00').getDay()
    if (o.type === 'all') pct = o.pct
    else if (o.type === 'after' && hour >= (o.after ?? 24)) pct = o.pct
    else if (o.type === 'weekday' && wd >= 1 && wd <= 5) pct = o.pct
    else if (o.type === 'first' && isFirst) pct = o.pct
  }
  const final = Math.round((base * (1 - pct / 100)) / 10) * 10
  return { base, final, pct, peak }
}

export function seed(): DataState {
  const r = rng(20261108)
  const pick = <T,>(a: T[]): T => a[Math.floor(r() * a.length)]
  const code = () => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 6; i++) s += A[Math.floor(r() * A.length)]; return s }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const nowH = new Date().getHours()

  const baseUsers: Array<Partial<User> & { id: string; name: string; role: User['role']; color: string }> = [
    { id: 'u1', name: 'Arjun Mehta', email: 'player@turfhub.app', phone: '+91 99999 00002', role: 'player', color: '#3dff8a', pts: 260, favs: ['t1', 't6'], city: 'Bangalore' },
    { id: 'o1', name: 'Rahul Verma', email: 'owner@turfhub.app', phone: '+91 99999 00001', role: 'owner', color: '#ffb547', business: 'Verma Sports Ventures', city: 'Bangalore' },
    { id: 'o2', name: 'Nisha Kapoor', role: 'owner', color: '#5cc8ff', business: 'Kapoor Courts', city: 'Mumbai' },
    { id: 'u2', name: 'Priya Nair', color: '#5cc8ff', role: 'player', city: 'Bangalore' },
    { id: 'u3', name: 'Karan Singh', color: '#b18cff', role: 'player', city: 'Bangalore' },
    { id: 'u4', name: 'Sneha Rao', color: '#ff8fa3', role: 'player', city: 'Bangalore' },
    { id: 'u5', name: 'Dev Patel', color: '#ffd166', role: 'player', city: 'Mumbai' },
    { id: 'u6', name: 'Aisha Khan', color: '#6ee7b7', role: 'player', city: 'Bangalore' },
    { id: 'u7', name: 'Rohan Das', color: '#f97316', role: 'player', city: 'Bangalore' },
    { id: 'u8', name: 'Meera Iyer', color: '#a3e635', role: 'player', city: 'Bangalore' },
    { id: 'u9', name: 'Vikram Joshi', color: '#38bdf8', role: 'player', city: 'Mumbai' },
  ]
  const users: User[] = baseUsers.map(u => ({
    pts: Math.floor(r() * 400), favs: [], city: 'Bangalore',
    email: `${u.name.split(' ')[0].toLowerCase()}@turfhub.app`,
    phone: `+91 98${Math.floor(r() * 900 + 100)} ${Math.floor(r() * 90000 + 10000)}`,
    ...u,
  }) as User)

  const baseTurfs: Array<Omit<Turf, 'active' | 'blocked' | 'lat' | 'lng'>> = [
    { id: 't1', name: 'Champions Cricket Arena', sport: 'cricket', city: 'Bangalore', area: 'Koramangala', price: 1200, rating: 4.6, reviews: 128, offer: { type: 'all', pct: 10, label: '10% OFF every slot' }, amenities: ['floodlights', 'parking', 'showers', 'cafe', 'referee'], ownerId: 'o1', desc: 'Full-size box cricket arena with pro-grade turf, bowling machine on request and floodlit evening play. Scoreboard and live-streaming camera included.', open: 6, close: 23, peakFrom: 18, peakPct: 20, addons: [{ id: 'kit', name: 'Kit rental', price: 150 }, { id: 'ref', name: 'Umpire', price: 300 }, { id: 'bm', name: 'Bowling machine', price: 400 }] },
    { id: 't2', name: 'SmashPro Badminton Court', sport: 'badminton', city: 'Bangalore', area: 'Indiranagar', price: 500, rating: 4.4, reviews: 86, offer: { type: 'first', pct: 10, label: 'Welcome deal: 10% OFF' }, amenities: ['ac', 'parking', 'shuttles', 'lockers'], ownerId: 'o1', desc: '4 synthetic BWF-standard courts, fully air-conditioned with anti-glare lighting and a sprung wooden sub-floor.', open: 6, close: 22, peakFrom: 18, peakPct: 15, addons: [{ id: 'rk', name: 'Racket rental', price: 80 }, { id: 'sh', name: 'Shuttle tube', price: 120 }] },
    { id: 't3', name: 'Spin Zone TT Club', sport: 'tt', city: 'Bangalore', area: 'HSR Layout', price: 300, rating: 4.2, reviews: 41, offer: { type: 'all', pct: 15, label: '15% OFF every slot' }, amenities: ['ac', 'coaching', 'lockers'], ownerId: 'o1', desc: '6 Stag tables, a robot practice table and weekend coaching for all levels. Quiet, focused, air-conditioned.', open: 7, close: 22, peakFrom: 18, peakPct: 10, addons: [{ id: 'pd', name: 'Paddle rental', price: 50 }, { id: 'ro', name: 'Robot table', price: 150 }] },
    { id: 't4', name: 'Kickoff Football Ground', sport: 'football', city: 'Mumbai', area: 'Andheri West', price: 1800, rating: 4.7, reviews: 212, offer: { type: 'all', pct: 5, label: '5% OFF every slot' }, amenities: ['floodlights', 'parking', 'showers', 'cafe', 'bibs'], ownerId: 'o1', desc: '7-a-side FIFA-quality turf with pro goals, shaded dugouts and a rooftop cafe overlooking the pitch.', open: 6, close: 24, peakFrom: 19, peakPct: 25, addons: [{ id: 'ball', name: 'Match ball', price: 100 }, { id: 'bibs', name: 'Bibs set', price: 50 }, { id: 'ref', name: 'Referee', price: 400 }] },
    { id: 't5', name: 'Boundary Blast Cricket Nets', sport: 'cricket', city: 'Bangalore', area: 'Whitefield', price: 900, rating: 4.3, reviews: 67, offer: { type: 'weekday', pct: 25, label: 'Weekday Power Play: 25% OFF' }, amenities: ['floodlights', 'parking', 'bowling machine'], ownerId: 'o1', desc: '4-lane practice nets with bowling machines and video analysis on request. Perfect for drills and coaching.', open: 6, close: 22, peakFrom: 18, peakPct: 15, addons: [{ id: 'bm', name: 'Bowling machine', price: 350 }] },
    { id: 't6', name: 'Goal Rush Arena', sport: 'football', city: 'Bangalore', area: 'Bellandur', price: 1400, rating: 4.5, reviews: 154, offer: { type: 'after', after: 20, pct: 30, label: 'Night Kickoff: 30% OFF after 8 PM' }, amenities: ['floodlights', 'parking', 'showers', 'cafe'], ownerId: 'o1', desc: '5-a-side rooftop turf with panoramic city views and late-night slots until midnight.', open: 6, close: 24, peakFrom: 18, peakPct: 20, addons: [{ id: 'ball', name: 'Match ball', price: 100 }, { id: 'bibs', name: 'Bibs set', price: 50 }] },
    { id: 't7', name: 'Ace Padel & Tennis', sport: 'tennis', city: 'Bangalore', area: 'JP Nagar', price: 800, rating: 4.8, reviews: 39, offer: null, amenities: ['floodlights', 'parking', 'coaching', 'cafe'], ownerId: 'o2', desc: 'Two padel courts and a clay tennis court. Rackets available, coaching on weekends.', open: 6, close: 22, peakFrom: 17, peakPct: 20, addons: [{ id: 'rk', name: 'Racket rental', price: 150 }] },
    { id: 't8', name: 'Hoops District', sport: 'basketball', city: 'Mumbai', area: 'Bandra', price: 1000, rating: 4.4, reviews: 58, offer: { type: 'all', pct: 10, label: '10% OFF every slot' }, amenities: ['floodlights', 'parking', 'lockers'], ownerId: 'o2', desc: 'Indoor full court with hardwood flooring, shot clocks and a sound system.', open: 7, close: 23, peakFrom: 18, peakPct: 15, addons: [{ id: 'ball', name: 'Ball rental', price: 80 }] },
  ]
  const COORDS: Record<string, [number, number]> = {"t1": [12.9352, 77.6245], "t2": [12.9784, 77.6408], "t3": [12.9116, 77.6389], "t4": [19.1364, 72.8296], "t5": [12.9698, 77.75], "t6": [12.9304, 77.6784], "t7": [12.9063, 77.5857], "t8": [19.0596, 72.8295]}
  const turfs: Turf[] = baseTurfs.map(t => ({ ...t, active: true, blocked: [], lat: COORDS[t.id][0], lng: COORDS[t.id][1] }))

  const bookings: Booking[] = []; let bid = 1
  const weight = (h: number) => (h >= 18 && h <= 21 ? 5 : h <= 8 ? 3 : h >= 15 ? 2 : 1)
  const players = users.filter(u => u.role === 'player')
  const methods: PayMethod[] = ['UPI', 'UPI', 'Card', 'Venue']
  const makeBooking = (t: Turf, key: string, h: number, dur: number, u: User, d: number) => {
    const p = slotPrice(t, key, h)
    let status: Booking['status'] = d < 0 ? (r() < 0.88 ? 'completed' : r() < 0.6 ? 'cancelled' : 'no-show') : 'confirmed'
    if (d === 0) status = h + dur <= nowH ? 'completed' : 'confirmed'
    bookings.push({ id: 'b' + bid++, turfId: t.id, userId: u.id, userName: u.name, date: key, hour: h, duration: dur, amount: p.final * dur, status, sport: t.sport, code: code(), createdAt: addDays(new Date(key + 'T12:00:00'), -Math.floor(r() * 5)).toISOString(), method: pick(methods), addons: [] })
  }
  for (let d = -90; d <= 14; d++) {
    const date = addDays(today, d); const key = dk(date); const wd = date.getDay()
    const growth = 1 + (d + 90) / 180
    for (const t of turfs) {
      const base = t.ownerId === 'o1' ? (wd === 0 || wd === 6 ? 3.8 : 2.4) : 1.2
      let n = Math.floor(r() * base * growth); if (d > 0) n = Math.floor(r() * 2)
      const used = new Set<number>()
      const hs: number[] = []; for (let h = t.open; h < t.close; h++) for (let i = 0; i < weight(h); i++) hs.push(h)
      for (let i = 0; i < n; i++) {
        const h = pick(hs); const dur = r() < 0.72 ? 1 : 2
        if (h + dur > t.close) continue
        let clash = false; for (let k = 0; k < dur; k++) if (used.has(h + k)) clash = true
        if (clash) continue; for (let k = 0; k < dur; k++) used.add(h + k)
        const u = r() < 0.03 && t.city === 'Bangalore' ? users[0] : pick(players)
        makeBooking(t, key, h, dur, u, d)
      }
    }
  }
  makeBooking(turfs[0], dk(addDays(today, 1)), 19, 2, users[0], 1)
  makeBooking(turfs[5], dk(addDays(today, 3)), 21, 1, users[0], 3)
  makeBooking(turfs[6], dk(addDays(today, -12)), 7, 1, users[0], -12)
  makeBooking(turfs[2], dk(today), Math.min(21, Math.max(nowH + 2, 8)), 1, users[0], 0)

  const results: MatchResult[] = []; let rid = 1
  const teamNames = ['Thunder XI', 'Night Owls', 'Strikers', 'Rebels FC', 'Koramangala Kings', 'HSR Hitters', 'Smash Bros', 'Spin Doctors']
  const scoreFor = (sport: Sport): [number, number] => sport === 'cricket' ? [Math.floor(r() * 80 + 40), Math.floor(r() * 80 + 40)] : sport === 'football' ? [Math.floor(r() * 6), Math.floor(r() * 6)] : sport === 'badminton' || sport === 'tt' ? [21, Math.floor(r() * 19)] : sport === 'basketball' ? [Math.floor(r() * 30 + 40), Math.floor(r() * 30 + 40)] : [6, Math.floor(r() * 5)]
  const logFor = (u: User, winBias: number) => {
    const past = bookings.filter(b => b.userId === u.id && b.status === 'completed' && b.date < dk(today)).slice(-10)
    past.forEach(b => {
      if (r() > 0.85) return
      let [a, c] = scoreFor(b.sport); if (r() < 0.5) [a, c] = [c, a]
      if (r() < winBias && a < c) [a, c] = [c, a]
      const opp = pick(players.filter(p => p.id !== u.id))
      results.push({ id: 'r' + rid++, userId: u.id, bookingId: b.id, turfId: b.turfId, sport: b.sport, date: b.date, teamA: `${u.name.split(' ')[0]}'s XI`, teamB: pick(teamNames), scoreA: a, scoreB: c, opponentId: opp.id })
    })
  }
  players.forEach(u => logFor(u, u.id === 'u1' ? 0.55 : r()))

  const tonightHour = Math.min(23, Math.max(nowH + 1, 18))
  const matches: OpenMatch[] = [
    { id: 'm1', turfId: 't1', hostId: 'u3', sport: 'cricket', date: dk(addDays(today, 1)), hour: 19, duration: 2, needed: 12, players: ['u3', 'u2', 'u6', 'u7', 'u8'], level: 'Intermediate', fee: 150, note: 'Box cricket, 6-a-side. Bring whites if you have them!' },
    { id: 'm2', turfId: 't6', hostId: 'u2', sport: 'football', date: dk(today), hour: tonightHour, duration: 1, needed: 10, players: ['u2', 'u4', 'u6', 'u7', 'u8', 'u3', 'u9'], level: 'Casual', fee: 140, note: '5v5 under the lights. Keeper needed!' },
    { id: 'm3', turfId: 't2', hostId: 'u4', sport: 'badminton', date: dk(addDays(today, 2)), hour: 7, duration: 1, needed: 4, players: ['u4', 'u6'], level: 'Advanced', fee: 125, note: 'Doubles, morning session.' },
    { id: 'm4', turfId: 't3', hostId: 'u6', sport: 'tt', date: dk(addDays(today, 1)), hour: 18, duration: 1, needed: 4, players: ['u6', 'u1', 'u8'], level: 'Casual', fee: 75, note: 'Round-robin singles.' },
    { id: 'm5', turfId: 't4', hostId: 'u5', sport: 'football', date: dk(addDays(today, 3)), hour: 20, duration: 2, needed: 14, players: ['u5', 'u9'], level: 'Intermediate', fee: 260, note: '7-a-side, looking for a keeper!' },
  ]

  const reviewText = ['Great turf, lights are excellent for night games.', 'Clean, well maintained. Staff were super helpful.', 'Booking was smooth and the slot started right on time.', 'Could use a bigger parking area, but the surface is top class.', 'Best value in the area. We come every weekend.', 'Changing rooms are spotless. Highly recommend.']
  const reviews: Review[] = []
  turfs.forEach(t => { for (let i = 0; i < 3; i++) { const u = pick(players); reviews.push({ id: `rv${t.id}${i}`, turfId: t.id, userId: u.id, name: u.name, stars: r() < 0.7 ? 5 : 4, text: pick(reviewText), date: dk(addDays(today, -Math.floor(r() * 40 + 1))) }) } })

  const iso = (d: number) => addDays(today, d).toISOString()
  const notifs: Notif[] = [
    { id: 'n1', for: 'u1', type: 'booking', title: 'Booking confirmed', body: `Champions Cricket Arena · tomorrow · 7 PM`, at: iso(0), read: false },
    { id: 'n2', for: 'u1', type: 'match', title: '2 players joined your match', body: 'Spin Zone TT Club · tomorrow 6 PM is now 3/4', at: iso(0), read: false },
    { id: 'n3', for: 'u1', type: 'offer', title: 'Night Kickoff: 30% OFF after 8 PM', body: 'Goal Rush Arena · this week only', at: iso(-1), read: true },
    { id: 'n4', for: 'u1', type: 'points', title: 'You earned 60 points', body: '1 pt = ₹1 off your next booking', at: iso(-2), read: true },
    { id: 'n5', for: 'o1', type: 'booking', title: 'New booking: Priya Nair', body: 'Goal Rush Arena · tonight 9 PM', at: iso(0), read: false },
    { id: 'n6', for: 'o1', type: 'insight', title: 'Weekend occupancy up 18%', body: 'Champions Cricket Arena vs last month', at: iso(-1), read: false },
    { id: 'n7', for: 'o1', type: 'payout', title: 'Payout of ₹28,400 processed', body: 'Arrives in your account by Tuesday', at: iso(-3), read: true },
  ]

  const live: LiveMatch[] = [
    { id: 'l1', turfId: 't1', sport: 'cricket', a: 'Koramangala Kings', b: 'HSR Hitters', sa: 86, sb: 0, info: '12.3 ov · 1st inn' },
    { id: 'l2', turfId: 't6', sport: 'football', a: 'Night Owls', b: 'Rebels FC', sa: 2, sb: 1, info: "38'" },
    { id: 'l3', turfId: 't2', sport: 'badminton', a: 'Sneha / Aisha', b: 'Priya / Meera', sa: 18, sb: 15, info: 'Set 2' },
    { id: 'l4', turfId: 't4', sport: 'football', a: 'Andheri United', b: 'Juhu Jets', sa: 0, sb: 0, info: "12'" },
  ]

  return { users, turfs, bookings, results, matches, reviews, notifs, live, settings: { accent: 'green', notifs: true, reminders: true, theme: 'dark' } }
}
