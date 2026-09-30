import prisma from '../services/db.js';

const controller = {
  async getAll(req, res) {
    try {
      const categorias = await prisma.categoria.findMany({
        where: { ativo: true },
        orderBy: { nome: 'asc' },
      });
      res.json(categorias);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar categorias', error: error.message });
    }
  },
};

export default controller;
