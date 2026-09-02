import dotenv from "dotenv";

dotenv.config();

const { default: app } = await import("./app.js");
const { default: initializeDatabase } = await import("./src/database/initializeDatabase.js");
const PORT = Number(process.env.PORT_SERVER || process.env.PORT || 8000);

try {
  await initializeDatabase();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor JurisLink disponível na porta ${PORT}`);
  });
} catch (error) {
  console.error("[startup] Não foi possível preparar o banco de dados:", error);
  process.exit(1);
}
