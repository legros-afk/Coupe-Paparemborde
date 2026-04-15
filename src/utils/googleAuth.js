import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { COLLECTION_USERS } from '../constants'

const provider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  const result    = await signInWithPopup(auth, provider)
  const user      = result.user

  // Create Firestore profile on first sign-in
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

  return user
}
