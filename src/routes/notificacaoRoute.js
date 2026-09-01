import express from "express";
import notificacaoController from "../controllers/notificacaoController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const notificacaoRoute = express.Router();

notificacaoRoute.get("/", authMiddleware, notificacaoController.selectAll);
notificacaoRoute.patch("/lida-todas", authMiddleware, notificacaoController.marcarTodasComoLidas);
notificacaoRoute.patch("/:id/lida", authMiddleware, notificacaoController.marcarComoLida);

export default notificacaoRoute;