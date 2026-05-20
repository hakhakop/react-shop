import { NextRequest, NextResponse } from "next/server";

type WooCustomerAddress = {
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  email?: string;
  phone?: string;
};

type WooCustomer = {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  billing?: WooCustomerAddress;
  shipping?: WooCustomerAddress;
};

function normalizeAddress(address?: WooCustomerAddress | null) {
  return {
    firstName: address?.first_name ?? "",
    lastName: address?.last_name ?? "",
    company: address?.company ?? "",
    address1: address?.address_1 ?? "",
    address2: address?.address_2 ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    postcode: address?.postcode ?? "",
    country: address?.country ?? "",
    email: address?.email ?? "",
    phone: address?.phone ?? "",
  };
}

export async function GET(request: NextRequest) {
  const apiUrl = process.env.WC_API_URL;
  const ck = process.env.WC_CONSUMER_KEY;
  const cs = process.env.WC_CONSUMER_SECRET;
  const customerId = request.nextUrl.searchParams.get("customerId")?.trim();

  if (!apiUrl || !ck || !cs) {
    return NextResponse.json(
      { message: "WooCommerce API environment variables are missing." },
      { status: 500 }
    );
  }

  if (!customerId || !/^\d+$/.test(customerId)) {
    return NextResponse.json(
      { message: "A numeric WooCommerce customerId is required." },
      { status: 400 }
    );
  }

  try {
    const auth = Buffer.from(`${ck}:${cs}`).toString("base64");
    const response = await fetch(`${apiUrl}/customers/${customerId}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${auth}`,
      },
      cache: "no-store",
    });

    const payload = (await response.json()) as WooCustomer & {
      message?: string;
    };

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            payload.message ||
            `WooCommerce returned ${response.status} while loading customer details.`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      id: payload.id,
      firstName: payload.first_name ?? "",
      lastName: payload.last_name ?? "",
      username: payload.username ?? "",
      email: payload.email ?? "",
      billing: normalizeAddress(payload.billing),
      shipping: normalizeAddress(payload.shipping),
    });
  } catch {
    return NextResponse.json(
      { message: "React could not reach WooCommerce customer details." },
      { status: 502 }
    );
  }
}
