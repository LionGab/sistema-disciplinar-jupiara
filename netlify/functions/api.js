const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_OZ8uoi6dbEHF@ep-round-hat-ae1xywg3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/api', '');
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : null;
    const query = event.queryStringParameters || {};

    console.log('Path:', path, 'Method:', method);

    // Health check
    if (path === '/health') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          status: 'OK', 
          message: 'Sistema de Ficha Disciplinar - Escola Cívico Militar Jupiara',
          timestamp: new Date().toISOString()
        })
      };
    }

    // Root endpoint
    if (path === '' || path === '/') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'API Sistema de Ficha Disciplinar - Escola Cívico Militar Jupiara',
          endpoints: {
            health: '/api/health',
            alunos: '/api/alunos',
            ocorrencias: '/api/ocorrencias',
            faltas: '/api/faltas',
            metricas: '/api/metricas',
            turmas: '/api/turmas'
          }
        })
      };
    }

    // Alunos endpoints
    if (path.startsWith('/alunos')) {
      if (method === 'GET') {
        const { turma_id } = query;
        let sql = `
          SELECT a.*, t.nome as turma_nome
          FROM alunos a
          JOIN turmas t ON a.turma_id = t.id
        `;
        const params = [];
        
        if (turma_id) {
          sql += ' WHERE a.turma_id = $1';
          params.push(turma_id);
        }
        
        sql += ' ORDER BY t.nome, a.nome';
        
        const result = await pool.query(sql, params);
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(result.rows)
        };
      }
    }

    // Turmas endpoints
    if (path.startsWith('/turmas')) {
      if (method === 'GET') {
        const result = await pool.query(`
          SELECT t.*, COUNT(a.id) as total_alunos
          FROM turmas t
          LEFT JOIN alunos a ON t.id = a.turma_id
          GROUP BY t.id, t.nome, t.ano, t.turno
          ORDER BY t.nome
        `);
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(result.rows)
        };
      }
    }

    // Ocorrências endpoints
    if (path.startsWith('/ocorrencias')) {
      if (path === '/ocorrencias/tipos' && method === 'GET') {
        const result = await pool.query('SELECT * FROM tipos_ocorrencia ORDER BY gravidade, nome');
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(result.rows)
        };
      }
      
      if (method === 'GET') {
        const { aluno_id, turma_id, data_inicio, data_fim } = query;
        
        let sql = `
          SELECT o.*, a.nome as aluno_nome, a.matricula, t.nome as turma_nome,
                 to.nome as tipo_nome, to.gravidade, to.pontos
          FROM ocorrencias o
          JOIN alunos a ON o.aluno_id = a.id
          JOIN turmas t ON a.turma_id = t.id
          JOIN tipos_ocorrencia to ON o.tipo_ocorrencia_id = to.id
          WHERE 1=1
        `;
        const params = [];
        let paramCount = 0;
        
        if (aluno_id) {
          paramCount++;
          sql += ` AND o.aluno_id = $${paramCount}`;
          params.push(aluno_id);
        }
        
        if (turma_id) {
          paramCount++;
          sql += ` AND a.turma_id = $${paramCount}`;
          params.push(turma_id);
        }
        
        sql += ' ORDER BY o.data_ocorrencia DESC, o.hora_ocorrencia DESC';
        
        const result = await pool.query(sql, params);
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(result.rows)
        };
      }
    }

    // Faltas endpoints
    if (path.startsWith('/faltas')) {
      if (method === 'GET') {
        const result = await pool.query(`
          SELECT f.*, a.nome as aluno_nome, a.matricula, t.nome as turma_nome
          FROM faltas f
          JOIN alunos a ON f.aluno_id = a.id
          JOIN turmas t ON a.turma_id = t.id
          ORDER BY f.data_falta DESC
        `);
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(result.rows)
        };
      }
    }

    // Métricas endpoints
    if (path.startsWith('/metricas')) {
      if (path === '/metricas/geral' && method === 'GET') {
        const result = await pool.query(`
          SELECT 
            COUNT(DISTINCT a.id) as total_alunos,
            COUNT(DISTINCT o.id) as total_ocorrencias,
            COUNT(DISTINCT f.id) as total_faltas,
            COUNT(DISTINCT CASE WHEN o.data_ocorrencia >= CURRENT_DATE - INTERVAL '30 days' THEN o.id END) as ocorrencias_ultimo_mes,
            COUNT(DISTINCT CASE WHEN f.data_falta >= CURRENT_DATE - INTERVAL '30 days' THEN f.id END) as faltas_ultimo_mes
          FROM alunos a
          LEFT JOIN ocorrencias o ON a.id = o.aluno_id
          LEFT JOIN faltas f ON a.id = f.aluno_id
        `);
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(result.rows[0])
        };
      }
      
      if (path === '/metricas/por-turma' && method === 'GET') {
        const result = await pool.query(`
          SELECT 
            t.id as turma_id,
            t.nome as turma_nome,
            t.ano,
            t.turno,
            COUNT(DISTINCT a.id) as total_alunos,
            COUNT(DISTINCT o.id) as total_ocorrencias,
            COUNT(DISTINCT f.id) as total_faltas,
            COUNT(DISTINCT CASE WHEN f.justificada = false THEN f.id END) as faltas_nao_justificadas,
            COALESCE(AVG(to.pontos), 0) as media_pontos_ocorrencia
          FROM turmas t
          LEFT JOIN alunos a ON t.id = a.turma_id
          LEFT JOIN ocorrencias o ON a.id = o.aluno_id
          LEFT JOIN faltas f ON a.id = f.aluno_id
          LEFT JOIN tipos_ocorrencia to ON o.tipo_ocorrencia_id = to.id
          GROUP BY t.id, t.nome, t.ano, t.turno
          ORDER BY t.nome
        `);
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(result.rows)
        };
      }
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Endpoint não encontrado' })
    };

  } catch (error) {
    console.error('Erro na API:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Erro interno do servidor', details: error.message })
    };
  }
};