<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\URL;

class RegisterVerifyEmail extends Notification
{
    protected $registrationData;
    protected $token;

    /**
     * Create a new notification instance.
     *
     * @param array $registrationData
     * @param string $token
     * @return void
     */
    public function __construct(array $registrationData, string $token)
    {
        $this->registrationData = $registrationData;
        $this->token = $token;
    }

    /**
     * Get the notification's channels.
     *
     * @param  mixed  $notifiable
     * @return array|string
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Build the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $verificationUrl = $this->verificationUrl();

        return (new MailMessage)
            ->subject('Verify Email Address')
            ->line('Please click the button below to verify your email address and complete your registration.')
            ->action('Verify Email Address', $verificationUrl)
            ->line('If you did not create an account, no further action is required.');
    }

    /**
     * Get the verification URL for registration.
     *
     * @return string
     */
    protected function verificationUrl()
    {
        return URL::temporarySignedRoute(
            'register.verification.verify',
            now()->addHours(24),
            [
                'token' => $this->token,
            ]
        );
    }
}