import axios from "axios";

/**
 * Generate Paystack payment initialization
 * Returns payment link or checkout URL
 */
export async function initializePaystackPayment(
  email: string,
  metadata: Record<string, any> = {},
) {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!paystackSecretKey) {
    throw new Error("PAYSTACK_SECRET_KEY not configured");
  }

  try {
    // Amount in kobo (₦500 = 50000 kobo)
    const amountInKobo = 50000;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amountInKobo,
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    return {
      success: true,
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
      reference: response.data.data.reference,
      amount: amountInKobo,
      currency: "NGN",
    };
  } catch (error) {
    console.error("[v0] Paystack initialization error:", error);
    return {
      success: false,
      error: "Failed to initialize payment",
    };
  }
}

/**
 * Generate simple Paystack checkout URL
 * (without initialization - direct link)
 */
export function generatePaystackCheckoutLink(
  email?: string,
  amount: number = 50000,
): string {
  const publicKey = process.env.PAYSTACK_PUBLIC_KEY;

  if (!publicKey) {
    console.error("[v0] PAYSTACK_PUBLIC_KEY not configured");
    return "";
  }

  const baseUrl = "https://checkout.paystack.com/pay/";
  const params = new URLSearchParams({
    key: publicKey,
    ...(email && { email }),
    amount: amount.toString(),
  });

  return `${baseUrl}${publicKey}`;
}

/**
 * Verify Paystack webhook signature
 */
export function verifyPaystackSignature(
  signature: string,
  body: string,
): boolean {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    return false;
  }

  // Create HMAC-SHA512 signature
  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(body)
    .digest("hex");

  return hash === signature;
}

/**
 * Generate WhatsApp payment message with Paystack link
 */
export function generatePremiumMessage(userEmail?: string): string {
  const publicKey = process.env.PAYSTACK_PUBLIC_KEY;

  if (!publicKey) {
    return `💎 Premium Upgrade - ₦500\n\nPlease contact support to upgrade to premium.`;
  }

  // Generate checkout link
  const checkoutUrl = `https://checkout.paystack.com/pay/${publicKey}`;

  return `💎 *UPGRADE TO PREMIUM* - ₦500

Benefits:
✅ Access premium leaderboard
✅ Compete for jackpots
✅ See total points (not just weekly)
✅ Premium-only features
✅ Priority support

📱 *Click here to pay:*
${checkoutUrl}

After payment, you'll automatically become premium!
You'll receive a confirmation message.`;
}

/**
 * Generate premium upgrade confirmation
 */
export function generatePremiumConfirmation(username: string): string {
  return `✅ *PREMIUM UPGRADE SUCCESSFUL!*

Welcome to premium, ${username}! 🎉

You now have access to:
✅ Premium leaderboard
✅ Jackpot competitions
✅ Total points display
✅ All premium features

Enjoy the rest of the tournament! ⚽`;
}

/**
 * Payment details for transactions
 */
export const PREMIUM_PRICE = {
  amount: 50000, // in kobo
  amountNGN: 500, // in Naira
  currency: "NGN",
  description: "World Cup Predictor - Premium Subscription",
};

export default {
  initializePaystackPayment,
  generatePaystackCheckoutLink,
  verifyPaystackSignature,
  generatePremiumMessage,
  generatePremiumConfirmation,
  PREMIUM_PRICE,
};
