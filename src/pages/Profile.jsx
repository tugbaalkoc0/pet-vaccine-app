import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Navbar from '../components/Navbar'
import ConfirmModal from '../components/ConfirmModal'

const DEMO_EMAIL = 'demo@petasitakip.app'

export default function Profile() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const isDemo = user?.email === DEMO_EMAIL

  const [hesapSilOnay, setHesapSilOnay] = useState(false)
  const [hesapSiliniyor, setHesapSiliniyor] = useState(false)

  const [fullName, setFullName] = useState(user?.user_metadata?.full_name ?? '')
  const [nameError, setNameError] = useState('')
  const [nameLoading, setNameLoading] = useState(false)

  const [password, setPassword] = useState('')
  const [passwordRepeat, setPasswordRepeat] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  const handleNameSubmit = async (e) => {
    e.preventDefault()
    setNameError('')

    if (!fullName.trim()) {
      setNameError('Ad soyad boş olamaz.')
      return
    }

    setNameLoading(true)
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName.trim() } })
    setNameLoading(false)

    if (error) {
      setNameError('Kaydedilemedi, lütfen tekrar deneyin.')
      return
    }

    showToast('Ad soyad güncellendi.')
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')

    if (password.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalı.')
      return
    }

    if (password !== passwordRepeat) {
      setPasswordError('Şifreler aynı değil.')
      return
    }

    setPasswordLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setPasswordLoading(false)

    if (error) {
      setPasswordError('Şifre değiştirilemedi, lütfen tekrar deneyin.')
      return
    }

    setPassword('')
    setPasswordRepeat('')
    showToast('Şifre güncellendi.')
  }

  const handleHesapSil = async () => {
    setHesapSiliniyor(true)
    const { error } = await supabase.rpc('delete_own_account')

    if (error) {
      setHesapSiliniyor(false)
      setHesapSilOnay(false)
      showToast('Hesap silinemedi, lütfen tekrar deneyin.', 'error')
      return
    }

    await supabase.auth.signOut()
    navigate('/giris')
    showToast('Hesabın silindi.')
  }

  return (
    <>
      <Navbar />
      <div className="container" style={{ maxWidth: 480 }}>
        <Link to="/" className="btn btn-outline-secondary btn-sm mb-4">
          ← Hayvanlarım
        </Link>

        <h2 className="mb-4">Profil ayarları</h2>

        {isDemo && (
          <div className="alert alert-info">
            Demo hesabında profil bilgileri değiştirilemez, çünkü bu hesabı herkes birlikte kullanıyor.
          </div>
        )}

        <form onSubmit={handleNameSubmit} className="card p-4 mb-4">
          <h5 className="mb-3">Ad soyad</h5>
          {nameError && <div className="alert alert-danger">{nameError}</div>}

          <div className="mb-3">
            <label className="form-label">Ad soyad</label>
            <input
              className="form-control"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              disabled={isDemo}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={nameLoading || isDemo}>
            {nameLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </form>

        <form onSubmit={handlePasswordSubmit} className="card p-4">
          <h5 className="mb-3">Şifre değiştir</h5>
          {passwordError && <div className="alert alert-danger">{passwordError}</div>}

          <div className="mb-3">
            <label className="form-label">Yeni şifre</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isDemo}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Yeni şifre (tekrar)</label>
            <input
              type="password"
              className="form-control"
              value={passwordRepeat}
              onChange={e => setPasswordRepeat(e.target.value)}
              disabled={isDemo}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={passwordLoading || isDemo}>
            {passwordLoading ? 'Kaydediliyor...' : 'Şifreyi değiştir'}
          </button>
        </form>

        <div className="card p-4 mt-4 border-danger">
          <h5 className="mb-3 text-danger">Tehlikeli alan</h5>
          <p className="text-muted">
            Hesabını sildiğinde tüm hayvanların ve aşı kayıtların da kalıcı olarak silinir. Bu işlem geri alınamaz.
          </p>
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={() => setHesapSilOnay(true)}
            disabled={isDemo}
          >
            Hesabımı tamamen sil
          </button>
          {isDemo && (
            <div className="form-text">Demo hesabı silinemez.</div>
          )}
        </div>
      </div>

      {hesapSilOnay && (
        <ConfirmModal
          title="Hesabı sil"
          message="Hesabını ve tüm hayvan/aşı kayıtlarını kalıcı olarak silmek istediğine emin misin? Bu işlem geri alınamaz."
          onConfirm={handleHesapSil}
          onCancel={() => setHesapSilOnay(false)}
          loading={hesapSiliniyor}
        />
      )}
    </>
  )
}
