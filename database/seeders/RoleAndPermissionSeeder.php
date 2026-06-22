<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RoleAndPermissionSeeder extends Seeder
{
    // Populate structural authorization profiles and the default executive master account
    public function run(): void
    {
        // Reset cached roles and permissions to clear memory buffers
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Register default production authorization structures natively into the system
        Role::firstOrCreate(['name' => 'client', 'guard_name' => 'api']);
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'api']);
        $superadminRole = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'api']);

        // Force create or overwrite the master supervisor account row properties
     $superadmin = User::updateOrCreate(
    ['email' => 'admin@circul.com'],
    [
        'name'              => 'admin',
        'phone'             => '+233240000000',
        'password'          => Hash::make('Admin@1234'),
        'phone_verified_at' => now(),
    ]
);

        // Ensure the primary account carries the superadmin privileges
        if (!$superadmin->hasRole('superadmin')) {
            $superadmin->assignRole($superadminRole);
        }
    }
}