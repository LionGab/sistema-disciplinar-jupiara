import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  School, 
  Calendar, 
  Save, 
  Shield, 
  Bell,
  FileText,
  Target,
  Users,
  AlertTriangle
} from 'lucide-react';

interface ConfiguracaoEscola {
  nomeEscola: string;
  anoLetivo: string;
  periodo: string;
  oficialResponsavel: string;
  patente: string;
  metaIndiceDisciplinar: number;
  emailNotificacoes: string;
  diasAlertas: number;
  logoEscola: string;
  endereco: string;
  telefone: string;
  cnpj: string;
}

function Configuracoes() {
  const [config, setConfig] = useState<ConfiguracaoEscola>({
    nomeEscola: 'Escola Cívico Militar Jupiara',
    anoLetivo: '2024',
    periodo: '2º Semestre',
    oficialResponsavel: 'João Silva',
    patente: 'Tenente',
    metaIndiceDisciplinar: 1.0,
    emailNotificacoes: 'tenente@escola.mil.br',
    diasAlertas: 7,
    logoEscola: '',
    endereco: 'Rua Principal, 123 - Centro - Jupiara/TO',
    telefone: '(63) 3333-4444',
    cnpj: '12.345.678/0001-90'
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simular salvamento (em produção, salvaria na API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Salvar no localStorage para persistir
      localStorage.setItem('configuracaoEscola', JSON.stringify(config));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      console.log('Configurações salvas:', config);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carregar configurações salvas
    const configSalva = localStorage.getItem('configuracaoEscola');
    if (configSalva) {
      setConfig(JSON.parse(configSalva));
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-military-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
              <p className="text-gray-600">Dados institucionais e parâmetros do sistema disciplinar</p>
            </div>
          </div>
          {saved && (
            <div className="flex items-center text-green-600">
              <Save className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Salvo com sucesso!</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Dados Institucionais */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <School className="h-6 w-6 text-military-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Dados Institucionais</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Escola *
              </label>
              <input
                type="text"
                required
                value={config.nomeEscola}
                onChange={(e) => setConfig({...config, nomeEscola: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ
              </label>
              <input
                type="text"
                value={config.cnpj}
                onChange={(e) => setConfig({...config, cnpj: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                placeholder="00.000.000/0000-00"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                value={config.endereco}
                onChange={(e) => setConfig({...config, endereco: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                value={config.telefone}
                onChange={(e) => setConfig({...config, telefone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                placeholder="(00) 0000-0000"
              />
            </div>
          </div>
        </div>

        {/* Período Letivo */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Calendar className="h-6 w-6 text-military-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Período Letivo</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano Letivo *
              </label>
              <select
                required
                value={config.anoLetivo}
                onChange={(e) => setConfig({...config, anoLetivo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período Atual
              </label>
              <select
                value={config.periodo}
                onChange={(e) => setConfig({...config, periodo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
              >
                <option value="1º Semestre">1º Semestre</option>
                <option value="2º Semestre">2º Semestre</option>
                <option value="1º Trimestre">1º Trimestre</option>
                <option value="2º Trimestre">2º Trimestre</option>
                <option value="3º Trimestre">3º Trimestre</option>
                <option value="4º Trimestre">4º Trimestre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Oficial Responsável */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-military-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Oficial Responsável</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={config.oficialResponsavel}
                onChange={(e) => setConfig({...config, oficialResponsavel: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patente *
              </label>
              <select
                required
                value={config.patente}
                onChange={(e) => setConfig({...config, patente: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
              >
                <option value="Tenente">Tenente</option>
                <option value="Capitão">Capitão</option>
                <option value="Major">Major</option>
                <option value="Sargento">Sargento</option>
                <option value="Cabo">Cabo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Parâmetros Disciplinares */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Target className="h-6 w-6 text-military-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Parâmetros Disciplinares</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta - Índice Disciplinar Máximo
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={config.metaIndiceDisciplinar}
                  onChange={(e) => setConfig({...config, metaIndiceDisciplinar: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className="text-gray-500 text-sm">máx</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Turmas acima deste índice serão sinalizadas como críticas
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intervalo de Alertas (dias)
              </label>
              <select
                value={config.diasAlertas}
                onChange={(e) => setConfig({...config, diasAlertas: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
              >
                <option value={1}>Diário</option>
                <option value={3}>A cada 3 dias</option>
                <option value={7}>Semanal</option>
                <option value={15}>Quinzenal</option>
                <option value={30}>Mensal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Bell className="h-6 w-6 text-military-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Sistema de Notificações</h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email para Alertas Críticos
            </label>
            <input
              type="email"
              value={config.emailNotificacoes}
              onChange={(e) => setConfig({...config, emailNotificacoes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-military-500 focus:border-military-500"
              placeholder="oficial@escola.mil.br"
            />
            <p className="text-xs text-gray-500 mt-1">
              Será usado para enviar alertas de turmas/alunos em nível crítico
            </p>
          </div>
        </div>

        {/* Classificações de Índice */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-military-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Classificação do Índice Disciplinar</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <span className="font-medium text-green-800">Excelente</span>
              </div>
              <p className="text-sm text-green-700">Índice: 0.00</p>
              <p className="text-xs text-green-600">Sem ocorrências</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                <span className="font-medium text-yellow-800">Bom</span>
              </div>
              <p className="text-sm text-yellow-700">Índice: 0.01 - 1.00</p>
              <p className="text-xs text-yellow-600">Dentro da meta</p>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
                <span className="font-medium text-orange-800">Atenção</span>
              </div>
              <p className="text-sm text-orange-700">Índice: 1.01 - 2.00</p>
              <p className="text-xs text-orange-600">Requer acompanhamento</p>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                <span className="font-medium text-red-800">Crítico</span>
              </div>
              <p className="text-sm text-red-700">Índice: &gt; {config.metaIndiceDisciplinar}</p>
              <p className="text-xs text-red-600">Intervenção imediata</p>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center px-6 py-3 rounded-md font-medium ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-military-600 hover:bg-military-700'
            } text-white`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Configuracoes;