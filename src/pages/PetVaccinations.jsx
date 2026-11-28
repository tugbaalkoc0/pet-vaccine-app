import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { supabase } from '../lib/supabase'
import { useToast } from '../context/ToastContext'
import Navbar from '../components/Navbar'
import VaccineCard from '../components/VaccineCard'
import VaccineForm from '../components/VaccineForm'
import ConfirmModal from '../components/ConfirmModal'
import { usePet } from '../hooks/usePet'

export default function PetVaccinations() {
  const { id } = useParams()
  const { showToast } = useToast()
  const { pet } = usePet(id)
  const [vaccinations, setVaccinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formAcik, setFormAcik] = useState(false)
  const [duzenlenenAsi, setDuzenlenenAsi] = useState(null)
  const [silinecekAsi, setSilinecekAsi] = useState(null)
  const [siliniyor, setSiliniyor] = useState(false)

  const asilariGetir = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('vaccinations')
      .select('*')
      .eq('pet_id', id)
      .order('next_due_date', { ascending: true, nullsFirst: false })

    setLoading(false)

    if (error) {
      setError('Aşılar yüklenemedi, lütfen sayfayı yenileyin.')
      return
    }

    setVaccinations(data)
  }

  useEffect(() => {
    asilariGetir()
  }, [id])

  useEffect(() => {
    const channel = supabase
      .channel(`pet-vaccinations-${id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'vaccinations', filter: `pet_id=eq.${id}` },
        asilariGetir)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
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
        <Link to={`/hayvan/${id}`} className="btn btn-outline-secondary btn-sm mb-4">
          ← {pet?.name ?? 'Hayvan'}
        </Link>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Aşılar</h2>
          <button className="btn btn-primary btn-sm" onClick={handleYeniAsiEkle}>
            + Aşı ekle
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading && (
          <div className="d-flex justify-content-center mt-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
          </div>
        )}

        {!loading && vaccinations.length === 0 && (
          <p className="text-muted">Henüz hiç aşı kaydı yok.</p>
        )}

        {!loading && vaccinations.map(asi => (
          <VaccineCard
            key={asi.id}
            vaccination={asi}
            onEdit={handleAsiDuzenle}
            onDelete={setSilinecekAsi}
          />
        ))}
      </div>

      {formAcik && (
        <VaccineForm
          petId={id}
          species={pet?.species}
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
