import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/documentos";

// Cria a pasta de uploads se ela ainda não existir
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const nomeUnico = `${Date.now()}-${file.originalname}`;
    cb(null, nomeUnico);
  },
});

export const upload = multer({ storage });