import { type ReactNode, type CSSProperties, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, ChevronLeft, Settings, Check, Info, X, Sun, Car, Droplets, Coffee, Shield, Snowflake, Lock, Target, Users, Wifi, type LucideIcon } from 'lucide-react'
import clsx from 'clsx'
import type { BookingStatus, Sport, User } from '@/types'
import { initials } from '@/lib/format'
import { useStore, useUI, useUser } from '@/store'
import { SettingsSheet } from '@/sheets/SettingsSheet'

/* ---------- Sport & amenity icons ---------- */
const SPORT_PATHS: Record<Sport, string> = {
  cricket: '<circle cx="12" cy="12" r="9"/><path d="M8 5c-2 4-2 10 0 14M16 5c2 4 2 10 0 14"/>',
  football: '<circle cx="12" cy="12" r="9"/><polygon points="12 8 15.5 10.6 14.2 14.8 9.8 14.8 8.5 10.6"/><path d="M12 8V3M15.5 10.6l4-1.6M14.2 14.8l2.6 3.6M9.8 14.8l-2.6 3.6M8.5 10.6l-4-1.6"/>',
  badminton: '<path d="M15 9l-3-7-3 7M9 9l-1.5 5h9L15 9"/><circle cx="12" cy="18" r="3"/>',
  tt: '<circle cx="10" cy="9" r="6"/><path d="M14.2 13.2L21 20"/><circle cx="18.5" cy="5" r="1.5"/>',
  tennis: '<circle cx="12" cy="12" r="9"/><path d="M4.5 9.5c3 1 5 2.5 7.5 2.5s4.5-1.5 7.5-2.5M4.5 14.5c3-1 5-2.5 7.5-2.5s4.5 1.5 7.5 2.5"/>',
  basketball: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5.6 5.6c3 3 3 9.8 0 12.8M18.4 5.6c-3 3-3 9.8 0 12.8"/>',
}
export function SportIcon({ sport, size = 16, className }: { sport: Sport; size?: number; className?: string }) {
  return <svg className={clsx('ico', className)} width={size} height={size} style={{ width: size, height: size }} viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: SPORT_PATHS[sport] ?? '' }} />
}
export const AMENITIES: Record<string, { icon: LucideIcon | 'badminton'; label: string }> = {
  floodlights: { icon: Sun, label: 'Floodlights' }, parking: { icon: Car, label: 'Parking' }, showers: { icon: Droplets, label: 'Showers' }, cafe: { icon: Coffee, label: 'Cafe' }, referee: { icon: Shield, label: 'Referee' },
  ac: { icon: Snowflake, label: 'Air-conditioned' }, shuttles: { icon: 'badminton', label: 'Shuttles' }, lockers: { icon: Lock, label: 'Lockers' }, coaching: { icon: Target, label: 'Coaching' }, 'bowling machine': { icon: Target, label: 'Bowling machine' }, bibs: { icon: Users, label: 'Bibs' }, wifi: { icon: Wifi, label: 'Wi-Fi' },
}
export function Amenity({ id }: { id: string }) {
  const a = AMENITIES[id] ?? { icon: Check, label: id }
  return <span>{a.icon === 'badminton' ? <SportIcon sport="badminton" /> : <a.icon className="ico sm" />}{a.label}</span>
}

/* ---------- Primitives ---------- */
export function Avatar({ user, size = '', style }: { user?: Pick<User, 'name' | 'color'> | null; size?: '' | 'sm' | 'lg'; style?: CSSProperties }) {
  return <span className={clsx('avatar', size)} style={{ background: user?.color ?? '#555', ...style }}>{initials(user?.name)}</span>
}
export type Tone = '' | 'amber' | 'red' | 'blue' | 'grey' | 'solid'
export function Tag({ children, tone = '', className, style }: { children: ReactNode; tone?: Tone; className?: string; style?: CSSProperties }) {
  return <span className={clsx('tag', tone, className)} style={style}>{children}</span>
}
const STATUS: Record<BookingStatus, [string, Tone]> = { confirmed: ['Confirmed', ''], completed: ['Completed', 'grey'], cancelled: ['Cancelled', 'red'], 'no-show': ['No-show', 'amber'] }
export function StatusTag({ status }: { status: BookingStatus }) {
  const [label, tone] = STATUS[status]
  return <Tag tone={tone}>{label}</Tag>
}
export function Label({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) { return <div className={clsx('label', className)} style={style}>{children}</div> }
export function SectionHead({ label, right }: { label: ReactNode; right?: ReactNode }) { return <div className="section-head"><div className="label">{label}</div>{right}</div> }
export function Empty({ icon: Icon, title, sub, cta }: { icon: LucideIcon; title: string; sub?: string; cta?: ReactNode }) {
  return <div className="empty"><div className="e-ico"><Icon className="ico" /></div><div className="h3" style={{ color: 'var(--text)' }}>{title}</div>{sub && <div className="small" style={{ marginTop: 4 }}>{sub}</div>}{cta && <div style={{ marginTop: 16 }}>{cta}</div>}</div>
}
export function Seg<T extends string>({ value, options, onChange, style }: { value: T; options: Array<{ v: T; label: ReactNode }>; onChange: (v: T) => void; style?: CSSProperties }) {
  return <div className="seg" style={style}>{options.map(o => <button key={o.v} type="button" className={clsx(value === o.v && 'on')} onClick={() => onChange(o.v)}>{o.label}</button>)}</div>
}
export function Chip({ on, onClick, children }: { on?: boolean; onClick?: () => void; children: ReactNode }) { return <button type="button" className={clsx('chip', on && 'on')} onClick={onClick}>{children}</button> }
export function Stat({ v, k, center, accent, style }: { v: ReactNode; k: string; center?: boolean; accent?: boolean; style?: CSSProperties }) {
  return <div className={clsx('stat', center && 'center')} style={style}><div className="v" style={accent ? { color: 'var(--accent)' } : undefined}>{v}</div><div className="k">{k}</div></div>
}
export function Bar({ pct, color, style }: { pct: number; color?: string; style?: CSSProperties }) { return <div className="bar" style={style}><i style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: color }} /></div> }
export function FormPill({ r }: { r: 'W' | 'L' | 'D' }) { return <span className={clsx('form-pill', r)}>{r}</span> }
export function Html({ html, className, style }: { html: string; className?: string; style?: CSSProperties }) { return <span className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} /> }

/* ---------- Top bar ---------- */
export function Topbar({ eyebrow, title, back, actions }: { eyebrow?: ReactNode; title: ReactNode; back?: boolean; actions?: ReactNode }) {
  const nav = useNavigate()
  return (
    <header className={clsx('top', back && 'simple')}>
      <div className="back-title">
        {back && <button className="icon-btn" onClick={() => (window.history.length > 1 ? nav(-1) : nav('/'))} aria-label="Back"><ChevronLeft className="ico" /></button>}
        <div style={{ minWidth: 0 }}>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1 className={back ? 'h2' : 'h1'}>{title}</h1></div>
      </div>
      <div className="top-actions">{actions}</div>
    </header>
  )
}
export function BellBtn() {
  const u = useUser(); const unread = useStore(s => s.notifs.filter(n => n.for === u?.id && !n.read).length)
  return <Link className="icon-btn bell" to="/notifications" title="Notifications"><Bell className="ico" />{unread > 0 && <span className="dot" />}</Link>
}
export function SettingsBtn() { const open = useUI(s => s.openSheet); return <button className="icon-btn" title="Settings" onClick={() => open(<SettingsSheet />)}><Settings className="ico" /></button> }

/* ---------- Sheet & toasts hosts ---------- */
export function SheetHead({ title, sub }: { title: ReactNode; sub?: ReactNode }) {
  const close = useUI(s => s.closeSheet)
  return <div className="row between" style={{ marginBottom: 16 }}><div><div className="h2">{title}</div>{sub && <div className="small muted">{sub}</div>}</div><button className="icon-btn" onClick={close} aria-label="Close"><X className="ico" /></button></div>
}
export function SheetHost() {
  const sheet = useUI(s => s.sheet); const close = useUI(s => s.closeSheet)
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [close])
  return <AnimatePresence>{sheet && (
    <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onMouseDown={e => { if (e.target === e.currentTarget) close() }}>
      <motion.div className="sheet" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 32 }}><div className="grab" />{sheet}</motion.div>
    </motion.div>
  )}</AnimatePresence>
}
export function Toasts() {
  const toasts = useUI(s => s.toasts)
  return <div className="toasts"><AnimatePresence>{toasts.map(t => (
    <motion.div key={t.id} className={clsx('toast', t.type === 'err' && 'err')} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}>{t.type === 'err' ? <Info className="ico" /> : <Check className="ico" />}<span>{t.msg}</span></motion.div>
  ))}</AnimatePresence></div>
}

/* ---------- Motion helpers ---------- */
export function Reveal({ children, delay = 0, className, style, y = 22 }: { children: ReactNode; delay?: number; className?: string; style?: CSSProperties; y?: number }) {
  return <motion.div className={className} style={style} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] }}>{children}</motion.div>
}
export function Stagger({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <motion.div className={className} style={style} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-30px' }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}>{children}</motion.div>
}
export const item = { hidden: { opacity: 0, y: 18, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] } } }
export function CountUp({ to, decimals = 0, prefix = '', suffix = '', duration = 1.3, locale = true }: { to: number; decimals?: number; prefix?: string; suffix?: string; duration?: number; locale?: boolean }) {
  const [v, setV] = useState(0); const ref = useRef<HTMLSpanElement>(null); const started = useRef(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const run = () => { if (started.current) return; started.current = true; const t0 = performance.now(); const tick = (t: number) => { const p = Math.min(1, (t - t0) / (duration * 1000)); const e = 1 - Math.pow(1 - p, 3); setV(to * e); if (p < 1) requestAnimationFrame(tick) }; requestAnimationFrame(tick) }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { run(); io.disconnect() } }, { threshold: 0.3 }); io.observe(el); return () => io.disconnect()
  }, [to, duration])
  const n = decimals ? v.toFixed(decimals) : Math.round(v)
  return <span ref={ref}>{prefix}{locale && !decimals ? Number(n).toLocaleString('en-IN') : n}{suffix}</span>
}
export function Sparkline({ vals }: { vals: number[] }) {
  if (vals.length < 2) return null
  const w = 100, h = 40, max = Math.max(1, ...vals), min = Math.min(...vals)
  const pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - 4 - ((v - min) / Math.max(1, max - min)) * (h - 8)] as const)
  const d = 'M' + pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L')
  return <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"><defs><linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style={{ stopColor: 'var(--accent)', stopOpacity: 0.3 }} /><stop offset="1" style={{ stopColor: 'var(--accent)', stopOpacity: 0 }} /></linearGradient></defs><path className="fill" d={`${d}L${w},${h}L0,${h}Z`} /><path d={d} /></svg>
}
