import atualizacaoModel from "../models/atualizacaoModel.js";
import processoModel from "../models/processosModel.js";
import notificacaoModel from "../models/notificacaoModel.js";
import pool from "../database/database.js";

// Confirma que quem está pedindo é o advogado responsável
// ou o cliente dono do processo referenciado na URL
async function usuarioTemAcessoAoProcesso(id_processo, id_usuario, role_name) {
  const [processo] = await processoModel.selectById(id_processo);
  if (!processo) return false;

  if (role_name === "advogado") {
    const [advRows] = await pool.execute(
      `SELECT id_advogado FROM advogados WHERE id_usuario = ?;`,
      [id_usuario],
    );
    return advRows[0] && advRows[0].id_advogado === processo.id_advogado;
  }

  if (role_name === "cliente") {
    const [cliRows] = await pool.execute(
      `SELECT id_cliente FROM clientes WHERE id_usuario = ?;`,
      [id_usuario],
    );
    return cliRows[0] && cliRows[0].id_cliente === processo.id_cliente;
  }

  return false;
}

class AtualizacaoController {
  // GET /processos/:id_processo/atualizacoes
  async selectByProcesso(req, res) {
    try {
      const { id_processo } = req.params;
      const { id_usuario, role_name } = req.usuario;

      const temAcesso = await usuarioTemAcessoAoProcesso(id_processo, id_usuario, role_name);
      if (!temAcesso) {
        return res.status(403).json({ message: "Você não tem acesso a este processo" });
      }

      const atualizacoes = await atualizacaoModel.selectByProcesso(id_processo);
      res.json(atualizacoes);
    } catch (error) {
      res.status(500).json({ message: `Erro ao listar atualizações: ${error}` });
    }
  }

  // POST /processos/:id_processo/atualizacoes — só advogado
  async create(req, res) {
    try {
      const { id_processo } = req.params;
      const { titulo, descricao, status, data_evento } = req.body;

      const atualizacao = await atualizacaoModel.create({
        id_processo,
        titulo,
        descricao,
        status,
        data_evento,
      });

      // Se veio um status novo, atualiza também o status geral do processo
      if (status) {
        await processoModel.updateStatus(id_processo, status);
      }

      // Notifica o cliente dono do processo
      const [processoRows] = await pool.execute(
        `SELECT p.numero_processo, u.id_usuario
         FROM processos p
         JOIN clientes c ON p.id_cliente = c.id_cliente
         JOIN usuarios u ON c.id_usuario = u.id_usuario
         WHERE p.id_processo = ?;`,
        [id_processo],
      );
      if (processoRows[0]) {
        await notificacaoModel.create({
          id_usuario: processoRows[0].id_usuario,
          tipo: "processo",
          titulo: "Processo atualizado",
          mensagem: `O processo ${processoRows[0].numero_processo} recebeu uma nova atualização: ${titulo}.`,
        });
      }

      res.status(201).json({ message: "Atualização registrada!", id: atualizacao.id_atualizacao });
    } catch (error) {
      res.status(500).json({ message: `Erro ao criar atualização: ${error}` });
    }
  }

  async delete(req, res) {
    const { id } = req.params;
    await atualizacaoModel.delete(id);
    res.json({ message: "Atualização removida" });
  }
}

export default new AtualizacaoController();