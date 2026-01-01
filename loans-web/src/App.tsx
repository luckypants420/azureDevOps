import { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { Device, Loan } from './types';
import { DEVICES_API_BASE, LOANS_API_BASE, AUTH0_AUDIENCE, ROLES_CLAIM } from './config/constants';
import { getErrorMessage } from './utils/errorHandling';
import {
  fetchDevices,
  fetchLoansForUser,
  createLoan,
  markLoanCollected,
  markLoanReturned,
} from './services/api';
import { DeviceList } from './components/DeviceList';
import { LoanList } from './components/LoanList';
import { StaffPanel } from './components/StaffPanel';
import './App.css';

function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingLoans, setLoadingLoans] = useState(false);

  // Staff panel state
  const [staffLoans, setStaffLoans] = useState<Loan[]>([]);
  const [loadingStaffLoans, setLoadingStaffLoans] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const {
    isAuthenticated,
    isLoading: authLoading,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  // Derive roles from ID token (in user object)
  const rawRoles = (user && (user[ROLES_CLAIM] as string[])) || [];
  const isStaff = rawRoles.includes('Staff');

  // Use user.sub as the current user ID (Auth0 subject)
  const currentUserId = user?.sub ?? '';

  /**
   * Get authentication headers for API requests
   */
  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (isAuthenticated && AUTH0_AUDIENCE) {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: AUTH0_AUDIENCE },
        });
        headers['Authorization'] = `Bearer ${token}`;
      } catch (err) {
        console.warn('Could not get access token:', err);
      }
    }

    return headers;
  }, [isAuthenticated, getAccessTokenSilently]);

  /**
   * Load all devices
   */
  const loadDevices = useCallback(async () => {
    try {
      setLoadingDevices(true);
      setError(null);

      const headers = await getAuthHeaders();
      const data = await fetchDevices(headers);
      setDevices(data);
    } catch (err: unknown) {
      console.error('Error loading devices:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoadingDevices(false);
    }
  }, [getAuthHeaders]);

  /**
   * Load loans for current user
   */
  const loadLoans = useCallback(async () => {
    if (!currentUserId) return;

    try {
      setLoadingLoans(true);
      setError(null);

      const headers = await getAuthHeaders();
      const data = await fetchLoansForUser(currentUserId, headers);
      setLoans(data);
    } catch (err: unknown) {
      console.error('Error loading loans:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoadingLoans(false);
    }
  }, [currentUserId, getAuthHeaders]);

  /**
   * Reserve a device (create a loan)
   */
  const reserveDevice = useCallback(async (deviceId: string) => {
    if (!currentUserId) {
      setError('You must be logged in to reserve a device');
      return;
    }

    try {
      setError(null);
      const headers = await getAuthHeaders();
      await createLoan(currentUserId, deviceId, headers);
      await loadLoans();
    } catch (err: unknown) {
      console.error('Error creating loan:', err);
      setError(getErrorMessage(err));
    }
  }, [currentUserId, getAuthHeaders, loadLoans]);

  /**
   * Load loans for a specific user (Staff only)
   */
  const loadStaffLoansForUser = useCallback(async (userId: string) => {
    try {
      setLoadingStaffLoans(true);
      setError(null);

      const headers = await getAuthHeaders();
      const data = await fetchLoansForUser(userId, headers);
      setStaffLoans(data);
    } catch (err: unknown) {
      console.error('Error loading staff loans:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoadingStaffLoans(false);
    }
  }, [getAuthHeaders]);

  /**
   * Mark a loan as collected (Staff only)
   */
  const collectLoan = useCallback(async (loanId: string, userIdForRefresh?: string) => {
    try {
      setError(null);
      const headers = await getAuthHeaders();
      await markLoanCollected(loanId, headers);

      // Refresh both staff view and personal view
      await loadLoans();

      // If we have a userId from staff panel, refresh that too
      if (userIdForRefresh) {
        await loadStaffLoansForUser(userIdForRefresh);
      }
    } catch (err: unknown) {
      console.error('Error collecting loan:', err);
      setError(getErrorMessage(err));
    }
  }, [getAuthHeaders, loadLoans, loadStaffLoansForUser]);

  /**
   * Mark a loan as returned (Staff only)
   */
  const returnLoan = useCallback(async (loanId: string, userIdForRefresh?: string) => {
    try {
      setError(null);
      const headers = await getAuthHeaders();
      await markLoanReturned(loanId, headers);

      // Refresh both staff view and personal view
      await loadLoans();

      // If we have a userId from staff panel, refresh that too
      if (userIdForRefresh) {
        await loadStaffLoansForUser(userIdForRefresh);
      }
    } catch (err: unknown) {
      console.error('Error returning loan:', err);
      setError(getErrorMessage(err));
    }
  }, [getAuthHeaders, loadLoans, loadStaffLoansForUser]);

  /**
   * Load devices on mount (public)
   */
  useEffect(() => {
    if (!DEVICES_API_BASE || !LOANS_API_BASE) {
      setError(
        'API base URLs are not configured. Check your .env file for VITE_DEVICES_API_BASE and VITE_LOANS_API_BASE.'
      );
      return;
    }
    void loadDevices();
  }, [loadDevices]);

  /**
   * Load loans when authenticated
   */
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      void loadLoans();
    }
  }, [authLoading, isAuthenticated, loadLoans]);

  // Loading state
  if (authLoading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      <header style={{ borderBottom: '2px solid #333', paddingBottom: '1rem', marginBottom: '1rem' }}>
        <h1>Campus Device Loans</h1>

        {isAuthenticated ? (
          <div style={{ marginTop: '0.5rem' }}>
            <p>
              Welcome, {user?.name ?? user?.email ?? 'User'}!{' '}
              {isStaff && <strong>(Staff)</strong>}
            </p>
            <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.25rem 0' }}>
              User ID: <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>{user?.sub}</code>
            </p>
            <button
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
              style={{ marginTop: '0.5rem' }}
            >
              Log out
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '0.5rem' }}>
            <p>You are not signed in.</p>
            <button onClick={() => loginWithRedirect()}>Log in</button>
          </div>
        )}
      </header>

      {error && (
        <div
          style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      <section>
        <h2>Available Devices</h2>
        <DeviceList
          devices={devices}
          loading={loadingDevices}
          onReserve={isAuthenticated ? reserveDevice : undefined}
        />
      </section>

      {isAuthenticated && (
        <>
          <section style={{ marginTop: '2rem' }}>
            <h2>My Loans</h2>
            <LoanList loans={loans} loading={loadingLoans} />
          </section>

          {isStaff && (
            <StaffPanel
              onLoadLoans={loadStaffLoansForUser}
              loans={staffLoans}
              loading={loadingStaffLoans}
              onCollect={collectLoan}
              onReturn={returnLoan}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
