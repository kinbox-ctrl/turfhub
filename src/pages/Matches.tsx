import { useState } from 'react'
import { LayoutGrid, MapPin, Plus, Users } from 'lucide-react'
import type { Sport } from '@/types'
import { SPORT_KEYS, byTimeAsc, sportLabel, todayKey } from '@/lib/format'
import { useStore, useUser, openSheet } from '@/store'
import { Chip, Empty, Label, SectionHead, SportIcon, Topbar } from '@/components/ui'
import { MatchCard } from '@/components/cards'
import { HostSheet } from '@/sheets/HostSheet'

export function Matches() {
  const s = useStore(); const u = useUser()!; const [sport, setSport] = useState<Sport | 'all'>('all'); const [near, setNear] = useState(true)
  const nowH = new Date().getHours()
  const upcoming = s.matches.filter(m => s.turfs.some(t => t.id === m.turfId) && (m.date > todayKey() || (m.date === todayKey() && m.hour + m.duration > nowH)))
  const list = upcoming.filter(m => (sport === 'all' || m.sport === sport) && (!near || s.turfs.find(t => t.id === m.turfId)?.city === u.city)).sort(byTimeAsc)
  const mine = upcoming.filter(m => m.players.includes(u.id)).sort(byTimeAsc)
  const host = <button className="btn primary sm" onClick={() => openSheet(<HostSheet />)}><Plus className="ico sm" /> Host</button>
  return (
    <>
      <Topbar eyebrow="Find teammates & join a game" title="Open matches" actions={host} />
      <div className="chips"><Chip on={sport === 'all'} onClick={() => setSport('all')}><LayoutGrid className="ico sm" /> All</Chip>{SPORT_KEYS.map(k => <Chip key={k} on={sport === k} onClick={() => setSport(k)}><SportIcon sport={k} /> {sportLabel(k)}</Chip>)}<Chip on={near} onClick={() => setNear(v => !v)}><MapPin className="ico sm" /> Near me</Chip></div>
      {mine.length > 0 && <section className="section"><Label style={{ marginBottom: 10 }}>Your games · {mine.length}</Label><div className="rail">{mine.map(m => <MatchCard key={m.id} m={m} compact />)}</div></section>}
      <section className="section"><SectionHead label={`${list.length} open`} right={<span className="xs dim">{near ? u.city : 'All cities'}</span>} />
        <div className="turf-grid">{list.length ? list.map(m => <MatchCard key={m.id} m={m} />) : <Empty icon={Users} title="No open matches" sub="Be the first — host a game and let players find you." cta={<button className="btn primary sm" onClick={() => openSheet(<HostSheet />)}>Host a match</button>} />}</div>
      </section>
    </>
  )
}
