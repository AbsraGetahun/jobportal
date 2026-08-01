<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Webhook;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\PremiumJobPosting;
use App\Models\FeaturedListing;

class PaymentController extends Controller
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
     * Create a Stripe checkout session for a payment.
     *
     * @param  \Illuminate\Http\Request  $request
     * * @return \Illuminate\Http\JsonResponse
     */
    public function createCheckoutSession(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $requestData = $request->validate([
                'amount' => 'required|numeric|min:1',
                'currency' => 'required|string|size:3',
                'description' => 'required|string',
                'success_url' => 'required|url',
                'cancel_url' => 'required|url',
                'payment_type' => 'required|in:subscription,premium_job,featured_job',
                'job_id' => 'nullable|exists:jobs,id', // Required for premium_job and featured_job
                'plan_type' => 'nullable|in:basic,premium', // Required for subscription
                'billing_period' => 'nullable|in:monthly,yearly', // Required for subscription
            ]);

            // Create line items for Stripe
            $lineItems = [[
                'price_data' => [
                    'currency' => $requestData['currency'],
                    'product_data' => [
                        'name' => $requestData['description'],
                    ],
                    'unit_amount' => intval($requestData['amount'] * 100), // Convert to cents
                ],
                'quantity' => 1,
            ]];

            // Create the Stripe checkout session
            $session = StripeSession::create([
                'payment_method_types' => ['card'],
                'line_items' => $lineItems,
                'mode' => 'payment',
                'success_url' => $requestData['success_url'],
                'cancel_url' => $requestData['cancel_url'],
                'client_reference_id' => $user->id,
                'metadata' => [
                    'payment_type' => $requestData['payment_type'],
                    'user_id' => $user->id,
                    'job_id' => $requestData['job_id'] ?? null,
                    'plan_type' => $requestData['plan_type'] ?? null,
                    'billing_period' => $requestData['billing_period'] ?? null,
                ],
            ]);

            // Create a pending payment record in our database
            $payment = Payment::create([
                'user_id' => $user->id,
                'amount' => $requestData['amount'],
                'currency' => $requestData['currency'],
                'status' => 'pending',
                'description' => $requestData['description'],
                'transaction_id' => $session->id,
            ]);

            return response()->json([
                'id' => $session->id,
                'url' => $session->url,
                'payment_id' => $payment->id,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Re-throw validation exceptions so Laravel handles them properly
            throw $e;
        } catch (\Exception $e) {
            Log::error('Payment checkout session creation failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create checkout session'], 500);
        }
    }

    /**
     * Handle Stripe webhook events.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $event = null;

        try {
            $event = Webhook::constructEvent(
                $payload,
                $sigHeader,
                env('STRIPE_WEBHOOK_SECRET')
            );
        } catch (\UnexpectedValueException $e) {
            // Invalid payload
            Log::error('Invalid Stripe webhook payload: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            // Invalid signature
            Log::error('Invalid Stripe webhook signature: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Handle the event
        switch ($event->type) {
            case 'checkout.session.completed':
                $session = $event->data->object;
                $this->handleCheckoutSessionCompleted($session);
                break;
            case 'invoice.payment_succeeded':
                $invoice = $event->data->object;
                $this->handleInvoicePaymentSucceeded($invoice);
                break;
            case 'customer.subscription.deleted':
                $subscription = $event->data->object;
                $this->handleSubscriptionCancelled($subscription);
                break;
            default:
                Log::info('Unhandled Stripe event type: ' . $event->type);
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Handle a completed checkout session.
     *
     * @param  object  $session
     * @return void
     */
    private function handleCheckoutSessionCompleted($session)
    {
        try {
            // Find the payment record
            $payment = Payment::where('transaction_id', $session->id)->first();
            
            if (!$payment) {
                Log::error('Payment record not found for transaction: ' . $session->id);
                return;
            }

            // Update payment status
            $payment->update([
                'status' => 'completed',
                'transaction_id' => $session->payment_intent,
            ]);

            // Get metadata
            $metadata = $session->metadata;
            $userId = $metadata->user_id ?? null;
            $paymentType = $metadata->payment_type ?? null;
            $jobId = $metadata->job_id ?? null;
            $planType = $metadata->plan_type ?? null;
            $billingPeriod = $metadata->billing_period ?? null;

            // Handle different payment types
            switch ($paymentType) {
                case 'subscription':
                    $this->handleSubscriptionPayment($userId, $planType, $billingPeriod, $payment);
                    break;
                case 'premium_job':
                    $this->handlePremiumJobPayment($userId, $jobId, $payment);
                    break;
                case 'featured_job':
                    $this->handleFeaturedJobPayment($userId, $jobId, $payment);
                    break;
            }
        } catch (\Exception $e) {
            Log::error('Error handling checkout session completed: ' . $e->getMessage());
        }
    }

    /**
     * Handle a successful invoice payment.
     *
     * @param  object  $invoice
     * @return void
     */
    private function handleInvoicePaymentSucceeded($invoice)
    {
        try {
            // For subscription renewals, we might want to extend the subscription
            Log::info('Invoice payment succeeded: ' . $invoice->id);
        } catch (\Exception $e) {
            Log::error('Error handling invoice payment succeeded: ' . $e->getMessage());
        }
    }

    /**
     * Handle subscription cancellation.
     *
     * @param  object  $subscription
     * @return void
     */
    private function handleSubscriptionCancelled($subscription)
    {
        try {
            // Find and update the subscription status
            $subscriptionRecord = Subscription::where('subscription_id', $subscription->id)->first();
            
            if ($subscriptionRecord) {
                $subscriptionRecord->update(['status' => 'cancelled']);
                Log::info('Subscription cancelled: ' . $subscription->id);
            }
        } catch (\Exception $e) {
            Log::error('Error handling subscription cancelled: ' . $e->getMessage());
        }
    }

    /**
     * Handle subscription payment.
     *
     * @param  int  $userId
     * @param  string  $planType
     * @param  string  $billingPeriod
     * @param  Payment  $payment
     * @return void
     */
    private function handleSubscriptionPayment($userId, $planType, $billingPeriod, $payment)
    {
        try {
            // Calculate subscription dates
            $startDate = now();
            $endDate = $billingPeriod === 'yearly' ? now()->addYear() : now()->addMonth();
            
            // Amount based on plan and period
            $amount = 0;
            if ($planType === 'premium') {
                $amount = $billingPeriod === 'yearly' ? 99.99 : 9.99;
            }
            
            // Create or update subscription
            Subscription::updateOrCreate(
                ['user_id' => $userId],
                [
                    'plan_type' => $planType,
                    'amount' => $amount,
                    'currency' => $payment->currency,
                    'billing_period' => $billingPeriod,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'status' => 'active',
                    'payment_id' => $payment->id,
                ]
            );
            
            // Update user's premium status
            $user = \App\Models\User::find($userId);
            if ($user) {
                $user->update(['is_premium' => true]);
            }
            
            Log::info('Subscription payment processed for user: ' . $userId);
        } catch (\Exception $e) {
            Log::error('Error handling subscription payment: ' . $e->getMessage());
        }
    }

    /**
     * Handle premium job payment.
     *
     * @param  int  $userId
     * @param  int  $jobId
     * @param  Payment  $payment
     * @return void
     */
    private function handlePremiumJobPayment($userId, $jobId, $payment)
    {
        try {
            // Calculate premium job dates (30 days)
            $startDate = now();
            $endDate = now()->addDays(30);
            
            // Create premium job posting record
            PremiumJobPosting::create([
                'job_id' => $jobId,
                'user_id' => $userId,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'payment_id' => $payment->id,
            ]);
            
            Log::info('Premium job payment processed for job: ' . $jobId);
        } catch (\Exception $e) {
            Log::error('Error handling premium job payment: ' . $e->getMessage());
        }
    }

    /**
     * Handle featured job payment.
     *
     * @param  int  $userId
     * @param  int  $jobId
     * @param  Payment  $payment
     * @return void
     */
    private function handleFeaturedJobPayment($userId, $jobId, $payment)
    {
        try {
            // Calculate featured job dates (7 days)
            $startDate = now();
            $endDate = now()->addDays(7);
            
            // Create featured listing record
            FeaturedListing::create([
                'job_id' => $jobId,
                'user_id' => $userId,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'payment_id' => $payment->id,
            ]);
            
            Log::info('Featured job payment processed for job: ' . $jobId);
        } catch (\Exception $e) {
            Log::error('Error handling featured job payment: ' . $e->getMessage());
        }
    }

    /**
     * Get user's payment history.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPaymentHistory(): JsonResponse
    {
        $user = Auth::user();
        $payments = Payment::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json(['data' => $payments]);
    }

    /**
     * Get user's subscription status.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSubscriptionStatus(): JsonResponse
    {
        $user = Auth::user();
        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('end_date', '>', now())
            ->first();
            
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
                $stripeSubscription = \Stripe\Subscription::retrieve($subscription->subscription_id);
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
}