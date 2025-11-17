import { CosmosClient, Container, Database } from '@azure/cosmos';
import { IDeviceModel } from '../domain/device';
import { IDeviceRepo, RepositoryError } from '../domain/device-repo';

/**
 * DTO type representing the document shape in Azure Cosmos DB.
 * Separate from the domain model to allow schema flexibility and independent evolution.
 */
export interface DeviceDocument {
    id: string;
    brand: string;
    model: string;
    category: string;
    totalQuantity: number;
    createdAt: string; // ISO 8601 string in Cosmos
    _ts?: number; // Cosmos DB server timestamp
}

/**
 * Configuration options for CosmosDeviceRepo
 */
export interface CosmosDeviceRepoOptions {
    /** Cosmos DB endpoint URI */
    endpoint: string;
    /** Database identifier */
    databaseId: string;
    /** Container identifier */
    containerId: string;
    /** Optional access key (if not using other auth methods) */
    accessKey?: string;
}

/**
 * Azure Cosmos DB (NoSQL) implementation of IDeviceRepo
 */
export class CosmosDeviceRepo implements IDeviceRepo {
    private cosmosClient: CosmosClient;
    private database: Database;
    private container: Container;

    constructor(private options: CosmosDeviceRepoOptions) {
        if (!options.endpoint) {
            throw new Error('Cosmos DB endpoint is required');
        }
        if (!options.databaseId) {
            throw new Error('Database ID is required');
        }
        if (!options.containerId) {
            throw new Error('Container ID is required');
        }

        // Initialize Cosmos client with provided configuration
        this.cosmosClient = new CosmosClient({
            endpoint: options.endpoint,
            key: options.accessKey,
            // Note: When accessKey is undefined, CosmosClient will use other auth methods
            // such as DefaultAzureCredential or connection string
        });

        this.database = this.cosmosClient.database(options.databaseId);
        this.container = this.database.container(options.containerId);
    }

    /**
     * Create a new device in Cosmos DB
     */
    async create(device: IDeviceModel): Promise<IDeviceModel> {
        try {
            const cosmosDocument = this.mapDeviceToDocument(device);

            const { resource } = await this.container.items.create(cosmosDocument);

            if (!resource) {
                throw new RepositoryError('Failed to create device in Cosmos DB');
            }

            return this.mapDocumentToDevice(resource as DeviceDocument);
        } catch (error) {
            if (error instanceof RepositoryError) {
                throw error;
            }
            throw new RepositoryError(
                `Failed to create device: ${error instanceof Error ? error.message : 'Unknown error'}`,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Retrieve a device by ID from Cosmos DB
     */
    async getById(id: string): Promise<IDeviceModel | null> {
        try {
            const { resource } = await this.container.item(id, id).read<DeviceDocument>();

            if (!resource) {
                return null;
            }

            return this.mapDocumentToDevice(resource);
        } catch (error) {
            // Cosmos DB returns 404 when item not found - we treat this as null, not an error
            if (error instanceof Error && error.message.includes('404')) {
                return null;
            }

            throw new RepositoryError(
                `Failed to retrieve device ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Retrieve all devices from Cosmos DB
     */
    async listAll(): Promise<IDeviceModel[]> {
        try {
            const query = 'SELECT * FROM c';
            const { resources } = await this.container.items.query<DeviceDocument>(query).fetchAll();

            return resources.map((doc) => this.mapDocumentToDevice(doc));
        } catch (error) {
            throw new RepositoryError(
                `Failed to retrieve devices: ${error instanceof Error ? error.message : 'Unknown error'}`,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Map domain model to Cosmos DB document
     */
    private mapDeviceToDocument(device: IDeviceModel): DeviceDocument {
        return {
            id: device.id,
            brand: device.brand,
            model: device.model,
            category: device.category,
            totalQuantity: device.totalQuantity,
            createdAt: device.createdAt.toISOString(),
        };
    }

    /**
     * Map Cosmos DB document to domain model
     */
    private mapDocumentToDevice(doc: DeviceDocument): IDeviceModel {
        return {
            id: doc.id,
            brand: doc.brand,
            model: doc.model,
            category: doc.category,
            totalQuantity: doc.totalQuantity,
            createdAt: new Date(doc.createdAt),
        };
    }
}
