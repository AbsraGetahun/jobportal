<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/', function () {
    return 'Job Portal API is running!';
});

Route::get('/ping', function () {
    return 'pong';
});

// ============================================
// DATABASE DEBUG ROUTES
// ============================================

Route::get('/debug-db', function() {
    try {
        $pdo = DB::connection()->getPdo();
        return response()->json([
            'status' => 'connected',
            'db_name' => $pdo->query('SELECT DATABASE()')->fetchColumn(),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ]);
    }
});

Route::get('/debug-tables', function() {
    try {
        $tables = DB::select('SHOW TABLES');
        return response()->json([
            'status' => 'success',
            'tables' => array_map('current', $tables),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ]);
    }
});

Route::get('/debug-jobs', function() {
    try {
        $jobs = DB::table('jobs')->take(5)->get();
        return response()->json([
            'status' => 'success',
            'count' => count($jobs),
            'jobs' => $jobs,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ]);
    }
});

Route::get('/debug-companies', function() {
    try {
        $companies = DB::table('companies')->take(5)->get();
        return response()->json([
            'status' => 'success',
            'count' => count($companies),
            'companies' => $companies,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ]);
    }
});