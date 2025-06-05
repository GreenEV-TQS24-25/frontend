// import { loadStripe , StripeCardElement } from '@stripe/stripe-js';

// // Initialize Stripe with your publishable key
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// export interface PaymentIntentResponse {
//   clientSecret: string;
//   paymentIntentId: string;
// }

// export const paymentService = {
//   // Create a payment intent for a session
//   createPaymentIntent: async (sessionId: number): Promise<PaymentIntentResponse> => {
//     const response = await fetch(`/api/v1/private/payment/create-intent/${sessionId}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error('Failed to create payment intent');
//     }

//     return response.json();
//   },

//   // Confirm a payment with Stripe
//   confirmPayment: async (clientSecret: string, stripeCardElement: StripeCardElement) => {
//     const stripe = await stripePromise;
//     if (!stripe) {
//       throw new Error('Stripe failed to initialize');
//     }

//     const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
//       payment_method: {
//         card: stripeCardElement,
//       },
//     });

//     if (error) {
//       throw new Error(error.message);
//     }

    
//     return paymentIntent;
//   },
// }; 