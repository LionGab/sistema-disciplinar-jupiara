import express from 'express';
import pool from '../database/db';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { aluno_id, turma_id, data_inicio, data_fim } = req.query;
    
    let query = `
      SELECT o.*, a.nome as aluno_nome, a.matricula, t.nome as turma_nome,
             to.nome as tipo_nome, to.gravidade, to.pontos
      FROM ocorrencias o
      JOIN alunos a ON o.aluno_id = a.id
      JOIN turmas t ON a.turma_id = t.id
      JOIN tipos_ocorrencia to ON o.tipo_ocorrencia_id = to.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;
    
    if (aluno_id) {
      paramCount++;
      query += ` AND o.aluno_id = $${paramCount}`;
      params.push(aluno_id);
    }
    
    if (turma_id) {
      paramCount++;
      query += ` AND a.turma_id = $${paramCount}`;
      params.push(turma_id);
    }
    
    if (data_inicio) {
      paramCount++;
      query += ` AND o.data_ocorrencia >= $${paramCount}`;
      params.push(data_inicio);
    }
    
    if (data_fim) {
      paramCount++;
      query += ` AND o.data_ocorrencia <= $${paramCount}`;
      params.push(data_fim);
    }
    
    query += ' ORDER BY o.data_ocorrencia DESC, o.hora_ocorrencia DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar ocorrências:', error);
    res.status(500).json({ error: 'Erro ao buscar ocorrências' });
  }
});

router.get('/tipos', async (req, res) => {
  try {
    const query = 'SELECT * FROM tipos_ocorrencia ORDER BY gravidade, nome';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar tipos de ocorrência:', error);
    res.status(500).json({ error: 'Erro ao buscar tipos de ocorrência' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT o.*, a.nome as aluno_nome, a.matricula, t.nome as turma_nome,
             to.nome as tipo_nome, to.gravidade, to.pontos
      FROM ocorrencias o
      JOIN alunos a ON o.aluno_id = a.id
      JOIN turmas t ON a.turma_id = t.id
      JOIN tipos_ocorrencia to ON o.tipo_ocorrencia_id = to.id
      WHERE o.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ocorrência não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar ocorrência:', error);
    res.status(500).json({ error: 'Erro ao buscar ocorrência' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      aluno_id,
      tipo_ocorrencia_id,
      data_ocorrencia,
      hora_ocorrencia,
      descricao,
      medidas_tomadas,
      responsavel_registro,
      status
    } = req.body;
    
    const query = `
      INSERT INTO ocorrencias (aluno_id, tipo_ocorrencia_id, data_ocorrencia, hora_ocorrencia, descricao, medidas_tomadas, responsavel_registro, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      aluno_id,
      tipo_ocorrencia_id,
      data_ocorrencia,
      hora_ocorrencia,
      descricao,
      medidas_tomadas,
      responsavel_registro,
      status || 'pendente'
    ];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar ocorrência:', error);
    res.status(500).json({ error: 'Erro ao criar ocorrência' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tipo_ocorrencia_id,
      data_ocorrencia,
      hora_ocorrencia,
      descricao,
      medidas_tomadas,
      status
    } = req.body;
    
    const query = `
      UPDATE ocorrencias
      SET tipo_ocorrencia_id = $1, data_ocorrencia = $2, hora_ocorrencia = $3,
          descricao = $4, medidas_tomadas = $5, status = $6,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    
    const values = [
      tipo_ocorrencia_id,
      data_ocorrencia,
      hora_ocorrencia,
      descricao,
      medidas_tomadas,
      status,
      id
    ];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ocorrência não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar ocorrência:', error);
    res.status(500).json({ error: 'Erro ao atualizar ocorrência' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM ocorrencias WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ocorrência não encontrada' });
    }
    
    res.json({ message: 'Ocorrência removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover ocorrência:', error);
    res.status(500).json({ error: 'Erro ao remover ocorrência' });
  }
});

export default router;