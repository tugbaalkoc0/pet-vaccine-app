import { turkceTarih } from '../utils/dateFormat'

export default function VisitCard({ visit, onEdit, onDelete }) {
  return (
    <div className="card p-3 mb-2">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <b>{visit.reason}</b>
            <span className="text-muted small">{turkceTarih(visit.visit_date)}</span>
          </div>
          {visit.vet_name && <div className="text-muted small">{visit.vet_name}</div>}
          {visit.procedure_notes && (
            <div className="small mt-1"><b>Yapılan işlem:</b> {visit.procedure_notes}</div>
          )}
          {visit.recommendation && (
            <div className="small mt-1"><b>Veteriner önerisi:</b> {visit.recommendation}</div>
          )}
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => onEdit(visit)}>
            Düzenle
          </button>
          <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(visit)}>
            Sil
          </button>
        </div>
      </div>
    </div>
  )
}
