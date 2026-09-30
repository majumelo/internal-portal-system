import prisma from '../config/db.js';

const controller = {
  async getAll(req, res) {
    try {
      const categorias = await prisma.categoria.findMany({
        where: { ativo: true },
        orderBy: { nome: 'asc' },
      });
      res.json(categorias);
    } catch (error) {
      console.error('Erro ao buscar categorias' + ':', error);
      res.status(500).json({ message: 'Erro ao buscar categorias' });
    }
  },
};

export default controller;
