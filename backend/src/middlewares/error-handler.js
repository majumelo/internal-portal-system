export function notFound(req, res) {
  res.status(404).json({ message: 'Rota não encontrada' });
}

// Garante que qualquer erro não tratado saia no formato { message }, sem detalhes internos
export function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON inválido' });
  }
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Origem não permitida' });
  }
  console.error(err);
  res.status(500).json({ message: 'Erro interno do servidor' });
}
