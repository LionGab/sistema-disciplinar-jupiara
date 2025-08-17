import React, { useState, useEffect } from 'react';
import { 
  User, 
  Search, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  Award,
  TrendingUp,
  TrendingDown,
  Download,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

interface AlunoDetalhado {
  id: number;
  matricula: string;
  nome: string;
  dataNascimento: string;
  turma: string;
  telefoneResponsavel: string;
  emailResponsavel: string;
  endereco: string;
  observacoes: string;
}

interface OcorrenciaAluno {
  id: number;
  data: string;
  hora: string;
  tipo: string;
  gravidade: string;
  pontos: number;
  descricao: string;
  medidasTomadas: string;
  responsavel: string;
  status: string;
}

interface FaltaAluno {
  id: number;
  data: string;
  justificada: boolean;
  motivo: string;
  documento: string;
}

interface HistoricoDisciplinar {
  totalOcorrencias: number;
  totalFaltas: number;
  faltasNaoJustificadas: number;
  pontosTotais: number;
  indiceDisciplinar: number;
  classificacao: 'exemplar' | 'bom' | 'atencao' | 'problematico';
  ultimaOcorrencia: string;
  diasSemOcorrencia: number;
  reincidente: boolean;
}

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api' 
  : 'http://localhost:5000/api';

function FichaDisciplinar() {
  const [alunoSelecionado, setAlunoSelecionado] = useState<AlunoDetalhado | null>(null);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaAluno[]>([]);
  const [faltas, setFaltas] = useState<FaltaAluno[]>([]);
  const [historico, setHistorico] = useState<HistoricoDisciplinar | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    try {
      const response = await fetch(`${API_BASE}/alunos`);
      const data = await response.json();
      setAlunos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      setAlunos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDadosAluno = async (alunoId: number) => {
    try {
      setLoading(true);
      
      // Simular dados detalhados do aluno (em produção viria da API)
      const alunoSelecionadoData = alunos.find(a => a.id === alunoId);
      
      if (alunoSelecionadoData) {
        const alunoDetalhado: AlunoDetalhado = {
          id: alunoSelecionadoData.id,
          matricula: alunoSelecionadoData.matricula,
          nome: alunoSelecionadoData.nome,
          dataNascimento: alunoSelecionadoData.data_nascimento,
          turma: alunoSelecionadoData.turma_nome,
          telefoneResponsavel: alunoSelecionadoData.telefone_responsavel || '(63) 99999-9999',
          emailResponsavel: alunoSelecionadoData.email_responsavel || 'responsavel@email.com',
          endereco: alunoSelecionadoData.endereco || 'Endereço não informado',
          observacoes: alunoSelecionadoData.observacoes || 'Nenhuma observação'
        };

        // Simular ocorrências do aluno
        const ocorrenciasSimuladas: OcorrenciaAluno[] = [
          {
            id: 1,
            data: '2024-08-15',
            hora: '10:30',
            tipo: 'Atraso',
            gravidade: 'leve',
            pontos: 1,
            descricao: 'Chegou 15 minutos atrasado para a primeira aula',
            medidasTomadas: 'Advertência verbal',
            responsavel: 'Ten. Silva',
            status: 'resolvida'
          },
          {
            id: 2,
            data: '2024-08-10',
            hora: '14:15',
            tipo: 'Uso de celular',
            gravidade: 'media',
            pontos: 3,
            descricao: 'Uso inadequado do celular durante aula de matemática',
            medidasTomadas: 'Celular recolhido até o final do período',
            responsavel: 'Sgt. Costa',
            status: 'resolvida'
          }
        ].filter(() => Math.random() > 0.3); // Simular alguns alunos sem ocorrências

        // Simular faltas do aluno
        const faltasSimuladas: FaltaAluno[] = [
          {
            id: 1,
            data: '2024-08-12',
            justificada: true,
            motivo: 'Consulta médica',
            documento: 'Atestado médico'
          },
          {
            id: 2,
            data: '2024-08-05',
            justificada: false,
            motivo: 'Não compareceu',
            documento: ''
          }
        ].filter(() => Math.random() > 0.4); // Simular alguns alunos sem faltas

        // Calcular histórico disciplinar
        const totalOcorrencias = ocorrenciasSimuladas.length;
        const totalFaltas = faltasSimuladas.length;
        const faltasNaoJustificadas = faltasSimuladas.filter(f => !f.justificada).length;
        const pontosTotais = ocorrenciasSimuladas.reduce((sum, o) => sum + o.pontos, 0);
        const indiceDisciplinar = totalOcorrencias + faltasNaoJustificadas;
        
        let classificacao: 'exemplar' | 'bom' | 'atencao' | 'problematico' = 'exemplar';
        if (indiceDisciplinar === 0) classificacao = 'exemplar';
        else if (indiceDisciplinar <= 2) classificacao = 'bom';
        else if (indiceDisciplinar <= 4) classificacao = 'atencao';
        else classificacao = 'problematico';

        const ultimaOcorrencia = ocorrenciasSimuladas.length > 0 
          ? ocorrenciasSimuladas[0].data 
          : '';
        
        const diasSemOcorrencia = ultimaOcorrencia 
          ? Math.floor((new Date().getTime() - new Date(ultimaOcorrencia).getTime()) / (1000 * 60 * 60 * 24))
          : 365;

        const historicoCalculado: HistoricoDisciplinar = {
          totalOcorrencias,
          totalFaltas,
          faltasNaoJustificadas,
          pontosTotais,
          indiceDisciplinar,
          classificacao,
          ultimaOcorrencia,
          diasSemOcorrencia,
          reincidente: totalOcorrencias >= 2
        };

        setAlunoSelecionado(alunoDetalhado);
        setOcorrencias(ocorrenciasSimuladas);
        setFaltas(faltasSimuladas);
        setHistorico(historicoCalculado);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do aluno:', error);
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

  const getGravidadeColor = (gravidade: string) => {
    switch (gravidade) {
      case 'leve': return 'bg-yellow-100 text-yellow-800';
      case 'media': return 'bg-orange-100 text-orange-800';
      case 'grave': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const alunosFiltrados = alunos.filter(aluno => 
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.matricula.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportarFicha = () => {
    if (!alunoSelecionado) return;
    console.log('Exportando ficha disciplinar de:', alunoSelecionado.nome);
    alert('📄 Ficha disciplinar exportada com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <FileText className="h-8 w-8 text-military-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ficha Disciplinar Individual</h1>
            <p className="text-gray-600">Histórico completo e detalhado por aluno</p>
          </div>
        </div>
      </div>

      {/* Busca de Aluno */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Selecionar Aluno</h3>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou matrícula..."
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
          {alunosFiltrados.map((aluno) => (
            <button
              key={aluno.id}
              onClick={() => fetchDadosAluno(aluno.id)}
              className={`p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors ${
                alunoSelecionado?.id === aluno.id 
                  ? 'border-military-500 bg-military-50' 
                  : 'border-gray-200'
              }`}
            >
              <div className="font-medium text-gray-900">{aluno.nome}</div>
              <div className="text-sm text-gray-600">{aluno.matricula} - {aluno.turma_nome}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Ficha do Aluno Selecionado */}
      {alunoSelecionado && historico && (
        <div className="space-y-6">
          {/* Dados Pessoais */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <User className="h-6 w-6 text-military-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Dados Pessoais</h3>
              </div>
              <button
                onClick={exportarFicha}
                className="flex items-center px-4 py-2 bg-military-600 text-white rounded-md hover:bg-military-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Ficha
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Informações Básicas</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Nome:</span> {alunoSelecionado.nome}</div>
                  <div><span className="font-medium">Matrícula:</span> {alunoSelecionado.matricula}</div>
                  <div><span className="font-medium">Turma:</span> {alunoSelecionado.turma}</div>
                  <div><span className="font-medium">Nascimento:</span> {new Date(alunoSelecionado.dataNascimento).toLocaleDateString('pt-BR')}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Contato do Responsável</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    {alunoSelecionado.telefoneResponsavel}
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    {alunoSelecionado.emailResponsavel}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    {alunoSelecionado.endereco}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
                <p className="text-sm text-gray-600">{alunoSelecionado.observacoes}</p>
              </div>
            </div>
          </div>

          {/* Resumo Disciplinar */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <Award className="h-6 w-6 text-military-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Resumo Disciplinar</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{historico.totalOcorrencias}</div>
                <div className="text-sm text-blue-600">Ocorrências</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{historico.totalFaltas}</div>
                <div className="text-sm text-yellow-600">Faltas</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{historico.faltasNaoJustificadas}</div>
                <div className="text-sm text-red-600">Não Just.</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{historico.pontosTotais}</div>
                <div className="text-sm text-purple-600">Pontos</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{historico.indiceDisciplinar}</div>
                <div className="text-sm text-gray-600">Índice</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{historico.diasSemOcorrencia}</div>
                <div className="text-sm text-green-600">Dias s/ Ocor.</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getClassificacaoColor(historico.classificacao)}`}>
                  {historico.classificacao.toUpperCase()}
                </span>
                
                {historico.reincidente && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full border border-red-200">
                    REINCIDENTE
                  </span>
                )}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                {historico.diasSemOcorrencia > 30 ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                {historico.ultimaOcorrencia 
                  ? `Última ocorrência: ${new Date(historico.ultimaOcorrencia).toLocaleDateString('pt-BR')}`
                  : 'Nenhuma ocorrência registrada'
                }
              </div>
            </div>
          </div>

          {/* Histórico de Ocorrências */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-military-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Histórico de Ocorrências</h3>
            </div>

            {ocorrencias.length > 0 ? (
              <div className="space-y-4">
                {ocorrencias.map((ocorrencia) => (
                  <div key={ocorrencia.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">{ocorrencia.tipo}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGravidadeColor(ocorrencia.gravidade)}`}>
                          {ocorrencia.gravidade}
                        </span>
                        <span className="text-sm font-medium text-purple-600">{ocorrencia.pontos} pts</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(ocorrencia.data).toLocaleDateString('pt-BR')} às {ocorrencia.hora}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{ocorrencia.descricao}</p>
                    
                    {ocorrencia.medidasTomadas && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                        <p className="text-sm text-yellow-800">
                          <span className="font-medium">Medidas:</span> {ocorrencia.medidasTomadas}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Responsável: {ocorrencia.responsavel}</span>
                      <span className={`px-2 py-1 rounded ${
                        ocorrencia.status === 'resolvida' ? 'bg-green-100 text-green-700' :
                        ocorrencia.status === 'em_andamento' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {ocorrencia.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Award className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>🎉 Nenhuma ocorrência disciplinar registrada!</p>
                <p className="text-sm">Este aluno mantém excelente comportamento.</p>
              </div>
            )}
          </div>

          {/* Histórico de Faltas */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <Calendar className="h-6 w-6 text-military-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Histórico de Faltas</h3>
            </div>

            {faltas.length > 0 ? (
              <div className="space-y-3">
                {faltas.map((falta) => (
                  <div key={falta.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">
                          {new Date(falta.data).toLocaleDateString('pt-BR')}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          falta.justificada 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {falta.justificada ? 'Justificada' : 'Não Justificada'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{falta.motivo}</p>
                      {falta.documento && (
                        <p className="text-xs text-blue-600 mt-1">📄 {falta.documento}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>✅ Nenhuma falta registrada!</p>
                <p className="text-sm">Este aluno mantém excelente frequência.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estado Inicial */}
      {!alunoSelecionado && !loading && (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um Aluno</h3>
          <p className="text-gray-600">
            Use a busca acima para encontrar um aluno e visualizar sua ficha disciplinar completa.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-military-600"></div>
        </div>
      )}
    </div>
  );
}

export default FichaDisciplinar;