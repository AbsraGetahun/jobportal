import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

// Make sure to add your Stripe publishable key to your .env file
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ jobId, paymentType, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get Stripe instance
      const stripe = await stripePromise;

      // Determine payment details based on type
      let amount, description;
      if (paymentType === 'premium_job') {
        amount = 29.99;
        description = 'Premium Job Posting';
      } else if (paymentType === 'featured_job') {
        amount = 9.99;
        description = 'Featured Job Listing';
      } else {
        throw new Error('Invalid payment type');
      }

      // Create checkout session
      const response = await axios.post('/api/payments/checkout', {
        amount: amount,
        currency: 'USD',
        description: description,
        success_url: `${window.location.origin}/payment-success`,
        cancel_url: `${window.location.origin}/payment-cancelled`,
        payment_type: paymentType,
        job_id: jobId,
      });

      // Redirect to Stripe checkout
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: response.data.id,
      });

      if (stripeError) {
        setError(stripeError.message);
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-form">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">
          {paymentType === 'premium_job' ? 'Premium Job Posting' : 'Featured Job Listing'}
        </h2>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            {paymentType === 'premium_job' 
              ? 'Make your job posting stand out with premium visibility for 30 days.' 
              : 'Feature your job listing for increased visibility for 7 days.'}
          </p>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">
                {paymentType === 'premium_job' ? 'Premium Job Posting' : 'Featured Job Listing'}
              </span>
              <span className="font-bold text-lg">
                ${paymentType === 'premium_job' ? '29.99' : '9.99'}
              </span>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
          
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;