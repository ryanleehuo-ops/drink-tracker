import { format, isToday, isYesterday, isSameWeek } from 'date-fns'
const DRINK_EMOJI = { beer: '🍺', wine: '🍷', cocktail: '🍸', shot: '🥃' }
const DRINK_COLOR = { beer: '#d4a017', wine: '#8b2252', cocktail: '#2980b9', shot: '#c0392b' }
function groupByDay(drinks) {
  const groups = {}
  ;[...drinks].reverse().forEach(d => {
    const key = format(new Date(d.timestamp), 'yyyy-MM-dd')
    if (!groups[key]) groups[key] = { date: new Date(d.timestamp), items: [] }
    groups[key].items.push(d)
  })
  return Object.values(groups)
}
function dayLabel(date) {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  if (isSameWeek(date, new Date())) return format(date, 'EEEE')
  return format(date, 'EEEE, MMM d')
}
export default function HistoryScreen({ drinks, deleteDrink }) {
  const groups = groupByDay(drinks)
  if (!drinks.length) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, color: 'var(--text3)' }}>
      <span style={{ fontSize: 48 }}>📋</span>
      <p style={{ fontSize: 16 }}>No drinks logged yet</p>
    </div>
  )
  return (
    <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 28 }} className="fade-up">
      {groups.map(group => (
        <div key={format(group.date, 'yyyy-MM-dd')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{dayLabel(group.date)}</span>
            <span style={{ background: 'var(--bg3)', borderRadius: 99, padding: '2px 10px', fontSize: 12, color: 'var(--text3)' }}>{group.items.length} drink{group.items.length !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {group.items.map(drink => (
              <div key={drink.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderLeft: `3px solid ${DRINK_COLOR[drink.type]}`, borderRadius: 'var(--radius-sm)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{DRINK_EMOJI[drink.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', textTransform: 'capitalize' }}>{drink.type}</div>
                  {drink.description && <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drink.description}</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>{format(new Date(drink.timestamp), 'h:mm a')}</span>
                  <button onClick={() => deleteDrink(drink.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 14, padding: '2px 4px' }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
