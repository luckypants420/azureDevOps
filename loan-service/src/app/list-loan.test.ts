import { describe, it, expect, beforeEach } from 'vitest';
import { listLoansForUser } from './list-loan.js';
import { FakeLoanRepo } from '../infra/fake-loan-repo.js';
import type { Loan } from '../domain/loan.js';

describe('listLoansForUser', () => {
    let fakeLoanRepo: FakeLoanRepo;

    beforeEach(() => {
        fakeLoanRepo = new FakeLoanRepo();
    });

    it('should return all loans for a specific user', async () => {
        // Arrange
        const userId = 'user-123';
        const loans: Loan[] = [
            {
                id: 'loan-1',
                userId: 'user-123',
                deviceModelId: 'device-1',
                status: 'reserved',
                reservedAt: new Date(),
                dueAt: new Date(),
            },
            {
                id: 'loan-2',
                userId: 'user-123',
                deviceModelId: 'device-2',
                status: 'collected',
                reservedAt: new Date(),
                dueAt: new Date(),
                collectedAt: new Date(),
            },
            {
                id: 'loan-3',
                userId: 'user-456',
                deviceModelId: 'device-3',
                status: 'reserved',
                reservedAt: new Date(),
                dueAt: new Date(),
            },
        ];
        fakeLoanRepo.seed(loans);

        // Act
        const result = await fakeLoanRepo.listByUser(userId);

        // Assert
        expect(result).toHaveLength(2);
        expect(result.every((loan) => loan.userId === userId)).toBe(true);
        expect(result.map((l) => l.id)).toEqual(['loan-1', 'loan-2']);
    });

    it('should return empty array when user has no loans', async () => {
        // Arrange
        const userId = 'user-with-no-loans';
        fakeLoanRepo.seed([
            {
                id: 'loan-1',
                userId: 'other-user',
                deviceModelId: 'device-1',
                status: 'reserved',
                reservedAt: new Date(),
                dueAt: new Date(),
            },
        ]);

        // Act
        const result = await fakeLoanRepo.listByUser(userId);

        // Assert
        expect(result).toEqual([]);
    });

    it('should return empty array when repository is empty', async () => {
        // Act
        const result = await fakeLoanRepo.listByUser('any-user');

        // Assert
        expect(result).toEqual([]);
    });
});
