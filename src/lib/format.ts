import { addDays as dfAddDays, format, parseISO, formatDistanceToNowStrict, startOfDay } from 'date-fns'
import type { Sport, User } from '@/types'

export const INR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')
export const pad = (n: number) => String(n).padStart(2, '0')
export const dk = (d: Date) => format(d, 'yyyy-MM-dd')
export const addDays = (d: Date, n: number) => dfAddDays(d, n)
export const todayKey = () => dk(new Date())
export const parseKey = (k: string) => startOfDay(parseISO(k))
export const hourLabel = (hr: number) => { const x = ((hr % 24) + 24) % 24; const ap = x >= 12 ? 'PM' : 'AM'; const hh = x % 12 === 0 ? 12 : x % 12; return `${hh} ${ap}` }
export const hourShort = (hr: number) => { const x = hr % 24; return x === 0 ? '12a' : x < 12 ? `${x}a` : x === 12 ? '12p' : `${x - 12}p` }
export const rangeLabel = (hr: number, dur: number) => `${hourLabel(hr)} – ${hourLabel(hr + dur)}`
export const dateLabel = (k: string, fmt = 'EEE, d MMM') => format(parseKey(k), fmt)
export const relDay = (k: string) => { const t = new Date(); if (k === dk(t)) return 'Today'; if (k === dk(addDays(t, 1))) return 'Tomorrow'; if (k === dk(addDays(t, -1))) return 'Yesterday'; return dateLabel(k) }
export const timeAgo = (iso: string) => formatDistanceToNowStrict(new Date(iso), { addSuffix: true }).replace(' minutes', 'm').replace(' minute', 'm').replace(' hours', 'h').replace(' hour', 'h').replace(' days', 'd').replace(' day', 'd').replace(' seconds', 's').replace(' second', 's')
export const SPORTS: Record<Sport, string> = { cricket: 'Cricket', football: 'Football', badminton: 'Badminton', tt: 'Table Tennis', tennis: 'Tennis', basketball: 'Basketball' }
export const SPORT_KEYS = Object.keys(SPORTS) as Sport[]
export const sportLabel = (s: Sport | string) => SPORTS[s as Sport] ?? s
export const first = (n?: string) => (n ?? '').split(' ')[0]
export const initials = (n?: string) => (n ?? '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()
export const byTimeAsc = <T extends { date: string; hour: number }>(a: T, b: T) => (a.date + pad(a.hour)).localeCompare(b.date + pad(b.hour))
export const byTimeDesc = <T extends { date: string; hour: number }>(a: T, b: T) => byTimeAsc(b, a)
export const genCode = () => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)]; return s }
export const uid = (p = '') => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
export const avatarColor = (u?: Pick<User, 'color'> | null) => u?.color ?? '#3dff8a'

export function download(name: string, content: string, type = 'text/plain') {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
export async function shareText(text: string, title = 'TurfHub'): Promise<'shared' | 'copied' | 'failed'> {
  try { if (navigator.share) { await navigator.share({ title, text }); return 'shared' } } catch (e) { if ((e as Error).name === 'AbortError') return 'shared' }
  try { await navigator.clipboard.writeText(text); return 'copied' } catch { return 'failed' }
}
export function icsFor(b: { id: string; date: string; hour: number; duration: number; code: string }, summary: string, location: string) {
  const st = parseKey(b.date); st.setHours(b.hour); const en = new Date(st.getTime() + b.duration * 36e5)
  const f = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, '')
  return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//TurfHub//EN\r\nBEGIN:VEVENT\r\nUID:${b.id}@turfhub\r\nDTSTAMP:${f(new Date())}\r\nDTSTART:${f(st)}\r\nDTEND:${f(en)}\r\nSUMMARY:${summary}\r\nLOCATION:${location}\r\nDESCRIPTION:Check-in code ${b.code}\r\nEND:VEVENT\r\nEND:VCALENDAR`
}
