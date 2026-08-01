<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Subscription as StripeSubscription;
use App\Models\Subscription;

class SubscriptionController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        // Set the Stripe secret key from the environment
        Stripe::setApiKey(env('STRIPE_SECRET'));
    }

    /**
     * Get available subscription plans.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPlans(): JsonResponse
    {
        $plans = [
            [
                'id' => 'basic_monthly',
                'name' => 'Basic Plan',
                'description' => 'Basic features for job seekers and employers',
                'price' => 0,
                'period' => 'monthly',
                'features' => [
                    'Post up to 5 jobs per month',
                    'Apply to unlimited jobs',
                    'Basic job alerts',
                ],
            ],
            [
                'id' => 'premium_monthly',
                'name' => 'Premium Plan',
                'description' => 'Advanced features for job seekers and employers',
                'price' => 9.99,
                'period' => 'monthly',
                'features' => [
                    'Post unlimited jobs',
                    'Featured job listings',
                    'Advanced job matching',
                    'Priority customer support',
                    'Analytics dashboard',
                ],
            ],
            [
                'id' => 'premium_yearly',
                'name' => 'Premium Plan (Yearly)',
                'description' => 'Advanced features with yearly discount',
                'price' => 99.99,
                'period' => 'yearly',
                'features' => [
                    'Post unlimited jobs',
                    'Featured job listings',
                    'Advanced job matching',
                    'Priority customer support',
                    'Analytics dashboard',
                    '1 month free compared to monthly',
                ],
            ],
        ];
        
        return response()->json(['data' => $plans]);
    }

    /**
     * Create a Stripe subscription for a user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createSubscription(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $requestData = $request->validate([
                'plan_id' => 'required|string',
                'payment_method_id' => 'required|string',
            ]);

            // Check if user already has an active subscription
            $existingSubscription = Subscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->where('end_date', '>', now())
                ->first();

            if ($existingSubscription) {
                return response()->json(['error' => 'You already have an active subscription'], 400);
            }

            // Create or retrieve Stripe customer
            $stripeCustomer = null;
            if ($user->stripe_customer_id) {
                $stripeCustomer = \Stripe\Customer::retrieve($user->stripe_customer_id);
            } else {
                $stripeCustomer = \Stripe\Customer::create([
                    'email' => $user->email,
                    'name' => $user->name,
                ]);
                
                // Save Stripe customer ID to user
                $user->update(['stripe_customer_id' => $stripeCustomer->id]);
            }

            // Attach payment method to customer
            \Stripe\PaymentMethod::attach(
                $requestData['payment_method_id'],
                ['customer' => $stripeCustomer->id]
            );

            // Set default payment method
            \Stripe\Customer::update($stripeCustomer->id, [
                'invoice_settings' => [
                    'default_payment_method' => $requestData['payment_method_id'],
                ],
            ]);

            // Map plan IDs to Stripe price IDs (these would be real Stripe price IDs in production)
            $planMapping = [
                'premium_monthly' => 'price_premium_monthly',
                'premium_yearly' => 'price_premium_yearly',
            ];

            if (!isset($planMapping[$requestData['plan_id']])) {
                return response()->json(['error' => 'Invalid plan selected'], 400);
            }

            // Create Stripe subscription
            $stripeSubscription = StripeSubscription::create([
                'customer' => $stripeCustomer->id,
                'items' => [[
                    'price' => $planMapping[$requestData['plan_id']],
                ]],
                'expand' => ['latest_invoice.payment_intent'],
            ]);

            // Calculate subscription dates
            $startDate = now();
            $endDate = $requestData['plan_id'] === 'premium_yearly' ? now()->addYear() : now()->addMonth();
            
            // Amount based on plan
            $amount = $requestData['plan_id'] === 'premium_yearly' ? 99.99 : 9.99;
            
            // Create subscription record in our database
            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan_type' => $requestData['plan_id'] === 'premium_yearly' ? 'premium' : 'premium',
                'amount' => $amount,
                'currency' => 'USD',
                'billing_period' => $requestData['plan_id'] === 'premium_yearly' ? 'yearly' : 'monthly',
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => 'active',
                'subscription_id' => $stripeSubscription->id,
            ]);

            // Update user's premium status
            $user->update(['is_premium' => true]);

            return response()->json([
                'subscription' => $subscription,
                'stripe_subscription' => $stripeSubscription,
            ]);
        } catch (\Stripe\Exception\CardException $e) {
            // Card was declined
            Log::error('Card declined: ' . $e->getMessage());
            return response()->json(['error' => 'Card was declined'], 400);
        } catch (\Exception $e) {
            Log::error('Subscription creation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create subscription'], 500);
        }
    }

    /**
     * Get user's active subscription.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSubscription(): JsonResponse
    {
        $user = Auth::user();
        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('end_date', '>', now())
            ->first();
            
        if (!$subscription) {
            return response()->json(['data' => null]);
        }
        
        // Get Stripe subscription details
        try {
            $stripeSubscription = StripeSubscription::retrieve($subscription->subscription_id);
            $subscription->stripe_details = $stripeSubscription;
        } catch (\Exception $e) {
            Log::error('Failed to retrieve Stripe subscription: ' . $e->getMessage());
        }
        
        return response()->json(['data' => $subscription]);
    }

    /**
     * Cancel user's subscription.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancelSubscription(): JsonResponse
    {
        $user = Auth::user();
        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();
            
        if (!$subscription) {
            return response()->json(['error' => 'No active subscription found'], 404);
        }
        
        try {
            // Cancel at Stripe
            if ($subscription->subscription_id) {
                $stripeSubscription = StripeSubscription::retrieve($subscription->subscription_id);
                $stripeSubscription->cancel();
            }
            
            // Update our records
            $subscription->update(['status' => 'cancelled']);
            
            // Update user's premium status
            $user->update(['is_premium' => false]);
            
            return response()->json(['message' => 'Subscription cancelled successfully']);
        } catch (\Exception $e) {
            Log::error('Error cancelling subscription: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to cancel subscription'], 500);
        }
    }

    /**
     * Update user's subscription (upgrade/downgrade).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateSubscription(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $requestData = $request->validate([
                'plan_id' => 'required|string',
            ]);

            $subscription = Subscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->first();
                
            if (!$subscription) {
                return response()->json(['error' => 'No active subscription found'], 404);
            }

            // Map plan IDs to Stripe price IDs
            $planMapping = [
                'premium_monthly' => 'price_premium_monthly',
                'premium_yearly' => 'price_premium_yearly',
            ];

            if (!isset($planMapping[$requestData['plan_id']])) {
                return response()->json(['error' => 'Invalid plan selected'], 400);
            }

            // Update Stripe subscription
            $stripeSubscription = StripeSubscription::retrieve($subscription->subscription_id);
            $stripeSubscription->items = [[
                'id' => $stripeSubscription->items->data[0]->id,
                'price' => $planMapping[$requestData['plan_id']],
            ]];
            $stripeSubscription->save();

            // Update our records
            $subscription->update([
                'plan_type' => $requestData['plan_id'] === 'premium_yearly' ? 'premium' : 'premium',
                'billing_period' => $requestData['plan_id'] === 'premium_yearly' ? 'yearly' : 'monthly',
                'amount' => $requestData['plan_id'] === 'premium_yearly' ? 99.99 : 9.99,
            ]);

            return response()->json(['message' => 'Subscription updated successfully']);
        } catch (\Exception $e) {
            Log::error('Error updating subscription: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update subscription'], 500);
        }
    }
}