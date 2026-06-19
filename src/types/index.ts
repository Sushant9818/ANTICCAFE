export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  specialInstructions?: string;
};

export type CartState = {
  items: CartItem[];
  orderType: "pickup" | "delivery";
};

export type CheckoutFormData = {
  name: string;
  email: string;
  phone: string;
  orderType: "pickup" | "delivery";
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZip?: string;
  specialInstructions?: string;
  promoCode?: string;
  tip: number;
};

export type OrderStatusUpdate = {
  status: string;
  updatedAt: string;
};

export type AdminOrderWithItems = {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  orderType: string;
  status: string;
  paymentStatus: string;
  subtotal: string;
  tax: string;
  tip: string | null;
  deliveryFee: string | null;
  total: string;
  specialInstructions: string | null;
  createdAt: Date | null;
  items: {
    id: string;
    itemName: string;
    itemPrice: string;
    quantity: number;
    specialInstructions: string | null;
  }[];
};
