<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Application extends Model
{
    use HasFactory;

    public const STATUSES = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];

    protected $fillable = ['job_post_id', 'user_id', 'cover_letter', 'resume_path', 'resume_name', 'status'];

    protected $attributes = ['status' => 'pending'];

    public function job(): BelongsTo
    {
        return $this->belongsTo(JobPost::class, 'job_post_id');
    }

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
