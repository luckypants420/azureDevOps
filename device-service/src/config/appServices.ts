import type { IDeviceRepo } from "../domain/device-repo.js";
import { CosmosDeviceRepo } from "../infra/cosmos-device-repo.js";

let deviceRepo: IDeviceRepo | null = null;

export function getDeviceRepo(): IDeviceRepo {
  if (!deviceRepo) {
    const endpoint = process.env.COSMOS_ENDPOINT;
    const key = process.env.COSMOS_KEY;
    const databaseId = process.env.COSMOS_DATABASE_ID;
    const containerId = process.env.COSMOS_CONTAINER_ID;

    if (!endpoint || !key || !databaseId || !containerId) {
      throw new Error(
        "COSMOS_ENDPOINT, COSMOS_KEY, COSMOS_DATABASE_ID, or COSMOS_CONTAINER_ID not set in environment"
      );
    }

    deviceRepo = new CosmosDeviceRepo({
      endpoint,
      databaseId,
      containerId,
      accessKey: key,
    });
  }

  return deviceRepo;
}