const BASE_URL = process.env.KHALTI_BASE_URL ?? "https://dev.khalti.com/api/v2/";

function secretKey(): string {
  const key = process.env.KHALTI_SECRET_KEY;
  if (!key) throw new Error("KHALTI_SECRET_KEY is not configured");
  return key;
}

type InitiateParams = {
  amountRupees: number;
  purchaseOrderId: string;
  purchaseOrderName: string;
  returnUrl: string;
  websiteUrl: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
};

type InitiateResponse = {
  pidx: string;
  payment_url: string;
  expires_at: string;
  expires_in: number;
};

export async function initiateKhaltiPayment(params: InitiateParams): Promise<InitiateResponse> {
  const res = await fetch(`${BASE_URL}epayment/initiate/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${secretKey()}`,
    },
    body: JSON.stringify({
      return_url: params.returnUrl,
      website_url: params.websiteUrl,
      amount: Math.round(params.amountRupees * 100),
      purchase_order_id: params.purchaseOrderId,
      purchase_order_name: params.purchaseOrderName,
      customer_info: {
        name: params.customerName,
        email: params.customerEmail,
        phone: params.customerPhone,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Khalti initiate failed: ${res.status} ${body}`);
  }

  return res.json();
}

type LookupResponse = {
  pidx: string;
  total_amount: number;
  status: "Completed" | "Pending" | "Initiated" | "Expired" | "User canceled" | "Refunded" | "Partially Refunded";
  transaction_id: string | null;
  fee: number;
  refunded: boolean;
};

export async function lookupKhaltiPayment(pidx: string): Promise<LookupResponse> {
  const res = await fetch(`${BASE_URL}epayment/lookup/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${secretKey()}`,
    },
    body: JSON.stringify({ pidx }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Khalti lookup failed: ${res.status} ${body}`);
  }

  return res.json();
}
