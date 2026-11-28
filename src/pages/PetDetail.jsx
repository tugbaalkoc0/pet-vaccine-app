import { Link, useParams } from 'react-router'
import Navbar from '../components/Navbar'
import { usePet } from '../hooks/usePet'
import { hesaplaYas } from '../utils/age'

const turEmoji = {
  kedi: '🐱',
  köpek: '🐶',
  kuş: '🐦',
  diğer: '🐾',
}

export default function PetDetail() {
  const { id } = useParams()
  const { pet, loading, error } = usePet(id)

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

            <div className="row g-3 mt-2">
              <div className="col-6">
                <Link
                  to={`/hayvan/${id}/asilar`}
                  className="card p-4 text-center text-decoration-none text-reset h-100"
                >
                  <div className="fs-1 mb-2">💉</div>
                  <div className="fw-bold">Aşılar</div>
                </Link>
              </div>
              <div className="col-6">
                <Link
                  to={`/hayvan/${id}/ziyaretler`}
                  className="card p-4 text-center text-decoration-none text-reset h-100"
                >
                  <div className="fs-1 mb-2">🩺</div>
                  <div className="fw-bold">Veteriner Ziyaretleri</div>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
