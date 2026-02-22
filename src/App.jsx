import { useState } from 'react'
import LogScreen from './components/LogScreen.jsx'
import WeekScreen from './components/WeekScreen.jsx'
import HistoryScreen from './components/HistoryScreen.jsx'
import SettingsScreen from './components/SettingsScreen.jsx'

const NAV = [
  { id: 'log', label: 'Log', icon: '🥂' },
  { id: 'week', label: 'This Week', icon: '📊' },
  { id: 'history', label: 'History', icon: '📅' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

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

  const addDrink = (drink) => setDrinks([...drinks, { id: Date.now(), ...drink, timestamp: new Date().toISOString() }])
  const deleteDrink = (id) => setDrinks(drinks.filter(d => d.id !== id))

  const screens = { log: LogScreen, week: WeekScreen, history: HistoryScreen, settings: SettingsScreen }
  const Screen = screens[tab]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <header style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px', color: 'var(--gold)' }}>
          Sip<span style={{ color: 'var(--text2)' }}>Tracker</span>
        </div>
      </header>
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Screen drinks={drinks} settings={settings} setSettings={setSettings} addDrink={addDrink} deleteDrink={deleteDrink} />
      </main>
      <nav style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid var(--border)', background: 'var(--bg2)', flexShrink: 0, height: 'var(--nav-height)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, border: 'none', background: 'none', cursor: 'pointer', padding: '8px 4px', color: tab === n.id ? 'var(--gold)' : 'var(--text3)', transition: 'color 0.2s', position: 'relative' }}>
            {tab === n.id && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 32, height: 2, background: 'var(--gold)', borderRadius: '0 0 2px 2px' }} />}
            <span style={{ fontSize: 20 }}>{n.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 500 }}>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
