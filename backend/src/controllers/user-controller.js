import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { parseId } from '../validators/validation.js';

const PERFIL_VALUES = ['COLABORADOR', 'ATENDENTE'];

const userSelect = { id: true, nome: true, login: true, perfil: true, ativo: true };

// valida só o que veio no body, serve pro create e pro update parcial
function validateFields({ nome, login, senha, perfil, ativo }) {
  if (nome !== undefined && (typeof nome !== 'string' || !nome.trim() || nome.trim().length > 100)) {
    return 'Nome é obrigatório e deve ter no máximo 100 caracteres';
  }
  if (login !== undefined && (typeof login !== 'string' || !login.trim() || login.trim().length > 50)) {
    return 'Login é obrigatório e deve ter no máximo 50 caracteres';
  }
  if (senha !== undefined && (typeof senha !== 'string' || senha.length < 6)) {
    return 'Senha deve ter pelo menos 6 caracteres';
  }
  if (perfil !== undefined && !PERFIL_VALUES.includes(perfil)) {
    return `Perfil deve ser um de: ${PERFIL_VALUES.join(', ')}`;
  }
  if (ativo !== undefined && typeof ativo !== 'boolean') {
    return 'Ativo deve ser verdadeiro ou falso';
  }
  return null;
}

function handlePrismaError(res, error, fallbackMessage) {
  if (error.code === 'P2025') {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }
  if (error.code === 'P2002') {
    return res.status(409).json({ message: 'Já existe um usuário com esse login' });
  }
  // fk: usuário ainda referenciado por solicitação ou histórico
  if (error.code === 'P2003') {
    return res.status(409).json({
      message: 'Usuário possui solicitações ou histórico vinculados; desative-o em vez de excluir',
    });
  }
  console.error(`${fallbackMessage}:`, error);
  return res.status(500).json({ message: fallbackMessage });
}

const controller = {
  async getAll(req, res) {
    try {
      const users = await prisma.usuario.findMany({
        select: userSelect,
        orderBy: { nome: 'asc' },
      });
      res.json(users);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
  },

  async getOne(req, res) {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Código do usuário inválido' });
      const user = await prisma.usuario.findUnique({
        where: { id },
        select: userSelect,
      });
      if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
      res.json(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
  },

  async create(req, res) {
    try {
      const { nome, login, senha, perfil } = req.body;
      if (nome === undefined || login === undefined || senha === undefined || perfil === undefined) {
        return res.status(400).json({ message: 'Nome, login, senha e perfil são obrigatórios' });
      }
      const erro = validateFields({ nome, login, senha, perfil });
      if (erro) return res.status(400).json({ message: erro });

      const senhaHash = await bcrypt.hash(senha, 10);
      const user = await prisma.usuario.create({
        data: { nome: nome.trim(), login: login.trim(), senhaHash, perfil },
        select: userSelect,
      });
      res.status(201).json(user);
    } catch (error) {
      handlePrismaError(res, error, 'Erro ao criar usuário');
    }
  },

  async editOne(req, res) {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Código do usuário inválido' });

      const { nome, login, senha, perfil, ativo } = req.body;
      const erro = validateFields({ nome, login, senha, perfil, ativo });
      if (erro) return res.status(400).json({ message: erro });

      const data = {
        ...(nome !== undefined && { nome: nome.trim() }),
        ...(login !== undefined && { login: login.trim() }),
        ...(perfil !== undefined && { perfil }),
        ...(ativo !== undefined && { ativo }),
      };
      if (senha) data.senhaHash = await bcrypt.hash(senha, 10);
      const user = await prisma.usuario.update({ where: { id }, data, select: userSelect });
      res.json(user);
    } catch (error) {
      handlePrismaError(res, error, 'Erro ao atualizar usuário');
    }
  },

  async deleteOne(req, res) {
    try {
      const id = parseId(req.params.id);
      if (!id) return res.status(400).json({ message: 'Código do usuário inválido' });
      if (id === req.user.id) {
        return res.status(400).json({ message: 'Você não pode excluir o próprio usuário' });
      }
      await prisma.usuario.delete({ where: { id } });
      res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
      handlePrismaError(res, error, 'Erro ao deletar usuário');
    }
  },
};

export default controller;
