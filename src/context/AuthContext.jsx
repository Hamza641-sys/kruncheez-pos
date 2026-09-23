import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword, signOut,
  onAuthStateChanged, createUserWithEmailAndPassword
} from 'firebase/auth'
import { auth } from '../firebase/config'
import { getDocument, setDocument } from '../firebase/firestore'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const profile = await getDocument('staff', firebaseUser.uid)
        setUserProfile(profile)
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const logout = () => signOut(auth)

  const createStaff = async (email, password, profileData) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await setDocument('staff', cred.user.uid, {
      ...profileData,
      email,
      uid: cred.user.uid,
    })
    return cred
  }

  const hasPermission = (permission) => {
    if (!userProfile) return false
    const perms = userProfile.permissions || []
    return perms.includes('all') || perms.includes(permission)
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, logout, createStaff, hasPermission }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
