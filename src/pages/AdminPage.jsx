import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, updateDoc, collection, increment, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useUsers } from '../hooks/useUsers'
import { useMatches } from '../hooks/useMatches'
import { COLLECTION_USERS, COLLECTION_MATCHES, PHASES } from '../constants'
import { PAYS, drapeau, nom } from '../data/countries'
import { RWC2027_FIXTURES } from '../data/rwc2027fixtures'
import PhotoProfil from '../components/PhotoProfil'
import NavBar from '../components/NavBar'
import LoadingSpinner from '../components/LoadingSpinner'

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(ts) {
  if (!ts) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(ts))
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user } = useAuth()
  const profile  = useCurrentUser(user?.uid)
  const navigate = useNavigate()
  const [tab, setTab] = useState('membres')

  useEffect(() => {
    if (profile && profile.isAdmin !== true) navigate('/dashboard')
  }, [profile, navigate])

  if (!profile) return <LoadingSpinner />

  const tabs = [
    { key: 'membres', label: 'Membres' },
    { key: 'matchs',  label: 'Matchs'  },
    { key: 'scores',  label: 'Scores'  },
  ]

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 60px)' }}>
      {/* Header */}
      <div className="bg-orange-rwc px-4 pt-12 pb-0 flex-shrink-0">
        <h1 className="text-base font-bold text-white mb-3">⚙️ Administration</h1>
        <div className="flex">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2 text-sm font-semibold transition-colors border-b-2 ${
                tab === t.key ? 'border-white text-white' : 'border-transparent text-white/60'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-creme-light">
        {tab === 'membres' && <OngletMembres />}
        {tab === 'matchs'  && <OngletMatchs />}
        {tab === 'scores'  && <OngletScores />}
      </div>

      <NavBar />
    </div>
  )
}

// ── Membres ────────────────────────────────────────────────────────────────────

function OngletMembres() {
  const users = useUsers()
  const [selected, setSelected] = useState(null)
  const [newCode, setNewCode]   = useState('')
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState(null)

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  async function attribuer() {
    if (!selected || !newCode) return
    setSaving(true)
    try {
      await updateDoc(doc(db, COLLECTION_USERS, selected.uid), { countryCode: newCode })
      showToast(`${drapeau(newCode)} attribué à ${selected.prenom}`)
      setSelected(null); setNewCode('')
    } catch (e) {
      showToast('Erreur : ' + e.message)
    } finally { setSaving(false) }
  }

  return (
    <div className="px-4 py-4 flex flex-col gap-3">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-warm-black text-white text-sm px-4 py-2 rounded-full z-50 shadow-lg">
          {toast}
        </div>
      )}

      {/* Attribution dialog */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-end justify-center" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-warm-black mb-1">Attribuer un pays</h2>
            <p className="text-sm text-warm-gray mb-4">{selected.prenom} {selected.nom}</p>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto mb-4">
              {PAYS.map(p => (
                <button key={p.code} onClick={() => setNewCode(p.code)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors ${
                    newCode === p.code
                      ? 'border-orange-rwc bg-orange-50 text-orange-rwc font-semibold'
                      : 'border-gray-100 bg-gray-50 text-warm-black'
                  }`}>
                  <span>{p.drapeau}</span>
                  <span className="truncate">{p.nom}</span>
                </button>
              ))}
            </div>
            <button onClick={attribuer} disabled={!newCode || saving}
              className="w-full bg-orange-rwc text-white font-semibold py-3 rounded-xl disabled:opacity-40">
              {saving ? '…' : 'Attribuer'}
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-warm-gray">{users.length} membre(s) inscrit(s)</p>

      {users.map(u => (
        <div key={u.uid} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
          <PhotoProfil url={u.photoUrl} prenom={u.prenom} size={40} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-warm-black truncate">{u.prenom} {u.nom}</p>
            <p className="text-xs text-warm-gray truncate">{u.email}</p>
            {u.countryCode && (
              <p className="text-xs text-orange-rwc mt-0.5">{drapeau(u.countryCode)} {nom(u.countryCode)}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-sm font-bold text-orange-rwc">{u.points ?? 0} pts</span>
            <button onClick={() => { setSelected(u); setNewCode(u.countryCode ?? '') }}
              className="text-xs bg-orange-50 text-orange-rwc font-semibold px-3 py-1 rounded-full">
              🏳️ Pays
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Matchs ─────────────────────────────────────────────────────────────────────

const EMPTY_MATCH = { homeTeamCode: '', awayTeamCode: '', phase: 'PHASE_DE_POULES', groupe: '', stade: '', ville: '', dateLocal: '' }

function OngletMatchs() {
  const matches = useMatches()
  const [showForm, setShowForm]     = useState(false)
  const [showJson, setShowJson]     = useState(false)
  const [form, setForm]             = useState(EMPTY_MATCH)
  const [jsonText, setJsonText]     = useState('')
  const [saving, setSaving]         = useState(false)
  const [toast, setToast]           = useState(null)

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  async function ajouterMatch(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const ts = form.dateLocal ? new Date(form.dateLocal).getTime() : 0
      await addDoc(collection(db, COLLECTION_MATCHES), {
        homeTeamCode: form.homeTeamCode,
        awayTeamCode: form.awayTeamCode,
        homeTeamName: nom(form.homeTeamCode),
        awayTeamName: nom(form.awayTeamCode),
        phase:        form.phase,
        groupe:       form.groupe,
        stade:        form.stade,
        ville:        form.ville,
        dateTimestamp: ts,
        statut:       'PLANIFIE',
        homeScore:    null,
        awayScore:    null,
        sportsDbId:   '',
      })
      showToast('Match ajouté !'); setShowForm(false); setForm(EMPTY_MATCH)
    } catch (err) { showToast('Erreur : ' + err.message) }
    finally { setSaving(false) }
  }

  async function chargerRwc2027() {
    setSaving(true)
    try {
      const batch = writeBatch(db)
      for (const f of RWC2027_FIXTURES) {
        const ref = doc(collection(db, COLLECTION_MATCHES))
        batch.set(ref, {
          ...f,
          homeTeamName: nom(f.homeTeamCode),
          awayTeamName: nom(f.awayTeamCode),
          statut: 'PLANIFIE', homeScore: null, awayScore: null, sportsDbId: '',
        })
      }
      await batch.commit()
      showToast(`${RWC2027_FIXTURES.length} matchs RWC 2027 importés !`)
    } catch (err) { showToast('Erreur : ' + err.message) }
    finally { setSaving(false) }
  }

  async function importerJson() {
    setSaving(true)
    try {
      const arr = JSON.parse(jsonText.trim())
      const valid = arr.filter(obj => obj.homeTeamCode && obj.awayTeamCode)
      if (valid.length === 0) { showToast('Aucun match valide dans le JSON'); return }
      const batch = writeBatch(db)
      for (const obj of valid) {
        const ref = doc(collection(db, COLLECTION_MATCHES))
        batch.set(ref, {
          homeTeamCode: obj.homeTeamCode,
          awayTeamCode: obj.awayTeamCode,
          homeTeamName: obj.homeTeamName ?? nom(obj.homeTeamCode),
          awayTeamName: obj.awayTeamName ?? nom(obj.awayTeamCode),
          phase:        obj.phase ?? 'PHASE_DE_POULES',
          groupe:       obj.groupe ?? '',
          stade:        obj.stade  ?? '',
          ville:        obj.ville  ?? '',
          dateTimestamp: obj.dateTimestamp ?? 0,
          statut:       obj.statut ?? 'PLANIFIE',
          homeScore:    null,
          awayScore:    null,
          sportsDbId:   '',
        })
      }
      await batch.commit()
      showToast(`${valid.length} match(s) importé(s) !`); setShowJson(false); setJsonText('')
    } catch (err) { showToast('Erreur : ' + err.message) }
    finally { setSaving(false) }
  }

  const EXEMPLE = `[
  {
    "homeTeamCode": "FRA",
    "awayTeamCode": "ENG",
    "phase": "PHASE_DE_POULES",
    "groupe": "A",
    "dateTimestamp": 1748764800000,
    "stade": "Stade de France",
    "ville": "Saint-Denis"
  }
]`

  return (
    <div className="px-4 py-4 flex flex-col gap-3">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-warm-black text-white text-sm px-4 py-2 rounded-full z-50 shadow-lg">
          {toast}
        </div>
      )}

      {/* Add match modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-end justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8 overflow-y-auto max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-warm-black mb-4">Ajouter un match</h2>
            <form onSubmit={ajouterMatch} className="flex flex-col gap-3">
              <SelectPays label="Équipe locale" value={form.homeTeamCode} onChange={v => setForm(f => ({ ...f, homeTeamCode: v }))} />
              <SelectPays label="Équipe visiteuse" value={form.awayTeamCode} onChange={v => setForm(f => ({ ...f, awayTeamCode: v }))} />
              <div>
                <label className="block text-xs font-medium text-warm-gray mb-1">Phase</label>
                <select value={form.phase} onChange={e => setForm(f => ({ ...f, phase: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-rwc/50">
                  {Object.entries(PHASES).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                </select>
              </div>
              {form.phase === 'PHASE_DE_POULES' && (
                <Field label="Groupe (A–F)" value={form.groupe} onChange={v => setForm(f => ({ ...f, groupe: v.toUpperCase().slice(0, 1) }))} placeholder="A" />
              )}
              <div>
                <label className="block text-xs font-medium text-warm-gray mb-1">Date & heure</label>
                <input type="datetime-local" value={form.dateLocal} onChange={e => setForm(f => ({ ...f, dateLocal: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-rwc/50" />
              </div>
              <Field label="Stade" value={form.stade} onChange={v => setForm(f => ({ ...f, stade: v }))} placeholder="Stade de France" />
              <Field label="Ville" value={form.ville} onChange={v => setForm(f => ({ ...f, ville: v }))} placeholder="Saint-Denis" />
              <button type="submit" disabled={!form.homeTeamCode || !form.awayTeamCode || saving}
                className="mt-2 w-full bg-orange-rwc text-white font-semibold py-3 rounded-xl disabled:opacity-40">
                {saving ? '…' : 'Ajouter'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* JSON import modal */}
      {showJson && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-end justify-center" onClick={() => setShowJson(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-warm-black mb-1">Importer via JSON</h2>
            <p className="text-xs text-warm-gray mb-3">Champs requis : homeTeamCode, awayTeamCode. Facultatifs : phase, groupe, dateTimestamp, stade, ville.</p>
            <textarea
              value={jsonText} onChange={e => setJsonText(e.target.value)}
              placeholder={EXEMPLE}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-rwc/50 resize-none"
              rows={8} />
            <button onClick={importerJson} disabled={!jsonText.trim() || saving}
              className="mt-3 w-full bg-orange-rwc text-white font-semibold py-3 rounded-xl disabled:opacity-40">
              {saving ? '…' : 'Importer'}
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={chargerRwc2027}
          disabled={saving}
          className="flex-1 bg-teal-rwc text-white font-semibold py-2 rounded-xl text-sm disabled:opacity-40">
          🏉 Charger RWC 2027
        </button>
        <button onClick={() => setShowJson(true)}
          className="flex-1 border border-orange-rwc text-orange-rwc font-semibold py-2 rounded-xl text-sm">
          📋 JSON
        </button>
        <button onClick={() => setShowForm(true)}
          className="flex-1 bg-orange-rwc text-white font-semibold py-2 rounded-xl text-sm">
          + Ajouter
        </button>
      </div>

      <p className="text-xs text-warm-gray">{matches.length} match(s)</p>

      {matches.map(m => (
        <div key={m.id} className="bg-white rounded-2xl px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-lg">{drapeau(m.homeTeamCode)}</span>
            <div className="flex-1 mx-2 text-center">
              <p className="text-xs font-semibold text-warm-black">{nom(m.homeTeamCode)} vs {nom(m.awayTeamCode)}</p>
              <p className="text-xs text-warm-gray">{PHASES[m.phase]?.label ?? m.phase} {m.groupe ? `· Gr. ${m.groupe}` : ''}</p>
              <p className="text-xs text-warm-gray">{formatDate(m.dateTimestamp)}</p>
            </div>
            <span className="text-lg">{drapeau(m.awayTeamCode)}</span>
          </div>
          {m.statut === 'TERMINE' && (
            <p className="text-center text-sm font-bold text-orange-rwc mt-1">{m.homeScore} – {m.awayScore}</p>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Scores ─────────────────────────────────────────────────────────────────────

function OngletScores() {
  const matches = useMatches()
  const users   = useUsers()
  const pending = matches.filter(m => m.statut !== 'TERMINE').sort((a, b) => a.dateTimestamp - b.dateTimestamp)

  return (
    <div className="px-4 py-4 flex flex-col gap-3">
      <p className="text-xs text-warm-gray">Saisir les scores des matchs terminés</p>
      {pending.length === 0 && (
        <p className="text-center text-warm-gray py-8 text-sm">Aucun match en attente</p>
      )}
      {pending.map(m => <CarteSaisieScore key={m.id} match={m} users={users} />)}
    </div>
  )
}

function CarteSaisieScore({ match, users }) {
  const [home, setHome]   = useState('')
  const [away, setAway]   = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast]   = useState(null)

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  async function valider() {
    const h = parseInt(home), v = parseInt(away)
    if (isNaN(h) || isNaN(v)) return
    setSaving(true)
    try {
      // 1. Update match
      await updateDoc(doc(db, COLLECTION_MATCHES, match.id), {
        homeScore: h, awayScore: v, statut: 'TERMINE'
      })

      // 2. Award points
      const winner  = h > v ? match.homeTeamCode : v > h ? match.awayTeamCode : null
      const pts     = PHASES[match.phase]?.points ?? 0
      const batch   = writeBatch(db)

      users.forEach(u => {
        if (!u.countryCode) return
        const ref = doc(db, COLLECTION_USERS, u.uid)
        if (u.countryCode === winner && pts > 0) {
          batch.update(ref, { points: increment(pts), victoires: increment(1), matchsJoues: increment(1) })
        } else if (u.countryCode === match.homeTeamCode || u.countryCode === match.awayTeamCode) {
          batch.update(ref, { matchsJoues: increment(1) })
        }
      })
      await batch.commit()
      showToast('Score enregistré et points calculés !')
      setHome(''); setAway('')
    } catch (err) { showToast('Erreur : ' + err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-warm-black text-white text-sm px-4 py-2 rounded-full z-50 shadow-lg">
          {toast}
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold">{drapeau(match.homeTeamCode)} {nom(match.homeTeamCode)}</span>
        <span className="text-xs text-warm-gray">vs</span>
        <span className="text-sm font-semibold">{nom(match.awayTeamCode)} {drapeau(match.awayTeamCode)}</span>
      </div>
      <p className="text-xs text-warm-gray text-center mb-3">{PHASES[match.phase]?.label} · {formatDate(match.dateTimestamp)}</p>
      <div className="flex items-center gap-2">
        <input type="number" min="0" max="999" value={home} onChange={e => setHome(e.target.value)}
          placeholder="0"
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-rwc/50" />
        <span className="text-warm-gray font-bold">–</span>
        <input type="number" min="0" max="999" value={away} onChange={e => setAway(e.target.value)}
          placeholder="0"
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-rwc/50" />
        <button onClick={valider} disabled={home === '' || away === '' || saving}
          className="bg-orange-rwc text-white font-bold w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40 flex-shrink-0">
          {saving ? '…' : '✓'}
        </button>
      </div>
    </div>
  )
}

// ── Shared components ──────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-warm-gray mb-1">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-rwc/50" />
    </div>
  )
}

function SelectPays({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-warm-gray mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-rwc/50">
        <option value="">Choisir un pays…</option>
        {PAYS.map(p => <option key={p.code} value={p.code}>{p.drapeau} {p.nom}</option>)}
      </select>
    </div>
  )
}
