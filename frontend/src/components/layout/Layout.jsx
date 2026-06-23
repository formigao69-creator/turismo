import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MENU = [
  { label: 'Painel', path: '/dashboard', perfis: ['SEMTUR', 'SEMSET_AUTORIZACAO', 'SEMSET_FISCALIZACAO', 'FAZENDA', 'ADMIN'] },
  { label: 'Veículos', path: '/veiculos', perfis: ['SEMTUR', 'ADMIN', 'SEMSET_AUTORIZACAO', 'SEMSET_FISCALIZACAO'] },
  { label: 'Autorizações', path: '/autorizacoes', perfis: ['SEMSET_AUTORIZACAO', 'ADMIN', 'FAZENDA'] },
  { label: 'DAMs', path: '/dams', perfis: ['FAZENDA', 'ADMIN', 'SEMSET_FISCALIZACAO'] },
  { label: 'Fiscalização', path: '/fiscalizacao', perfis: ['SEMSET_FISCALIZACAO', 'ADMIN', 'SEMSET_AUTORIZACAO'] },
  { label: 'Administração', path: '/administracao', perfis: ['ADMIN'] },
];

const LABEL_PERFIL = {
  SEMTUR: 'SEMTUR',
  SEMSET_AUTORIZACAO: 'SEMSET — Autorização',
  SEMSET_FISCALIZACAO: 'SEMSET — Fiscalização',
  FAZENDA: 'Secretaria da Fazenda',
  ADMIN: 'Administrador',
};

export default function Layout() {
  const { usuario, logout, temPerfil } = useAuth();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-petrol-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded"
              onClick={() => setMenuAberto(!menuAberto)}
              aria-label="Abrir menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <p className="font-bold text-lg leading-none">SisVetur</p>
              <p className="text-petrol-200 text-xs">Guarapari/ES</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{usuario?.nome}</p>
              <p className="text-petrol-200 text-xs">{LABEL_PERFIL[usuario?.perfil]}</p>
            </div>
            <button onClick={handleLogout} className="btn-secondary text-xs py-1.5 px-3">
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className={`${menuAberto ? 'block' : 'hidden'} md:block w-56 bg-white border-r border-gray-200 flex-shrink-0`}>
          <ul className="py-4 space-y-1 px-2">
            {MENU.filter(m => temPerfil(...m.perfis)).map(item => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setMenuAberto(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-petrol-600 text-white'
                        : 'text-gray-700 hover:bg-petrol-50 hover:text-petrol-700'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li className="pt-2 border-t border-gray-200">
              <a
                href="/consulta"
                target="_blank"
                className="block px-4 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
              >
                Portal Público ↗
              </a>
            </li>
          </ul>
        </nav>

        {/* Conteúdo */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
