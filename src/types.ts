export type Sport = 'cricket' | 'football' | 'badminton' | 'tt' | 'tennis' | 'basketball'
export type Role = 'player' | 'owner'
export type Accent = 'green' | 'blue' | 'amber' | 'violet'
export type BookingStatus = 'confirmed' | 'completed' | 'cancelled' | 'no-show'
export type PayMethod = 'UPI' | 'Card' | 'Venue'
export type Level = 'Casual' | 'Intermediate' | 'Advanced'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  color: string
  pts: number
  favs: string[]
  city: string
  business?: string
}

export interface Offer {
  type: 'all' | 'after' | 'weekday' | 'first'
  pct: number
  label: string
  after?: number
}

export interface Addon { id: string; name: string; price: number }

export interface Turf {
  id: string
  name: string
  sport: Sport
  city: string
  area: string
  price: number
  rating: number
  reviews: number
  offer: Offer | null
  amenities: string[]
  ownerId: string
  desc: string
  open: number
  close: number
  peakFrom: number
  peakPct: number
  addons: Addon[]
  active: boolean
  blocked: string[] // "YYYY-MM-DD|hour"
  lat: number
  lng: number
}

export interface Booking {
  id: string
  turfId: string
  userId: string
  userName: string
  date: string
  hour: number
  duration: number
  amount: number
  status: BookingStatus
  sport: Sport
  code: string
  createdAt: string
  method: PayMethod
  addons: string[]
  ptsUsed?: number
  coupon?: string | null
  refund?: number
}

export interface MatchResult {
  id: string
  userId: string
  bookingId: string | null
  turfId: string | null
  sport: Sport
  date: string
  teamA: string
  teamB: string
  scoreA: number
  scoreB: number
  opponentId: string | null
}

export interface OpenMatch {
  id: string
  turfId: string
  hostId: string
  sport: Sport
  date: string
  hour: number
  duration: number
  needed: number
  players: string[]
  level: Level
  fee: number
  note: string
}

export interface Review { id: string; turfId: string; userId: string; name: string; stars: number; text: string; date: string }

export type NotifType = 'booking' | 'match' | 'offer' | 'points' | 'insight' | 'payout' | 'cancel' | 'review'
export interface Notif { id: string; for: string; type: NotifType; title: string; body: string; at: string; read: boolean }

export interface LiveMatch { id: string; turfId: string; sport: Sport; a: string; b: string; sa: number; sb: number; info: string }

export interface Settings { accent: Accent; notifs: boolean; reminders: boolean; theme: 'dark' | 'light' }

export interface DataState {
  users: User[]
  turfs: Turf[]
  bookings: Booking[]
  results: MatchResult[]
  matches: OpenMatch[]
  reviews: Review[]
  notifs: Notif[]
  live: LiveMatch[]
  settings: Settings
}

export interface PriceQuote { base: number; final: number; pct: number; peak: boolean }
