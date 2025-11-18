import { getLoanRepo } from "../config/appServices";
import type { Loan } from "../domain/loan";

export async function listLoansForUser(userId: string): Promise<Loan[]> {
  const repo = getLoanRepo();
  return repo.listByUser(userId);
}
