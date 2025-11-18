// src/app/list-devices.ts
import type { IDeviceModel } from "../domain/device";
import { getDeviceRepo } from "../config/appServices";

/**
 * Application use case: list all device models.
 * Thin application layer: delegates to repository, could apply filtering/sorting.
 */
export async function listDevices(): Promise<IDeviceModel[]> {
  const repo = getDeviceRepo();
  const devices = await repo.listAll();

  // later you could sort by brand/model, filter by category, etc.
  return devices;
}
