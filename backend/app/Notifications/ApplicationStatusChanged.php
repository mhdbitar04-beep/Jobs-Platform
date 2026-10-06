<?php

namespace App\Notifications;

use App\Models\Application;
use Illuminate\Notifications\Notification;

/** Sent to the applicant when the company moves their application to a new status. */
class ApplicationStatusChanged extends Notification
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
            'type' => 'application_status',
            'title' => 'Application update',
            'message' => "Your application for {$job->title} at {$job->company->name} is now {$this->application->status}.",
            'link' => '/applications',
            'job_id' => $job->id,
            'application_id' => $this->application->id,
        ];
    }
}
