import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, LayoutGrid, Search, Sparkles, Trophy } from 'lucide-react'
import type { Sport } from '@/types'
import { SPORT_KEYS, first, rangeLabel, relDay, sportLabel, todayKey } from '@/lib/format'
import { price, smartPick } from '@/lib/logic'
import { useStore, useUser } from '@/store'
import { BellBtn, Chip, Html, Label, SectionHead, SportIcon, Topbar, Empty, Stagger, item } from '@/components/ui'
import { motion } from 'framer-motion'
import { LiveCard, TurfCard } from '@/components/cards'
import { TurfArt } from '@/components/TurfArt'

type Sort = 'reco' | 'price' | 'rating' | 'deal'

export function Discover() {
  const s = useStore(); const u = useUser()!
  const [q, setQ] = useState(''); const [sport, setSport] = useState<Sport | 'all'>('all'); const [sort, setSort] = useState<Sort>('reco'); const [city, setCity] = useState('')
  useEffect(() => { const id = setInterval(() => useStore.getState().tickLive(), 2200); return () => clearInterval(id) }, [])
  const turfs = useMemo(() => {
    const ql = q.toLowerCase()
    const list = s.turfs.filter(t => t.active && (sport === 'all' || t.sport === sport) && (!city || t.city === city) && (!ql || `${t.name} ${t.area} ${t.city} ${sportLabel(t.sport)}`.toLowerCase().includes(ql)))
    const tk = todayKey()
    const sorters: Record<Sort, (a: typeof list[0], b: typeof list[0]) => number> = {
      reco: (a, b) => Number(b.city === u.city) - Number(a.city === u.city) || b.rating - a.rating,
      price: (a, b) => price(s, a, tk, a.open, u.id).final - price(s, b, tk, b.open, u.id).final,
      rating: (a, b) => b.rating - a.rating,
      deal: (a, b) => (b.offer?.pct ?? 0) - (a.offer?.pct ?? 0),
    }
    return list.sort(sorters[sort])
  }, [s, u, q, sport, sort, city])
  const pick = useMemo(() => smartPick(s, u), [s, u])
  const nextTurf = pick.next ? s.turfs.find(t => t.id === pick.next!.turfId) : undefined
  return (
    <>
      <Topbar eyebrow={<>Hey, {first(u.name)} 👋</>} title={<span className="gradient-text">Find your next game</span>} actions={<BellBtn />} />
      <div className="search"><Search className="ico" /><input className="input" placeholder="Search turfs, areas, sports…" value={q} onChange={e => setQ(e.target.value)} /></div>
      <div className="grid2 section" style={{ marginTop: 14 }}>
        <Link className="quick" to="/assistant"><span className="q-ico"><Sparkles className="ico" /></span><div style={{ flex: 1, minWidth: 0 }}><div className="h3">Smart assistant</div><div className="xs muted ellipsis">Slots, deals & picks — on-device</div></div><ChevronRight className="ico sm" /></Link>
        <Link className="quick" to="/leaderboard"><span className="q-ico amber"><Trophy className="ico" /></span><div style={{ flex: 1, minWidth: 0 }}><div className="h3">Leaderboard</div><div className="xs muted ellipsis">Top players & your rank</div></div><ChevronRight className="ico sm" /></Link>
      </div>
      {pick.next && nextTurf && <Link className="card row section" to="/bookings" style={{ gap: 12, borderColor: 'var(--line-2)' }}><div className="thumb" style={{ width: 48, height: 48 }}><TurfArt turf={nextTurf} /></div><div style={{ flex: 1, minWidth: 0 }}><div className="xs accent" style={{ fontWeight: 700, letterSpacing: '.08em' }}>NEXT GAME · {relDay(pick.next.date).toUpperCase()}</div><div className="small ellipsis" style={{ fontWeight: 600 }}>{nextTurf.name}</div><div className="xs muted">{rangeLabel(pick.next.hour, pick.next.duration)} · code {pick.next.code}</div></div><ChevronRight className="ico sm" /></Link>}
      <section className="section"><SectionHead label={<><span className="live-dot" />Live near you</>} right={<span className="xs dim">updates every few seconds</span>} /><div className="rail">{s.live.map(l => <LiveCard key={l.id} live={l} />)}</div></section>
      <section className="section card glow"><Label className="accent" style={{ marginBottom: 8 }}><Sparkles className="ico sm" /> Smart pick for you</Label><p className="small" style={{ lineHeight: 1.6 }}><Html html={pick.text} /></p>{pick.best && <Link className="btn ghost sm" to={`/turf/${pick.best.id}`} style={{ marginTop: 12 }}>View {first(pick.best.name)} <ArrowRight className="ico xs" /></Link>}</section>
      <section className="section"><Label style={{ marginBottom: 10 }}>Sports</Label><div className="chips"><Chip on={sport === 'all'} onClick={() => setSport('all')}><LayoutGrid className="ico sm" /> All</Chip>{SPORT_KEYS.map(k => <Chip key={k} on={sport === k} onClick={() => setSport(k)}><SportIcon sport={k} /> {sportLabel(k)}</Chip>)}</div></section>
      <section className="section">
        <SectionHead label={`${turfs.length} turfs`} right={<div className="row" style={{ gap: 8 }}><select className="input" style={{ height: 36, width: 'auto', padding: '0 34px 0 12px', fontSize: 13 }} value={city} onChange={e => setCity(e.target.value)}><option value="">All cities</option><option>Bangalore</option><option>Mumbai</option></select><select className="input" style={{ height: 36, width: 'auto', padding: '0 34px 0 12px', fontSize: 13 }} value={sort} onChange={e => setSort(e.target.value as Sort)}><option value="reco">Recommended</option><option value="price">Price: low to high</option><option value="rating">Top rated</option><option value="deal">Biggest discount</option></select></div>} />
        <Stagger className="turf-grid" key={`${sport}-${city}-${sort}-${q}`}>{turfs.length ? turfs.map(t => <motion.div key={t.id} variants={item}><TurfCard turf={t} /></motion.div>) : <Empty icon={Search} title="No turfs match" sub="Try a different sport, city or search term." />}</Stagger>
      </section>
    </>
  )
}
