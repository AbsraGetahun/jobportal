import React, { useState } from 'react';
import '../../styles/components/JobSeeker/PremiumFeatures.css';

const PremiumFeatures = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('professional');

  const plans = {
    basic: {
      name: 'Basic',
      price: isAnnual ? '$9.99/month' : '$99.99/year',
      description: 'Essential features for job seekers',
      features: [
        '5 job applications per month',
        'Basic job alerts',
        'Profile visibility to employers',
        'Access to company reviews'
      ],
      cta: 'Current Plan',
      isCurrent: true
    },
    professional: {
      name: 'Professional',
      price: isAnnual ? '$19.99/month' : '$199.99/year',
      description: 'Advanced tools for serious job seekers',
      features: [
        'Unlimited job applications',
        'Priority job alerts',
        'Enhanced profile visibility',
        'Access to salary insights',
        'Application tracking',
        'Resume review suggestions',
        '1 premium course per month'
      ],
      cta: 'Upgrade to Professional',
      isCurrent: false
    },
    premium: {
      name: 'Premium',
      price: isAnnual ? '$29.99/month' : '$299.99/year',
      description: 'Complete job search solution',
      features: [
        'Unlimited job applications',
        'Real-time job alerts',
        'Top profile visibility',
        'Personalized salary insights',
        'Advanced application tracking',
        'AI-powered resume optimization',
        'Unlimited premium courses',
        '1-on-1 career coaching session/month',
        'Priority customer support'
      ],
      cta: 'Upgrade to Premium',
      isCurrent: false
    }
  };

  const toggleBilling = () => {
    setIsAnnual(!isAnnual);
  };

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan);
    // In a real app, this would redirect to payment
    console.log(`Upgrading to ${plan} plan`);
  };

  const currentPlanFeatures = [
    'Profile completeness indicator',
    'Basic job recommendations',
    'Application history tracking',
    'Standard notification settings',
    'Basic privacy controls'
  ];

  const premiumBenefits = [
    {
      icon: 'fas fa-bolt',
      title: 'Faster Applications',
      description: 'Apply to jobs 3x faster with our one-click application feature'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Salary Insights',
      description: 'Get real-time salary data for your target positions'
    },
    {
      icon: 'fas fa-search',
      title: 'Priority Matching',
      description: 'Get matched with jobs before they\'re publicly available'
    },
    {
      icon: 'fas fa-file-alt',
      title: 'AI Resume Review',
      description: 'Get instant feedback on your resume from our AI'
    },
    {
      icon: 'fas fa-graduation-cap',
      title: 'Premium Courses',
      description: 'Access to exclusive career development courses'
    },
    {
      icon: 'fas fa-headset',
      title: 'Priority Support',
      description: '24/7 dedicated support with 1-hour response time'
    }
  ];

  return (
    <div className="premium-features">
      <div className="premium-header">
        <h3>Premium Account Features</h3>
        <p className="premium-subtitle">
          Upgrade your account to unlock powerful job search tools
        </p>
      </div>

      <div className="current-plan">
        <div className="plan-badge">
          <i className="fas fa-user"></i>
          <span>Basic Plan</span>
        </div>
        <div className="plan-features">
          <h4>Current Plan Features</h4>
          <ul>
            {currentPlanFeatures.map((feature, index) => (
              <li key={index}>
                <i className="fas fa-check-circle"></i>
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div className="upgrade-prompt">
          <p>Upgrade to unlock premium features and accelerate your job search</p>
        </div>
      </div>

      <div className="billing-toggle">
        <span className={isAnnual ? '' : 'active'}>Monthly</span>
        <button 
          className={`toggle-switch ${isAnnual ? 'annual' : ''}`}
          onClick={toggleBilling}
        >
          <div className="toggle-slider"></div>
        </button>
        <span className={isAnnual ? 'active' : ''}>
          Annual <span className="save-badge">Save 20%</span>
        </span>
      </div>

      <div className="plans-container">
        {Object.entries(plans).map(([key, plan]) => (
          <div 
            key={key} 
            className={`plan-card ${key === selectedPlan ? 'selected' : ''} ${plan.isCurrent ? 'current' : ''}`}
          >
            <div className="plan-header">
              <h4>{plan.name}</h4>
              <div className="plan-price">{plan.price}</div>
              <p className="plan-description">{plan.description}</p>
            </div>
            
            <ul className="plan-features-list">
              {plan.features.map((feature, index) => (
                <li key={index}>
                  <i className="fas fa-check"></i>
                  {feature}
                </li>
              ))}
            </ul>
            
            <button 
              className={`plan-cta ${plan.isCurrent ? 'current' : 'upgrade'}`}
              onClick={() => handleUpgrade(key)}
              disabled={plan.isCurrent}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="premium-benefits">
        <h4>Premium Benefits</h4>
        <div className="benefits-grid">
          {premiumBenefits.map((benefit, index) => (
            <div className="benefit-card" key={index}>
              <div className="benefit-icon">
                <i className={benefit.icon}></i>
              </div>
              <h5>{benefit.title}</h5>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="testimonials">
        <h4>What Our Premium Users Say</h4>
        <div className="testimonial-cards">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"Upgrading to Premium helped me land my dream job 2 months faster than I expected!"</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="author-info">
                <h5>Sarah Johnson</h5>
                <p>Software Engineer</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"The AI resume review saved me countless hours. My application success rate increased by 60%!"</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="author-info">
                <h5>Michael Chen</h5>
                <p>Marketing Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeatures;