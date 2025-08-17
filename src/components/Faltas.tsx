import React, { useState, useEffect } from 'react';
import { Calendar, User, CheckCircle, XCircle, FileText } from 'lucide-react';

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

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api' 
  : 'http://localhost:5000/api';

function Faltas() {
  const [faltas, setFaltas] = useState<Falta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaltas = async () => {
      try {
        const response = await fetch(`${API_BASE}/faltas`);
        const data = await response.json();
        setFaltas(data);
      } catch (error) {
        console.error('Erro ao buscar faltas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaltas();
  }, []);

  const faltasJustificadas = faltas.filter(f => f.justificada);
  const faltasNaoJustificadas = faltas.filter(f => !f.justificada);

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
            <Calendar className="h-8 w-8 text-military-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Controle de Faltas</h1>
              <p className="text-gray-600">Registro e acompanhamento de faltas dos alunos</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Total: {faltas.length} faltas
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Faltas</p>
              <p className="text-2xl font-bold text-gray-900">{faltas.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Justificadas</p>
              <p className="text-2xl font-bold text-gray-900">{faltasJustificadas.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Não Justificadas</p>
              <p className="text-2xl font-bold text-gray-900">{faltasNaoJustificadas.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Faltas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                <tr key={falta.id} className="hover:bg-gray-50">
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
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
  );
}

export default Faltas;