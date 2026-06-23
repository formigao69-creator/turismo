import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

export default function DAMs() {
  const [dados, setDados] = useState([]);
  const [total, setTotal] = useState(0);
  const [filtroPaga, setFiltroPaga] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [emitindo, setEmitindo] = useState(false);
  const POR_PAGINA = 15;

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const params = { pagina, por_pagina: POR_PAGINA };
      if (filtroPaga !== '') params.paga = filtroPaga;
      if (filtroData) params.data = filtroData;
      const { data } = await api.get('/dams', { params });
      setDados(data.dados);
      setTotal(data.total);
    } catch { toast.error('Erro ao carregar DAMs'); }
    finally { setCarregando(false); }
  }, [pagina, filtroPaga, filtroData]);

  useEffect(() => { carregar(); }, [carregar]);

  const emitirLote = async () => {
    setEmitindo(true);
    try {
      const { data } = await api.post('/dams/lote-dia');
      toast.success(data.mensagem);
      carregar();
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao emitir lote');
    } finally {
      setEmitindo(false);
    }
  };

  const registrarPagamento = async (id) => {
    if (!confirm('Confirmar registro de pagamento?')) return;
    try {
      const { data } = await api.patch(`/dams/${id}/pagamento`);
      toast.success(data.mensagem);
      carregar();
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao registrar pagamento');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">DAMs — Documentos de Arrecadação</h1>
        <button onClick={emitirLote} className="btn-primary text-sm" disabled={emitindo}>
          {emitindo ? '...' : '⚡ Emitir lote do dia'}
        </button>
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <input type="date" className="input w-auto" value={filtroData}
          onChange={e => { setFiltroData(e.target.value); setPagina(1); }} />
        <select className="input w-auto" value={filtroPaga}
          onChange={e => { setFiltroPaga(e.target.value); setPagina(1); }}>
          <option value="">Todos</option>
          <option value="false">Pendentes</option>
          <option value="true">Pagos</option>
        </select>
      </div>

      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              {['Nº DAM', 'Placa', 'Tipo', 'Chegada', 'Valor', 'Vencimento', 'Linha Digitável', 'Status', 'Ações'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {carregando ? (
              <tr><td colSpan={9} className="text-center py-8 text-gray-400">Carregando...</td></tr>
            ) : dados.map(d => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-bold text-petrol-600">{d.numero}</td>
                <td className="px-4 py-3 font-mono font-bold">{d.placa}</td>
                <td className="px-4 py-3 text-xs">{d.tipo}</td>
                <td className="px-4 py-3">{format(parseISO(d.dia_chegada), 'dd/MM/yyyy')}</td>
                <td className="px-4 py-3 font-medium">R$ {parseFloat(d.valor).toFixed(2)}</td>
                <td className="px-4 py-3">{format(parseISO(d.vencimento), 'dd/MM/yyyy')}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-xs truncate">{d.linha_digitavel}</td>
                <td className="px-4 py-3">
                  {d.paga
                    ? <span className="badge-green">✓ Pago {d.data_pagamento && format(parseISO(d.data_pagamento), 'dd/MM')}</span>
                    : <span className="badge-amber">⏳ Pendente</span>}
                </td>
                <td className="px-4 py-3">
                  {!d.paga && (
                    <button onClick={() => registrarPagamento(d.id)}
                      className="text-xs text-green-600 hover:underline font-medium">
                      Registrar pagamento
                    </button>
                  )}
                  {d.paga && d.codigo_verificacao && (
                    <span className="text-xs text-gray-400 font-mono">{d.codigo_verificacao}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {total > POR_PAGINA && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-600">
            <span>{total} registros</span>
            <div className="flex gap-2">
              <button className="btn-secondary py-1 px-3 text-xs" disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}>← Anterior</button>
              <span className="py-1 px-3">{pagina}/{Math.ceil(total / POR_PAGINA)}</span>
              <button className="btn-secondary py-1 px-3 text-xs" disabled={pagina * POR_PAGINA >= total} onClick={() => setPagina(p => p + 1)}>Próxima →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
