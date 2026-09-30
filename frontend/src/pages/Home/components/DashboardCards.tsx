import type { Dashboard } from '../../../services/types';

const CARDS: { key: keyof Dashboard; label: string }[] = [
  { key: 'total', label: 'Total de solicitações' },
  { key: 'aberto', label: 'Abertas' },
  { key: 'emAtendimento', label: 'Em atendimento' },
  { key: 'concluido', label: 'Concluídas' },
];

const DashboardCards = ({ dashboard }: { dashboard: Dashboard | null }) => {
  return (
    <div className="dashboard-cards">
      {CARDS.map((card) => (
        <div className="dashboard-card" key={card.key}>
          <div className="value">{dashboard ? dashboard[card.key] : '—'}</div>
          <div className="label">{card.label}</div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
