import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import clienteRoute from "./src/routes/clienteRoute.js";
import advogadoRoute from "./src/routes/advogadoRoute.js";
import authRoute from "./src/routes/authRoute.js";
import processosRoute from "./src/routes/processosRoute.js";
import atualizacaoRoute from "./src/routes/atualizacaoRoute.js";
import documentoRoute from "./src/routes/documentoRoute.js";
import notificacaoRoute from "./src/routes/notificacaoRoute.js";
import compromissoRoute from "./src/routes/compromissoRoute.js";

dotenv.config();

const PORT = process.env.PORT_SERVER || 8000;
const app = express();

// Origens permitidas: as mais comuns em desenvolvimento local
// (Live Server, servidores estáticos simples etc.), mais o que
// vier definido em CORS_ORIGIN no .env, separado por vírgula.
const origensPermitidas = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:5501",
  "http://localhost:3000",
  "http://localhost:8080",
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : []),
];

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origensPermitidas.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origem não permitida pelo CORS"));
    },
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/clientes", clienteRoute);

app.use("/advogados", advogadoRoute);

app.use("/auth", authRoute);

app.use("/processos", processosRoute);

app.use("/processos/:id_processo/atualizacoes", atualizacaoRoute);

app.use("/processos/:id_processo/documentos", documentoRoute);

app.use("/notificacoes", notificacaoRoute);

app.use("/compromissos", compromissoRoute);

app.listen(PORT, () => {
  console.log(`Server rodando em http://localhost:${PORT}`);
});
