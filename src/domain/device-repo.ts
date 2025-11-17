import { IDeviceModel } from './device';

/**
 * DeviceRepo interface defines the contract for device persistence operations.
 * Pure domain interface - no framework or Azure SDK types included.
 */
export interface IDeviceRepo {
    /**
     * Create a new device in the repository.
     * @param device The device model to persist
     * @returns Promise resolving to the created device with persisted state
     * @throws {RepositoryError} If the device cannot be created
     */
    create(device: IDeviceModel): Promise<IDeviceModel>;

    /**
     * Retrieve a device by its unique identifier.
     * @param id The device identifier
     * @returns Promise resolving to the device if found, null if not found
     * @throws {RepositoryError} If the operation fails
     */
    getById(id: string): Promise<IDeviceModel | null>;

    /**
     * Retrieve all devices from the repository.
     * @returns Promise resolving to an array of all devices (empty array if none exist)
     * @throws {RepositoryError} If the operation fails
     */
    listAll(): Promise<IDeviceModel[]>;
}

/**
 * Repository error class for domain-level repository exceptions.
 */
export class RepositoryError extends Error {
    constructor(message: string, public readonly originalError?: Error) {
        super(message);
        this.name = 'RepositoryError';
    }
}
