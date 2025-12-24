import { getLoanRepo } from "../config/appServices.js";
import { markLoanCollected, Loan } from "../domain/loan.js";

export async function collectLoan(loanId: string): Promise<Loan> {
  const repo = getLoanRepo();
  const existing = await repo.getById(loanId);

  if (!existing) {
    throw new Error(`Loan ${loanId} not found`);
  }

  const updated = markLoanCollected(existing);
  return await repo.update(updated);
}
