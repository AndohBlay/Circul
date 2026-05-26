<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id'   => 'required|exists:categories,id',
            'name'          => 'required|string|max:255',
            'description'   => 'nullable|string',
            'price'         => 'required|numeric|min:0',
            'stock_quantity'=> 'required|integer|min:0',
            'is_active'     => 'boolean',
            'images'        => 'nullable|array',
            'images.*'      => 'image|mimes:jpeg,png,jpg,webp|max:2048',
        ];
    }
}