import advogadoModel from "../models/advogadoModel.js";
import bcrypt from "bcrypt";

class AdvogadoController {
  async selectAll(req, res) {
    const advogados = await advogadoModel.selectAll();
    res.json(advogados);
  }

  async selectById(req, res) {
    const { id } = req.params;
    const [advogado] = await advogadoModel.selectById(id);
    if (!advogado) {
      return res.status(404).json({ message: "Advogado não encontrado" });
    }
    res.json(advogado);
  }

  async create(req, res) {
    try {
      const { nome, email, senha, telefone, oab_numero, oab_uf } = req.body;

      const senhaCriptografada = await bcrypt.hash(senha, 10);

      const advogado = await advogadoModel.create({
        nome,
        email,
        senha: senhaCriptografada,
        telefone,
        oab_numero,
        oab_uf,
      });

      res.status(201).json({ message: "Advogado cadastrado!", id: advogado.id_usuario });
    } catch (error) {
      res.status(500).json({ message: `Erro ao cadastrar advogado: ${error}` });
    }
  }

  async delete(req, res) {
    const { id } = req.params;
    await advogadoModel.delete(id);
    res.json({ message: "Advogado removido" });
  }

  // PATCH /advogados/me — o próprio advogado edita seu perfil
  async updateProfile(req, res) {
    try {
      const { id_usuario } = req.usuario;
      const { nome, telefone, oab_numero, oab_uf } = req.body;

      await advogadoModel.updateProfile(id_usuario, { nome, telefone, oab_numero, oab_uf });

      res.json({ message: "Perfil atualizado!" });
    } catch (error) {
      res.status(500).json({ message: `Erro ao atualizar perfil: ${error}` });
    }
  }
}

export default new AdvogadoController();