import type { Loan } from '../types';

interface LoanListProps {
  loans: Loan[];
  loading: boolean;
}

export function LoanList({ loans, loading }: LoanListProps) {
  if (loading) {
    return <p>Loading loans...</p>;
  }

  if (loans.length === 0) {
    return <p>You have no loans yet.</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
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
  );
}
