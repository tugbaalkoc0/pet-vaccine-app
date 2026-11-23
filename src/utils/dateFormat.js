export function turkceTarih(dateStr) {
  if (!dateStr) return ''

  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
