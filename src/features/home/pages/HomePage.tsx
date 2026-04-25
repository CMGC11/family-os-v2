import { useNavigate } from 'react-router-dom';
import { hubItems, quickCards } from '../../../data/mockFamilyData';
import GlassCard from '../../../ui/cards/GlassCard';
import ActionCard from '../../../ui/cards/ActionCard';
import HubTile from '../../../ui/cards/HubTile';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';
import SectionHeader from '../../../ui/layout/SectionHeader';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <main>
      <PageHeader
        eyebrow="FamilyOS"
        title="Good evening"
        subtitle="A calm command center for the tiny empire humans keep calling a household."
      />

      <PageShell>
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
          <ActionCard
            variant="dark"
            label="Next event"
            value="15:30"
            detail="Pediatric check"
            onClick={() => navigate('/calendar')}
          />

          <ActionCard
            label="Open tasks"
            value="3 left"
            detail="One household, endless admin"
            onClick={() => navigate('/todo')}
          />
        </div>

        <GlassCard className="hubPreview">
          <SectionHeader
            title="Family hub"
            action={
              <button type="button" onClick={() => navigate('/family')}>
                View all
              </button>
            }
          />

          <div className="hubGrid">
            {hubItems.slice(0, 4).map((item) => (
              <HubTile
                key={item.key}
                title={item.title}
                subtitle={item.subtitle}
                icon={item.icon}
                tint={item.tint}
              />
            ))}
          </div>
        </GlassCard>
      </PageShell>
    </main>
  );
}