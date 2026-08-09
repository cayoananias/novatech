const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0))
}

export function formatDate(value) {
  if (!value) {
    return 'Agora'
  }

  const date = value?.toDate ? value.toDate() : new Date(value)

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}