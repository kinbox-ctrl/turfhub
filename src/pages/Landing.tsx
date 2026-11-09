import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BarChart3, Calendar, Check, MapPin, QrCode, Radio, Search, Sparkles, Star, Trophy, Users, Zap, Gift, Map as MapIcon } from 'lucide-react'
import type { Sport } from '@/types'
import { INR, SPORTS, SPORT_KEYS, first, hourLabel, sportLabel, byTimeDesc } from '@/lib/format'
import { useStore, toast } from '@/store'
import { TurfArt } from '@/components/TurfArt'
import { Avatar, SportIcon, Tag, Reveal, Stagger, item, CountUp } from '@/components/ui'
import { motion } from 'framer-motion'
import { AreaChart, Ring } from '@/components/charts'

export function Landing() {
  const s = useStore(); const nav = useNavigate()
  const [sport, setSport] = useState<Sport | ''>(''); const [city, setCity] = useState('Bangalore')
  const demo = (role: 'player' | 'owner', to?: string) => { s.signIn(role === 'owner' ? 'o1' : 'u1'); nav(to ?? (role === 'owner' ? '/dashboard' : '/discover')); toast(role === 'owner' ? 'Welcome to your command center 👋' : 'Welcome to TurfHub 👋') }
  const featured = useMemo(() => [...s.turfs].filter(t => t.active).sort((a, b) => b.rating - a.rating).slice(0, 6), [s.turfs])
  const recent = useMemo(() => s.bookings.filter(b => b.status !== 'cancelled').sort(byTimeDesc).slice(0, 14), [s.bookings])
  const stats = useMemo(() => ({ turfs: s.turfs.length, bookings: s.bookings.length, cities: new Set(s.turfs.map(t => t.city)).size, rating: (s.turfs.reduce((a, t) => a + t.rating, 0) / s.turfs.length).toFixed(1) }), [s.turfs, s.bookings])
  const ownerSeries = useMemo(() => Array.from({ length: 8 }, (_, i) => s.bookings.filter(b => b.turfId === 't1' || b.turfId === 't6').slice(i * 20, i * 20 + 20).reduce((a, b) => a + b.amount, 0)), [s.bookings])
  const heroTurf = s.turfs.find(t => t.id === 't6') ?? s.turfs[0]
  return (
    <div className="lp">
      <header className="lp-hdr"><div className="inner">
        <Link className="brand" to="/"><span className="brand-mark"><Zap className="ico" /></span>Turf<span style={{ color: 'var(--accent)' }}>Hub</span></Link>
        <nav className="links"><a href="#explore">Explore</a><a href="#how">How it works</a><a href="#features">Features</a><a href="#owners">For owners</a></nav>
        <div className="row" style={{ marginLeft: 'auto', gap: 8 }}><Link className="btn ghost sm" to="/login">Log in</Link><button className="btn primary sm" onClick={() => demo('player')}>Try the demo <ArrowRight className="ico xs" /></button></div>
      </div></header>

      <section className="lp-wrap lp-hero"><div className="lp-glow" />
        <div>
          <Tag tone="solid" style={{ marginBottom: 18 }}><Radio className="ico xs" /> Live in {stats.cities} cities</Tag>
          <h1 className="display"><span className="gradient-text">Your next game,</span><br />booked in <em>30 seconds.</em></h1>
          <p className="lp-sub">Real-time availability on every turf in your city. Transparent peak pricing, instant QR check-in, open matches to join, and a career that tracks every win.</p>
          <form className="lp-searchbar" onSubmit={e => { e.preventDefault(); demo('player', `/explore?city=${city}${sport ? `&sport=${sport}` : ''}`) }}>
            <select className="input" value={sport} onChange={e => setSport(e.target.value as Sport | '')}><option value="">Any sport</option>{SPORT_KEYS.map(k => <option key={k} value={k}>{SPORTS[k]}</option>)}</select>
            <select className="input" value={city} onChange={e => setCity(e.target.value)}><option>Bangalore</option><option>Mumbai</option></select>
            <button className="btn primary" type="submit"><Search className="ico sm" /> Find turfs</button>
          </form>
          <div className="lp-proof"><div className="avatars">{s.users.filter(u => u.role === 'player').slice(0, 4).map(u => <Avatar key={u.id} user={u} size="sm" />)}</div><span><b style={{ color: 'var(--text)' }}>{stats.bookings.toLocaleString('en-IN')}+ bookings</b> · rated {stats.rating} <Star className="ico xs" style={{ display: 'inline', color: 'var(--amber)', fill: 'var(--amber)' }} /></span></div>
        </div>
        <div className="lp-visual">
          <div className="lp-stage"><TurfArt turf={heroTurf} /></div>
          <div className="float a"><div className="row between"><Tag>Booked</Tag><span className="xs dim">just now</span></div><div className="h3" style={{ marginTop: 8 }}>{heroTurf.name}</div><div className="xs muted">Tonight · 9 PM – 10 PM · {INR(980)}</div><div className="row" style={{ marginTop: 10, gap: 8 }}><span className="qr" style={{ width: 38, height: 38, padding: 3 }}><QrCode className="ico" style={{ color: '#000', width: 32, height: 32 }} /></span><div><div className="xs muted">Check-in code</div><div className="num" style={{ fontSize: 16, letterSpacing: '.1em' }}>7LYN9K</div></div></div></div>
          <div className="float b"><div className="row xs coral" style={{ gap: 6, fontWeight: 700, letterSpacing: '.08em' }}><span className="live-dot" />LIVE · CRICKET</div><div className="row between" style={{ marginTop: 8 }}><span className="small muted">Kings</span><span className="num" style={{ fontSize: 26 }}>86 – 0</span><span className="small muted">Hitters</span></div><div className="xs dim">12.3 ov · Champions Cricket Arena</div></div>
          <div className="float c row" style={{ gap: 12 }}><div className="rating-ring" style={{ width: 56, height: 56 }}><Ring pct={78} size={56} stroke={6} /><div className="c"><b className="num" style={{ fontSize: 15 }}>78</b></div></div><div><div className="xs muted">Your rating</div><div className="small" style={{ fontWeight: 700 }}>#2 in Bangalore</div><div className="xs accent">🔥 5-game streak</div></div></div>
        </div>
      </section>

      <div className="ticker"><div className="ticker-track">{[...recent, ...recent].map((b, i) => { const t = s.turfs.find(x => x.id === b.turfId); return <span key={i} className="ticker-item"><span className="live-dot" style={{ background: 'var(--accent)', animation: 'none' }} /><b>{first(b.userName)}</b> booked <b>{t?.name}</b> · {hourLabel(b.hour)} · {INR(b.amount)}</span> })}</div></div>

      <section className="lp-wrap lp-section" style={{ paddingTop: 56 }}>
        <Stagger className="lp-stats"><motion.div variants={item} className="stat-big"><div className="num"><CountUp to={stats.turfs} /></div><div className="k">venues listed</div></motion.div><motion.div variants={item} className="stat-big"><div className="num"><CountUp to={stats.bookings} suffix="+" /></div><div className="k">bookings made</div></motion.div><motion.div variants={item} className="stat-big"><div className="num"><CountUp to={stats.cities} /></div><div className="k">cities live</div></motion.div><motion.div variants={item} className="stat-big"><div className="num"><CountUp to={+stats.rating} decimals={1} suffix=" ★" /></div><div className="k">average rating</div></motion.div></Stagger>
      </section>

      <section id="explore" className="lp-wrap lp-section" style={{ paddingTop: 0 }}>
        <Reveal className="lp-head"><Tag>Top rated this week</Tag><h2 className="display" style={{ marginTop: 12 }}>Venues players keep coming back to</h2></Reveal>
        <Stagger className="turf-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}>{featured.map(t => (
          <motion.article variants={item} key={t.id} className="turf-card" onClick={() => demo('player', `/turf/${t.id}`)}>
            <div className="turf-art"><TurfArt turf={t} /><div className="over"><div className="row between">{t.offer ? <Tag tone="solid">{t.offer.label}</Tag> : <span />}</div><div><div className="row" style={{ gap: 8, marginBottom: 6 }}><Tag>{sportLabel(t.sport)}</Tag><span className="rating"><Star className="ico xs" />{t.rating} <span style={{ opacity: .7, fontWeight: 400 }}>({t.reviews})</span></span></div><div className="h3">{t.name}</div></div></div></div>
            <div className="turf-body row between"><div className="meta"><MapPin className="ico sm" />{t.area}, {t.city}</div><div className="price">{INR(t.price)}<small>/hr</small></div></div>
          </motion.article>
        ))}</Stagger>
        <div style={{ textAlign: 'center', marginTop: 28 }}><button className="btn ghost" onClick={() => demo('player', '/explore')}><MapIcon className="ico sm" /> Explore all venues on the map</button></div>
      </section>

      <section id="how" className="lp-wrap lp-section">
        <Reveal className="lp-head"><Tag>How it works</Tag><h2 className="display" style={{ marginTop: 12 }}>Three taps from couch to kick-off</h2></Reveal>
        <Stagger className="steps">
          {[[Search, 'Find', 'Filter by sport, city, time and price. See exactly which slots are free right now — no calling the venue.'], [Calendar, 'Book', 'Pick a slot, add a referee or kit, apply a coupon or your points. Pay by UPI or at the venue. Zero convenience fee.'], [QrCode, 'Play', 'Flash your QR at the gate, log the score afterwards, and watch your rating, badges and rank climb.']].map(([I, t, d], i) => { const Icon = I as typeof Search; return <motion.div variants={item} key={String(t)} className="step"><span className="n">0{i + 1}</span><span className="q-ico"><Icon className="ico" /></span><div className="h3" style={{ fontSize: 20 }}>{String(t)}</div><p className="muted small" style={{ marginTop: 8, lineHeight: 1.6 }}>{String(d)}</p></motion.div> })}
        </Stagger>
      </section>

      <section id="features" className="lp-wrap lp-section">
        <Reveal className="lp-head"><Tag>Everything in one place</Tag><h2 className="display" style={{ marginTop: 12 }}>Built for players who take the game seriously</h2></Reveal>
        <Stagger className="bento">
          <motion.div variants={item} className="feature accent wide"><span className="q-ico"><Calendar className="ico" /></span><div className="h3">Live availability, honest pricing</div><p>Every slot shows its real price after peak surcharges and offers. Booked, blocked and past slots are greyed out — what you see is what you can book.</p><div className="row wrap" style={{ gap: 6, marginTop: 'auto' }}>{['6a ₹1,080', '7a Booked', '6p ₹1,300', '8p ₹980 · 30% off'].map(x => <span key={x} className="chip" style={{ height: 30, fontSize: 12 }}>{x}</span>)}</div></motion.div>
          <motion.div variants={item} className="feature"><span className="q-ico coral"><Radio className="ico" /></span><div className="h3">Live scores near you</div><p>Follow games happening on turfs around you, updated as they happen.</p></motion.div>
          <motion.div variants={item} className="feature"><span className="q-ico blue"><Users className="ico" /></span><div className="h3">Open matches</div><p>Short a keeper? Post a match, set the fee per head, and let nearby players join.</p></motion.div>
          <motion.div variants={item} className="feature"><span className="q-ico amber"><Trophy className="ico" /></span><div className="h3">A career, not a history</div><p>Rating, XP levels, badges, rivalries and a leaderboard per sport.</p></motion.div>
          <motion.div variants={item} className="feature"><span className="q-ico violet"><Sparkles className="ico" /></span><div className="h3">Smart assistant</div><p>“Cheapest cricket tonight?” — answered from live data, on-device.</p></motion.div>
          <motion.div variants={item} className="feature coralbg"><span className="q-ico"><Gift className="ico" /></span><div className="h3">Loyalty that pays</div><p>5% back on every booking. 1 point = ₹1 off. Bronze, Silver, Gold tiers.</p></motion.div>
          <motion.div variants={item} className="feature"><span className="q-ico"><QrCode className="ico" /></span><div className="h3">QR check-in & calendar</div><p>A scannable ticket, .ics export and a shareable invite for your squad.</p></motion.div>
        </Stagger>
      </section>

      <section id="owners" className="lp-wrap lp-section">
        <Reveal className="owner-split">
          <div><Tag tone="amber">For turf owners</Tag><h2 className="display" style={{ marginTop: 12 }}>Fill your dead slots. Know your peak hours.</h2><p className="lp-sub">A command center that turns bookings into decisions: revenue trends, a peak-hour heatmap, occupancy per turf, your top regulars — and plain-English insights telling you where the money is.</p>
            <ul className="stack s8" style={{ marginTop: 20, listStyle: 'none' }}>{['Week calendar of every booking, with walk-ins', 'Offers, peak pricing and slot blocking in two taps', 'Check-in, no-show and refund handling', 'CSV export and 0% platform fee for early partners'].map(x => <li key={x} className="row small"><Check className="ico sm accent" />{x}</li>)}</ul>
            <div className="row" style={{ marginTop: 24, gap: 10 }}><button className="btn primary" onClick={() => demo('owner')}><BarChart3 className="ico sm" /> Open the owner demo</button><Link className="btn ghost" to="/login">Partner sign in</Link></div></div>
          <div className="mock"><div className="row between" style={{ marginBottom: 14 }}><div><div className="xs muted">Hi, Rahul 👋</div><div className="h2">Command center</div></div><Tag>30 days</Tag></div>
            <div className="grid2" style={{ marginBottom: 12 }}><div className="stat"><div className="k" style={{ marginTop: 0 }}>Revenue</div><div className="v" style={{ marginTop: 6 }}>{INR(ownerSeries.reduce((a, b) => a + b, 0))}</div><div className="d accent">↗ +48%</div></div><div className="stat"><div className="k" style={{ marginTop: 0 }}>Occupancy</div><div className="v" style={{ marginTop: 6 }}>64%</div><div className="d accent">↗ +9%</div></div></div>
            <div className="card tight"><div className="label" style={{ marginBottom: 6 }}>Revenue trend</div><AreaChart vals={ownerSeries} h={90} fmt={INR} /></div>
            <div className="card glow tight" style={{ marginTop: 12 }}><div className="label accent" style={{ marginBottom: 6 }}><Sparkles className="ico xs" /> Insight</div><div className="small"><b>8 PM</b> is your goldmine — 40 bookings in 30 days. Add premium pricing there.</div></div>
          </div>
        </Reveal>
      </section>

      <section className="lp-wrap lp-section">
        <Stagger className="testis">
          {[['Booked a 7 PM slot while walking out of office. Scanned in, played, logged a 3–1. The rating thing is dangerously addictive.', 'u1'], ['We stopped taking WhatsApp bookings. The calendar and no-show tracking alone saved us hours every week.', 'o1'], ['Hosted an open match on Sunday and had 10 players in two hours. Found my regular badminton partner here.', 'u4']].map(([q, id]) => { const u = s.users.find(x => x.id === id)!; return <motion.div variants={item} key={id} className="testi">“{q}”<div className="who"><Avatar user={u} size="sm" /><span><b style={{ color: 'var(--text)' }}>{u.name}</b> · {u.role === 'owner' ? u.business : `Player, ${u.city}`}</span></div></motion.div> })}
        </Stagger>
      </section>

      <section className="lp-wrap" style={{ paddingBottom: 72 }}>
        <Reveal className="lp-cta"><h2 className="display" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>Ready to play?</h2><p className="lp-sub" style={{ margin: '14px auto 26px' }}>Jump into the live demo — no sign-up, data stays on your device.</p><div className="row" style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}><button className="btn primary lg" onClick={() => demo('player')}>Try as a player <ArrowRight className="ico sm" /></button><button className="btn ghost lg" onClick={() => demo('owner')}>Try as an owner</button></div></Reveal>
      </section>

      <footer className="footer"><div className="lp-wrap cols">
        <div><Link className="brand" to="/" style={{ fontSize: 18 }}><span className="brand-mark" style={{ width: 28, height: 28 }}><Zap className="ico sm" /></span>TurfHub</Link><p style={{ marginTop: 12, maxWidth: 300, lineHeight: 1.6 }}>Book any turf. Any sport. Any city. Built with React, TypeScript and a lot of evening football.</p></div>
        <div><b style={{ color: 'var(--text)' }}>Players</b><a href="#explore">Explore venues</a><a href="#how">How it works</a><a href="#features">Features</a></div>
        <div><b style={{ color: 'var(--text)' }}>Owners</b><a href="#owners">Command center</a><Link to="/login">Partner sign in</Link></div>
        <div><b style={{ color: 'var(--text)' }}>Sports</b>{SPORT_KEYS.slice(0, 4).map(k => <a key={k} href="#explore" className="row" style={{ gap: 6 }}><SportIcon sport={k} size={14} />{SPORTS[k]}</a>)}</div>
      </div><div className="lp-wrap" style={{ marginTop: 28, fontSize: 12 }}>© {new Date().getFullYear()} TurfHub · Demo data, nothing leaves your browser</div></footer>
    </div>
  )
}
