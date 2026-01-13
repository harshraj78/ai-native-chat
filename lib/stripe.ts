import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    // Use default API version
});

export const getStripeSession = async () => {
    // Utility to get/verify session if needed later
};
