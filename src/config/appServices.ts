// src/config/appServices.ts
import type { IDeviceRepo } from "../domain/device-repo";
import { CosmosDeviceRepo } from "../infra/cosmos-device-repo";

let deviceRepo: IDeviceRepo | null = null;

export function getDeviceRepo(): IDeviceRepo {
  if (!deviceRepo) {
    const endpoint = process.env.COSMOS_ENDPOINT;
    const key = process.env.COSMOS_KEY;

    if (!endpoint || !key) {
      throw new Error("COSMOS_ENDPOINT or COSMOS_KEY not set in environment");
    }

    deviceRepo = new CosmosDeviceRepo({
      endpoint,
      databaseId: "devices-db",
      containerId: "devices",
      accessKey: key,        
    });
  }

  return deviceRepo;
}
