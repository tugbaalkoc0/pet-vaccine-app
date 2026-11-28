import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const bosForm = { vaccine_name: '', date_given: '', next_due_date: '', notes: '' }

const sikKullanilanAsilar = ['Kuduz', 'Karma', 'İç parazit', 'Dış parazit', 'Lösemi (FeLV)', 'Bronşin']

const tarihEkleAy = (tarihStr, ay) => {
  const tarih = new Date(tarihStr)
  tarih.setMonth(tarih.getMonth() + ay)
  return tarih.toISOString().slice(0, 10)
}

export default function VaccineForm({ petId, species, vaccination, onClose, onSaved }) {
  const [form, setForm] = useState(bosForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [kilavuzlar, setKilavuzlar] = useState([])
  const [oneriNotu, setOneriNotu] = useState('')

  useEffect(() => {
    if (vaccination) {
      setForm({
        vaccine_name: vaccination.vaccine_name ?? '',
        date_given: vaccination.date_given ?? '',
        next_due_date: vaccination.next_due_date ?? '',
        notes: vaccination.notes ?? '',
      })
    } else {
      setForm(bosForm)
    }
  }, [vaccination])

  useEffect(() => {
    if (!species || vaccination) return

    supabase
      .from('vaccine_guidelines')
      .select('vaccine_name, booster_interval_months, note')
      .eq('species', species)
      .then(({ data }) => setKilavuzlar(data ?? []))
  }, [species, vaccination])

  useEffect(() => {
    if (vaccination || !form.vaccine_name || !form.date_given || form.next_due_date) {
      setOneriNotu('')
      return
    }

    const kilavuz = kilavuzlar.find(
      k => k.vaccine_name.toLocaleLowerCase('tr') === form.vaccine_name.trim().toLocaleLowerCase('tr')
    )

    if (!kilavuz) {
      setOneriNotu('')
      return
    }

    setForm(f => ({ ...f, next_due_date: tarihEkleAy(form.date_given, kilavuz.booster_interval_months) }))
    setOneriNotu(
      `Önerilen tarih otomatik dolduruldu (${kilavuz.booster_interval_months} ay sonra). ` +
      (kilavuz.note ? `${kilavuz.note} ` : '') +
      'Genel referanstır, kesin karar için veterinerine danış.'
    )
  }, [form.vaccine_name, form.date_given, kilavuzlar, vaccination])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.vaccine_name.trim() || !form.date_given) {
      setError('Aşı adı ve yapılış tarihi zorunlu.')
      return
    }

    if (form.date_given > new Date().toISOString().slice(0, 10)) {
      setError('Yapılış tarihi gelecekte olamaz.')
      return
    }

    if (form.next_due_date && form.next_due_date < form.date_given) {
      setError('Sonraki tarih, yapılış tarihinden önce olamaz.')
      return
    }

    setLoading(true)

    const kayit = {
      vaccine_name: form.vaccine_name.trim(),
      date_given: form.date_given,
      next_due_date: form.next_due_date || null,
      notes: form.notes.trim() || null,
    }

    const { error } = vaccination
      ? await supabase.from('vaccinations').update(kayit).eq('id', vaccination.id)
      : await supabase.from('vaccinations').insert({ ...kayit, pet_id: petId })

    setLoading(false)

    if (error) {
      setError('Kaydedilemedi, lütfen tekrar deneyin.')
      return
    }

    onSaved()
  }

  return (
    <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{vaccination ? 'Aşıyı düzenle' : 'Aşı ekle'}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="mb-3">
                <label className="form-label">Aşı adı</label>
                <input
                  className="form-control"
                  list="sik-kullanilan-asilar"
                  value={form.vaccine_name}
                  onChange={e => setForm({ ...form, vaccine_name: e.target.value })}
                  required
                />
                <datalist id="sik-kullanilan-asilar">
                  {sikKullanilanAsilar.map(ad => <option key={ad} value={ad} />)}
                </datalist>
              </div>

              <div className="mb-3">
                <label className="form-label">Yapılış tarihi</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.date_given}
                  onChange={e => setForm({ ...form, date_given: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Sonraki tarih</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.next_due_date}
                  onChange={e => setForm({ ...form, next_due_date: e.target.value })}
                />
                {oneriNotu && <div className="form-text">{oneriNotu}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Not</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Vazgeç
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
