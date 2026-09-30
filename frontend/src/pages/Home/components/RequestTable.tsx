import type { Solicitacao } from '../../../services/types';
import { formatDate, statusLabel } from '../../../services/format';

type Props = {
  solicitacoes: Solicitacao[];
  currentUserId: number;
  loading: boolean;
  onView: (solicitacao: Solicitacao) => void;
  onEdit: (solicitacao: Solicitacao) => void;
  onDelete: (solicitacao: Solicitacao) => void;
};

const RequestTable = ({ solicitacoes, currentUserId, loading, onView, onEdit, onDelete }: Props) => {
  if (loading) {
    return <div className="empty-state">Carregando solicitações...</div>;
  }

  if (solicitacoes.length === 0) {
    return <div className="empty-state">Nenhuma solicitação encontrada.</div>;
  }

  return (
    <table className="requests-table">
      <thead>
        <tr>
          <th>Código</th>
          <th>Título</th>
          <th>Categoria</th>
          <th>Solicitante</th>
          <th>Data de abertura</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {solicitacoes.map((solicitacao) => {
          const isOwnerAndOpen =
            solicitacao.solicitanteId === currentUserId && solicitacao.status === 'ABERTO';
          return (
            <tr key={solicitacao.id}>
              <td>#{solicitacao.id}</td>
              <td>{solicitacao.titulo}</td>
              <td>{solicitacao.categoria.nome}</td>
              <td>{solicitacao.solicitante.nome}</td>
              <td>{formatDate(solicitacao.criadoEm)}</td>
              <td>
                <span className="status-badge" data-status={solicitacao.status}>
                  {statusLabel(solicitacao.status)}
                </span>
              </td>
              <td>
                <div className="row-actions">
                  <button className="btn btn-secondary" onClick={() => onView(solicitacao)}>
                    Detalhes
                  </button>
                  {isOwnerAndOpen && (
                    <>
                      <button className="btn btn-secondary" onClick={() => onEdit(solicitacao)}>
                        Editar
                      </button>
                      <button className="btn btn-danger" onClick={() => onDelete(solicitacao)}>
                        Excluir
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default RequestTable;
