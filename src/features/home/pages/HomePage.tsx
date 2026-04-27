import { useNavigate } from 'react-router-dom';
import { hubItems } from '../../../data/mockFamilyData';
import GlassCard from '../../../ui/cards/GlassCard';
import ActionCard from '../../../ui/cards/ActionCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';
import SectionHeader from '../../../ui/layout/SectionHeader';
import { useHomeSnapshot } from '../hooks/useHomeSnapshot';

const HUB_ROUTES: Record<string, string> = {
  wishlist: '/family/wishlist',
  trips: '/family/trips',
  health: '/family/health',
  recipes: '/family/recipes',
  grocery: '/family/grocery',
};

function formatDateLabel(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);

  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export default function HomePage() {
  const navigate = useNavigate();
  const snapshot = useHomeSnapshot();

  const todayItems = snapshot.todayCalendarCount + snapshot.todoOpenCount;
  const openWork = snapshot.todoOpenCount + snapshot.groceryOpenCount;
  const nextEvent = snapshot.upcomingCalendar[0];
  const nextTask = snapshot.todo[0];

  const homeStateTitle = snapshot.isLoading ? 'Loading' : openWork === 0 && todayItems === 0 ? 'All clear' : 'Today is active';

  const homeStateCopy = snapshot.isLoading
    ? 'Checking the household rhythm.'
    : `${snapshot.todayCalendarCount} calendar item${
        snapshot.todayCalendarCount === 1 ? '' : 's'
      } today, ${snapshot.todoOpenCount} open task${
        snapshot.todoOpenCount === 1 ? '' : 's'
      }, and ${snapshot.groceryOpenCount} grocery item${
        snapshot.groceryOpenCount === 1 ? '' : 's'
      } waiting. The empire remains barely civilized.`;

  const hubSummaries = hubItems.map((item) => {
    if (item.key === 'wishlist') {
      return {
        ...item,
        value: snapshot.isLoading ? '—' : String(snapshot.wishlistCount),
        detail: 'Saved wishes',
      };
    }

    if (item.key === 'trips') {
      return {
        ...item,
        value: snapshot.isLoading ? '—' : String(snapshot.tripCount),
        detail: 'Upcoming trips',
      };
    }

    if (item.key === 'health') {
      return {
        ...item,
        value: snapshot.isLoading ? '—' : String(snapshot.healthNoteCount),
        detail: 'Health notes',
      };
    }

    if (item.key === 'recipes') {
      return {
        ...item,
        value: snapshot.isLoading ? '—' : String(snapshot.recipeCount),
        detail: 'Recipes saved',
      };
    }

    return {
      ...item,
      value: snapshot.isLoading ? '—' : String(snapshot.groceryOpenCount),
      detail: 'Groceries left',
    };
  });

  return (
    <main>
      <PageHeader
        eyebrow="FamilyOS"
        title="Home"
        subtitle="A calm command center for the household, because apparently life needs a dashboard now."
      />

      <PageShell>
        {snapshot.errorMessage && (
          <GlassCard className="tasksCard">
            <p className="mutedLabel">{snapshot.errorMessage}</p>
          </GlassCard>
        )}

        <GlassCard className="heroCard homeHeroCard">
          <div className="heroLayout">
            <div>
              <p className="mutedLabel">Today</p>
              <h2>{homeStateTitle}</h2>
              <p>{homeStateCopy}</p>
            </div>

            <button type="button" className="heroIcon homeHeroAction" onClick={() => navigate('/calendar')}>
              ⌁
            </button>
          </div>

          <div className="homeMetricGrid">
            <button type="button" className="quickCard homeMetricCard" onClick={() => navigate('/calendar')}>
              <p>Calendar</p>
              <strong>{snapshot.isLoading ? '—' : `${snapshot.todayCalendarCount} today`}</strong>
            </button>

            <button type="button" className="quickCard homeMetricCard" onClick={() => navigate('/todo')}>
              <p>Tasks</p>
              <strong>{snapshot.isLoading ? '—' : `${snapshot.todoOpenCount} open`}</strong>
            </button>

            <button type="button" className="quickCard homeMetricCard" onClick={() => navigate('/family/grocery')}>
              <p>Groceries</p>
              <strong>{snapshot.isLoading ? '—' : `${snapshot.groceryOpenCount} left`}</strong>
            </button>

            <button type="button" className="quickCard homeMetricCard" onClick={() => navigate('/family')}>
              <p>Hub</p>
              <strong>{snapshot.isLoading ? '—' : `${snapshot.wishlistCount + snapshot.recipeCount} saved`}</strong>
            </button>
          </div>
        </GlassCard>

        <div className="splitCards">
          <ActionCard
            variant="dark"
            label="Next event"
            value={snapshot.isLoading ? '—' : nextEvent?.time ?? '—'}
            detail={
              snapshot.isLoading
                ? 'Loading calendar'
                : nextEvent
                  ? `${nextEvent.title} · ${formatDateLabel(nextEvent.date)}`
                  : 'Nothing upcoming'
            }
            onClick={() => navigate('/calendar')}
          />

          <ActionCard
            label="Open tasks"
            value={snapshot.isLoading ? '—' : `${snapshot.todoOpenCount} left`}
            detail={
              snapshot.isLoading
                ? 'Loading tasks'
                : nextTask
                  ? `${nextTask.title} · ${nextTask.due}`
                  : 'No open tasks'
            }
            onClick={() => navigate('/todo')}
          />
        </div>

        <GlassCard className="homeAgendaCard">
          <SectionHeader
            title="Coming up"
            action={
              <button type="button" onClick={() => navigate('/calendar')}>
                Calendar
              </button>
            }
          />

          <div className="homeAgendaList">
            {snapshot.isLoading ? (
              <div className="homeAgendaRow">
                <span className="homeAgendaTime">—</span>
                <div>
                  <strong>Loading plans</strong>
                  <p>Gathering the household schedule.</p>
                </div>
              </div>
            ) : snapshot.upcomingCalendar.length === 0 ? (
              <div className="homeAgendaRow">
                <span className="homeAgendaTime">—</span>
                <div>
                  <strong>No upcoming events</strong>
                  <p>A suspiciously peaceful calendar.</p>
                </div>
              </div>
            ) : (
              snapshot.upcomingCalendar.slice(0, 3).map((event) => (
                <button
                  key={event.id}
                  type="button"
                  className="homeAgendaRow homeAgendaButton"
                  onClick={() => navigate('/calendar')}
                >
                  <span className="homeAgendaTime">{event.time}</span>
                  <div>
                    <strong>{event.title}</strong>
                    <p>{formatDateLabel(event.date)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard className="hubPreview homeHubPreview">
          <SectionHeader
            title="Family hub"
            action={
              <button type="button" onClick={() => navigate('/family')}>
                View all
              </button>
            }
          />

          <div className="hubGrid homeHubGrid">
            {hubSummaries.map((item) => (
              <button
                key={item.key}
                type="button"
                className="miniHubCard homeHubButton"
                onClick={() => navigate(HUB_ROUTES[item.key] ?? '/family')}
              >
                <div className={`hubIcon ${item.tint}`}>{item.icon}</div>
                <p>{item.title}</p>
                <strong>{item.value}</strong>
                <span>{item.detail}</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </PageShell>
    </main>
  );
}