import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '', totp: '' });
  const [etapa, setEtapa] = useState('credenciais'); // 'credenciais' | 'totp'
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    try {
      const res = await login(form.email, form.senha, etapa === 'totp' ? form.totp : undefined);
      if (res.requer_totp) {
        setEtapa('totp');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao entrar no sistema');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-petrol-600 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">SisVetur</h1>
          <p className="text-petrol-200 mt-1">Sistema de Veículos de Turismo</p>
          <p className="text-petrol-300 text-sm mt-0.5">Prefeitura de Guarapari — ES</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            {etapa === 'totp' ? 'Verificação em dois fatores' : 'Acesso Restrito — Servidores'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {etapa === 'credenciais' && (
              <>
                <div>
                  <label className="label" htmlFor="email">E-mail institucional</label>
                  <input id="email" type="email" className="input" autoComplete="email"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required placeholder="usuario@guarapari.es.gov.br" />
                </div>
                <div>
                  <label className="label" htmlFor="senha">Senha</label>
                  <input id="senha" type="password" className="input" autoComplete="current-password"
                    value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                    required />
                </div>
              </>
            )}

            {etapa === 'totp' && (
              <div>
                <p className="text-sm text-gray-600 mb-4">Digite o código de 6 dígitos do seu aplicativo autenticador.</p>
                <label className="label" htmlFor="totp">Código de verificação</label>
                <input id="totp" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                  className="input text-center text-2xl tracking-widest"
                  value={form.totp} onChange={e => setForm(f => ({ ...f, totp: e.target.value }))}
                  autoFocus required />
              </div>
            )}

            <button type="submit" className="btn-primary w-full justify-center" disabled={carregando}>
              {carregando ? 'Aguarde...' : etapa === 'totp' ? 'Verificar' : 'Entrar'}
            </button>
          </form>

          {etapa === 'totp' && (
            <button className="mt-3 text-sm text-petrol-600 hover:underline w-full text-center"
              onClick={() => setEtapa('credenciais')}>
              ← Voltar ao login
            </button>
          )}
        </div>

        <div className="text-center mt-6">
          <a href="/consulta" className="text-petrol-200 text-sm hover:text-white">
            Consulta Pública de Veículos →
          </a>
        </div>
      </div>
    </div>
  );
}
