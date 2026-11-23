import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import { hesaplaYas } from '../utils/age'

const turEmoji = {
  kedi: '🐱',
  köpek: '🐶',
  kuş: '🐦',
  diğer: '🐾',
}

export default function PetDetail() {
  const { id } = useParams()
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const getir = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      setLoading(false)

      if (error || !data) {
        setError('Hayvan bulunamadı.')
        return
      }

      setPet(data)
    }

    getir()
  }, [id])

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

            <div className="card p-4 mt-4">
              <h5>Aşılar</h5>
              <p className="text-muted mb-0">Aşı takibi Faz 5'te eklenecek.</p>
            </div>
          </>
        )}
      </div>
    </>
  )
}
