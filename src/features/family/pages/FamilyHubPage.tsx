import { useMemo } from 'react';
import { hubItems } from '../../../data/mockFamilyData';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';

export default function FamilyHubPage() {
  const featured = useMemo(() => hubItems[1], []);

  return (
    <main>
      <PageHeader
        eyebrow="Family hub"
        title="Everything else"
        subtitle="Wishlist, trips, health, recipes, and grocery. Basically the drawer where real life throws its cables."
      />

      <section className="pageSection">
        <GlassCard className="hubPageCard">
          <div className={`featuredCard ${featured.tint}`}>
            <p>Featured</p>
            <h2>Weekend trip</h2>
            <span>Packing list, documents, route, and bookings in one calm place.</span>
          </div>

          <div className="hubList">
            {hubItems.map((item) => (
              <button key={item.key} type="button" className="hubRow">
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
      </section>
    </main>
  );
}