import { db } from "@/lib/db";
import { whatsappUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generatePremiumConfirmation } from "@/lib/utils/payment";

/**
 * Send premium upgrade confirmation to user via WhatsApp
 * Called after successful Paystack payment
 */
export async function notifyPremiumUpgrade(
  email: string,
  sock: any,
): Promise<boolean> {
  try {
    // Find user by email
    const user = await db
      .select()
      .from(whatsappUsers)
      .where(eq(whatsappUsers.email || "", email))
      .limit(1);

    if (user.length === 0) {
      console.error(`[v0] User not found for email: ${email}`);
      return false;
    }

    const userData = user[0];
    const waId = userData.waId;

    // Generate confirmation message
    const confirmationMsg = generatePremiumConfirmation(
      userData.uniqueUsername,
    );

    // Send message to user
    if (sock && sock.sendMessage) {
      await sock.sendMessage(waId, { text: confirmationMsg });
      console.log(
        `[v0] Premium confirmation sent to ${userData.uniqueUsername}`,
      );
      return true;
    } else {
      console.warn(
        `[v0] Socket not available, cannot send confirmation to ${waId}`,
      );
      return false;
    }
  } catch (error) {
    console.error("[v0] Error notifying premium upgrade:", error);
    return false;
  }
}

/**
 * Send payment failed message to user
 */
export async function notifyPaymentFailed(
  email: string,
  reason: string,
  sock: any,
): Promise<boolean> {
  try {
    const user = await db
      .select()
      .from(whatsappUsers)
      .where(eq(whatsappUsers.email || "", email))
      .limit(1);

    if (user.length === 0) return false;

    const userData = user[0];
    const waId = userData.waId;

    const failureMsg = `❌ *Payment Failed*\n\nReason: ${reason}\n\nPlease try again or contact support for help.`;

    if (sock && sock.sendMessage) {
      await sock.sendMessage(waId, { text: failureMsg });
      console.log(
        `[v0] Payment failure notification sent to ${userData.uniqueUsername}`,
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error("[v0] Error notifying payment failure:", error);
    return false;
  }
}

/**
 * Broadcast premium benefits to newly upgraded users
 */
export async function broadcastPremiumBenefits(
  waIds: string[],
  sock: any,
): Promise<number> {
  let successCount = 0;

  const benefitsMsg = `🎉 *You're now Premium!*\n\nYou now have access to:
✅ Premium leaderboard
✅ Compete for jackpots
✅ Total points tracking
✅ Premium-only features
✅ Priority support

Enjoy the tournament! ⚽`;

  for (const waId of waIds) {
    try {
      if (sock && sock.sendMessage) {
        await sock.sendMessage(waId, { text: benefitsMsg });
        successCount++;
      }
    } catch (error) {
      console.error(`[v0] Failed to send benefits message to ${waId}:`, error);
    }
  }

  return successCount;
}

export default {
  notifyPremiumUpgrade,
  notifyPaymentFailed,
  broadcastPremiumBenefits,
};
