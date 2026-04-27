import { useNavigate } from 'react-router-dom';
import { hubItems } from '../../../data/mockFamilyData';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';
import SectionHeader from '../../../ui/layout/SectionHeader';

const moduleRoutes: Record<string, string> = {
  wishlist: '/family/wishlist',
  trips: '/family/trips',
  health: '/family/health',
  recipes: '/family/recipes',
  grocery: '/family/grocery',
};

const moduleDetails: Record<string, { label: string; status: string; action: string }> = {
  wishlist: {
    label: 'Ideas',
    status: 'Saved wishes, gift ideas, and future wants.',
    action: 'Open wishlist',
  },
  trips: {
    label: 'Planning',
    status: 'Trips, travel prep, and the stuff nobody remembers until too late.',
    action: 'Open trips',
  },
  health: {
    label: 'Care',
    status: 'Household health notes and useful medical memory.',
    action: 'Open health',
  },
  recipes: {
    label: 'Kitchen',
    status: 'A simple recipe book without meal-planning theatre.',
    action: 'Open recipes',
  },
  grocery: {
    label: 'Shopping',
    status: 'The shared execution list for groceries.',
    action: 'Open grocery',
  },
};

export default function FamilyHubPage() {
  const navigate = useNavigate();

  const primaryModules = hubItems.filter((item) => item.key === 'trips' || item.key === 'grocery');
  const secondaryModules = hubItems.filter((item) => item.key !== 'trips' && item.key !== 'grocery');

  return (
    <main>
      <PageHeader
        eyebrow="Family hub"
        title="Family"
        subtitle="Wishlist, trips, health, recipes, and grocery in one calm place instead of scattered across human chaos."
      />

      <PageShell>
        <GlassCard className="familyHeroCard">
          <div className="familyHeroTop">
            <div>
              <p className="mutedLabel">Shared household</p>
              <h2>Useful family spaces</h2>
              <span>Fast access to the practical modules that support the rest of the app.</span>
            </div>

            <div className="familyHeroIcon" aria-hidden="true">
              ⌂
            </div>
          </div>

          <div className="familyHeroStats">
            <div>
              <strong>{hubItems.length}</strong>
              <span>Modules</span>
            </div>

            <div>
              <strong>5</strong>
              <span>Shared areas</span>
            </div>

            <div>
              <strong>1</strong>
              <span>Hub</span>
            </div>
          </div>
        </GlassCard>

        <div className="familyPrimaryGrid">
          {primaryModules.map((item) => {
            const detail = moduleDetails[item.key];

            return (
              <button
                key={item.key}
                type="button"
                className={`familyPrimaryCard ${item.tint}`}
                onClick={() => navigate(moduleRoutes[item.key])}
              >
                <span>{detail.label}</span>
                <strong>{item.title}</strong>
                <p>{detail.status}</p>
              </button>
            );
          })}
        </div>

        <GlassCard className="familyModulesCard">
          <SectionHeader title="All modules" />

          <div className="familyModuleList">
            {secondaryModules.map((item) => {
              const detail = moduleDetails[item.key];

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(moduleRoutes[item.key])}
                  className="familyModuleRow"
                >
                  <div className={`hubIcon ${item.tint}`}>{item.icon}</div>

                  <div>
                    <p>{detail.label}</p>
                    <strong>{item.title}</strong>
                    <span>{item.subtitle}</span>
                  </div>

                  <span className="familyModuleChevron">›</span>
                </button>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="familyQuickCard">
          <SectionHeader title="Quick paths" />

          <div className="familyQuickGrid">
            {hubItems.map((item) => {
              const detail = moduleDetails[item.key];

              return (
                <button
                  key={item.key}
                  type="button"
                  className="familyQuickButton"
                  onClick={() => navigate(moduleRoutes[item.key])}
                >
                  <span className={`familyQuickIcon ${item.tint}`}>{item.icon}</span>
                  <strong>{item.title}</strong>
                  <em>{detail.action}</em>
                </button>
              );
            })}
          </div>
        </GlassCard>
      </PageShell>
    </main>
  );
}