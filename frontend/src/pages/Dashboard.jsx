import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function StatCard({ label, valor, cor, link }) {
  const content = (
    <div className={`card border-l-4 ${cor}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-1">{valor ?? '—'}</p>
    </div>
  );
  return link ? <Link to={link}>{content}</Link> : content;
}

export default function Dashboard() {
  const { usuario, temPerfil } = useAuth();
  const [stats, setStats] = useState({});

  useEffect(() => {
    const carregar = async () => {
      try {
        const resultados = await Promise.allSettled([
          temPerfil('SEMTUR', 'ADMIN') && api.get('/veiculos', { params: { por_pagina: 1 } }),
          temPerfil('SEMSET_AUTORIZACAO', 'ADMIN', 'FAZENDA') && api.get('/autorizacoes', { params: { por_pagina: 1 } }),
          temPerfil('FAZENDA', 'ADMIN') && api.get('/dams', { params: { paga: false, por_pagina: 1 } }),
          temPerfil('SEMSET_AUTORIZACAO', 'ADMIN') && api.get('/autorizacoes/fila-forms'),
        ]);

        setStats({
          veiculos: resultados[0].status === 'fulfilled' && resultados[0].value ? resultados[0].value.data.total : null,
          autorizacoes: resultados[1].status === 'fulfilled' && resultados[1].value ? resultados[1].value.data.total : null,
          dams_pendentes: resultados[2].status === 'fulfilled' && resultados[2].value ? resultados[2].value.data.total : null,
          fila_forms: resultados[3].status === 'fulfilled' && resultados[3].value ? resultados[3].value.data.length : null,
        });
      } catch (e) {
        console.error(e);
      }
    };
    carregar();
  }, []);

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel</h1>
        <p className="text-gray-500 text-sm capitalize">{hoje}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {temPerfil('SEMTUR', 'ADMIN') && (
          <StatCard label="Veículos cadastrados" valor={stats.veiculos} cor="border-petrol-500" link="/veiculos" />
        )}
        {temPerfil('SEMSET_AUTORIZACAO', 'ADMIN', 'FAZENDA') && (
          <StatCard label="Autorizações" valor={stats.autorizacoes} cor="border-blue-500" link="/autorizacoes" />
        )}
        {temPerfil('FAZENDA', 'ADMIN') && (
          <StatCard label="DAMs pendentes" valor={stats.dams_pendentes} cor="border-amber-500" link="/dams" />
        )}
        {temPerfil('SEMSET_AUTORIZACAO', 'ADMIN') && (
          <StatCard label="Fila Google Forms" valor={stats.fila_forms} cor="border-green-500" link="/autorizacoes" />
        )}
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Ações rápidas</h2>
        <div className="flex flex-wrap gap-3">
          {temPerfil('SEMTUR', 'ADMIN') && (
            <Link to="/veiculos/novo" className="btn-primary">Cadastrar veículo</Link>
          )}
          {temPerfil('SEMSET_AUTORIZACAO', 'ADMIN') && (
            <Link to="/autorizacoes/nova" className="btn-primary">Lançar autorização</Link>
          )}
          {temPerfil('SEMSET_FISCALIZACAO', 'ADMIN', 'SEMSET_AUTORIZACAO') && (
            <Link to="/fiscalizacao" className="btn-secondary">Consultar placa</Link>
          )}
          {temPerfil('FAZENDA', 'ADMIN') && (
            <Link to="/dams" className="btn-secondary">Emitir DAM em lote</Link>
          )}
        </div>
      </div>
    </div>
  );
}
