<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstallmentSchedule extends Model
{
    protected $fillable = [
        'plan_id',
        'payment_id',
        'amount_due',
        'due_date',
        'status',
    ];

    public function plan()
    {
        return $this->belongsTo(InstallmentPlan::class, 'plan_id');
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}