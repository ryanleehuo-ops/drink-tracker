import { useState } from 'react'
const DRINK_TYPES = [
  { id: 'beer', label: 'Beer', emoji: '🍺', color: '#d4a017' },
  { id: 'wine', label: 'Wine', emoji: '🍷', color: '#8b2252' },
  { id: 'cocktail', label: 'Cocktail', emoji: '🍸', color: '#2980b9' },
  { id: 'shot', label: 'Shot', emoji: '🥃', color: '#c0392b' },
]
export default function LogScreen({ addDrink, drinks, settings }) {
  const [selected, setSelected] = useState(null)
  const [description, setDescription] = useState('')
  const [logged, setLogged] = useState(false)
  const now = new Date()
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0,0,0,0)
  const weekCount = drinks.filter(d => new Date(d.timestamp) >= weekStart).length
  const remaining = settings.weeklyLimit - weekCount
  const pct = Math.min((weekCount / settings.weeklyLimit) * 100, 100)
  const barColor = pct >= 90 ? 'var(--red)' : pct >= 65 ? 'var(--amber)' : 'var(--gold)'
  const handleLog = () => {
    if (!selected) return
    addDrink({ type: selected, description: description.trim() })
    setLogged(true)
    setTimeout(() => { setSelected(null); setDescription(''); setLogged(false) }, 1400)
  }
  return (
    <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 28 }} className="fade-up">
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--text2)' }}>This Week</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>{weekCount}<span style={{ fontSize: 15, color: 'var(--text2)', marginLeft: 4 }}>/ {settings.weeklyLimit}</span></span>
        </div>
        <div style={{ background: 'var(--bg3)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 99, transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: remaining <= 0 ? 'var(--red)' : 'var(--text2)' }}>
          {remaining <= 0 ? '⚠️ Weekly limit reached' : `${remaining} drink${remaining !== 1 ? 's' : ''} remaining`}
        </div>
      </div>
      <div>
        <p style={{ fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>What are you having?</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {DRINK_TYPES.map(drink => (
            <button key={drink.id} onClick={() => setSelected(drink.id)} style={{ background: selected === drink.id ? `${drink.color}22` : 'var(--card)', border: `2px solid ${selected === drink.id ? drink.color : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '20px 16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.18s ease', transform: selected === drink.id ? 'scale(0.97)' : 'scale(1)' }}>
              <span style={{ fontSize: 36 }}>{drink.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: selected === drink.id ? drink.color : 'var(--text2)', fontFamily: 'var(--font-body)' }}>{drink.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p style={{ fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Note (optional)</p>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. IPA at The Crown, birthday toast..." maxLength={80} style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', color: 'var(--text)', fontSize: 15, fontFamily: 'var(--font-body)', outline: 'none' }} />
      </div>
      <button onClick={handleLog} disabled={!selected || logged} style={{ width: '100%', padding: '17px', borderRadius: 'var(--radius)', border: 'none', background: logged ? 'var(--green)' : selected ? 'linear-gradient(135deg, var(--gold), var(--amber))' : 'var(--bg3)', color: selected || logged ? '#111' : 'var(--text3)', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, cursor: selected && !logged ? 'pointer' : 'default', transition: 'all 0.25s ease' }}>
        {logged ? '✓ Logged!' : 'Log Drink'}
      </button>
    </div>
  )
}
