import { createContext, useContext, useState, useEffect } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = async () => {
    const token = localStorage.getItem('spare_token')
    if (!token) { setLoading(false); return }
    try {
      const res = await client.get('/auth/me')
      setUser(res.data)
    } catch {
      localStorage.removeItem('spare_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMe() }, [])

  const login = async (email, password) => {
    const res = await client.post('/auth/login', { email, password })
    localStorage.setItem('spare_token', res.data.access_token)
    setUser(res.data.user)
    return res.data
  }

  const register = async (payload) => {
    const res = await client.post('/auth/register', payload)
    localStorage.setItem('spare_token', res.data.access_token)
    setUser(res.data.user)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('spare_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
