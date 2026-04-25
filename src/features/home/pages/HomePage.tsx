import { useNavigate } from 'react-router-dom';
import { hubItems, quickCards } from '../../../data/mockFamilyData';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <main>
      <PageHeader
        eyebrow="FamilyOS"
        title="Good evening"
        subtitle="A calm command center for the tiny empire humans keep calling a household."
      />

      <section className="pageSection">
        <GlassCard className="heroCard">
          <div className="heroLayout">
            <div>
              <p className="mutedLabel">Today’s rhythm</p>
              <h2>Mostly calm</h2>
              <p>
                You have a pediatric check, groceries, and two tasks that apparently cannot complete themselves.
              </p>
            </div>

            <div className="heroIcon">⌁</div>
          </div>

          <div className="quickGrid">
            {quickCards.map((card) => (
              <div key={card.label} className="quickCard">
                <p>{card.label}</p>
                <strong>{card.value}</strong>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="splitCards">
          <button type="button" onClick={() => navigate('/calendar')} className="darkActionCard">
            <p>Next event</p>
            <strong>15:30</strong>
            <span>Pediatric check</span>
          </button>

          <button type="button" onClick={() => navigate('/todo')} className="lightActionCard">
            <p>Open tasks</p>
            <strong>3 left</strong>
            <span>One household, endless admin</span>
          </button>
        </div>

        <GlassCard className="hubPreview">
          <div className="sectionHeader">
            <h3>Family hub</h3>
            <button type="button" onClick={() => navigate('/family')}>
              View all
            </button>
          </div>

          <div className="hubGrid">
            {hubItems.slice(0, 4).map((item) => (
              <div key={item.key} className="miniHubCard">
                <div className={`hubIcon ${item.tint}`}>{item.icon}</div>
                <p>{item.title}</p>
                <span>{item.subtitle}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </main>
  );
}