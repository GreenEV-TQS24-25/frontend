'use client'
import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent } from '@/lib/stripe';

interface PaymentFormProps {
  sessionId: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function PaymentForm({ sessionId, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Create payment intent
      const clientSecret = await createPaymentIntent(sessionId);

      // 2. Confirm the payment with the card element
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (error) {
        setErrorMessage(error.message ?? 'An error occurred');
        onError?.(new Error(error.message));
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess?.();
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred');
      onError?.(err as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-4">
      <div className="mb-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      {errorMessage && (
        <div className="text-red-500 mb-4">{errorMessage}</div>
      )}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
} 