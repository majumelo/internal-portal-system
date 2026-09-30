import { useEffect, useState } from 'react';
import type { HistoricoStatus, Solicitacao, Status } from '../../../services/types';
import { apiFetch } from '../../../services/api';
import { formatDateTime, statusLabel } from '../../../services/format';

// Mesmo fluxo validado no backend: Aberto → Em Atendimento → Concluído (final)
const PROXIMO_STATUS: Partial<Record<Status, Status>> = {
  ABERTO: 'EM_ATENDIMENTO',
  EM_ATENDIMENTO: 'CONCLUIDO',
};

type Props = {
  solicitacao: Solicitacao;
  canChangeStatus: boolean;
  onClose: () => void;
  onChangeStatus: (id: number, status: Status, observacao: string) => Promise<void>;
};

const RequestDetailModal = ({ solicitacao, canChangeStatus, onClose, onChangeStatus }: Props) => {
  const [historico, setHistorico] = useState<HistoricoStatus[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(true);
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const proximoStatus = PROXIMO_STATUS[solicitacao.status];

  useEffect(() => {
    let ativo = true;
    setCarregandoHistorico(true);
    apiFetch<HistoricoStatus[]>(`/api/history/${solicitacao.id}`)
      .then((data) => {
        if (ativo) setHistorico(data);
      })
      .catch(() => {
        if (ativo) setHistorico([]);
      })
      .finally(() => {
        if (ativo) setCarregandoHistorico(false);
      });
    return () => {
      ativo = false;
    };
  }, [solicitacao.id, solicitacao.status]);

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proximoStatus) return;
    setErro('');
    setEnviando(true);
    try {
      await onChangeStatus(solicitacao.id, proximoStatus, observacao.trim());
      setObservacao('');
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao alterar status.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>#{solicitacao.id} — {solicitacao.titulo}</h2>

        <dl className="detail-meta">
          <div>
            <dt>Categoria</dt>
            <dd>{solicitacao.categoria.nome}</dd>
          </div>
          <div>
            <dt>Solicitante</dt>
            <dd>{solicitacao.solicitante.nome}</dd>
          </div>
          <div>
            <dt>Status atual</dt>
            <dd>
              <span className="status-badge" data-status={solicitacao.status}>
                {statusLabel(solicitacao.status)}
              </span>
            </dd>
          </div>
          <div>
            <dt>Aberta em</dt>
            <dd>{formatDateTime(solicitacao.criadoEm)}</dd>
          </div>
        </dl>

        <p className="detail-description">{solicitacao.descricao}</p>

        {erro && <div className="form-error">{erro}</div>}

        {canChangeStatus && proximoStatus ? (
          <form onSubmit={handleStatusSubmit}>
            <label className="form-field">
              Observação (opcional)
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                rows={2}
                maxLength={500}
              />
            </label>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Fechar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={enviando}
              >
                {enviando ? 'Atualizando...' : `Mover para ${statusLabel(proximoStatus)}`}
              </button>
            </div>
          </form>
        ) : (
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Fechar
            </button>
          </div>
        )}

        <h2 style={{ fontSize: '1rem', marginTop: '1.5rem' }}>Histórico</h2>
        {carregandoHistorico ? (
          <p className="detail-description">Carregando histórico...</p>
        ) : historico.length === 0 ? (
          <p className="detail-description">Nenhuma alteração de status registrada ainda.</p>
        ) : (
          <ul className="timeline">
            {historico.map((item) => (
              <li key={item.id}>
                <div className="timeline-status">
                  {item.statusAnterior ? `${statusLabel(item.statusAnterior)} → ` : ''}
                  {statusLabel(item.statusNovo)}
                </div>
                <div className="timeline-meta">
                  {item.usuario.nome} em {formatDateTime(item.alteradoEm)}
                  {item.observacao ? ` — ${item.observacao}` : ''}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RequestDetailModal;
