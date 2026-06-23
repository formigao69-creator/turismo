import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Veiculos from './pages/Veiculos';
import CadastrarVeiculo from './pages/CadastrarVeiculo';
import Autorizacoes from './pages/Autorizacoes';
import LancarAutorizacao from './pages/LancarAutorizacao';
import DAMs from './pages/DAMs';
import Fiscalizacao from './pages/Fiscalizacao';
import Administracao from './pages/Administracao';
import ConsultaPublica from './pages/ConsultaPublica';
import Layout from './components/layout/Layout';

function RotaProtegida({ element, perfis }) {
  const { usuario, temPerfil } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (perfis && !temPerfil(...perfis)) return <Navigate to="/dashboard" replace />;
  return element;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/consulta" element={<ConsultaPublica />} />

      <Route element={<Layout />}>
        <Route path="/dashboard" element={<RotaProtegida element={<Dashboard />} />} />

        <Route path="/veiculos" element={<RotaProtegida element={<Veiculos />} perfis={['SEMTUR', 'ADMIN', 'SEMSET_AUTORIZACAO', 'SEMSET_FISCALIZACAO']} />} />
        <Route path="/veiculos/novo" element={<RotaProtegida element={<CadastrarVeiculo />} perfis={['SEMTUR', 'ADMIN']} />} />

        <Route path="/autorizacoes" element={<RotaProtegida element={<Autorizacoes />} perfis={['SEMSET_AUTORIZACAO', 'ADMIN', 'FAZENDA']} />} />
        <Route path="/autorizacoes/nova" element={<RotaProtegida element={<LancarAutorizacao />} perfis={['SEMSET_AUTORIZACAO', 'ADMIN']} />} />

        <Route path="/dams" element={<RotaProtegida element={<DAMs />} perfis={['FAZENDA', 'ADMIN', 'SEMSET_FISCALIZACAO']} />} />

        <Route path="/fiscalizacao" element={<RotaProtegida element={<Fiscalizacao />} perfis={['SEMSET_FISCALIZACAO', 'ADMIN', 'SEMSET_AUTORIZACAO']} />} />

        <Route path="/administracao" element={<RotaProtegida element={<Administracao />} perfis={['ADMIN']} />} />
      </Route>

      <Route path="/" element={<Navigate to="/consulta" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
