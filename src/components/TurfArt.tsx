import { memo, useId } from 'react'
import type { Sport, Turf } from '@/types'
import { rng } from '@/data/seed'

const W = 320, H = 180
const L = 'stroke="rgba(255,255,255,.82)" stroke-width="2" fill="none"'
const hash = (s: string) => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h }

function dots(seed: number, n: number, colors: string[], box: [number, number, number, number]) {
  const r = rng(seed); let out = ''
  for (let i = 0; i < n; i++) { const x = box[0] + r() * box[2], y = box[1] + r() * box[3]; const c = colors[i % colors.length]; out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.2" fill="${c}" stroke="rgba(0,0,0,.35)" stroke-width="1"/><ellipse cx="${(x + 3).toFixed(1)}" cy="${(y + 5).toFixed(1)}" rx="4" ry="1.6" fill="rgba(0,0,0,.25)"/>` }
  return out
}

function body(sport: Sport, id: string, seed: number) {
  const grad = (a: string, b: string) => `<linearGradient id="f${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`
  const base = (a: string, b: string) => `<rect width="${W}" height="${H}" fill="url(#f${id})"/>`
  const stripes = (n: number, tone = .05) => Array.from({ length: n }, (_, i) => i % 2 ? '' : `<rect x="${(i * W) / n}" y="0" width="${W / n}" height="${H}" fill="rgba(255,255,255,${tone})"/>`).join('')
  switch (sport) {
    case 'football':
      return grad('#3a9a52', '#15602f') + base('', '') + stripes(10) +
        `<rect x="20" y="16" width="280" height="148" ${L}/><line x1="160" y1="16" x2="160" y2="164" ${L}/><circle cx="160" cy="90" r="26" ${L}/><circle cx="160" cy="90" r="2.5" fill="#fff"/><rect x="20" y="52" width="44" height="76" ${L}/><rect x="256" y="52" width="44" height="76" ${L}/><rect x="20" y="72" width="16" height="36" ${L}/><rect x="284" y="72" width="16" height="36" ${L}/><path d="M64 70 A26 26 0 0 1 64 110" ${L}/><path d="M256 70 A26 26 0 0 0 256 110" ${L}/>` +
        dots(seed, 5, ['#ff5d6c'], [40, 30, 110, 120]) + dots(seed + 1, 5, ['#6aa9ff'], [170, 30, 110, 120]) + `<circle cx="150" cy="96" r="3" fill="#fff"/>`
    case 'cricket':
      return grad('#2f9148', '#0f4d27') + base('', '') + `<g transform="translate(160 90)">${Array.from({ length: 10 }, (_, i) => `<path d="M0 0 L${Math.cos((i * Math.PI) / 5) * 170} ${Math.sin((i * Math.PI) / 5) * 90} A170 90 0 0 1 ${Math.cos(((i + 1) * Math.PI) / 5) * 170} ${Math.sin(((i + 1) * Math.PI) / 5) * 90}Z" fill="rgba(255,255,255,${i % 2 ? .045 : 0})"/>`).join('')}</g>` +
        `<ellipse cx="160" cy="90" rx="150" ry="78" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2"/><ellipse cx="160" cy="90" rx="92" ry="48" fill="none" stroke="rgba(255,255,255,.3)" stroke-dasharray="6 6"/><rect x="104" y="78" width="112" height="24" rx="2" fill="#cdaa6c"/><rect x="104" y="78" width="112" height="24" rx="2" fill="url(#s${id})"/><line x1="118" y1="78" x2="118" y2="102" stroke="#fff" stroke-width="1.5"/><line x1="202" y1="78" x2="202" y2="102" stroke="#fff" stroke-width="1.5"/><rect x="116" y="86" width="4" height="8" fill="#fff"/><rect x="200" y="86" width="4" height="8" fill="#fff"/>` +
        dots(seed, 7, ['#ffffff'], [30, 25, 260, 130]) + `<circle cx="124" cy="90" r="4.2" fill="#ffd166" stroke="rgba(0,0,0,.35)"/><circle cx="196" cy="90" r="4.2" fill="#ffd166" stroke="rgba(0,0,0,.35)"/>`
    case 'badminton':
      return grad('#1f7682', '#0c3b43') + base('', '') + `<rect x="40" y="20" width="240" height="140" fill="#2e9647"/><rect x="40" y="20" width="240" height="140" fill="url(#s${id})"/><rect x="40" y="20" width="240" height="140" ${L}/><line x1="160" y1="20" x2="160" y2="160" stroke="#fff" stroke-width="3"/><line x1="40" y1="34" x2="280" y2="34" ${L}/><line x1="40" y1="146" x2="280" y2="146" ${L}/><line x1="112" y1="20" x2="112" y2="160" ${L}/><line x1="208" y1="20" x2="208" y2="160" ${L}/><line x1="40" y1="90" x2="112" y2="90" ${L}/><line x1="208" y1="90" x2="280" y2="90" ${L}/>` +
        dots(seed, 2, ['#ff5d6c'], [55, 40, 50, 100]) + dots(seed + 2, 2, ['#6aa9ff'], [215, 40, 50, 100]) + `<circle cx="170" cy="70" r="2.5" fill="#fff"/>`
    case 'tt':
      return grad('#2a3140', '#131720') + base('', '') + `<rect x="60" y="40" width="200" height="100" rx="3" fill="#1f5fd1"/><rect x="60" y="40" width="200" height="100" rx="3" fill="url(#s${id})"/><rect x="60" y="40" width="200" height="100" rx="3" ${L}/><line x1="60" y1="90" x2="260" y2="90" ${L}/><rect x="156" y="30" width="8" height="120" fill="#e5e7eb" opacity=".9"/><rect x="66" y="146" width="188" height="6" fill="rgba(0,0,0,.4)"/>` +
        `<circle cx="40" cy="92" r="5" fill="#ff5d6c" stroke="rgba(0,0,0,.35)"/><circle cx="280" cy="88" r="5" fill="#6aa9ff" stroke="rgba(0,0,0,.35)"/><circle cx="130" cy="75" r="2.2" fill="#fff"/>`
    case 'tennis':
      return grad('#c0623a', '#7a3a1d') + base('', '') + `<rect x="30" y="20" width="260" height="140" fill="url(#s${id})"/><rect x="30" y="20" width="260" height="140" ${L}/><rect x="30" y="40" width="260" height="100" ${L}/><line x1="160" y1="20" x2="160" y2="160" stroke="#fff" stroke-width="3"/><line x1="90" y1="40" x2="90" y2="140" ${L}/><line x1="230" y1="40" x2="230" y2="140" ${L}/><line x1="90" y1="90" x2="230" y2="90" ${L}/>` +
        dots(seed, 1, ['#ff5d6c'], [45, 50, 40, 80]) + dots(seed + 3, 1, ['#6aa9ff'], [240, 50, 40, 80]) + `<circle cx="120" cy="60" r="2.5" fill="#d9ff6a"/>`
    default:
      return grad('#b97a3f', '#6e421f') + base('', '') + Array.from({ length: 16 }, (_, i) => `<rect x="${i * 20}" y="0" width="10" height="${H}" fill="rgba(0,0,0,${i % 2 ? .05 : .08})"/>`).join('') + `<rect width="${W}" height="${H}" fill="url(#s${id})"/><rect x="20" y="16" width="280" height="148" ${L}/><line x1="160" y1="16" x2="160" y2="164" ${L}/><circle cx="160" cy="90" r="22" ${L}/><rect x="20" y="60" width="60" height="60" ${L}/><rect x="240" y="60" width="60" height="60" ${L}/><path d="M20 40 Q110 90 20 140" ${L}/><path d="M300 40 Q210 90 300 140" ${L}/>` +
        dots(seed, 3, ['#ff5d6c'], [40, 40, 100, 100]) + dots(seed + 4, 3, ['#6aa9ff'], [180, 40, 100, 100]) + `<circle cx="165" cy="100" r="3" fill="#ffb547"/>`
  }
}

export const TurfArt = memo(function TurfArt({ turf, still }: { turf: Pick<Turf, 'sport'> & { id?: string }; still?: boolean }) {
  const id = useId().replace(/:/g, '')
  const seed = hash(turf.id ?? turf.sport)
  const defs = `<defs>
    <linearGradient id="s${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
    <linearGradient id="beam${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <radialGradient id="spot${id}" cx="50%" cy="48%" r="55%"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <radialGradient id="v${id}" cx="50%" cy="50%" r="78%"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
    <linearGradient id="sky${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
    <filter id="g${id}" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.2"/></filter>
    ${still ? '' : `<filter id="n${id}"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .07 0"/></filter>`}
  </defs>`
  const inner = `${defs}${body(turf.sport, id, seed)}
    <polygon points="0,0 70,0 190,${H} 40,${H}" fill="url(#beam${id})" filter="url(#g${id})"/>
    <polygon points="${W},0 ${W - 70},0 ${W - 190},${H} ${W - 40},${H}" fill="url(#beam${id})" filter="url(#g${id})"/>
    <rect width="${W}" height="${H}" fill="url(#spot${id})"/>
    <rect width="${W}" height="${H * .4}" fill="url(#sky${id})"/>
    ${still ? '' : `<rect width="${W}" height="${H}" filter="url(#n${id})" opacity=".9"/>`}
    <rect width="${W}" height="${H}" fill="url(#v${id})"/>
    <circle cx="36" cy="4" r="6" fill="#fff" opacity=".9" filter="url(#g${id})"/><circle cx="${W - 36}" cy="4" r="6" fill="#fff" opacity=".9" filter="url(#g${id})"/>`
  return <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden dangerouslySetInnerHTML={{ __html: inner }} />
})
