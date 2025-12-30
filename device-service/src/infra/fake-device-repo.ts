import type { IDeviceModel } from '../domain/device.js';
import type { IDeviceRepo } from '../domain/device-repo.js';

/**
 * Fake (in-memory) device repository for testing purposes.
 * Does not persist data between instances.
 */
export class FakeDeviceRepo implements IDeviceRepo {
    private devices: Map<string, IDeviceModel> = new Map();

    /**
     * Set initial devices for testing
     */
    seed(devices: IDeviceModel[]): void {
        devices.forEach(device => this.devices.set(device.id, device));
    }

    /**
     * Get all devices
     */
    getAll(): IDeviceModel[] {
        return Array.from(this.devices.values());
    }

    async create(device: IDeviceModel): Promise<IDeviceModel> {
        this.devices.set(device.id, device);
        return device;
    }

    async getById(id: string): Promise<IDeviceModel | null> {
        return this.devices.get(id) ?? null;
    }

    async list(): Promise<IDeviceModel[]> {
        return Array.from(this.devices.values());
    }

    async save(device: IDeviceModel): Promise<IDeviceModel> {
        this.devices.set(device.id, device);
        return device;
    }

    async delete(id: string): Promise<void> {
        this.devices.delete(id);
    }
}
