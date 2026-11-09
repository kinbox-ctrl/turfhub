import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ChevronRight, Clock, Flame, LayoutGrid, Sparkles, TrendingDown, TrendingUp, Trophy } from 'lucide-react'
import type { Booking, Sport } from '@/types'
import { INR, addDays, dateLabel, dk, first, hourLabel, hourShort, sportLabel, todayKey } from '@/lib/format'
import { occupancy } from '@/lib/logic'
import { useStore, useUser } from '@/store'
import { Avatar, Bar, BellBtn, Empty, Html, Label, SectionHead, Seg, SportIcon, StatusTag, Tag, Topbar, Sparkline, Reveal } from '@/components/ui'
import { AreaChart, Heatmap } from '@/components/charts'
import { TurfArt } from '@/components/TurfArt'

const paid = (b: Booking) => b.status === 'completed' || b.status === 'confirmed'
const delta = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : 0)

function Kpi({ k, v, d, sub, spark }: { k: string; v: string | number; d?: number; sub: string; spark?: number[] }) {
  return <div className="stat kpi">{spark && <Sparkline vals={spark} />}<div className="k" style={{ marginTop: 0 }}>{k}</div><div className="v" style={{ marginTop: 6 }}>{v}</div><div className="row between"><span className="xs dim">{sub}</span>{d != null && <span className={`d ${d >= 0 ? 'accent' : 'red'}`}>{d >= 0 ? <TrendingUp className="ico xs" /> : <TrendingDown className="ico xs" />}{d >= 0 ? '+' : ''}{d}%</span>}</div></div>
}

export function Dashboard() {
  const s = useStore(); const u = useUser()!; const [range, setRange] = useState<7 | 30 | 90>(30)
  const d = useMemo(() => {
    const myT = s.turfs.filter(t => t.ownerId === u.id); const ids = new Set(myT.map(t => t.id)); const all = s.bookings.filter(b => ids.has(b.turfId)); const tk = todayKey(); const nowH = new Date().getHours()
    const from = dk(addDays(new Date(), -range + 1)); const prevFrom = dk(addDays(new Date(), -2 * range + 1))
    const inR = all.filter(b => b.date >= from && b.date <= tk); const prev = all.filter(b => b.date >= prevFrom && b.date < from)
    const rev = inR.filter(paid).reduce((a, b) => a + b.amount, 0); const prevRev = prev.filter(paid).reduce((a, b) => a + b.amount, 0)
    const live = inR.filter(b => b.status !== 'cancelled'); const cnt = live.length; const prevCnt = prev.filter(b => b.status !== 'cancelled').length
    const occ = occupancy(s, myT, tk); const avgDur = cnt ? (live.reduce((a, b) => a + b.duration, 0) / cnt).toFixed(1) : '0'
    const todayB = all.filter(b => b.date === tk && b.status !== 'cancelled').sort((a, b) => a.hour - b.hour)
    const days = Array.from({ length: range }, (_, i) => dk(addDays(new Date(), -range + 1 + i))); const daily = days.map(day => all.filter(b => b.date === day && paid(b)).reduce((a, b) => a + b.amount, 0))
    const dailyCnt = days.map(day => all.filter(b => b.date === day && b.status !== 'cancelled').length)
    const bucket = Math.ceil(range / 14); const series: number[] = []; const cntSeries: number[] = []; const labels: string[] = []
    for (let i = 0; i < days.length; i += bucket) { series.push(daily.slice(i, i + bucket).reduce((a, b) => a + b, 0)); cntSeries.push(dailyCnt.slice(i, i + bucket).reduce((a, b) => a + b, 0)); labels.push(i % (bucket * 3) === 0 ? dateLabel(days[i], 'd MMM') : '') }
    const heat = Array.from({ length: 7 }, () => Array(18).fill(0) as number[])
    all.filter(b => b.date >= dk(addDays(new Date(), -29)) && b.date <= tk && b.status !== 'cancelled').forEach(b => { const wd = (new Date(b.date + 'T00:00:00').getDay() + 6) % 7; for (let k = 0; k < b.duration; k++) { const hh = b.hour + k - 6; if (hh >= 0 && hh < 18) heat[wd][hh]++ } })
    const hourTotals = Array(18).fill(0) as number[]; heat.forEach(r => r.forEach((v, i) => (hourTotals[i] += v))); const peakIdx = hourTotals.indexOf(Math.max(...hourTotals))
    const mix: Partial<Record<Sport, number>> = {}; live.forEach(b => (mix[b.sport] = (mix[b.sport] ?? 0) + 1)); const mixArr = (Object.entries(mix) as [Sport, number][]).sort((a, b) => b[1] - a[1]); const mixMax = Math.max(1, ...mixArr.map(x => x[1]))
    const perf = myT.map(t => { const bs = live.filter(b => b.turfId === t.id); return { t, n: bs.length, r: bs.filter(paid).reduce((a, b) => a + b.amount, 0), occ: Math.round((bs.reduce((a, b) => a + b.duration, 0) / ((t.close - t.open) * range)) * 100) } }).sort((a, b) => b.r - a.r)
    const reg: Record<string, { n: number; s: number; sports: Set<Sport>; name: string }> = {}
    inR.filter(paid).forEach(b => { reg[b.userId] ??= { n: 0, s: 0, sports: new Set(), name: b.userName }; reg[b.userId].n++; reg[b.userId].s += b.amount; reg[b.userId].sports.add(b.sport) })
    const regs = Object.entries(reg).sort((a, b) => b[1].s - a[1].s).slice(0, 5)
    const ins: string[] = []
    if (hourTotals[peakIdx]) ins.push(`<b>${hourLabel(peakIdx + 6)}</b> is your goldmine — ${hourTotals[peakIdx]} bookings in 30 days. Add premium pricing there; you're leaving money on the table.`)
    const threshold = Math.max(1, hourTotals[peakIdx] * 0.15); const dead = hourTotals.map((v, i) => ({ v, h: i + 6 })).filter(x => x.h >= 9 && x.h <= 17 && x.v <= threshold).map(x => x.h)
    if (dead.length) ins.push(`Dead slots at <b>${dead.slice(0, 4).map(hourShort).join(', ')}</b> average under ${Math.ceil(threshold / 4)} booking/week — push a 20% afternoon offer via WhatsApp to fill them.`)
    if (mixArr.length > 1) { const p = Math.round((mixArr[0][1] / (mixArr[0][1] + mixArr[1][1])) * 100); ins.push(`<b>${sportLabel(mixArr[0][0])} vs ${sportLabel(mixArr[1][0])}</b> is ${p}/${100 - p} — ${sportLabel(mixArr[1][0]).toLowerCase()} leagues are an untapped revenue stream.`) }
    const canc = Math.round((inR.filter(b => b.status === 'cancelled').length / Math.max(1, inR.length)) * 100); if (canc > 8) ins.push(`Cancellation rate is <b>${canc}%</b>. Consider a small deposit on peak slots.`)
    if (regs[0]) ins.push(`<b>${first(regs[0][1].name)}</b> has spent ${INR(regs[0][1].s)} across ${regs[0][1].n} bookings — a loyalty perk could lock them in.`)
    return { rev, prevRev, cnt, prevCnt, occ, avgDur, todayB, series, cntSeries, labels, heat, peakIdx, mixArr, mixMax, perf, regs, ins, nowH }
  }, [s, u, range])
  return (
    <>
      <Topbar eyebrow={<>Hi, {first(u.name)} 👋</>} title={<span className="gradient-text">Command center</span>} actions={<BellBtn />} />
      <Seg value={String(range)} onChange={v => setRange(+v as 7 | 30 | 90)} style={{ maxWidth: 300 }} options={[{ v: '7', label: '7 days' }, { v: '30', label: '30 days' }, { v: '90', label: '90 days' }]} />
      <div className="kpis" style={{ marginTop: 16 }}><Kpi k="Revenue" v={INR(d.rev)} d={delta(d.rev, d.prevRev)} sub={`last ${range}d`} spark={d.series} /><Kpi k="Bookings" v={d.cnt} d={delta(d.cnt, d.prevCnt)} sub={`${d.todayB.length} today`} spark={d.cntSeries} /><Kpi k="Occupancy" v={`${d.occ}%`} sub="today, all turfs" /><Kpi k="Avg duration" v={`${d.avgDur}h`} sub="per booking" /></div>
      <Reveal className="wide-grid" style={{ marginTop: 18 }} y={14}>
        <section className="card"><SectionHead label={<><TrendingUp className="ico sm" /> Revenue trend</>} right={<span className="xs dim">{INR(d.rev)} · {range}d</span>} /><AreaChart vals={d.series} labels={d.labels} fmt={INR} /></section>
        <section className="card"><SectionHead label={<><Clock className="ico sm" /> Today's schedule</>} right={<span className="xs dim">{d.todayB.length} bookings · {d.occ}% full</span>} />
          {d.todayB.length ? <div className="timeline scroll-col">{d.todayB.map(b => { const st = b.hour <= d.nowH && d.nowH < b.hour + b.duration ? 'now' : b.hour + b.duration <= d.nowH ? 'done' : ''; return <div key={b.id} className={`tl-item ${st}`}><div className="row between"><strong className="small">{hourLabel(b.hour)} – {hourLabel(b.hour + b.duration)}</strong>{st === 'now' ? <Tag tone="red"><span className="live-dot" style={{ background: '#fff' }} /> On turf</Tag> : <StatusTag status={b.status} />}</div><div className="xs muted">{s.turfs.find(t => t.id === b.turfId)?.name} · {b.userName} · {INR(b.amount)}</div></div> })}</div> : <Empty icon={Calendar} title="No bookings today" sub="Your turfs are open — share an offer to fill slots." />}
        </section>
        <section className="card glow span-2"><SectionHead label={<span className="accent row" style={{ gap: 8 }}><Sparkles className="ico sm" /> Insights</span>} right={<span className="xs dim">computed from your last {range} days</span>} /><ul className="stack s8 small" style={{ paddingLeft: 18, lineHeight: 1.55 }}>{d.ins.map((i, k) => <li key={k}><Html html={i} /></li>)}</ul></section>
        <section className="card span-2"><SectionHead label={<><Flame className="ico sm" /> Peak-hour heatmap</>} right={<span className="xs dim">last 30 days · peak {hourLabel(d.peakIdx + 6)}</span>} />
          <Heatmap grid={d.heat} rows={['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']} cols={Array.from({ length: 18 }, (_, i) => (i % 3 === 0 ? hourShort(i + 6) : ''))} hint={(r, c, v) => `${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][r]} ${hourLabel(c + 6)}: ${v} booking${v === 1 ? '' : 's'}`} />
        </section>
        <section className="card"><Label style={{ marginBottom: 12 }}>Sports mix</Label><div className="stack">{d.mixArr.length ? d.mixArr.map(([sp, n]) => <div key={sp}><div className="row between small"><span className="row"><SportIcon sport={sp} />{sportLabel(sp)}</span><span className="muted">{n} · {Math.round((n / d.cnt) * 100)}%</span></div><Bar pct={(n / d.mixMax) * 100} style={{ marginTop: 6 }} /></div>) : <div className="small muted">No bookings in range</div>}</div></section>
        <section className="card"><SectionHead label={<><Trophy className="ico sm" /> Top regulars</>} /><div className="stack s8">{d.regs.length ? d.regs.map(([id, r], i) => { const pu = s.users.find(x => x.id === id); return <div key={id} className="row"><span className="rank" style={{ fontSize: 15 }}>{i + 1}</span><Avatar user={pu ?? { name: r.name, color: '#666' }} size="sm" /><div style={{ flex: 1, minWidth: 0 }}><div className="small ellipsis" style={{ fontWeight: 600 }}>{r.name}</div><div className="xs muted">{r.n} bookings · {[...r.sports].map(sportLabel).join(', ')}</div></div><div className="small accent" style={{ fontWeight: 700 }}>{INR(r.s)}</div></div> }) : <div className="small muted">—</div>}</div></section>
        <section className="card span-2"><SectionHead label={<><LayoutGrid className="ico sm" /> Turf performance</>} right={<Link className="link" to="/turfs">Manage <ChevronRight className="ico xs" /></Link>} />
          <div className="stack s8">{d.perf.map(p => <Link key={p.t.id} className="row" to="/turfs" style={{ gap: 12 }}><div className="thumb" style={{ width: 46, height: 46 }}><TurfArt turf={p.t} /></div><div style={{ flex: 1, minWidth: 0 }}><div className="small ellipsis" style={{ fontWeight: 600 }}>{p.t.name}{!p.t.active && <> <Tag tone="grey">Paused</Tag></>}</div><div className="xs muted">{p.n} bookings · {p.occ}% occupancy</div></div><div style={{ textAlign: 'right' }}><div className="small" style={{ fontWeight: 700 }}>{INR(p.r)}</div><Bar pct={p.occ} style={{ width: 70, height: 5, marginTop: 4 }} /></div></Link>)}</div>
        </section>
      </Reveal>
    </>
  )
}
