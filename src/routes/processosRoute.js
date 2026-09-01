import express from "express";
import processosController from "../controllers/processosController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";

const processosRoute = express.Router();

processosRoute.get("/", authMiddleware, processosController.selectAll);
processosRoute.get("/:id", authMiddleware, processosController.selectById);
processosRoute.post("/", authMiddleware, checkRole("advogado"), processosController.create);
processosRoute.patch("/:id/status", authMiddleware, checkRole("advogado"), processosController.updateStatus);
processosRoute.delete("/:id", authMiddleware, checkRole("advogado"), processosController.delete);

export default processosRoute;