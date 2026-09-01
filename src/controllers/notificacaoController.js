import notificacaoModel from "../models/notificacaoModel.js";

class NotificacaoController {
  // GET /notificacoes — cada usuário vê só as próprias
  async selectAll(req, res) {
    try {
      const { id_usuario } = req.usuario;
      const notificacoes = await notificacaoModel.selectByUsuario(id_usuario);
      res.json(notificacoes);
    } catch (error) {
      res.status(500).json({ message: `Erro ao listar notificações: ${error}` });
    }
  }

  async marcarComoLida(req, res) {
    const { id } = req.params;
    const { id_usuario } = req.usuario;

    const pertence = await notificacaoModel.pertenceAoUsuario(id, id_usuario);
    if (!pertence) {
      return res.status(403).json({ message: "Você não tem acesso a esta notificação" });
    }

    await notificacaoModel.marcarComoLida(id);
    res.json({ message: "Notificação marcada como lida" });
  }

  // PATCH /notificacoes/lida-todas — marca todas as notificações
  // do usuário logado como lidas de uma vez
  async marcarTodasComoLidas(req, res) {
    try {
      const { id_usuario } = req.usuario;
      await notificacaoModel.marcarTodasComoLidas(id_usuario);
      res.json({ message: "Todas as notificações foram marcadas como lidas" });
    } catch (error) {
      res.status(500).json({ message: `Erro ao marcar notificações: ${error}` });
    }
  }
}

export default new NotificacaoController();