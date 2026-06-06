<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
   
    public function run(): void
    {
        // Execute structural production roles and setup dependencies
        $this->call([
            RoleAndPermissionSeeder::class,
        ]);
    }
}