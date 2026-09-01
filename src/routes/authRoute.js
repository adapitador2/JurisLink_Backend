import express from "express";
import authController from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const authRoute = express.Router();

authRoute.post("/login", authController.login);
authRoute.patch("/senha", authMiddleware, authController.alterarSenha);

export default authRoute;