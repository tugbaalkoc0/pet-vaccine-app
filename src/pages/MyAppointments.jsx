import { useEffect, useState } from 'react'
import { useToast } from '../context/ToastContext'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import { turkceTarih } from '../utils/dateFormat'
import ConfirmModal from '../components/ConfirmModal'

export default function MyAppointments() {
  const { showToast } = useToast()
  const [randevular, setRandevular] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [iptalEdilecek, setIptalEdilecek] = useState(null)
  const [iptalEdiliyor, setIptalEdiliyor] = useState(false)

  const randevulariGetir = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('appointments')
      .select('*, vets(clinic_name, vet_name), pets(name), vet_slots(slot_date, start_time)')
      .order('created_at', { ascending: false })

    setLoading(false)

    if (error) {
      setError('Randevular yüklenemedi, lütfen sayfayı yenileyin.')
      return
    }

    setRandevular(data)
  }

  useEffect(() => {
    randevulariGetir()
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('randevularim')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, randevulariGetir)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleIptal = async () => {
    setIptalEdiliyor(true)
    const { error } = await supabase.rpc('cancel_appointment', { p_appointment_id: iptalEdilecek.id })
    setIptalEdiliyor(false)
    setIptalEdilecek(null)

    if (error) {
      showToast('İptal edilemedi, lütfen tekrar deneyin.', 'error')
      return
    }

    randevulariGetir()
    showToast('Randevu iptal edildi.')
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h2 className="mb-4">Randevularım</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading && (
          <div className="d-flex justify-content-center mt-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
          </div>
        )}

        {!loading && randevular.length === 0 && (
          <p className="text-muted">Henüz hiç randevun yok.</p>
        )}

        {!loading && randevular.map(randevu => (
          <div key={randevu.id} className="card p-3 mb-2">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <b>{randevu.vets?.clinic_name}</b>
                  <span className={`badge ${randevu.status === 'iptal' ? 'text-bg-secondary' : 'text-bg-success'}`}>
                    {randevu.status === 'iptal' ? 'İptal edildi' : 'Onaylandı'}
                  </span>
                </div>
                <div className="text-muted small">
                  {randevu.pets?.name} ·{' '}
                  {turkceTarih(randevu.vet_slots?.slot_date)} saat {randevu.vet_slots?.start_time?.slice(0, 5)}
                </div>
              </div>

              {randevu.status === 'onaylandı' && (
                <button className="btn btn-outline-danger btn-sm" onClick={() => setIptalEdilecek(randevu)}>
                  İptal et
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {iptalEdilecek && (
        <ConfirmModal
          title="Randevuyu iptal et"
          message="Bu randevu iptal edilecek. Emin misin?"
          onConfirm={handleIptal}
          onCancel={() => setIptalEdilecek(null)}
          loading={iptalEdiliyor}
        />
      )}
    </>
  )
}
