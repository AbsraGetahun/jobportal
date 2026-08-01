<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Company;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    /**
     * Display a listing of companies.
     */
    public function index(Request $request): JsonResponse
    {
        $companies = Company::paginate(10);
        return response()->json(['data' => $companies]);
    }

    /**
     * Store a newly created company in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255|unique:companies,name',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'nullable|string|min:10|max:1000',
            'industry' => 'nullable|string|max:100|in:technology,healthcare,finance,education,marketing,sales,engineering,design,hr,legal,other',
            'website' => 'nullable|string|max:255|url',
            'phone' => 'nullable|string|max:20|regex:/^[\+]?[0-9\s\-\(\)]+$/',
            'email' => 'nullable|string|email|max:255|unique:companies,email',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20|regex:/^[a-zA-Z0-9\s\-]+$/',
            'employees_count' => 'nullable|integer|min:1|max:1000000',
            'establishment_year' => 'nullable|integer|min:1800|max:' . date('Y'),
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('logos', 'public');
            $validatedData['logo'] = $logoPath;
        }

        $company = Company::create(array_merge($validatedData, [
            'is_verified' => false, // Companies need to be verified by admin
        ]));

        return response()->json(['data' => $company], 201);
    }

    /**
     * Display the specified company.
     */
    public function show(string $id): JsonResponse
    {
        $company = Company::findOrFail($id);
        return response()->json(['data' => $company]);
    }

    /**
     * Update the specified company in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $company = Company::findOrFail($id);

        // In a real application, you might want to check if the authenticated user
        // is authorized to update this company (e.g., is an admin or company owner)

        $validatedData = $request->validate([
            'name' => 'string|max:255|unique:companies,name,' . $company->id,
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'nullable|string|min:10|max:1000',
            'industry' => 'nullable|string|max:100|in:technology,healthcare,finance,education,marketing,sales,engineering,design,hr,legal,other',
            'website' => 'nullable|string|max:255|url',
            'phone' => 'nullable|string|max:20|regex:/^[\+]?[0-9\s\-\(\)]+$/',
            'email' => 'nullable|string|email|max:255|unique:companies,email,' . $company->id,
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20|regex:/^[a-zA-Z0-9\s\-]+$/',
            'employees_count' => 'nullable|integer|min:1|max:1000000',
            'establishment_year' => 'nullable|integer|min:1800|max:' . date('Y'),
            'is_verified' => 'boolean',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo if it exists
            if ($company->logo) {
                Storage::disk('public')->delete($company->logo);
            }
            
            $logoPath = $request->file('logo')->store('logos', 'public');
            $validatedData['logo'] = $logoPath;
        }

        $company->update($validatedData);

        return response()->json(['data' => $company]);
    }

    /**
     * Remove the specified company from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $company = Company::findOrFail($id);

        // In a real application, you might want to check if the authenticated user
        // is authorized to delete this company (e.g., is an admin)

        // Delete logo if it exists
        if ($company->logo) {
            Storage::disk('public')->delete($company->logo);
        }

        $company->delete();

        return response()->json(['message' => 'Company deleted successfully']);
    }

    /**
     * Verify a company (admin only).
     */
    public function verify(string $id): JsonResponse
    {
        // In a real application, you would check if the authenticated user is an admin

        $company = Company::findOrFail($id);
        $company->update(['is_verified' => true]);

        return response()->json(['data' => $company]);
    }
}
