import { useState } from 'react'

const DRINK_TYPES = [
  { id: 'beer', label: 'Beer', emoji: '🍺', color: '#d4a017' },
  { id: 'wine', label: 'Wine', emoji: '🍷', color: '#8b2252' },
  { id: 'cocktail', label: 'Cocktail', emoji: '🍸', color: '#2980b9' },
  { id: 'shot', label: 'Shot', emoji: '🥃', color: '#c0392b' },
]

function getStatusMessage(remaining, limit) {
  const over = -remaining // how many over limit

  if (remaining > 3)  return { text: `${remaining} drinks remaining`, color: 'var(--text2)' }
  if (remaining === 3) return { text: `${remaining} drinks remaining — careful now`, color: 'var(--text2)' }
  if (remaining === 2) return { text: `${remaining} drinks remaining — good place to stop if you ask me`, color: 'var(--text2)' }
  if (remaining === 1) return { text: `${remaining} drink remaining — cutting it close I see...`, color: 'var(--amber)' }
  if (remaining === 0) return { text: `⚠️ Limit reached — you realize ${limit} isn't a goal`, color: 'var(--red)' }
  if (over === 1)      return { text: `${over} over limit — not a good look, was it neccessary?`, color: 'var(--red)' }
  if (over === 2)      return { text: `${over} over limit — what's your therapist going to say?`, color: 'var(--red)' }
  if (over === 3)      return { text: `${over} over limit — don't think this is helping you meet your future wife`, color: 'var(--red)' }
  if (over === 4)      return { text: `${over} over limit — FUCKING STOP!`, color: 'var(--red)' }
  return               { text: `${over} over limit — you're going to die young and alone`, color: 'var(--red)' }
}

export default function LogScreen({ addDrink, drinks, settings }) {
  const [selected, setSelected] = useState(null)
  const [description, setDescription] = useState('')
  const [logged, setLogged] = useState(false)

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  weekStart.setHours(0, 0, 0, 0)

  const weekCount = drinks.filter(d => new Date(d.timestamp) >= weekStart).length
  const remaining = settings.weeklyLimit - weekCount
  const pct = Math.min((weekCount / settings.weeklyLimit) * 100, 100)
  const barColor = pct >= 90 ? 'var(--red)' : pct >= 65 ? 'var(--amber)' : 'var(--gold)'
  const status = getStatusMessage(remaining, settings.weeklyLimit)

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
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>
            {weekCount}<span style={{ fontSize: 15, color: 'var(--text2)', marginLeft: 4 }}>/ {settings.weeklyLimit}</span>
          </span>
        </div>
        <div style={{ background: 'var(--bg3)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 99, transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: status.color }}>
          {status.text}
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