<?php

namespace App\Policies;

use App\Models\JobPost;
use App\Models\User;

class JobPostPolicy
{
    /** A company manages only its own jobs; an admin manages all of them. */
    public function manage(User $user, JobPost $job): bool
    {
        return $user->isAdmin() || ($user->isCompany() && $user->company?->id === $job->company_id);
    }
}
