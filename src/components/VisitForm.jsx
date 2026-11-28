import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const bosForm = { visit_date: '', vet_name: '', reason: '', procedure_notes: '', recommendation: '' }

export default function VisitForm({ petId, visit, onClose, onSaved }) {
  const [form, setForm] = useState(bosForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (visit) {
      setForm({
        visit_date: visit.visit_date ?? '',
        vet_name: visit.vet_name ?? '',
        reason: visit.reason ?? '',
        procedure_notes: visit.procedure_notes ?? '',
        recommendation: visit.recommendation ?? '',
      })
    } else {
      setForm(bosForm)
    }
  }, [visit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.visit_date || !form.reason.trim()) {
      setError('Ziyaret tarihi ve gidiş sebebi zorunlu.')
      return
    }

    if (form.visit_date > new Date().toISOString().slice(0, 10)) {
      setError('Ziyaret tarihi gelecekte olamaz.')
      return
    }

    setLoading(true)

    const kayit = {
      visit_date: form.visit_date,
      vet_name: form.vet_name.trim() || null,
      reason: form.reason.trim(),
      procedure_notes: form.procedure_notes.trim() || null,
      recommendation: form.recommendation.trim() || null,
    }

    const { error } = visit
      ? await supabase.from('vet_visits').update(kayit).eq('id', visit.id)
      : await supabase.from('vet_visits').insert({ ...kayit, pet_id: petId })

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
              <h5 className="modal-title">{visit ? 'Ziyareti düzenle' : 'Ziyaret ekle'}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="mb-3">
                <label className="form-label">Ziyaret tarihi</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.visit_date}
                  onChange={e => setForm({ ...form, visit_date: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Veteriner / klinik</label>
                <input
                  className="form-control"
                  value={form.vet_name}
                  onChange={e => setForm({ ...form, vet_name: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Gidiş sebebi</label>
                <input
                  className="form-control"
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Yapılan işlem</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={form.procedure_notes}
                  onChange={e => setForm({ ...form, procedure_notes: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Veteriner önerisi</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={form.recommendation}
                  onChange={e => setForm({ ...form, recommendation: e.target.value })}
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
