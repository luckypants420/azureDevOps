import { createNewLoan, Loan } from "../domain/loan.js";
import { getLoanRepo } from "../config/appServices.js";

export interface CreateLoanRequest {
    userId: string;
    deviceModelId: string;
}

export async function createLoan(req: CreateLoanRequest): Promise<Loan> {
    if (!req.userId?.trim()) {
        throw new Error("userId is required");
    }
    if (!req.deviceModelId?.trim()) {
        throw new Error("deviceModelId is required");
    }

    // Dynamically import uuid to handle ESM compatibility
    const { v4: uuidv4 } = await import("uuid");

    const loan = createNewLoan({
        id: uuidv4(),
        userId: req.userId,
        deviceModelId: req.deviceModelId
    });

    const repo = getLoanRepo();
    const created = await repo.create(loan);
    return created;
}
