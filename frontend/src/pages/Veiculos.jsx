import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function BadgeValidade({ data }) {
  const validade = new Date(data);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const vencido = validade < hoje;
  return (
    <span className={vencido ? 'badge-red' : 'badge-green'}>
      {vencido ? '✗ Vencido' : '✓ Vigente'} · {format(parseISO(data), 'dd/MM/yyyy')}
    </span>
  );
}

export default function Veiculos() {
  const { temPerfil } = useAuth();
  const [dados, setDados] = useState([]);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const POR_PAGINA = 15;

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const { data } = await api.get('/veiculos', { params: { busca, pagina, por_pagina: POR_PAGINA } });
      setDados(data.dados);
      setTotal(data.total);
    } catch {
      toast.error('Erro ao carregar veículos');
    } finally {
      setCarregando(false);
    }
  }, [busca, pagina]);

  useEffect(() => { carregar(); }, [carregar]);

  const renovar = async (cadastur) => {
    if (!confirm(`Renovar Cadastur ${cadastur} para a próxima temporada?`)) return;
    try {
      const { data } = await api.patch(`/veiculos/${cadastur}/renovar`);
      toast.success(data.mensagem);
      carregar();
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao renovar');
    }
  };

  const exportar = async () => {
    const { data } = await api.get('/veiculos/exportar', { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([data]));
    const a = document.createElement('a'); a.href = url; a.download = 'veiculos.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Veículos Cadastrados</h1>
        <div className="flex gap-2">
          {temPerfil('SEMTUR', 'ADMIN') && (
            <>
              <button onClick={exportar} className="btn-secondary text-sm">Exportar CSV</button>
              <Link to="/veiculos/novo" className="btn-primary text-sm">+ Cadastrar</Link>
            </>
          )}
        </div>
      </div>

      <div className="card p-4">
        <input className="input max-w-xs" placeholder="Buscar por placa, Cadastur ou proprietário..."
          value={busca} onChange={e => { setBusca(e.target.value); setPagina(1); }} />
      </div>

      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              {['Cadastur', 'Placa', 'Tipo', 'Proprietário', 'Contato', 'Validade Cadastur', 'Ações'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {carregando ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">Carregando...</td></tr>
            ) : dados.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">Nenhum veículo encontrado</td></tr>
            ) : dados.map(v => (
              <tr key={v.cadastur} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-bold text-petrol-600">{v.cadastur}</td>
                <td className="px-4 py-3 font-mono font-bold tracking-wider">{v.placa}</td>
                <td className="px-4 py-3">{v.tipo}</td>
                <td className="px-4 py-3">{v.proprietario}</td>
                <td className="px-4 py-3 text-gray-500">{v.contato}</td>
                <td className="px-4 py-3"><BadgeValidade data={v.validade_cadastur} /></td>
                <td className="px-4 py-3">
                  {temPerfil('SEMTUR', 'ADMIN') && (
                    <button onClick={() => renovar(v.cadastur)} className="text-xs text-petrol-600 hover:underline">
                      Renovar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginação */}
        {total > POR_PAGINA && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-600">
            <span>{total} veículos</span>
            <div className="flex gap-2">
              <button className="btn-secondary py-1 px-3 text-xs" disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}>← Anterior</button>
              <span className="py-1 px-3">{pagina} / {Math.ceil(total / POR_PAGINA)}</span>
              <button className="btn-secondary py-1 px-3 text-xs" disabled={pagina * POR_PAGINA >= total} onClick={() => setPagina(p => p + 1)}>Próxima →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
