// src/App.tsx
import { useEffect, useState } from "react";

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

const DEVICES_API_BASE = import.meta.env.VITE_DEVICES_API_BASE as string;
const LOANS_API_BASE = import.meta.env.VITE_LOANS_API_BASE as string;

// TEMP: until Auth0, we’ll hard-code a fake user
const CURRENT_USER_ID = "student-1";

function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDevices();
    loadLoans();
  }, []);

  function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    return "An unknown error occurred";
  }


  async function loadDevices() {
    try {
      setLoadingDevices(true);
      setError(null);
      const res = await fetch(`${DEVICES_API_BASE}/devices`);
      if (!res.ok) {
        throw new Error(`Failed to load devices: ${res.status}`);
      }
      const data = await res.json();
      setDevices(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
    finally {
      setLoadingDevices(false);
    }
  }

  async function loadLoans() {
    try {
      setLoadingLoans(true);
      setError(null);
      const res = await fetch(`${LOANS_API_BASE}/loans/user/${CURRENT_USER_ID}`);
      if (!res.ok) {
        throw new Error(`Failed to load loans: ${res.status}`);
      }
      const data = await res.json();
      setLoans(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
    finally {
      setLoadingLoans(false);
    }
  }

  async function reserveDevice(deviceId: string) {
    try {
      setError(null);
      const res = await fetch(`${LOANS_API_BASE}/loans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: CURRENT_USER_ID,
          deviceModelId: deviceId
        })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Failed to create loan: ${res.status}`);
      }
      await loadLoans();
    } catch (err: unknown) {
  setError(getErrorMessage(err));
}

  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1rem" }}>
      <h1>Campus Device Loans</h1>

      {error && (
        <div style={{ background: "#fee", padding: "0.5rem", marginBottom: "1rem" }}>
          Error: {error}
        </div>
      )}

      <section>
        <h2>Available Devices</h2>
        {loadingDevices ? (
          <p>Loading devices...</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
              {devices.length === 0 && (
                <tr>
                  <td colSpan={5}>No devices found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>My Loans ({CURRENT_USER_ID})</h2>
        {loadingLoans ? (
          <p>Loading loans...</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
              {loans.length === 0 && (
                <tr>
                  <td colSpan={5}>No loans yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default App;