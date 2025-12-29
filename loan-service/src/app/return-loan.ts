// src/app/return-loan.ts
import { getLoanRepo } from "../config/appServices.js";
import { markLoanReturned, Loan } from "../domain/loan.js";

export async function returnLoan(loanId: string): Promise<Loan> {
  const repo = getLoanRepo();
  const existing = await repo.getById(loanId);

  if (!existing) {
    throw new Error(`Loan ${loanId} not found`);
  }

  const updated = markLoanReturned(existing);

  return await repo.update(updated);
}
