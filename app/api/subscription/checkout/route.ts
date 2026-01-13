import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        console.log("Checkout Route - UserId:", userId);

        if (!userId) {
            console.log("Checkout Route - Unauthorized");
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { priceId } = await req.json(); // Optional: if multiple plans

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Pro Plan',
                            description: 'Unlimited PDF uploads and chat',
                        },
                        unit_amount: 500, // $5.00
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}?canceled=true`,
            metadata: {
                userId,
            }
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
