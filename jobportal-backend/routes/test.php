<?php

use Illuminate\Http\Request;

Route::post('/test-login', function (Request $request) {
    return response()->json([
        'all' => $request->all(),
        'input' => $request->input(),
        'email' => $request->input('email'),
        'password' => $request->input('password'),
        'has_email' => $request->has('email'),
        'has_password' => $request->has('password'),
    ]);
});