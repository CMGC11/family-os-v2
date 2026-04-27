import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hubItems } from '../../../data/mockFamilyData';
import { signOut } from '../../../lib/supabase/auth';
import { clearCachedHouseholdId } from '../../../lib/supabase/household';
import { clearCachedPersonId } from '../../../lib/supabase/person';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';

const moduleRoutes: Record<string, string> = {
  wishlist: '/family/wishlist',
  trips: '/family/trips',
  health: '/family/health',
  recipes: '/family/recipes',
  grocery: '/family/grocery',
};

export default function FamilyHubPage() {
  const navigate = useNavigate();
  const featured = useMemo(() => hubItems[1], []);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      setSignOutError('');
      clearCachedHouseholdId();
      clearCachedPersonId();
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
      setSignOutError(error instanceof Error ? error.message : 'Failed to sign out.');
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <main>
      <PageHeader
        eyebrow="Family hub"
        title="Everything else"
        subtitle="Wishlist, trips, health, recipes, and grocery. Basically the drawer where real life throws its cables."
      />

      <PageShell>
        <GlassCard className="hubPageCard">
          <button
            type="button"
            onClick={() => navigate('/family/trips')}
            className={`featuredCard ${featured.tint}`}
          >
            <p>Featured</p>
            <h2>Weekend trip</h2>
            <span>Packing list, documents, route, and bookings in one calm place.</span>
          </button>

          <div className="hubList">
            {hubItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(moduleRoutes[item.key])}
                className="hubRow"
              >
                <div className={`hubIcon ${item.tint}`}>{item.icon}</div>

                <div>
                  <strong>{item.title}</strong>
                  <span>{item.subtitle}</span>
                </div>

                <span className="chevron">›</span>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="accountCard">
          <div className="accountCardMain">
            <div className="accountIcon" aria-hidden="true">
              ⌁
            </div>

            <div>
              <p>Account</p>
              <strong>Signed in</strong>
              <span>Session and household access.</span>
            </div>
          </div>

          <button type="button" className="accountSignOutButton" onClick={handleSignOut} disabled={isSigningOut}>
            {isSigningOut ? 'Signing out...' : 'Sign out'}
          </button>

          {signOutError && <p className="accountError">{signOutError}</p>}
        </GlassCard>
      </PageShell>
    </main>
  );
}