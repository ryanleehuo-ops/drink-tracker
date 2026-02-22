import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
const DRINK_EMOJI = { beer: '🍺', wine: '🍷', cocktail: '🍸', shot: '🥃' }
const DRINK_COLOR = { beer: '#d4a017', wine: '#8b2252', cocktail: '#2980b9', shot: '#c0392b' }
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
export default function WeekScreen({ drinks, settings }) {
  const now = new Date()
  const weekStart = startOfWeek(now)
  const dailyData = DAYS.map((day, i) => {
    const date = addDays(weekStart, i)
    const count = drinks.filter(d => isSameDay(new Date(d.timestamp), date)).length
    return { day, count, isToday: isSameDay(date, now) }
  })
  const weekCount = dailyData.reduce((sum, d) => sum + d.count, 0)
  const pct = Math.min((weekCount / settings.weeklyLimit) * 100, 100)
  const barColor = pct >= 90 ? '#c0392b' : pct >= 65 ? '#e07b20' : '#d4a017'
  const typeCounts = {}
  drinks.filter(d => new Date(d.timestamp) >= weekStart).forEach(d => { typeCounts[d.type] = (typeCounts[d.type] || 0) + 1 })
  return (
    <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }} className="fade-up">
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Week of {format(weekStart, 'MMM d')}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 900, lineHeight: 1, color: barColor }}>{weekCount}</div>
        <div style={{ fontSize: 15, color: 'var(--text2)', marginTop: 4 }}>of {settings.weeklyLimit} drinks</div>
        <div style={{ background: 'var(--bg3)', borderRadius: 99, height: 8, overflow: 'hidden', marginTop: 20 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 99, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ marginTop: 10, fontSize: 14, color: 'var(--text2)' }}>
          {pct >= 100 ? '🚨 Limit reached — take it easy!' : pct >= 65 ? `⚠️ ${settings.weeklyLimit - weekCount} left — slow down` : `✅ ${settings.weeklyLimit - weekCount} drinks remaining`}
        </div>
      </div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px 20px 10px' }}>
        <div style={{ fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>Daily Breakdown</div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={dailyData} barCategoryGap="30%">
            <XAxis dataKey="day" tick={{ fill: 'var(--text3)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <ReferenceLine y={Math.ceil(settings.weeklyLimit / 7)} stroke="var(--border)" strokeDasharray="4 4" />
            <Bar dataKey="count" radius={[6,6,0,0]}>
              {dailyData.map((entry, i) => <Cell key={i} fill={entry.isToday ? '#d4a017' : entry.count > 0 ? '#5a4820' : '#1f1b10'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {Object.keys(typeCounts).length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px' }}>
          <div style={{ fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>By Type</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(typeCounts).sort((a,b) => b[1]-a[1]).map(([type, count]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22, width: 28, textAlign: 'center' }}>{DRINK_EMOJI[type]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 14, color: 'var(--text)', textTransform: 'capitalize' }}>{type}</span>
                    <span style={{ fontSize: 14, color: 'var(--text2)' }}>{count}</span>
                  </div>
                  <div style={{ background: 'var(--bg3)', borderRadius: 99, height: 4 }}>
                    <div style={{ width: `${(count/weekCount)*100}%`, height: '100%', background: DRINK_COLOR[type], borderRadius: 99 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {weekCount === 0 && <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '20px', fontSize: 15 }}>No drinks logged this week 🌿</div>}
    </div>
  )
}
