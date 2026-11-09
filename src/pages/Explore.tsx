import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LayoutGrid, MapPin, Star } from 'lucide-react'
import clsx from 'clsx'
import type { Sport, Turf } from '@/types'
import { INR, SPORT_KEYS, hourLabel, sportLabel, todayKey } from '@/lib/format'
import { canStart, price, slotsLeft } from '@/lib/logic'
import { useStore, useUser } from '@/store'
import { BellBtn, Chip, Empty, SportIcon, Tag, Topbar } from '@/components/ui'
import { TurfArt } from '@/components/TurfArt'

function FitBounds({ turfs }: { turfs: Turf[] }) {
  const map = useMap()
  useEffect(() => { if (!turfs.length) return; const b = L.latLngBounds(turfs.map(t => [t.lat, t.lng] as [number, number])); map.fitBounds(b.pad(0.25), { animate: true, maxZoom: 13 }) }, [map, turfs.map(t => t.id).join(',')]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}
function FlyTo({ turf }: { turf?: Turf }) { const map = useMap(); useEffect(() => { if (turf) map.flyTo([turf.lat, turf.lng], Math.max(map.getZoom(), 13), { duration: .6 }) }, [map, turf]); return null }

export function Explore() {
  const s = useStore(); const u = useUser()!; const nav = useNavigate(); const [sp] = useSearchParams()
  const [sport, setSport] = useState<Sport | ''>((sp.get('sport') as Sport) || ''); const [city, setCity] = useState(sp.get('city') || u.city || ''); const [at, setAt] = useState<number | ''>(''); const [hot, setHot] = useState<string | undefined>(); const [fly, setFly] = useState<Turf | undefined>()
  const theme = s.settings.theme; const tk = todayKey()
  const list = useMemo(() => s.turfs.filter(t => t.active && (!sport || t.sport === sport) && (!city || t.city === city) && (at === '' || canStart(s, t, tk, at, 1))).map(t => ({ t, p: price(s, t, tk, at === '' ? t.open : at, u.id), left: slotsLeft(s, t, tk) })).sort((a, b) => a.p.final - b.p.final), [s, sport, city, at, tk, u.id])
  const turfs = list.map(x => x.t)
  const icon = (x: typeof list[0]) => L.divIcon({ className: '', iconSize: [0, 0], iconAnchor: [0, 0], html: `<span class="pin ${hot === x.t.id ? 'hot' : ''} ${x.left === 0 ? 'off' : ''}">${INR(x.p.final)}</span>` })
  const hours = Array.from({ length: 18 }, (_, i) => i + 6)
  return (
    <>
      <Topbar eyebrow={`${turfs.length} venues${city ? ` in ${city}` : ''}`} title="Explore the map" actions={<BellBtn />} />
      <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <select className="input" style={{ height: 38, width: 'auto', padding: '0 34px 0 12px', fontSize: 13 }} value={city} onChange={e => setCity(e.target.value)}><option value="">All cities</option><option>Bangalore</option><option>Mumbai</option></select>
        <select className="input" style={{ height: 38, width: 'auto', padding: '0 34px 0 12px', fontSize: 13 }} value={at} onChange={e => setAt(e.target.value === '' ? '' : +e.target.value)}><option value="">Any time today</option>{hours.map(h => <option key={h} value={h}>Free at {hourLabel(h)}</option>)}</select>
      </div>
      <div className="chips" style={{ marginBottom: 14 }}><Chip on={sport === ''} onClick={() => setSport('')}><LayoutGrid className="ico sm" /> All</Chip>{SPORT_KEYS.map(k => <Chip key={k} on={sport === k} onClick={() => setSport(k)}><SportIcon sport={k} /> {sportLabel(k)}</Chip>)}</div>
      <div className="explore">
        <div className="map">
          <MapContainer center={[12.9716, 77.5946]} zoom={12} scrollWheelZoom zoomControl={false}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" className={theme === 'light' ? '' : 'tiles-dark'} />
            <FitBounds turfs={turfs} /><FlyTo turf={fly} />
            {list.map(x => <Marker key={x.t.id} position={[x.t.lat, x.t.lng]} icon={icon(x)} eventHandlers={{ click: () => nav(`/turf/${x.t.id}`), mouseover: () => setHot(x.t.id), mouseout: () => setHot(undefined) }} />)}
          </MapContainer>
        </div>
        <div className="explore-list">
          {list.length ? list.map(x => (
            <button key={x.t.id} className={clsx('explore-item', hot === x.t.id && 'hot')} onMouseEnter={() => { setHot(x.t.id) }} onMouseLeave={() => setHot(undefined)} onClick={() => { setFly(x.t); setHot(x.t.id) }} onDoubleClick={() => nav(`/turf/${x.t.id}`)}>
              <div className="thumb"><TurfArt turf={x.t} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row between"><Tag>{sportLabel(x.t.sport)}</Tag><span className="rating"><Star className="ico xs" />{x.t.rating}</span></div>
                <div className="h3 ellipsis" style={{ marginTop: 6 }}>{x.t.name}</div>
                <div className="meta"><MapPin className="ico xs" />{x.t.area} · {hourLabel(x.t.open)}–{hourLabel(x.t.close)}</div>
                <div className="row between" style={{ marginTop: 6 }}><span className="price" style={{ fontSize: 17 }}>{x.p.pct > 0 && <span className="strike">{INR(x.p.base)}</span>}{INR(x.p.final)}<small>/hr{at !== '' ? ` at ${hourLabel(at)}` : ''}</small></span><span className={clsx('xs', x.left === 0 ? 'red' : x.left < 4 ? 'amber' : 'accent')} style={{ fontWeight: 600 }}>{x.left === 0 ? 'Full today' : `${x.left} free today`}</span></div>
                <div className="row" style={{ gap: 8, marginTop: 10 }}><span className="btn primary xs" onClick={e => { e.stopPropagation(); nav(`/turf/${x.t.id}`) }}>View & book</span>{x.t.offer && <span className="xs amber">{x.t.offer.label}</span>}</div>
              </div>
            </button>
          )) : <Empty icon={MapPin} title="Nothing matches" sub="Try a different sport, city or time." />}
        </div>
      </div>
    </>
  )
}
