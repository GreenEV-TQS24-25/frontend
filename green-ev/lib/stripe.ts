
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export type PaymentStatus = 'idle' | 'processing' | 'succeeded' | 'failed' | 'canceled';

/**
 * Creates a PaymentIntent on the server for the given session
 * @param sessionId The session ID to create payment for
 * @returns Promise containing the client secret and payment intent ID
 */
export const createPaymentIntent = async (sessionId: number): Promise<PaymentIntentResponse> => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

    const response = await fetch(`/api/v1/private/payment/create-intent/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (response.status === 404) {
        throw new Error('Session not found or access denied.');
      } else if (response.status === 400) {
        throw new Error('Payment already processed for this session.');
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    const data: PaymentIntentResponse = await response.json();

    if (!data.clientSecret || !data.paymentIntentId) {
      throw new Error('Invalid response from server');
    }

    return data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Checks the status of a PaymentIntent using Stripe.js
 * @param clientSecret The client secret of the PaymentIntent
 * @returns The PaymentIntent object
 */
export const retrievePaymentIntent = async (clientSecret: string) => {
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }

    const { paymentIntent, error } = await stripe.retrievePaymentIntent(clientSecret);

    if (error) {
      throw new Error(error.message);
    }

    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
};

/**
 * Utility function to get payment status from PaymentIntent status
 * @param stripeStatus The status from Stripe PaymentIntent
 * @returns Normalized payment status
 */
export const normalizePaymentStatus = (stripeStatus: string): PaymentStatus => {
  switch (stripeStatus) {
    case 'succeeded':
      return 'succeeded';
    case 'processing':
      return 'processing';
    case 'requires_payment_method':
    case 'requires_confirmation':
    case 'requires_action':
      return 'processing';
    case 'canceled':
      return 'canceled';
    default:
      return 'failed';
  }
};

/**
 * Format amount for display (converts cents to euros)
 * @param amountInCents Amount in cents
 * @returns Formatted amount string
 */
export const formatAmount = (amountInCents: number): string => {
  return (amountInCents / 100).toFixed(2);
};

/**
 * Convert euros to cents for Stripe API
 * @param amountInEuros Amount in euros
 * @returns Amount in cents
 */
export const convertToCents = (amountInEuros: number): number => {
  return Math.round(amountInEuros * 100);
};

/**
 * Handle errors from Stripe operations
 * @param error The error from Stripe
 * @returns User-friendly error message
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleStripeError = (error: any): string => {
  switch (error.type) {
    case 'card_error':
      return error.message || 'Your card was declined.';
    case 'validation_error':
      return 'Please check your payment information and try again.';
    case 'authentication_error':
      return 'Authentication failed. Please try again.';
    case 'rate_limit_error':
      return 'Too many requests. Please try again later.';
    case 'api_connection_error':
      return 'Network error. Please check your connection and try again.';
    case 'api_error':
      return 'Payment processing error. Please try again.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};

export default {
  stripePromise,
  createPaymentIntent,
  retrievePaymentIntent,
  normalizePaymentStatus,
  formatAmount,
  convertToCents,
  handleStripeError,
};
