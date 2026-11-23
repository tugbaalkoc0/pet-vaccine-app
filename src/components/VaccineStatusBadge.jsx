import { asiDurumu, durumBilgisi } from '../utils/vaccineStatus'

export default function VaccineStatusBadge({ nextDueDate }) {
  const durum = asiDurumu(nextDueDate)
  const { etiket, renk } = durumBilgisi[durum]

  return <span className={`badge bg-${renk}`}>{etiket}</span>
}
