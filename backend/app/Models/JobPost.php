<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobPost extends Model
{
    use HasFactory;

    public const TYPES = ['full_time', 'part_time', 'contract', 'internship'];
    public const WORK_MODES = ['onsite', 'remote', 'hybrid'];
    public const LEVELS = ['junior', 'mid', 'senior', 'lead'];
    public const STATUSES = ['open', 'closed'];

    protected $fillable = [
        'company_id', 'category_id', 'title', 'description', 'requirements', 'location',
        'type', 'work_mode', 'experience_level', 'salary_min', 'salary_max', 'currency',
        'skills', 'status', 'deadline',
    ];

    protected $attributes = ['status' => 'open', 'currency' => 'USD'];

    protected function casts(): array
    {
        return ['skills' => 'array', 'deadline' => 'date:Y-m-d'];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    /** Jobs a seeker can still apply to: open and not past the deadline. */
    public function scopeOpen(Builder $query): void
    {
        $query->where('status', 'open')
            ->where(fn (Builder $q) => $q->whereNull('deadline')->orWhereDate('deadline', '>=', today()));
    }

    public function isOpen(): bool
    {
        return $this->status === 'open' && ($this->deadline === null || $this->deadline->gte(today()));
    }

    /** Apply the public listing filters from the query string. */
    public function scopeFilter(Builder $query, array $filters): void
    {
        $query
            ->when($filters['search'] ?? null, function (Builder $q, string $term) {
                $q->where(function (Builder $q) use ($term) {
                    $q->where('title', 'like', "%{$term}%")
                        ->orWhere('description', 'like', "%{$term}%")
                        ->orWhere('skills', 'like', "%{$term}%")
                        ->orWhereHas('company', fn (Builder $c) => $c->where('name', 'like', "%{$term}%"));
                });
            })
            ->when($filters['category'] ?? null, fn (Builder $q, string $slug) => $q->whereHas('category', fn (Builder $c) => $c->where('slug', $slug)))
            ->when($filters['type'] ?? null, fn (Builder $q, string $v) => $q->where('type', $v))
            ->when($filters['work_mode'] ?? null, fn (Builder $q, string $v) => $q->where('work_mode', $v))
            ->when($filters['experience_level'] ?? null, fn (Builder $q, string $v) => $q->where('experience_level', $v))
            ->when($filters['location'] ?? null, fn (Builder $q, string $v) => $q->where('location', 'like', "%{$v}%"));
    }
}
