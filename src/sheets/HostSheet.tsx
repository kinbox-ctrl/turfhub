import { useState } from 'react'
import { Users } from 'lucide-react'
import type { Level } from '@/types'
import { addDays, dk, hourLabel, sportLabel, todayKey, uid } from '@/lib/format'
import { useStore, useUI, useUser, toast } from '@/store'
import { Seg, SheetHead } from '@/components/ui'

export function HostSheet() {
  const s = useStore(); const u = useUser()!; const close = useUI(x => x.closeSheet)
  const turfs = [...s.turfs.filter(t => t.active)].sort((a, b) => Number(b.city === u.city) - Number(a.city === u.city))
  const [turfId, setTurfId] = useState(turfs[0]?.id ?? ''); const [date, setDate] = useState(dk(addDays(new Date(), 1))); const [hour, setHour] = useState(19); const [dur, setDur] = useState(1)
  const [needed, setNeeded] = useState(10); const [fee, setFee] = useState(150); const [level, setLevel] = useState<Level>('Casual'); const [note, setNote] = useState('')
  return (
    <>
      <SheetHead title="Host a match" sub="Players nearby can find and join it" />
      <form className="stack" onSubmit={e => { e.preventDefault(); const t = s.turfs.find(x => x.id === turfId); if (!t) return; s.hostMatch({ id: uid('m'), turfId, hostId: u.id, sport: t.sport, date: date || todayKey(), hour, duration: dur, needed: Math.max(2, needed), players: [u.id], level, fee: Math.max(0, fee), note: note.trim() }); close(); toast('Match published — players can join now') }}>
        <div className="field"><label>Turf</label><select className="input" value={turfId} onChange={e => setTurfId(e.target.value)}>{turfs.map(t => <option key={t.id} value={t.id}>{t.name} · {sportLabel(t.sport)} · {t.city}</option>)}</select></div>
        <div className="grid2"><div className="field"><label>Date</label><input className="input" type="date" min={todayKey()} value={date} onChange={e => setDate(e.target.value)} /></div><div className="field"><label>Start</label><select className="input" value={hour} onChange={e => setHour(+e.target.value)}>{Array.from({ length: 18 }, (_, i) => i + 6).map(h => <option key={h} value={h}>{hourLabel(h)}</option>)}</select></div></div>
        <div className="grid3"><div className="field"><label>Hours</label><select className="input" value={dur} onChange={e => setDur(+e.target.value)}><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option></select></div><div className="field"><label>Players</label><input className="input" type="number" min={2} max={30} value={needed} onChange={e => setNeeded(+e.target.value)} /></div><div className="field"><label>₹ / player</label><input className="input" type="number" min={0} step={10} value={fee} onChange={e => setFee(+e.target.value)} /></div></div>
        <div className="field"><label>Level</label><Seg value={level} onChange={setLevel} options={[{ v: 'Casual', label: 'Casual' }, { v: 'Intermediate', label: 'Intermediate' }, { v: 'Advanced', label: 'Advanced' }]} /></div>
        <div className="field"><label>Note</label><input className="input" placeholder="5v5 under the lights, keeper needed…" value={note} onChange={e => setNote(e.target.value)} /></div>
        <button className="btn primary block" type="submit"><Users className="ico sm" /> Publish match</button>
      </form>
    </>
  )
}
