import { useState } from 'react'
import type { Role } from '@/types'
import { uid } from '@/lib/format'
import { useStore, useUI, toast } from '@/store'
import { Seg, SheetHead } from '@/components/ui'

export function SignupSheet() {
  const signUp = useStore(s => s.signUp); const close = useUI(s => s.closeSheet)
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [phone, setPhone] = useState(''); const [city, setCity] = useState('Bangalore'); const [role, setRole] = useState<Role>('player')
  return (
    <>
      <SheetHead title="Create account" sub="Takes 10 seconds — demo, no verification" />
      <form className="stack" onSubmit={e => { e.preventDefault(); if (!name.trim() || !email.trim()) return; signUp({ id: uid('u'), name: name.trim(), email: email.trim(), phone: phone || '—', role, color: ['#5cc8ff', '#b18cff', '#ff8fa3', '#ffd166'][Date.now() % 4], pts: 100, favs: [], city, business: role === 'owner' ? `${name.trim()} Sports` : undefined }); close(); toast('Account created — 100 welcome points added 🎁') }}>
        <div className="field"><label>Full name</label><input className="input" required placeholder="Your name" value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="field"><label>Email</label><input className="input" type="email" required placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="field"><label>Phone</label><input className="input" placeholder="+91" value={phone} onChange={e => setPhone(e.target.value)} /></div>
        <div className="field"><label>City</label><select className="input" value={city} onChange={e => setCity(e.target.value)}><option>Bangalore</option><option>Mumbai</option></select></div>
        <div className="field"><label>I am a</label><Seg value={role} onChange={setRole} options={[{ v: 'player', label: 'Player' }, { v: 'owner', label: 'Turf owner' }]} /></div>
        <button className="btn primary block" type="submit">Create account</button>
      </form>
    </>
  )
}
