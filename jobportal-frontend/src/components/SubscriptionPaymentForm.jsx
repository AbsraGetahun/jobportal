import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import axios from 'axios';

// Make sure to add your Stripe publishable key to your .env file
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : Promise.resolve(null);

const CheckoutForm = ({ plan, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }
    
    if (!plan) {
      setError('Please select a plan');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get card element
      const cardElement = elements.getElement(CardElement);
      
      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      // Call backend to create subscription
      const response = await axios.post('/api/subscription/create', {
        plan_id: plan.id,
        payment_method_id: paymentMethod.id,
      });

      // Handle success
      onSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Subscription failed. Please try again.');
      console.error('Subscription error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Payment Details</h3>
        <div className="border rounded p-3 bg-white">
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
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Subscribe to ${plan?.name}`}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const SubscriptionPaymentForm = ({ plan, onSuccess, onCancel }) => {
  const [stripe, setStripe] = useState(null);

  useEffect(() => {
    const initializeStripe = async () => {
      const stripeInstance = await stripePromise;
      setStripe(stripeInstance);
    };
    
    initializeStripe();
  }, []);

  return (
    <div className="subscription-payment-form">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Complete Your Subscription</h2>
        
        <div className="mb-6">
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{plan?.name}</span>
              <span className="font-bold text-lg">${plan?.price}/{plan?.period}</span>
            </div>
          </div>
        </div>
        
        {stripe ? (
          <Elements stripe={stripe}>
            <CheckoutForm plan={plan} onSuccess={onSuccess} onCancel={onCancel} />
          </Elements>
        ) : (
          <div className="text-center py-8">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <strong>Stripe Configuration Required</strong>
              <p className="mt-2">Please add your Stripe publishable key to the .env file to enable payments.</p>
              <code className="block mt-2 text-sm bg-yellow-200 p-2 rounded">
                VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPaymentForm;