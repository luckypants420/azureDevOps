import { describe, it, expect, vi } from 'vitest';
import { collectLoan } from './collect-loan.js';
import { FakeLoanRepo } from '../infra/fake-loan-repo.js';
import { getLoanRepo } from '../config/appServices.js';
import type { Loan } from '../domain/loan.js';

vi.mock('../config/appServices.js', () => ({
    getLoanRepo: vi.fn(),
}));

describe('collectLoan', () => {
    it('should mark a reserved loan as collected', async () => {
        // Arrange
        const fakeLoanRepo = new FakeLoanRepo();
        vi.mocked(getLoanRepo).mockReturnValue(fakeLoanRepo);

        const reservedLoan: Loan = {
            id: 'loan-123',
            userId: 'user-456',
            deviceModelId: 'device-789',
            status: 'reserved',
            reservedAt: new Date('2025-01-01T10:00:00Z'),
            dueAt: new Date('2025-01-03T10:00:00Z'),
        };
        fakeLoanRepo.seed([reservedLoan]);

        // Act
        const result = await collectLoan('loan-123');

        // Assert
        expect(result.status).toBe('collected');
        expect(result.collectedAt).toBeInstanceOf(Date);
        expect(result.id).toBe('loan-123');

        // Verify persistence
        const stored = await fakeLoanRepo.getById('loan-123');
        expect(stored?.status).toBe('collected');
    });

    it('should throw error if loan not found', async () => {
        // Arrange
        const fakeLoanRepo = new FakeLoanRepo();
        vi.mocked(getLoanRepo).mockReturnValue(fakeLoanRepo);

        // Act & Assert
        await expect(collectLoan('non-existent-loan')).rejects.toThrow(
            'Loan non-existent-loan not found'
        );
    });

    it('should throw error if loan is already collected', async () => {
        // Arrange
        const fakeLoanRepo = new FakeLoanRepo();
        vi.mocked(getLoanRepo).mockReturnValue(fakeLoanRepo);

        const collectedLoan: Loan = {
            id: 'loan-123',
            userId: 'user-456',
            deviceModelId: 'device-789',
            status: 'collected',
            reservedAt: new Date(),
            dueAt: new Date(),
            collectedAt: new Date(),
        };
        fakeLoanRepo.seed([collectedLoan]);

        // Act & Assert
        await expect(collectLoan('loan-123')).rejects.toThrow(
            'Cannot collect a loan in status "collected"'
        );
    });

    it('should throw error if loan is already returned', async () => {
        // Arrange
        const fakeLoanRepo = new FakeLoanRepo();
        vi.mocked(getLoanRepo).mockReturnValue(fakeLoanRepo);

        const returnedLoan: Loan = {
            id: 'loan-123',
            userId: 'user-456',
            deviceModelId: 'device-789',
            status: 'returned',
            reservedAt: new Date(),
            dueAt: new Date(),
            collectedAt: new Date(),
            returnedAt: new Date(),
        };
        fakeLoanRepo.seed([returnedLoan]);

        // Act & Assert
        await expect(collectLoan('loan-123')).rejects.toThrow(
            'Cannot collect a loan in status "returned"'
        );
    });

    it('should handle repository errors gracefully', async () => {
        // Arrange
        const errorMessage = 'Database update failed';
        const faultyRepo = {
            getById: vi.fn().mockResolvedValue({
                id: 'loan-123',
                userId: 'user-456',
                deviceModelId: 'device-789',
                status: 'reserved',
                reservedAt: new Date(),
                dueAt: new Date(),
            }),
            update: vi.fn().mockRejectedValue(new Error(errorMessage)),
            create: vi.fn(),
            listByUser: vi.fn(),
        };
        vi.mocked(getLoanRepo).mockReturnValue(faultyRepo as any);

        // Act & Assert
        await expect(collectLoan('loan-123')).rejects.toThrow(errorMessage);
    });
});
