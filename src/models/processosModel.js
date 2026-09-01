import pool from "../database/database.js";

class ProcessosModel {
  async selectAll() {
    const query = `
      SELECT p.*, uc.nome AS nome_cliente, ua.nome AS nome_advogado
      FROM processos p
      JOIN clientes c ON p.id_cliente = c.id_cliente
      JOIN usuarios uc ON c.id_usuario = uc.id_usuario
      JOIN advogados a ON p.id_advogado = a.id_advogado
      JOIN usuarios ua ON a.id_usuario = ua.id_usuario;
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }

  async selectByAdvogado(id_advogado) {
    const query = `
      SELECT p.*, uc.nome AS nome_cliente
      FROM processos p
      JOIN clientes c ON p.id_cliente = c.id_cliente
      JOIN usuarios uc ON c.id_usuario = uc.id_usuario
      WHERE p.id_advogado = ?;
    `;
    const [rows] = await pool.execute(query, [id_advogado]);
    return rows;
  }

  async selectByCliente(id_cliente) {
    const query = `
      SELECT p.*, ua.nome AS nome_advogado
      FROM processos p
      JOIN advogados a ON p.id_advogado = a.id_advogado
      JOIN usuarios ua ON a.id_usuario = ua.id_usuario
      WHERE p.id_cliente = ?;
    `;
    const [rows] = await pool.execute(query, [id_cliente]);
    return rows;
  }

  async selectById(id_processo) {
    const query = `
      SELECT p.*, uc.nome AS nome_cliente, ua.nome AS nome_advogado
      FROM processos p
      JOIN clientes c ON p.id_cliente = c.id_cliente
      JOIN usuarios uc ON c.id_usuario = uc.id_usuario
      JOIN advogados a ON p.id_advogado = a.id_advogado
      JOIN usuarios ua ON a.id_usuario = ua.id_usuario
      WHERE p.id_processo = ?;
    `;
    const [rows] = await pool.execute(query, [id_processo]);
    return rows;
  }

  async create({ numero_processo, titulo, tribunal, id_cliente, id_advogado, data_abertura, proxima_audiencia, status }) {
    const [result] = await pool.execute(
      status
        ? `INSERT INTO processos (numero_processo, titulo, tribunal, id_cliente, id_advogado, data_abertura, proxima_audiencia, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?);`
        : `INSERT INTO processos (numero_processo, titulo, tribunal, id_cliente, id_advogado, data_abertura, proxima_audiencia)
           VALUES (?, ?, ?, ?, ?, ?, ?);`,
      status
        ? [numero_processo, titulo, tribunal, id_cliente, id_advogado, data_abertura, proxima_audiencia ?? null, status]
        : [numero_processo, titulo, tribunal, id_cliente, id_advogado, data_abertura, proxima_audiencia ?? null],
    );
    return { id_processo: result.insertId };
  }

  async updateStatus(id_processo, status) {
    const [result] = await pool.execute(
      `UPDATE processos SET status = ? WHERE id_processo = ?;`,
      [status, id_processo],
    );
    return result;
  }

  async delete(id_processo) {
    const [result] = await pool.execute(
      `DELETE FROM processos WHERE id_processo = ?;`,
      [id_processo],
    );
    return result;
  }
}

export default new ProcessosModel();