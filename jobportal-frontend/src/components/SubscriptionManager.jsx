import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SubscriptionManager = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await axios.get('/api/subscription');
      setSubscription(response.data.data);
    } catch (err) {
      setError('Failed to load subscription information');
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/subscription/cancel');
      // Refresh subscription info
      fetchSubscription();
    } catch (err) {
      setError('Failed to cancel subscription');
      console.error('Error cancelling subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading subscription information...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="subscription-manager">
      <h2 className="text-2xl font-bold mb-4">Subscription Management</h2>
      
      {subscription ? (
        <div className="border rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold text-gray-700">Plan</h3>
              <p className="text-lg">{subscription.plan_type === 'premium' ? 'Premium Plan' : 'Basic Plan'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Billing Period</h3>
              <p className="text-lg capitalize">{subscription.billing_period}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Amount</h3>
              <p className="text-lg">${subscription.amount}/{subscription.billing_period}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Status</h3>
              <p className="text-lg capitalize">{subscription.status}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Start Date</h3>
              <p className="text-lg">{new Date(subscription.start_date).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">End Date</h3>
              <p className="text-lg">{new Date(subscription.end_date).toLocaleDateString()}</p>
            </div>
          </div>
          
          {subscription.status === 'active' && (
            <div className="mt-6">
              <button
                onClick={handleCancelSubscription}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Cancel Subscription
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="border rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">You don't have an active subscription.</p>
          <a 
            href="/payment" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Subscribe Now
          </a>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;