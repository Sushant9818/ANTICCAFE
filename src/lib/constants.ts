export const CAFE_NAME = "AnticCafe";
export const CAFE_TAGLINE = "Breakfast & Brunch · Coffee · Good Vibes";
export const CAFE_DESCRIPTION =
  "Your favourite spot for breakfast and brunch in Bhaktapur — fresh-cooked morning plates, artisan coffee, and a warm vibe that makes every morning worth waking up for.";
export const CAFE_ADDRESS = "Dibyasori Planning, Pepsicola, Bhaktapur, Nepal";
export const CAFE_PHONE = "(555) 123-4567";
export const CAFE_EMAIL = "hello@anticcafe.com";
export const CAFE_HOURS = {
  weekdays: "Mon – Fri: 7:00 AM – 8:00 PM",
  weekends: "Sat – Sun: 8:00 AM – 9:00 PM",
};

export const TAX_RATE = 0.0875; // 8.75%
export const DELIVERY_FEE = 3.99;
export const FREE_DELIVERY_THRESHOLD = 35;

export const ORDER_STATUSES = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
} as const;

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-orange-100 text-orange-800",
  ready: "bg-green-100 text-green-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};
