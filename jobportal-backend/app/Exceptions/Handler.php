<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;

class Handler extends ExceptionHandler
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
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });

        $this->renderable(function (Throwable $exception, $request) {
            // Always handle API requests with enhanced error format
            if ($request->is('api/*') || $request->expectsJson()) {
                return $this->handleApiException($request, $exception);
            }
        });
    }

    /**
     * Handle API exceptions with enhanced error response format.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $exception
     * @return \Illuminate\Http\JsonResponse
     */
    public function handleApiException($request, Throwable $exception)
    {
        $statusCode = $this->getStatusCode($exception);
        $errorCode = $this->getErrorCode($exception);

        \Log::info('API Exception handled', [
            'exception_type' => get_class($exception),
            'status_code' => $statusCode,
            'error_code' => $errorCode,
            'debug_mode' => config('app.debug'),
            'request_url' => $request->fullUrl(),
            'request_method' => $request->method(),
        ]);

        $response = [
            'error' => $this->getErrorTitle($exception),
            'message' => $this->getErrorMessage($exception),
            'code' => $errorCode,
            'timestamp' => now()->toISOString(),
        ];

        // Add context information for debugging
        $response['context'] = [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'user_id' => $request->user() ? $request->user()->id : null,
        ];

        // Add retry_after for rate limiting
        if ($exception instanceof \Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException) {
            $response['retry_after'] = $exception->getHeaders()['Retry-After'] ?? null;
        }

        // Add validation errors if it's a validation exception
        if ($exception instanceof ValidationException) {
            $response['errors'] = $exception->errors();
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Get appropriate status code for the exception.
     *
     * @param  \Throwable  $exception
     * @return int
     */
    protected function getStatusCode(Throwable $exception): int
    {
        if ($exception instanceof AuthenticationException) {
            return 401;
        }

        if ($exception instanceof ValidationException) {
            return 422;
        }

        if ($exception instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
            return 404;
        }

        if ($exception instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
            return 404;
        }

        if ($exception instanceof \Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException) {
            return 429;
        }

        return 500;
    }

    /**
     * Get error code for the exception.
     *
     * @param  \Throwable  $exception
     * @return string
     */
    protected function getErrorCode(Throwable $exception): string
    {
        if ($exception instanceof AuthenticationException) {
            return 'UNAUTHENTICATED';
        }

        if ($exception instanceof ValidationException) {
            return 'VALIDATION_FAILED';
        }

        if ($exception instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
            // Check if this was originally a ModelNotFoundException
            if ($exception->getPrevious() instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                return 'MODEL_NOT_FOUND';
            }
            // For API requests, treat as model not found
            return 'MODEL_NOT_FOUND';
        }

        if ($exception instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
            return 'MODEL_NOT_FOUND';
        }

        if ($exception instanceof \Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException) {
            return 'RATE_LIMIT_EXCEEDED';
        }

        return 'INTERNAL_SERVER_ERROR';
    }

    /**
     * Get user-friendly error message.
     *
     * @param  \Throwable  $exception
     * @return string
     */
    protected function getErrorMessage(Throwable $exception): string
    {
        if ($exception instanceof AuthenticationException) {
            return 'Authentication required to access this resource.';
        }

        if ($exception instanceof ValidationException) {
            return 'The given data was invalid.';
        }

        if ($exception instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
            // Check if this was originally a ModelNotFoundException
            if ($exception->getPrevious() instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                $original = $exception->getPrevious();
                return $original->getMessage() ?: 'The requested job is no longer available.';
            }
            return 'The requested page was not found.';
        }

        if ($exception instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $exception->getMessage() ?: 'The requested resource was not found.';
        }

        if ($exception instanceof \Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException) {
            return 'Too many requests. Please try again later.';
        }

        return config('app.debug') ? $exception->getMessage() : 'An unexpected error occurred.';
    }

    /**
     * Get error title for the exception.
     *
     * @param  \Throwable  $exception
     * @return string
     */
    protected function getErrorTitle(Throwable $exception): string
    {
        if ($exception instanceof AuthenticationException) {
            return 'Unauthenticated';
        }

        if ($exception instanceof ValidationException) {
            return 'Validation failed';
        }

        if ($exception instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
            // Check if this was originally a ModelNotFoundException
            if ($exception->getPrevious() instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                return 'Job not found';
            }
            // For API requests, treat as resource not found
            return 'Resource not found';
        }

        if ($exception instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
            return 'Job not found';
        }

        if ($exception instanceof \Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException) {
            return 'Rate limit exceeded';
        }

        return 'Internal server error';
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
        if ($this->shouldReturnJson($request, $exception)) {
            return $this->handleApiException($request, $exception);
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
            return $this->handleApiException($request, $e);
        }

        return $this->invalid($request, $e);
    }
}