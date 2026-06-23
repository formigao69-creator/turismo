import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function Indicador({ label, ok, motivo }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <span className={`text-2xl ${ok ? 'text-green-500' : 'text-red-500'}`}>{ok ? '✓' : '✗'}</span>
      <div>
        <p className={`font-medium ${ok ? 'text-green-800' : 'text-red-800'}`}>{label}</p>
        {!ok && motivo && <p className="text-sm text-red-600">{motivo}</p>}
      </div>
    </div>
  );
}

export default function Fiscalizacao() {
  const { temPerfil } = useAuth();
  const [placa, setPlaca] = useState('');
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [autuacao, setAutuacao] = useState({ aberto: false, motivo: '' });

  const consultar = async (e) => {
    e.preventDefault();
    const p = placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!p) return;
    setCarregando(true);
    setResultado(null);
    try {
      const { data } = await api.get(`/fiscalizacao/placa/${p}`);
      setResultado(data);
      setAutuacao({ aberto: false, motivo: '' });
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao consultar');
    } finally {
      setCarregando(false);
    }
  };

  const registrarAutuacao = async () => {
    if (!autuacao.motivo.trim()) return toast.error('Informe o motivo da autuação');
    try {
      await api.post('/fiscalizacao/autuacao', {
        placa: placa.toUpperCase().replace(/[^A-Z0-9]/g, ''),
        motivo: autuacao.motivo,
      });
      toast.success('Autuação registrada');
      setAutuacao({ aberto: false, motivo: '' });
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao registrar autuação');
    }
  };

  // Gera motivo automático
  const motivoAuto = () => {
    if (!resultado) return '';
    const motivos = [];
    if (!resultado.indicadores.cadastur.ok) motivos.push(resultado.indicadores.cadastur.motivo);
    if (!resultado.indicadores.autorizacao.ok) motivos.push(resultado.indicadores.autorizacao.motivo);
    if (!resultado.indicadores.pagamento.ok) motivos.push(resultado.indicadores.pagamento.motivo);
    return motivos.join('; ');
  };

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Fiscalização em Campo</h1>

      <div className="card">
        <form onSubmit={consultar} className="flex gap-3">
          <input
            className="input flex-1 text-2xl font-black uppercase tracking-widest text-center"
            placeholder="ABC1D23"
            maxLength={7}
            value={placa}
            onChange={e => setPlaca(e.target.value.toUpperCase())}
            aria-label="Placa do veículo"
          />
          <button type="submit" className="btn-primary text-lg px-6" disabled={carregando}>
            {carregando ? '...' : 'Consultar'}
          </button>
        </form>
      </div>

      {resultado && (
        <>
          {/* Veredito */}
          <div className={`card text-center py-6 border-2 ${resultado.regular ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}>
            <p className={`text-3xl font-black ${resultado.regular ? 'text-green-700' : 'text-red-700'}`}>
              {resultado.regular ? '✓ ENTRADA LIBERADA' : '✗ ENTRADA BLOQUEADA'}
            </p>
            <p className="font-mono text-2xl font-bold mt-2">{resultado.placa}</p>
            {resultado.veiculo && (
              <p className="text-gray-600 text-sm mt-2">
                {resultado.veiculo.tipo} · Cadastur: {resultado.veiculo.cadastur}
              </p>
            )}
          </div>

          {/* Indicadores */}
          <div className="card space-y-3">
            <h2 className="font-semibold text-gray-700">Verificação detalhada</h2>
            <Indicador
              label="Cadastur Municipal vigente"
              ok={resultado.indicadores.cadastur.ok}
              motivo={resultado.indicadores.cadastur.motivo}
            />
            <Indicador
              label="Autorização de entrada ativa"
              ok={resultado.indicadores.autorizacao.ok}
              motivo={resultado.indicadores.autorizacao.motivo}
            />
            <Indicador
              label="DAM — Pagamento confirmado"
              ok={resultado.indicadores.pagamento.ok}
              motivo={resultado.indicadores.pagamento.motivo}
            />
          </div>

          {/* Autuações anteriores */}
          {resultado.autuacoes_recentes?.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-700 mb-3">Autuações recentes</h2>
              <ul className="space-y-2 text-sm">
                {resultado.autuacoes_recentes.map(at => (
                  <li key={at.id} className="bg-amber-50 border border-amber-200 rounded p-2">
                    <span className="font-medium">{at.data}</span> · {at.motivo}
                    <span className="text-gray-500 ml-2">— {at.agente_nome}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Autuação */}
          {temPerfil('SEMSET_FISCALIZACAO', 'ADMIN') && !resultado.regular && (
            <div className="card border-red-200">
              {!autuacao.aberto ? (
                <button
                  onClick={() => setAutuacao({ aberto: true, motivo: motivoAuto() })}
                  className="btn-danger w-full justify-center">
                  Registrar Autuação
                </button>
              ) : (
                <div className="space-y-3">
                  <h2 className="font-semibold text-red-700">Registrar Autuação</h2>
                  <div>
                    <label className="label">Motivo *</label>
                    <textarea className="input" rows={3}
                      value={autuacao.motivo}
                      onChange={e => setAutuacao(a => ({ ...a, motivo: e.target.value }))} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={registrarAutuacao} className="btn-danger">Confirmar autuação</button>
                    <button onClick={() => setAutuacao({ aberto: false, motivo: '' })} className="btn-secondary">Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
