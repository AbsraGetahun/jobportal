<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckTokenExpiry
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
  public function handle(Request $request, Closure $next)
  {
      // Only check token expiry for authenticated users
      if ($request->user()) {
          $token = $request->user()->currentAccessToken();

          if ($token && $token->expires_at && $token->expires_at->isPast()) {
              // Delete expired token
              $token->delete();

              return response()->json([
                  'message' => 'Token expired. Please login again.'
              ], 401);
          }
      }

      return $next($request);
  }
}
