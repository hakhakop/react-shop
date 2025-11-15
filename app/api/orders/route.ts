import { NextRequest, NextResponse } from "next/server";

/**
 * Try to extract a numeric WooCommerce product ID from a cart item payload.
 * We handle several cases:
 * - direct numeric fields (productId, databaseId, id, product_id)
 * - numeric strings ("123")
 * - base64 GraphQL IDs ("cHJvZHVjdDoxMjM=" -> "product:123")
 */
function getNumericProductIdFromItem(item: any): number | null {
  const candidates = [
    item?.productId,
    item?.databaseId,
    item?.id,
    item?.product_id,
  ].filter((v) => v !== undefined && v !== null);

  for (const raw of candidates) {
    // If it's already a number
    if (typeof raw === "number" && raw > 0 && !Number.isNaN(raw)) {
      return raw;
    }

    const str = String(raw);

    // 1) Direct numeric string
    const asNumber = Number(str);
    if (!Number.isNaN(asNumber) && asNumber > 0) {
      return asNumber;
    }

    // 2) Try base64 decode (GraphQL global ID like "product:123")
    try {
      const decoded = Buffer.from(str, "base64").toString("utf8");
      // e.g. "post:123", "product:45", or maybe just "123"
      const parts = decoded.split(":");
      const maybeId = parts[1] ?? parts[0];
      const fromDecoded = Number(maybeId);
      if (!Number.isNaN(fromDecoded) && fromDecoded > 0) {
        return fromDecoded;
      }
    } catch {
      // ignore, go to next candidate
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  const apiUrl = process.env.WC_API_URL;
  const ck = process.env.WC_CONSUMER_KEY;
  const cs = process.env.WC_CONSUMER_SECRET;

  if (!apiUrl || !ck || !cs) {
    return NextResponse.json(
      {
        success: false,
        message: "WooCommerce API environment variables are missing.",
      },
      { status: 500 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { customer, items } = body || {};

  if (!customer || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message: "Customer info and at least one item are required.",
      },
      { status: 400 }
    );
  }

  // Normalize line items: { product_id, quantity }
  const line_items = items
    .map((item: any) => {
      const productId = getNumericProductIdFromItem(item);
      const quantity = Number(item.quantity ?? item.qty ?? 1);

      if (!productId || quantity <= 0 || Number.isNaN(quantity)) {
        return null;
      }

      return {
        product_id: productId,
        quantity,
      };
    })
    .filter(Boolean);

  if (line_items.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message:
          "No valid line items could be built. Check product IDs in cart items.",
      },
      { status: 400 }
    );
  }

  const name = (customer.name ?? "").toString().trim();
  const [first_name, ...restName] = name.split(" ");
  const last_name = restName.join(" ");

  const billing = {
    first_name,
    last_name,
    address_1: (customer.address ?? "").toString(),
    city: "",
    state: "",
    postcode: "",
    country: "",
    email: (customer.email ?? "").toString(),
    phone: (customer.phone ?? "").toString(),
  };

  const orderPayload = {
    payment_method: "cod",
    payment_method_title: "Cash on delivery",
    set_paid: false,
    billing,
    shipping: billing,
    line_items,
  };

  try {
    const auth = Buffer.from(`${ck}:${cs}`).toString("base64");

    const res = await fetch(`${apiUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("WooCommerce error:", data);
      return NextResponse.json(
        {
          success: false,
          message:
            data?.message ||
            "Failed to create order in WooCommerce. See server logs.",
        },
        { status: res.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        orderId: data.id,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error calling WooCommerce:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Unexpected error talking to WooCommerce.",
      },
      { status: 500 }
    );
  }
}