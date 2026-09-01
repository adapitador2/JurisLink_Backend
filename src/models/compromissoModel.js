import pool from "../database/database.js";

class CompromissoModel {
  async selectByAdvogado(id_advogado) {
    const query = `
      SELECT co.*, uc.nome AS nome_cliente
      FROM compromissos co
      LEFT JOIN clientes c ON co.id_cliente = c.id_cliente
      LEFT JOIN usuarios uc ON c.id_usuario = uc.id_usuario
      WHERE co.id_advogado = ?
      ORDER BY co.data_hora ASC;
    `;
    const [rows] = await pool.execute(query, [id_advogado]);
    return rows;
  }

  async create({ id_advogado, id_cliente, id_processo, tipo, titulo, data_hora, local }) {
    const [result] = await pool.execute(
      `INSERT INTO compromissos (id_advogado, id_cliente, id_processo, tipo, titulo, data_hora, local)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [id_advogado, id_cliente ?? null, id_processo ?? null, tipo, titulo, data_hora, local ?? null],
    );
    return { id_compromisso: result.insertId };
  }

  async delete(id_compromisso) {
    const [result] = await pool.execute(
      `DELETE FROM compromissos WHERE id_compromisso = ?;`,
      [id_compromisso],
    );
    return result;
  }
}

export default new CompromissoModel();