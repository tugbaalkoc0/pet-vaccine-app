import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { supabase } from '../lib/supabase'
import { useToast } from '../context/ToastContext'
import Navbar from '../components/Navbar'
import VaccineCard from '../components/VaccineCard'
import VaccineForm from '../components/VaccineForm'
import ConfirmModal from '../components/ConfirmModal'
import { hesaplaYas } from '../utils/age'

const turEmoji = {
  kedi: '🐱',
  köpek: '🐶',
  kuş: '🐦',
  diğer: '🐾',
}

export default function PetDetail() {
  const { id } = useParams()
  const { showToast } = useToast()
  const [pet, setPet] = useState(null)
  const [vaccinations, setVaccinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formAcik, setFormAcik] = useState(false)
  const [duzenlenenAsi, setDuzenlenenAsi] = useState(null)
  const [silinecekAsi, setSilinecekAsi] = useState(null)
  const [siliniyor, setSiliniyor] = useState(false)

  const petiGetir = async () => {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !data) {
      setError('Hayvan bulunamadı.')
      return false
    }

    setPet(data)
    return true
  }

  const asilariGetir = async () => {
    const { data, error } = await supabase
      .from('vaccinations')
      .select('*')
      .eq('pet_id', id)
      .order('next_due_date', { ascending: true, nullsFirst: false })

    if (error) {
      setError('Aşılar yüklenemedi, lütfen sayfayı yenileyin.')
      return
    }

    setVaccinations(data)
  }

  const hepsiniGetir = async () => {
    setLoading(true)
    const petBulundu = await petiGetir()
    if (petBulundu) await asilariGetir()
    setLoading(false)
  }

  useEffect(() => {
    hepsiniGetir()
  }, [id])

  const handleYeniAsiEkle = () => {
    setDuzenlenenAsi(null)
    setFormAcik(true)
  }

  const handleAsiDuzenle = (asi) => {
    setDuzenlenenAsi(asi)
    setFormAcik(true)
  }

  const handleFormSaved = () => {
    const duzenlemeydi = Boolean(duzenlenenAsi)
    setFormAcik(false)
    asilariGetir()
    showToast(duzenlemeydi ? 'Aşı kaydı güncellendi.' : 'Aşı eklendi.')
  }

  const handleAsiSil = async () => {
    setSiliniyor(true)
    const { error } = await supabase.from('vaccinations').delete().eq('id', silinecekAsi.id)
    setSiliniyor(false)
    setSilinecekAsi(null)

    if (error) {
      showToast('Silinemedi, lütfen tekrar deneyin.', 'error')
      return
    }

    asilariGetir()
    showToast('Aşı kaydı silindi.')
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <Link to="/" className="btn btn-outline-secondary btn-sm mb-4">
          ← Hayvanlarım
        </Link>

        {loading && (
          <div className="d-flex justify-content-center mt-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
          </div>
        )}

        {!loading && error && <div className="alert alert-danger">{error}</div>}

        {!loading && pet && (
          <>
            <h2 className="mb-1">
              {turEmoji[pet.species] ?? '🐾'} {pet.name}
            </h2>
            <p className="text-muted">
              {pet.species ?? 'Tür belirtilmemiş'}
              {hesaplaYas(pet.birth_date) !== null && <> · {hesaplaYas(pet.birth_date)} yaşında</>}
            </p>

            <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
              <h5 className="mb-0">Aşılar</h5>
              <button className="btn btn-primary btn-sm" onClick={handleYeniAsiEkle}>
                + Aşı ekle
              </button>
            </div>

            {vaccinations.length === 0 && (
              <p className="text-muted">Henüz hiç aşı kaydı yok.</p>
            )}

            {vaccinations.map(asi => (
              <VaccineCard
                key={asi.id}
                vaccination={asi}
                onEdit={handleAsiDuzenle}
                onDelete={setSilinecekAsi}
              />
            ))}
          </>
        )}
      </div>

      {formAcik && (
        <VaccineForm
          petId={id}
          vaccination={duzenlenenAsi}
          onClose={() => setFormAcik(false)}
          onSaved={handleFormSaved}
        />
      )}

      {silinecekAsi && (
        <ConfirmModal
          title="Aşı kaydını sil"
          message={`"${silinecekAsi.vaccine_name}" aşı kaydı silinecek. Emin misin?`}
          onConfirm={handleAsiSil}
          onCancel={() => setSilinecekAsi(null)}
          loading={siliniyor}
        />
      )}
    </>
  )
}
