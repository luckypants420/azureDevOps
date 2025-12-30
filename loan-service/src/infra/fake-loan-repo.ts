import type { Loan } from '../domain/loan.js';
import type { LoanRepo } from '../domain/loan-repo.js';

/**
 * Fake (in-memory) loan repository for testing purposes.
 * Does not persist data between instances.
 */
export class FakeLoanRepo implements LoanRepo {
  private loans: Map<string, Loan> = new Map();

  /**
   * Set initial loans for testing
   */
  seed(loans: Loan[]): void {
    loans.forEach(loan => this.loans.set(loan.id, loan));
  }

  /**
   * Get all loans
   */
  getAll(): Loan[] {
    return Array.from(this.loans.values());
  }

  async create(loan: Loan): Promise<Loan> {
    this.loans.set(loan.id, loan);
    return loan;
  }

  async getById(id: string): Promise<Loan | null> {
    return this.loans.get(id) ?? null;
  }

  async listByUserId(userId: string): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter(
      (loan) => loan.userId === userId
    );
  }

  async listByUser(userId: string): Promise<Loan[]> {
    return this.listByUserId(userId);
  }

  async update(loan: Loan): Promise<Loan> {
    if (!this.loans.has(loan.id)) {
      throw new Error(`Loan ${loan.id} not found`);
    }
    this.loans.set(loan.id, loan);
    return loan;
  }

  async delete(id: string): Promise<void> {
    this.loans.delete(id);
  }
}
