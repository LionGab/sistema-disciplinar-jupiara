import pool from './db';

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Criando tabelas...');
    
    // Tabela de turmas
    await client.query(`
      CREATE TABLE IF NOT EXISTS turmas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(50) NOT NULL UNIQUE,
        ano VARCHAR(10) NOT NULL,
        turno VARCHAR(20) NOT NULL
      );
    `);

    // Tabela de alunos
    await client.query(`
      CREATE TABLE IF NOT EXISTS alunos (
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
    `);

    // Tabela de tipos de ocorrência
    await client.query(`
      CREATE TABLE IF NOT EXISTS tipos_ocorrencia (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL UNIQUE,
        gravidade VARCHAR(20) NOT NULL CHECK (gravidade IN ('leve', 'media', 'grave')),
        pontos INTEGER NOT NULL DEFAULT 0
      );
    `);

    // Tabela de ocorrências
    await client.query(`
      CREATE TABLE IF NOT EXISTS ocorrencias (
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
    `);

    // Tabela de faltas
    await client.query(`
      CREATE TABLE IF NOT EXISTS faltas (
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
    `);

    // Tabela de usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        patente VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        ativo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar índices
    await client.query(`CREATE INDEX IF NOT EXISTS idx_alunos_turma ON alunos(turma_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ocorrencias_aluno ON ocorrencias(aluno_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_ocorrencias_data ON ocorrencias(data_ocorrencia);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_faltas_aluno ON faltas(aluno_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_faltas_data ON faltas(data_falta);`);

    console.log('Tabelas criadas com sucesso!');
    
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
    throw error;
  } finally {
    client.release();
  }
};

const insertInitialData = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Inserindo dados iniciais...');
    
    // Verificar se já existem turmas
    const turmasExist = await client.query('SELECT COUNT(*) FROM turmas');
    if (parseInt(turmasExist.rows[0].count) > 0) {
      console.log('Dados já existem, pulando inserção...');
      return;
    }

    // Inserir turmas
    await client.query(`
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
    `);

    // Inserir tipos de ocorrência
    await client.query(`
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
    `);

    // Inserir usuário padrão
    await client.query(`
      INSERT INTO usuarios (nome, patente, email, senha) VALUES
      ('João Silva', 'Tenente', 'tenente@escola.mil.br', '$2b$10$YourHashedPasswordHere');
    `);

    console.log('Dados iniciais inseridos com sucesso!');
    
  } catch (error) {
    console.error('Erro ao inserir dados iniciais:', error);
    throw error;
  } finally {
    client.release();
  }
};

const insertSampleData = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Inserindo dados de exemplo...');
    
    // Verificar se já existem alunos
    const alunosExist = await client.query('SELECT COUNT(*) FROM alunos');
    if (parseInt(alunosExist.rows[0].count) > 0) {
      console.log('Dados de exemplo já existem, pulando inserção...');
      return;
    }

    // Inserir alunos de exemplo
    await client.query(`
      INSERT INTO alunos (matricula, nome, data_nascimento, turma_id, telefone_responsavel, email_responsavel, endereco, observacoes) VALUES
      ('2024001', 'Ana Silva Santos', '2012-03-15', 1, '(11) 98765-4321', 'ana.santos@email.com', 'Rua das Flores, 123 - Centro', 'Aluna exemplar'),
      ('2024002', 'Carlos Eduardo Lima', '2012-07-22', 1, '(11) 97654-3210', 'carlos.lima@email.com', 'Av. Brasil, 456 - Jardim', 'Participa do grêmio estudantil'),
      ('2024003', 'Beatriz Costa Oliveira', '2012-01-30', 1, '(11) 96543-2109', 'beatriz.costa@email.com', 'Rua São Paulo, 789 - Vila Nova', 'Monitora de matemática'),
      ('2024004', 'Diego Ferreira Souza', '2012-09-18', 2, '(11) 95432-1098', 'diego.souza@email.com', 'Rua da Paz, 321 - Centro', 'Atleta da escola'),
      ('2024005', 'Eduarda Mendes Silva', '2012-05-12', 2, '(11) 94321-0987', 'eduarda.silva@email.com', 'Av. Independência, 654 - Jardim', 'Líder de turma'),
      ('2024006', 'Felipe Roberto Alves', '2011-11-08', 3, '(11) 93210-9876', 'felipe.alves@email.com', 'Rua Rio de Janeiro, 987 - Vila Nova', 'Participa do coral'),
      ('2024007', 'Gabriela dos Santos', '2011-04-25', 3, '(11) 92109-8765', 'gabriela.santos@email.com', 'Rua Minas Gerais, 147 - Centro', 'Destaque em português'),
      ('2024008', 'Henrique Barbosa Lima', '2010-12-03', 5, '(11) 91098-7654', 'henrique.lima@email.com', 'Av. Goiás, 258 - Jardim', 'Capitão da turma'),
      ('2024009', 'Isabella Rodrigues Costa', '2010-08-17', 5, '(11) 90987-6543', 'isabella.costa@email.com', 'Rua Bahia, 369 - Vila Nova', 'Monitora de ciências'),
      ('2024010', 'João Victor Pereira', '2009-06-14', 7, '(11) 89876-5432', 'joao.pereira@email.com', 'Rua Ceará, 741 - Centro', 'Representante de turma'),
      ('2024011', 'Kamila Fernandes Silva', '2009-10-29', 7, '(11) 88765-4321', 'kamila.silva@email.com', 'Av. Pernambuco, 852 - Jardim', 'Voluntária na biblioteca'),
      ('2024012', 'Lucas Martins Oliveira', '2008-02-11', 9, '(11) 87654-3210', 'lucas.oliveira@email.com', 'Rua Paraná, 963 - Vila Nova', 'Presidente do grêmio'),
      ('2024013', 'Mariana Cunha Santos', '2008-07-05', 9, '(11) 86543-2109', 'mariana.santos@email.com', 'Av. Rio Grande do Sul, 174 - Centro', 'Destaque em química');
    `);

    // Inserir ocorrências de exemplo
    await client.query(`
      INSERT INTO ocorrencias (aluno_id, tipo_ocorrencia_id, data_ocorrencia, hora_ocorrencia, descricao, medidas_tomadas, responsavel_registro, status) VALUES
      (4, 1, '2024-08-01', '07:15', 'Chegou 15 minutos atrasado à primeira aula', 'Advertência verbal e orientação sobre pontualidade', 'Tenente Silva', 'resolvida'),
      (4, 3, '2024-08-05', '10:30', 'Conversando durante explicação da matéria de História', 'Mudança de lugar na sala', 'Sargento Costa', 'resolvida'),
      (6, 4, '2024-08-03', '11:20', 'Uso de celular durante aula de Matemática', 'Celular recolhido até o final das aulas', 'Tenente Silva', 'resolvida'),
      (6, 2, '2024-08-07', '07:00', 'Uniforme incompleto - sem gravata', 'Orientação sobre uso correto do uniforme', 'Sargento Oliveira', 'resolvida'),
      (8, 5, '2024-08-02', '14:15', 'Desrespeitou colega de turma durante discussão', 'Conversa individual e pedido de desculpas', 'Tenente Silva', 'resolvida'),
      (8, 7, '2024-08-10', '15:30', 'Discussão acalorada com colega durante recreio', 'Suspensão de recreio por 2 dias', 'Tenente Silva', 'em_andamento'),
      (10, 1, '2024-08-06', '07:20', 'Atraso de 20 minutos', 'Advertência e justificativa por escrito', 'Sargento Costa', 'pendente'),
      (12, 6, '2024-08-08', '08:00', 'Faltou sem justificativa prévia', 'Convocação dos responsáveis', 'Tenente Silva', 'pendente');
    `);

    // Inserir faltas de exemplo
    await client.query(`
      INSERT INTO faltas (aluno_id, data_falta, justificada, motivo, documento_justificativa) VALUES
      (4, '2024-07-25', false, 'Sem justificativa apresentada', null),
      (4, '2024-08-12', true, 'Consulta médica', 'Atestado médico'),
      (6, '2024-07-30', true, 'Compromisso familiar urgente', 'Declaração dos pais'),
      (6, '2024-08-09', false, 'Não compareceu', null),
      (8, '2024-08-01', true, 'Problema de saúde', 'Atestado médico'),
      (8, '2024-08-11', false, 'Ausência não justificada', null),
      (9, '2024-07-28', true, 'Viagem em família', 'Justificativa dos responsáveis'),
      (10, '2024-08-04', false, 'Falta sem justificativa', null),
      (10, '2024-08-13', true, 'Consulta odontológica', 'Declaração do dentista'),
      (12, '2024-08-08', false, 'Não compareceu às aulas', null),
      (12, '2024-08-10', false, 'Ausência não justificada', null),
      (13, '2024-07-26', true, 'Participação em olimpíada de química', 'Comprovante de participação');
    `);

    console.log('Dados de exemplo inseridos com sucesso!');
    
  } catch (error) {
    console.error('Erro ao inserir dados de exemplo:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const setupDatabase = async () => {
  try {
    await createTables();
    await insertInitialData();
    await insertSampleData();
    console.log('Setup do banco de dados concluído com sucesso!');
  } catch (error) {
    console.error('Erro no setup do banco de dados:', error);
    throw error;
  }
};

// Executar setup se chamado diretamente
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('Setup concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Falha no setup:', error);
      process.exit(1);
    });
}