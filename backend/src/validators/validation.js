export function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function parseDate(value, endOfDay = false) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Colaboradores enxergam apenas as próprias solicitações; atendentes enxergam todas
export function visibilityWhere(user) {
  return user.perfil === 'ATENDENTE' ? {} : { solicitanteId: user.id };
}
