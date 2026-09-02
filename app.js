import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import clienteRoute from "./src/routes/clienteRoute.js";
import advogadoRoute from "./src/routes/advogadoRoute.js";
import authRoute from "./src/routes/authRoute.js";
import processosRoute from "./src/routes/processosRoute.js";
import atualizacaoRoute from "./src/routes/atualizacaoRoute.js";
import documentoRoute from "./src/routes/documentoRoute.js";
import notificacaoRoute from "./src/routes/notificacaoRoute.js";
import compromissoRoute from "./src/routes/compromissoRoute.js";

const origensLocais = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:5501",
  "http://localhost:3000",
  "http://localhost:8080",
];

const origensConfiguradas = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origem) => origem.trim().replace(/\/$/, ""))
  .filter(Boolean);

const origensPermitidas = new Set([...origensLocais, ...origensConfiguradas]);

export const corsOptions = {
  origin(origem, callback) {
    const origemNormalizada = origem?.replace(/\/$/, "");
    if (!origem || origensPermitidas.has(origemNormalizada)) {
      return callback(null, true);
    }
    return callback(new Error(`Origem não permitida pelo CORS: ${origem}`));
  },
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

const app = express();

app.disable("x-powered-by");
app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/clientes", clienteRoute);
app.use("/advogados", advogadoRoute);
app.use("/auth", authRoute);
app.use("/processos", processosRoute);
app.use("/processos/:id_processo/atualizacoes", atualizacaoRoute);
app.use("/processos/:id_processo/documentos", documentoRoute);
app.use("/notificacoes", notificacaoRoute);
app.use("/compromissos", compromissoRoute);

app.use((error, _req, res, _next) => {
  if (error?.message?.startsWith("Origem não permitida pelo CORS:")) {
    return res.status(403).json({ message: error.message });
  }

  console.error(error);
  return res.status(500).json({ message: "Erro interno do servidor" });
});

export default app;
