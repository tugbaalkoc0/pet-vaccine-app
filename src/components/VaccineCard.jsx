import VaccineStatusBadge from './VaccineStatusBadge'
import { turkceTarih } from '../utils/dateFormat'

export default function VaccineCard({ vaccination, onEdit, onDelete }) {
  return (
    <div className="card p-3 mb-2">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <b>{vaccination.vaccine_name}</b>
            <VaccineStatusBadge nextDueDate={vaccination.next_due_date} />
          </div>
          <div className="text-muted small">
            Yapılış: {turkceTarih(vaccination.date_given)}
            {vaccination.next_due_date && <> · Sonraki: {turkceTarih(vaccination.next_due_date)}</>}
          </div>
          {vaccination.notes && <div className="small mt-1">{vaccination.notes}</div>}
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => onEdit(vaccination)}>
            Düzenle
          </button>
          <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(vaccination)}>
            Sil
          </button>
        </div>
      </div>
    </div>
  )
}
