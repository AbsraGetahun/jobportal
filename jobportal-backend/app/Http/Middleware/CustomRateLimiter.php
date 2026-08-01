<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CustomRateLimiter
{
    /**
     * The rate limiter instance.
     *
     * @var \Illuminate\Cache\RateLimiter
     */
    protected $limiter;

    /**
     * Create a new middleware instance.
     *
     * @param  \Illuminate\Cache\RateLimiter  $limiter
     * @return void
     */
    public function __construct(RateLimiter $limiter)
    {
        $this->limiter = $limiter;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $limiter
     * @param  int  $maxAttempts
     * @param  int  $decayMinutes
     * @return mixed
     */
    public function handle(Request $request, Closure $next, string $limiter, int $maxAttempts = 60, int $decayMinutes = 1)
    {
        // Adjust max attempts based on user type
        $adjustedMaxAttempts = $this->getAdjustedMaxAttempts($request, $maxAttempts);

        $key = $this->resolveRequestSignature($request, $limiter);

        // Check if the request is rate limited
        if ($this->limiter->tooManyAttempts($key, $adjustedMaxAttempts)) {
            // Log the rate limiting event
            Log::warning('Rate limit exceeded', [
                'limiter' => $limiter,
                'key' => $key,
                'ip' => $request->ip(),
                'user_id' => $request->user()?->id,
                'user_type' => $this->getUserType($request->user()),
                'url' => $request->url(),
                'method' => $request->method(),
                'attempts' => $this->limiter->attempts($key),
                'available_in' => $this->limiter->availableIn($key)
            ]);

            return $this->buildResponse($key, $adjustedMaxAttempts);
        }

        // Increment the attempts count
        $this->limiter->hit($key, $decayMinutes * 60);

        $response = $next($request);

        return $this->addHeaders(
            $response, $adjustedMaxAttempts,
            $this->calculateRemainingAttempts($key, $adjustedMaxAttempts)
        );
    }

    /**
     * Resolve request signature.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $limiter
     * @return string
     */
    protected function resolveRequestSignature(Request $request, string $limiter)
    {
        if ($user = $request->user()) {
            return sha1($limiter.$user->id);
        } elseif ($route = $request->route()) {
            return sha1($limiter.$route->getDomain().'|'.$request->ip());
        }

        return sha1($limiter.'|'.$request->ip());
    }

    /**
     * Create a 'too many attempts' response.
     *
     * @param  string  $key
     * @param  int  $maxAttempts
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function buildResponse($key, $maxAttempts)
    {
        $retryAfter = $this->limiter->availableIn($key);

        return response()->json([
            'error' => 'Too Many Requests',
            'message' => 'You have exceeded the rate limit for this endpoint. Please try again later.',
            'retry_after' => $retryAfter,
        ], 429)->header(
            'Retry-After', $retryAfter
        )->header(
            'X-RateLimit-Limit', $maxAttempts
        )->header(
            'X-RateLimit-Remaining', 0
        )->header(
            'X-RateLimit-Reset', now()->addSeconds($retryAfter)->getTimestamp()
        );
    }

    /**
     * Add the rate limit headers to the response.
     *
     * @param  \Symfony\Component\HttpFoundation\Response  $response
     * @param  int  $maxAttempts
     * @param  int  $remainingAttempts
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function addHeaders(Response $response, int $maxAttempts, int $remainingAttempts)
    {
        $response->headers->add([
            'X-RateLimit-Limit' => $maxAttempts,
            'X-RateLimit-Remaining' => $remainingAttempts,
            'X-RateLimit-Reset' => now()->addMinutes(1)->getTimestamp(),
        ]);

        return $response;
    }

    /**
     * Calculate the number of remaining attempts.
     *
     * @param  string  $key
     * @param  int  $maxAttempts
     * @return int
     */
    protected function calculateRemainingAttempts($key, $maxAttempts)
    {
        $attempts = $this->limiter->attempts($key);

        return max(0, $maxAttempts - $attempts);
    }

    /**
     * Get adjusted max attempts based on user type.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $defaultMaxAttempts
     * @return int
     */
    protected function getAdjustedMaxAttempts(Request $request, int $defaultMaxAttempts): int
    {
        $user = $request->user();

        if (!$user) {
            return $defaultMaxAttempts; // Default for unauthenticated users
        }

        // Premium users get higher limits
        if ($user->is_premium) {
            return $defaultMaxAttempts * 2; // Double the limit for premium users
        }

        // Employers get higher limits
        if ($user->hasCompany) {
            return $defaultMaxAttempts * 2; // Double the limit for employers
        }

        return $defaultMaxAttempts;
    }

    /**
     * Get user type for logging purposes.
     *
     * @param  \App\Models\User|null  $user
     * @return string
     */
    protected function getUserType($user): string
    {
        if (!$user) {
            return 'guest';
        }

        if ($user->is_premium && $user->hasCompany) {
            return 'premium_employer';
        }

        if ($user->is_premium) {
            return 'premium';
        }

        if ($user->hasCompany) {
            return 'employer';
        }

        return 'regular';
    }
}