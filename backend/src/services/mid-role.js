export default function requirePerfil(...perfis) {
  return function (req, res, next) {
    if (!perfis.includes(req.user?.perfil)) {
      return res.status(403).json({ message: 'Você não tem permissão para realizar esta ação' });
    }
    next();
  };
}
