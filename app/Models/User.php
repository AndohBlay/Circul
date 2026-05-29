<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $guard_name = 'api';

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'phone_verified_at',
        'otp_code',
        'otp_expires_at',
        'avatar',
        'provider',
        'provider_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'otp_code',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'otp_expires_at'    => 'datetime',
            'password'          => 'hashed',
        ];
    }

    public function hasVerifiedPhone(): bool
    {
        return $this->phone_verified_at !== null;
    }
}