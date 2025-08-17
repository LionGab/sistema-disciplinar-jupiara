import express from 'express';
import pool from '../database/db';

const router = express.Router();

router.get('/geral', async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(DISTINCT a.id) as total_alunos,
        COUNT(DISTINCT o.id) as total_ocorrencias,
        COUNT(DISTINCT f.id) as total_faltas,
        COUNT(DISTINCT CASE WHEN o.data_ocorrencia >= CURRENT_DATE - INTERVAL '30 days' THEN o.id END) as ocorrencias_ultimo_mes,
        COUNT(DISTINCT CASE WHEN f.data_falta >= CURRENT_DATE - INTERVAL '30 days' THEN f.id END) as faltas_ultimo_mes
      FROM alunos a
      LEFT JOIN ocorrencias o ON a.id = o.aluno_id
      LEFT JOIN faltas f ON a.id = f.aluno_id
    `;
    
    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar métricas gerais:', error);
    res.status(500).json({ error: 'Erro ao buscar métricas gerais' });
  }
});

router.get('/por-turma', async (req, res) => {
  try {
    const query = `
      SELECT 
        t.id as turma_id,
        t.nome as turma_nome,
        t.ano,
        t.turno,
        COUNT(DISTINCT a.id) as total_alunos,
        COUNT(DISTINCT o.id) as total_ocorrencias,
        COUNT(DISTINCT f.id) as total_faltas,
        COUNT(DISTINCT CASE WHEN f.justificada = false THEN f.id END) as faltas_nao_justificadas,
        COALESCE(AVG(to.pontos), 0) as media_pontos_ocorrencia,
        COUNT(DISTINCT CASE WHEN to.gravidade = 'grave' THEN o.id END) as ocorrencias_graves,
        COUNT(DISTINCT CASE WHEN to.gravidade = 'media' THEN o.id END) as ocorrencias_medias,
        COUNT(DISTINCT CASE WHEN to.gravidade = 'leve' THEN o.id END) as ocorrencias_leves
      FROM turmas t
      LEFT JOIN alunos a ON t.id = a.turma_id
      LEFT JOIN ocorrencias o ON a.id = o.aluno_id
      LEFT JOIN faltas f ON a.id = f.aluno_id
      LEFT JOIN tipos_ocorrencia to ON o.tipo_ocorrencia_id = to.id
      GROUP BY t.id, t.nome, t.ano, t.turno
      ORDER BY t.nome
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar métricas por turma:', error);
    res.status(500).json({ error: 'Erro ao buscar métricas por turma' });
  }
});

router.get('/turma/:turma_id', async (req, res) => {
  try {
    const { turma_id } = req.params;
    
    const metricasQuery = `
      SELECT 
        t.id as turma_id,
        t.nome as turma_nome,
        COUNT(DISTINCT a.id) as total_alunos,
        COUNT(DISTINCT o.id) as total_ocorrencias,
        COUNT(DISTINCT f.id) as total_faltas,
        COUNT(DISTINCT CASE WHEN f.justificada = false THEN f.id END) as faltas_nao_justificadas,
        COALESCE(SUM(to.pontos), 0) as pontos_totais,
        COALESCE(AVG(to.pontos), 0) as media_pontos
      FROM turmas t
      LEFT JOIN alunos a ON t.id = a.turma_id
      LEFT JOIN ocorrencias o ON a.id = o.aluno_id
      LEFT JOIN faltas f ON a.id = f.aluno_id
      LEFT JOIN tipos_ocorrencia to ON o.tipo_ocorrencia_id = to.id
      WHERE t.id = $1
      GROUP BY t.id, t.nome
    `;
    
    const topAlunosQuery = `
      SELECT 
        a.id,
        a.nome,
        a.matricula,
        COUNT(DISTINCT o.id) as total_ocorrencias,
        COALESCE(SUM(to.pontos), 0) as pontos_totais
      FROM alunos a
      LEFT JOIN ocorrencias o ON a.id = o.aluno_id
      LEFT JOIN tipos_ocorrencia to ON o.tipo_ocorrencia_id = to.id
      WHERE a.turma_id = $1
      GROUP BY a.id, a.nome, a.matricula
      ORDER BY pontos_totais DESC
      LIMIT 5
    `;
    
    const ocorrenciasPorTipoQuery = `
      SELECT 
        to.nome as tipo,
        to.gravidade,
        COUNT(o.id) as quantidade
      FROM ocorrencias o
      JOIN alunos a ON o.aluno_id = a.id
      JOIN tipos_ocorrencia to ON o.tipo_ocorrencia_id = to.id
      WHERE a.turma_id = $1
      GROUP BY to.nome, to.gravidade
      ORDER BY quantidade DESC
    `;
    
    const [metricasResult, topAlunosResult, ocorrenciasTipoResult] = await Promise.all([
      pool.query(metricasQuery, [turma_id]),
      pool.query(topAlunosQuery, [turma_id]),
      pool.query(ocorrenciasPorTipoQuery, [turma_id])
    ]);
    
    if (metricasResult.rows.length === 0) {
      return res.status(404).json({ error: 'Turma não encontrada' });
    }
    
    res.json({
      metricas: metricasResult.rows[0],
      alunosComMaisOcorrencias: topAlunosResult.rows,
      ocorrenciasPorTipo: ocorrenciasTipoResult.rows
    });
  } catch (error) {
    console.error('Erro ao buscar métricas da turma:', error);
    res.status(500).json({ error: 'Erro ao buscar métricas da turma' });
  }
});

router.get('/evolucao-mensal', async (req, res) => {
  try {
    const { turma_id } = req.query;
    
    let query = `
      SELECT 
        TO_CHAR(data_serie, 'YYYY-MM') as mes,
        COUNT(DISTINCT o.id) as ocorrencias,
        COUNT(DISTINCT f.id) as faltas
      FROM generate_series(
        CURRENT_DATE - INTERVAL '11 months',
        CURRENT_DATE,
        '1 month'::interval
      ) as data_serie
      LEFT JOIN ocorrencias o ON TO_CHAR(o.data_ocorrencia, 'YYYY-MM') = TO_CHAR(data_serie, 'YYYY-MM')
      LEFT JOIN faltas f ON TO_CHAR(f.data_falta, 'YYYY-MM') = TO_CHAR(data_serie, 'YYYY-MM')
      LEFT JOIN alunos a ON (o.aluno_id = a.id OR f.aluno_id = a.id)
    `;
    
    const params: any[] = [];
    
    if (turma_id) {
      query += ' WHERE a.turma_id = $1';
      params.push(turma_id);
    }
    
    query += ' GROUP BY mes ORDER BY mes';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar evolução mensal:', error);
    res.status(500).json({ error: 'Erro ao buscar evolução mensal' });
  }
});

export default router;