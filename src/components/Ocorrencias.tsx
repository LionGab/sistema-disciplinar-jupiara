import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, User, AlertCircle, Download, FileSpreadsheet } from 'lucide-react';
import { 
  exportarOcorrenciasExcel,
  exportarOcorrenciasPDF,
  exportarOcorrenciasCSV 
} from '../utils/exportUtils';

interface Ocorrencia {
  id: number;
  aluno_id: number;
  tipo_ocorrencia_id: number;
  data_ocorrencia: string;
  hora_ocorrencia: string;
  descricao: string;
  medidas_tomadas: string;
  responsavel_registro: string;
  status: string;
  aluno_nome: string;
  matricula: string;
  turma_nome: string;
  tipo_nome: string;
  gravidade: string;
  pontos: number;
}

interface TipoOcorrencia {
  id: number;
  nome: string;
  gravidade: string;
  pontos: number;
}

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api' 
  : 'http://localhost:5000/api';

function Ocorrencias() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [tipos, setTipos] = useState<TipoOcorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [ocorrenciasRes, tiposRes] = await Promise.all([
          fetch(`${API_BASE}/ocorrencias`),
          fetch(`${API_BASE}/ocorrencias/tipos`)
        ]);

        const ocorrenciasData = await ocorrenciasRes.json();
        const tiposData = await tiposRes.json();

        setOcorrencias(Array.isArray(ocorrenciasData) ? ocorrenciasData : []);
        setTipos(Array.isArray(tiposData) ? tiposData : []);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setOcorrencias([]);
        setTipos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, []);

  const handleExportarExcel = async () => {
    setExporting(true);
    try {
      const result = await exportarOcorrenciasExcel(ocorrencias);
      if (result.success) {
        alert(`✅ Ocorrências exportadas em Excel!\n📁 Arquivo: ${result.filename}`);
      } else {
        alert('❌ Erro ao exportar Excel');
      }
    } catch (error) {
      console.error('Erro na exportação:', error);
      alert('❌ Erro ao exportar Excel');
    } finally {
      setExporting(false);
    }
  };

  const handleExportarPDF = async () => {
    setExporting(true);
    try {
      const result = await exportarOcorrenciasPDF(ocorrencias);
      if (result.success) {
        alert('✅ Ocorrências exportadas em PDF!');
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
      const result = await exportarOcorrenciasCSV(ocorrencias);
      if (result.success) {
        alert('✅ Ocorrências exportadas em CSV!');
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

  const getGravidadeColor = (gravidade: string) => {
    switch (gravidade) {
      case 'leve':
        return 'bg-yellow-100 text-yellow-800';
      case 'media':
        return 'bg-orange-100 text-orange-800';
      case 'grave':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800';
      case 'resolvida':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-military-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ocorrências Disciplinares</h1>
              <p className="text-gray-600">Registro e acompanhamento de ocorrências</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Total: {ocorrencias.length} ocorrências
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={ocorrencias.length === 0}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <button
                    onClick={() => {
                      handleExportarExcel();
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Graves</p>
              <p className="text-xl font-bold text-gray-900">
                {ocorrencias.filter(o => o.gravidade === 'grave').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Médias</p>
              <p className="text-xl font-bold text-gray-900">
                {ocorrencias.filter(o => o.gravidade === 'media').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Leves</p>
              <p className="text-xl font-bold text-gray-900">
                {ocorrencias.filter(o => o.gravidade === 'leve').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-xl font-bold text-gray-900">
                {ocorrencias.filter(o => o.status === 'pendente').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Ocorrências */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aluno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gravidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pontos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ocorrencias.map((ocorrencia) => (
                <tr key={ocorrencia.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(ocorrencia.data_ocorrencia).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {ocorrencia.hora_ocorrencia}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {ocorrencia.aluno_nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ocorrencia.matricula} - {ocorrencia.turma_nome}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      <div className="font-medium">{ocorrencia.tipo_nome}</div>
                      <div className="text-gray-500 truncate">{ocorrencia.descricao}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getGravidadeColor(ocorrencia.gravidade)}`}>
                      {ocorrencia.gravidade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ocorrencia.status)}`}>
                      {ocorrencia.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ocorrencia.responsavel_registro}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900">
                      {ocorrencia.pontos}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {ocorrencias.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma ocorrência registrada</h3>
          <p className="mt-1 text-sm text-gray-500">
            As ocorrências disciplinares aparecerão aqui quando forem registradas.
          </p>
        </div>
      )}
    </div>
  );
}

export default Ocorrencias;