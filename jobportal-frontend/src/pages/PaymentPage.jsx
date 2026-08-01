import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SubscriptionPaymentForm from '../components/SubscriptionPaymentForm';

const PaymentPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await axios.get('/api/subscription/plans');
      setPlans(response.data.data);
    } catch (err) {
      setError('Failed to load subscription plans');
      console.error('Error fetching plans:', err);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleSubscribe = () => {
    if (!selectedPlan) {
      setError('Please select a plan');
      return;
    }
    
    setShowPaymentForm(true);
    setError(null);
  };

  const handlePaymentSuccess = (data) => {
    // Handle successful subscription
    setShowPaymentForm(false);
    setSelectedPlan(null);
    alert('Subscription created successfully!');
    // Redirect to subscription management page or dashboard
    navigate('/dashboard');
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
  };

  if (showPaymentForm && selectedPlan) {
    return (
      <div className="payment-page">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={() => setShowPaymentForm(false)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Plans
            </button>
          </div>
          
          <SubscriptionPaymentForm
            plan={selectedPlan}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Choose Your Plan</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                selectedPlan?.id === plan.id
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handlePlanSelect(plan)}
            >
              <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              <div className="mb-4">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-gray-500">/{plan.period}</span>
              </div>
              <ul className="mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleSubscribe}
            disabled={!selectedPlan || loading}
            className={`px-6 py-3 rounded-lg font-semibold text-white ${
              !selectedPlan || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Processing...' : `Subscribe to ${selectedPlan?.name || 'a Plan'}`}
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Previous Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;