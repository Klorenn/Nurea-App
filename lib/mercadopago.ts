/**
 * Mercado Pago Utility Library
 * Uses raw fetch to avoid dependency issues and ensure edge compatibility.
 */

const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.warn("MERCADOPAGO_ACCESS_TOKEN is missing in environment variables");
}

export async function createPreference(data: {
  items: Array<{
    id?: string;
    title: string;
    unit_price: number;
    quantity: number;
    currency_id?: string;
  }>;
  payer?: {
    name?: string;
    surname?: string;
    email: string;
  };
  back_urls?: {
    success: string;
    pending: string;
    failure: string;
  };
  auto_return?: "approved" | "all";
  external_reference?: string;
  metadata?: Record<string, any>;
}) {
  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      items: data.items.map((item) => ({
        ...item,
        currency_id: item.currency_id || "CLP",
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Mercado Pago Error: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

/**
 * Create a Subscription Plan (Preapproval Plan)
 */
export async function createPreapprovalPlan(data: {
  reason: string;
  auto_recurring: {
    frequency: number;
    frequency_type: "days" | "months";
    transaction_amount: number;
    currency_id: string;
  };
  back_url: string;
}) {
  const response = await fetch("https://api.mercadopago.com/preapproval_plan", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Mercado Pago Subscription Plan Error: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

/**
 * Subscribe a customer to a plan (Preapproval)
 */
export async function createPreapproval(data: {
  preapproval_plan_id: string;
  payer_email: string;
  back_url: string;
  reason: string;
  external_reference?: string;
}) {
  const response = await fetch("https://api.mercadopago.com/preapproval", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 0, // Defined by the plan
        currency_id: "CLP",
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Mercado Pago Preapproval Error: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

/**
 * Create a dynamic subscription with a custom price (used for referral code discounts).
 * Does not require a preapproval_plan_id — price is set directly.
 * Returns an object with `init_point` to redirect the user to checkout.
 */
export async function createDynamicSubscription(data: {
  payer_email: string;
  back_url: string;
  reason: string;
  transaction_amount: number;
  frequency: number;
  frequency_type: "days" | "months";
  external_reference: string;
  metadata?: Record<string, string>;
}) {
  const response = await fetch("https://api.mercadopago.com/preapproval", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reason: data.reason,
      payer_email: data.payer_email,
      back_url: data.back_url,
      external_reference: data.external_reference,
      status: "pending",
      auto_recurring: {
        frequency: data.frequency,
        frequency_type: data.frequency_type,
        transaction_amount: data.transaction_amount,
        currency_id: "CLP",
      },
      ...(data.metadata ? { metadata: data.metadata } : {}),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Mercado Pago Dynamic Subscription Error: ${JSON.stringify(error)}`);
  }

  return await response.json() as { id: string; init_point: string; status: string };
}
