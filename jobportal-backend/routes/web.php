<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return 'API is running!';
});

Route::get('/ping', function () {
    return 'pong';
});