import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const TIPOS = ['Carro/Receptivo', 'Van', 'Micro-ônibus', 'Ônibus'];
const PERFIS = [
  { value: 'SEMTUR', label: 'SEMTUR' },
  { value: 'SEMSET_AUTORIZACAO', label: 'SEMSET — Autorização' },
  { value: 'SEMSET_FISCALIZACAO', label: 'SEMSET — Fiscalização' },
  { value: 'FAZENDA', label: 'Secretaria da Fazenda' },
  { value: 'ADMIN', label: 'Administrador' },
];

function SecaoUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ nome: '', email: '', perfil: 'SEMTUR', senha: '' });
  const [criando, setCriando] = useState(false);

  useEffect(() => {
    api.get('/admin/usuarios').then(r => setUsuarios(r.data));
  }, []);

  const criarUsuario = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/admin/usuarios', form);
      toast.success(data.mensagem);
      setForm({ nome: '', email: '', perfil: 'SEMTUR', senha: '' });
      setCriando(false);
      const r = await api.get('/admin/usuarios');
      setUsuarios(r.data);
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao criar usuário');
    }
  };

  const toggle = async (id) => {
    try {
      const { data } = await api.patch(`/admin/usuarios/${id}/toggle`);
      setUsuarios(u => u.map(x => x.id === id ? { ...x, ativo: data.ativo } : x));
      toast.success(`Usuário ${data.ativo ? 'ativado' : 'desativado'}`);
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Usuários do Sistema</h2>
        <button className="btn-primary text-sm" onClick={() => setCriando(!criando)}>+ Novo usuário</button>
      </div>

      {criando && (
        <div className="card border-petrol-200">
          <h3 className="font-medium mb-4">Criar usuário</h3>
          <form onSubmit={criarUsuario} className="grid grid-cols-2 gap-4">
            <div><label className="label">Nome</label><input className="input" required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></div>
            <div><label className="label">E-mail</label><input className="input" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div>
              <label className="label">Perfil</label>
              <select className="input" value={form.perfil} onChange={e => setForm(f => ({ ...f, perfil: e.target.value }))}>
                {PERFIS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div><label className="label">Senha inicial (mín. 8 chars)</label><input className="input" type="password" minLength={8} required value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} /></div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">Criar</button>
              <button type="button" className="btn-secondary" onClick={() => setCriando(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
            <tr>{['Nome', 'E-mail', 'Perfil', 'Último acesso', 'Status', 'Ação'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {usuarios.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.nome}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3"><span className="badge-gray">{PERFIS.find(p => p.value === u.perfil)?.label || u.perfil}</span></td>
                <td className="px-4 py-3 text-gray-400 text-xs">{u.ultimo_acesso ? new Date(u.ultimo_acesso).toLocaleString('pt-BR') : '—'}</td>
                <td className="px-4 py-3"><span className={u.ativo ? 'badge-green' : 'badge-red'}>{u.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td className="px-4 py-3"><button onClick={() => toggle(u.id)} className={`text-xs hover:underline ${u.ativo ? 'text-red-600' : 'text-green-600'}`}>{u.ativo ? 'Desativar' : 'Ativar'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SecaoPrecos() {
  const [precos, setPrecos] = useState([]);
  const [editando, setEditando] = useState({});

  useEffect(() => {
    api.get('/admin/precos').then(r => setPrecos(r.data));
  }, []);

  const salvar = async (tipo) => {
    const valor = editando[tipo];
    if (!valor) return;
    try {
      await api.post('/admin/precos', { tipo_veiculo: tipo, valor: parseFloat(valor) });
      toast.success(`Preço de ${tipo} atualizado`);
      const r = await api.get('/admin/precos');
      setPrecos(r.data);
      setEditando(e => ({ ...e, [tipo]: undefined }));
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro');
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Tabela de Preços por Tipo de Veículo</h2>
      <p className="text-sm text-gray-500">Os valores abaixo são de exemplo. Ajuste conforme base legal municipal.</p>
      <div className="card p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
            <tr><th className="px-4 py-3 text-left">Tipo</th><th className="px-4 py-3 text-left">Valor (R$)</th><th className="px-4 py-3">Ação</th></tr>
          </thead>
          <tbody className="divide-y">
            {TIPOS.map(tipo => {
              const preco = precos.find(p => p.tipo_veiculo === tipo);
              return (
                <tr key={tipo} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{tipo}</td>
                  <td className="px-4 py-3">
                    {editando[tipo] !== undefined ? (
                      <input type="number" step="0.01" className="input w-32" value={editando[tipo]}
                        onChange={e => setEditando(ed => ({ ...ed, [tipo]: e.target.value }))} />
                    ) : (
                      <span>{preco ? `R$ ${parseFloat(preco.valor).toFixed(2)}` : '—'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editando[tipo] !== undefined ? (
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => salvar(tipo)} className="text-xs text-green-600 hover:underline">Salvar</button>
                        <button onClick={() => setEditando(e => ({ ...e, [tipo]: undefined }))} className="text-xs text-gray-500 hover:underline">Cancelar</button>
                      </div>
                    ) : (
                      <button onClick={() => setEditando(e => ({ ...e, [tipo]: preco?.valor || '0' }))} className="text-xs text-petrol-600 hover:underline">Editar</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SecaoParametros() {
  const [params, setParams] = useState([]);
  const [editando, setEditando] = useState({});

  useEffect(() => {
    api.get('/admin/parametros').then(r => setParams(r.data));
  }, []);

  const salvar = async (chave) => {
    try {
      await api.put(`/admin/parametros/${chave}`, { valor: editando[chave] });
      toast.success('Parâmetro atualizado');
      const r = await api.get('/admin/parametros');
      setParams(r.data);
      setEditando(e => ({ ...e, [chave]: undefined }));
    } catch (err) {
      toast.error('Erro ao salvar');
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Parâmetros do Sistema</h2>
      <div className="card p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
            <tr><th className="px-4 py-3 text-left">Chave</th><th className="px-4 py-3 text-left">Valor</th><th className="px-4 py-3 text-left">Descrição</th><th className="px-4 py-3">Ação</th></tr>
          </thead>
          <tbody className="divide-y">
            {params.map(p => (
              <tr key={p.chave} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-petrol-700">{p.chave}</td>
                <td className="px-4 py-3">
                  {editando[p.chave] !== undefined ? (
                    <input className="input w-48" value={editando[p.chave]}
                      onChange={e => setEditando(ed => ({ ...ed, [p.chave]: e.target.value }))} />
                  ) : <span className="font-medium">{p.valor}</span>}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{p.descricao}</td>
                <td className="px-4 py-3 text-center">
                  {editando[p.chave] !== undefined ? (
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => salvar(p.chave)} className="text-xs text-green-600 hover:underline">Salvar</button>
                      <button onClick={() => setEditando(e => ({ ...e, [p.chave]: undefined }))} className="text-xs text-gray-500 hover:underline">Cancelar</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditando(e => ({ ...e, [p.chave]: p.valor }))} className="text-xs text-petrol-600 hover:underline">Editar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Administracao() {
  const [aba, setAba] = useState('usuarios');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Administração</h1>

      <div className="flex gap-1 border-b border-gray-200">
        {[['usuarios', 'Usuários'], ['precos', 'Tabela de Preços'], ['parametros', 'Parâmetros']].map(([id, label]) => (
          <button key={id} onClick={() => setAba(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              aba === id ? 'border-petrol-600 text-petrol-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {aba === 'usuarios' && <SecaoUsuarios />}
      {aba === 'precos' && <SecaoPrecos />}
      {aba === 'parametros' && <SecaoParametros />}
    </div>
  );
}
