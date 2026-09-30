import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const logado = Boolean(localStorage.getItem('token'));

  return (
    <main id="not-found-page">
      <p className="not-found-code">404</p>
      <h1>Página não encontrada</h1>
      <p>O endereço acessado não existe no portal.</p>
      <Link to={logado ? '/home' : '/'} className="not-found-link">
        {logado ? 'Voltar para as solicitações' : 'Ir para o login'}
      </Link>
    </main>
  );
};

export default NotFound;
