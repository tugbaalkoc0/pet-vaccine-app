import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { supabase } from '../lib/supabase'
import { useToast } from '../context/ToastContext'
import Navbar from '../components/Navbar'
import VisitCard from '../components/VisitCard'
import VisitForm from '../components/VisitForm'
import ConfirmModal from '../components/ConfirmModal'
import { usePet } from '../hooks/usePet'

export default function PetVisits() {
  const { id } = useParams()
  const { showToast } = useToast()
  const { pet } = usePet(id)
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formAcik, setFormAcik] = useState(false)
  const [duzenlenenZiyaret, setDuzenlenenZiyaret] = useState(null)
  const [silinecekZiyaret, setSilinecekZiyaret] = useState(null)
  const [siliniyor, setSiliniyor] = useState(false)

  const ziyaretleriGetir = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('vet_visits')
      .select('*')
      .eq('pet_id', id)
      .order('visit_date', { ascending: false })

    setLoading(false)

    if (error) {
      setError('Ziyaretler yüklenemedi, lütfen sayfayı yenileyin.')
      return
    }

    setVisits(data)
  }

  useEffect(() => {
    ziyaretleriGetir()
  }, [id])

  useEffect(() => {
    const channel = supabase
      .channel(`pet-visits-${id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'vet_visits', filter: `pet_id=eq.${id}` },
        ziyaretleriGetir)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id])

  const handleYeniZiyaretEkle = () => {
    setDuzenlenenZiyaret(null)
    setFormAcik(true)
  }

  const handleZiyaretDuzenle = (ziyaret) => {
    setDuzenlenenZiyaret(ziyaret)
    setFormAcik(true)
  }

  const handleFormSaved = () => {
    const duzenlemeydi = Boolean(duzenlenenZiyaret)
    setFormAcik(false)
    ziyaretleriGetir()
    showToast(duzenlemeydi ? 'Ziyaret kaydı güncellendi.' : 'Ziyaret eklendi.')
  }

  const handleZiyaretSil = async () => {
    setSiliniyor(true)
    const { error } = await supabase.from('vet_visits').delete().eq('id', silinecekZiyaret.id)
    setSiliniyor(false)
    setSilinecekZiyaret(null)

    if (error) {
      showToast('Silinemedi, lütfen tekrar deneyin.', 'error')
      return
    }

    ziyaretleriGetir()
    showToast('Ziyaret kaydı silindi.')
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <Link to={`/hayvan/${id}`} className="btn btn-outline-secondary btn-sm mb-4">
          ← {pet?.name ?? 'Hayvan'}
        </Link>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Veteriner Ziyaretleri</h2>
          <button className="btn btn-primary btn-sm" onClick={handleYeniZiyaretEkle}>
            + Ziyaret ekle
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

        {!loading && visits.length === 0 && (
          <p className="text-muted">Henüz hiç ziyaret kaydı yok.</p>
        )}

        {!loading && visits.map(ziyaret => (
          <VisitCard
            key={ziyaret.id}
            visit={ziyaret}
            onEdit={handleZiyaretDuzenle}
            onDelete={setSilinecekZiyaret}
          />
        ))}
      </div>

      {formAcik && (
        <VisitForm
          petId={id}
          visit={duzenlenenZiyaret}
          onClose={() => setFormAcik(false)}
          onSaved={handleFormSaved}
        />
      )}

      {silinecekZiyaret && (
        <ConfirmModal
          title="Ziyaret kaydını sil"
          message="Bu ziyaret kaydı silinecek. Emin misin?"
          onConfirm={handleZiyaretSil}
          onCancel={() => setSilinecekZiyaret(null)}
          loading={siliniyor}
        />
      )}
    </>
  )
}
