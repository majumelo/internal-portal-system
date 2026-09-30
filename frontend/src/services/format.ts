import type { Status } from './types';

const STATUS_LABELS: Record<Status, string> = {
  ABERTO: 'Aberto',
  EM_ATENDIMENTO: 'Em Atendimento',
  CONCLUIDO: 'Concluído',
};

export function statusLabel(status: Status): string {
  return STATUS_LABELS[status] ?? status;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
