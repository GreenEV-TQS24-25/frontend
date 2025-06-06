'use client'

import {useState} from 'react';
import {PaymentElement, useStripe, useElements} from '@stripe/react-stripe-js';

interface PaymentFormProps {
    sessionId: number;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    clientSecret?: string;
}

export type PaymentStatus = 'idle' | 'processing' | 'succeeded' | 'failed' | 'canceled';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PaymentForm({sessionId, onSuccess, onError, clientSecret}: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            setErrorMessage('Stripe has not been initialized. Please try again.');
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);
        setPaymentStatus('processing');

        try {

            const { error: submitError } = await elements.submit();
            if (submitError) {
                throw new Error(submitError.message);
            }

            // Confirm the payment using the PaymentElement
            const {error: confirmError} = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    // Return URL after payment completion (for 3D Secure, etc.)
                    return_url: `http://localhost/dashboard/sessions`,
                },
                // redirect: 'if_required',
                clientSecret: clientSecret ?? '',
            });


            if (confirmError) {
                throw new Error(confirmError.message);
            }

            // if (paymentIntent) {
            //     switch (paymentIntent.status) {
            //         case 'succeeded':
            //             setPaymentStatus('succeeded');
            //             onSuccess?.();
            //             break;
            //         case 'processing':
            //             setPaymentStatus('processing');
            //             // Payment is being processed, webhook will handle completion
            //             break;
            //         case 'requires_payment_method':
            //             throw new Error('Payment failed. Please try a different payment method.');
            //         default:
            //             throw new Error(`Unexpected payment status: ${paymentIntent.status}`);
            //     }
            // }
        } catch (err) {
            const error = err as Error;
            setErrorMessage(error.message);
            setPaymentStatus('failed');
            onError?.(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusMessage = () => {
        switch (paymentStatus) {
            case 'processing':
                return 'Processing payment...';
            case 'succeeded':
                return 'Payment successful!';
            case 'failed':
                return 'Payment failed. Please try again.';
            case 'canceled':
                return 'Payment was canceled.';
            default:
                return null;
        }
    };

    const getStatusColor = () => {
        switch (paymentStatus) {
            case 'processing':
                return 'text-blue-500';
            case 'succeeded':
                return 'text-green-500';
            case 'failed':
                return 'text-red-500';
            case 'canceled':
                return 'text-yellow-500';
            default:
                return '';
        }


    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-4">
            <div className="mb-6">
                <PaymentElement
                    options={{
                        layout: {
                            type: 'accordion',
                            defaultCollapsed: false,
                            radios: false,
                            spacedAccordionItems: true
                        },
                        paymentMethodOrder: ['card', 'paypal', 'apple_pay', 'google_pay']
                    }}
                />
            </div>

            {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {errorMessage}
                </div>
            )}

            {getStatusMessage() && (
                <div className={`mb-4 font-medium ${getStatusColor()}`}>
                    {getStatusMessage()}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || isProcessing || paymentStatus === 'succeeded'}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                    isProcessing || paymentStatus === 'succeeded'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
                {isProcessing ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                    </div>
                ) : paymentStatus === 'succeeded' ? (
                    'Payment Successful'
                ) : (
                    'Pay Now'
                )}
            </button>

            <div className="mt-4 text-xs text-gray-500 text-center">
                Your payment information is secure and encrypted.
            </div>
        </form>
    );
}
