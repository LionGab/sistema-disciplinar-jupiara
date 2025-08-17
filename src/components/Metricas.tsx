import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, AlertTriangle } from 'lucide-react';

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

function Metricas() {
  const [metricas, setMetricas] = useState<MetricasTurma[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetricas = async () => {
      try {
        const response = await fetch(`${API_BASE}/metricas/por-turma`);
        const data = await response.json();
        setMetricas(data);
      } catch (error) {
        console.error('Erro ao buscar métricas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetricas();
  }, []);

  const calcularTotais = () => {
    return metricas.reduce(
      (acc, turma) => ({
        alunos: acc.alunos + parseInt(turma.total_alunos),
        ocorrencias: acc.ocorrencias + parseInt(turma.total_ocorrencias),
        faltas: acc.faltas + parseInt(turma.total_faltas),
        faltasNaoJustificadas: acc.faltasNaoJustificadas + parseInt(turma.faltas_nao_justificadas),
      }),
      { alunos: 0, ocorrencias: 0, faltas: 0, faltasNaoJustificadas: 0 }
    );
  };

  const turmaComMaisOcorrencias = metricas.reduce(
    (max, turma) => 
      parseInt(turma.total_ocorrencias) > parseInt(max.total_ocorrencias || '0') ? turma : max,
    {} as MetricasTurma
  );

  const turmaComMaisFaltas = metricas.reduce(
    (max, turma) => 
      parseInt(turma.total_faltas) > parseInt(max.total_faltas || '0') ? turma : max,
    {} as MetricasTurma
  );

  const totais = calcularTotais();

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
            <h1 className="text-2xl font-bold text-gray-900">Métricas Detalhadas</h1>
            <p className="text-gray-600">Análise completa do desempenho disciplinar por turma</p>
          </div>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Alunos</p>
              <p className="text-2xl font-bold text-gray-900">{totais.alunos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Ocorrências</p>
              <p className="text-2xl font-bold text-gray-900">{totais.ocorrencias}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Faltas</p>
              <p className="text-2xl font-bold text-gray-900">{totais.faltas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Faltas Não Justificadas</p>
              <p className="text-2xl font-bold text-gray-900">{totais.faltasNaoJustificadas}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Destaques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🚨 Turma com Mais Ocorrências</h3>
          {turmaComMaisOcorrencias.turma_nome ? (
            <div>
              <p className="text-xl font-bold text-red-600">{turmaComMaisOcorrencias.turma_nome}</p>
              <p className="text-gray-600">{turmaComMaisOcorrencias.ano} - {turmaComMaisOcorrencias.turno}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {turmaComMaisOcorrencias.total_ocorrencias} ocorrências
              </p>
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma ocorrência registrada</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Turma com Mais Faltas</h3>
          {turmaComMaisFaltas.turma_nome ? (
            <div>
              <p className="text-xl font-bold text-yellow-600">{turmaComMaisFaltas.turma_nome}</p>
              <p className="text-gray-600">{turmaComMaisFaltas.ano} - {turmaComMaisFaltas.turno}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {turmaComMaisFaltas.total_faltas} faltas
              </p>
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma falta registrada</p>
          )}
        </div>
      </div>

      {/* Tabela Detalhada */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Análise Detalhada por Turma</h2>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Índice Disciplinar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metricas.map((turma) => {
                const indiceDisciplinar = parseInt(turma.total_alunos) > 0 
                  ? ((parseInt(turma.total_ocorrencias) + parseInt(turma.faltas_nao_justificadas)) / parseInt(turma.total_alunos)).toFixed(2)
                  : '0.00';
                
                const getIndicatorColor = (indice: number) => {
                  if (indice === 0) return 'bg-green-100 text-green-800';
                  if (indice <= 1) return 'bg-yellow-100 text-yellow-800';
                  if (indice <= 2) return 'bg-orange-100 text-orange-800';
                  return 'bg-red-100 text-red-800';
                };

                return (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getIndicatorColor(parseFloat(indiceDisciplinar))}`}>
                        {indiceDisciplinar}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legenda */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Legenda do Índice Disciplinar</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center">
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mr-2">
              0.00
            </span>
            <span className="text-sm text-gray-600">Excelente</span>
          </div>
          <div className="flex items-center">
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 mr-2">
              0.01-1.00
            </span>
            <span className="text-sm text-gray-600">Bom</span>
          </div>
          <div className="flex items-center">
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 mr-2">
              1.01-2.00
            </span>
            <span className="text-sm text-gray-600">Atenção</span>
          </div>
          <div className="flex items-center">
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 mr-2">
              &gt;2.00
            </span>
            <span className="text-sm text-gray-600">Crítico</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          * Índice Disciplinar = (Ocorrências + Faltas Não Justificadas) / Total de Alunos
        </p>
      </div>
    </div>
  );
}

export default Metricas;