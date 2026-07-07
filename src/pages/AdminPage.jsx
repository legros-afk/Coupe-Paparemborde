import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, addDoc, updateDoc, setDoc, getDoc, deleteDoc, deleteField, collection, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useUsers } from '../hooks/useUsers'
import { useMatches } from '../hooks/useMatches'
import { COLLECTION_USERS, COLLECTION_MATCHES, COLLECTION_CONFIG, PHASES } from '../constants'
import { PAYS, nom } from '../data/countries'
import { RWC2027_FIXTURES } from '../data/rwc2027fixtures'
import { buildMatch, matchKey, matchDocId } from '../utils/buildMatch'
import { buildCodeToUser, computeStandings, userCountries } from '../utils/standings'
import PhotoProfil from '../components/PhotoProfil'
import Flag from '../components/Flag'
import NavBar from '../components/NavBar'
import LoadingSpinner from '../components/LoadingSpinner'

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(ts) {
  if (!ts) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(ts))
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
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
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 60px - env(safe-area-inset-bottom))' }}>
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
  const { matches } = useMatches()
  const [selected, setSelected] = useState(null)
  const [codes, setCodes]       = useState([])
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState(null)

  // Code famille (vérifié par les règles Firestore à l'inscription)
  const [inviteCode, setInviteCode] = useState('')
  useEffect(() => {
    getDoc(doc(db, COLLECTION_CONFIG, 'registration'))
      .then(snap => { if (snap.exists()) setInviteCode(snap.data().inviteCode ?? '') })
      .catch(() => {})
  }, [])

  const standings    = computeStandings(users, matches)
  const codeVersUser = buildCodeToUser(users)

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  async function saveInviteCode() {
    setSaving(true)
    try {
      await setDoc(doc(db, COLLECTION_CONFIG, 'registration'), { inviteCode: inviteCode.trim() }, { merge: true })
      showToast('Code famille enregistré')
    } catch (e) { showToast('Erreur : ' + e.message) }
    finally { setSaving(false) }
  }

  function toggleCode(code) {
    setCodes(c => c.includes(code) ? c.filter(x => x !== code) : [...c, code])
  }

  // Tirage au sort : distribue les pays sélectionnés équitablement, au hasard.
  // Le reliquat (pays en trop pour une répartition égale) reste sans propriétaire.
  const [showDraw, setShowDraw]   = useState(false)
  const [drawCodes, setDrawCodes] = useState(PAYS.map(p => p.code))
  const perPerson = users.length > 0 ? Math.floor(drawCodes.length / users.length) : 0
  const leftover  = drawCodes.length - perPerson * users.length

  function toggleDrawCode(code) {
    setDrawCodes(c => c.includes(code) ? c.filter(x => x !== code) : [...c, code])
  }

  async function lancerTirage() {
    if (perPerson === 0) return
    if (!window.confirm(`Distribuer ${drawCodes.length} pays entre ${users.length} membres ? Toutes les attributions actuelles seront remplacées.`)) return
    setSaving(true)
    try {
      const deck  = shuffle(drawCodes)
      const ordre = shuffle(users)
      const batch = writeBatch(db)
      ordre.forEach((u, i) => {
        batch.update(doc(db, COLLECTION_USERS, u.uid), {
          countryCodes: deck.slice(i * perPerson, (i + 1) * perPerson).sort(),
          countryCode:  deleteField(),
        })
      })
      await batch.commit()
      showToast(`🎉 Tirage effectué : ${perPerson} pays chacun${leftover ? `, ${leftover} sans propriétaire` : ''}`)
      setShowDraw(false)
    } catch (e) { showToast('Erreur : ' + e.message) }
    finally { setSaving(false) }
  }

  async function attribuer() {
    if (!selected) return
    setSaving(true)
    try {
      await updateDoc(doc(db, COLLECTION_USERS, selected.uid), {
        countryCodes: codes,
        countryCode:  deleteField(), // purge de l'ancien champ single-pays
      })
      showToast(`${codes.length} pays attribué(s) à ${selected.prenom}`)
      setSelected(null)
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
            <h2 className="font-bold text-warm-black mb-1">Attribuer des pays</h2>
            <p className="text-sm text-warm-gray mb-4">
              {selected.prenom} {selected.nom} · {codes.length} pays sélectionné(s)
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto mb-4">
              {PAYS.map(p => {
                const owner = codeVersUser[p.code]
                const taken = owner && owner.uid !== selected.uid
                const on    = codes.includes(p.code)
                return (
                  <button key={p.code} onClick={() => !taken && toggleCode(p.code)} disabled={taken}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors ${
                      on     ? 'border-orange-rwc bg-orange-50 text-orange-rwc font-semibold'
                      : taken ? 'border-gray-100 bg-gray-50 text-warm-gray/50'
                      :        'border-gray-100 bg-gray-50 text-warm-black'
                    }`}>
                    <Flag code={p.code} width={20} />
                    <span className="truncate flex-1 text-left">{p.nom}</span>
                    {on && <span>✓</span>}
                    {taken && <span className="text-[10px] truncate">{owner.prenom}</span>}
                  </button>
                )
              })}
            </div>
            <button onClick={attribuer} disabled={saving}
              className="w-full bg-orange-rwc text-white font-semibold py-3 rounded-xl disabled:opacity-40">
              {saving ? '…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}

      {/* Tirage au sort dialog */}
      {showDraw && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-end justify-center" onClick={() => setShowDraw(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-warm-black mb-1">🎲 Tirage au sort</h2>
            <p className="text-sm text-warm-gray mb-3">
              Décochez les pays à laisser hors du chapeau (les plus faibles, par exemple).
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto mb-3">
              {PAYS.map(p => {
                const on = drawCodes.includes(p.code)
                return (
                  <button key={p.code} onClick={() => toggleDrawCode(p.code)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors ${
                      on ? 'border-orange-rwc bg-orange-50 text-orange-rwc font-semibold'
                         : 'border-gray-100 bg-gray-50 text-warm-gray/60'
                    }`}>
                    <Flag code={p.code} width={20} />
                    <span className="truncate flex-1 text-left">{p.nom}</span>
                    {on && <span>✓</span>}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-warm-gray text-center mb-3">
              {drawCodes.length} pays ÷ {users.length} membres → <strong>{perPerson} chacun</strong>
              {leftover > 0 && <>, {leftover} sans propriétaire</>}
            </p>
            <button onClick={lancerTirage} disabled={perPerson === 0 || saving}
              className="w-full bg-orange-rwc text-white font-semibold py-3 rounded-xl disabled:opacity-40">
              {saving ? '…' : perPerson === 0 ? 'Pas assez de pays sélectionnés' : 'Lancer le tirage 🎲'}
            </button>
          </div>
        </div>
      )}

      {/* Tirage au sort */}
      <button onClick={() => setShowDraw(true)}
        className="bg-teal-rwc text-white font-semibold py-3 rounded-2xl text-sm shadow-sm">
        🎲 Tirage au sort des pays
      </button>

      {/* Code famille */}
      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
        <p className="text-xs font-semibold text-warm-gray mb-2">
          🔑 Code famille (requis à l'inscription — vide = inscriptions bloquées)
        </p>
        <div className="flex gap-2">
          <input value={inviteCode} onChange={e => setInviteCode(e.target.value)}
            placeholder="ex. PAPAREMBORDE2027"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-rwc/50" />
          <button onClick={saveInviteCode} disabled={saving}
            className="bg-orange-rwc text-white font-semibold px-4 rounded-xl text-sm disabled:opacity-40">
            OK
          </button>
        </div>
      </div>

      <p className="text-xs text-warm-gray">{users.length} membre(s) inscrit(s)</p>

      {standings.map(u => (
        <div key={u.uid} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
          <PhotoProfil url={u.photoUrl} prenom={u.prenom} size={40} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-warm-black truncate">{u.prenom} {u.nom}</p>
            <p className="text-xs text-warm-gray truncate">{u.email}</p>
            {userCountries(u).length > 0 && (
              <p className="text-xs mt-1 flex items-center gap-1 flex-wrap">
                {userCountries(u).map(c => <Flag key={c} code={c} width={16} />)}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-sm font-bold text-orange-rwc">{u.points} pts</span>
            <button onClick={() => { setSelected(u); setCodes(userCountries(u)) }}
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
  const { matches, error: matchesError } = useMatches()
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
      await addDoc(collection(db, COLLECTION_MATCHES), buildMatch({
        homeTeamCode: form.homeTeamCode,
        awayTeamCode: form.awayTeamCode,
        phase:        form.phase,
        groupe:       form.groupe,
        stade:        form.stade,
        ville:        form.ville,
        dateTimestamp: form.dateLocal ? new Date(form.dateLocal).getTime() : 0,
      }))
      showToast('Match ajouté !'); setShowForm(false); setForm(EMPTY_MATCH)
    } catch (err) { showToast('Erreur : ' + err.message) }
    finally { setSaving(false) }
  }

  async function chargerRwc2027() {
    setSaving(true)
    try {
      // Idempotent : les matchs déjà présents (même affiche, même phase) sont ignorés
      const existing = new Set(matches.map(matchKey))
      const batch = writeBatch(db)
      let added = 0
      for (const f of RWC2027_FIXTURES) {
        const m = buildMatch(f)
        if (existing.has(matchKey(m))) continue
        batch.set(doc(db, COLLECTION_MATCHES, matchDocId(m)), m)
        existing.add(matchKey(m))
        added++
      }
      if (added === 0) { showToast('Tous les matchs RWC 2027 sont déjà importés'); return }
      await batch.commit()
      const skipped = RWC2027_FIXTURES.length - added
      showToast(`${added} match(s) importé(s)${skipped ? `, ${skipped} déjà présent(s)` : ''} !`)
    } catch (err) { showToast('Erreur : ' + err.message) }
    finally { setSaving(false) }
  }

  async function supprimerMatch(m) {
    if (!window.confirm(`Supprimer ${nom(m.homeTeamCode)} vs ${nom(m.awayTeamCode)} ?`)) return
    try {
      await deleteDoc(doc(db, COLLECTION_MATCHES, m.id))
      showToast('Match supprimé')
    } catch (err) { showToast('Erreur : ' + err.message) }
  }

  async function importerJson() {
    setSaving(true)
    try {
      let arr
      try { arr = JSON.parse(jsonText.trim()) }
      catch { throw new Error('JSON illisible — vérifiez la syntaxe') }
      if (!Array.isArray(arr)) throw new Error('le JSON doit être un tableau de matchs [ … ]')
      if (arr.length === 0)    throw new Error('aucun match dans le JSON')

      // Tout ou rien : on valide chaque entrée avant d'écrire quoi que ce soit
      const docs = arr.map((obj, i) => {
        try { return buildMatch(obj) }
        catch (err) { throw new Error(`match ${i + 1} : ${err.message}`) }
      })

      const existing = new Set(matches.map(matchKey))
      const batch = writeBatch(db)
      let added = 0
      for (const m of docs) {
        if (existing.has(matchKey(m))) continue
        batch.set(doc(db, COLLECTION_MATCHES, matchDocId(m)), m)
        existing.add(matchKey(m))
        added++
      }
      if (added === 0) { showToast('Tous ces matchs sont déjà présents'); return }
      await batch.commit()
      const skipped = docs.length - added
      showToast(`${added} match(s) importé(s)${skipped ? `, ${skipped} déjà présent(s)` : ''} !`)
      setShowJson(false); setJsonText('')
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

      {matchesError && (
        <div className="px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm">
          Erreur de lecture Firestore : {matchesError}. Vérifiez que les règles de sécurité sont déployées.
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
            <Flag code={m.homeTeamCode} width={24} />
            <div className="flex-1 mx-2 text-center">
              <p className="text-xs font-semibold text-warm-black">{nom(m.homeTeamCode)} vs {nom(m.awayTeamCode)}</p>
              <p className="text-xs text-warm-gray">{PHASES[m.phase]?.label ?? m.phase} {m.groupe ? `· Gr. ${m.groupe}` : ''}</p>
              <p className="text-xs text-warm-gray">{formatDate(m.dateTimestamp)}</p>
            </div>
            <Flag code={m.awayTeamCode} width={24} />
          </div>
          {m.statut === 'TERMINE' && (
            <p className="text-center text-sm font-bold text-orange-rwc mt-1">{m.homeScore} – {m.awayScore}</p>
          )}
          <div className="flex justify-end mt-1">
            <button onClick={() => supprimerMatch(m)} aria-label="Supprimer le match"
              className="text-xs text-red-400 font-medium px-2 py-1">
              🗑 Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Scores ─────────────────────────────────────────────────────────────────────

function OngletScores() {
  const { matches } = useMatches()
  const pending  = matches.filter(m => m.statut !== 'TERMINE').sort((a, b) => a.dateTimestamp - b.dateTimestamp)
  const termines = matches.filter(m => m.statut === 'TERMINE').sort((a, b) => b.dateTimestamp - a.dateTimestamp)

  return (
    <div className="px-4 py-4 flex flex-col gap-3">
      <p className="text-xs text-warm-gray">
        Saisir les scores — le classement est recalculé automatiquement à partir des matchs terminés
      </p>
      {pending.length === 0 && (
        <p className="text-center text-warm-gray py-8 text-sm">Aucun match en attente</p>
      )}
      {pending.map(m => <CarteSaisieScore key={m.id} match={m} />)}

      {termines.length > 0 && (
        <>
          <h3 className="text-sm font-bold text-warm-black mt-4">✏️ Corriger un score</h3>
          {termines.map(m => <CarteSaisieScore key={m.id} match={m} />)}
        </>
      )}
    </div>
  )
}

// La saisie ne modifie que le document match : les points des membres sont
// dérivés (computeStandings), donc corriger un score reste toujours cohérent.
function CarteSaisieScore({ match }) {
  const done = match.statut === 'TERMINE'
  const [home, setHome]   = useState(done ? String(match.homeScore) : '')
  const [away, setAway]   = useState(done ? String(match.awayScore) : '')
  const [saving, setSaving] = useState(false)
  const [toast, setToast]   = useState(null)

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  async function valider() {
    const h = parseInt(home), v = parseInt(away)
    if (isNaN(h) || isNaN(v) || h < 0 || v < 0) return
    setSaving(true)
    try {
      await updateDoc(doc(db, COLLECTION_MATCHES, match.id), {
        homeScore: h, awayScore: v, statut: 'TERMINE'
      })
      showToast(done ? 'Score corrigé !' : 'Score enregistré !')
    } catch (err) { showToast('Erreur : ' + err.message) }
    finally { setSaving(false) }
  }

  async function annuler() {
    setSaving(true)
    try {
      await updateDoc(doc(db, COLLECTION_MATCHES, match.id), {
        homeScore: null, awayScore: null, statut: 'PLANIFIE'
      })
      setHome(''); setAway('')
      showToast('Résultat annulé')
    } catch (err) { showToast('Erreur : ' + err.message) }
    finally { setSaving(false) }
  }

  async function toggleDirect() {
    setSaving(true)
    try {
      const nouveau = match.statut === 'EN_COURS' ? 'PLANIFIE' : 'EN_COURS'
      await updateDoc(doc(db, COLLECTION_MATCHES, match.id), { statut: nouveau })
      showToast(nouveau === 'EN_COURS' ? 'Match en direct 🔴' : 'Match repassé à venir')
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
        <span className="text-sm font-semibold flex items-center gap-1.5">
          <Flag code={match.homeTeamCode} width={20} /> {nom(match.homeTeamCode)}
        </span>
        <span className="text-xs text-warm-gray">vs</span>
        <span className="text-sm font-semibold flex items-center gap-1.5">
          {nom(match.awayTeamCode)} <Flag code={match.awayTeamCode} width={20} />
        </span>
      </div>
      <p className="text-xs text-warm-gray text-center mb-3">{PHASES[match.phase]?.label} · {formatDate(match.dateTimestamp)}</p>
      <div className="flex items-center gap-2">
        <input type="number" min="0" max="999" value={home} onChange={e => setHome(e.target.value)}
          placeholder="0" aria-label={`Score ${nom(match.homeTeamCode)}`}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-rwc/50" />
        <span className="text-warm-gray font-bold">–</span>
        <input type="number" min="0" max="999" value={away} onChange={e => setAway(e.target.value)}
          placeholder="0" aria-label={`Score ${nom(match.awayTeamCode)}`}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-rwc/50" />
        <button onClick={valider} disabled={home === '' || away === '' || saving}
          aria-label="Valider le score"
          className="bg-orange-rwc text-white font-bold w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40 flex-shrink-0">
          {saving ? '…' : '✓'}
        </button>
      </div>
      <div className="flex justify-end mt-2 gap-2">
        {!done && (
          <button onClick={toggleDirect} disabled={saving}
            className="text-xs text-red-500 font-medium px-2 py-1">
            {match.statut === 'EN_COURS' ? '⏸ Plus en direct' : '🔴 En direct'}
          </button>
        )}
        {done && (
          <button onClick={annuler} disabled={saving}
            className="text-xs text-red-400 font-medium px-2 py-1">
            ↩ Annuler le résultat
          </button>
        )}
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
