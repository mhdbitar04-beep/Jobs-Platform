<?php

namespace App\Policies;

use App\Models\Application;
use App\Models\User;

class ApplicationPolicy
{
    /** The applicant, the company that owns the job, and admins can see an application. */
    public function view(User $user, Application $application): bool
    {
        return $user->isAdmin()
            || $application->user_id === $user->id
            || $this->review($user, $application);
    }

    /** Only the company that owns the job reviews its applications. */
    public function review(User $user, Application $application): bool
    {
        return $user->isCompany() && $user->company?->id === $application->job->company_id;
    }

    /** An applicant can withdraw while the application is still pending. */
    public function withdraw(User $user, Application $application): bool
    {
        return $application->user_id === $user->id && $application->status === 'pending';
    }
}
