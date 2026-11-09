import { useState } from 'react'
import { Trophy } from 'lucide-react'
import type { Sport } from '@/types'
import { SPORTS, SPORT_KEYS, byTimeDesc, first, hourLabel, relDay, todayKey, uid } from '@/lib/format'
import { career, outcome } from '@/lib/logic'
import { useStore, useUI, useUser, toast } from '@/store'
import { SheetHead } from '@/components/ui'

export function LogScoreSheet({ bookingId }: { bookingId?: string }) {
  const s = useStore(); const u = useUser()!; const close = useUI(x => x.closeSheet)
  const cands = s.bookings.filter(b => b.userId === u.id && b.status === 'completed' && !s.results.some(r => r.bookingId === b.id)).sort(byTimeDesc).slice(0, 20)
  const opps = s.users.filter(x => x.role === 'player' && x.id !== u.id)
  const [bk, setBk] = useState(bookingId ?? cands[0]?.id ?? '')
  const [sport, setSport] = useState<Sport>('cricket'); const [date, setDate] = useState(todayKey())
  const [teamA, setTeamA] = useState(`${first(u.name)}'s XI`); const [teamB, setTeamB] = useState(''); const [sa, setSa] = useState(''); const [sb, setSb] = useState(''); const [opp, setOpp] = useState('')
  const submit = (e: React.FormEvent) => {
    e.preventDefault(); const b = s.bookings.find(x => x.id === bk)
    const r = { id: uid('r'), userId: u.id, bookingId: b?.id ?? null, turfId: b?.turfId ?? null, sport: b?.sport ?? sport, date: b?.date ?? date, teamA: teamA.trim() || 'My team', teamB: teamB.trim() || 'Opponents', scoreA: +sa || 0, scoreB: +sb || 0, opponentId: opp || null }
    s.addResult(r); const o = outcome(r); const c = career({ ...s, results: [...s.results, r] }, u.id)
    close(); toast(`${o === 'W' ? 'Win logged! +100 XP' : o === 'D' ? 'Draw logged · +60 XP' : 'Logged · +60 XP'} — rating now ${c.rating}`)
  }
  return (
    <>
      <SheetHead title="Log a score" sub="Builds your rating, XP, badges and rivalries" />
      <form className="stack" onSubmit={submit}>
        <div className="field"><label>Match</label><select className="input" value={bk} onChange={e => setBk(e.target.value)}>{cands.map(b => <option key={b.id} value={b.id}>{relDay(b.date)} · {s.turfs.find(t => t.id === b.turfId)?.name} · {hourLabel(b.hour)}</option>)}<option value="">Other (not booked on TurfHub)</option></select></div>
        {!bk && <div className="grid2"><div className="field"><label>Sport</label><select className="input" value={sport} onChange={e => setSport(e.target.value as Sport)}>{SPORT_KEYS.map(k => <option key={k} value={k}>{SPORTS[k]}</option>)}</select></div><div className="field"><label>Date</label><input className="input" type="date" value={date} max={todayKey()} onChange={e => setDate(e.target.value)} /></div></div>}
        <div className="grid2"><div className="field"><label>Your team</label><input className="input" value={teamA} onChange={e => setTeamA(e.target.value)} /></div><div className="field"><label>Opponent team</label><input className="input" placeholder="Rivals FC" required value={teamB} onChange={e => setTeamB(e.target.value)} /></div></div>
        <div className="grid2"><div className="field"><label>Your score</label><input className="input" type="number" min={0} required inputMode="numeric" value={sa} onChange={e => setSa(e.target.value)} /></div><div className="field"><label>Their score</label><input className="input" type="number" min={0} required inputMode="numeric" value={sb} onChange={e => setSb(e.target.value)} /></div></div>
        <div className="field"><label>Rival player (optional)</label><select className="input" value={opp} onChange={e => setOpp(e.target.value)}><option value="">—</option>{opps.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
        <button className="btn primary block" type="submit"><Trophy className="ico sm" /> Save result</button>
      </form>
    </>
  )
}
