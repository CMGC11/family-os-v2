import { useEffect, useState } from 'react';
import { requireSupabaseClient } from '../lib/supabase/client';
import { clearCachedHouseholdId } from '../lib/supabase/household';
import { getCurrentSession, signInWithEmailPassword, signOut } from '../lib/supabase/auth';
import { clearCachedPersonId } from '../lib/supabase/person';

type AuthGateProps = {
  children: React.ReactNode;
};

export default function AuthGate({ children }: AuthGateProps) {
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = requireSupabaseClient();

    async function checkSession() {
      try {
        const session = await getCurrentSession();

        if (!cancelled) {
          setIsAuthenticated(Boolean(session));
        }
      } catch (error) {
        console.error('Failed to check auth session:', error);

        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : 'Failed to check session.');
        }
      } finally {
        if (!cancelled) {
          setIsCheckingSession(false);
        }
      }
    }

    checkSession();

    const authListener = supabase.auth.onAuthStateChange((_event, session) => {
      clearCachedHouseholdId();
      clearCachedPersonId();
      setIsAuthenticated(Boolean(session));
    });

    return () => {
      cancelled = true;
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      await signInWithEmailPassword(email, password);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to sign in:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    try {
      setErrorMessage('');
      clearCachedHouseholdId();
      clearCachedPersonId();
      await signOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Failed to sign out:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to sign out.');
    }
  }

  if (isCheckingSession) {
    return (
      <div className="appRoot">
        <div className="phoneShell">
          <div className="screen">
            <div className="topGlow" />
            <main className="authScreen">
              <section className="glassCard authCard">
                <p className="eyebrow">FamilyOS</p>
                <h1>Loading</h1>
                <p>Checking your session. The tiny security goblin is working.</p>
              </section>
            </main>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="appRoot">
        <div className="phoneShell">
          <div className="screen">
            <div className="topGlow" />

            <main className="authScreen">
              <section className="glassCard authCard">
                <p className="eyebrow">FamilyOS</p>
                <h1>Sign in</h1>
                <p>Use your existing FamilyOS account to access the household.</p>

                <form className="authForm" onSubmit={handleLogin}>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    required
                  />

                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    required
                  />

                  {errorMessage && <p className="authError">{errorMessage}</p>}

                  <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                  </button>
                </form>
              </section>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}

      <button type="button" className="logoutButton" onClick={handleLogout}>
        Sign out
      </button>
    </>
  );
}