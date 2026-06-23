import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function LancarAutorizacao() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    cadastur: '', placa: '', dia_chegada: '', permanencia: 1,
    destino: '', cadastur_imovel: '', origem: 'Balcão',
  });
  const [validando, setValidando] = useState(false);
  const [veiculoInfo, setVeiculoInfo] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const set = (campo, val) => setForm(f => ({ ...f, [campo]: val }));

  const validarCadastur = async () => {
    if (!form.cadastur) return;
    setValidando(true);
    try {
      const { data } = await api.get(`/veiculos/${form.placa || form.cadastur}`);
      setVeiculoInfo(data);
      if (data.placa) set('placa', data.placa);
    } catch {
      setVeiculoInfo(null);
    } finally {
      setValidando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    try {
      await api.post('/autorizacoes', form);
      toast.success('Autorização lançada com sucesso!');
      navigate('/autorizacoes');
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao lançar autorização');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Lançar Autorização de Entrada</h1>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Cadastur Municipal *</label>
              <div className="flex gap-2">
                <input className="input font-mono uppercase" value={form.cadastur}
                  onChange={e => set('cadastur', e.target.value.toUpperCase())}
                  placeholder="CM-2026-0001" required />
                <button type="button" onClick={validarCadastur}
                  className="btn-secondary text-xs px-3 whitespace-nowrap">
                  {validando ? '...' : 'Verificar'}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Placa *</label>
              <input className="input font-mono uppercase tracking-widest font-bold"
                value={form.placa} onChange={e => set('placa', e.target.value.toUpperCase())}
                required maxLength={7} />
            </div>
          </div>

          {veiculoInfo && (
            <div className="bg-petrol-50 border border-petrol-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-petrol-800">Veículo encontrado:</p>
              <p className="text-petrol-700">{veiculoInfo.proprietario} · {veiculoInfo.tipo}</p>
              <p className="text-petrol-600 text-xs mt-1">
                Validade Cadastur: {new Date(veiculoInfo.validade_cadastur).toLocaleDateString('pt-BR')}
                {new Date(veiculoInfo.validade_cadastur) < new Date()
                  ? <span className="ml-2 badge-red">VENCIDO</span>
                  : <span className="ml-2 badge-green">VIGENTE</span>}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Data de chegada *</label>
              <input type="date" className="input" value={form.dia_chegada}
                onChange={e => set('dia_chegada', e.target.value)} required />
            </div>
            <div>
              <label className="label">Dias de permanência *</label>
              <input type="number" className="input" min={1} max={90}
                value={form.permanencia} onChange={e => set('permanencia', parseInt(e.target.value))} required />
            </div>
          </div>

          <div>
            <label className="label">Destino (hotel / imóvel)</label>
            <input className="input" value={form.destino} onChange={e => set('destino', e.target.value)}
              placeholder="Ex.: Hotel Costa Mar" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Cadastur do imóvel</label>
              <input className="input font-mono" value={form.cadastur_imovel}
                onChange={e => set('cadastur_imovel', e.target.value)} />
            </div>
            <div>
              <label className="label">Origem</label>
              <select className="input" value={form.origem} onChange={e => set('origem', e.target.value)}>
                <option value="Balcão">Balcão</option>
                <option value="Google Forms">Google Forms</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={carregando}>
              {carregando ? 'Lançando...' : 'Autorizar entrada'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/autorizacoes')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
