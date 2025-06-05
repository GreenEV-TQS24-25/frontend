
export const createPaymentIntent = async (sessionId: number) => {
  try {
    const response = await fetch(`/api/v1/private/payment/create-intent/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const data = await response.json();
    ;
    return data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};
