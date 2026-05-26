<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    // Public - anyone can view products
    public function index(): JsonResponse
    {
        $products = Product::with(['category', 'images'])
            ->where('is_active', true)
            ->paginate(15);

        return response()->json($products);
    }

    public function show($id): JsonResponse
    {
        $product = Product::with(['category', 'images'])
            ->findOrFail($id);

        return response()->json($product);
    }

    // Admin only
    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = Product::create([
            'category_id'    => $request->category_id,
            'name'           => $request->name,
            'slug'           => Str::slug($request->name),
            'description'    => $request->description,
            'price'          => $request->price,
            'stock_quantity' => $request->stock_quantity,
            'is_active'      => $request->is_active ?? true,
        ]);

        // Handle image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('products', 'public');
                $product->images()->create([
                    'image_path' => $path,
                    'is_primary' => $index === 0,
                ]);
            }
        }

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product->load(['category', 'images']),
        ], 201);
    }

    public function update(UpdateProductRequest $request, $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $product->update([
            'category_id'    => $request->category_id ?? $product->category_id,
            'name'           => $request->name ?? $product->name,
            'slug'           => $request->name ? Str::slug($request->name) : $product->slug,
            'description'    => $request->description ?? $product->description,
            'price'          => $request->price ?? $product->price,
            'stock_quantity' => $request->stock_quantity ?? $product->stock_quantity,
            'is_active'      => $request->is_active ?? $product->is_active,
        ]);

        // Handle new image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('products', 'public');
                $product->images()->create([
                    'image_path' => $path,
                    'is_primary' => false,
                ]);
            }
        }

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product->load(['category', 'images']),
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $product = Product::findOrFail($id);

        // Delete images from storage
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }
}