import { useState, useRef } from 'react'
const PRESETS = [7, 10, 14, 21]
export default function SettingsScreen({ settings, setSettings, drinks }) {
  const [saved, setSaved] = useState(false)
  const [localLimit, setLocalLimit] = useState(settings.weeklyLimit)
  const [imported, setImported] = useState(false)
  const fileRef = useRef(null)

  const handleSave = () => {
    setSettings({ ...settings, weeklyLimit: Number(localLimit) })
    setSaved(true); setTimeout(() => setSaved(false), 1500)
  }

  const handleClear = () => {
    if (window.confirm('Delete all drink history? This cannot be undone.')) {
      localStorage.removeItem('sip_drinks'); window.location.reload()
    }
  }

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      weeklyLimit: settings.weeklyLimit,
      drinks,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `siptracker-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!Array.isArray(data.drinks)) throw new Error('Invalid format')
        if (window.confirm(`Import ${data.drinks.length} drinks? This will merge with your existing data.`)) {
          const existing = JSON.parse(localStorage.getItem('sip_drinks') || '[]')
          const existingIds = new Set(existing.map(d => d.id))
          const merged = [...existing, ...data.drinks.filter(d => !existingIds.has(d.id))]
          localStorage.setItem('sip_drinks', JSON.stringify(merged))
          setImported(true)
          setTimeout(() => window.location.reload(), 800)
        }
      } catch {
        alert('Could not read file — make sure it is a valid SipTracker backup.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }} className="fade-up">

      {/* Weekly limit */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '22px' }}>
        <div style={{ fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 18 }}>Weekly Drink Limit</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 18 }}>
          {PRESETS.map(p => (
            <button key={p} onClick={() => setLocalLimit(p)} style={{ background: localLimit === p ? 'var(--gold)' : 'var(--bg3)', color: localLimit === p ? '#111' : 'var(--text2)', border: '1px solid', borderColor: localLimit === p ? 'var(--gold)' : 'var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 8px', fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', cursor: 'pointer', transition: 'all 0.18s' }}>{p}</button>
          ))}
        </div>
        <input type="number" min={1} max={100} value={localLimit} onChange={e => setLocalLimit(Number(e.target.value))} style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', color: 'var(--text)', fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700, outline: 'none', textAlign: 'center', marginBottom: 18 }} />
        <button onClick={handleSave} style={{ width: '100%', padding: '15px', borderRadius: 'var(--radius-sm)', border: 'none', background: saved ? 'var(--green)' : 'linear-gradient(135deg, var(--gold), var(--amber))', color: '#111', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
          {saved ? '✓ Saved!' : 'Save Limit'}
        </button>
      </div>

      {/* Guidance */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px' }}>
        <div style={{ fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>📋 Guidance</div>
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>The CDC recommends no more than <strong style={{ color: 'var(--gold)' }}>14 units</strong> per week and surprisingly you're not an exception.</p>
      </div>

      {/* All time stats */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px' }}>
        <div style={{ fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>All Time</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[{ label: 'Total logged', value: drinks.length }, { label: 'Days tracked', value: new Set(drinks.map(d => new Date(d.timestamp).toDateString())).size }].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: 'var(--gold)' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Backup & Restore */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px' }}>
        <div style={{ fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Backup & Restore</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16, lineHeight: 1.5 }}>
          Export your data before switching phones or clearing your browser. Import to restore from a backup.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={handleExport} style={{ width: '100%', padding: '13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--gold)', fontSize: 14, fontFamily: 'var(--font-body)', cursor: 'pointer', fontWeight: 500 }}>
            ⬇️ Export Backup ({drinks.length} drinks)
          </button>
          <button onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: '13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: imported ? 'var(--green)' : 'var(--bg3)', color: imported ? '#111' : 'var(--text2)', fontSize: 14, fontFamily: 'var(--font-body)', cursor: 'pointer', fontWeight: 500 }}>
            {imported ? '✓ Imported!' : '⬆️ Import Backup'}
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ border: '1px solid #3a1010', borderRadius: 'var(--radius)', padding: '18px 20px' }}>
        <div style={{ fontSize: 13, color: '#7a3030', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Danger Zone</div>
        <button onClick={handleClear} style={{ width: '100%', padding: '13px', borderRadius: 'var(--radius-sm)', border: '1px solid #5a2020', background: 'transparent', color: '#c05050', fontSize: 14, cursor: 'pointer' }}>Clear All History</button>
      </div>

      <div style={{ textAlign: 'center', paddingBottom: 8 }}>
        <p style={{ fontSize: 12, color: 'var(--text3)' }}>SipTracker Beta · Data stored on this device only</p>
      </div>
    </div>
  )
}