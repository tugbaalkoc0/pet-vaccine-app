import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'

const hataMesajlari = {
  'User already registered': 'Bu e-posta ile zaten bir hesap var.',
  'Password should be at least 6 characters': 'Şifre en az 6 karakter olmalı.',
}

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordAgain, setPasswordAgain] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== passwordAgain) {
      setError('Şifreler aynı değil.')
      return
    }

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)

    if (error) {
      setError(hataMesajlari[error.message] ?? 'Kayıt olunamadı, lütfen tekrar deneyin.')
      return
    }

    if (data.session) {
      navigate('/')
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="container mt-5" style={{ maxWidth: 420 }}>
        <div className="alert alert-success">
          Kaydınız alındı. E-postanıza gelen onay bağlantısına tıkladıktan sonra giriş yapabilirsiniz.
        </div>
        <Link to="/giris">Giriş sayfasına dön</Link>
      </div>
    )
  }

  return (
    <div className="container mt-5" style={{ maxWidth: 420 }}>
      <h2 className="mb-4">Kayıt ol</h2>

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
            minLength={6}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Şifre (tekrar)</label>
          <input
            type="password"
            className="form-control"
            value={passwordAgain}
            onChange={e => setPasswordAgain(e.target.value)}
            minLength={6}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Kayıt olunuyor...' : 'Kayıt ol'}
        </button>

        <p className="mt-3 mb-0 text-center">
          Zaten hesabın var mı? <Link to="/giris">Giriş yap</Link>
        </p>
      </form>
    </div>
  )
}
