// Domain types
export interface Device {
  id: string;
  brand: string;
  model: string;
  category: string;
  totalQuantity: number;
  createdAt: string;
}

export interface Loan {
  id: string;
  userId: string;
  deviceModelId: string;
  status: string;
  reservedAt: string;
  dueAt: string;
  collectedAt?: string;
  returnedAt?: string;
}
