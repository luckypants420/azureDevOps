
import { CosmosClient, Container, Database } from "@azure/cosmos";
import type { Loan } from "../domain/loan";
import { LoanRepo, LoanRepositoryError } from "../domain/loan-repo";

/**
 * DTO for Cosmos DB document.
 * Note: dates are stored as ISO strings.
 */
export interface LoanDocument {
    id: string;
    userId: string;
    deviceModelId: string;
    status: string;
    reservedAt: string;
    dueAt: string;
    collectedAt?: string;
    returnedAt?: string;
    _ts?: number;
}

export interface CosmosLoanRepoOptions {
    endpoint: string;
    databaseId: string;
    containerId: string;
    accessKey?: string;
}

export class CosmosLoanRepo implements LoanRepo {
    private client: CosmosClient;
    private database: Database;
    private container: Container;

    constructor(private options: CosmosLoanRepoOptions) {
        if (!options.endpoint) {
            throw new Error("Cosmos DB endpoint is required");
        }
        if (!options.databaseId) {
            throw new Error("Cosmos DB databaseId is required");
        }
        if (!options.containerId) {
            throw new Error("Cosmos DB containerId is required");
        }

        this.client = new CosmosClient({
            endpoint: options.endpoint,
            key: options.accessKey
        });

        this.database = this.client.database(options.databaseId);
        this.container = this.database.container(options.containerId);
    }

    async create(loan: Loan): Promise<Loan> {
        try {
            const doc = this.mapLoanToDocument(loan);
            const { resource } = await this.container.items.create(doc);

            if (!resource) {
                throw new LoanRepositoryError("Failed to create loan in Cosmos DB");
            }

            return this.mapDocumentToLoan(resource as LoanDocument);
        } catch (err: any) {
            if (err instanceof LoanRepositoryError) throw err;
            throw new LoanRepositoryError(
                `Failed to create loan: ${err?.message ?? "Unknown error"}`,
                err instanceof Error ? err : undefined
            );
        }
    }

    async getById(id: string): Promise<Loan | null> {
        try {
            const { resource } = await this.container.item(id, id).read<LoanDocument>();
            if (!resource) return null;

            return this.mapDocumentToLoan(resource);
        } catch (err: any) {
            // Cosmos uses 404 when not found
            if (err instanceof Error && err.message.includes("404")) {
                return null;
            }
            throw new LoanRepositoryError(
                `Failed to get loan ${id}: ${err?.message ?? "Unknown error"}`,
                err instanceof Error ? err : undefined
            );
        }
    }

    async listByUser(userId: string): Promise<Loan[]> {
        try {
            const query = {
                query: "SELECT * FROM c WHERE c.userId = @userId",
                parameters: [{ name: "@userId", value: userId }]
            };

            const { resources } = await this.container.items
                .query<LoanDocument>(query)
                .fetchAll();

            return resources.map((doc) => this.mapDocumentToLoan(doc));
        } catch (err: any) {
            throw new LoanRepositoryError(
                `Failed to list loans for user ${userId}: ${err?.message ?? "Unknown error"}`,
                err instanceof Error ? err : undefined
            );
        }
    }

    async update(loan: Loan): Promise<Loan> {
        try {
            const doc = this.mapLoanToDocument(loan);
            const { resource } = await this.container
                .item(doc.id, doc.id)
                .replace(doc);

            if (!resource) {
                throw new LoanRepositoryError("Failed to update loan in Cosmos DB");
            }

            return this.mapDocumentToLoan(resource as LoanDocument);
        } catch (err: any) {
            if (err instanceof LoanRepositoryError) throw err;
            throw new LoanRepositoryError(
                `Failed to update loan: ${err?.message ?? "Unknown error"}`,
                err instanceof Error ? err : undefined
            );
        }
    }

    // Helpers to translate between domain and DB

    private mapLoanToDocument(loan: Loan): LoanDocument {
        return {
            id: loan.id,
            userId: loan.userId,
            deviceModelId: loan.deviceModelId,
            status: loan.status,
            reservedAt: loan.reservedAt.toISOString(),
            dueAt: loan.dueAt.toISOString(),
            collectedAt: loan.collectedAt?.toISOString(),
            returnedAt: loan.returnedAt?.toISOString()
        };
    }

    private mapDocumentToLoan(doc: LoanDocument): Loan {
        return {
            id: doc.id,
            userId: doc.userId,
            deviceModelId: doc.deviceModelId,
            status: doc.status as any,
            reservedAt: new Date(doc.reservedAt),
            dueAt: new Date(doc.dueAt),
            collectedAt: doc.collectedAt ? new Date(doc.collectedAt) : undefined,
            returnedAt: doc.returnedAt ? new Date(doc.returnedAt) : undefined
        };
    }
}
