<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FieldOfStudyController extends Controller
{
    public function index()
    {
        $fieldsOfStudy = \App\Models\FieldOfStudy::orderBy('name')->get();
        
        return response()->json([
            'success' => true,
            'data' => $fieldsOfStudy
        ]);
    }
}
