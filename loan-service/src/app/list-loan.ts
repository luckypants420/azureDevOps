import { getLoanRepo } from "../config/appServices.js";
import type { Loan } from "../domain/loan.js";

export async function listLoansForUser(userId: string): Promise<Loan[]> {
  const repo = getLoanRepo();
  return repo.listByUser(userId);
}
