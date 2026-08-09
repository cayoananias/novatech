import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loginUser, logoutUser, observeAuth, registerUser, updateUserProfile as updateRemoteUserProfile } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    firebaseUser: null,
    profile: null,
    ready: false,
    configured: false,
  })

  useEffect(() => observeAuth(setAuthState), [])

  const value = useMemo(() => {
    const signIn = async (credentials) => loginUser(credentials)
    const signUp = async (credentials) => registerUser(credentials)
    const signOut = async () => logoutUser()
    const updateProfile = async (payload) => {
      if (!authState.firebaseUser) {
        throw new Error('Nenhum usuário autenticado.')
      }

      await updateRemoteUserProfile(authState.firebaseUser.uid, payload)
    }

    return {
      ...authState,
      currentUser: authState.firebaseUser ? { ...authState.firebaseUser, ...(authState.profile || {}) } : null,
      isAuthenticated: Boolean(authState.firebaseUser),
      isAdmin: authState.profile?.role === 'admin',
      signIn,
      signUp,
      signOut,
      updateProfile,
    }
  }, [authState])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }

  return context
}