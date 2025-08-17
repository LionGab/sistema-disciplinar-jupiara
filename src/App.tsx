import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, Users, AlertTriangle, Calendar, BarChart3, Menu, X, Settings, FileText, UserPlus, LogOut, User } from 'lucide-react';

// Components
import Dashboard from './components/Dashboard';
import Alunos from './components/Alunos';
import Ocorrencias from './components/Ocorrencias';
import Faltas from './components/Faltas';
import Metricas from './components/Metricas';
import RelatorioExecutivo from './components/RelatorioExecutivo';
import GraficosTendencia from './components/GraficosTendencia';
import Gestao from './components/Gestao';
import Configuracoes from './components/Configuracoes';
import FichaDisciplinar from './components/FichaDisciplinar';
import ProtectedRoute from './components/ProtectedRoute';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard' },
    { path: '/alunos', icon: Users, label: 'Alunos' },
    { path: '/gestao', icon: UserPlus, label: 'Gestão' },
    { path: '/ocorrencias', icon: AlertTriangle, label: 'Ocorrências' },
    { path: '/faltas', icon: Calendar, label: 'Faltas' },
    { path: '/ficha-disciplinar', icon: FileText, label: 'Ficha Individual' },
    { path: '/metricas', icon: BarChart3, label: 'Métricas' },
    { path: '/relatorio-executivo', icon: Shield, label: 'Rel. Executivo' },
    { path: '/tendencias', icon: BarChart3, label: 'Tendências' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  return (
    <nav className="bg-military-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-yellow-400 mr-3" />
            <span className="font-bold text-xl">
              Escola Cívico Militar Jupiara
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-military-700 text-yellow-400'
                      : 'text-gray-300 hover:bg-military-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
            
            {/* User Menu */}
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-military-600">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-yellow-400 font-medium">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-military-700 hover:text-white transition-colors"
                title="Sair do sistema"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sair
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <span className="text-xs text-yellow-400">{user?.name}</span>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white hover:bg-military-700 px-3 py-2 rounded-md"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-military-700 text-yellow-400'
                        : 'text-gray-300 hover:bg-military-700 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
              {/* Mobile Logout */}
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-military-700 hover:text-white transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sair do Sistema
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/alunos" element={<Alunos />} />
          <Route path="/gestao" element={<Gestao />} />
          <Route path="/ocorrencias" element={<Ocorrencias />} />
          <Route path="/faltas" element={<Faltas />} />
          <Route path="/ficha-disciplinar" element={<FichaDisciplinar />} />
          <Route path="/metricas" element={<Metricas />} />
          <Route path="/relatorio-executivo" element={<RelatorioExecutivo />} />
          <Route path="/tendencias" element={<GraficosTendencia />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ProtectedRoute>
          <AppContent />
        </ProtectedRoute>
      </Router>
    </AuthProvider>
  );
}

export default App;