<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstallmentPlan extends Model
{
    protected $fillable = [
        'order_id',
        'total_installments',
        'amount_per_installment',
        'down_payment',
        'frequency',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function schedules()
    {
        return $this->hasMany(InstallmentSchedule::class, 'plan_id');
    }
}