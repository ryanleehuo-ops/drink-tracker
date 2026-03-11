import { useState, useEffect } from 'react'
import LogScreen from './components/LogScreen.jsx'
import WeekScreen from './components/WeekScreen.jsx'
import HistoryScreen from './components/HistoryScreen.jsx'
import SettingsScreen from './components/SettingsScreen.jsx'
import ReportsScreen from './components/ReportsScreen.jsx'

const NAV = [
  { id: 'log', label: 'Log', icon: '🥂' },
  { id: 'week', label: 'This Week', icon: '📊' },
  { id: 'history', label: 'History', icon: '📅' },
  { id: 'reports', label: 'Reports', icon: '📈' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

const TARGET = new Date('2035-02-15T00:00:00')

function getDaysLeft() {
  const now = new Date()
  const diff = TARGET - now
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function useLocalStorage(key, defaultVal) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : defaultVal } catch { return defaultVal }
  })
  const save = (v) => { setVal(v); localStorage.setItem(key, JSON.stringify(v)) }
  return [val, save]
}

export default function App() {
  const [tab, setTab] = useState('log')
  const [drinks, setDrinks] = useLocalStorage('sip_drinks', [])
  const [settings, setSettings] = useLocalStorage('sip_settings', { weeklyLimit: 14 })
  const [daysLeft, setDaysLeft] = useState(getDaysLeft())

  useEffect(() => {
    const timer = setInterval(() => setDaysLeft(getDaysLeft()), 60000)
    return () => clearInterval(timer)
  }, [])

  const addDrink = (drink) => setDrinks([...drinks, { id: Date.now(), ...drink, timestamp: new Date().toISOString() }])
  const deleteDrink = (id) => setDrinks(drinks.filter(d => d.id !== id))

  const screens = { log: LogScreen, week: WeekScreen, history: HistoryScreen, reports: ReportsScreen, settings: SettingsScreen }
  const Screen = screens[tab]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <header style={{
        padding: '12px 20px 10px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        {/* Countdown */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            fontWeight: 900,
            color: 'var(--gold)',
            lineHeight: 1,
          }}>{daysLeft.toLocaleString()}</span>
          <span style={{
            fontSize: 11,
            color: 'var(--text3)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            lineHeight: 1,
          }}>days left so drink responsibly</span>
        </div>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Screen drinks={drinks} settings={settings} setSettings={setSettings} addDrink={addDrink} deleteDrink={deleteDrink} />
      </main>

      <nav style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderTop: '1px solid var(--border)', background: 'var(--bg2)', flexShrink: 0, height: 'var(--nav-height)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, border: 'none', background: 'none', cursor: 'pointer', padding: '8px 4px', color: tab === n.id ? 'var(--gold)' : 'var(--text3)', transition: 'color 0.2s', position: 'relative' }}>
            {tab === n.id && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 32, height: 2, background: 'var(--gold)', borderRadius: '0 0 2px 2px' }} />}
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 500 }}>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}