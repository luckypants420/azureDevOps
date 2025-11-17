import { getDeviceRepo } from "../config/appServices";
import { seedDevices } from "./devices-data";

async function run() {
  const repo = getDeviceRepo();

  for (const device of seedDevices) {
    console.log(`Seeding device ${device.id}...`);
    await repo.create(device);
  }

  console.log("Done seeding devices.");
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
