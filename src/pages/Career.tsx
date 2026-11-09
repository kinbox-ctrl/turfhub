import { Flame, Lock, Moon, Plus, RefreshCw, Share2, Sun, Target, Zap, type LucideIcon } from 'lucide-react'
import clsx from 'clsx'
import type { Sport } from '@/types'
import { INR, dateLabel, shareText, sportLabel } from '@/lib/format'
import { badges, career, leaderboard, outcome, type BadgeIcon } from '@/lib/logic'
import { useStore, useUser, openSheet, toast } from '@/store'
import { Bar, FormPill, Label, SectionHead, SportIcon, Stat, Topbar, Avatar } from '@/components/ui'
import { GroupedBars, Ring } from '@/components/charts'
import { LogScoreSheet } from '@/sheets/LogScoreSheet'

const BADGE_ICONS: Record<BadgeIcon, LucideIcon> = { zap: Zap, flame: Flame, refresh: RefreshCw, sun: Sun, moon: Moon, target: Target }

export function Career() {
  const s = useStore(); const u = useUser()!; const c = career(s, u.id); const lb = leaderboard(s); const rank = lb.findIndex(x => x.u.id === u.id) + 1; const bs = badges(c)
  const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i)); const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; const rs = c.rs.filter(r => r.date.startsWith(key)); return { label: d.toLocaleDateString('en-IN', { month: 'short' }), vals: [rs.length, rs.filter(r => outcome(r) === 'W').length] } })
  const mix: Partial<Record<Sport, number>> = {}; c.bookings.forEach(b => (mix[b.sport] = (mix[b.sport] ?? 0) + 1)); const mixArr = (Object.entries(mix) as [Sport, number][]).sort((a, b) => b[1] - a[1]); const mixMax = Math.max(1, ...mixArr.map(x => x[1]))
  const favTurf = Object.entries(c.bookings.reduce<Record<string, number>>((a, b) => ((a[b.turfId] = (a[b.turfId] ?? 0) + 1), a), {})).sort((a, b) => b[1] - a[1])[0]
  const riv: Record<string, { w: number; l: number; d: number }> = {}; c.rs.forEach(r => { if (!r.opponentId) return; riv[r.opponentId] ??= { w: 0, l: 0, d: 0 }; riv[r.opponentId][outcome(r).toLowerCase() as 'w' | 'l' | 'd']++ })
  const rivals = Object.entries(riv).sort((a, b) => b[1].w + b[1].l + b[1].d - (a[1].w + a[1].l + a[1].d)).slice(0, 3)
  return (
    <>
      <Topbar title="Career" back actions={<button className="btn primary sm" onClick={() => openSheet(<LogScoreSheet />)}><Plus className="ico sm" /> Log score</button>} />
      <div className="wide-grid">
        <div className="card glow row" style={{ gap: 18 }}>
          <div className="rating-ring"><Ring pct={c.rating} /><div className="c"><div><div className="num" style={{ fontSize: 38, lineHeight: 1 }}>{c.rating || '—'}</div><div className="xs muted">RATING</div></div></div></div>
          <div style={{ flex: 1 }}><Label>Performance</Label><div className="small" style={{ marginTop: 4 }}>{rank ? <>Ranked <b>#{rank}</b> of {lb.length} players</> : 'Unranked — log a score to get rated'}</div><div className="row" style={{ marginTop: 10, gap: 6 }}>{c.form.length ? c.form.map((f, i) => <FormPill key={i} r={f} />) : <span className="xs dim">No form yet</span>}<span className="xs muted" style={{ marginLeft: 4 }}>last 5</span></div>{c.streak > 0 && <div className="xs accent row" style={{ marginTop: 8, gap: 4 }}><Flame className="ico xs" /> {c.streak}-game win streak</div>}</div>
        </div>
        <div className="card">
          <div className="row between"><div className="h3">Level {c.level}</div><span className="small muted">{c.levelXp} / 400 XP</span></div><Bar pct={c.levelXp / 4} style={{ marginTop: 10 }} /><div className="xs dim" style={{ marginTop: 8 }}>+60 XP per match · +40 per win · +25 per booking</div>
          <Label style={{ margin: '16px 0 10px' }}>Badges · {bs.filter(b => b.ok).length}/{bs.length}</Label>
          <div className="row wrap" style={{ gap: 8 }}>{bs.map(b => { const Ico = b.ok ? BADGE_ICONS[b.ico] : Lock; return <span key={b.id} className={clsx('badge-chip', !b.ok && 'locked')} style={b.ok ? { color: b.color, borderColor: b.color, background: `color-mix(in srgb,${b.color} 12%,transparent)` } : undefined} title={b.desc}><Ico className="ico xs" />{b.name}</span> })}</div>
        </div>
        <section>
          <div className="grid3"><Stat v={c.m} k="Matches" center accent /><Stat v={c.w} k="Wins" center accent /><Stat v={`${c.winRate}%`} k="Win rate" center accent /><Stat v={c.best} k="Best score" center accent /><Stat v={c.streak} k="Win streak" center accent /><Stat v={c.avg} k="Avg score" center accent /></div>
          <Label style={{ margin: '18px 0 10px' }}>Activity</Label>
          <div className="grid2"><Stat v={c.bookings.length} k="Total bookings" center accent /><Stat v={`${c.hours}h`} k="Hours played" center accent /></div>
          <Stat v={INR(c.spend)} k="Total spend" center accent style={{ marginTop: 10 }} />
          <div className="grid2" style={{ marginTop: 10 }}><div className="stat"><div className="k" style={{ margin: '0 0 4px' }}>Favourite sport</div><div className="h3">{mixArr[0] ? sportLabel(mixArr[0][0]) : '—'}</div></div><div className="stat"><div className="k" style={{ margin: '0 0 4px' }}>Favourite turf</div><div className="h3 ellipsis">{favTurf ? s.turfs.find(t => t.id === favTurf[0])?.name ?? '—' : '—'}</div></div></div>
        </section>
        <section>
          <div className="card"><SectionHead label="Last 6 months" right={<div className="legend"><span><i style={{ background: 'var(--surface-3)' }} />Matches</span><span><i style={{ background: 'var(--accent)' }} />Wins</span></div>} /><GroupedBars groups={months} /></div>
          <div className="card" style={{ marginTop: 12 }}><Label style={{ marginBottom: 12 }}>Sports mix</Label><div className="stack">{mixArr.length ? mixArr.map(([sp, n]) => <div key={sp}><div className="row between small"><span className="row"><SportIcon sport={sp} />{sportLabel(sp)}</span><span className="muted">{n} · {Math.round((n / c.bookings.length) * 100)}%</span></div><Bar pct={(n / mixMax) * 100} style={{ marginTop: 6 }} /></div>) : <div className="small muted">No bookings yet</div>}</div></div>
        </section>
        <section className="span-2"><Label style={{ marginBottom: 10 }}>Rivalries ⚔️</Label>
          {rivals.length ? <div className="grid3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>{rivals.map(([id, r]) => { const o = s.users.find(x => x.id === id); return <div key={id} className="card tight row" style={{ gap: 10 }}><Avatar user={o} /><div style={{ flex: 1, minWidth: 0 }}><div className="small ellipsis" style={{ fontWeight: 600 }}>{o?.name ?? 'Unknown'}</div><div className="xs muted">{r.w + r.l + r.d} games</div></div><div className="num" style={{ fontSize: 18 }}><span className="accent">{r.w}</span>–<span className="red">{r.l}</span>{r.d > 0 && <>–<span className="amber">{r.d}</span></>}</div></div> })}</div> : <div className="card small muted">No head-to-heads yet. Pick a rival when you log a score and records build up here.</div>}
        </section>
        <section className="span-2"><Label style={{ marginBottom: 10 }}>Match history · {c.m}</Label>
          <div className="stack s8">{c.rs.length ? [...c.rs].reverse().map(r => { const t = s.turfs.find(x => x.id === r.turfId); const o = outcome(r); return <div key={r.id} className="list-item"><FormPill r={o} /><div style={{ flex: 1, minWidth: 0 }}><div className="xs accent" style={{ fontWeight: 700, letterSpacing: '.06em' }}>{sportLabel(r.sport).toUpperCase()} · {dateLabel(r.date)}</div><div className="small ellipsis">{r.teamA} vs {r.teamB}{t ? ` · ${t.name}` : ''}</div></div><span className="num" style={{ fontSize: 20 }}>{r.scoreA}–{r.scoreB}</span><button className="icon-btn" style={{ width: 36, height: 36 }} onClick={async () => { const res = await shareText(`${o === 'W' ? '🏆 Won' : o === 'L' ? 'Lost' : 'Drew'} ${r.scoreA}–${r.scoreB} · ${r.teamA} vs ${r.teamB}${t ? ` at ${t.name}` : ''} (${sportLabel(r.sport)}) — tracked on TurfHub`); if (res === 'copied') toast('Copied to clipboard') }}><Share2 className="ico sm" /></button></div> }) : <div className="card small muted">No matches logged yet.</div>}</div>
        </section>
      </div>
    </>
  )
}
