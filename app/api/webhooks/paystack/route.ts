import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { whatsappUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()

    // Verify Paystack signature
    const signature = req.headers.get('x-paystack-signature')
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      )
    }

    const secret = process.env.PAYSTACK_SECRET_KEY || ''
    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(payload))
      .digest('hex')

    if (hash !== signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Handle successful payment
    if (payload.event === 'charge.success') {
      const reference = payload.data.reference
      const metadata = payload.data.metadata

      // Extract wa_id from metadata
      const waId = metadata?.wa_id

      if (!waId) {
        return NextResponse.json(
          { error: 'Missing wa_id in metadata' },
          { status: 400 }
        )
      }

      // Update user to premium
      await db
        .update(whatsappUsers)
        .set({ isPremium: true })
        .where(eq(whatsappUsers.waId, waId))

      console.log(`[Paystack] User ${waId} upgraded to premium`)

      return NextResponse.json(
        {
          message: 'Payment processed successfully',
          wa_id: waId,
          status: 'premium_activated',
        },
        { status: 200 }
      )
    }

    // Handle failed payment
    if (payload.event === 'charge.failed') {
      console.log(`[Paystack] Payment failed: ${payload.data.reference}`)
      return NextResponse.json(
        { message: 'Payment failed notification received' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { message: 'Webhook received' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Paystack Webhook Error]', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
