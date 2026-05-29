<?php

namespace App\Notifications;

use App\Models\InstallmentSchedule;
use App\Services\SmsService;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class InstallmentOverdueNotification extends Notification
{
    use Queueable;

    public function __construct(public InstallmentSchedule $schedule) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Overdue Installment Payment - Circul')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Your installment payment of GHS ' . number_format($this->schedule->amount_due, 2) . ' was due on ' . $this->schedule->due_date . '.')
            ->line('Please make your payment as soon as possible to avoid further issues.')
            ->action('Make Payment', url('/'))
            ->line('Thank you for using Circul.');
    }

    public function toSms($notifiable): void
    {
        if ($notifiable->phone) {
            app(SmsService::class)->send(
                $notifiable->phone,
                "Circul: Your installment payment of GHS " . number_format($this->schedule->amount_due, 2) . " was due on " . $this->schedule->due_date . ". Please pay now to avoid issues."
            );
        }
    }
}