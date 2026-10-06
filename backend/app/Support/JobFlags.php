<?php

namespace App\Support;

use Illuminate\Http\Request;

/**
 * Works out which jobs the current seeker has applied to or saved, once per request.
 * JobResource reads the result, so listing endpoints stay free of per-row queries.
 */
class JobFlags
{
    public static function load(Request $request): void
    {
        $user = $request->user('sanctum');

        if (! $user || ! $user->isSeeker()) {
            return;
        }

        $request->attributes->set('job_flags', [
            'applied' => $user->applications()->pluck('job_post_id')->all(),
            'saved' => $user->savedJobs()->pluck('job_posts.id')->all(),
        ]);
    }
}
