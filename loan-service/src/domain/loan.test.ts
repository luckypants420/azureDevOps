import { describe, it, expect } from 'vitest';
import {
    createNewLoan,
    markLoanCollected,
    markLoanReturned,
    LoanValidationError,
    type Loan,
} from './loan.js';

describe('createNewLoan', () => {
    it('should create a loan with valid inputs', () => {
        const input = {
            id: 'loan-123',
            userId: 'user-456',
            deviceModelId: 'device-789',
        };

        const loan = createNewLoan(input);

        expect(loan.id).toBe('loan-123');
        expect(loan.userId).toBe('user-456');
        expect(loan.deviceModelId).toBe('device-789');
        expect(loan.status).toBe('reserved');
        expect(loan.reservedAt).toBeInstanceOf(Date);
        expect(loan.dueAt).toBeInstanceOf(Date);
        expect(loan.collectedAt).toBeUndefined();
        expect(loan.returnedAt).toBeUndefined();
    });

    it('should set dueAt to 2 days after reservedAt', () => {
        const reservedAt = new Date('2025-01-01T10:00:00Z');
        const input = {
            id: 'loan-123',
            userId: 'user-456',
            deviceModelId: 'device-789',
            reservedAt,
        };

        const loan = createNewLoan(input);

        const expectedDueAt = new Date('2025-01-03T10:00:00Z');
        expect(loan.dueAt.getTime()).toBe(expectedDueAt.getTime());
    });

    it('should trim whitespace from inputs', () => {
        const input = {
            id: '  loan-123  ',
            userId: '  user-456  ',
            deviceModelId: '  device-789  ',
        };

        const loan = createNewLoan(input);

        expect(loan.id).toBe('loan-123');
        expect(loan.userId).toBe('user-456');
        expect(loan.deviceModelId).toBe('device-789');
    });

    it('should throw error if id is missing', () => {
        const input = {
            id: '',
            userId: 'user-456',
            deviceModelId: 'device-789',
        };

        expect(() => createNewLoan(input)).toThrow(LoanValidationError);
        expect(() => createNewLoan(input)).toThrow('Loan id is required');
    });

    it('should throw error if userId is missing', () => {
        const input = {
            id: 'loan-123',
            userId: '',
            deviceModelId: 'device-789',
        };

        expect(() => createNewLoan(input)).toThrow(LoanValidationError);
        expect(() => createNewLoan(input)).toThrow('userId is required');
    });

    it('should throw error if deviceModelId is missing', () => {
        const input = {
            id: 'loan-123',
            userId: 'user-456',
            deviceModelId: '',
        };

        expect(() => createNewLoan(input)).toThrow(LoanValidationError);
        expect(() => createNewLoan(input)).toThrow('deviceModelId is required');
    });

    it('should throw error if id is only whitespace', () => {
        const input = {
            id: '   ',
            userId: 'user-456',
            deviceModelId: 'device-789',
        };

        expect(() => createNewLoan(input)).toThrow(LoanValidationError);
    });
});

describe('markLoanCollected', () => {
    it('should mark a reserved loan as collected', () => {
        const loan: Loan = {
            id: 'loan-123',
            userId: 'user-456',
            deviceModelId: 'device-789',
            status: 'reserved',
            reservedAt: new Date(),
            dueAt: new Date(),
        };

        const collected = markLoanCollected(loan);

        expect(collected.status).toBe('collected');
        expect(collected.collectedAt).toBeInstanceOf(Date);
        expect(collected.id).toBe(loan.id);
        expect(collected.userId).toBe(loan.userId);
    });

    it('should use provided collectedAt timestamp', () => {
        const loan: Loan = {
            id: 'loan-123',
            userId: 'user-456',
            deviceModelId: 'device-789',
            status: 'reserved',
            reservedAt: new Date(),
            dueAt: new Date(),
        };

        const customTime = new Date('2025-01-02T14:30:00Z');
        const collected = markLoanCollected(loan, customTime);

        expect(collected.collectedAt?.getTime()).toBe(customTime.getTime());
    });

    it('should throw error if loan is already collected', () => {
        const loan: Loan = {
            id: 'loan-123',
            userId: 'user-456',
            deviceModelId: 'device-789',
            status: 'collected',
            reservedAt: new Date(),
            dueAt: new Date(),
            collectedAt: new Date(),
        };

        expect(() => markLoanCollected(loan)).toThrow(LoanValidationError);
        expect(() => markLoanCollected(loan)).toThrow('Cannot collect a loan in status "collected"');
    });

    it('should throw error if loan is already returned', () => {
        const loan: Loan = {
            id: 'loan-123',
            userId: 'user-456',
            deviceModelId: 'device-789',
            status: 'returned',
            reservedAt: new Date(),
            dueAt: new Date(),
            collectedAt: new Date(),
            returnedAt: new Date(),
        };

        expect(() => markLoanCollected(loan)).toThrow(LoanValidationError);
        expect(() => markLoanCollected(loan)).toThrow('Cannot collect a loan in status "returned"');
    });
});

describe('markLoanReturned', () => {
    it('should mark a collected loan as returned', () => {
        const loan: Loan = {
            id: 'loan-123',
            userId: 'user-456',
            deviceModelId: 'device-789',
            status: 'collected',
            reservedAt: new Date(),
            dueAt: new Date(),
            collectedAt: new Date(),
        };

        const returned = markLoanReturned(loan);

        expect(returned.status).toBe('returned');
        expect(returned.returnedAt).toBeInstanceOf(Date);
        expect(returned.collectedAt).toBe(loan.collectedAt);
    });

    it('should use provided returnedAt timestamp', () => {
        const loan: Loan = {
            id: 'loan-123',
            userId: 'user-456',
            deviceModelId: 'device-789',
            status: 'collected',
            reservedAt: new Date(),
            dueAt: new Date(),
            collectedAt: new Date(),
        };

        const customTime = new Date('2025-01-03T16:45:00Z');
        const returned = markLoanReturned(loan, customTime);

        expect(returned.returnedAt?.getTime()).toBe(customTime.getTime());
    });

    it('should throw error if loan is still reserved', () => {
        const loan: Loan = {
            id: 'loan-123',
            userId: 'user-456',
            deviceModelId: 'device-789',
            status: 'reserved',
            reservedAt: new Date(),
            dueAt: new Date(),
        };

        expect(() => markLoanReturned(loan)).toThrow(LoanValidationError);
        expect(() => markLoanReturned(loan)).toThrow('Cannot return a loan in status "reserved"');
    });

    it('should throw error if loan is already returned', () => {
        const loan: Loan = {
            id: 'loan-123',
            userId: 'user-456',
            deviceModelId: 'device-789',
            status: 'returned',
            reservedAt: new Date(),
            dueAt: new Date(),
            collectedAt: new Date(),
            returnedAt: new Date(),
        };

        expect(() => markLoanReturned(loan)).toThrow(LoanValidationError);
        expect(() => markLoanReturned(loan)).toThrow('Cannot return a loan in status "returned"');
    });
});
