-- Schema para Sistema de Ficha Disciplinar
-- Escola Cívico Militar Jupiara

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS ficha_disciplinar;

-- Tabela de turmas
CREATE TABLE turmas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    ano VARCHAR(10) NOT NULL,
    turno VARCHAR(20) NOT NULL
);

-- Tabela de alunos
CREATE TABLE alunos (
    id SERIAL PRIMARY KEY,
    matricula VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    data_nascimento DATE,
    turma_id INTEGER NOT NULL,
    telefone_responsavel VARCHAR(20),
    email_responsavel VARCHAR(255),
    endereco TEXT,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE
);

-- Tabela de tipos de ocorrência
CREATE TABLE tipos_ocorrencia (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    gravidade VARCHAR(20) NOT NULL CHECK (gravidade IN ('leve', 'media', 'grave')),
    pontos INTEGER NOT NULL DEFAULT 0
);

-- Tabela de ocorrências
CREATE TABLE ocorrencias (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER NOT NULL,
    tipo_ocorrencia_id INTEGER NOT NULL,
    data_ocorrencia DATE NOT NULL,
    hora_ocorrencia TIME,
    descricao TEXT NOT NULL,
    medidas_tomadas TEXT,
    responsavel_registro VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'resolvida', 'em_andamento')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (tipo_ocorrencia_id) REFERENCES tipos_ocorrencia(id)
);

-- Tabela de faltas
CREATE TABLE faltas (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER NOT NULL,
    data_falta DATE NOT NULL,
    justificada BOOLEAN DEFAULT FALSE,
    motivo TEXT,
    documento_justificativa VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    UNIQUE(aluno_id, data_falta)
);

-- Tabela de usuários (Tenente, Sargento, etc)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    patente VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimização
CREATE INDEX idx_alunos_turma ON alunos(turma_id);
CREATE INDEX idx_ocorrencias_aluno ON ocorrencias(aluno_id);
CREATE INDEX idx_ocorrencias_data ON ocorrencias(data_ocorrencia);
CREATE INDEX idx_faltas_aluno ON faltas(aluno_id);
CREATE INDEX idx_faltas_data ON faltas(data_falta);

-- Inserir dados iniciais

-- Inserir turmas (12 turmas)
INSERT INTO turmas (nome, ano, turno) VALUES
('6A', '6º Ano', 'Matutino'),
('6B', '6º Ano', 'Matutino'),
('7A', '7º Ano', 'Matutino'),
('7B', '7º Ano', 'Matutino'),
('8A', '8º Ano', 'Matutino'),
('8B', '8º Ano', 'Matutino'),
('9A', '9º Ano', 'Matutino'),
('9B', '9º Ano', 'Matutino'),
('1A', '1º Ano EM', 'Matutino'),
('1B', '1º Ano EM', 'Vespertino'),
('2A', '2º Ano EM', 'Matutino'),
('3A', '3º Ano EM', 'Matutino');

-- Inserir tipos de ocorrência
INSERT INTO tipos_ocorrencia (nome, gravidade, pontos) VALUES
('Atraso', 'leve', 1),
('Uniforme incompleto', 'leve', 1),
('Conversa durante aula', 'leve', 2),
('Uso de celular', 'media', 3),
('Desrespeito ao professor', 'media', 5),
('Ausência não justificada', 'media', 3),
('Briga verbal', 'grave', 8),
('Briga física', 'grave', 10),
('Dano ao patrimônio', 'grave', 10),
('Bullying', 'grave', 10);

-- Inserir usuário padrão (Tenente)
INSERT INTO usuarios (nome, patente, email, senha) VALUES
('João Silva', 'Tenente', 'tenente@escola.mil.br', '$2b$10$YourHashedPasswordHere');

-- View para métricas por turma
CREATE VIEW metricas_turma AS
SELECT 
    t.id as turma_id,
    t.nome as turma_nome,
    COUNT(DISTINCT a.id) as total_alunos,
    COUNT(DISTINCT o.id) as total_ocorrencias,
    COUNT(DISTINCT f.id) as total_faltas,
    COUNT(DISTINCT CASE WHEN f.justificada = false THEN f.id END) as faltas_nao_justificadas,
    AVG(CASE WHEN to.pontos IS NOT NULL THEN to.pontos ELSE 0 END) as media_pontos_ocorrencia
FROM turmas t
LEFT JOIN alunos a ON t.id = a.turma_id
LEFT JOIN ocorrencias o ON a.id = o.aluno_id
LEFT JOIN faltas f ON a.id = f.aluno_id
LEFT JOIN tipos_ocorrencia to ON o.tipo_ocorrencia_id = to.id
GROUP BY t.id, t.nome;

-- View para ficha completa do aluno
CREATE VIEW ficha_aluno_completa AS
SELECT 
    a.id,
    a.matricula,
    a.nome,
    a.data_nascimento,
    t.nome as turma,
    COUNT(DISTINCT o.id) as total_ocorrencias,
    COUNT(DISTINCT f.id) as total_faltas,
    SUM(CASE WHEN f.justificada = false THEN 1 ELSE 0 END) as faltas_nao_justificadas,
    SUM(COALESCE(to.pontos, 0)) as pontos_totais
FROM alunos a
JOIN turmas t ON a.turma_id = t.id
LEFT JOIN ocorrencias o ON a.id = o.aluno_id
LEFT JOIN faltas f ON a.id = f.aluno_id
LEFT JOIN tipos_ocorrencia to ON o.tipo_ocorrencia_id = to.id
GROUP BY a.id, a.matricula, a.nome, a.data_nascimento, t.nome;