import express from "express";
import clienteController from "../controllers/clienteController.js";

const clienteRoute = express.Router();

clienteRoute.get("/", clienteController.selectAll);
clienteRoute.get("/:id", clienteController.selectById);
clienteRoute.post("/", clienteController.create);
clienteRoute.delete("/:id", clienteController.delete);

export default clienteRoute;