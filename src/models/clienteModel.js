import pool from "../database/database.js";

class ClienteModel {
  async selectAll() {
    const query = `
      SELECT c.id_cliente, u.nome, u.email, u.telefone, u.status, u.criado_em, c.cpf, c.id_advogado
      FROM clientes c
      JOIN usuarios u ON c.id_usuario = u.id_usuario;
    `;
    const [rows] = await pool.execute(query);
    return rows;
  }

  async selectById(id_cliente) {
    const query = `
      SELECT c.id_cliente, u.nome, u.email, u.telefone, u.status, u.criado_em, c.cpf, c.id_advogado
      FROM clientes c
      JOIN usuarios u ON c.id_usuario = u.id_usuario
      WHERE c.id_cliente = ?;
    `;
    const [rows] = await pool.execute(query, [id_cliente]);
    return rows;
  }

  async create({ nome, email, senha, telefone, cpf, id_advogado, status = true }) {
    const [userResult] = await pool.execute(
      `INSERT INTO usuarios (nome, email, senha, telefone, id_role, status) VALUES (?, ?, ?, ?, 1, ?);`,
      [nome, email, senha, telefone, status],
    );
    const id_usuario = userResult.insertId;

    const [cliResult] = await pool.execute(
      `INSERT INTO clientes (id_usuario, cpf, id_advogado) VALUES (?, ?, ?);`,
      [id_usuario, cpf, id_advogado ?? null],
    );

    return { id_cliente: cliResult.insertId };
  }

  async delete(id_cliente) {
    const [result] = await pool.execute(
      `DELETE u FROM usuarios u
       JOIN clientes c ON c.id_usuario = u.id_usuario
       WHERE c.id_cliente = ?;`,
      [id_cliente],
    );
    return result;
  }
}

export default new ClienteModel();