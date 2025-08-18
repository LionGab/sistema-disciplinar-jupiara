import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  Eye, 
  Edit, 
  UserCheck,
  Calendar,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  BarChart3,
  Upload,
  Plus,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  exportarAlunosExcel, 
  exportarAlunosPDF, 
  exportarAlunosCSV, 
  exportarRelatorioCompleto,
  gerarTemplateImportacao,
  processarImportacaoAlunos
} from '../utils/exportUtils';

interface Aluno {
  id: number;
  matricula: string;
  nome: string;
  data_nascimento: string;
  turma_id: number;
  telefone_responsavel: string;
  email_responsavel: string;
  endereco: string;
  observacoes: string;
  turma_nome: string;
}

interface Turma {
  id: number;
  nome: string;
  ano: string;
  turno: string;
}

const API_BASE = '/api';

function Alunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('');
  const [exporting, setExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{success: boolean; message: string; dados?: any[]} | null>(null);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [alunosRes, turmasRes] = await Promise.all([
          fetch(`${API_BASE}/alunos`),
          fetch(`${API_BASE}/turmas`)
        ]);

        const alunosData = await alunosRes.json();
        const turmasData = await turmasRes.json();

        setAlunos(Array.isArray(alunosData) ? alunosData : []);
        setTurmas(Array.isArray(turmasData) ? turmasData : []);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setAlunos([]);
        setTurmas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, []);

  const alunosFiltrados = alunos.filter(aluno => {
    const matchesSearch = aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aluno.matricula.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTurma = selectedTurma === '' || aluno.turma_id.toString() === selectedTurma;
    
    return matchesSearch && matchesTurma;
  });

  const handleExportarAlunos = async () => {
    setExporting(true);
    try {
      const result = await exportarAlunosExcel(alunosFiltrados, true);
      if (result.success) {
        alert(`✅ Lista de alunos exportada com sucesso!\n📁 Arquivo: ${result.filename}`);
      } else {
        alert('❌ Erro ao exportar lista de alunos');
      }
    } catch (error) {
      console.error('Erro na exportação:', error);
      alert('❌ Erro ao exportar lista de alunos');
    } finally {
      setExporting(false);
    }
  };

  const handleExportarPDF = async () => {
    setExporting(true);
    try {
      const result = await exportarAlunosPDF(alunosFiltrados);
      if (result.success) {
        alert('✅ PDF exportado com sucesso!');
      } else {
        alert('❌ Erro ao exportar PDF');
      }
    } catch (error) {
      console.error('Erro na exportação:', error);
      alert('❌ Erro ao exportar PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportarCSV = async () => {
    setExporting(true);
    try {
      const result = await exportarAlunosCSV(alunosFiltrados);
      if (result.success) {
        alert('✅ CSV exportado com sucesso!');
      } else {
        alert('❌ Erro ao exportar CSV');
      }
    } catch (error) {
      console.error('Erro na exportação:', error);
      alert('❌ Erro ao exportar CSV');
    } finally {
      setExporting(false);
    }
  };

  const handleExportarRelatorioCompleto = async () => {
    setExporting(true);
    try {
      const [ocorrenciasRes, faltasRes] = await Promise.all([
        fetch(`${API_BASE}/ocorrencias`),
        fetch(`${API_BASE}/faltas`)
      ]);

      const ocorrenciasData = await ocorrenciasRes.json();
      const faltasData = await faltasRes.json();

      const result = await exportarRelatorioCompleto(alunosFiltrados, ocorrenciasData, faltasData);
      if (result.success) {
        alert(`✅ Relatório completo exportado com sucesso!\n📁 Arquivo: ${result.filename}`);
      } else {
        alert('❌ Erro ao exportar relatório completo');
      }
    } catch (error) {
      console.error('Erro na exportação:', error);
      alert('❌ Erro ao exportar relatório completo');
    } finally {
      setExporting(false);
    }
  };

  const handleBaixarTemplate = async () => {
    try {
      const result = await gerarTemplateImportacao();
      if (result.success) {
        alert(`✅ Template baixado com sucesso!\n📁 Arquivo: ${result.filename}`);
      } else {
        alert('❌ Erro ao baixar template');
      }
    } catch (error) {
      console.error('Erro ao baixar template:', error);
      alert('❌ Erro ao baixar template');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isValidFormat = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv');
      
      if (!isValidFormat) {
        alert('❌ Formato de arquivo inválido. Use Excel (.xlsx, .xls) ou CSV (.csv)');
        return;
      }
      
      setImportFile(file);
      setImportResult(null);
    }
  };

  const handleProcessarImportacao = async () => {
    if (!importFile) {
      alert('❌ Selecione um arquivo primeiro');
      return;
    }

    setImporting(true);
    try {
      const resultado = await processarImportacaoAlunos(importFile);
      
      if (resultado.success && resultado.dados) {
        setImportResult({
          success: true,
          message: `✅ ${resultado.dados.length} alunos validados com sucesso!`,
          dados: resultado.dados
        });
      } else {
        setImportResult({
          success: false,
          message: `❌ Erro na validação:\n${resultado.erro}`,
          dados: []
        });
      }
    } catch (error) {
      console.error('Erro ao processar importação:', error);
      setImportResult({
        success: false,
        message: '❌ Erro ao processar arquivo',
        dados: []
      });
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmarImportacao = async () => {
    if (!importResult?.dados || importResult.dados.length === 0) {
      return;
    }

    setImporting(true);
    try {
      let sucessos = 0;
      let erros = 0;
      const errosDetalhados = [];

      for (const aluno of importResult.dados) {
        try {
          const response = await fetch(`${API_BASE}/alunos`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(aluno)
          });

          if (response.ok) {
            sucessos++;
          } else {
            erros++;
            const errorText = await response.text();
            errosDetalhados.push(`${aluno.matricula}: ${errorText}`);
          }
        } catch (error) {
          erros++;
          errosDetalhados.push(`${aluno.matricula}: Erro de conexão`);
        }
      }

      // Atualizar lista de alunos
      const fetchDados = async () => {
        try {
          const [alunosRes, turmasRes] = await Promise.all([
            fetch(`${API_BASE}/alunos`),
            fetch(`${API_BASE}/turmas`)
          ]);
          
          const alunosData = await alunosRes.json();
          const turmasData = await turmasRes.json();
          
          setAlunos(Array.isArray(alunosData) ? alunosData : []);
          setTurmas(Array.isArray(turmasData) ? turmasData : []);
        } catch (error) {
          console.error('Erro ao atualizar dados:', error);
        }
      };
      
      await fetchDados();
      
      // Mostrar resultado
      let mensagem = `📊 Importação concluída!\n✅ Sucessos: ${sucessos}\n❌ Erros: ${erros}`;
      if (errosDetalhados.length > 0) {
        mensagem += `\n\nDetalhes dos erros:\n${errosDetalhados.slice(0, 5).join('\n')}`;
        if (errosDetalhados.length > 5) {
          mensagem += `\n... e mais ${errosDetalhados.length - 5} erro(s)`;
        }
      }
      
      alert(mensagem);
      
      // Fechar modal
      setShowImportModal(false);
      setImportFile(null);
      setImportResult(null);
      
    } catch (error) {
      console.error('Erro na importação:', error);
      alert('❌ Erro ao importar alunos');
    } finally {
      setImporting(false);
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
      {/* Header Aprimorado */}
      <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-military-600">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center mb-4 lg:mb-0">
            <div className="bg-military-100 p-3 rounded-full mr-4">
              <Users className="h-8 w-8 text-military-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Alunos</h1>
              <p className="text-gray-600 mt-1">Controle completo da base de estudantes da Escola Cívico Militar Jupiara</p>
              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <UserCheck className="h-4 w-4 mr-1" />
                  {alunosFiltrados.length} alunos encontrados
                </span>
                <span className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {turmas.length} turmas ativas
                </span>
              </div>
            </div>
          </div>
          
          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center bg-gray-50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-military-600 text-white' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BarChart3 className="h-4 w-4 mr-1 inline" />
                Tabela
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'cards' 
                    ? 'bg-military-600 text-white' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Users className="h-4 w-4 mr-1 inline" />
                Cards
              </button>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={alunosFiltrados.length === 0}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <button
                    onClick={() => {
                      handleExportarAlunos();
                      setShowExportMenu(false);
                    }}
                    disabled={exporting}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                    Excel
                  </button>
                  
                  <button
                    onClick={() => {
                      handleExportarPDF();
                      setShowExportMenu(false);
                    }}
                    disabled={exporting}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Download className="h-4 w-4 mr-2 text-red-600" />
                    PDF
                  </button>
                  
                  <button
                    onClick={() => {
                      handleExportarCSV();
                      setShowExportMenu(false);
                    }}
                    disabled={exporting}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-600" />
                    CSV
                  </button>
                  
                  <div className="border-t border-gray-200"></div>
                  
                  <button
                    onClick={() => {
                      handleExportarRelatorioCompleto();
                      setShowExportMenu(false);
                    }}
                    disabled={exporting}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <BarChart3 className="h-4 w-4 mr-2 text-purple-600" />
                    Relatório Completo
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar Alunos
            </button>
          </div>
        </div>
      </div>

      {/* Filtros Aprimorados */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-military-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros de Busca</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou matrícula..."
              className="pl-12 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-military-500 focus:border-military-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <BookOpen className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              className="pl-12 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-military-500 focus:border-military-500 transition-colors"
              value={selectedTurma}
              onChange={(e) => setSelectedTurma(e.target.value)}
            >
              <option value="">Todas as turmas</option>
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id.toString()}>
                  {turma.nome} - {turma.ano} ({turma.turno})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-center bg-military-50 rounded-lg p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-military-600">{alunosFiltrados.length}</div>
              <div className="text-sm text-military-700">Alunos Filtrados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Alunos - Modo Tabela */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-military-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">Lista Completa de Alunos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aluno
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matrícula
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turma
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato do Responsável
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endereço
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alunosFiltrados.map((aluno, index) => (
                  <tr key={aluno.id} className={`hover:bg-blue-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-military-100 flex items-center justify-center">
                            <span className="text-military-600 font-bold text-lg">
                              {aluno.nome.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{aluno.nome}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(aluno.data_nascimento).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-military-100 text-military-800">
                        {aluno.matricula}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {aluno.turma_nome}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Phone className="h-3 w-3 mr-1 text-green-600" />
                          {aluno.telefone_responsavel || 'Não informado'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1 text-blue-600" />
                          {aluno.email_responsavel || 'Não informado'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{aluno.endereco || 'Não informado'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors" title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900 p-1 rounded transition-colors" title="Editar">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lista de Alunos - Modo Cards */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {alunosFiltrados.map((aluno) => (
            <div key={aluno.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-military-100 flex items-center justify-center">
                      <span className="text-military-600 font-bold text-2xl">
                        {aluno.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{aluno.nome}</h3>
                    <div className="flex items-center mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-military-100 text-military-800">
                        {aluno.matricula}
                      </span>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {aluno.turma_nome}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Nascimento: {new Date(aluno.data_nascimento).toLocaleDateString('pt-BR')}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-green-600" />
                    <span>{aluno.telefone_responsavel || 'Telefone não informado'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="truncate">{aluno.email_responsavel || 'Email não informado'}</span>
                  </div>
                  
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{aluno.endereco || 'Endereço não informado'}</span>
                  </div>
                  
                  {aluno.observacoes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800 line-clamp-2">
                        <strong>Obs:</strong> {aluno.observacoes}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    <Eye className="h-4 w-4 mr-1" />
                    Visualizar
                  </button>
                  <button className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {alunosFiltrados.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <Users className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum aluno encontrado</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedTurma 
              ? 'Tente ajustar os filtros de busca para encontrar outros alunos.' 
              : 'Não há alunos cadastrados no sistema.'}
          </p>
          {(searchTerm || selectedTurma) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTurma('');
              }}
              className="inline-flex items-center px-4 py-2 bg-military-600 text-white rounded-lg hover:bg-military-700 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpar Filtros
            </button>
          )}
        </div>
      )}
      
      {/* Estatísticas Rápidas */}
      {alunosFiltrados.length > 0 && (
        <div className="bg-gradient-to-r from-military-600 to-military-800 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-xl font-semibold mb-4">📊 Estatísticas Rápidas</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{alunosFiltrados.length}</div>
              <div className="text-military-100 text-sm">Total de Alunos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{new Set(alunosFiltrados.map(a => a.turma_nome)).size}</div>
              <div className="text-military-100 text-sm">Turmas Diferentes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{alunosFiltrados.filter(a => a.telefone_responsavel).length}</div>
              <div className="text-military-100 text-sm">Com Telefone</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{alunosFiltrados.filter(a => a.email_responsavel).length}</div>
              <div className="text-military-100 text-sm">Com Email</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Importação */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Importar Alunos via Planilha</h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportResult(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Passo 1: Baixar Template */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-2">Baixar Template</h3>
                    <p className="text-blue-700 text-sm mb-3">
                      Baixe o template Excel com o formato correto e instruções detalhadas.
                    </p>
                    <button
                      onClick={handleBaixarTemplate}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Baixar Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Passo 2: Selecionar Arquivo */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-2">Selecionar Arquivo</h3>
                    <p className="text-green-700 text-sm mb-3">
                      Selecione sua planilha preenchida (Excel ou CSV).
                    </p>
                    
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Escolher Arquivo
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                      
                      {importFile && (
                        <div className="flex items-center text-green-700 text-sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {importFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Passo 3: Processar e Validar */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 mb-2">Validar Dados</h3>
                    <p className="text-orange-700 text-sm mb-3">
                      Processe e valide os dados antes da importação final.
                    </p>
                    
                    <button
                      onClick={handleProcessarImportacao}
                      disabled={!importFile || importing}
                      className="flex items-center px-3 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {importing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      {importing ? 'Validando...' : 'Validar Dados'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Resultado da Validação */}
              {importResult && (
                <div className={`p-4 rounded-lg border ${
                  importResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {importResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${importResult.success ? 'text-green-900' : 'text-red-900'}`}>
                        Resultado da Validação
                      </h4>
                      <pre className={`text-sm mt-2 whitespace-pre-wrap ${importResult.success ? 'text-green-700' : 'text-red-700'}`}>
                        {importResult.message}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportResult(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                
                {importResult?.success && (
                  <button
                    onClick={handleConfirmarImportacao}
                    disabled={importing}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {importing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {importing ? 'Importando...' : `Confirmar Importação (${importResult.dados?.length || 0} alunos)`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Alunos;