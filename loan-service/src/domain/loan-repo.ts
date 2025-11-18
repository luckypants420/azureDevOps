import type { Loan } from "./loan";

export interface LoanRepo {
  create(loan: Loan): Promise<Loan>;
  getById(id: string): Promise<Loan | null>;
  listByUser(userId: string): Promise<Loan[]>;
  update(loan: Loan): Promise<Loan>;
}

export class LoanRepositoryError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = "LoanRepositoryError";
  }
}
