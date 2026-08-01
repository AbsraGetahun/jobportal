<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Exception;

class EnhancedHandler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
        'api_token',
        'authorization',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            // Log all exceptions for monitoring
            if ($this->shouldReport($e)) {
                logger()->error('Unhandled exception', [
                    'exception' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString(),
                    'user_id' => auth()->id() ?? null,
                    'url' => request()->fullUrl(),
                    'method' => request()->method(),
                    'ip' => request()->ip(),
                ]);
            }
        });
        
        // Register custom exception handlers
        $this->renderable(function (ModelNotFoundException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'error' => 'Resource not found',
                    'message' => 'The requested resource could not be found.',
                    'code' => 'MODEL_NOT_FOUND',
                    'timestamp' => now()->toISOString(),
                ], 404);
            }
        });
        
        $this->renderable(function (NotFoundHttpException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'error' => 'Endpoint not found',
                    'message' => 'The requested endpoint does not exist.',
                    'code' => 'ENDPOINT_NOT_FOUND',
                    'timestamp' => now()->toISOString(),
                ], 404);
            }
        });
        
        $this->renderable(function (MethodNotAllowedHttpException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'error' => 'Method not allowed',
                    'message' => 'The HTTP method is not allowed for this endpoint.',
                    'code' => 'METHOD_NOT_ALLOWED',
                    'timestamp' => now()->toISOString(),
                ], 405);
            }
        });
        
        $this->renderable(function (ThrottleRequestsException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'error' => 'Rate limit exceeded',
                    'message' => 'You have exceeded the rate limit for this endpoint. Please try again later.',
                    'code' => 'RATE_LIMIT_EXCEEDED',
                    'retry_after' => $e->getHeaders()['Retry-After'] ?? null,
                    'timestamp' => now()->toISOString(),
                ], 429);
            }
        });
    }

    /**
     * Determine if the exception handler response should be JSON.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $e
     * @return bool
     */
    protected function shouldReturnJson($request, Throwable $e)
    {
        // Always return JSON for API requests
        if ($request->is('api/*')) {
            return true;
        }

        return $request->expectsJson();
    }

    /**
     * Convert an authentication exception into a response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Illuminate\Auth\AuthenticationException  $exception
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        if ($request->is('api/*')) {
            return response()->json([
                'error' => 'Unauthenticated',
                'message' => 'You must be authenticated to access this resource.',
                'code' => 'UNAUTHENTICATED',
                'timestamp' => now()->toISOString(),
            ], 401);
        }
        
        return redirect()->guest($exception->redirectTo($request) ?? route('login'));
    }

    /**
     * Create a response object from the given validation exception.
     *
     * @param  \Illuminate\Validation\ValidationException  $e
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function convertValidationExceptionToResponse(ValidationException $e, $request)
    {
        if ($e->response) {
            return $e->response;
        }
        
        if ($this->shouldReturnJson($request, $e)) {
            return response()->json([
                'error' => 'Validation failed',
                'message' => 'The given data failed to pass validation.',
                'code' => 'VALIDATION_FAILED',
                'errors' => $e->errors(),
                'timestamp' => now()->toISOString(),
            ], $e->status);
        }
        
        return $this->invalid($request, $e);
    }

    /**
     * Prepare a JSON response for the given exception.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $e
     * @return \Illuminate\Http\JsonResponse
     */
    protected function prepareJsonResponse($request, Throwable $e)
    {
        // Determine the status code
        $status = $this->isHttpException($e) ? $e->getStatusCode() : 500;
        
        // Prepare error response data
        $errorData = [
            'error' => $this->getErrorMessage($e),
            'message' => $this->isHttpException($e) ? $e->getMessage() : 'An error occurred while processing your request.',
            'code' => $this->getErrorCode($e),
            'timestamp' => now()->toISOString(),
        ];
        
        // Add debug information in development environment
        if (app()->environment('local', 'testing')) {
            $errorData['debug'] = [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => collect($e->getTrace())->take(10)->toArray(), // Limit trace for security
            ];
        }
        
        // Add request context
        $errorData['context'] = [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'user_id' => auth()->id() ?? null,
        ];
        
        return response()->json($errorData, $status);
    }

    /**
     * Get a user-friendly error message based on the exception type.
     *
     * @param  \Throwable  $e
     * @return string
     */
    protected function getErrorMessage(Throwable $e): string
    {
        if ($e instanceof HttpException) {
            return match($e->getStatusCode()) {
                400 => 'Bad Request',
                401 => 'Unauthorized',
                403 => 'Forbidden',
                404 => 'Not Found',
                405 => 'Method Not Allowed',
                422 => 'Unprocessable Entity',
                429 => 'Too Many Requests',
                500 => 'Internal Server Error',
                503 => 'Service Unavailable',
                default => 'HTTP Error'
            };
        }
        
        if ($e instanceof QueryException) {
            return 'Database Error';
        }
        
        if ($e instanceof ModelNotFoundException) {
            return 'Resource Not Found';
        }
        
        return 'An error occurred';
    }

    /**
     * Get an error code based on the exception type.
     *
     * @param  \Throwable  $e
     * @return string
     */
    protected function getErrorCode(Throwable $e): string
    {
        if ($e instanceof HttpException) {
            return 'HTTP_' . $e->getStatusCode();
        }
        
        if ($e instanceof QueryException) {
            return 'DATABASE_ERROR';
        }
        
        if ($e instanceof ModelNotFoundException) {
            return 'MODEL_NOT_FOUND';
        }
        
        if ($e instanceof ValidationException) {
            return 'VALIDATION_FAILED';
        }
        
        if ($e instanceof AuthenticationException) {
            return 'UNAUTHENTICATED';
        }
        
        return 'UNKNOWN_ERROR';
    }

    /**
     * Report or log an exception.
     *
     * @param  \Throwable  $e
     * @return void
     *
     * @throws \Throwable
     */
    public function report(Throwable $e)
    {
        // Don't report validation exceptions or authentication exceptions
        if ($e instanceof ValidationException || $e instanceof AuthenticationException) {
            return;
        }
        
        // Report all other exceptions
        parent::report($e);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $e
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @throws \Throwable
     */
    public function render($request, Throwable $e)
    {
        // Handle API requests with enhanced error responses
        if ($request->is('api/*')) {
            return $this->prepareJsonResponse($request, $e);
        }
        
        return parent::render($request, $e);
    }
}