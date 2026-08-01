<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize()
    {
        return true; // Allow all for registration
    }

 public function rules(): array
{
  return [
       'name' => 'required|string|max:255',
       'username' => 'required|string|max:255',
       'email' => 'required|email|max:255',
       'password' => 'required|string|min:8',
       'password_confirmation' => 'required|string|same:password',
  ];
}

}
