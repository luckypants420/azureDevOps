// src/App.tsx
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

interface Device {
  id: string;
  brand: string;
  model: string;
  category: string;
  totalQuantity: number;
  createdAt: string;
}

interface Loan {
  id: string;
  userId: string;
  deviceModelId: string;
  status: string;
  reservedAt: string;
  dueAt: string;
  collectedAt?: string;
  returnedAt?: string;
}

const DEVICES_API_BASE = import.meta.env.VITE_DEVICES_API_BASE as string | undefined;
const LOANS_API_BASE = import.meta.env.VITE_LOANS_API_BASE as string | undefined;
const AUTH0_AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE as string | undefined;

// TEMP: until we fully wire userId from JWT, we keep using this:
const FALLBACK_USER_ID = "student-1";

function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    isAuthenticated,
    isLoading: authLoading,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  console.log("DEVICES_API_BASE =", DEVICES_API_BASE);
  console.log("LOANS_API_BASE =", LOANS_API_BASE);

  // derive current userId – later we’ll read from token claims
  const currentUserId = user?.sub ?? FALLBACK_USER_ID;

  useEffect(() => {
    if (!DEVICES_API_BASE || !LOANS_API_BASE) {
      setError(
        "API base URLs are not configured. Check your .env file for VITE_DEVICES_API_BASE and VITE_LOANS_API_BASE."
      );
      return;
    }
    // load data after auth is initialized
    if (!authLoading) {
      void loadDevices();
      void loadLoans();
    }
  }, [authLoading]);

  async function getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {};

    // Always send JSON for POST
    headers["Content-Type"] = "application/json";

    if (isAuthenticated && AUTH0_AUDIENCE) {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: AUTH0_AUDIENCE },
        });
        headers["Authorization"] = `Bearer ${token}`;
      } catch (err) {
        console.warn("Could not get access token, proceeding without it:", err);
      }
    }

    return headers;
  }

  async function loadDevices() {
    try {
      setLoadingDevices(true);
      setError(null);

      const headers = await getAuthHeaders();
      const res = await fetch(`${DEVICES_API_BASE}/devices`, { headers });

      if (!res.ok) {
        throw new Error(`Failed to load devices: HTTP ${res.status}`);
      }

      const data = (await res.json()) as Device[];
      setDevices(data);
    } catch (err: unknown) {
      console.error("Error loading devices:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoadingDevices(false);
    }
  }

  async function loadLoans() {
    try {
      setLoadingLoans(true);
      setError(null);

      const headers = await getAuthHeaders();
      const res = await fetch(`${LOANS_API_BASE}/loans/user/${currentUserId}`, { headers });

      if (!res.ok) {
        throw new Error(`Failed to load loans: HTTP ${res.status}`);
      }

      const data = (await res.json()) as Loan[];
      setLoans(data);
    } catch (err: unknown) {
      console.error("Error loading loans:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoadingLoans(false);
    }
  }

  async function reserveDevice(deviceId: string) {
    try {
      setError(null);

      const headers = await getAuthHeaders();
      const res = await fetch(`${LOANS_API_BASE}/loans`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: currentUserId,
          deviceModelId: deviceId,
        }),
      });

      if (!res.ok) {
        let message = `Failed to create loan: HTTP ${res.status}`;
        try {
          const body = await res.json();
          if (body?.message) message = body.message;
        } catch {
          // ignore JSON parse error
        }
        throw new Error(message);
      }

      await loadLoans();
    } catch (err: unknown) {
      console.error("Error creating loan:", err);
      setError(getErrorMessage(err));
    }
  }

  if (authLoading) {
    return (
      <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
        <h1>Campus Device Loan System</h1>
        <p>Checking authentication…</p>
      </div>
    );
  }

  if (!DEVICES_API_BASE || !LOANS_API_BASE) {
    return (
      <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
        <h1>Campus Device Loan System</h1>
        <div style={{ background: "#fee", padding: "1rem", marginTop: "1rem" }}>
          <h2>Configuration Error</h2>
          <p>
            API base URLs are not configured. Please create <code>.env</code> in the project root with:
          </p>
          <pre>
            {`VITE_DEVICES_API_BASE=https://devices-test-da007-func.azurewebsites.net/api
VITE_LOANS_API_BASE=https://loans-test-da007-func.azurewebsites.net/api`}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h1>Campus Device Loan System</h1>
          <p style={{ color: "#555" }}>
            {isAuthenticated && user ? (
              <>
                Signed in as <strong>{user.email ?? user.name ?? currentUserId}</strong>
              </>
            ) : (
              <>im not signed in im (using fallback user ID <code>{FALLBACK_USER_ID}</code>).</>
            )}
          </p>
        </div>
        <div>
          {isAuthenticated ? (
            <button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              style={{ padding: "0.4rem 0.8rem" }}
            >
              Log out
            </button>
          ) : (
            <button onClick={() => loginWithRedirect()} style={{ padding: "0.4rem 0.8rem" }}>
              Log in
            </button>
          )}
        </div>
      </header>

      {error && (
        <div style={{ background: "#fee", padding: "0.75rem", marginTop: "1rem", border: "1px solid #fbb" }}>
          <strong>Error: </strong>
          {error}
        </div>
      )}

      <section style={{ marginTop: "2rem" }}>
        <h2>Available Devices</h2>
        {loadingDevices ? (
          <p>Loading devices...</p>
        ) : devices.length === 0 ? (
          <p>No devices found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem" }}>
            <thead>
              <tr>
                <th align="left">Brand</th>
                <th align="left">Model</th>
                <th align="left">Category</th>
                <th align="left">Total Quantity</th>
                <th align="left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.id}>
                  <td>{d.brand}</td>
                  <td>{d.model}</td>
                  <td>{d.category}</td>
                  <td>{d.totalQuantity}</td>
                  <td>
                    <button onClick={() => reserveDevice(d.id)}>Reserve</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>My Loans ({currentUserId})</h2>
        {loadingLoans ? (
          <p>Loading loans...</p>
        ) : loans.length === 0 ? (
          <p>You have no loans yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem" }}>
            <thead>
              <tr>
                <th align="left">Loan ID</th>
                <th align="left">Device</th>
                <th align="left">Status</th>
                <th align="left">Reserved At</th>
                <th align="left">Due At</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id}>
                  <td>{loan.id}</td>
                  <td>{loan.deviceModelId}</td>
                  <td>{loan.status}</td>
                  <td>{new Date(loan.reservedAt).toLocaleString()}</td>
                  <td>{new Date(loan.dueAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default App;
function getErrorMessage(err: unknown): import("react").SetStateAction<string | null> {
  throw new Error("Function not implemented.");
}

