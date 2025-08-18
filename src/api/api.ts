import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const alunosAPI = {
  listar: (turmaId?: number) => 
    api.get('/alunos', { params: { turma_id: turmaId } }),
  
  buscarPorId: (id: number) => 
    api.get(`/alunos/${id}`),
  
  fichaCompleta: (id: number) => 
    api.get(`/alunos/${id}/ficha-completa`),
  
  criar: (aluno: any) => 
    api.post('/alunos', aluno),
  
  atualizar: (id: number, aluno: any) => 
    api.put(`/alunos/${id}`, aluno),
  
  deletar: (id: number) => 
    api.delete(`/alunos/${id}`),
};

export const ocorrenciasAPI = {
  listar: (params?: any) => 
    api.get('/ocorrencias', { params }),
  
  buscarPorId: (id: number) => 
    api.get(`/ocorrencias/${id}`),
  
  tipos: () => 
    api.get('/ocorrencias/tipos'),
  
  criar: (ocorrencia: any) => 
    api.post('/ocorrencias', ocorrencia),
  
  atualizar: (id: number, ocorrencia: any) => 
    api.put(`/ocorrencias/${id}`, ocorrencia),
  
  deletar: (id: number) => 
    api.delete(`/ocorrencias/${id}`),
};

export const faltasAPI = {
  listar: (params?: any) => 
    api.get('/faltas', { params }),
  
  resumoTurma: (turmaId: number) => 
    api.get(`/faltas/resumo-turma/${turmaId}`),
  
  criar: (falta: any) => 
    api.post('/faltas', falta),
  
  atualizar: (id: number, falta: any) => 
    api.put(`/faltas/${id}`, falta),
  
  deletar: (id: number) => 
    api.delete(`/faltas/${id}`),
};

export const metricasAPI = {
  geral: () => 
    api.get('/metricas/geral'),
  
  porTurma: () => 
    api.get('/metricas/por-turma'),
  
  turma: (turmaId: number) => 
    api.get(`/metricas/turma/${turmaId}`),
  
  evolucaoMensal: (turmaId?: number) => 
    api.get('/metricas/evolucao-mensal', { params: { turma_id: turmaId } }),
};

export const turmasAPI = {
  listar: () => 
    api.get('/turmas'),
  
  buscarPorId: (id: number) => 
    api.get(`/turmas/${id}`),
  
  criar: (turma: any) => 
    api.post('/turmas', turma),
};

export default api;