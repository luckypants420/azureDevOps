import { getLoanRepo } from "../config/appServices";
import { markLoanCollected, Loan } from "../domain/loan";

export async function collectLoan(loanId: string): Promise<Loan> {
  const repo = getLoanRepo();
  const existing = await repo.getById(loanId);

  if (!existing) {
    throw new Error(`Loan ${loanId} not found`);
  }

  const updated = markLoanCollected(existing);
  return await repo.update(updated);
}
