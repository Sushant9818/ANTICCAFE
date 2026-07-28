export type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Customer = {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  loyaltyPoints: number;
  orderCount: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Order = {
  id: string;
  orderNumber: number;
  customerId: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  orderType: string;
  status: string;
  paymentStatus: string;
  subtotal: string;
  tax: string;
  tip: string;
  deliveryFee: string;
  discount: string;
  total: string;
  promoCode: string | null;
  stripePaymentIntentId: string | null;
  stripeCheckoutSessionId: string | null;
  deliveryAddress: string | null;
  deliveryCity: string | null;
  deliveryState: string | null;
  deliveryZip: string | null;
  specialInstructions: string | null;
  accessToken: string | null;
  scheduledFor: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItem = {
  id: string;
  orderId: string;
  menuItemId: string | null;
  itemName: string;
  itemPrice: string;
  quantity: number;
  specialInstructions: string | null;
  createdAt: Date;
};

export type Reservation = {
  id: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  date: string;
  timeSlot: string;
  partySize: number;
  status: string;
  specialRequests: string | null;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Staff = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Promo = {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: string;
  minOrder: string;
  maxRedemptions: number | null;
  timesRedeemed: number;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type RestaurantSetting = {
  key: string;
  value: any;
  updatedAt: Date;
};
