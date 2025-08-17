import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  User, 
  CheckCircle, 
  XCircle, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Filter,
  Download,
  Target,
  Users
} from 'lucide-react';

interface Falta {
  id: number;
  aluno_id: number;
  data_falta: string;
  justificada: boolean;
  motivo: string;
  documento_justificativa: string;
  aluno_nome: string;
  matricula: string;
  turma_nome: string;
}

interface FaltasPorTurma {
  turma: string;
  totalFaltas: number;
  faltasJustificadas: number;
  faltasNaoJustificadas: number;
  percentualJustificadas: number;
  alunos: number;
  mediaFaltasPorAluno: number;
}

interface TiposFalta {
  tipo: string;
  quantidade: number;
  percentual: number;
}

interface EvolutaoMensal {
  mes: string;
  faltas: number;
  justificadas: number;
  naoJustificadas: number;
  tendencia: 'up' | 'down' | 'stable';
}

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api' 
  : 'http://localhost:5000/api';

function Faltas() {
  const [faltas, setFaltas] = useState<Falta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    periodo: 'atual',
    turma: 'todas',
    status: 'todas'
  });
  const [activeTab, setActiveTab] = useState<'lista' | 'analise' | 'comparativo'>('lista');

  useEffect(() => {
    const fetchFaltas = async () => {
      try {
        const response = await fetch(`${API_BASE}/faltas`);
        const data = await response.json();
        setFaltas(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erro ao buscar faltas:', error);
        setFaltas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFaltas();
  }, []);

  const faltasJustificadas = faltas.filter(f => f.justificada);
  const faltasNaoJustificadas = faltas.filter(f => !f.justificada);

  // Dados simulados para demonstração
  const faltasPorTurma: FaltasPorTurma[] = [
    {
      turma: '6A',
      totalFaltas: 8,
      faltasJustificadas: 6,
      faltasNaoJustificadas: 2,
      percentualJustificadas: 75,
      alunos: 25,
      mediaFaltasPorAluno: 0.32
    },
    {
      turma: '6B',
      totalFaltas: 12,
      faltasJustificadas: 8,
      faltasNaoJustificadas: 4,
      percentualJustificadas: 67,
      alunos: 28,
      mediaFaltasPorAluno: 0.43
    },
    {
      turma: '7A',
      totalFaltas: 15,
      faltasJustificadas: 9,
      faltasNaoJustificadas: 6,
      percentualJustificadas: 60,
      alunos: 26,
      mediaFaltasPorAluno: 0.58
    },
    {
      turma: '8A',
      totalFaltas: 22,
      faltasJustificadas: 11,
      faltasNaoJustificadas: 11,
      percentualJustificadas: 50,
      alunos: 24,
      mediaFaltasPorAluno: 0.92
    }
  ];

  const tiposFalta: TiposFalta[] = [
    { tipo: 'Doença', quantidade: 28, percentual: 47 },
    { tipo: 'Consulta Médica', quantidade: 18, percentual: 30 },
    { tipo: 'Assuntos Familiares', quantidade: 8, percentual: 13 },
    { tipo: 'Não Compareceu', quantidade: 6, percentual: 10 }
  ];

  const evolucaoMensal: EvolutaoMensal[] = [
    { mes: 'Mai/24', faltas: 45, justificadas: 32, naoJustificadas: 13, tendencia: 'down' },
    { mes: 'Jun/24', faltas: 52, justificadas: 38, naoJustificadas: 14, tendencia: 'up' },
    { mes: 'Jul/24', faltas: 48, justificadas: 35, naoJustificadas: 13, tendencia: 'down' },
    { mes: 'Ago/24', faltas: 57, justificadas: 34, naoJustificadas: 23, tendencia: 'up' }
  ];

  const exportarRelatorio = (formato: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exportando relatório de faltas em formato ${formato}`);
    alert(`📊 Relatório de faltas exportado em ${formato.toUpperCase()}!`);
  };

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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center mb-4 lg:mb-0">
            <Calendar className="h-8 w-8 text-military-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Controle Avançado de Faltas</h1>
              <p className="text-gray-600">Análise detalhada e comparativa de faltas por turma</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => exportarRelatorio('pdf')}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </button>
            <button 
              onClick={() => exportarRelatorio('excel')}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Excel
            </button>
            <button 
              onClick={() => exportarRelatorio('csv')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('lista')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'lista'
                  ? 'border-military-500 text-military-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Lista de Faltas
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analise')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analise'
                  ? 'border-military-500 text-military-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Análise Temporal
              </div>
            </button>
            <button
              onClick={() => setActiveTab('comparativo')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'comparativo'
                  ? 'border-military-500 text-military-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Comparativo por Turma
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Tab: Lista de Faltas */}
          {activeTab === 'lista' && (
            <div className="space-y-6">
              {/* Filtros */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-wrap items-center gap-4">
                  <Filter className="h-5 w-5 text-gray-600" />
                  <select 
                    className="border rounded px-3 py-2 text-sm"
                    value={filtros.periodo}
                    onChange={(e) => setFiltros({...filtros, periodo: e.target.value})}
                  >
                    <option value="atual">Mês Atual</option>
                    <option value="trimestre">Último Trimestre</option>
                    <option value="semestre">Último Semestre</option>
                    <option value="ano">Ano Letivo</option>
                  </select>
                  <select 
                    className="border rounded px-3 py-2 text-sm"
                    value={filtros.turma}
                    onChange={(e) => setFiltros({...filtros, turma: e.target.value})}
                  >
                    <option value="todas">Todas as Turmas</option>
                    <option value="6A">6º Ano A</option>
                    <option value="6B">6º Ano B</option>
                    <option value="7A">7º Ano A</option>
                    <option value="8A">8º Ano A</option>
                  </select>
                  <select 
                    className="border rounded px-3 py-2 text-sm"
                    value={filtros.status}
                    onChange={(e) => setFiltros({...filtros, status: e.target.value})}
                  >
                    <option value="todas">Todos os Status</option>
                    <option value="justificadas">Apenas Justificadas</option>
                    <option value="nao_justificadas">Não Justificadas</option>
                  </select>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Total de Faltas</p>
                      <p className="text-2xl font-bold text-blue-900">{faltas.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Justificadas</p>
                      <p className="text-2xl font-bold text-green-900">{faltasJustificadas.length}</p>
                      <p className="text-xs text-green-600">{faltas.length > 0 ? Math.round((faltasJustificadas.length / faltas.length) * 100) : 0}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center">
                    <XCircle className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-red-600">Não Justificadas</p>
                      <p className="text-2xl font-bold text-red-900">{faltasNaoJustificadas.length}</p>
                      <p className="text-xs text-red-600">{faltas.length > 0 ? Math.round((faltasNaoJustificadas.length / faltas.length) * 100) : 0}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-yellow-600">Alunos Afetados</p>
                      <p className="text-2xl font-bold text-yellow-900">{new Set(faltas.map(f => f.aluno_id)).size}</p>
                      <p className="text-xs text-yellow-600">Únicos</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Faltas */}
              <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data da Falta
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aluno
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Motivo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Documento
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {faltas.map((falta) => (
                        <tr key={falta.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(falta.data_falta).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {falta.aluno_nome}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {falta.matricula} - {falta.turma_nome}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors ${
                              falta.justificada 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {falta.justificada ? (
                                <div className="flex items-center">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Justificada
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Não Justificada
                                </div>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs">
                              {falta.motivo || 'Não informado'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {falta.documento_justificativa ? (
                              <div className="flex items-center text-sm text-gray-900">
                                <FileText className="h-4 w-4 text-green-600 mr-1" />
                                {falta.documento_justificativa}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Sem documento</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {faltas.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma falta registrada</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    As faltas dos alunos aparecerão aqui quando forem registradas.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Análise Temporal */}
          {activeTab === 'analise' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">📈 Tendência de Faltas - Últimos 4 Meses</h3>
              
              {/* Gráfico de Evolução */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {evolucaoMensal.map((mes, index) => (
                  <div key={index} className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{mes.mes}</h4>
                      {mes.tendencia === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      ) : mes.tendencia === 'down' ? (
                        <TrendingDown className="h-4 w-4 text-green-600" />
                      ) : (
                        <div className="h-4 w-4 bg-gray-400 rounded-full" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">{mes.faltas}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full"
                          style={{ width: `${(mes.faltas / 60) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Just: {mes.justificadas}</span>
                        <span>N/Just: {mes.naoJustificadas}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tipos de Faltas */}
              <div className="bg-white border rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">🎯 Tipos de Faltas - Distribuição</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {tiposFalta.map((tipo, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">{tipo.tipo}</span>
                            <span className="text-sm text-gray-600">{tipo.quantidade} ({tipo.percentual}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                index === 0 ? 'bg-blue-600' :
                                index === 1 ? 'bg-green-600' :
                                index === 2 ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                              style={{ width: `${tipo.percentual}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">{tiposFalta.reduce((sum, tipo) => sum + tipo.quantidade, 0)}</div>
                      <div className="text-gray-600">Total de Faltas</div>
                      <div className="text-sm text-gray-500 mt-2">
                        {Math.round((tiposFalta.filter(t => t.tipo !== 'Não Compareceu').reduce((sum, tipo) => sum + tipo.quantidade, 0) / tiposFalta.reduce((sum, tipo) => sum + tipo.quantidade, 0)) * 100)}% Justificáveis
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Comparativo por Turma */}
          {activeTab === 'comparativo' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">📊 Comparativo de Faltas por Turma</h3>
              
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Turma
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nº Alunos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Faltas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Justificadas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Não Justificadas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          % Justificadas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Média por Aluno
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {faltasPorTurma.map((turma, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{turma.turma}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {turma.alunos}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {turma.totalFaltas}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            {turma.faltasJustificadas}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            {turma.faltasNaoJustificadas}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-1 mr-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      turma.percentualJustificadas >= 80 ? 'bg-green-500' :
                                      turma.percentualJustificadas >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${turma.percentualJustificadas}%` }}
                                  ></div>
                                </div>
                              </div>
                              <span className="text-sm font-medium">{turma.percentualJustificadas}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              turma.mediaFaltasPorAluno < 0.5 ? 'bg-green-100 text-green-800' :
                              turma.mediaFaltasPorAluno < 1.0 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {turma.mediaFaltasPorAluno.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Gráfico Visual das Turmas */}
              <div className="bg-white border rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">📈 Comparativo Visual</h4>
                <div className="space-y-4">
                  {faltasPorTurma.map((turma, index) => (
                    <div key={index} className="">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">{turma.turma}</span>
                        <span className="text-sm text-gray-600">{turma.totalFaltas} faltas</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500"
                          style={{ width: `${(turma.totalFaltas / Math.max(...faltasPorTurma.map(t => t.totalFaltas))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Faltas;