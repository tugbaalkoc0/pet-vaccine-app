import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const bosForm = { name: '', species: 'kedi', birth_date: '' }

export default function PetForm({ pet, onClose, onSaved }) {
  const { user } = useAuth()
  const [form, setForm] = useState(bosForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (pet) {
      setForm({
        name: pet.name ?? '',
        species: pet.species ?? 'kedi',
        birth_date: pet.birth_date ?? '',
      })
    } else {
      setForm(bosForm)
    }
  }, [pet])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('Hayvan adı zorunlu.')
      return
    }

    setLoading(true)

    const kayit = {
      name: form.name.trim(),
      species: form.species,
      birth_date: form.birth_date || null,
    }

    const { error } = pet
      ? await supabase.from('pets').update(kayit).eq('id', pet.id)
      : await supabase.from('pets').insert({ ...kayit, user_id: user.id })

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
              <h5 className="modal-title">{pet ? 'Hayvanı düzenle' : 'Yeni hayvan ekle'}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="mb-3">
                <label className="form-label">Hayvan adı</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Tür</label>
                <select
                  className="form-select"
                  value={form.species}
                  onChange={e => setForm({ ...form, species: e.target.value })}
                >
                  <option value="kedi">Kedi</option>
                  <option value="köpek">Köpek</option>
                  <option value="kuş">Kuş</option>
                  <option value="diğer">Diğer</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Doğum tarihi</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.birth_date}
                  onChange={e => setForm({ ...form, birth_date: e.target.value })}
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
