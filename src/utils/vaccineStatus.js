const GUN_MS = 24 * 60 * 60 * 1000
const YAKLASIYOR_ESIGI_GUN = 30

export function asiDurumu(nextDueDate) {
  if (!nextDueDate) return 'tarih-yok'

  const bugun = new Date()
  bugun.setHours(0, 0, 0, 0)

  const hedefTarih = new Date(nextDueDate)
  hedefTarih.setHours(0, 0, 0, 0)

  const kalanGun = Math.round((hedefTarih - bugun) / GUN_MS)

  if (kalanGun < 0) return 'gecikmis'
  if (kalanGun <= YAKLASIYOR_ESIGI_GUN) return 'yaklasiyor'
  return 'zamani-var'
}

export const durumBilgisi = {
  'gecikmis': { etiket: 'Gecikmiş', renk: 'danger' },
  'yaklasiyor': { etiket: 'Yaklaşıyor', renk: 'warning' },
  'zamani-var': { etiket: 'Zamanı var', renk: 'success' },
  'tarih-yok': { etiket: 'Tarih yok', renk: 'secondary' },
}
