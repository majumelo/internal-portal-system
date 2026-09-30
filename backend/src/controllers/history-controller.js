import prisma from '../services/db.js';
import { parseId, visibilityWhere } from '../services/validation.js';

const controller = {
  async getBySolicitacao(req, res) {
    try {
      const solicitacaoId = parseId(req.params.solicitacaoId);
      if (!solicitacaoId) return res.status(400).json({ message: 'Código da solicitação inválido' });

      const solicitacao = await prisma.solicitacao.findFirst({
        where: { id: solicitacaoId, ...visibilityWhere(req.user) },
        select: { id: true },
      });
      if (!solicitacao) return res.status(404).json({ message: 'Solicitação não encontrada' });

      const historico = await prisma.historicoStatus.findMany({
        where: { solicitacaoId },
        orderBy: { alteradoEm: 'asc' },
        select: {
          id: true,
          statusAnterior: true,
          statusNovo: true,
          observacao: true,
          alteradoEm: true,
          usuario: { select: { id: true, nome: true } },
        },
      });
      res.json(historico);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar histórico', error: error.message });
    }
  },
};

export default controller;
