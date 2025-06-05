import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentForm } from './PaymentForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

export function PaymentModal({ isOpen, onClose, sessionId, onSuccess, onError }: PaymentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Card Details</DialogTitle>
        </DialogHeader>
        <Elements stripe={stripePromise}>
          <PaymentForm
            sessionId={sessionId}
            onSuccess={() => {
              onSuccess();
              onClose();
            }}
            onError={onError}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
} 