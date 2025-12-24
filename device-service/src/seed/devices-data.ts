import type { IDeviceModel } from "../domain/device.js";

export const seedDevices: IDeviceModel[] = [
  {
    id: "device-1",
    brand: "Dell",
    model: "Latitude 5420",
    category: "laptop",
    totalQuantity: 5,
    createdAt: new Date()
  },
  {
    id: "device-2",
    brand: "Apple",
    model: "iPad Air 5",
    category: "tablet",
    totalQuantity: 3,
    createdAt: new Date()
  },
  {
    id: "device-3",
    brand: "Canon",
    model: "EOS 250D",
    category: "camera",
    totalQuantity: 2,
    createdAt: new Date()
  }
];
