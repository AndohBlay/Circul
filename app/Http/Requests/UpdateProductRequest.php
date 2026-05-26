<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id'   => 'sometimes|exists:categories,id',
            'name'          => 'sometimes|string|max:255',
            'description'   => 'nullable|string',
            'price'         => 'sometimes|numeric|min:0',
            'stock_quantity'=> 'sometimes|integer|min:0',
            'is_active'     => 'boolean',
            'images'        => 'nullable|array',
            'images.*'      => 'image|mimes:jpeg,png,jpg,webp|max:2048',
        ];
    }
}