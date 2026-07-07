import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { COLLECTION_USERS } from '../constants'

// Popup plutôt que redirect : signInWithRedirect échoue silencieusement sur
// Safari/iOS (partitionnement des cookies tiers) quand authDomain n'est pas
// le domaine de l'app.
export const googleProvider = new GoogleAuthProvider()

async function createProfile(user, inviteCode) {
  const displayName = user.displayName ?? ''
  const parts       = displayName.split(' ')

  await setDoc(doc(db, COLLECTION_USERS, user.uid), {
    uid:          user.uid,
    prenom:       parts[0] ?? '',
    nom:          parts.slice(1).join(' '),
    email:        user.email ?? '',
    photoUrl:     user.photoURL ?? '',
    photoDriveId: '',
    countryCodes: [],
    isAdmin:      false,
    inviteCode,
    createdAt:    Date.now(),
  })
}

// Page de connexion : réservé aux comptes ayant déjà un profil famille.
export async function signInWithGoogleLogin(auth) {
  const { user } = await signInWithPopup(auth, googleProvider)
  const snap = await getDoc(doc(db, COLLECTION_USERS, user.uid))
  if (!snap.exists()) {
    await signOut(auth)
    const err = new Error('Aucun profil famille pour ce compte Google')
    err.code = 'app/no-profile'
    throw err
  }
}

// Page d'inscription : crée le profil — le code famille est vérifié
// par les règles Firestore, pas par le client.
export async function signInWithGoogleRegister(auth, inviteCode) {
  const { user } = await signInWithPopup(auth, googleProvider)
  const snap = await getDoc(doc(db, COLLECTION_USERS, user.uid))
  if (snap.exists()) return // déjà membre : simple connexion

  try {
    await createProfile(user, inviteCode)
  } catch (err) {
    await signOut(auth) // sans profil l'app resterait bloquée sur le spinner
    throw err
  }
}
