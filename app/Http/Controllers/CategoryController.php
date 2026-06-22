<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // List all categories (public)
    public function index(): JsonResponse
    {
        return response()->json(Category::orderBy('name')->get());
    }

    // Admin: create a category
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'        => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
        ]);

        $category = Category::create($request->only(['name', 'description']));

        return response()->json(['message' => 'Category created.', 'category' => $category], 201);
    }

    // Admin: update a category
    public function update(Request $request, $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'name'        => 'sometimes|string|max:255|unique:categories,name,' . $id,
            'description' => 'nullable|string',
        ]);

        $category->update($request->only(['name', 'description']));

        return response()->json(['message' => 'Category updated.', 'category' => $category]);
    }

    // Admin: delete a category
    public function destroy($id): JsonResponse
    {
        Category::findOrFail($id)->delete();

        return response()->json(['message' => 'Category deleted.']);
    }
}