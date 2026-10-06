<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_company_registers_with_a_company_profile(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Rami', 'email' => 'rami@example.com',
            'password' => 'secret-pass', 'password_confirmation' => 'secret-pass',
            'role' => 'company', 'company_name' => 'Cedar Tech',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.role', 'company')
            ->assertJsonPath('user.company.name', 'Cedar Tech')
            ->assertJsonStructure(['token']);
    }

    public function test_nobody_can_register_as_admin(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Eve', 'email' => 'eve@example.com',
            'password' => 'secret-pass', 'password_confirmation' => 'secret-pass',
            'role' => 'admin',
        ])->assertUnprocessable()->assertJsonValidationErrors('role');
    }

    public function test_login_returns_a_token_and_rejects_a_wrong_password(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'wrong'])
            ->assertUnprocessable();

        $token = $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'password'])
            ->assertOk()->json('token');

        $this->withToken($token)->getJson('/api/auth/me')->assertOk()->assertJsonPath('data.email', $user->email);
    }

    public function test_a_suspended_user_cannot_log_in(): void
    {
        $user = User::factory()->create(['is_active' => false]);

        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'password'])->assertForbidden();
    }
}
