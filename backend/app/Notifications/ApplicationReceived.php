<?php

namespace App\Notifications;

use App\Models\Application;
use Illuminate\Notifications\Notification;

/** Sent to the company when someone applies to one of its jobs. */
class ApplicationReceived extends Notification
{
    public function __construct(private readonly Application $application) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $job = $this->application->job;

        return [
            'type' => 'application_received',
            'title' => 'New application',
            'message' => "{$this->application->applicant->name} applied for {$job->title}.",
            'link' => "/company/jobs/{$job->id}/applicants",
            'job_id' => $job->id,
            'application_id' => $this->application->id,
        ];
    }
}
