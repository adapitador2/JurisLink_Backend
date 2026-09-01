import express from "express";
import documentoController from "../controllers/documentoController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const documentoRoute = express.Router({ mergeParams: true });

documentoRoute.get("/", authMiddleware, documentoController.selectByProcesso);
documentoRoute.post("/", authMiddleware, upload.single("arquivo"), documentoController.create);
documentoRoute.get("/:id/arquivo", authMiddleware, documentoController.baixarArquivo);
documentoRoute.delete("/:id", authMiddleware, documentoController.delete);

export default documentoRoute;