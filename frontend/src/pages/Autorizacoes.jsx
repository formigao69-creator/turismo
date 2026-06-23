import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

export default function Autorizacoes() {
  const { temPerfil } = useAuth();
  const [dados, setDados] = useState([]);
  const [total, setTotal] = useState(0);
  const [filtroData, setFiltroData] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [motivoRevogacao, setMotivoRevogacao] = useState({ id: null, texto: '' });
  const POR_PAGINA = 15;

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const params = { pagina, por_pagina: POR_PAGINA };
      if (filtroData) params.data = filtroData;
      if (filtroStatus) params.status = filtroStatus;
      const { data } = await api.get('/autorizacoes', { params });
      setDados(data.dados);
      setTotal(data.total);
    } catch { toast.error('Erro ao carregar autorizações'); }
    finally { setCarregando(false); }
  }, [pagina, filtroData, filtroStatus]);

  useEffect(() => { carregar(); }, [carregar]);

  const sincronizar = async () => {
    try {
      const { data } = await api.post('/autorizacoes/sincronizar-forms');
      toast.success(data.mensagem);
      carregar();
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao sincronizar');
    }
  };

  const revogar = async (id) => {
    if (!motivoRevogacao.texto.trim()) return toast.error('Informe o motivo da revogação');
    try {
      const { data } = await api.patch(`/autorizacoes/${id}/revogar`, { motivo: motivoRevogacao.texto });
      toast.success(data.mensagem);
      setMotivoRevogacao({ id: null, texto: '' });
      carregar();
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao revogar');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Autorizações</h1>
        <div className="flex gap-2">
          {temPerfil('SEMSET_AUTORIZACAO', 'ADMIN') && (
            <>
              <button onClick={sincronizar} className="btn-secondary text-sm">↻ Sincronizar Forms</button>
              <Link to="/autorizacoes/nova" className="btn-primary text-sm">+ Lançar</Link>
            </>
          )}
        </div>
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <input type="date" className="input w-auto" value={filtroData}
          onChange={e => { setFiltroData(e.target.value); setPagina(1); }} />
        <select className="input w-auto" value={filtroStatus}
          onChange={e => { setFiltroStatus(e.target.value); setPagina(1); }}>
          <option value="">Todos os status</option>
          <option value="autorizada">Autorizada</option>
          <option value="revogada">Revogada</option>
        </select>
      </div>

      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              {['Placa', 'Cadastur', 'Chegada', 'Permanência', 'Destino', 'Origem', 'Status', 'DAM', 'Ações'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {carregando ? (
              <tr><td colSpan={9} className="text-center py-8 text-gray-400">Carregando...</td></tr>
            ) : dados.map(a => (
              <React.Fragment key={a.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold tracking-wider">{a.placa}</td>
                  <td className="px-4 py-3 font-mono text-petrol-600">{a.cadastur}</td>
                  <td className="px-4 py-3">{format(parseISO(a.dia_chegada), 'dd/MM/yyyy')}</td>
                  <td className="px-4 py-3">{a.permanencia}d</td>
                  <td className="px-4 py-3 truncate max-w-xs">{a.destino}</td>
                  <td className="px-4 py-3">
                    <span className={a.origem === 'Google Forms' ? 'badge-green' : 'badge-gray'}>{a.origem}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={a.status === 'autorizada' ? 'badge-green' : 'badge-red'}>
                      {a.status === 'autorizada' ? 'Autorizada' : 'Revogada'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {a.dam_numero ? (
                      <span className={a.dam_pago ? 'badge-green' : 'badge-amber'}>
                        {a.dam_pago ? '✓ Pago' : '⏳ Pendente'}
                      </span>
                    ) : <span className="badge-gray">Sem DAM</span>}
                  </td>
                  <td className="px-4 py-3">
                    {temPerfil('SEMSET_AUTORIZACAO', 'ADMIN') && a.status === 'autorizada' && (
                      <button
                        onClick={() => setMotivoRevogacao({ id: a.id, texto: '' })}
                        className="text-xs text-red-600 hover:underline">
                        Revogar
                      </button>
                    )}
                  </td>
                </tr>
                {motivoRevogacao.id === a.id && (
                  <tr className="bg-red-50">
                    <td colSpan={9} className="px-4 py-3">
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="label text-red-700">Motivo da revogação *</label>
                          <input className="input border-red-300 focus:ring-red-500"
                            value={motivoRevogacao.texto}
                            onChange={e => setMotivoRevogacao(m => ({ ...m, texto: e.target.value }))}
                            placeholder="Descreva o motivo..." />
                        </div>
                        <button onClick={() => revogar(a.id)} className="btn-danger text-sm">Confirmar revogação</button>
                        <button onClick={() => setMotivoRevogacao({ id: null, texto: '' })} className="btn-secondary text-sm">Cancelar</button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
