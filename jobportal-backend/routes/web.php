<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// ============================================
// SIMPLE ROUTES
// ============================================

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

// ============================================
// NEW DETAILED DEBUG ROUTES
// ============================================

Route::get('/debug-env-file', function() {
    $envPath = base_path('.env');
    if (file_exists($envPath)) {
        $content = file_get_contents($envPath);
        // Mask password for security
        $content = preg_replace('/DB_PASSWORD=.*/', 'DB_PASSWORD=***MASKED***', $content);
        return response()->json([
            'status' => 'exists',
            'path' => $envPath,
            'content' => $content,
            'permissions' => substr(sprintf('%o', fileperms($envPath)), -4),
        ]);
    } else {
        return response()->json([
            'status' => 'not_found',
            'path' => $envPath,
        ]);
    }
});

Route::get('/debug-direct-db', function() {
    try {
        $host = 'mysql-2cada97c-absra-jobportal.e.aivencloud.com';
        $port = '26003';
        $dbname = 'defaultdb';
        $user = 'avnadmin';
        $pass = 'AVNS_vbj5SN5bGRhvt90IT1V';
        
        $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $user, $pass, [
            PDO::MYSQL_ATTR_SSL_CA => '/var/www/html/ca.pem',
            PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false,
        ]);
        
        $stmt = $pdo->query('SELECT DATABASE()');
        $db = $stmt->fetchColumn();
        
        return response()->json([
            'status' => 'connected',
            'database' => $db,
            'host' => $host,
            'user' => $user,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'code' => $e->getCode(),
        ]);
    }
});

Route::get('/debug-aiven', function() {
    $host = 'mysql-2cada97c-absra-jobportal.e.aivencloud.com';
    $port = '26003';
    
    // Test DNS resolution
    $ip = gethostbyname($host);
    
    // Test port connection
    $connection = @fsockopen($host, $port, $errno, $errstr, 5);
    
    return response()->json([
        'host' => $host,
        'port' => $port,
        'resolved_ip' => $ip,
        'port_open' => $connection !== false,
        'errno' => $errno ?? null,
        'errstr' => $errstr ?? null,
    ]);
});
Route::get('/debug-log', function() {
    $logPath = storage_path('logs/laravel.log');
    if (file_exists($logPath)) {
        $content = file_get_contents($logPath);
        // Get last 50 lines
        $lines = explode("\n", $content);
        $lastLines = array_slice($lines, -50);
        return response()->json([
            'status' => 'exists',
            'path' => $logPath,
            'last_50_lines' => implode("\n", $lastLines),
        ]);
    } else {
        return response()->json([
            'status' => 'not_found',
            'path' => $logPath,
        ]);
    }
});
Route::get('/debug-storage', function() {
    $paths = [
        'storage' => storage_path(),
        'storage/logs' => storage_path('logs'),
        'storage/framework' => storage_path('framework'),
        'storage/framework/cache' => storage_path('framework/cache'),
        'storage/framework/sessions' => storage_path('framework/sessions'),
        'storage/framework/views' => storage_path('framework/views'),
    ];
    
    $results = [];
    foreach ($paths as $name => $path) {
        $exists = file_exists($path);
        $isWritable = $exists ? is_writable($path) : false;
        $results[$name] = [
            'path' => $path,
            'exists' => $exists,
            'writable' => $isWritable,
            'permissions' => $exists ? substr(sprintf('%o', fileperms($path)), -4) : 'N/A',
        ];
    }
    
    return response()->json($results);
});