import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const controller = {

  async getAll(req, res) {
    try {
      const users = await prisma.users.findMany({
        select: { id: true, name: true, role: true, agencyId: true },
      });
      if (users.length === 0) return res.status(404).json({ message: 'Nenhum usuário encontrado' });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
    }
  },

  async getOne(req, res) {
    try {
      const id = Number(req.params.id);
      const user = await prisma.users.findUnique({
        where: { id },
        select: { id: true, name: true, role: true, agencyId: true },
      });
      if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar usuário', error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { name, password, role, agencyId } = req.body;
      const hash = await bcrypt.hash(password, 10);
      await prisma.users.create({
        data: { name, password: hash, role, agencyId: agencyId ? Number(agencyId) : null },
      });
      res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
    }
  },

  async editOne(req, res) {
    try {
      const id = Number(req.params.id);
      const { name, password, role, agencyId } = req.body;
      const data = {
        name, role,
        ...(agencyId !== undefined && { agencyId: agencyId ? Number(agencyId) : null }),
      };
      if (password) data.password = await bcrypt.hash(password, 10);
      await prisma.users.update({ where: { id }, data });
      res.json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
    }
  },

  async deleteOne(req, res) {
    try {
      const id = Number(req.params.id);
      await prisma.users.delete({ where: { id } });
      res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao deletar usuário', error: error.message });
    }
  },

    async login(req, res) {
        try {
            const { name, password, domain } = req.body;

            if (!name || !password) {
                return res.status(400).json({ message: 'Name e password são obrigatórios' });
            }
            
            const user = await prisma.users.findFirst({ where: { name } });
            if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

            const validPassword = user.password ? await bcrypt.compare(password, user.password) : false;
            if (!validPassword) return res.status(401).json({ message: 'Usuário ou Senha incorretos' });

            const token = jwt.sign(
                { id: user.id, role: user.role, name: user.name},
                secret,
                { expiresIn: '8h' }
            );

            res.json({ token });

        } catch (error) {
      res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
    }
    }, 
};
export default controller;
