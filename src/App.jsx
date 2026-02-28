import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { signIn, signOut, getSession } from './lib/db'
import TennisTeamApp from './TennisTeamApp.jsx'

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#1e4d2b' }}>
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎾</div>
          <h1 className="text-2xl font-bold text-gray-900">Foxcroft Hills</h1>
          <p className="text-gray-500 text-sm mt-1">Tennis Team</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="you@email.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••" required />
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50 transition-colors">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-6">Contact your team admin to get access</p>
      </div>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1e4d2b' }}>
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) return <LoginScreen />

  return <TennisTeamApp session={session} onSignOut={signOut} />
}
