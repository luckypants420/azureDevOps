
export type LoanStatus = "reserved" | "collected" | "returned";

export interface Loan {
  id: string;
  userId: string;
  deviceModelId: string;
  status: LoanStatus;
  reservedAt: Date;
  dueAt: Date;
  collectedAt?: Date;
  returnedAt?: Date;
}

export class LoanValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoanValidationError";
  }
}

// Simple helper: add 2 days
function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

export interface CreateLoanInput {
  id: string;
  userId: string;
  deviceModelId: string;
  reservedAt?: Date; // optional, default = now
}

/**
 * Factory function to create a new Loan in "reserved" state.
 * Enforces the 2-day loan rule.
 */
export function createNewLoan(input: CreateLoanInput): Loan {
  if (!input.id?.trim()) {
    throw new LoanValidationError('Loan id is required');
  }
  if (!input.userId?.trim()) {
    throw new LoanValidationError('userId is required');
  }
  if (!input.deviceModelId?.trim()) {
    throw new LoanValidationError('deviceModelId is required');
  }

  const reservedAt = input.reservedAt ?? new Date();
  const dueAt = addDays(reservedAt, 2); // 2-day rule

  return {
    id: input.id.trim(),
    userId: input.userId.trim(),
    deviceModelId: input.deviceModelId.trim(),
    status: "reserved",
    reservedAt,
    dueAt
  };
}

/**
 * Transition a loan from reserved -> collected.
 */
export function markLoanCollected(loan: Loan, collectedAt?: Date): Loan {
  if (loan.status !== "reserved") {
    throw new LoanValidationError(
      `Cannot collect a loan in status "${loan.status}"`
    );
  }

  const ts = collectedAt ?? new Date();

  return {
    ...loan,
    status: "collected",
    collectedAt: ts
  };
}

/**
 * Transition a loan from collected -> returned.
 */
export function markLoanReturned(loan: Loan, returnedAt?: Date): Loan {
  if (loan.status !== "collected") {
    throw new LoanValidationError(
      `Cannot return a loan in status "${loan.status}"`
    );
  }

  const ts = returnedAt ?? new Date();

  return {
    ...loan,
    status: "returned",
    returnedAt: ts
  };
}
