import { useEffect, useState } from 'react';
import { loadHouseholdSnapshot } from '../../../lib/store/familyStore';

type HomeSnapshot = ReturnType<typeof loadHouseholdSnapshot>;

export function useHomeSnapshot() {
  const [snapshot, setSnapshot] = useState<HomeSnapshot>(() => loadHouseholdSnapshot());

  useEffect(() => {
    function refreshSnapshot() {
      setSnapshot(loadHouseholdSnapshot());
    }

    window.addEventListener('storage', refreshSnapshot);
    window.addEventListener('focus', refreshSnapshot);

    return () => {
      window.removeEventListener('storage', refreshSnapshot);
      window.removeEventListener('focus', refreshSnapshot);
    };
  }, []);

  return snapshot;
}