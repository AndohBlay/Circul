<?php

namespace App\Notifications;

use App\Models\InstallmentSchedule;
use App\Services\SmsService;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class InstallmentReminderNotification extends Notification
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
            ->subject('Upcoming Installment Payment Reminder - Circul')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('This is a reminder that your installment payment of GHS ' . number_format($this->schedule->amount_due, 2) . ' is due on ' . $this->schedule->due_date . '.')
            ->action('Make Payment', url('/'))
            ->line('Thank you for using Circul.');
    }

    public function toSms($notifiable): void
    {
        if ($notifiable->phone) {
            app(SmsService::class)->send(
                $notifiable->phone,
                "Circul: Reminder - Your installment payment of GHS " . number_format($this->schedule->amount_due, 2) . " is due on " . $this->schedule->due_date . ". Please make your payment on time."
            );
        }
    }
}