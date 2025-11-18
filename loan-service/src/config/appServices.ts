// src/config/appServices.ts
import type { LoanRepo } from "../domain/loan-repo";
import { CosmosLoanRepo } from "../infra/cosmos-loan-repo";

let loanRepo: LoanRepo | null = null;

export function getLoanRepo(): LoanRepo {
  if (!loanRepo) {
    const endpoint = process.env.LOANS_COSMOS_ENDPOINT;
    const key = process.env.LOANS_COSMOS_KEY;
    const databaseId = process.env.LOANS_COSMOS_DATABASE_ID;
    const containerId = process.env.LOANS_COSMOS_CONTAINER_ID;

    if (!endpoint || !key || !databaseId || !containerId) {
      throw new Error(
        "LOANS_COSMOS_ENDPOINT, LOANS_COSMOS_KEY, LOANS_COSMOS_DATABASE_ID, or LOANS_COSMOS_CONTAINER_ID not set"
      );
    }

    loanRepo = new CosmosLoanRepo({
      endpoint,
      accessKey: key,
      databaseId,
      containerId
    });
  }

  return loanRepo;
}
