export function formatDate(value?: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value))
}

export function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

export const statuses = ['Nova inscrição', 'Analisando', 'Quero conversar', 'Conversa realizada', 'Selecionado', 'Talvez futuramente', 'Não selecionado']
