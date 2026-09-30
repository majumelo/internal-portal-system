export type Status = 'ABERTO' | 'EM_ATENDIMENTO' | 'CONCLUIDO';

export type Usuario = {
  id: number;
  nome: string;
  login: string;
  perfil: string;
};

export type Categoria = {
  id: number;
  nome: string;
  ativo: boolean;
};

export type Solicitacao = {
  id: number;
  titulo: string;
  descricao: string;
  status: Status;
  criadoEm: string;
  atualizadoEm: string;
  categoriaId: number;
  solicitanteId: number;
  categoria: { id: number; nome: string };
  solicitante: { id: number; nome: string };
};

export type HistoricoStatus = {
  id: number;
  statusAnterior: Status | null;
  statusNovo: Status;
  observacao: string | null;
  alteradoEm: string;
  usuario: { id: number; nome: string };
};

export type Dashboard = {
  total: number;
  aberto: number;
  emAtendimento: number;
  concluido: number;
};

export type RequestFilters = {
  categoria?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  texto?: string;
};
