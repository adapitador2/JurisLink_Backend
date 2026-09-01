import clienteModel from "../models/clienteModel.js";
import notificacaoModel from "../models/notificacaoModel.js";
import pool from "../database/database.js";
import bcrypt from "bcrypt";

class ClienteController {
  async selectAll(req, res) {
    const clientes = await clienteModel.selectAll();
    res.json(clientes);
  }

  async selectById(req, res) {
    const { id } = req.params;
    const [cliente] = await clienteModel.selectById(id);
    if (!cliente) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }
    res.json(cliente);
  }

  async create(req, res) {
    try {
      const { nome, email, senha, telefone, cpf, id_advogado, status } = req.body;

      const senhaCriptografada = await bcrypt.hash(senha, 10);

      const cliente = await clienteModel.create({
        nome,
        email,
        senha: senhaCriptografada,
        telefone,
        cpf,
        id_advogado,
        status: status === undefined ? true : status === "Ativo" || status === true,
      });

      // Notifica o advogado dono da carteira, se houver um vinculado
      if (id_advogado) {
        const [advRows] = await pool.execute(
          `SELECT id_usuario FROM advogados WHERE id_advogado = ?;`,
          [id_advogado],
        );
        if (advRows[0]) {
          await notificacaoModel.create({
            id_usuario: advRows[0].id_usuario,
            tipo: "cliente",
            titulo: "Novo cliente cadastrado",
            mensagem: `${nome} foi adicionado à sua carteira de clientes.`,
          });
        }
      }

      res.status(201).json({ message: "Cliente cadastrado!", id: cliente.id_usuario });
    } catch (error) {
      res.status(500).json({ message: `Erro ao cadastrar cliente: ${error}` });
    }
  }

  async delete(req, res) {
    const { id } = req.params;
    await clienteModel.delete(id);
    res.json({ message: "Cliente removido" });
  }
}

export default new ClienteController();