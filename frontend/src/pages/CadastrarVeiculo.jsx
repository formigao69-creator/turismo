import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const TIPOS = ['Carro/Receptivo', 'Van', 'Micro-ônibus', 'Ônibus'];

export default function CadastrarVeiculo() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    placa: '', tipo: 'Van', proprietario: '', documento: '', contato: '', email: '',
  });
  const [carregando, setCarregando] = useState(false);

  const set = (campo, val) => setForm(f => ({ ...f, [campo]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    try {
      const { data } = await api.post('/veiculos', { ...form, placa: form.placa.toUpperCase() });
      toast.success(data.mensagem);
      navigate('/veiculos');
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao cadastrar veículo');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Cadastrar Veículo</h1>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Placa (padrão Mercosul) *</label>
              <input className="input uppercase tracking-widest font-bold" maxLength={7}
                value={form.placa} onChange={e => set('placa', e.target.value.toUpperCase())}
                required pattern="[A-Z]{3}[0-9][A-Z0-9][0-9]{2}"
                placeholder="ABC1D23" title="Formato: ABC1D23" />
            </div>
            <div>
              <label className="label">Tipo de veículo *</label>
              <select className="input" value={form.tipo} onChange={e => set('tipo', e.target.value)} required>
                {TIPOS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Proprietário / Razão Social *</label>
            <input className="input" value={form.proprietario} onChange={e => set('proprietario', e.target.value)} required />
          </div>

          <div>
            <label className="label">CPF / CNPJ *</label>
            <input className="input" value={form.documento} onChange={e => set('documento', e.target.value)} required
              placeholder="000.000.000-00 ou 00.000.000/0001-00" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Telefone de contato</label>
              <input className="input" type="tel" value={form.contato} onChange={e => set('contato', e.target.value)}
                placeholder="(27) 99999-0000" />
            </div>
            <div>
              <label className="label">E-mail (para envio do DAM)</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="contato@empresa.com.br" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={carregando}>
              {carregando ? 'Cadastrando...' : 'Cadastrar e gerar Cadastur'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/veiculos')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
