import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Send, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { first } from '@/lib/format'
import { assistantReply } from '@/lib/assistant'
import { useStore, useUI, useUser } from '@/store'
import { Chip, Html, Topbar } from '@/components/ui'
import { TurfMini } from '@/components/cards'

const CHIPS = ['Cheapest cricket tonight', 'Best deals near me', "When's my next booking?", 'Suggest a turf for me', 'My rank', 'Open matches']

export function Assistant() {
  const s = useStore(); const u = useUser()!; const chat = useUI(x => x.chat); const setChat = useUI(x => x.setChat)
  const [typing, setTyping] = useState(false); const [input, setInput] = useState('')
  const msgs = chat ?? [{ who: 'bot' as const, text: `Hi ${first(u.name)}! I know every turf, slot, offer and your booking history. Ask me anything — I run on-device, nothing leaves your phone.` }]
  useEffect(() => { window.scrollTo(0, document.body.scrollHeight) }, [msgs.length, typing])
  const ask = (text: string) => {
    const next = [...msgs, { who: 'me' as const, text }]; setChat(next); setTyping(true)
    setTimeout(() => { setTyping(false); setChat([...next, { who: 'bot' as const, ...assistantReply(useStore.getState(), u, text) }]) }, 550 + Math.random() * 400)
  }
  return (
    <>
      <Topbar title="Smart assistant" back actions={<button className="icon-btn" title="Clear chat" onClick={() => setChat(null)}><Trash2 className="ico" /></button>} />
      <div className="chat">
        {msgs.map((m, i) => <div key={i} className={clsx('msg', m.who)}>{m.who === 'bot' ? <Html html={m.text} /> : m.text}{m.turfs?.map(id => { const t = s.turfs.find(x => x.id === id); return t ? <TurfMini key={id} turf={t} /> : null })}{m.actions && <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>{m.actions.map(a => <Link key={a.to} className="btn ghost xs" to={a.to}>{a.label}</Link>)}</div>}</div>)}
        {typing && <div className="msg bot typing"><i /><i /><i /></div>}
      </div>
      <div className="composer"><div className="inner" style={{ flexDirection: 'column', gap: 8 }}>
        <div className="chips" style={{ margin: 0, padding: 0 }}>{CHIPS.map(c => <Chip key={c} onClick={() => ask(c)}>{c}</Chip>)}</div>
        <form className="row" style={{ width: '100%' }} onSubmit={e => { e.preventDefault(); const v = input.trim(); if (!v) return; setInput(''); ask(v) }}><input className="input" placeholder="Ask about turfs, slots, deals…" autoComplete="off" style={{ flex: 1 }} value={input} onChange={e => setInput(e.target.value)} /><button className="btn primary" style={{ width: 50, padding: 0, flexShrink: 0 }} aria-label="Send"><Send className="ico" /></button></form>
      </div></div>
    </>
  )
}
