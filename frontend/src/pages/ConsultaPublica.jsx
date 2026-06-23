import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

function PlacaMercosul({ placa }) {
  // Formata placa no estilo visual Mercosul (ABC1D23)
  const parte1 = placa.slice(0, 3);
  const parte2 = placa.slice(3);
  return (
    <div className="inline-block border-2 border-gray-800 rounded-lg overflow-hidden shadow-lg select-none">
      <div className="bg-petrol-600 text-white text-center text-xs font-bold py-1 px-4 tracking-widest">
        BRASIL
      </div>
      <div className="bg-white px-8 py-3 flex items-baseline gap-1 justify-center">
        <span className="text-4xl font-black tracking-wider text-gray-900">{parte1}</span>
        <span className="text-4xl font-black tracking-wider text-petrol-600">{parte2}</span>
      </div>
    </div>
  );
}

function Indicador({ label, ok, motivo }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <span className={`text-xl ${ok ? 'text-green-500' : 'text-red-500'}`}>{ok ? '✓' : '✗'}</span>
      <div>
        <p className={`text-sm font-medium ${ok ? 'text-green-800' : 'text-red-800'}`}>{label}</p>
        {!ok && motivo && <p className="text-xs text-red-600 mt-0.5">{motivo}</p>}
      </div>
    </div>
  );
}

export default function ConsultaPublica() {
  const [email, setEmail] = useState(() => localStorage.getItem('ssvetur_pub_email') || '');
  const [cadastrado, setCadastrado] = useState(!!localStorage.getItem('ssvetur_pub_email'));
  const [placa, setPlaca] = useState('');
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const cadastrar = async (e) => {
    e.preventDefault();
    try {
      await api.post('/publico/cadastro', { email });
      localStorage.setItem('ssvetur_pub_email', email);
      setCadastrado(true);
      toast.success('Cadastro realizado!');
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro no cadastro');
    }
  };

  const consultar = async (e) => {
    e.preventDefault();
    if (!placa.trim()) return;
    setCarregando(true);
    setResultado(null);
    try {
      const { data } = await api.get('/publico/consulta', {
        params: { placa: placa.toUpperCase().replace(/[^A-Z0-9]/g, ''), email },
      });
      setResultado(data);
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao consultar placa');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-petrol-600">
      {/* Header */}
      <header className="max-w-2xl mx-auto px-4 pt-8 pb-4 text-center">
        <h1 className="text-2xl font-bold text-white">Consulta de Veículos de Turismo</h1>
        <p className="text-petrol-200 text-sm mt-1">Prefeitura de Guarapari — Secretaria de Turismo</p>
      </header>

      <div className="max-w-lg mx-auto px-4 pb-12 space-y-4">
        {/* Cadastro público */}
        {!cadastrado && (
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-3">Acesso à Consulta</h2>
            <p className="text-sm text-gray-600 mb-4">Informe seu e-mail para acessar a consulta de regularidade de veículos.</p>
            <form onSubmit={cadastrar} className="flex gap-2">
              <input type="email" className="input flex-1" placeholder="seu@email.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
              <button type="submit" className="btn-primary whitespace-nowrap">Acessar</button>
            </form>
          </div>
        )}

        {/* Consulta por placa */}
        {cadastrado && (
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">Consultar Placa</h2>
            <form onSubmit={consultar} className="flex gap-2">
              <input
                type="text"
                className="input flex-1 uppercase text-lg tracking-widest font-bold"
                placeholder="ABC1D23"
                maxLength={7}
                value={placa}
                onChange={e => setPlaca(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                required
                aria-label="Placa do veículo"
              />
              <button type="submit" className="btn-primary whitespace-nowrap" disabled={carregando}>
                {carregando ? '...' : 'Consultar'}
              </button>
            </form>
          </div>
        )}

        {/* Resultado */}
        {resultado && (
          <div className="card space-y-4">
            <div className="flex justify-center">
              <PlacaMercosul placa={resultado.placa} />
            </div>

            <div className={`text-center py-4 rounded-xl ${resultado.regular ? 'bg-green-600' : 'bg-red-600'}`}>
              <p className="text-white text-2xl font-black">
                {resultado.regular ? '✓ ENTRADA LIBERADA' : '✗ IRREGULAR'}
              </p>
              <p className="text-white text-opacity-90 text-sm mt-1">
                Situação: <strong>{resultado.situacao}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Indicador
                label="Cadastur Municipal vigente"
                ok={resultado.indicadores.cadastur_vigente}
              />
              <Indicador
                label="Autorização de entrada ativa"
                ok={resultado.indicadores.autorizacao_ativa}
              />
              <Indicador
                label="Pagamento do DAM confirmado"
                ok={resultado.indicadores.pagamento_ok}
              />
            </div>

            <p className="text-xs text-gray-400 text-center">
              Consulta realizada em {new Date().toLocaleString('pt-BR')}
            </p>
          </div>
        )}

        <div className="text-center">
          <a href="/login" className="text-petrol-200 text-sm hover:text-white">
            Acesso de servidores →
          </a>
        </div>
      </div>
    </div>
  );
}
