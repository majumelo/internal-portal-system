import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, ApiError } from '../../services/api';
import type {
  Categoria,
  Dashboard,
  RequestFilters as Filters,
  Solicitacao,
  Status,
  Usuario,
} from '../../services/types';
import DashboardCards from './components/DashboardCards';
import RequestFilters from './components/RequestFilters';
import RequestTable from './components/RequestTable';
import RequestFormModal, { type RequestFormData } from './components/RequestFormModal';
import RequestDetailModal from './components/RequestDetailModal';
import './Home.css';

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit'; solicitacao: Solicitacao }
  | { mode: 'detail'; solicitacao: Solicitacao }
  | null;

function buildQuery(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.categoria) params.set('categoria', filters.categoria);
  if (filters.status) params.set('status', filters.status);
  if (filters.dataInicio) params.set('dataInicio', filters.dataInicio);
  if (filters.dataFim) params.set('dataFim', filters.dataFim);
  if (filters.texto) params.set('texto', filters.texto);
  const query = params.toString();
  return query ? `?${query}` : '';
}

const Home = () => {
  const navigate = useNavigate();
  const [usuario] = useState<Usuario | null>(() => {
    const raw = localStorage.getItem('usuario');
    return raw ? JSON.parse(raw) : null;
  });

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [loadingLista, setLoadingLista] = useState(true);
  const [modal, setModal] = useState<ModalState>(null);
  const [erroLista, setErroLista] = useState('');

  // token expirado ou inválido: limpa a sessão e volta pro login
  const handleAuthError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/');
        return true;
      }
      return false;
    },
    [navigate]
  );

  const loadDashboard = useCallback(async () => {
    try {
      const data = await apiFetch<Dashboard>('/api/request/dashboard');
      setDashboard(data);
    } catch (error) {
      handleAuthError(error);
    }
  }, [handleAuthError]);

  const loadSolicitacoes = useCallback(async () => {
    setLoadingLista(true);
    setErroLista('');
    try {
      const data = await apiFetch<Solicitacao[]>(`/api/request${buildQuery(filters)}`);
      setSolicitacoes(data);
    } catch (error) {
      if (!handleAuthError(error)) {
        setErroLista(
          error instanceof ApiError && error.status === 400
            ? error.message
            : 'Não foi possível carregar as solicitações.'
        );
      }
    } finally {
      setLoadingLista(false);
    }
  }, [filters, handleAuthError]);

  useEffect(() => {
    apiFetch<Categoria[]>('/api/category')
      .then(setCategorias)
      .catch(handleAuthError);
    loadDashboard();
  }, [handleAuthError, loadDashboard]);

  useEffect(() => {
    loadSolicitacoes();
  }, [loadSolicitacoes]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  // trata o 401 e repassa o erro pro modal exibir a mensagem
  async function withAuth<T>(request: Promise<T>): Promise<T> {
    try {
      return await request;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  }

  const handleCreate = async (data: RequestFormData) => {
    await withAuth(apiFetch('/api/request', { method: 'POST', body: JSON.stringify(data) }));
    setModal(null);
    await Promise.all([loadSolicitacoes(), loadDashboard()]);
  };

  const handleEdit = async (id: number, data: RequestFormData) => {
    await withAuth(apiFetch(`/api/request/${id}`, { method: 'PUT', body: JSON.stringify(data) }));
    setModal(null);
    await loadSolicitacoes();
  };

  const handleDelete = async (solicitacao: Solicitacao) => {
    if (!confirm(`Excluir a solicitação #${solicitacao.id} — "${solicitacao.titulo}"?`)) return;
    try {
      await apiFetch(`/api/request/${solicitacao.id}`, { method: 'DELETE' });
      await Promise.all([loadSolicitacoes(), loadDashboard()]);
    } catch (error) {
      if (!handleAuthError(error)) {
        alert(error instanceof Error ? error.message : 'Erro ao excluir solicitação.');
      }
    }
  };

  const handleChangeStatus = async (id: number, status: Status, observacao: string) => {
    const atualizada = await withAuth(
      apiFetch<Solicitacao>(`/api/request/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, observacao: observacao || undefined }),
      })
    );
    setModal({ mode: 'detail', solicitacao: atualizada });
    await Promise.all([loadSolicitacoes(), loadDashboard()]);
  };

  return (
    <div id="home-page">
      <header className="home-header">
        <h1>Portal de Solicitações Internas</h1>
        <div className="home-user">
          {usuario && <span>{usuario.nome}</span>}
          <button className="btn-link" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      <main className="home-content">
        <DashboardCards dashboard={dashboard} />

        <RequestFilters categorias={categorias} filters={filters} onChange={setFilters} />

        <section className="requests-panel">
          <div className="panel-header">
            <h2>Solicitações</h2>
            <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
              Nova solicitação
            </button>
          </div>
          {erroLista ? (
            <div className="empty-state">{erroLista}</div>
          ) : (
            <RequestTable
              solicitacoes={solicitacoes}
              currentUserId={usuario?.id ?? -1}
              loading={loadingLista}
              onView={(solicitacao) => setModal({ mode: 'detail', solicitacao })}
              onEdit={(solicitacao) => setModal({ mode: 'edit', solicitacao })}
              onDelete={handleDelete}
            />
          )}
        </section>
      </main>

      {modal?.mode === 'create' && (
        <RequestFormModal
          categorias={categorias}
          onClose={() => setModal(null)}
          onSubmit={handleCreate}
        />
      )}

      {modal?.mode === 'edit' && (
        <RequestFormModal
          categorias={categorias}
          initial={modal.solicitacao}
          onClose={() => setModal(null)}
          onSubmit={(data) => handleEdit(modal.solicitacao.id, data)}
        />
      )}

      {modal?.mode === 'detail' && (
        <RequestDetailModal
          solicitacao={modal.solicitacao}
          canChangeStatus={usuario?.perfil === 'ATENDENTE'}
          onClose={() => setModal(null)}
          onChangeStatus={handleChangeStatus}
        />
      )}
    </div>
  );
};

export default Home;
