import express from "express";
import advogadoController from "../controllers/advogadoController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";

const advogadoRoute = express.Router();

advogadoRoute.get("/", advogadoController.selectAll);
advogadoRoute.get("/:id", advogadoController.selectById);
advogadoRoute.post("/", advogadoController.create);
advogadoRoute.patch("/me", authMiddleware, checkRole("advogado"), advogadoController.updateProfile);
advogadoRoute.delete("/:id", advogadoController.delete);

export default advogadoRoute;