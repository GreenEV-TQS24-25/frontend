import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import {PaymentForm} from './PaymentForm';
import {useEffect, useState} from 'react';
import {createPaymentIntent} from "@/lib/stripe";

// Initialize Stripe - this should be done outside component to avoid recreation
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionId: number;
    amount: number; // Amount in euros
    onSuccess: () => void;
    onError: (error: Error) => void;
}

export function PaymentModal({
                                 isOpen,
                                 onClose,
                                 sessionId,
                                 amount,
                                 onSuccess,
                                 onError
                             }: PaymentModalProps) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    // Create PaymentIntent on component mount
    useEffect(() => {
        const initializePayment = async () => {
            try {
                const { clientSecret: cs } = await createPaymentIntent(sessionId);
                setClientSecret(cs);
                // edit elements to add the clientSecret

            } catch (error) {
                const err = error as Error;
                onError?.(err);
            }
        };

        initializePayment();
    }, [sessionId, onError]);

    const handleSuccess = () => {
        onSuccess();
        onClose();
    };

    const handleError = (error: Error) => {
        onError(error);
        // Don't close modal on error, let user retry
    };

    const options = {
        mode: 'payment' as const,
        amount: Math.round((amount || 10)  * 100), // Convert to cents
        currency: 'eur',
        // Ensure the clientSecret is set correctly
        client_secret: clientSecret,
        // Customize the appearance to match your site's theme
        appearance: {
            theme: 'stripe' as const,
            variables: {
                colorPrimary: '#2563eb', // blue-600
                colorBackground: '#ffffff',
                colorText: '#374151', // gray-700
                colorDanger: '#dc2626', // red-600
                fontFamily: 'system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '6px',
            },
            rules: {
                '.Tab': {
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                },
                '.Tab--selected': {
                    borderColor: '#2563eb',
                    backgroundColor: '#eff6ff',
                },
                '.Input': {
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '16px',
                    padding: '12px',
                },
                '.Input:focus': {
                    borderColor: '#2563eb',
                    boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.1)',
                },
            },
        },
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="text-lg font-semibold">Complete Payment</span>
                        <span className="text-sm text-gray-500">
              €{amount}
            </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4">
                    <Elements
                        stripe={stripePromise}
                        options={options}
                        key={isOpen ? 'open' : 'closed'} // Force re-mount when modal opens
                    >
                        <PaymentForm
                            sessionId={sessionId}
                            onSuccess={handleSuccess}
                            onError={handleError}
                            clientSecret={clientSecret ?? ''} // Ensure clientSecret is always defined
                        />
                    </Elements>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Session ID: {sessionId}</span>
                        <div className="flex items-center gap-2">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            <span>Secure Payment</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}