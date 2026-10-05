import prisma from '../config/db.js';
import { parseId, parseDate, visibilityWhere } from '../validators/validation.js';

const STATUS_VALUES = ['ABERTO', 'EM_ATENDIMENTO', 'CONCLUIDO'];

const listagemSelect = {
  id: true,
  titulo: true,
  descricao: true,
  status: true,
  criadoEm: true,
  atualizadoEm: true,
  categoriaId: true,
  solicitanteId: true,
  categoria: { select: { id: true, nome: true } },
  solicitante: { select: { id: true, nome: true } },
};

function handlePrismaError(res, error, notFoundMessage) {
  if (error.code === 'P2025') {
    return res.status(404).json({ message: notFoundMessage || 'Registro não encontrado' });
  }
  if (error.code === 'P2003') {
    return res.status(400).json({ message: 'Categoria informada é inválida' });
  }
  console.error('Erro ao processar a solicitação:', error);
  return res.status(500).json({ message: 'Erro ao processar a solicitação' });
}

// fluxo linear, sem volta; concluido é final
const PROXIMO_STATUS = { ABERTO: 'EM_ATENDIMENTO', EM_ATENDIMENTO: 'CONCLUIDO' };

function validateTitulo(titulo) {
  if (typeof titulo !== 'string' || titulo.trim().length < 3) {
    return 'Título deve ter pelo menos 3 caracteres';
  }
  if (titulo.trim().length > 150) {
    return 'Título deve ter no máximo 150 caracteres';
  }
  return null;
}

function validateDescricao(descricao) {
  if (typeof descricao !== 'string' || !descricao.trim()) {
    return 'Descrição é obrigatória';
  }
  return null;
}

async function findCategoriaAtiva(categoriaId) {
  const id = parseId(categoriaId);
  if (!id) return null;
  const categoria = await prisma.categoria.findUnique({ where: { id } });
  return categoria?.ativo ? categoria : null;
}

const controller = {
  async getAll(req, res) {
    try {
      const { categoria, status, dataInicio, dataFim, texto } = req.query;
      const where = visibilityWhere(req.user);

      if (categoria) {
        const categoriaId = parseId(categoria);
        if (!categoriaId) return res.status(400).json({ message: 'Categoria informada é inválida' });
        where.categoriaId = categoriaId;
      }
      if (status) {
        if (!STATUS_VALUES.includes(status)) {
          return res.status(400).json({ message: `Status deve ser um de: ${STATUS_VALUES.join(', ')}` });
        }
        where.status = status;
      }
      if (texto) where.titulo = { contains: String(texto), mode: 'insensitive' };
      if (dataInicio || dataFim) {
        where.criadoEm = {};
        if (dataInicio) {
          const inicio = parseDate(dataInicio);
          if (!inicio) return res.status(400).json({ message: 'Data inicial inválida (use AAAA-MM-DD)' });
          where.criadoEm.gte = inicio;
        }
        if (dataFim) {
          const fim = parseDate(dataFim, true);
          if (!fim) return res.status(400).json({ message: 'Data final inválida (use AAAA-MM-DD)' });
          where.criadoEm.lte = fim;
        }
        if (where.criadoEm.gte && where.criadoEm.lte && where.criadoEm.gte > where.criadoEm.lte) {
          return res.status(400).json({ message: 'A data inicial não pode ser posterior à data final' });
        }
      }

      const solicitacoes = await prisma.solicitacao.findMany({
        where,
        select: listagemSelect,
        orderBy: { criadoEm: 'desc' },
      });
      res.json(solicitacoes);
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      res.status(500).json({ message: 'Erro ao buscar solicitações' });
    }
  },

  async dashboard(req, res) {
    try {
      const visivel = visibilityWhere(req.user);
      const [total, aberto, emAtendimento, concluido] = await Promise.all([
        prisma.solicitacao.count({ where: visivel }),
        prisma.solicitacao.count({ where: { ...visivel, status: 'ABERTO' } }),
        prisma.solicitacao.count({ where: { ...visivel, status: 'EM_ATENDIMENTO' } }),
        prisma.solicitacao.count({ where: { ...visivel, status: 'CONCLUIDO' } }),
      ]);
      res.json({ total, aberto, emAtendimento, concluido });
    } catch (error) {
      console.error('Erro ao buscar indicadores:', error);
      res.status(500).json({ message: 'Erro ao buscar indicadores' });
    }
  },

  async getOne(req, res) {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Código da solicitação inválido' });
      const solicitacao = await prisma.solicitacao.findFirst({
        where: { id, ...visibilityWhere(req.user) },
        select: listagemSelect,
      });
      if (!solicitacao) return res.status(404).json({ message: 'Solicitação não encontrada' });
      res.json(solicitacao);
    } catch (error) {
      console.error('Erro ao buscar solicitação:', error);
      res.status(500).json({ message: 'Erro ao buscar solicitação' });
    }
  },

  async create(req, res) {
    try {
      const { titulo, descricao, categoriaId } = req.body;

      const erro = validateTitulo(titulo) || validateDescricao(descricao);
      if (erro) return res.status(400).json({ message: erro });
      if (!categoriaId) {
        return res.status(400).json({ message: 'Categoria é obrigatória' });
      }

      const categoria = await findCategoriaAtiva(categoriaId);
      if (!categoria) {
        return res.status(400).json({ message: 'Categoria informada é inválida' });
      }

      const solicitacao = await prisma.solicitacao.create({
        data: {
          titulo: titulo.trim(),
          descricao: descricao.trim(),
          categoriaId: categoria.id,
          solicitanteId: req.user.id,
          // nested write: o registro inicial do histórico entra na mesma transação
          historicos: {
            create: { statusAnterior: null, statusNovo: 'ABERTO', usuarioId: req.user.id },
          },
        },
        select: listagemSelect,
      });
      res.status(201).json(solicitacao);
    } catch (error) {
      handlePrismaError(res, error);
    }
  },

  async editOne(req, res) {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Código da solicitação inválido' });
      const atual = await prisma.solicitacao.findUnique({ where: { id } });
      if (!atual) return res.status(404).json({ message: 'Solicitação não encontrada' });
      if (atual.solicitanteId !== req.user.id) {
        return res.status(403).json({ message: 'Você só pode editar solicitações que você criou' });
      }
      if (atual.status !== 'ABERTO') {
        return res.status(400).json({ message: 'Somente solicitações abertas podem ser editadas' });
      }

      const { titulo, descricao, categoriaId } = req.body;
      const data = {};
      if (titulo !== undefined) {
        const erro = validateTitulo(titulo);
        if (erro) return res.status(400).json({ message: erro });
        data.titulo = titulo.trim();
      }
      if (descricao !== undefined) {
        const erro = validateDescricao(descricao);
        if (erro) return res.status(400).json({ message: erro });
        data.descricao = descricao.trim();
      }
      if (categoriaId !== undefined) {
        const categoria = await findCategoriaAtiva(categoriaId);
        if (!categoria) {
          return res.status(400).json({ message: 'Categoria informada é inválida' });
        }
        data.categoriaId = categoria.id;
      }
      data.atualizadoEm = new Date();

      const solicitacao = await prisma.solicitacao.update({
        where: { id },
        data,
        select: listagemSelect,
      });
      res.json(solicitacao);
    } catch (error) {
      handlePrismaError(res, error, 'Solicitação não encontrada');
    }
  },

  async deleteOne(req, res) {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Código da solicitação inválido' });
      const atual = await prisma.solicitacao.findUnique({ where: { id } });
      if (!atual) return res.status(404).json({ message: 'Solicitação não encontrada' });
      if (atual.solicitanteId !== req.user.id) {
        return res.status(403).json({ message: 'Você só pode excluir solicitações que você criou' });
      }
      if (atual.status !== 'ABERTO') {
        return res.status(400).json({ message: 'Somente solicitações abertas podem ser excluídas' });
      }

      await prisma.solicitacao.delete({ where: { id } });
      res.json({ message: 'Solicitação excluída com sucesso' });
    } catch (error) {
      handlePrismaError(res, error, 'Solicitação não encontrada');
    }
  },

  async changeStatus(req, res) {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Código da solicitação inválido' });
      const { status, observacao } = req.body;

      if (!STATUS_VALUES.includes(status)) {
        return res.status(400).json({ message: `Status deve ser um de: ${STATUS_VALUES.join(', ')}` });
      }
      if (observacao != null && typeof observacao !== 'string') {
        return res.status(400).json({ message: 'Observação inválida' });
      }
      if (observacao && observacao.trim().length > 500) {
        return res.status(400).json({ message: 'Observação deve ter no máximo 500 caracteres' });
      }

      const atual = await prisma.solicitacao.findUnique({ where: { id } });
      if (!atual) return res.status(404).json({ message: 'Solicitação não encontrada' });
      if (atual.status === status) {
        return res.status(400).json({ message: 'A solicitação já está com esse status' });
      }
      if (atual.status === 'CONCLUIDO') {
        return res.status(409).json({ message: 'Solicitações concluídas não podem ter o status alterado' });
      }
      if (PROXIMO_STATUS[atual.status] !== status) {
        return res.status(409).json({
          message: 'Uma solicitação aberta precisa passar por Em Atendimento antes de ser concluída',
        });
      }

      // status e histórico gravados juntos ou nenhum dos dois
      const [solicitacao] = await prisma.$transaction([
        prisma.solicitacao.update({
          where: { id },
          data: { status, atualizadoEm: new Date() },
          select: listagemSelect,
        }),
        prisma.historicoStatus.create({
          data: {
            solicitacaoId: id,
            statusAnterior: atual.status,
            statusNovo: status,
            usuarioId: req.user.id,
            observacao: observacao?.trim() || null,
          },
        }),
      ]);

      res.json(solicitacao);
    } catch (error) {
      handlePrismaError(res, error, 'Solicitação não encontrada');
    }
  },
};

export default controller;
