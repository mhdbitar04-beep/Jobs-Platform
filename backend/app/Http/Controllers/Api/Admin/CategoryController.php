<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CategoryController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $category = Category::create($request->validate([
            'name' => ['required', 'string', 'max:80', 'unique:categories,name'],
        ]));

        return (new CategoryResource($category))->response()->setStatusCode(201);
    }

    public function update(Request $request, Category $category): CategoryResource
    {
        $category->update($request->validate([
            'name' => ['required', 'string', 'max:80', Rule::unique('categories', 'name')->ignore($category)],
        ]));

        return new CategoryResource($category->loadCount('jobs'));
    }

    public function destroy(Category $category): Response
    {
        if ($category->jobs()->exists()) {
            throw ValidationException::withMessages(['category' => 'Move or delete the jobs in this category first.']);
        }

        $category->delete();

        return response()->noContent();
    }
}
