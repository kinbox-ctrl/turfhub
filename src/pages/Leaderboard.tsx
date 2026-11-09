import { useState } from 'react'
import { Trophy } from 'lucide-react'
import clsx from 'clsx'
import type { Sport } from '@/types'
import { SPORT_KEYS, first, sportLabel } from '@/lib/format'
import { leaderboard } from '@/lib/logic'
import { useStore, useUser } from '@/store'
import { Avatar, BellBtn, Chip, Empty, SportIcon, Topbar } from '@/components/ui'

export function Leaderboard() {
  const s = useStore(); const u = useUser()!; const [sport, setSport] = useState<Sport | ''>('')
  const rows = leaderboard(s, sport || undefined); const myIdx = rows.findIndex(x => x.u.id === u.id); const top = rows.slice(0, 3); const order = [top[1], top[0], top[2]]
  const Row = ({ x, n }: { x: typeof rows[0]; n: number }) => { const me = x.u.id === u.id; return <div className={clsx('leader-row', me && 'me')}><span className="rank">{n}</span><Avatar user={x.u} /><div style={{ flex: 1, minWidth: 0 }}><div className="small" style={{ fontWeight: 700 }}>{x.u.name}{me && <span className="accent"> (You)</span>}</div><div className="xs muted">{x.c.m} matches · {x.c.w}W {x.c.l}L · {x.c.winRate}% win{x.c.streak >= 2 ? ` · 🔥${x.c.streak}` : ''}</div></div><div style={{ textAlign: 'right' }}><div className="num accent" style={{ fontSize: 22 }}>{x.c.rating}</div><div className="xs dim">RATING</div></div></div> }
  return (
    <>
      <Topbar title="Leaderboard" back actions={<BellBtn />} />
      <div className="chips"><Chip on={sport === ''} onClick={() => setSport('')}><Trophy className="ico sm" /> All sports</Chip>{SPORT_KEYS.map(k => <Chip key={k} on={sport === k} onClick={() => setSport(k)}><SportIcon sport={k} /> {sportLabel(k)}</Chip>)}</div>
      {rows.length ? <>
        <div className="podium" style={{ marginTop: 18 }}>{order.map((x, i) => x ? <div key={x.u.id} className={clsx('pod', i === 1 && 'first', x.u.id === u.id && 'me')}>{i === 1 && <div style={{ fontSize: 22, marginBottom: 4 }}>👑</div>}<Avatar user={x.u} size={i === 1 ? 'lg' : ''} /><div className="small ellipsis" style={{ fontWeight: 700 }}>{first(x.u.name)}</div><div className="num accent" style={{ fontSize: 26 }}>{x.c.rating}</div><div className="xs muted">#{i === 1 ? 1 : i === 0 ? 2 : 3} · {x.c.w}W</div></div> : <div key={i} />)}</div>
        <div className="stack s8">{rows.slice(3, 10).map((x, i) => <Row key={x.u.id} x={x} n={i + 4} />)}{myIdx >= 10 && <><div className="xs dim" style={{ textAlign: 'center' }}>···</div><Row x={rows[myIdx]} n={myIdx + 1} /></>}</div>
        <p className="xs dim" style={{ textAlign: 'center', marginTop: 16 }}>Rating = win rate × matches played × current streak. Log scores to climb.</p>
      </> : <Empty icon={Trophy} title="No ranked players yet" sub="Log a match score to appear here." />}
    </>
  )
}
