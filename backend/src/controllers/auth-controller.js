import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../services/db.js';

const controller = {
  async login(req, res) {
    try {
      const { login, senha } = req.body;

      if (!login || !senha) {
        return res.status(400).json({ message: 'Login e senha são obrigatórios' });
      }

      const user = await prisma.usuario.findFirst({
        where: { login, ativo: true },
      });
      const validPassword = user
        ? await bcrypt.compare(senha, user.senhaHash)
        : false;
      if (!validPassword) {
        return res.status(401).json({ message: 'Usuário ou senha incorretos' });
      }

      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET não está configurado.');
        return res.status(500).json({ message: 'Configuração de autenticação incompleta' });
      }

      const token = jwt.sign(
        { id: user.id, perfil: user.perfil, login: user.login },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );

      res.json({
        token,
        usuario: {
          id: user.id,
          nome: user.nome,
          login: user.login,
          perfil: user.perfil,
        },
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error.message);
      res.status(500).json({ message: 'Erro ao fazer login' });
    }
  },
};

export default controller;
