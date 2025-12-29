import type { Device, Loan } from '../types';
import { DEVICES_API_BASE, LOANS_API_BASE } from '../config/constants';

/**
 * Fetch all devices
 */
export async function fetchDevices(headers: Record<string, string>): Promise<Device[]> {
  const res = await fetch(`${DEVICES_API_BASE}/devices`, { headers });
  
  if (!res.ok) {
    throw new Error(`Failed to load devices: HTTP ${res.status}`);
  }
  
  return res.json();
}

/**
 * Fetch loans for a specific user
 */
export async function fetchLoansForUser(userId: string, headers: Record<string, string>): Promise<Loan[]> {
  const res = await fetch(`${LOANS_API_BASE}/loans/user/${userId}`, { headers });
  
  if (!res.ok) {
    throw new Error(`Failed to load loans: HTTP ${res.status}`);
  }
  
  return res.json();
}

/**
 * Create a new loan reservation
 */
export async function createLoan(userId: string, deviceId: string, headers: Record<string, string>): Promise<void> {
  const res = await fetch(`${LOANS_API_BASE}/loans`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      userId,
      deviceModelId: deviceId,
    }),
  });

  if (!res.ok) {
    let message = `Failed to create loan: HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // Ignore parsing errors
    }
    throw new Error(message);
  }
}

/**
 * Mark a loan as collected (Staff only)
 */
export async function markLoanCollected(loanId: string, headers: Record<string, string>): Promise<void> {
  const res = await fetch(`${LOANS_API_BASE}/loans/${loanId}/collect`, {
    method: 'POST',
    headers,
  });

  if (!res.ok) {
    let message = `Failed to collect loan: HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // Ignore parsing errors
    }
    throw new Error(message);
  }
}

/**
 * Mark a loan as returned (Staff only)
 */
export async function markLoanReturned(loanId: string, headers: Record<string, string>): Promise<void> {
  const res = await fetch(`${LOANS_API_BASE}/loans/${loanId}/return`, {
    method: 'POST',
    headers,
  });

  if (!res.ok) {
    let message = `Failed to return loan: HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // Ignore parsing errors
    }
    throw new Error(message);
  }
}
