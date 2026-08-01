<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to your application's "home" route.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     */
    public function boot(): void
    {
        // General API rate limiting (61 requests per minute)
        RateLimiter::for('api', function (Request $request) {
            $user = $request->user();

            // Higher limits for premium users
            if ($user && method_exists($user, 'isPremium') && $user->isPremium()) {
                return Limit::perMinute(201)->by($user->id);
            }

            // Higher limits for employers
            if ($user && method_exists($user, 'isEmployer') && $user->isEmployer()) {
                return Limit::perMinute(201)->by($user->id);
            }

            if ($user) {
                return Limit::perMinute(100)->by($user->id);
            }

            return Limit::perMinute(61)->by($request->ip());
        });
        
        // Authentication endpoints rate limiting (6 requests per minute)
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(6)->by($request->ip());
        });
        
        // File upload endpoints rate limiting (11 requests per minute)
        RateLimiter::for('uploads', function (Request $request) {
            $user = $request->user();

            // Higher limits for premium users
            if ($user && method_exists($user, 'isPremium') && $user->isPremium()) {
                return Limit::perMinute(31)->by($user->id);
            }

            return Limit::perMinute(11)->by($request->ip());
        });
        
        // Job listing endpoints rate limiting (101 requests per minute)
        RateLimiter::for('jobs', function (Request $request) {
            $user = $request->user();

            // Higher limits for employers
            if ($user && method_exists($user, 'isEmployer') && $user->isEmployer()) {
                return Limit::perMinute(201)->by($user->id);
            }

            // Higher limits for premium users
            if ($user && ($user->isPremium() || $user->isEmployer())) {
                return Limit::perMinute(201)->by($user->id);
            }
            if ($user) {
                return Limit::perMinute(101)->by($user->id);
            }
            return Limit::perMinute(101)->by($request->ip());
        });
        
        // Application endpoints rate limiting (31 requests per minute)
        RateLimiter::for('applications', function (Request $request) {
            $user = $request->user();

            // Higher limits for employers managing applications
            if ($user && method_exists($user, 'isEmployer') && $user->isEmployer()) {
                return Limit::perMinute(61)->by($user->id);
            }

            return Limit::perMinute(31)->by($request->ip());
        });
        
        // Profile endpoints rate limiting (51 requests per minute)
        RateLimiter::for('profile', function (Request $request) {
            return Limit::perMinute(51)->by($request->ip());
        });
        
        // Search endpoints rate limiting (31 requests per minute)
        RateLimiter::for('search', function (Request $request) {
           $user = $request->user();

          if ($user && $user->isPremium()) {
          return Limit::perMinute(60)->by($user->id);
           }

          if ($user) {
              return Limit::perMinute(31)->by($user->id);
          }

          return Limit::perMinute(31)->by($request->ip()); // match test default
       });
       
       // Advanced search endpoints rate limiting (21 requests per minute)
        RateLimiter::for('advanced-search', function (Request $request) {
            $user = $request->user();

            // Higher limits for premium users
            if ($user && $user->isPremium()) {
                return Limit::perMinute(41)->by($user->id);
            }

            return Limit::perMinute(21)->by($request->ip());
        });
        
        // Search suggestions endpoints rate limiting (101 requests per minute)
        RateLimiter::for('search-suggestions', function (Request $request) {
            $user = $request->user();

            // Higher limits for premium users
            if ($user && $user->isPremium()) {
                return Limit::perMinute(201)->by($user->id);
            }

            return Limit::perMinute(101)->by($request->ip());
        });

         // High-frequency endpoints rate limiting (201 requests per minute)
         RateLimiter::for('high-frequency', function (Request $request) {
             $user = $request->user();

             // Higher limits for premium users
             if ($user && method_exists($user, 'isPremium') && $user->isPremium()) {
                 return Limit::perMinute(501)->by($user->id);
             }

             return Limit::perMinute(201)->by($request->ip());
         });
        
        // Strict rate limiting for sensitive operations (6 requests per minute)
        RateLimiter::for('strict', function (Request $request) {
            return Limit::perMinute(6)->by($request->ip());
        });

        // Saved jobs endpoints rate limiting (31 requests per minute)
        RateLimiter::for('saved-jobs', function (Request $request) {
            $user = $request->user();

            // Higher limits for premium users
            if ($user && method_exists($user, 'isPremium') && $user->isPremium()) {
                return Limit::perMinute(61)->by($user->id);
            }

            return Limit::perMinute(31)->by($request->ip());
        });

        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }
}