import { describe, it, expect } from 'vitest';

// These tests require the backend services to be running
// Set environment variables to point to your deployed test environment
const DEVICES_API_BASE = process.env.VITE_DEVICES_API_BASE || 'https://devices-test-da007-func.azurewebsites.net/api';
const LOANS_API_BASE = process.env.VITE_LOANS_API_BASE || 'https://loans-test-da007-func.azurewebsites.net/api';

describe('Devices API Integration', () => {
    it('should fetch devices from the API', async () => {
        const response = await fetch(`${DEVICES_API_BASE}/devices`);
    }, 10000);

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) {
        expect(data[0]).toHaveProperty('id');
        expect(data[0]).toHaveProperty('brand');
        expect(data[0]).toHaveProperty('model');
        expect(data[0]).toHaveProperty('category');
        expect(data[0]).toHaveProperty('totalQuantity');
    }
});

it('should return JSON content-type', async () => {
    const response = await fetch(`${DEVICES_API_BASE}/devices`);

    const contentType = response.headers.get('content-type');
    expect(contentType).toContain('application/json');
});
});

describe('Loans API Integration', () => {
    it('should return 401 when accessing protected endpoint without auth', async () => {
        const response = await fetch(`${LOANS_API_BASE}/loans/user/test-user`);

        // Should be unauthorized without valid JWT
        expect(response.status).toBe(401);
    });

    it('should return 401 when creating loan without auth', async () => {
        const response = await fetch(`${LOANS_API_BASE}/loans`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: 'test-user',
                deviceModelId: 'test-device',
            }),
        });

        // Should be unauthorized without valid JWT
        expect(response.status).toBe(401);
    });
});
