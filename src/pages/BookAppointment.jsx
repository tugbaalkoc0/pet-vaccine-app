import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { supabase } from '../lib/supabase'
import { useToast } from '../context/ToastContext'
import Navbar from '../components/Navbar'
import { turkceTarih } from '../utils/dateFormat'

export default function BookAppointment() {
  const { vetId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [vet, setVet] = useState(null)
  const [pets, setPets] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [seciliSlotId, setSeciliSlotId] = useState(null)
  const [seciliPetId, setSeciliPetId] = useState('')
  const [kaydediliyor, setKaydediliyor] = useState(false)

  const slotlariGetir = async () => {
    const { data, error } = await supabase
      .from('vet_slots')
      .select('*')
      .eq('vet_id', vetId)
      .eq('is_booked', false)
      .order('slot_date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) return
    setSlots(data)
  }

  useEffect(() => {
    const hepsiniGetir = async () => {
      setLoading(true)

      const [{ data: vetData, error: vetError }, { data: petData }] = await Promise.all([
        supabase.from('vets').select('*').eq('id', vetId).maybeSingle(),
        supabase.from('pets').select('id, name').order('name'),
      ])

      if (vetError || !vetData) {
        setError('Veteriner bulunamadı.')
        setLoading(false)
        return
      }

      setVet(vetData)
      setPets(petData ?? [])
      await slotlariGetir()
      setLoading(false)
    }

    hepsiniGetir()
  }, [vetId])

  useEffect(() => {
    const channel = supabase
      .channel(`vet-slots-${vetId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'vet_slots', filter: `vet_id=eq.${vetId}` },
        () => {
          slotlariGetir()
          setSeciliSlotId(null)
        })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [vetId])

  const tarihlereGoreGrupla = () => {
    const grup = {}
    for (const slot of slots) {
      if (!grup[slot.slot_date]) grup[slot.slot_date] = []
      grup[slot.slot_date].push(slot)
    }
    return grup
  }

  const handleRandevuAl = async () => {
    if (!seciliSlotId || !seciliPetId) {
      setError('Lütfen bir saat ve hayvan seç.')
      return
    }

    setError('')
    setKaydediliyor(true)

    const { error } = await supabase.rpc('book_appointment', {
      p_slot_id: seciliSlotId,
      p_pet_id: seciliPetId,
    })

    setKaydediliyor(false)

    if (error) {
      setError(error.message === 'Bu saat artık müsait değil.' ? error.message : 'Randevu alınamadı, lütfen tekrar deneyin.')
      slotlariGetir()
      setSeciliSlotId(null)
      return
    }

    showToast('Randevu alındı.')
    navigate('/randevularim')
  }

  const gruplar = tarihlereGoreGrupla()

  return (
    <>
      <Navbar />
      <div className="container">
        {loading && (
          <div className="d-flex justify-content-center mt-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
          </div>
        )}

        {!loading && error && !vet && <div className="alert alert-danger">{error}</div>}

        {!loading && vet && (
          <>
            <h2 className="mb-1">{vet.clinic_name}</h2>
            {vet.vet_name && <p className="text-muted">{vet.vet_name}</p>}

            {error && <div className="alert alert-danger">{error}</div>}

            {pets.length === 0 && (
              <div className="alert alert-warning">
                Randevu alabilmek için önce bir hayvan eklemelisin.
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Hayvan</label>
              <select
                className="form-select"
                value={seciliPetId}
                onChange={e => setSeciliPetId(e.target.value)}
              >
                <option value="">Seçiniz</option>
                {pets.map(pet => (
                  <option key={pet.id} value={pet.id}>{pet.name}</option>
                ))}
              </select>
            </div>

            <h5 className="mb-3">Müsait saatler</h5>

            {Object.keys(gruplar).length === 0 && (
              <p className="text-muted">Şu an müsait saat yok.</p>
            )}

            {Object.entries(gruplar).map(([tarih, gunSlotlari]) => (
              <div key={tarih} className="mb-3">
                <div className="fw-bold mb-2">{turkceTarih(tarih)}</div>
                <div className="d-flex flex-wrap gap-2">
                  {gunSlotlari.map(slot => (
                    <button
                      key={slot.id}
                      type="button"
                      className={`btn btn-sm ${seciliSlotId === slot.id ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setSeciliSlotId(slot.id)}
                    >
                      {slot.start_time.slice(0, 5)}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button
              className="btn btn-success mt-3"
              disabled={!seciliSlotId || !seciliPetId || kaydediliyor}
              onClick={handleRandevuAl}
            >
              {kaydediliyor ? 'Kaydediliyor...' : 'Randevuyu Onayla'}
            </button>
          </>
        )}
      </div>
    </>
  )
}
