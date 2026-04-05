import { createContext, useContext, useState, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fv_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const { data } = await authAPI.login({ email, password })
      localStorage.setItem('fv_token', data.data.token)
      localStorage.setItem('fv_user', JSON.stringify(data.data.user))
      setUser(data.data.user)
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (payload) => {
    setLoading(true)
    try {
      const { data } = await authAPI.register(payload)
      localStorage.setItem('fv_token', data.data.token)
      localStorage.setItem('fv_user', JSON.stringify(data.data.user))
      setUser(data.data.user)
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || 'Registration failed' }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('fv_token')
    localStorage.removeItem('fv_user')
    setUser(null)
  }, [])

  const isAdmin   = user?.role === 'admin'
  const isAnalyst = user?.role === 'analyst' || isAdmin
  const isViewer  = !!user

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isAnalyst, isViewer }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}