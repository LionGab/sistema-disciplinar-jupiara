const { Client } = require('pg');
require('dotenv').config();

const popularDados = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('🔗 Conectado ao banco de dados');

    // Dados de exemplo de alunos
    const alunos = [
      { nome: 'João Silva Santos', matricula: '202401001', turma_id: 1, data_nascimento: '2008-05-15' },
      { nome: 'Maria Oliveira Lima', matricula: '202401002', turma_id: 1, data_nascimento: '2008-08-22' },
      { nome: 'Pedro Costa Ferreira', matricula: '202401003', turma_id: 2, data_nascimento: '2008-12-10' },
      { nome: 'Ana Souza Alves', matricula: '202401004', turma_id: 2, data_nascimento: '2008-03-28' },
      { nome: 'Lucas Rodrigues Pereira', matricula: '202401005', turma_id: 3, data_nascimento: '2007-11-05' },
      { nome: 'Camila Santos Silva', matricula: '202401006', turma_id: 3, data_nascimento: '2007-06-18' },
      { nome: 'Gabriel Lima Costa', matricula: '202401007', turma_id: 4, data_nascimento: '2007-09-12' },
      { nome: 'Beatriz Alves Ferreira', matricula: '202401008', turma_id: 4, data_nascimento: '2007-04-30' },
      { nome: 'Rafael Pereira Santos', matricula: '202401009', turma_id: 9, data_nascimento: '2006-01-15' },
      { nome: 'Julia Costa Lima', matricula: '202401010', turma_id: 9, data_nascimento: '2006-07-22' },
    ];

    console.log('📋 Inserindo alunos de exemplo...');
    for (const aluno of alunos) {
      try {
        await client.query(
          'INSERT INTO alunos (nome, matricula, turma_id, data_nascimento) VALUES ($1, $2, $3, $4)',
          [aluno.nome, aluno.matricula, aluno.turma_id, aluno.data_nascimento]
        );
        console.log(`✅ Aluno ${aluno.nome} inserido`);
      } catch (error) {
        if (error.message.includes('duplicate key')) {
          console.log(`ℹ️  Aluno ${aluno.nome} já existe`);
        } else {
          console.log(`⚠️  Erro ao inserir ${aluno.nome}:`, error.message);
        }
      }
    }

    // Alguns dados de faltas
    console.log('📋 Inserindo faltas de exemplo...');
    const faltas = [
      { aluno_id: 1, data_falta: '2024-08-10', justificada: false },
      { aluno_id: 1, data_falta: '2024-08-15', justificada: true, motivo: 'Consulta médica' },
      { aluno_id: 2, data_falta: '2024-08-12', justificada: false },
      { aluno_id: 3, data_falta: '2024-08-14', justificada: false },
    ];

    for (const falta of faltas) {
      try {
        await client.query(
          'INSERT INTO faltas (aluno_id, data_falta, justificada, motivo) VALUES ($1, $2, $3, $4)',
          [falta.aluno_id, falta.data_falta, falta.justificada, falta.motivo || null]
        );
        console.log(`✅ Falta inserida para aluno ID ${falta.aluno_id}`);
      } catch (error) {
        if (error.message.includes('duplicate key')) {
          console.log(`ℹ️  Falta já existe para aluno ID ${falta.aluno_id}`);
        } else {
          console.log(`⚠️  Erro ao inserir falta:`, error.message);
        }
      }
    }

    // Algumas ocorrências
    console.log('📋 Inserindo ocorrências de exemplo...');
    const ocorrencias = [
      { aluno_id: 1, tipo_ocorrencia_id: 1, data_ocorrencia: '2024-08-16', descricao: 'Chegou 10 minutos atrasado', responsavel_registro: 'Sargento Silva' },
      { aluno_id: 2, tipo_ocorrencia_id: 3, data_ocorrencia: '2024-08-17', descricao: 'Conversa excessiva durante a aula de matemática', responsavel_registro: 'Tenente Santos' },
      { aluno_id: 3, tipo_ocorrencia_id: 4, data_ocorrencia: '2024-08-18', descricao: 'Uso do celular durante a explicação', responsavel_registro: 'Sargento Silva' },
    ];

    for (const ocorrencia of ocorrencias) {
      try {
        await client.query(
          'INSERT INTO ocorrencias (aluno_id, tipo_ocorrencia_id, data_ocorrencia, descricao, responsavel_registro) VALUES ($1, $2, $3, $4, $5)',
          [ocorrencia.aluno_id, ocorrencia.tipo_ocorrencia_id, ocorrencia.data_ocorrencia, ocorrencia.descricao, ocorrencia.responsavel_registro]
        );
        console.log(`✅ Ocorrência inserida para aluno ID ${ocorrencia.aluno_id}`);
      } catch (error) {
        console.log(`⚠️  Erro ao inserir ocorrência:`, error.message);
      }
    }

    console.log('🎉 Dados de exemplo inseridos com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
};

popularDados();