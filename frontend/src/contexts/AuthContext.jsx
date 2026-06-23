import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const s = localStorage.getItem('ssvetur_usuario');
    return s ? JSON.parse(s) : null;
  });

  const login = useCallback(async (email, senha, tokenTotp) => {
    const { data } = await api.post('/auth/login', { email, senha, token_totp: tokenTotp });
    if (data.requer_totp) return { requer_totp: true };
    localStorage.setItem('ssvetur_token', data.token);
    localStorage.setItem('ssvetur_usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ssvetur_token');
    localStorage.removeItem('ssvetur_usuario');
    setUsuario(null);
  }, []);

  const temPerfil = useCallback((...perfis) => perfis.includes(usuario?.perfil), [usuario]);

  return (
    <AuthContext.Provider value={{ usuario, login, logout, temPerfil }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
};
