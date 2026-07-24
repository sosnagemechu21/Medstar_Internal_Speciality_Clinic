import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let {
      amount,
      email,
      firstName,
      lastName,
      txRef,
      callbackUrl,
      returnUrl,
      locale,
    } = body;

    // Detect and validate user locale (defaults to English 'en')
    const userLocale = locale === "am" ? "am" : "en";

    // Trim email if it is a string, and fallback if empty or missing
    if (typeof email === "string") {
      email = email.trim();
    }
    if (!email) {
      email = "abebe@gmail.com"; // Default fallback email for guest checkouts
    }
    if (!txRef) {
      txRef = `medstar-tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    // Use the request origin to dynamically support both localhost and Vercel without hardcoding
    const clientOrigin = request.headers.get("origin");
    const baseUrl = clientOrigin || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const payload = {
      amount: amount.toString(),
      currency: "ETB",
      email,
      first_name: firstName || "Valued",
      last_name: lastName || "Patient",
      tx_ref: txRef,
      callback_url: callbackUrl || `${baseUrl}/api/payments/verify`,
      return_url:
        returnUrl || `${baseUrl}/${userLocale}/book/success?tx_ref=${txRef}`,
    };

    console.log("Sending payload to Chapa:", payload);

    const chapaResponse = await fetch(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await chapaResponse.json();
    console.log("Chapa response:", data);

    if (!chapaResponse.ok || data.status !== "success") {
      return NextResponse.json(
        { error: data.message || "Failed to initialize Chapa payment" },
        { status: 400 },
      );
    }

    return NextResponse.json({ checkoutUrl: data.data.checkout_url });
  } catch (error) {
    console.error("Payment route error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
