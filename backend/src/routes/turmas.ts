import express from 'express';
import pool from '../database/db';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT t.*, COUNT(a.id) as total_alunos
      FROM turmas t
      LEFT JOIN alunos a ON t.id = a.turma_id
      GROUP BY t.id
      ORDER BY t.nome
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar turmas:', error);
    res.status(500).json({ error: 'Erro ao buscar turmas' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT t.*, COUNT(a.id) as total_alunos
      FROM turmas t
      LEFT JOIN alunos a ON t.id = a.turma_id
      WHERE t.id = $1
      GROUP BY t.id
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar turma:', error);
    res.status(500).json({ error: 'Erro ao buscar turma' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome, ano, turno } = req.body;
    
    const query = `
      INSERT INTO turmas (nome, ano, turno)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [nome, ano, turno];
    const result = await pool.query(query, values);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar turma:', error);
    res.status(500).json({ error: 'Erro ao criar turma' });
  }
});

export default router;