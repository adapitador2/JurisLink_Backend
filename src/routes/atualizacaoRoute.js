import express from "express";
import atualizacaoController from "../controllers/atualizacaoController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";

const atualizacaoRoute = express.Router({ mergeParams: true }); // mergeParams: pra acessar :id_processo da rota "pai"

atualizacaoRoute.get("/", authMiddleware, atualizacaoController.selectByProcesso);
atualizacaoRoute.post("/", authMiddleware, checkRole("advogado"), atualizacaoController.create);
atualizacaoRoute.delete("/:id", authMiddleware, checkRole("advogado"), atualizacaoController.delete);

export default atualizacaoRoute;