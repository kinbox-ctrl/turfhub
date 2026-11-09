import { useState } from 'react'
import { todayKey, uid } from '@/lib/format'
import { useStore, useUI, useUser, toast } from '@/store'
import { SheetHead } from '@/components/ui'

export function RateSheet({ turfId }: { turfId: string }) {
  const s = useStore(); const u = useUser()!; const close = useUI(x => x.closeSheet); const t = s.turfs.find(x => x.id === turfId)
  const [stars, setStars] = useState(5); const [text, setText] = useState('')
  if (!t) return null
  return (
    <>
      <SheetHead title="Rate your experience" sub={t.name} />
      <div className="row" style={{ justifyContent: 'center', gap: 6, margin: '10px 0 18px' }}>
        {[1, 2, 3, 4, 5].map(n => <button key={n} onClick={() => setStars(n)} style={{ fontSize: 36, color: 'var(--amber)', opacity: n <= stars ? 1 : 0.25, transition: 'opacity .15s' }} aria-label={`${n} stars`}>★</button>)}
      </div>
      <form className="stack" onSubmit={e => { e.preventDefault(); const body = text.trim() || 'Great session!'; s.addReview({ id: uid('rv'), turfId: t.id, userId: u.id, name: u.name, stars, text: body, date: todayKey() }); s.notify(t.ownerId, 'review', `${stars}★ review from ${u.name}`, `${t.name} · “${body.slice(0, 60)}”`); close(); toast('Thanks! +20 pts for reviewing') }}>
        <textarea className="input" rows={3} style={{ height: 'auto', padding: '12px 16px' }} placeholder="What stood out? Lights, surface, staff…" value={text} onChange={e => setText(e.target.value)} />
        <button className="btn primary block" type="submit">Submit review</button>
      </form>
    </>
  )
}
