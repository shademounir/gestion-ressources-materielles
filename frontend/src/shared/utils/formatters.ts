export function formatDate(value: string | null): string {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('fr-FR').format(new Date(value));
}

export function formatCurrency(value: string | null): string {
  if (!value) {
    return '-';
  }

  return new Intl.NumberFormat('fr-FR', {
    currency: 'MAD',
    style: 'currency',
  }).format(Number(value));
}
