import compromissoModel from "../models/compromissoModel.js";
import notificacaoModel from "../models/notificacaoModel.js";
import pool from "../database/database.js";

class CompromissoController {
  async selectAll(req, res) {
    try {
      const { id_usuario } = req.usuario;

      const [advRows] = await pool.execute(
        `SELECT id_advogado FROM advogados WHERE id_usuario = ?;`,
        [id_usuario],
      );

      const compromissos = await compromissoModel.selectByAdvogado(advRows[0].id_advogado);
      res.json(compromissos);
    } catch (error) {
      res.status(500).json({ message: `Erro ao listar compromissos: ${error}` });
    }
  }

  async create(req, res) {
    try {
      const { id_usuario } = req.usuario;
      const { id_cliente, id_processo, tipo, titulo, data_hora, local } = req.body;

      const [advRows] = await pool.execute(
        `SELECT id_advogado FROM advogados WHERE id_usuario = ?;`,
        [id_usuario],
      );

      const compromisso = await compromissoModel.create({
        id_advogado: advRows[0].id_advogado,
        id_cliente,
        id_processo,
        tipo,
        titulo,
        data_hora,
        local,
      });

      await notificacaoModel.create({
        id_usuario,
        tipo: tipo === "Prazo" ? "prazo" : "agenda",
        titulo: tipo === "Prazo" ? "Novo prazo adicionado" : "Novo compromisso agendado",
        mensagem: `${titulo} foi agendado.`,
      });

      res.status(201).json({ message: "Compromisso criado!", id: compromisso.id_compromisso });
    } catch (error) {
      res.status(500).json({ message: `Erro ao criar compromisso: ${error}` });
    }
  }

  async delete(req, res) {
    const { id } = req.params;
    await compromissoModel.delete(id);
    res.json({ message: "Compromisso removido" });
  }
}

export default new CompromissoController();