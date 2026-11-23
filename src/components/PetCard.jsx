import { useNavigate } from 'react-router'
import { hesaplaYas } from '../utils/age'

const turEmoji = {
  kedi: '🐱',
  köpek: '🐶',
  kuş: '🐦',
  diğer: '🐾',
}

export default function PetCard({ pet, onEdit, onDelete }) {
  const navigate = useNavigate()
  const yas = hesaplaYas(pet.birth_date)

  return (
    <div
      className="card p-3 mb-3"
      role="button"
      onClick={() => navigate(`/hayvan/${pet.id}`)}
    >
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h5 className="mb-1">
            {turEmoji[pet.species] ?? '🐾'} {pet.name}
          </h5>
          <div className="text-muted small">
            {pet.species ?? 'Tür belirtilmemiş'}
            {yas !== null && <> · {yas} yaşında</>}
          </div>
        </div>

        <div className="d-flex gap-2" onClick={e => e.stopPropagation()}>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => onEdit(pet)}
          >
            Düzenle
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => onDelete(pet)}
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  )
}
