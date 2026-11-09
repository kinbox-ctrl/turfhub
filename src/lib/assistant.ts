import type { DataState, Sport, User } from '@/types'
import { INR, SPORTS, SPORT_KEYS, addDays, dk, first, hourLabel, relDay, sportLabel, todayKey } from '@/lib/format'
import { canStart, career, leaderboard, price, smartPick, tier } from '@/lib/logic'

export interface Reply { text: string; turfs?: string[]; actions?: Array<{ label: string; to: string }> }
const esc = (s: string) => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string))

export function assistantReply(s: DataState, u: User, q: string): Reply {
  const low = q.toLowerCase(); const city = u.city; const turfs = s.turfs.filter(t => t.active)
  const sport = SPORT_KEYS.find(k => low.includes(k) || low.includes(SPORTS[k].toLowerCase()) || (k === 'tt' && low.includes('table tennis')) || (k === 'football' && low.includes('soccer'))) as Sport | undefined
  const inCity = turfs.filter(t => t.city === city); const pool = sport ? inCity.filter(t => t.sport === sport) : inCity
  const when = low.includes('tomorrow') ? dk(addDays(new Date(), 1)) : todayKey()
  const hm = low.match(/(\d{1,2})\s*(am|pm)/)
  const hour = hm ? (parseInt(hm[1]) % 12) + (hm[2] === 'pm' ? 12 : 0) : /tonight|evening|night/.test(low) ? 20 : /morning/.test(low) ? 7 : /afternoon/.test(low) ? 15 : null
  const tr = tier(u.pts)
  const sportWord = sport ? sportLabel(sport).toLowerCase() + ' ' : ''

  if (/point|loyalty|reward|tier/.test(low)) return { text: `You have <b>${u.pts} points</b> (${tr.name} tier). 1 pt = ₹1 off, redeemable up to 20% of any booking; every booking earns 5% back and reviews earn 20 pts. ${tr.next ? `${tr.next - u.pts} more to reach ${tier(tr.next).name}.` : 'You are at the top tier!'}`, actions: [{ label: 'View rewards', to: '/profile' }] }
  if (/my (next|upcoming)|next (game|booking|match)|my booking|when.*(play|book)/.test(low)) { const nb = smartPick(s, u).next; return nb ? { text: `Your next game is <b>${esc(s.turfs.find(t => t.id === nb.turfId)?.name ?? '')}</b> on ${relDay(nb.date)} at ${hourLabel(nb.hour)} (${nb.duration}h). Check-in code <b>${nb.code}</b>.`, turfs: [nb.turfId], actions: [{ label: 'My bookings', to: '/bookings' }] } : { text: 'You have no upcoming bookings. Ask me for the cheapest slot tonight and I will find one.', actions: [{ label: 'Browse turfs', to: '/discover' }] } }
  if (/cancel|refund|policy/.test(low)) return { text: 'Cancellation policy: <b>100% refund</b> 24h+ before, <b>50%</b> up to 2h before, non-refundable after that. Cancel from the booking card in My Bookings.', actions: [{ label: 'My bookings', to: '/bookings' }] }
  if (/rank|leaderboard|rating|stats|career|form/.test(low)) { const c = career(s, u.id); const rank = leaderboard(s).findIndex(x => x.u.id === u.id) + 1; return { text: c.m ? `You're rated <b>${c.rating}</b>, ranked #${rank} with ${c.w}W ${c.l}L ${c.d}D (${c.winRate}% win rate). Streak: ${c.streak}. Level ${c.level}.` : 'No rated matches yet — log a score from a completed booking and I will rate you.', actions: [{ label: 'Career', to: '/career' }, { label: 'Leaderboard', to: '/leaderboard' }] } }
  if (/match|team|player|join|host/.test(low) && !/book/.test(low)) { const ms = s.matches.filter(m => m.players.length < m.needed && (!sport || m.sport === sport) && !m.players.includes(u.id)).slice(0, 3); return { text: ms.length ? `${ms.length} open ${sportWord}matches need players: ${ms.map(m => `<b>${esc(s.turfs.find(t => t.id === m.turfId)?.name ?? '')}</b> (${relDay(m.date)} ${hourLabel(m.hour)}, ${m.players.length}/${m.needed}, ${INR(m.fee)})`).join('; ')}.` : 'No open matches right now — host one and players nearby will see it.', actions: [{ label: 'Open matches', to: '/matches' }] } }
  if (/deal|offer|discount|cheap|afford|budget|save|value/.test(low)) {
    let list = pool.filter(t => t.offer).sort((a, b) => b.offer!.pct - a.offer!.pct)
    if (/cheap|afford|budget/.test(low)) list = [...pool].sort((a, b) => price(s, a, when, hour ?? 20, u.id).final - price(s, b, when, hour ?? 20, u.id).final)
    list = list.slice(0, 3)
    return { text: list.length ? `Best ${sportWord}value in ${city}${hour != null ? ` around ${hourLabel(hour)}` : ''}:` : `No ${sportWord}offers in ${city} right now, but here's what's nearby:`, turfs: (list.length ? list : pool.slice(0, 3)).map(t => t.id) }
  }
  if (/free|available|slot|book|tonight|tomorrow|morning|evening|afternoon|play/.test(low) || sport) {
    const hh = hour ?? 20
    const avail = pool.filter(t => canStart(s, t, when, hh, 1)).map(t => ({ t, p: price(s, t, when, hh, u.id) })).sort((a, b) => a.p.final - b.p.final).slice(0, 3)
    return avail.length ? { text: `${avail.length} ${sportWord}turf${avail.length > 1 ? 's have' : ' has'} ${hourLabel(hh)} free ${when === todayKey() ? 'today' : 'tomorrow'}. Cheapest is <b>${esc(avail[0].t.name)}</b> at ${INR(avail[0].p.final)}/hr:`, turfs: avail.map(x => x.t.id) } : { text: `Everything's taken at ${hourLabel(hh)} ${when === todayKey() ? 'today' : 'tomorrow'}. Try another hour, or tomorrow.`, turfs: pool.slice(0, 2).map(t => t.id) }
  }
  if (/recommend|suggest|for me|pick|where should|best/.test(low)) { const p = smartPick(s, u); return { text: p.text, turfs: p.best ? [p.best.id] : [] } }
  if (/^(hi|hello|hey|yo)\b/.test(low)) return { text: `Hey ${esc(first(u.name))}! Try “cheapest cricket tonight”, “deals near me”, “when's my next booking?” or “my rank”.` }
  return { text: `I can help with turfs, free slots, offers, bookings, points and your stats. Top-rated spots in ${city} right now:`, turfs: [...inCity].sort((a, b) => b.rating - a.rating).slice(0, 3).map(t => t.id) }
}
