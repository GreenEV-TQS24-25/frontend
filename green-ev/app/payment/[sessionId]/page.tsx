'use client';

import { StripeProvider } from '@/components/StripeProvider';
import { PaymentForm } from '@/components/PaymentForm';
import { useRouter } from 'next/navigation';

interface PaymentPageProps {
  params: {
    sessionId: string;
  };
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const router = useRouter();
  const sessionId = parseInt(params.sessionId);

  const handleSuccess = () => {
    // Handle successful payment
    router.push('/payment/success');
  };

  const handleError = (error: Error) => {
    // Handle payment error
    console.error('Payment failed:', error);
    // You might want to show an error message to the user
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Complete Your Payment</h1>
      <StripeProvider>
        <PaymentForm
          sessionId={sessionId}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </StripeProvider>
    </div>
  );
} 