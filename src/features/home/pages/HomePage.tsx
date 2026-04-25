import { useNavigate } from 'react-router-dom';
import { hubItems } from '../../../data/mockFamilyData';
import GlassCard from '../../../ui/cards/GlassCard';
import ActionCard from '../../../ui/cards/ActionCard';
import HubTile from '../../../ui/cards/HubTile';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';
import SectionHeader from '../../../ui/layout/SectionHeader';
import { useHomeSnapshot } from '../hooks/useHomeSnapshot';

export default function HomePage() {
  const navigate = useNavigate();
  const snapshot = useHomeSnapshot();

  const todayItems = snapshot.calendarEventCount + snapshot.todoOpenCount;
  const openWork = snapshot.todoOpenCount + snapshot.groceryOpenCount;

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
              <h2>{openWork === 0 ? 'All clear' : 'Mostly calm'}</h2>
              <p>
                {snapshot.calendarEventCount} events, {snapshot.todoOpenCount} open tasks, and{' '}
                {snapshot.groceryOpenCount} grocery items still waiting for human intervention.
              </p>
            </div>

            <div className="heroIcon">⌁</div>
          </div>

          <div className="quickGrid">
            <div className="quickCard">
              <p>Today</p>
              <strong>{todayItems} items</strong>
            </div>

            <div className="quickCard">
              <p>Groceries</p>
              <strong>{snapshot.groceryOpenCount} left</strong>
            </div>

            <div className="quickCard">
              <p>Tasks</p>
              <strong>{snapshot.todoOpenCount} open</strong>
            </div>
          </div>
        </GlassCard>

        <div className="splitCards">
          <ActionCard
            variant="dark"
            label="Next event"
            value={snapshot.calendar[0]?.time ?? '—'}
            detail={snapshot.calendar[0]?.title ?? 'Nothing scheduled'}
            onClick={() => navigate('/calendar')}
          />

          <ActionCard
            label="Open tasks"
            value={`${snapshot.todoOpenCount} left`}
            detail={snapshot.todo.find((task) => !task.done)?.title ?? 'No open tasks'}
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