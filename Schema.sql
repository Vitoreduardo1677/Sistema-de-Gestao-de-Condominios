CREATE DATABASE IF NOT EXISTS condominio;
USE condominio;

CREATE TABLE bloco (
  id INT AUTO_INCREMENT PRIMARY KEY,
  descricao VARCHAR(50) NOT NULL UNIQUE,
  quantidade_aptos INT NOT NULL
);

CREATE TABLE apartamento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bloco_id INT NOT NULL,
  numero INT NOT NULL,
  UNIQUE (bloco_id, numero),
  FOREIGN KEY (bloco_id) REFERENCES bloco(id)
);

CREATE TABLE morador (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  nome VARCHAR(100) NOT NULL,
  telefone VARCHAR(20),
  responsavel BOOLEAN DEFAULT FALSE,
  proprietario BOOLEAN DEFAULT FALSE,
  apartamento_id INT NOT NULL,
  FOREIGN KEY (apartamento_id) REFERENCES apartamento(id)
);

CREATE TABLE vaga_garagem (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cod_vaga INT NOT NULL,
  apartamento_id INT NOT NULL,
  FOREIGN KEY (apartamento_id) REFERENCES apartamento(id)
);

CREATE TABLE veiculo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  placa VARCHAR(10) NOT NULL,
  marca VARCHAR(50),
  modelo VARCHAR(50),
  morador_id INT NOT NULL,
  FOREIGN KEY (morador_id) REFERENCES morador(id)
);

CREATE TABLE referencia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mes INT NOT NULL,
  ano INT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  vencimento DATE NOT NULL,
  UNIQUE (mes, ano)
);

CREATE TABLE pagamento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  apartamento_id INT NOT NULL,
  morador_id INT NOT NULL,
  referencia_id INT NOT NULL,
  data_pagamento DATE NOT NULL,
  FOREIGN KEY (apartamento_id) REFERENCES apartamento(id),
  FOREIGN KEY (morador_id) REFERENCES morador(id),
  FOREIGN KEY (referencia_id) REFERENCES referencia(id)
);

CREATE TABLE tipo_manutencao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  descricao VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE manutencao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo_id INT NOT NULL,
  data_manutencao DATE NOT NULL,
  local VARCHAR(100) NOT NULL,
  FOREIGN KEY (tipo_id) REFERENCES tipo_manutencao(id)
);

INSERT INTO bloco (descricao, quantidade_aptos) VALUES ('Bloco A', 30), ('Bloco B', 25);