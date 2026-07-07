import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTION_USERS } from '../constants'

export const googleProvider = new GoogleAuthProvider()

export async function createProfileIfNeeded(user) {
  const ref  = doc(db, COLLECTION_USERS, user.uid)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    const displayName = user.displayName ?? ''
    const parts       = displayName.split(' ')
    const prenom      = parts[0] ?? ''
    const nom         = parts.slice(1).join(' ') ?? ''

    await setDoc(ref, {
      uid:          user.uid,
      prenom,
      nom,
      email:        user.email ?? '',
      photoUrl:     user.photoURL ?? '',
      photoDriveId: '',
      countryCode:  '',
      isAdmin:      false,
      points:       0,
      victoires:    0,
      matchsJoues:  0,
      createdAt:    Date.now(),
    })
  }
}

// Popup plutôt que redirect : signInWithRedirect échoue silencieusement sur
// Safari/iOS (partitionnement des cookies tiers) quand authDomain n'est pas
// le domaine de l'app.
export async function signInWithGoogle(auth) {
  const result = await signInWithPopup(auth, googleProvider)
  await createProfileIfNeeded(result.user)
  return result
}
