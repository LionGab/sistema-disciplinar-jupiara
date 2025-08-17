import express from 'express';
import pool from '../database/db';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { turma_id } = req.query;
    let query = `
      SELECT a.*, t.nome as turma_nome
      FROM alunos a
      JOIN turmas t ON a.turma_id = t.id
    `;
    const params: any[] = [];
    
    if (turma_id) {
      query += ' WHERE a.turma_id = $1';
      params.push(turma_id);
    }
    
    query += ' ORDER BY t.nome, a.nome';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        a.*,
        t.nome as turma_nome,
        COUNT(DISTINCT o.id) as total_ocorrencias,
        COUNT(DISTINCT f.id) as total_faltas,
        SUM(CASE WHEN f.justificada = false THEN 1 ELSE 0 END) as faltas_nao_justificadas,
        COALESCE(SUM(to.pontos), 0) as pontos_totais
      FROM alunos a
      JOIN turmas t ON a.turma_id = t.id
      LEFT JOIN ocorrencias o ON a.id = o.aluno_id
      LEFT JOIN faltas f ON a.id = f.aluno_id
      LEFT JOIN tipos_ocorrencia to ON o.tipo_ocorrencia_id = to.id
      WHERE a.id = $1
      GROUP BY a.id, t.nome
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    res.status(500).json({ error: 'Erro ao buscar aluno' });
  }
});

router.get('/:id/ficha-completa', async (req, res) => {
  try {
    const { id } = req.params;
    
    const alunoQuery = `
      SELECT a.*, t.nome as turma_nome
      FROM alunos a
      JOIN turmas t ON a.turma_id = t.id
      WHERE a.id = $1
    `;
    
    const ocorrenciasQuery = `
      SELECT o.*, to.nome as tipo_nome, to.gravidade, to.pontos
      FROM ocorrencias o
      JOIN tipos_ocorrencia to ON o.tipo_ocorrencia_id = to.id
      WHERE o.aluno_id = $1
      ORDER BY o.data_ocorrencia DESC
    `;
    
    const faltasQuery = `
      SELECT *
      FROM faltas
      WHERE aluno_id = $1
      ORDER BY data_falta DESC
    `;
    
    const [alunoResult, ocorrenciasResult, faltasResult] = await Promise.all([
      pool.query(alunoQuery, [id]),
      pool.query(ocorrenciasQuery, [id]),
      pool.query(faltasQuery, [id])
    ]);
    
    if (alunoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    
    res.json({
      aluno: alunoResult.rows[0],
      ocorrencias: ocorrenciasResult.rows,
      faltas: faltasResult.rows
    });
  } catch (error) {
    console.error('Erro ao buscar ficha completa:', error);
    res.status(500).json({ error: 'Erro ao buscar ficha completa' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { matricula, nome, data_nascimento, turma_id, telefone_responsavel, email_responsavel, endereco, observacoes } = req.body;
    
    const query = `
      INSERT INTO alunos (matricula, nome, data_nascimento, turma_id, telefone_responsavel, email_responsavel, endereco, observacoes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [matricula, nome, data_nascimento, turma_id, telefone_responsavel, email_responsavel, endereco, observacoes];
    const result = await pool.query(query, values);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    res.status(500).json({ error: 'Erro ao criar aluno' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { matricula, nome, data_nascimento, turma_id, telefone_responsavel, email_responsavel, endereco, observacoes } = req.body;
    
    const query = `
      UPDATE alunos
      SET matricula = $1, nome = $2, data_nascimento = $3, turma_id = $4,
          telefone_responsavel = $5, email_responsavel = $6, endereco = $7,
          observacoes = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;
    
    const values = [matricula, nome, data_nascimento, turma_id, telefone_responsavel, email_responsavel, endereco, observacoes, id];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    res.status(500).json({ error: 'Erro ao atualizar aluno' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM alunos WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    
    res.json({ message: 'Aluno removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover aluno:', error);
    res.status(500).json({ error: 'Erro ao remover aluno' });
  }
});

export default router;