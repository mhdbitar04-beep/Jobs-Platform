<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_SEEKER = 'seeker';
    public const ROLE_COMPANY = 'company';
    public const ROLE_ADMIN = 'admin';

    protected $fillable = [
        'name', 'email', 'password', 'role', 'is_active',
        'phone', 'location', 'headline', 'bio', 'skills', 'resume_path',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $attributes = ['role' => self::ROLE_SEEKER, 'is_active' => true];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'skills' => 'array',
        ];
    }

    public function isSeeker(): bool
    {
        return $this->role === self::ROLE_SEEKER;
    }

    public function isCompany(): bool
    {
        return $this->role === self::ROLE_COMPANY;
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function company(): HasOne
    {
        return $this->hasOne(Company::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function savedJobs(): BelongsToMany
    {
        return $this->belongsToMany(JobPost::class, 'saved_jobs')->withPivot('created_at');
    }
}
