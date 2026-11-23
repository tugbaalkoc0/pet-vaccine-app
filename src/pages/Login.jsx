import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import { useToast } from '../context/ToastContext'

const hataMesajlari = {
  'Invalid login credentials': 'E-posta veya şifre hatalı.',
}

const DEMO_EMAIL = 'demo@petasitakip.app'
const DEMO_PASSWORD = 'DemoAsi2026!'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError(hataMesajlari[error.message] ?? 'Giriş yapılamadı, lütfen tekrar deneyin.')
      return
    }

    showToast('Giriş yapıldı, hoş geldin!')
    navigate('/')
  }

  const handleDemoGiris = async () => {
    setError('')
    setDemoLoading(true)

    const { error: girisHatasi } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })

    if (girisHatasi) {
      setDemoLoading(false)
      setError('Demo hesabına giriş yapılamadı, lütfen tekrar deneyin.')
      return
    }

    await supabase.rpc('reset_demo_data')

    setDemoLoading(false)
    showToast('Demo hesabıyla giriş yapıldı!')
    navigate('/')
  }

  return (
    <div className="container mt-5" style={{ maxWidth: 420 }}>
      <h2 className="mb-4">Giriş yap</h2>

      <form onSubmit={handleSubmit} className="card p-4">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <label className="form-label">E-posta</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Şifre</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading || demoLoading}>
          {loading ? 'Giriş yapılıyor...' : 'Giriş yap'}
        </button>

        <button
          type="button"
          className="btn btn-outline-secondary mt-2"
          onClick={handleDemoGiris}
          disabled={loading || demoLoading}
        >
          {demoLoading ? 'Demo hazırlanıyor...' : '🐾 Demo hesapla dene'}
        </button>

        <p className="mt-3 mb-0 text-center">
          Hesabın yok mu? <Link to="/kayit">Kayıt ol</Link>
        </p>
      </form>
    </div>
  )
}
