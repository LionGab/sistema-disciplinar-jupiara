import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Award, 
  Users, 
  FileText,
  Download,
  Filter,
  Calendar,
  BarChart3,
  Target
} from 'lucide-react';
import { exportarRelatorioCompleto } from '../utils/exportUtils';

interface IndicadoresExecutivos {
  totalAlunos: number;
  totalOcorrencias: number;
  totalFaltas: number;
  medidasDisciplinares: number;
  melhorTurma: { nome: string; indice: number };
  piorTurma: { nome: string; indice: number };
  alunosReincidentes: number;
  metaInstitucional: number;
  statusMeta: 'atingida' | 'atencao' | 'critica';
}

interface TurmaDetalhada {
  id: number;
  nome: string;
  alunos: number;
  ocorrencias: number;
  faltasJustificadas: number;
  faltasNaoJustificadas: number;
  mediaPontos: number;
  indiceDisciplinar: number;
  classificacao: 'excelente' | 'bom' | 'atencao' | 'critico';
  posicaoRanking: number;
}

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api' 
  : 'http://localhost:5000/api';

function RelatorioExecutivo() {
  const [indicadores, setIndicadores] = useState<IndicadoresExecutivos | null>(null);
  const [turmas, setTurmas] = useState<TurmaDetalhada[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    periodo: 'atual',
    turma: 'todas',
    gravidade: 'todas'
  });
  const [ordenacao, setOrdenacao] = useState({
    campo: 'indiceDisciplinar',
    direcao: 'asc' as 'asc' | 'desc'
  });

  useEffect(() => {
    fetchDados();
  }, [filtros]);

  const fetchDados = async () => {
    try {
      const [metricasRes, turmasRes] = await Promise.all([
        fetch(`${API_BASE}/metricas/geral`),
        fetch(`${API_BASE}/metricas/por-turma`)
      ]);

      const metricasData = await metricasRes.json();
      const turmasData = await turmasRes.json();

      // Processar indicadores executivos
      const turmasProcessadas = processarTurmasDetalhadas(Array.isArray(turmasData) ? turmasData : []);
      const indicadoresProcessados = calcularIndicadoresExecutivos(metricasData, turmasProcessadas);

      setIndicadores(indicadoresProcessados);
      setTurmas(turmasProcessadas);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const processarTurmasDetalhadas = (dados: any[]): TurmaDetalhada[] => {
    return dados.map((turma, index) => {
      const indice = parseFloat(
        ((parseInt(turma.total_ocorrencias) + parseInt(turma.faltas_nao_justificadas)) / 
         parseInt(turma.total_alunos)).toFixed(2)
      );
      
      return {
        id: turma.turma_id,
        nome: turma.turma_nome,
        alunos: parseInt(turma.total_alunos),
        ocorrencias: parseInt(turma.total_ocorrencias),
        faltasJustificadas: parseInt(turma.total_faltas) - parseInt(turma.faltas_nao_justificadas),
        faltasNaoJustificadas: parseInt(turma.faltas_nao_justificadas),
        mediaPontos: parseFloat(turma.media_pontos_ocorrencia),
        indiceDisciplinar: indice,
        classificacao: getClassificacaoIndice(indice),
        posicaoRanking: index + 1
      };
    }).sort((a, b) => a.indiceDisciplinar - b.indiceDisciplinar)
      .map((turma, index) => ({ ...turma, posicaoRanking: index + 1 }));
  };

  const getClassificacaoIndice = (indice: number): 'excelente' | 'bom' | 'atencao' | 'critico' => {
    if (indice === 0) return 'excelente';
    if (indice <= 1.0) return 'bom';
    if (indice <= 2.0) return 'atencao';
    return 'critico';
  };

  const calcularIndicadoresExecutivos = (metricas: any, turmasDetalhadas: TurmaDetalhada[]): IndicadoresExecutivos => {
    const melhorTurma = turmasDetalhadas[0] || { nome: 'N/A', indiceDisciplinar: 0 };
    const piorTurma = turmasDetalhadas[turmasDetalhadas.length - 1] || { nome: 'N/A', indiceDisciplinar: 0 };
    const alunosReincidentes = turmasDetalhadas.reduce((acc, turma) => acc + (turma.ocorrencias > 2 ? 1 : 0), 0);
    
    return {
      totalAlunos: parseInt(metricas.total_alunos || '0'),
      totalOcorrencias: parseInt(metricas.total_ocorrencias || '0'),
      totalFaltas: parseInt(metricas.total_faltas || '0'),
      medidasDisciplinares: parseInt(metricas.total_ocorrencias || '0'), // Assumindo 1:1
      melhorTurma: { nome: melhorTurma.nome, indice: melhorTurma.indiceDisciplinar },
      piorTurma: { nome: piorTurma.nome, indice: piorTurma.indiceDisciplinar },
      alunosReincidentes,
      metaInstitucional: 1.0,
      statusMeta: piorTurma.indiceDisciplinar <= 1.0 ? 'atingida' : 
                 piorTurma.indiceDisciplinar <= 2.0 ? 'atencao' : 'critica'
    };
  };

  const ordenarTurmas = (campo: keyof TurmaDetalhada) => {
    const novasDirecao = ordenacao.campo === campo && ordenacao.direcao === 'asc' ? 'desc' : 'asc';
    setOrdenacao({ campo, direcao: novasDirecao });
    
    const turmasOrdenadas = [...turmas].sort((a, b) => {
      const valorA = a[campo];
      const valorB = b[campo];
      
      if (novasDirecao === 'asc') {
        return valorA < valorB ? -1 : valorA > valorB ? 1 : 0;
      } else {
        return valorA > valorB ? -1 : valorA < valorB ? 1 : 0;
      }
    });
    
    setTurmas(turmasOrdenadas);
  };

  const exportarRelatorio = async (formato: 'pdf' | 'excel' | 'csv') => {
  if (formato === 'excel') {
    try {
      const [alunosRes, ocorrenciasRes, faltasRes] = await Promise.all([
        fetch(`${API_BASE}/alunos`),
        fetch(`${API_BASE}/ocorrencias`),
        fetch(`${API_BASE}/faltas`)
      ]);

      const alunosData = await alunosRes.json();
      const ocorrenciasData = await ocorrenciasRes.json();
      const faltasData = await faltasRes.json();

      const result = await exportarRelatorioCompleto(alunosData, ocorrenciasData, faltasData);

      if (result.success) {
        alert(`✅ Relatório completo exportado com sucesso!\n📁 Arquivo: ${result.filename}`);
      } else {
        alert('❌ Erro ao exportar relatório completo');
      }
    } catch (error) {
      console.error('Erro na exportação:', error);
      alert('❌ Erro ao exportar relatório completo');
    }
  } else {
    console.log(`Exportando relatório em formato ${formato}`);
    alert(`Funcionalidade de exportar para ${formato.toUpperCase()} ainda não implementada.`);
  }
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
      {/* Cabeçalho Executivo */}
      <div className="bg-gradient-to-r from-military-800 to-military-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Award className="h-10 w-10 text-yellow-400 mr-4" />
            <div>
              <h1 className="text-2xl font-bold">RELATÓRIO DISCIPLINAR EXECUTIVO</h1>
              <p className="text-military-100">Escola Cívico Militar Jupiara | Período: Agosto 2024</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-military-200">Oficial Responsável</p>
            <p className="font-semibold">Ten. João Silva</p>
          </div>
        </div>
      </div>

      {/* Indicadores Estratégicos */}
      {indicadores && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Alunos</p>
                <p className="text-2xl font-bold text-gray-900">{indicadores.totalAlunos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Ocorrências</p>
                <p className="text-2xl font-bold text-gray-900">{indicadores.totalOcorrencias}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Faltas</p>
                <p className="text-2xl font-bold text-gray-900">{indicadores.totalFaltas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Medidas Aplicadas</p>
                <p className="text-2xl font-bold text-gray-900">{indicadores.medidasDisciplinares}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Melhor Turma</p>
                <p className="text-lg font-bold text-gray-900">{indicadores.melhorTurma.nome}</p>
                <p className="text-sm text-green-600">{indicadores.melhorTurma.indice.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Reincidentes</p>
                <p className="text-2xl font-bold text-gray-900">{indicadores.alunosReincidentes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meta Institucional */}
      {indicadores && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Meta Institucional: Índice Disciplinar &lt; 1.0</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              indicadores.statusMeta === 'atingida' ? 'bg-green-100 text-green-800' :
              indicadores.statusMeta === 'atencao' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {indicadores.statusMeta === 'atingida' ? '✅ Meta Atingida' :
               indicadores.statusMeta === 'atencao' ? '⚠️ Atenção' : '🚨 Crítico'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className={`h-4 rounded-full ${
                indicadores.statusMeta === 'atingida' ? 'bg-green-500' :
                indicadores.statusMeta === 'atencao' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min((indicadores.piorTurma.indice / indicadores.metaInstitucional) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Pior índice atual: {indicadores.piorTurma.indice.toFixed(2)} ({indicadores.piorTurma.nome})
          </p>
        </div>
      )}

      {/* Controles e Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <select 
              className="border rounded px-3 py-2"
              value={filtros.periodo}
              onChange={(e) => setFiltros({...filtros, periodo: e.target.value})}
            >
              <option value="atual">Mês Atual</option>
              <option value="trimestre">Último Trimestre</option>
              <option value="semestre">Último Semestre</option>
              <option value="ano">Ano Letivo</option>
            </select>
            <select 
              className="border rounded px-3 py-2"
              value={filtros.gravidade}
              onChange={(e) => setFiltros({...filtros, gravidade: e.target.value})}
            >
              <option value="todas">Todas Gravidades</option>
              <option value="leve">Leve</option>
              <option value="media">Média</option>
              <option value="grave">Grave</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => exportarRelatorio('pdf')}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </button>
            <button 
              onClick={() => exportarRelatorio('excel')}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Excel
            </button>
            <button 
              onClick={() => exportarRelatorio('csv')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Tabela Detalhada por Turma */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Análise Detalhada por Turma</h2>
          <p className="text-sm text-gray-600">Clique nos cabeçalhos para ordenar. Clique na turma para ver detalhes.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => ordenarTurmas('posicaoRanking')}
                >
                  🏆 Ranking
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => ordenarTurmas('nome')}
                >
                  Turma
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => ordenarTurmas('alunos')}
                >
                  Nº Alunos
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => ordenarTurmas('ocorrencias')}
                >
                  Ocorrências
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => ordenarTurmas('faltasJustificadas')}
                >
                  Faltas Just.
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => ordenarTurmas('faltasNaoJustificadas')}
                >
                  Faltas N/Just.
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => ordenarTurmas('mediaPontos')}
                >
                  Média Pontos
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => ordenarTurmas('indiceDisciplinar')}
                >
                  Índice Disciplinar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {turmas.map((turma) => (
                <tr 
                  key={turma.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {/* Abrir detalhamento da turma */}}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        turma.posicaoRanking <= 3 ? 'bg-yellow-100 text-yellow-800' :
                        turma.posicaoRanking <= 6 ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        #{turma.posicaoRanking}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{turma.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {turma.alunos}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {turma.ocorrencias}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {turma.faltasJustificadas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      turma.faltasNaoJustificadas === 0 ? 'bg-green-100 text-green-800' :
                      turma.faltasNaoJustificadas <= 2 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {turma.faltasNaoJustificadas}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {turma.mediaPontos.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 mr-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              turma.classificacao === 'excelente' ? 'bg-green-500' :
                              turma.classificacao === 'bom' ? 'bg-yellow-500' :
                              turma.classificacao === 'atencao' ? 'bg-orange-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(turma.indiceDisciplinar * 50, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        turma.classificacao === 'excelente' ? 'bg-green-100 text-green-800' :
                        turma.classificacao === 'bom' ? 'bg-yellow-100 text-yellow-800' :
                        turma.classificacao === 'atencao' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {turma.indiceDisciplinar.toFixed(2)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertas Automáticos */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚨 Alertas Automáticos</h3>
        <div className="space-y-3">
          {turmas.filter(t => t.classificacao === 'critico').map(turma => (
            <div key={turma.id} className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Turma {turma.nome} em nível CRÍTICO (índice: {turma.indiceDisciplinar.toFixed(2)})
                </p>
                <p className="text-xs text-red-600">
                  Requer intervenção imediata da coordenação militar
                </p>
              </div>
            </div>
          ))}
          {turmas.filter(t => t.classificacao === 'atencao').map(turma => (
            <div key={turma.id} className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Turma {turma.nome} requer atenção (índice: {turma.indiceDisciplinar.toFixed(2)})
                </p>
                <p className="text-xs text-yellow-600">
                  Acompanhamento pedagógico recomendado
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RelatorioExecutivo;