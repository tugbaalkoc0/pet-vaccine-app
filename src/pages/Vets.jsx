import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

export default function Vets() {
  const [vets, setVets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('vets')
      .select('*')
      .order('clinic_name', { ascending: true })
      .then(({ data, error }) => {
        setLoading(false)
        if (error) {
          setError('Veterinerler yüklenemedi, lütfen sayfayı yenileyin.')
          return
        }
        setVets(data)
      })
  }, [])

  return (
    <>
      <Navbar />
      <div className="container">
        <h2 className="mb-4">Anlaşmalı Veterinerler</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading && (
          <div className="d-flex justify-content-center mt-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
          </div>
        )}

        {!loading && vets.length === 0 && (
          <p className="text-muted">Henüz anlaşmalı veteriner eklenmemiş.</p>
        )}

        <div className="row g-3">
          {vets.map(vet => (
            <div key={vet.id} className="col-12 col-md-6">
              <div className="card p-3 h-100">
                <h5 className="mb-1">{vet.clinic_name}</h5>
                {vet.vet_name && <div className="text-muted mb-2">{vet.vet_name}</div>}
                {vet.specialty && (
                  <span className="badge text-bg-secondary mb-2 align-self-start">{vet.specialty}</span>
                )}
                {vet.address && <div className="small">📍 {vet.address}</div>}
                {vet.phone && <div className="small">📞 {vet.phone}</div>}
                {vet.note && <div className="small text-muted mt-2">{vet.note}</div>}
                <Link to={`/veterinerler/${vet.id}/randevu-al`} className="btn btn-primary btn-sm mt-3 align-self-start">
                  Randevu Al
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
