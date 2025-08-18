import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import alunosRouter from './routes/alunos';
import ocorrenciasRouter from './routes/ocorrencias';
import faltasRouter from './routes/faltas';
import metricasRouter from './routes/metricas';
import turmasRouter from './routes/turmas';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/alunos', alunosRouter);
app.use('/api/ocorrencias', ocorrenciasRouter);
app.use('/api/faltas', faltasRouter);
app.use('/api/metricas', metricasRouter);
app.use('/api/turmas', turmasRouter);

app.get('/', (req, res) => {
  res.json({ 
    message: 'API Sistema de Ficha Disciplinar - Escola Cívico Militar Jupiara',
    endpoints: {
      health: '/api/health',
      alunos: '/api/alunos',
      ocorrencias: '/api/ocorrencias',
      faltas: '/api/faltas',
      metricas: '/api/metricas',
      turmas: '/api/turmas'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sistema de Ficha Disciplinar - Escola Cívico Militar Jupiara' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});