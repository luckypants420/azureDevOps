import { useState } from 'react';
import type { Loan } from '../types';

interface StaffPanelProps {
  onLoadLoans: (userId: string) => Promise<void>;
  onCollect: (loanId: string, userId?: string) => Promise<void>;
  onReturn: (loanId: string, userId?: string) => Promise<void>;
  loans: Loan[];
  loading: boolean;
}

export function StaffPanel({ onLoadLoans, onCollect, onReturn, loans, loading }: StaffPanelProps) {
  const [userId, setUserId] = useState('');

  return (
    <section style={{ marginTop: '3rem', borderTop: '1px solid #ddd', paddingTop: '1.5rem' }}>
      <h2>Staff Panel – Manage Loans</h2>
      <p style={{ color: '#555', marginBottom: '0.75rem' }}>
        As <strong>staff</strong>, you can look up loans for any user and mark them as collected or returned.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
        <label>
          User ID:&nbsp;
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="e.g. google-oauth2|123456"
            style={{ padding: '0.25rem 0.5rem', minWidth: '200px' }}
          />
        </label>
        <button
          onClick={() => userId && onLoadLoans(userId)}
          disabled={!userId}
        >
          Load Loans
        </button>
      </div>

      {loading ? (
        <p>Loading loans for {userId}…</p>
      ) : loans.length === 0 ? (
        <p>No loans to show for this user yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
          <thead>
            <tr>
              <th align="left">Loan ID</th>
              <th align="left">User</th>
              <th align="left">Device</th>
              <th align="left">Status</th>
              <th align="left">Reserved At</th>
              <th align="left">Due At</th>
              <th align="left">Collected At</th>
              <th align="left">Returned At</th>
              <th align="left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.id}</td>
                <td>{loan.userId}</td>
                <td>{loan.deviceModelId}</td>
                <td>{loan.status}</td>
                <td>{new Date(loan.reservedAt).toLocaleString()}</td>
                <td>{new Date(loan.dueAt).toLocaleString()}</td>
                <td>{loan.collectedAt ? new Date(loan.collectedAt).toLocaleString() : '-'}</td>
                <td>{loan.returnedAt ? new Date(loan.returnedAt).toLocaleString() : '-'}</td>
                <td>
                  <button onClick={() => onCollect(loan.id, loan.userId)} style={{ marginRight: '0.25rem' }}>
                    Collect
                  </button>
                  <button onClick={() => onReturn(loan.id, loan.userId)}>
                    Return
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
