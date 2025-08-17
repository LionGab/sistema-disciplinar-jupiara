import express from 'express';
import pool from '../database/db';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { aluno_id, turma_id, data_inicio, data_fim, justificada } = req.query;
    
    let query = `
      SELECT f.*, a.nome as aluno_nome, a.matricula, t.nome as turma_nome
      FROM faltas f
      JOIN alunos a ON f.aluno_id = a.id
      JOIN turmas t ON a.turma_id = t.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;
    
    if (aluno_id) {
      paramCount++;
      query += ` AND f.aluno_id = $${paramCount}`;
      params.push(aluno_id);
    }
    
    if (turma_id) {
      paramCount++;
      query += ` AND a.turma_id = $${paramCount}`;
      params.push(turma_id);
    }
    
    if (data_inicio) {
      paramCount++;
      query += ` AND f.data_falta >= $${paramCount}`;
      params.push(data_inicio);
    }
    
    if (data_fim) {
      paramCount++;
      query += ` AND f.data_falta <= $${paramCount}`;
      params.push(data_fim);
    }
    
    if (justificada !== undefined) {
      paramCount++;
      query += ` AND f.justificada = $${paramCount}`;
      params.push(justificada === 'true');
    }
    
    query += ' ORDER BY f.data_falta DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar faltas:', error);
    res.status(500).json({ error: 'Erro ao buscar faltas' });
  }
});

router.get('/resumo-turma/:turma_id', async (req, res) => {
  try {
    const { turma_id } = req.params;
    
    const query = `
      SELECT 
        a.id as aluno_id,
        a.nome as aluno_nome,
        a.matricula,
        COUNT(f.id) as total_faltas,
        SUM(CASE WHEN f.justificada = true THEN 1 ELSE 0 END) as faltas_justificadas,
        SUM(CASE WHEN f.justificada = false THEN 1 ELSE 0 END) as faltas_nao_justificadas
      FROM alunos a
      LEFT JOIN faltas f ON a.id = f.aluno_id
      WHERE a.turma_id = $1
      GROUP BY a.id, a.nome, a.matricula
      ORDER BY a.nome
    `;
    
    const result = await pool.query(query, [turma_id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar resumo de faltas:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo de faltas' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { aluno_id, data_falta, justificada, motivo, documento_justificativa } = req.body;
    
    const query = `
      INSERT INTO faltas (aluno_id, data_falta, justificada, motivo, documento_justificativa)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [aluno_id, data_falta, justificada || false, motivo, documento_justificativa];
    const result = await pool.query(query, values);
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Falta já registrada para este aluno nesta data' });
    }
    console.error('Erro ao registrar falta:', error);
    res.status(500).json({ error: 'Erro ao registrar falta' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { justificada, motivo, documento_justificativa } = req.body;
    
    const query = `
      UPDATE faltas
      SET justificada = $1, motivo = $2, documento_justificativa = $3
      WHERE id = $4
      RETURNING *
    `;
    
    const values = [justificada, motivo, documento_justificativa, id];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Falta não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar falta:', error);
    res.status(500).json({ error: 'Erro ao atualizar falta' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM faltas WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Falta não encontrada' });
    }
    
    res.json({ message: 'Falta removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover falta:', error);
    res.status(500).json({ error: 'Erro ao remover falta' });
  }
});

export default router;