import { db } from "@/db";

export type RestaurantSettings = {
  acceptingOrders: boolean;
  hoursNote: string;
  deliveryNote: string;
};

const DEFAULTS: RestaurantSettings = {
  acceptingOrders: true,
  hoursNote: "",
  deliveryNote: "",
};

const KEY = "restaurant";

export async function getRestaurantSettings(): Promise<RestaurantSettings> {
  try {
    const row = await db.restaurant_settings.findUnique({ where: { key: KEY } });
    if (!row?.value) return DEFAULTS;
    return { ...DEFAULTS, ...(row.value as Partial<RestaurantSettings>) };
  } catch {
    return DEFAULTS;
  }
}

export async function updateRestaurantSettings(patch: Partial<RestaurantSettings>) {
  const current = await getRestaurantSettings();
  const next = { ...current, ...patch };
  await db.restaurant_settings.upsert({
    where: { key: KEY },
    create: { key: KEY, value: next },
    update: { value: next, updated_at: new Date() },
  });
  return next;
}
