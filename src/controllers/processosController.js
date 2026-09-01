import processoModel from "../models/processosModel.js";
import atualizacaoModel from "../models/atualizacaoModel.js";
import notificacaoModel from "../models/notificacaoModel.js";
import pool from "../database/database.js";

class ProcessosController {
  // Lista os processos conforme o perfil de quem está logado
  async selectAll(req, res) {
    try {
      const { id_usuario, role_name } = req.usuario;

      if (role_name === "advogado") {
        const [advRows] = await pool.execute(
          `SELECT id_advogado FROM advogados WHERE id_usuario = ?;`,
          [id_usuario],
        );
        const processos = await processoModel.selectByAdvogado(advRows[0].id_advogado);
        return res.json(processos);
      }

      if (role_name === "cliente") {
        const [cliRows] = await pool.execute(
          `SELECT id_cliente FROM clientes WHERE id_usuario = ?;`,
          [id_usuario],
        );
        const processos = await processoModel.selectByCliente(cliRows[0].id_cliente);
        return res.json(processos);
      }

      res.status(403).json({ message: "Perfil não reconhecido" });
    } catch (error) {
      res.status(500).json({ message: `Erro ao listar processos: ${error}` });
    }
  }

  async selectById(req, res) {
    const { id } = req.params;
    const { id_usuario, role_name } = req.usuario;

    const [processo] = await processoModel.selectById(id);
    if (!processo) {
      return res.status(404).json({ message: "Processo não encontrado" });
    }

    // Garante que só o advogado responsável ou o cliente dono
    // consigam ver os detalhes deste processo específico
    if (role_name === "advogado") {
      const [advRows] = await pool.execute(
        `SELECT id_advogado FROM advogados WHERE id_usuario = ?;`,
        [id_usuario],
      );
      if (!advRows[0] || advRows[0].id_advogado !== processo.id_advogado) {
        return res.status(403).json({ message: "Você não tem acesso a este processo" });
      }
    } else if (role_name === "cliente") {
      const [cliRows] = await pool.execute(
        `SELECT id_cliente FROM clientes WHERE id_usuario = ?;`,
        [id_usuario],
      );
      if (!cliRows[0] || cliRows[0].id_cliente !== processo.id_cliente) {
        return res.status(403).json({ message: "Você não tem acesso a este processo" });
      }
    } else {
      return res.status(403).json({ message: "Perfil não reconhecido" });
    }

    res.json(processo);
  }

  // Só advogado cria (garantido pela rota com checkRole)
  async create(req, res) {
    try {
      const { id_usuario } = req.usuario;
      const { numero_processo, titulo, tribunal, id_cliente, data_abertura, proxima_audiencia, status, descricao } = req.body;

      const [advRows] = await pool.execute(
        `SELECT id_advogado FROM advogados WHERE id_usuario = ?;`,
        [id_usuario],
      );
      const id_advogado = advRows[0].id_advogado;

      const processo = await processoModel.create({
        numero_processo,
        titulo,
        tribunal,
        id_cliente,
        id_advogado,
        data_abertura,
        proxima_audiencia,
        status,
      });

      // Se veio uma descrição no formulário, vira a primeira
      // entrada da timeline de atualizações do processo
      if (descricao) {
        await atualizacaoModel.create({
          id_processo: processo.id_processo,
          titulo: "Processo cadastrado",
          descricao,
          status: status || null,
          data_evento: data_abertura,
        });
      }

      // Notifica o próprio advogado (fica no sino de notificações)
      await notificacaoModel.create({
        id_usuario,
        tipo: "processo",
        titulo: "Novo processo cadastrado",
        mensagem: `O processo ${numero_processo} foi cadastrado.`,
      });

      res.status(201).json({ message: "Processo criado!", id: processo.id_processo });
    } catch (error) {
      res.status(500).json({ message: `Erro ao criar processo: ${error}` });
    }
  }

  async updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    await processoModel.updateStatus(id, status);
    res.json({ message: "Status atualizado" });
  }

  async delete(req, res) {
    const { id } = req.params;
    await processoModel.delete(id);
    res.json({ message: "Processo removido" });
  }
}

export default new ProcessosController();