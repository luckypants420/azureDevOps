import { describe, it, expect, vi } from 'vitest';
import { createLoan, type CreateLoanRequest } from './create-loan.js';
import { FakeLoanRepo } from '../infra/fake-loan-repo.js';
import { getLoanRepo } from '../config/appServices.js';

// Mock the appServices module
vi.mock('../config/appServices.js', () => ({
    getLoanRepo: vi.fn(),
}));

describe('createLoan', () => {
    it('should create a loan with valid inputs', async () => {
        // Arrange
        const fakeLoanRepo = new FakeLoanRepo();
        vi.mocked(getLoanRepo).mockReturnValue(fakeLoanRepo);

        const request: CreateLoanRequest = {
            userId: 'user-123',
            deviceModelId: 'device-456',
        };

        // Act
        const result = await createLoan(request);

        // Assert
        expect(result).toBeDefined();
        expect(result.userId).toBe('user-123');
        expect(result.deviceModelId).toBe('device-456');
        expect(result.status).toBe('reserved');
        expect(result.id).toBeDefined();
        expect(result.reservedAt).toBeInstanceOf(Date);
        expect(result.dueAt).toBeInstanceOf(Date);

        // Verify loan was stored
        const storedLoan = await fakeLoanRepo.getById(result.id);
        expect(storedLoan).toEqual(result);
    });

    it('should throw error if userId is missing', async () => {
        // Arrange
        const request: CreateLoanRequest = {
            userId: '',
            deviceModelId: 'device-456',
        };

        // Act & Assert
        await expect(createLoan(request)).rejects.toThrow('userId is required');
    });

    it('should throw error if userId is only whitespace', async () => {
        // Arrange
        const request: CreateLoanRequest = {
            userId: '   ',
            deviceModelId: 'device-456',
        };

        // Act & Assert
        await expect(createLoan(request)).rejects.toThrow('userId is required');
    });

    it('should throw error if deviceModelId is missing', async () => {
        // Arrange
        const request: CreateLoanRequest = {
            userId: 'user-123',
            deviceModelId: '',
        };

        // Act & Assert
        await expect(createLoan(request)).rejects.toThrow('deviceModelId is required');
    });

    it('should throw error if deviceModelId is only whitespace', async () => {
        // Arrange
        const request: CreateLoanRequest = {
            userId: 'user-123',
            deviceModelId: '   ',
        };

        // Act & Assert
        await expect(createLoan(request)).rejects.toThrow('deviceModelId is required');
    });

    it('should handle repository errors gracefully', async () => {
        // Arrange
        const errorMessage = 'Database connection failed';
        const faultyRepo = {
            create: vi.fn().mockRejectedValue(new Error(errorMessage)),
            getById: vi.fn(),
            listByUser: vi.fn(),
            update: vi.fn(),
        };
        vi.mocked(getLoanRepo).mockReturnValue(faultyRepo as any);

        const request: CreateLoanRequest = {
            userId: 'user-123',
            deviceModelId: 'device-456',
        };

        // Act & Assert
        await expect(createLoan(request)).rejects.toThrow(errorMessage);
    });
});
