<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateApiKeysRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Add proper authorization logic if needed
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'ampre_api_url' => 'nullable|url|max:255',
            'ampre_vow_token' => 'nullable|string|max:500',
            'ampre_idx_token' => 'nullable|string|max:500', 
            'google_maps_api_key' => 'nullable|string|max:500',
            'walkscore_api_key' => 'nullable|string|max:255',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'ampre_api_url.url' => 'The AMPRE API URL must be a valid URL.',
            'ampre_vow_token.max' => 'The AMPRE VOW token is too long.',
            'ampre_idx_token.max' => 'The AMPRE IDX token is too long.',
            'google_maps_api_key.max' => 'The Google Maps API key is too long.',
            'walkscore_api_key.max' => 'The WalkScore API key is too long.',
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     */
    public function attributes(): array
    {
        return [
            'ampre_api_url' => 'AMPRE API URL',
            'ampre_vow_token' => 'AMPRE VOW Token', 
            'ampre_idx_token' => 'AMPRE IDX Token',
            'google_maps_api_key' => 'Google Maps API Key',
            'walkscore_api_key' => 'WalkScore API Key',
        ];
    }
}