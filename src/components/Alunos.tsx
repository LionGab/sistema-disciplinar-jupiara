import React, { useState, useEffect } from 'react';
import { Users, Search, Filter } from 'lucide-react';

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

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api' 
  : 'http://localhost:5000/api';

function Alunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('');

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [alunosRes, turmasRes] = await Promise.all([
          fetch(`${API_BASE}/alunos`),
          fetch(`${API_BASE}/turmas`)
        ]);

        const alunosData = await alunosRes.json();
        const turmasData = await turmasRes.json();

        setAlunos(alunosData);
        setTurmas(turmasData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
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
            <Users className="h-8 w-8 text-military-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Alunos</h1>
              <p className="text-gray-600">Gerenciamento de alunos matriculados</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Total: {alunosFiltrados.length} alunos
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou matrícula..."
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
              value={selectedTurma}
              onChange={(e) => setSelectedTurma(e.target.value)}
            >
              <option value="">Todas as turmas</option>
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id.toString()}>
                  {turma.nome} - {turma.ano}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Alunos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aluno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matrícula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Observações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alunosFiltrados.map((aluno) => (
                <tr key={aluno.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{aluno.nome}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(aluno.data_nascimento).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {aluno.matricula}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {aluno.turma_nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{aluno.telefone_responsavel}</div>
                    <div className="text-sm text-gray-500">{aluno.email_responsavel}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {aluno.observacoes || 'Nenhuma observação'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {alunosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum aluno encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Tente ajustar os filtros de busca.
          </p>
        </div>
      )}
    </div>
  );
}

export default Alunos;