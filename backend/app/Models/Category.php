<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug'];

    protected static function booted(): void
    {
        static::saving(fn (Category $category) => $category->slug = Str::slug($category->name));
    }

    public function jobs(): HasMany
    {
        return $this->hasMany(JobPost::class);
    }
}
