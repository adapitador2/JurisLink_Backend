import pool from "../database/database.js";

class AtualizacaoModel {
  async selectByProcesso(id_processo) {
    const query = `
      SELECT * FROM atualizacoes_processo
      WHERE id_processo = ?
      ORDER BY data_evento DESC, criado_em DESC;
    `;
    const [rows] = await pool.execute(query, [id_processo]);
    return rows;
  }

  async create({ id_processo, titulo, descricao, status, data_evento }) {
    const [result] = await pool.execute(
      `INSERT INTO atualizacoes_processo (id_processo, titulo, descricao, status, data_evento)
       VALUES (?, ?, ?, ?, ?);`,
      [id_processo, titulo, descricao ?? null, status ?? null, data_evento],
    );
    return { id_atualizacao: result.insertId };
  }

  async delete(id_atualizacao) {
    const [result] = await pool.execute(
      `DELETE FROM atualizacoes_processo WHERE id_atualizacao = ?;`,
      [id_atualizacao],
    );
    return result;
  }
}

export default new AtualizacaoModel();