import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear,
  format, subWeeks, eachWeekOfInterval, eachMonthOfInterval, addMonths,
  getMonth
} from 'date-fns'

const DRINK_COLORS = { beer: '#d4a017', wine: '#8b2252', cocktail: '#2980b9', shot: '#c0392b' }
const DRINK_TYPES = ['beer', 'wine', 'cocktail', 'shot']
const DRINK_EMOJI = { beer: '🍺', wine: '🍷', cocktail: '🍸', shot: '🥃' }
const VIEWS = [
  { id: '4week', label: '4 Weeks' },
  { id: 'month', label: 'Month' },
  { id: 'year', label: 'Year' },
  { id: 'alltime', label: 'All Time' },
]

function buildData(drinks, view, offsetMonth, offsetYear) {
  const now = new Date()

  if (view === '4week') {
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const start = subWeeks(weekStart, 3)
    const weeks = eachWeekOfInterval({ start, end: now }, { weekStartsOn: 1 })
    return weeks.map((ws, i) => {
      const we = endOfWeek(ws, { weekStartsOn: 1 })
      const wd = drinks.filter(d => { const t = new Date(d.timestamp); return t >= ws && t <= we })
      const entry = { label: format(ws, 'MMM d'), total: wd.length }
      DRINK_TYPES.forEach(t => { entry[t] = wd.filter(d => d.type === t).length })
      return entry
    })
  }

  if (view === 'month') {
    const base = addMonths(new Date(now.getFullYear(), now.getMonth(), 1), offsetMonth)
    const start = startOfMonth(base)
    const end = endOfMonth(base)
    const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 })
    return weeks.map((ws, i) => {
      const we = endOfWeek(ws, { weekStartsOn: 1 })
      const clampedStart = ws < start ? start : ws
      const clampedEnd = we > end ? end : we
      const wd = drinks.filter(d => { const t = new Date(d.timestamp); return t >= clampedStart && t <= clampedEnd })
      const entry = { label: `Week ${i + 1}`, total: wd.length }
      DRINK_TYPES.forEach(t => { entry[t] = wd.filter(d => d.type === t).length })
      return entry
    })
  }

  if (view === 'year') {
    const targetYear = now.getFullYear() + offsetYear
    const start = new Date(targetYear, 0, 1)
    const end = targetYear === now.getFullYear() ? now : new Date(targetYear, 11, 31)
    const months = eachMonthOfInterval({ start, end })
    return months.map((ms, i) => {
      const me = endOfMonth(ms)
      const wd = drinks.filter(d => { const t = new Date(d.timestamp); return t >= ms && t <= me })
      const entry = { label: format(ms, 'MMM'), total: wd.length }
      DRINK_TYPES.forEach(t => { entry[t] = wd.filter(d => d.type === t).length })
      return entry
    })
  }

  if (view === 'alltime') {
    if (!drinks.length) return []
    const sorted = [...drinks].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    const first = startOfMonth(new Date(sorted[0].timestamp))
    const months = eachMonthOfInterval({ start: first, end: now })
    return months.map((ms, i) => {
      const me = endOfMonth(ms)
      const wd = drinks.filter(d => { const t = new Date(d.timestamp); return t >= ms && t <= me })
      const entry = {
        label: format(ms, 'MMM yy'),
        total: wd.length,
        year: format(ms, 'yyyy'),
        isJan: getMonth(ms) === 0
      }
      DRINK_TYPES.forEach(t => { entry[t] = wd.filter(d => d.type === t).length })
      return entry
    })
  }

  return []
}

const CustomTooltip = ({ active, payload, label, settings, view }) => {
  if (!active || !payload?.length) return null
  const total = payload.reduce((sum, p) => sum + (p.value || 0), 0)
  const isMonthly = view === 'year' || view === 'alltime'
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', fontSize: 13 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, marginBottom: 8, color: 'var(--text)' }}>
        {isMonthly ? label : `Week of ${label}`}
      </div>
      {payload.filter(p => p.value > 0).map(p => (
        <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, color: DRINK_COLORS[p.dataKey], marginBottom: 3 }}>
          <span style={{ textTransform: 'capitalize' }}>{p.dataKey}</span>
          <span style={{ fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', color: total > settings.weeklyLimit ? 'var(--red)' : 'var(--text)' }}>
        <span>Total</span>
        <span style={{ fontWeight: 700 }}>{total}</span>
      </div>
    </div>
  )
}

const YearTick = ({ x, y, payload, data }) => {
  const entry = data.find(d => d.label === payload.value)
  if (!entry?.isJan) return null
  return (
    <text x={x} y={y + 14} fill="var(--text3)" fontSize={9} textAnchor="middle" fontFamily="DM Sans">
      {entry.year}
    </text>
  )
}

export default function ReportsScreen({ drinks, settings }) {
  const [view, setView] = useState('4week')
  const [offsetMonth, setOffsetMonth] = useState(0)
  const [offsetYear, setOffsetYear] = useState(0)

  const now = new Date()
  const data = buildData(drinks, view, offsetMonth, offsetYear)
  const currentMonthLabel = format(addMonths(new Date(now.getFullYear(), now.getMonth(), 1), offsetMonth), 'MMMM yyyy')
  const currentYearLabel = String(now.getFullYear() + offsetYear)

  if (!drinks.length) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, color: 'var(--text3)' }}>
      <span style={{ fontSize: 48 }}>📈</span>
      <p style={{ fontSize: 16 }}>No data yet</p>
      <p style={{ fontSize: 13 }}>Log some drinks to see your reports</p>
    </div>
  )

  const totalInView = data.reduce((sum, w) => sum + w.total, 0)
  const periods = data.length || 1
  const avgPerPeriod = (totalInView / periods).toFixed(1)
  const periodsOverLimit = data.filter(w => w.total > settings.weeklyLimit).length
  const best = data.reduce((b, w) => w.total < b.total ? w : b, data[0] || { total: 0 })
  const worst = data.reduce((b, w) => w.total > b.total ? w : b, data[0] || { total: 0 })

  const typeTotals = {}
  DRINK_TYPES.forEach(t => { typeTotals[t] = data.reduce((sum, w) => sum + (w[t] || 0), 0) })

  const isMonthly = view === 'year' || view === 'alltime'
  const showYearAxis = view === 'alltime'
  const tickInterval = view === 'alltime' && data.length > 12 ? Math.floor(data.length / 10) : 0
  const periodLabel = view === '4week' || view === 'month' ? 'week' : 'month'

  return (
    <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }} className="fade-up">

      {/* View selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => { setView(v.id); setOffsetMonth(0); setOffsetYear(0) }} style={{
            background: view === v.id ? 'var(--gold)' : 'var(--card)',
            color: view === v.id ? '#111' : 'var(--text2)',
            border: '1px solid',
            borderColor: view === v.id ? 'var(--gold)' : 'var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 4px', fontSize: 12, fontWeight: 600,
            fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.18s',
          }}>{v.label}</button>
        ))}
      </div>

      {/* Month navigator */}
      {view === 'month' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 16px' }}>
          <button onClick={() => setOffsetMonth(o => o - 1)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 22, cursor: 'pointer', padding: '0 8px' }}>‹</button>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text)' }}>{currentMonthLabel}</span>
          <button onClick={() => setOffsetMonth(o => Math.min(0, o + 1))} style={{ background: 'none', border: 'none', color: offsetMonth < 0 ? 'var(--gold)' : 'var(--text3)', fontSize: 22, cursor: offsetMonth < 0 ? 'pointer' : 'default', padding: '0 8px' }}>›</button>
        </div>
      )}

      {/* Year navigator */}
      {view === 'year' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 16px' }}>
          <button onClick={() => setOffsetYear(o => o - 1)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 22, cursor: 'pointer', padding: '0 8px' }}>‹</button>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text)' }}>{currentYearLabel}</span>
          <button onClick={() => setOffsetYear(o => Math.min(0, o + 1))} style={{ background: 'none', border: 'none', color: offsetYear < 0 ? 'var(--gold)' : 'var(--text3)', fontSize: 22, cursor: offsetYear < 0 ? 'pointer' : 'default', padding: '0 8px' }}>›</button>
        </div>
      )}

      {/* Chart */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 8px 12px' }}>
        <div style={{ fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16, paddingLeft: 12 }}>
          {isMonthly ? 'Monthly Drinks by Type' : 'Weekly Drinks by Type'}
        </div>
        <ResponsiveContainer width="100%" height={showYearAxis ? 240 : 220}>
          <BarChart data={data} barCategoryGap="20%">
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'DM Sans' }}
              axisLine={false}
              tickLine={false}
              interval={tickInterval}
            />
            {showYearAxis && (
              <XAxis
                xAxisId="year"
                dataKey="label"
                tick={<YearTick data={data} />}
                axisLine={false}
                tickLine={false}
                interval={0}
                height={24}
              />
            )}
            <YAxis
              tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'DM Sans' }}
              axisLine={false}
              tickLine={false}
              width={24}
            />
            <Tooltip content={<CustomTooltip settings={settings} view={view} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <ReferenceLine y={settings.weeklyLimit} stroke="var(--red)" strokeDasharray="4 4" strokeOpacity={0.4} />
            {DRINK_TYPES.map(type => (
              <Bar key={type} dataKey={type} stackId="a" fill={DRINK_COLORS[type]}
                radius={type === 'shot' ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          {DRINK_TYPES.map(type => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: DRINK_COLORS[type] }} />
              <span style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'capitalize' }}>{type}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 16, height: 2, background: 'var(--red)', opacity: 0.5 }} />
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>limit</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { label: `Avg / ${periodLabel}`, value: avgPerPeriod, sub: `limit: ${settings.weeklyLimit}`, color: avgPerPeriod > settings.weeklyLimit ? 'var(--red)' : 'var(--gold)' },
          { label: `${periodLabel}s over limit`, value: periodsOverLimit, sub: `of ${data.length}`, color: periodsOverLimit > 0 ? 'var(--red)' : 'var(--green)' },
          { label: `Lightest ${periodLabel}`, value: best.total, sub: best.label || '—', color: 'var(--green)' },
          { label: `Heaviest ${periodLabel}`, value: worst.total, sub: worst.label || '—', color: worst.total > settings.weeklyLimit ? 'var(--red)' : 'var(--amber)' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Type breakdown */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px' }}>
        <div style={{ fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>Breakdown</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DRINK_TYPES.filter(t => typeTotals[t] > 0).sort((a, b) => typeTotals[b] - typeTotals[a]).map(type => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20, width: 26, textAlign: 'center' }}>{DRINK_EMOJI[type]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: 'var(--text)', textTransform: 'capitalize' }}>{type}</span>
                  <span style={{ fontSize: 13, color: 'var(--text2)' }}>{typeTotals[type]} ({totalInView ? Math.round((typeTotals[type] / totalInView) * 100) : 0}%)</span>
                </div>
                <div style={{ background: 'var(--bg3)', borderRadius: 99, height: 4 }}>
                  <div style={{ width: `${totalInView ? (typeTotals[type] / totalInView) * 100 : 0}%`, height: '100%', background: DRINK_COLORS[type], borderRadius: 99 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}