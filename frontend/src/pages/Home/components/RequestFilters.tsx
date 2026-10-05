import { useState } from 'react';
import type { Categoria, RequestFilters as Filters } from '../../../services/types';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'ABERTO', label: 'Aberto' },
  { value: 'EM_ATENDIMENTO', label: 'Em Atendimento' },
  { value: 'CONCLUIDO', label: 'Concluído' },
];

type Props = {
  categorias: Categoria[];
  filters: Filters;
  onChange: (filters: Filters) => void;
};

const RequestFilters = ({ categorias, filters, onChange }: Props) => {
  // texto fica local e só é aplicado no buscar, pra não disparar request a cada tecla
  const [texto, setTexto] = useState(filters.texto || '');

  const handleTextoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({ ...filters, texto });
  };

  return (
    <div className="filters-bar">
      <form className="filter-field grow" onSubmit={handleTextoSubmit}>
        <label htmlFor="filtro-texto">Título</label>
        <input
          id="filtro-texto"
          type="text"
          placeholder="Buscar por título..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
      </form>

      <div className="filter-field">
        <label htmlFor="filtro-categoria">Categoria</label>
        <select
          id="filtro-categoria"
          value={filters.categoria || ''}
          onChange={(e) => onChange({ ...filters, categoria: e.target.value || undefined })}
        >
          <option value="">Todas</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filtro-status">Status</label>
        <select
          id="filtro-status"
          value={filters.status || ''}
          onChange={(e) => onChange({ ...filters, status: e.target.value || undefined })}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filtro-inicio">De</label>
        <input
          id="filtro-inicio"
          type="date"
          value={filters.dataInicio || ''}
          onChange={(e) => onChange({ ...filters, dataInicio: e.target.value || undefined })}
        />
      </div>

      <div className="filter-field">
        <label htmlFor="filtro-fim">Até</label>
        <input
          id="filtro-fim"
          type="date"
          value={filters.dataFim || ''}
          onChange={(e) => onChange({ ...filters, dataFim: e.target.value || undefined })}
        />
      </div>

      <button
        type="button"
        className="btn btn-primary"
        onClick={() => onChange({ ...filters, texto })}
      >
        Buscar
      </button>

      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => {
          setTexto('');
          onChange({});
        }}
      >
        Limpar filtros
      </button>
    </div>
  );
};

export default RequestFilters;
