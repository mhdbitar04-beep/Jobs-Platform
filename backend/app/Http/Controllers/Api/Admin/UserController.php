<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $users = User::with('company')
            ->when($request->query('search'), function ($q, string $term) {
                $q->where(fn ($q) => $q->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%"));
            })
            ->when($request->query('role'), fn ($q, string $role) => $q->where('role', $role))
            ->latest()
            ->orderByDesc('id')
            ->paginate(12);

        return UserResource::collection($users);
    }

    public function update(Request $request, User $user): UserResource
    {
        $this->guardAdmin($request, $user);

        $data = $request->validate(['is_active' => ['required', 'boolean']]);

        $user->update($data);

        // Suspending someone also signs them out everywhere.
        if (! $user->is_active) {
            $user->tokens()->delete();
        }

        return new UserResource($user->load('company'));
    }

    public function destroy(Request $request, User $user): Response
    {
        $this->guardAdmin($request, $user);

        $user->delete();

        return response()->noContent();
    }

    /** Admin accounts cannot be suspended or deleted from the panel, including your own. */
    private function guardAdmin(Request $request, User $user): void
    {
        abort_if($user->isAdmin(), 403, 'Admin accounts cannot be changed here.');
    }
}
