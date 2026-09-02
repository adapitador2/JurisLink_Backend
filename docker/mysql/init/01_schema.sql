CREATE TABLE IF NOT EXISTS roles (
    id_role INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

INSERT IGNORE INTO roles (role_name) VALUES ("cliente"), ("advogado");

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    id_role INT NOT NULL,
    status BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_role) REFERENCES roles (id_role)
);

CREATE TABLE IF NOT EXISTS advogados (
    id_advogado INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    oab_numero VARCHAR(20) NOT NULL,
    oab_uf CHAR(2) NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    id_advogado INT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_advogado) REFERENCES advogados (id_advogado)
);

CREATE TABLE IF NOT EXISTS processos (
    id_processo INT AUTO_INCREMENT PRIMARY KEY,
    numero_processo VARCHAR(30) NOT NULL UNIQUE,
    titulo VARCHAR(150) NOT NULL,
    tribunal VARCHAR(150),
    status VARCHAR(30) NOT NULL DEFAULT 'Em andamento',
    id_cliente INT NOT NULL,
    id_advogado INT NOT NULL,
    data_abertura DATE NOT NULL,
    proxima_audiencia DATETIME,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente),
    FOREIGN KEY (id_advogado) REFERENCES advogados (id_advogado)
);

CREATE TABLE IF NOT EXISTS atualizacoes_processo (
    id_atualizacao INT AUTO_INCREMENT PRIMARY KEY,
    id_processo INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    status VARCHAR(30),
    data_evento DATE NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_processo) REFERENCES processos (id_processo) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS documentos (
    id_documento INT AUTO_INCREMENT PRIMARY KEY,
    id_processo INT NOT NULL,
    enviado_por INT NOT NULL,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    arquivo_url VARCHAR(255) NOT NULL,
    tamanho_bytes INT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_processo) REFERENCES processos (id_processo) ON DELETE CASCADE,
    FOREIGN KEY (enviado_por) REFERENCES usuarios (id_usuario)
);

CREATE TABLE IF NOT EXISTS compromissos (
    id_compromisso INT AUTO_INCREMENT PRIMARY KEY,
    id_advogado INT NOT NULL,
    id_cliente INT,
    id_processo INT,
    tipo VARCHAR(30) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    data_hora DATETIME NOT NULL,
    local VARCHAR(150),
    FOREIGN KEY (id_advogado) REFERENCES advogados (id_advogado),
    FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente),
    FOREIGN KEY (id_processo) REFERENCES processos (id_processo)
);

CREATE TABLE IF NOT EXISTS notificacoes (
    id_notificacao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE
);
