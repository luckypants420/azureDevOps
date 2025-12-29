import type { Device } from '../types';

interface DeviceListProps {
  devices: Device[];
  loading: boolean;
  onReserve?: (deviceId: string) => void;
}

export function DeviceList({ devices, loading, onReserve }: DeviceListProps) {
  if (loading) {
    return <p>Loading devices...</p>;
  }

  if (devices.length === 0) {
    return <p>No devices available.</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
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
        {devices.map((device) => (
          <tr key={device.id}>
            <td>{device.brand}</td>
            <td>{device.model}</td>
            <td>{device.category}</td>
            <td>{device.totalQuantity}</td>
            <td>
              {onReserve && (
                <button onClick={() => onReserve(device.id)}>Reserve</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
