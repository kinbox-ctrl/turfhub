import { useId } from 'react'

export function AreaChart({ vals, labels = [], w = 320, h = 110, fmt = (v: number) => String(v) }: { vals: number[]; labels?: string[]; w?: number; h?: number; fmt?: (v: number) => string }) {
  const gid = useId().replace(/:/g, '')
  const max = Math.max(1, ...vals); const n = Math.max(2, vals.length)
  const px = (i: number) => +(i * (w / (n - 1))).toFixed(1); const py = (v: number) => +(h - 10 - (v / max) * (h - 26)).toFixed(1)
  const pts = vals.map((v, i) => [px(i), py(v)] as const)
  const d = 'M' + pts.map(p => p.join(',')).join('L')
  return (
    <svg className="chart" viewBox={`0 0 ${w} ${h + 16}`}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" style={{ stopColor: 'var(--accent)', stopOpacity: 0.35 }} /><stop offset="1" style={{ stopColor: 'var(--accent)', stopOpacity: 0 }} /></linearGradient></defs>
      {[0.25, 0.5, 0.75].map(f => <line key={f} x1="0" x2={w} y1={py(max * f)} y2={py(max * f)} style={{ stroke: 'var(--line)', strokeDasharray: '3 4' }} />)}
      <path d={`${d}L${w},${h}L0,${h}Z`} fill={`url(#${gid})`} />
      <path d={d} fill="none" style={{ stroke: 'var(--accent)' }} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === n - 1 ? 4.5 : 3} style={{ fill: i === n - 1 ? 'var(--accent)' : 'var(--bg)', stroke: 'var(--accent)' }} strokeWidth="2"><title>{fmt(vals[i])}</title></circle>)}
      {labels.map((l, i) => l ? <text key={i} x={px(i)} y={h + 12} textAnchor="middle">{l}</text> : null)}
    </svg>
  )
}

export function GroupedBars({ groups, w = 320, h = 120 }: { groups: Array<{ label: string; vals: number[] }>; w?: number; h?: number }) {
  const max = Math.max(1, ...groups.flatMap(g => g.vals)); const gw = w / Math.max(1, groups.length); const bw = Math.min(16, gw / 3.2)
  return (
    <svg className="chart" viewBox={`0 0 ${w} ${h + 16}`}>
      {groups.map((g, i) => { const cx = i * gw + gw / 2; return (
        <g key={g.label + i}>
          {g.vals.map((v, j) => { const bh = (v / max) * (h - 14); const x = cx - bw - 2 + j * (bw + 4); return <rect key={j} x={x} y={h - bh} width={bw} height={bh} rx="4" style={{ fill: j === 0 ? 'var(--surface-3)' : 'var(--accent)' }}><title>{`${g.label}: ${v}`}</title></rect> })}
          <text x={cx} y={h + 12} textAnchor="middle">{g.label}</text>
        </g>
      ) })}
    </svg>
  )
}

export function Ring({ pct, size = 110, stroke = 9, color = 'var(--accent)' }: { pct: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2; const c = 2 * Math.PI * r
  return (
    <svg viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" style={{ stroke: 'var(--surface-3)' }} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" style={{ stroke: color }} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(100, Math.max(0, pct)) / 100)} className="ring-arc" />
    </svg>
  )
}

export function Heatmap({ grid, rows, cols, hint }: { grid: number[][]; rows: string[]; cols: string[]; hint: (r: number, c: number, v: number) => string }) {
  const max = Math.max(1, ...grid.flat())
  return (
    <div className="heat" style={{ gridTemplateColumns: `28px repeat(${cols.length},1fr)` }}>
      <span />
      {cols.map((c, i) => <span key={i} className="hl" style={{ justifyContent: 'center' }}>{c}</span>)}
      {grid.map((row, ri) => [
        <span key={`l${ri}`} className="hl">{rows[ri]}</span>,
        ...row.map((v, ci) => <span key={`${ri}-${ci}`} className="hc" title={hint(ri, ci, v)} style={{ background: `rgba(var(--accent-rgb),${v ? (0.12 + 0.85 * v / max).toFixed(2) : 0.04})` }} />),
      ])}
    </div>
  )
}
