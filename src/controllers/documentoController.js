import documentoModel from "../models/documentoModel.js";
import processoModel from "../models/processosModel.js";
import pool from "../database/database.js";
import path from "path";
import fs from "fs";

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

class DocumentoController {
  async selectByProcesso(req, res) {
    try {
      const { id_processo } = req.params;
      const { id_usuario, role_name } = req.usuario;

      const temAcesso = await usuarioTemAcessoAoProcesso(id_processo, id_usuario, role_name);
      if (!temAcesso) {
        return res.status(403).json({ message: "Você não tem acesso a este processo" });
      }

      const documentos = await documentoModel.selectByProcesso(id_processo);
      res.json(documentos);
    } catch (error) {
      res.status(500).json({ message: `Erro ao listar documentos: ${error}` });
    }
  }

  async create(req, res) {
    try {
      const { id_processo } = req.params;
      const { id_usuario, role_name } = req.usuario;

      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }

      const temAcesso = await usuarioTemAcessoAoProcesso(id_processo, id_usuario, role_name);
      if (!temAcesso) {
        return res.status(403).json({ message: "Você não tem acesso a este processo" });
      }

      const documento = await documentoModel.create({
        id_processo,
        enviado_por: id_usuario,
        nome: req.body.nome || req.file.originalname,
        descricao: req.body.descricao || null,
        arquivo_url: req.file.path, // caminho onde o multer salvou
        tamanho_bytes: req.file.size,
      });

      res.status(201).json({ message: "Documento enviado!", id: documento.id_documento });
    } catch (error) {
      res.status(500).json({ message: `Erro ao enviar documento: ${error}` });
    }
  }

  async delete(req, res) {
    const { id } = req.params;
    await documentoModel.delete(id);
    res.json({ message: "Documento removido" });
  }

  // GET /processos/:id_processo/documentos/:id/arquivo
  // Serve o arquivo em si (não os metadados). Rota autenticada:
  // só quem tem acesso ao processo consegue baixar o arquivo,
  // diferente do antigo /uploads estático, que era público.
  async baixarArquivo(req, res) {
    try {
      const { id_processo, id } = req.params;
      const { id_usuario, role_name } = req.usuario;

      const temAcesso = await usuarioTemAcessoAoProcesso(id_processo, id_usuario, role_name);
      if (!temAcesso) {
        return res.status(403).json({ message: "Você não tem acesso a este processo" });
      }

      const documento = await documentoModel.selectById(id);

      // Confere que o documento existe e realmente pertence
      // ao processo informado na URL (evita pedir o arquivo A
      // usando o id de um processo B ao qual o usuário tem acesso)
      if (!documento || String(documento.id_processo) !== String(id_processo)) {
        return res.status(404).json({ message: "Documento não encontrado" });
      }

      const caminhoAbsoluto = path.resolve(documento.arquivo_url);
      const pastaUploads = path.resolve("uploads");

      // Garante que o caminho resolvido continua dentro da pasta
      // de uploads (proteção contra path traversal)
      if (!caminhoAbsoluto.startsWith(pastaUploads)) {
        return res.status(400).json({ message: "Caminho de arquivo inválido" });
      }

      if (!fs.existsSync(caminhoAbsoluto)) {
        return res.status(404).json({ message: "Arquivo não encontrado no servidor" });
      }

      res.sendFile(caminhoAbsoluto);
    } catch (error) {
      res.status(500).json({ message: `Erro ao baixar documento: ${error}` });
    }
  }
}

export default new DocumentoController();