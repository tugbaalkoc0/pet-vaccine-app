export function hesaplaYas(birthDate) {
  if (!birthDate) return null

  const dogum = new Date(birthDate)
  const bugun = new Date()

  let yas = bugun.getFullYear() - dogum.getFullYear()
  const ayFarki = bugun.getMonth() - dogum.getMonth()

  if (ayFarki < 0 || (ayFarki === 0 && bugun.getDate() < dogum.getDate())) {
    yas--
  }

  return yas
}
