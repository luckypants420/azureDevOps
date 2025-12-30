import { describe, it, expect, vi } from 'vitest';
import { listDevices } from './list-devices.js';
import { FakeDeviceRepo } from '../infra/fake-device-repo.js';
import { getDeviceRepo } from '../config/appServices.js';
import type { IDeviceModel } from '../domain/device.js';

vi.mock('../config/appServices.js', () => ({
  getDeviceRepo: vi.fn(),
}));

describe('listDevices', () => {
  it('should return all devices', async () => {
    // Arrange
    const fakeDeviceRepo = new FakeDeviceRepo();
    const mockDevices: IDeviceModel[] = [
      {
        id: 'device-1',
        brand: 'Apple',
        model: 'MacBook Pro',
        category: 'Laptop',
        totalQuantity: 10,
        createdAt: new Date('2025-01-01'),
      },
      {
        id: 'device-2',
        brand: 'Dell',
        model: 'XPS 13',
        category: 'Laptop',
        totalQuantity: 5,
        createdAt: new Date('2025-01-02'),
      },
      {
        id: 'device-3',
        brand: 'Canon',
        model: 'EOS R5',
        category: 'Camera',
        totalQuantity: 3,
        createdAt: new Date('2025-01-03'),
      },
    ];
    fakeDeviceRepo.seed(mockDevices);
    
    // Mock getDeviceRepo to return fake repo with listAll method
    vi.mocked(getDeviceRepo).mockReturnValue({
      ...fakeDeviceRepo,
      listAll: async () => fakeDeviceRepo.list(),
    } as any);

    // Act
    const result = await listDevices();

    // Assert
    expect(result).toHaveLength(3);
    expect(result).toEqual(mockDevices);
  });

  it('should return empty array when no devices exist', async () => {
    // Arrange
    const fakeDeviceRepo = new FakeDeviceRepo();
    vi.mocked(getDeviceRepo).mockReturnValue({
      ...fakeDeviceRepo,
      listAll: async () => [],
    } as any);

    // Act
    const result = await listDevices();

    // Assert
    expect(result).toEqual([]);
  });

  it('should handle repository errors gracefully', async () => {
    // Arrange
    const errorMessage = 'Database connection failed';
    const faultyRepo = {
      listAll: vi.fn().mockRejectedValue(new Error(errorMessage)),
    };
    vi.mocked(getDeviceRepo).mockReturnValue(faultyRepo as any);

    // Act & Assert
    await expect(listDevices()).rejects.toThrow(errorMessage);
  });

  it('should return devices with correct structure', async () => {
    // Arrange
    const fakeDeviceRepo = new FakeDeviceRepo();
    const mockDevice: IDeviceModel = {
      id: 'device-123',
      brand: 'Sony',
      model: 'A7IV',
      category: 'Camera',
      totalQuantity: 2,
      createdAt: new Date('2025-01-15'),
    };
    fakeDeviceRepo.seed([mockDevice]);
    
    vi.mocked(getDeviceRepo).mockReturnValue({
      ...fakeDeviceRepo,
      listAll: async () => fakeDeviceRepo.list(),
    } as any);

    // Act
    const result = await listDevices();

    // Assert
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('brand');
    expect(result[0]).toHaveProperty('model');
    expect(result[0]).toHaveProperty('category');
    expect(result[0]).toHaveProperty('totalQuantity');
    expect(result[0]).toHaveProperty('createdAt');
  });
});
