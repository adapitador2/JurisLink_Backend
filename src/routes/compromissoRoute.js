import express from "express";
import compromissoController from "../controllers/compromissoController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";

const compromissoRoute = express.Router();

compromissoRoute.get("/", authMiddleware, checkRole("advogado"), compromissoController.selectAll);
compromissoRoute.post("/", authMiddleware, checkRole("advogado"), compromissoController.create);
compromissoRoute.delete("/:id", authMiddleware, checkRole("advogado"), compromissoController.delete);

export default compromissoRoute;