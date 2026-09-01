import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // formato: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido ou expirado" });
    }
    req.usuario = decoded; // fica disponível nas próximas funções (id_usuario, id_role, role_name)
    next();
  });
}