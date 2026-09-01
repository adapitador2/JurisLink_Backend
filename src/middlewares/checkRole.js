export function checkRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    if (!allowedRoles.includes(req.usuario.role_name)) {
      return res.status(403).json({ message: "Você não tem permissão para realizar esta ação" });
    }

    next();
  };
}