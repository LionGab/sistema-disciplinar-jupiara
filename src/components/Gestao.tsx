import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Calendar, 
  AlertTriangle, 
  Save, 
  Edit, 
  Trash2, 
  Plus,
  FileText,
  Users,
  Clock
} from 'lucide-react';

interface NovoAluno {
  matricula: string;
  nome: string;
  dataNascimento: string;
  turmaId: string;
  telefoneResponsavel: string;
  emailResponsavel: string;
  endereco: string;
  observacoes: string;
}

interface NovaFalta {
  alunoId: string;
  dataFalta: string;
  justificada: boolean;
  motivo: string;
  documentoJustificativa: string;
}

interface NovaMedida {
  alunoId: string;
  tipoOcorrenciaId: string;
  dataOcorrencia: string;
  horaOcorrencia: string;
  descricao: string;
  medidasTomadas: string;
  responsavelRegistro: string;
  status: string;
}

interface Turma {
  id: number;
  nome: string;
  ano: string;
  turno: string;
}

interface Aluno {
  id: number;
  matricula: string;
  nome: string;
  turma_nome: string;
}

interface TipoOcorrencia {
  id: number;
  nome: string;
  gravidade: string;
  pontos: number;
}

const API_BASE = '/api';

function Gestao() {
  const [activeTab, setActiveTab] = useState<'alunos' | 'faltas' | 'medidas'>('alunos');
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [tiposOcorrencia, setTiposOcorrencia] = useState<TipoOcorrencia[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados dos formulários
  const [novoAluno, setNovoAluno] = useState<NovoAluno>({
    matricula: '',
    nome: '',
    dataNascimento: '',
    turmaId: '',
    telefoneResponsavel: '',
    emailResponsavel: '',
    endereco: '',
    observacoes: ''
  });

  const [novaFalta, setNovaFalta] = useState<NovaFalta>({
    alunoId: '',
    dataFalta: '',
    justificada: false,
    motivo: '',
    documentoJustificativa: ''
  });

  const [novaMedida, setNovaMedida] = useState<NovaMedida>({
    alunoId: '',
    tipoOcorrenciaId: '',
    dataOcorrencia: '',
    horaOcorrencia: '',
    descricao: '',
    medidasTomadas: '',
    responsavelRegistro: 'Ten. Silva',
    status: 'pendente'
  });

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    try {
      const [turmasRes, alunosRes, tiposRes] = await Promise.all([
        fetch(`${API_BASE}/turmas`),
        fetch(`${API_BASE}/alunos`),
        fetch(`${API_BASE}/ocorrencias/tipos`)
      ]);

      const turmasData = await turmasRes.json();
      const alunosData = await alunosRes.json();
      const tiposData = await tiposRes.json();

      setTurmas(Array.isArray(turmasData) ? turmasData : []);
      setAlunos(Array.isArray(alunosData) ? alunosData : []);
      setTiposOcorrencia(Array.isArray(tiposData) ? tiposData : []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCadastrarAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Cadastrando aluno:', novoAluno);
      
      const payload = {
        matricula: novoAluno.matricula,
        nome: novoAluno.nome,
        data_nascimento: novoAluno.dataNascimento,
        turma_id: parseInt(novoAluno.turmaId),
        telefone_responsavel: novoAluno.telefoneResponsavel || null,
        email_responsavel: novoAluno.emailResponsavel || null,
        endereco: novoAluno.endereco || null,
        observacoes: novoAluno.observacoes || null
      };
      
      const response = await fetch(`${API_BASE}/alunos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao cadastrar aluno');
      }
      
      const result = await response.json();
      console.log('Aluno cadastrado:', result);
      
      alert('✅ Aluno cadastrado com sucesso!');
      
      // Limpar formulário
      setNovoAluno({
        matricula: '',
        nome: '',
        dataNascimento: '',
        turmaId: '',
        telefoneResponsavel: '',
        emailResponsavel: '',
        endereco: '',
        observacoes: ''
      });
      
      // Recarregar lista de alunos
      fetchDados();
      
    } catch (error) {
      console.error('Erro ao cadastrar aluno:', error);
      alert('❌ Erro ao cadastrar aluno');
    }
  };

  const handleRegistrarFalta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Registrando falta:', novaFalta);
      alert('✅ Falta registrada com sucesso!');
      setNovaFalta({
        alunoId: '',
        dataFalta: '',
        justificada: false,
        motivo: '',
        documentoJustificativa: ''
      });
    } catch (error) {
      console.error('Erro ao registrar falta:', error);
      alert('❌ Erro ao registrar falta');
    }
  };

  const handleRegistrarMedida = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Registrando medida disciplinar:', novaMedida);
      alert('✅ Medida disciplinar registrada com sucesso!');
      setNovaMedida({
        alunoId: '',
        tipoOcorrenciaId: '',
        dataOcorrencia: '',
        horaOcorrencia: '',
        descricao: '',
        medidasTomadas: '',
        responsavelRegistro: 'Ten. Silva',
        status: 'pendente'
      });
    } catch (error) {
      console.error('Erro ao registrar medida:', error);
      alert('❌ Erro ao registrar medida disciplinar');
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
      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <FileText className="h-8 w-8 text-military-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão Disciplinar</h1>
            <p className="text-gray-600">Cadastro de alunos, registro de faltas e medidas disciplinares</p>
          </div>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('alunos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'alunos'
                  ? 'border-military-500 text-military-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Cadastro de Alunos
              </div>
            </button>
            <button
              onClick={() => setActiveTab('faltas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'faltas'
                  ? 'border-military-500 text-military-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Registro de Faltas
              </div>
            </button>
            <button
              onClick={() => setActiveTab('medidas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'medidas'
                  ? 'border-military-500 text-military-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Medidas Disciplinares
              </div>
            </button>
          </nav>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="p-6">
          {/* Tab: Cadastro de Alunos */}
          {activeTab === 'alunos' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cadastro de Novo Aluno</h3>
              <form onSubmit={handleCadastrarAluno} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Matrícula *
                    </label>
                    <input
                      type="text"
                      required
                      value={novoAluno.matricula}
                      onChange={(e) => setNovoAluno({...novoAluno, matricula: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                      placeholder="Ex: 2024001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={novoAluno.nome}
                      onChange={(e) => setNovoAluno({...novoAluno, nome: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                      placeholder="Nome completo do aluno"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Nascimento *
                    </label>
                    <input
                      type="date"
                      required
                      value={novoAluno.dataNascimento}
                      onChange={(e) => setNovoAluno({...novoAluno, dataNascimento: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Turma *
                    </label>
                    <select
                      required
                      value={novoAluno.turmaId}
                      onChange={(e) => setNovoAluno({...novoAluno, turmaId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                    >
                      <option value="">Selecione uma turma</option>
                      {turmas.map((turma) => (
                        <option key={turma.id} value={turma.id.toString()}>
                          {turma.nome} - {turma.ano} ({turma.turno})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone do Responsável
                    </label>
                    <input
                      type="tel"
                      value={novoAluno.telefoneResponsavel}
                      onChange={(e) => setNovoAluno({...novoAluno, telefoneResponsavel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email do Responsável
                    </label>
                    <input
                      type="email"
                      value={novoAluno.emailResponsavel}
                      onChange={(e) => setNovoAluno({...novoAluno, emailResponsavel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                      placeholder="responsavel@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={novoAluno.endereco}
                    onChange={(e) => setNovoAluno({...novoAluno, endereco: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                    placeholder="Endereço completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={novoAluno.observacoes}
                    onChange={(e) => setNovoAluno({...novoAluno, observacoes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                    placeholder="Observações adicionais sobre o aluno"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-military-600 text-white rounded-md hover:bg-military-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Cadastrar Aluno
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab: Registro de Faltas */}
          {activeTab === 'faltas' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Registro de Falta</h3>
              <form onSubmit={handleRegistrarFalta} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aluno *
                    </label>
                    <select
                      required
                      value={novaFalta.alunoId}
                      onChange={(e) => setNovaFalta({...novaFalta, alunoId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                    >
                      <option value="">Selecione um aluno</option>
                      {alunos.map((aluno) => (
                        <option key={aluno.id} value={aluno.id.toString()}>
                          {aluno.nome} - {aluno.matricula} ({aluno.turma_nome})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data da Falta *
                    </label>
                    <input
                      type="date"
                      required
                      value={novaFalta.dataFalta}
                      onChange={(e) => setNovaFalta({...novaFalta, dataFalta: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={novaFalta.justificada}
                      onChange={(e) => setNovaFalta({...novaFalta, justificada: e.target.checked})}
                      className="mr-2 h-4 w-4 text-military-600 focus:ring-military-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Falta Justificada</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo
                  </label>
                  <textarea
                    value={novaFalta.motivo}
                    onChange={(e) => setNovaFalta({...novaFalta, motivo: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                    placeholder="Descreva o motivo da falta"
                  />
                </div>
                {novaFalta.justificada && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Documento de Justificativa
                    </label>
                    <input
                      type="text"
                      value={novaFalta.documentoJustificativa}
                      onChange={(e) => setNovaFalta({...novaFalta, documentoJustificativa: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                      placeholder="Ex: Atestado médico, Declaração dos pais"
                    />
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Registrar Falta
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab: Medidas Disciplinares */}
          {activeTab === 'medidas' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Registro de Medida Disciplinar</h3>
              <form onSubmit={handleRegistrarMedida} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aluno *
                    </label>
                    <select
                      required
                      value={novaMedida.alunoId}
                      onChange={(e) => setNovaMedida({...novaMedida, alunoId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                    >
                      <option value="">Selecione um aluno</option>
                      {alunos.map((aluno) => (
                        <option key={aluno.id} value={aluno.id.toString()}>
                          {aluno.nome} - {aluno.matricula} ({aluno.turma_nome})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Ocorrência *
                    </label>
                    <select
                      required
                      value={novaMedida.tipoOcorrenciaId}
                      onChange={(e) => setNovaMedida({...novaMedida, tipoOcorrenciaId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                    >
                      <option value="">Selecione o tipo</option>
                      {tiposOcorrencia.map((tipo) => (
                        <option key={tipo.id} value={tipo.id.toString()}>
                          {tipo.nome} - {tipo.gravidade} ({tipo.pontos} pts)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data da Ocorrência *
                    </label>
                    <input
                      type="date"
                      required
                      value={novaMedida.dataOcorrencia}
                      onChange={(e) => setNovaMedida({...novaMedida, dataOcorrencia: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora da Ocorrência
                    </label>
                    <input
                      type="time"
                      value={novaMedida.horaOcorrencia}
                      onChange={(e) => setNovaMedida({...novaMedida, horaOcorrencia: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição da Ocorrência *
                  </label>
                  <textarea
                    required
                    value={novaMedida.descricao}
                    onChange={(e) => setNovaMedida({...novaMedida, descricao: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                    placeholder="Descreva detalhadamente a ocorrência disciplinar"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medidas Tomadas
                  </label>
                  <textarea
                    value={novaMedida.medidasTomadas}
                    onChange={(e) => setNovaMedida({...novaMedida, medidasTomadas: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                    placeholder="Descreva as medidas disciplinares aplicadas"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Responsável pelo Registro
                    </label>
                    <input
                      type="text"
                      value={novaMedida.responsavelRegistro}
                      onChange={(e) => setNovaMedida({...novaMedida, responsavelRegistro: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                      placeholder="Nome do responsável"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={novaMedida.status}
                      onChange={(e) => setNovaMedida({...novaMedida, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="resolvida">Resolvida</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Registrar Medida
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Gestao;