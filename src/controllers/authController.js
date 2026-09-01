import pool from "../database/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class AuthController {
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      const [rows] = await pool.execute(
        `SELECT u.id_usuario, u.nome, u.email, u.senha, u.id_role, r.role_name
         FROM usuarios u
         JOIN roles r ON u.id_role = r.id_role
         WHERE u.email = ?;`,
        [email],
      );

      const usuario = rows[0];

      if (!usuario) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

      if (!senhaCorreta) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      const token = jwt.sign(
        {
          id_usuario: usuario.id_usuario,
          id_role: usuario.id_role,
          role_name: usuario.role_name,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "8h" },
      );

      // Dados extras específicos do papel (advogado ou cliente).
      // O front precisa do id_advogado/id_cliente para montar
      // requisições (ex.: vincular um novo cliente ao advogado logado)
      // sem ter que decodificar o token.
      let dadosExtras = {};

      if (usuario.role_name === "advogado") {
        const [advRows] = await pool.execute(
          `SELECT id_advogado, oab_numero, oab_uf FROM advogados WHERE id_usuario = ?;`,
          [usuario.id_usuario],
        );
        if (advRows[0]) {
          dadosExtras = {
            id_advogado: advRows[0].id_advogado,
            oab_numero: advRows[0].oab_numero,
            oab_uf: advRows[0].oab_uf,
          };
        }
      }

      if (usuario.role_name === "cliente") {
        const [cliRows] = await pool.execute(
          `SELECT id_cliente, cpf, id_advogado FROM clientes WHERE id_usuario = ?;`,
          [usuario.id_usuario],
        );
        if (cliRows[0]) {
          dadosExtras = {
            id_cliente: cliRows[0].id_cliente,
            cpf: cliRows[0].cpf,
            id_advogado: cliRows[0].id_advogado,
          };
        }
      }

      res.json({
        message: "Login realizado com sucesso",
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.role_name,
          ...dadosExtras,
        },
      });
    } catch (error) {
      res.status(500).json({ message: `Erro ao fazer login: ${error}` });
    }
  }

  // PATCH /auth/senha — troca de senha do próprio usuário logado
  async alterarSenha(req, res) {
    try {
      const { id_usuario } = req.usuario;
      const { senha_atual, nova_senha } = req.body;

      const [rows] = await pool.execute(
        `SELECT senha FROM usuarios WHERE id_usuario = ?;`,
        [id_usuario],
      );

      const usuario = rows[0];

      if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const senhaCorreta = await bcrypt.compare(senha_atual, usuario.senha);

      if (!senhaCorreta) {
        return res.status(401).json({ message: "A senha atual está incorreta" });
      }

      const novaSenhaCriptografada = await bcrypt.hash(nova_senha, 10);

      await pool.execute(
        `UPDATE usuarios SET senha = ? WHERE id_usuario = ?;`,
        [novaSenhaCriptografada, id_usuario],
      );

      res.json({ message: "Senha alterada com sucesso" });
    } catch (error) {
      res.status(500).json({ message: `Erro ao alterar senha: ${error}` });
    }
  }
}

export default new AuthController();