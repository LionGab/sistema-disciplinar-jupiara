import React, { useState, useEffect } from 'react';
import { BarChart3, Users, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';

interface MetricasGerais {
  total_alunos: string;
  total_ocorrencias: string;
  total_faltas: string;
  ocorrencias_ultimo_mes: string;
  faltas_ultimo_mes: string;
}

interface MetricasTurma {
  turma_id: number;
  turma_nome: string;
  ano: string;
  turno: string;
  total_alunos: string;
  total_ocorrencias: string;
  total_faltas: string;
  faltas_nao_justificadas: string;
  media_pontos_ocorrencia: string;
}

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api' 
  : 'http://localhost:5000/api';

function Dashboard() {
  const [metricas, setMetricas] = useState<MetricasGerais | null>(null);
  const [turmas, setTurmas] = useState<MetricasTurma[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [metricasRes, turmasRes] = await Promise.all([
          fetch(`${API_BASE}/metricas/geral`),
          fetch(`${API_BASE}/metricas/por-turma`)
        ]);

        const metricasData = await metricasRes.json();
        const turmasData = await turmasRes.json();

        setMetricas(metricasData);
        setTurmas(turmasData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-military-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <BarChart3 className="h-8 w-8 text-military-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Disciplinar</h1>
            <p className="text-gray-600">Visão geral do sistema de controle disciplinar</p>
          </div>
        </div>
      </div>

      {/* Métricas Gerais */}
      {metricas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Alunos</p>
                <p className="text-2xl font-bold text-gray-900">{metricas.total_alunos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Ocorrências</p>
                <p className="text-2xl font-bold text-gray-900">{metricas.total_ocorrencias}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Faltas</p>
                <p className="text-2xl font-bold text-gray-900">{metricas.total_faltas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ocorrências (30 dias)</p>
                <p className="text-2xl font-bold text-gray-900">{metricas.ocorrencias_ultimo_mes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Turmas */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Métricas por Turma</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alunos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ocorrências
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Faltas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Faltas Não Justificadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Média Pontos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {turmas.map((turma) => (
                <tr key={turma.turma_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{turma.turma_nome}</div>
                      <div className="text-sm text-gray-500">{turma.ano} - {turma.turno}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {turma.total_alunos}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {turma.total_ocorrencias}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {turma.total_faltas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      parseInt(turma.faltas_nao_justificadas) > 0 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {turma.faltas_nao_justificadas}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {parseFloat(turma.media_pontos_ocorrencia).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;