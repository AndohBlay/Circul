<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\InstallmentSchedule;
use App\Notifications\InstallmentOverdueNotification;
use App\Notifications\InstallmentReminderNotification;
use Carbon\Carbon;

class CheckOverdueInstallments extends Command
{
    protected $signature = 'installments:check-overdue';
    protected $description = 'Mark overdue installment schedules and send reminders';

    public function handle(): void
    {
        // Mark overdue and notify
        $overdue = InstallmentSchedule::with('plan.order.user')
            ->where('status', 'pending')
            ->where('due_date', '<', Carbon::today())
            ->get();

        foreach ($overdue as $schedule) {
            $schedule->update(['status' => 'overdue']);
            $user = $schedule->plan->order->user;

            $notification = new InstallmentOverdueNotification($schedule);
            $user->notify($notification);
            $notification->toSms($user);

            $this->info("Marked schedule {$schedule->id} as overdue — notified {$user->email} and {$user->phone}");
        }

        // Upcoming in 3 days — send reminder
        $upcoming = InstallmentSchedule::with('plan.order.user')
            ->where('status', 'pending')
            ->whereDate('due_date', Carbon::today()->addDays(3))
            ->get();

        foreach ($upcoming as $schedule) {
            $user = $schedule->plan->order->user;

            $notification = new InstallmentReminderNotification($schedule);
            $user->notify($notification);
            $notification->toSms($user);

            $this->info("Reminder sent for schedule {$schedule->id} — notified {$user->email} and {$user->phone}");
        }

        $this->info('Done. Overdue: ' . $overdue->count() . ', Upcoming reminders: ' . $upcoming->count());
    }
}