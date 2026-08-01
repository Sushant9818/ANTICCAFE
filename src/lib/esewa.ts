import { createHmac } from "crypto";

const MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE ?? "EPAYTEST";
const SECRET_KEY = process.env.ESEWA_SECRET_KEY ?? "8gBm/:&EnhH.1/q";
const GATEWAY_URL =
  process.env.ESEWA_GATEWAY_URL ?? "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const STATUS_URL =
  process.env.ESEWA_STATUS_URL ?? "https://rc-epay.esewa.com.np/api/epay/transaction/status/";

function sign(message: string): string {
  return createHmac("sha256", SECRET_KEY).update(message).digest("base64");
}

type BuildFormParams = {
  transactionUuid: string;
  amount: number;
  taxAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  successUrl: string;
  failureUrl: string;
};

export function buildEsewaForm({
  transactionUuid,
  amount,
  taxAmount,
  deliveryCharge,
  totalAmount,
  successUrl,
  failureUrl,
}: BuildFormParams) {
  const amountStr = amount.toFixed(2);
  const taxAmountStr = taxAmount.toFixed(2);
  const deliveryChargeStr = deliveryCharge.toFixed(2);
  const totalAmountStr = totalAmount.toFixed(2);

  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  const message = `total_amount=${totalAmountStr},transaction_uuid=${transactionUuid},product_code=${MERCHANT_CODE}`;
  const signature = sign(message);

  return {
    url: GATEWAY_URL,
    fields: {
      amount: amountStr,
      tax_amount: taxAmountStr,
      total_amount: totalAmountStr,
      transaction_uuid: transactionUuid,
      product_code: MERCHANT_CODE,
      product_service_charge: "0.00",
      product_delivery_charge: deliveryChargeStr,
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: signedFieldNames,
      signature,
    },
  };
}

type EsewaStatusResponse = {
  transaction_code: string;
  status: "COMPLETE" | "PENDING" | "FULL_REFUND" | "PARTIAL_REFUND" | "AMBIGUOUS" | "NOT_FOUND" | "CANCELED";
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
};

export async function verifyEsewaTransaction(
  transactionUuid: string,
  totalAmount: number
): Promise<EsewaStatusResponse> {
  const url = new URL(STATUS_URL);
  url.searchParams.set("product_code", MERCHANT_CODE);
  url.searchParams.set("total_amount", totalAmount.toFixed(2));
  url.searchParams.set("transaction_uuid", transactionUuid);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`eSewa status check failed: ${res.status}`);
  }
  return res.json();
}

export function decodeEsewaCallback(data: string): {
  transaction_code: string;
  status: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  signed_field_names: string;
  signature: string;
} {
  const decoded = Buffer.from(data, "base64").toString("utf-8");
  return JSON.parse(decoded);
}

export function verifyEsewaCallbackSignature(payload: Record<string, string>): boolean {
  const fieldNames = payload.signed_field_names.split(",");
  const message = fieldNames.map((field) => `${field}=${payload[field]}`).join(",");
  return sign(message) === payload.signature;
}
