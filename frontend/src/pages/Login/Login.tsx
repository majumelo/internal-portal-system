import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';
import './Login.css';

type Mensagem = { texto: string; tipo: 'aviso' | 'erro' } | null;

const Login = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mensagem, setMensagem] = useState<Mensagem>(null);
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  const sendRequest = async (e: any) => {
    e.preventDefault();
    setMensagem(null);

    if (!name || !password) {
      setMensagem({ texto: 'Preencha todos os campos para continuar.', tipo: 'aviso' });
      return;
    }

    setEnviando(true);
    try {
      const result = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: name, senha: password }),
      });

      const json = await result.json().catch(() => null);

      if (!result.ok) {
        setMensagem({ texto: json?.message || 'Usuário ou senha incorretos.', tipo: 'erro' });
        return;
      }

      localStorage.setItem('token', json.token);
      localStorage.setItem('usuario', JSON.stringify(json.usuario));
      navigate('/home');
    } catch {
      setMensagem({ texto: 'Não foi possível conectar ao servidor.', tipo: 'erro' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div id="login-page">
      <aside className="login-brand">
        <div className="brand-mark" aria-hidden="true"></div>
        <h1>Portal de Solicitações Internas</h1>
        <p>Registre suas demandas e acompanhe cada etapa até a conclusão.</p>

      </aside>

      <div id="login-container">
        <div className="login-header">
          <h2>Entrar</h2>
          <p>Use seu usuário e senha de colaborador.</p>
        </div>

        {mensagem && (
          <div className={`login-alert login-alert-${mensagem.tipo}`} role="alert">
            {mensagem.texto}
          </div>
        )}

        <form id="login-form-container" onSubmit={sendRequest} noValidate>
          <label className="field">
            <input
              type="text" id="username" placeholder="Usuário"
              value={name} onChange={(e) => setName(e.target.value)} autoComplete="username"
              aria-label="Usuário"
            />
          </label>

          <label className="field">
            <input
              type={showPassword ? 'text' : 'password'} id="password" placeholder="Senha"
              value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
              aria-label="Senha"
            />
            <button
              type="button" className="toggle-visibility"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            />
          </label>

          <button type="submit" className="login-button" disabled={enviando}>
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
