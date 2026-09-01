import pool from "../database/database.js";

class DocumentoModel {
  async selectByProcesso(id_processo) {
    const query = `
      SELECT * FROM documentos
      WHERE id_processo = ?
      ORDER BY criado_em DESC;
    `;
    const [rows] = await pool.execute(query, [id_processo]);
    return rows;
  }

  async selectById(id_documento) {
    const [rows] = await pool.execute(
      `SELECT * FROM documentos WHERE id_documento = ?;`,
      [id_documento],
    );
    return rows[0] || null;
  }

  async create({ id_processo, enviado_por, nome, descricao, arquivo_url, tamanho_bytes }) {
    const [result] = await pool.execute(
      `INSERT INTO documentos (id_processo, enviado_por, nome, descricao, arquivo_url, tamanho_bytes)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [id_processo, enviado_por, nome, descricao ?? null, arquivo_url, tamanho_bytes],
    );
    return { id_documento: result.insertId };
  }

  async delete(id_documento) {
    const [result] = await pool.execute(
      `DELETE FROM documentos WHERE id_documento = ?;`,
      [id_documento],
    );
    return result;
  }
}

export default new DocumentoModel();