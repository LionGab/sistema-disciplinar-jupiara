import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Calendar } from 'lucide-react';

interface DadosTendencia {
  mes: string;
  ocorrencias: number;
  faltas: number;
  medidasDisciplinares: number;
  indiceMedio: number;
}

interface RankingAluno {
  id: number;
  nome: string;
  turma: string;
  ocorrencias: number;
  faltas: number;
  pontos: number;
  classificacao: 'exemplar' | 'bom' | 'atencao' | 'problematico';
}

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api' 
  : 'http://localhost:5000/api';

function GraficosTendencia() {
  const [dadosTendencia, setDadosTendencia] = useState<DadosTendencia[]>([]);
  const [rankingMelhores, setRankingMelhores] = useState<RankingAluno[]>([]);
  const [rankingPiores, setRankingPiores] = useState<RankingAluno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDadosTendencia();
  }, []);

  const fetchDadosTendencia = async () => {
    try {
      // Simular dados de tendência (em produção, viria da API)
      const dadosSimulados: DadosTendencia[] = [
        { mes: '2024-05', ocorrencias: 12, faltas: 23, medidasDisciplinares: 8, indiceMedio: 1.2 },
        { mes: '2024-06', ocorrencias: 15, faltas: 28, medidasDisciplinares: 12, indiceMedio: 1.4 },
        { mes: '2024-07', ocorrencias: 10, faltas: 18, medidasDisciplinares: 7, indiceMedio: 0.9 },
        { mes: '2024-08', ocorrencias: 8, faltas: 12, medidasDisciplinares: 5, indiceMedio: 0.7 }
      ];

      const melhoresSimulados: RankingAluno[] = [
        { id: 1, nome: 'Ana Silva Santos', turma: '6A', ocorrencias: 0, faltas: 0, pontos: 0, classificacao: 'exemplar' },
        { id: 2, nome: 'Carlos Eduardo Lima', turma: '6A', ocorrencias: 0, faltas: 1, pontos: 0, classificacao: 'exemplar' },
        { id: 3, nome: 'Beatriz Costa Oliveira', turma: '6A', ocorrencias: 1, faltas: 0, pontos: 1, classificacao: 'bom' },
        { id: 4, nome: 'Eduarda Mendes Silva', turma: '6B', ocorrencias: 1, faltas: 1, pontos: 1, classificacao: 'bom' },
        { id: 5, nome: 'Gabriela dos Santos', turma: '7A', ocorrencias: 0, faltas: 2, pontos: 0, classificacao: 'bom' }
      ];

      const pioresSimulados: RankingAluno[] = [
        { id: 12, nome: 'Lucas Martins Oliveira', turma: '1A', ocorrencias: 1, faltas: 2, pontos: 3, classificacao: 'atencao' },
        { id: 8, nome: 'Henrique Barbosa Lima', turma: '8A', ocorrencias: 2, faltas: 2, pontos: 8, classificacao: 'problematico' },
        { id: 6, nome: 'Felipe Roberto Alves', turma: '7A', ocorrencias: 2, faltas: 2, pontos: 5, classificacao: 'atencao' },
        { id: 4, nome: 'Diego Ferreira Souza', turma: '6B', ocorrencias: 2, faltas: 2, pontos: 4, classificacao: 'atencao' },
        { id: 10, nome: 'João Victor Pereira', turma: '9A', ocorrencias: 1, faltas: 1, pontos: 1, classificacao: 'atencao' }
      ];

      setDadosTendencia(dadosSimulados);
      setRankingMelhores(melhoresSimulados);
      setRankingPiores(pioresSimulados);
    } catch (error) {
      console.error('Erro ao buscar dados de tendência:', error);
    } finally {
      setLoading(false);
    }
  };

  const getClassificacaoColor = (classificacao: string) => {
    switch (classificacao) {
      case 'exemplar': return 'bg-green-100 text-green-800 border-green-200';
      case 'bom': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'atencao': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'problematico': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calcularTendencia = (dados: DadosTendencia[], campo: keyof DadosTendencia) => {
    if (dados.length < 2) return 0;
    const primeiro = dados[0][campo] as number;
    const ultimo = dados[dados.length - 1][campo] as number;
    return ((ultimo - primeiro) / primeiro) * 100;
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
      {/* Gráfico de Tendência Principal */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">📈 Evolução Temporal - Últimos 4 Meses</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Ocorrências</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Faltas</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Índice Médio</span>
            </div>
          </div>
        </div>

        {/* Gráfico Simplificado com Barras */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {dadosTendencia.map((dados, index) => (
            <div key={dados.mes} className="text-center">
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-900">
                  {new Date(dados.mes + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}
                </p>
              </div>
              <div className="flex justify-center items-end space-x-1 h-32">
                <div className="flex flex-col items-center">
                  <div 
                    className="w-4 bg-red-500 rounded-t"
                    style={{ height: `${(dados.ocorrencias / 20) * 100}%` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-1">{dados.ocorrencias}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="w-4 bg-yellow-500 rounded-t"
                    style={{ height: `${(dados.faltas / 30) * 100}%` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-1">{dados.faltas}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="w-4 bg-blue-500 rounded-t"
                    style={{ height: `${(dados.indiceMedio / 2) * 100}%` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-1">{dados.indiceMedio.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Indicadores de Tendência */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              {calcularTendencia(dadosTendencia, 'ocorrencias') < 0 ? 
                <TrendingDown className="h-5 w-5 text-green-600 mr-2" /> :
                <TrendingUp className="h-5 w-5 text-red-600 mr-2" />
              }
              <div>
                <p className="text-sm text-gray-600">Tendência Ocorrências</p>
                <p className={`font-semibold ${calcularTendencia(dadosTendencia, 'ocorrencias') < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calcularTendencia(dadosTendencia, 'ocorrencias').toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              {calcularTendencia(dadosTendencia, 'faltas') < 0 ? 
                <TrendingDown className="h-5 w-5 text-green-600 mr-2" /> :
                <TrendingUp className="h-5 w-5 text-red-600 mr-2" />
              }
              <div>
                <p className="text-sm text-gray-600">Tendência Faltas</p>
                <p className={`font-semibold ${calcularTendencia(dadosTendencia, 'faltas') < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calcularTendencia(dadosTendencia, 'faltas').toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              {calcularTendencia(dadosTendencia, 'indiceMedio') < 0 ? 
                <TrendingDown className="h-5 w-5 text-green-600 mr-2" /> :
                <TrendingUp className="h-5 w-5 text-red-600 mr-2" />
              }
              <div>
                <p className="text-sm text-gray-600">Tendência Índice</p>
                <p className={`font-semibold ${calcularTendencia(dadosTendencia, 'indiceMedio') < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calcularTendencia(dadosTendencia, 'indiceMedio').toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings de Alunos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Melhores Alunos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">🏆 Top 5 Alunos Exemplares</h3>
          </div>
          <div className="space-y-3">
            {rankingMelhores.map((aluno, index) => (
              <div key={aluno.id} className={`p-3 rounded-lg border ${getClassificacaoColor(aluno.classificacao)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="flex items-center justify-center w-6 h-6 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{aluno.nome}</p>
                      <p className="text-sm text-gray-600">Turma {aluno.turma}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {aluno.ocorrencias} ocorrência(s) | {aluno.faltas} falta(s)
                    </p>
                    <p className="text-xs font-medium">
                      {aluno.pontos} pontos
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Alunos que Precisam de Atenção */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <TrendingDown className="h-6 w-6 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">⚠️ Alunos que Precisam de Atenção</h3>
          </div>
          <div className="space-y-3">
            {rankingPiores.map((aluno, index) => (
              <div key={aluno.id} className={`p-3 rounded-lg border ${getClassificacaoColor(aluno.classificacao)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="flex items-center justify-center w-6 h-6 bg-red-400 text-red-900 rounded-full text-xs font-bold mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{aluno.nome}</p>
                      <p className="text-sm text-gray-600">Turma {aluno.turma}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {aluno.ocorrencias} ocorrência(s) | {aluno.faltas} falta(s)
                    </p>
                    <p className="text-xs font-medium text-red-600">
                      {aluno.pontos} pontos
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Distribuição por Gravidade */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Distribuição de Ocorrências por Gravidade</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">60%</div>
            <div className="text-sm text-gray-600">Leves</div>
            <div className="text-xs text-gray-500">28 ocorrências</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">30%</div>
            <div className="text-sm text-gray-600">Médias</div>
            <div className="text-xs text-gray-500">14 ocorrências</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">10%</div>
            <div className="text-sm text-gray-600">Graves</div>
            <div className="text-xs text-gray-500">5 ocorrências</div>
          </div>
        </div>
      </div>

      {/* Recomendações Automáticas */}
      <div className="bg-gradient-to-r from-military-700 to-military-600 text-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">🎯 Recomendações Estratégicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-military-600 bg-opacity-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">📈 Melhoria Contínua</h4>
            <ul className="text-sm space-y-1">
              <li>• Redução de 41% nas ocorrências nos últimos 4 meses</li>
              <li>• Implementar programa de reconhecimento para turma 6A</li>
              <li>• Expandir boas práticas para outras turmas</li>
            </ul>
          </div>
          <div className="bg-military-600 bg-opacity-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">⚠️ Pontos de Atenção</h4>
            <ul className="text-sm space-y-1">
              <li>• Acompanhamento individual para 5 alunos</li>
              <li>• Reunião pedagógica com pais de alunos reincidentes</li>
              <li>• Reforço de orientação disciplinar na turma 8A</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GraficosTendencia;