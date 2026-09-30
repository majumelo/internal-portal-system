import { useState } from 'react';
import type { Categoria, Solicitacao } from '../../../services/types';

export type RequestFormData = {
  titulo: string;
  descricao: string;
  categoriaId: number;
};

type Props = {
  categorias: Categoria[];
  initial?: Solicitacao | null;
  onClose: () => void;
  onSubmit: (data: RequestFormData) => Promise<void>;
};

const RequestFormModal = ({ categorias, initial, onClose, onSubmit }: Props) => {
  const [titulo, setTitulo] = useState(initial?.titulo || '');
  const [descricao, setDescricao] = useState(initial?.descricao || '');
  const [categoriaId, setCategoriaId] = useState(initial?.categoriaId || categorias[0]?.id || 0);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (titulo.trim().length < 3) {
      setErro('Título deve ter pelo menos 3 caracteres.');
      return;
    }
    if (!descricao.trim()) {
      setErro('Descrição é obrigatória.');
      return;
    }
    if (!categoriaId) {
      setErro('Selecione uma categoria.');
      return;
    }

    setEnviando(true);
    try {
      await onSubmit({ titulo: titulo.trim(), descricao: descricao.trim(), categoriaId });
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao salvar solicitação.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>{initial ? 'Editar solicitação' : 'Nova solicitação'}</h2>

        {erro && <div className="form-error">{erro}</div>}

        <form onSubmit={handleSubmit}>
          <label className="form-field">
            Título
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={150}
              autoFocus
            />
          </label>

          <label className="form-field">
            Descrição
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
            />
          </label>

          <label className="form-field">
            Categoria
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(Number(e.target.value))}
            >
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={enviando}>
              {enviando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestFormModal;
