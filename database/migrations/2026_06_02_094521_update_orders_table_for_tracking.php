<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    // Append tracking metadata elements to tables while gracefully backfilling rows
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'order_number')) {
                $table->string('order_number')->nullable()->after('id');
            }
            if (!Schema::hasColumn('orders', 'status')) {
                $table->string('status')->default('pending')->after('total_amount');
            }
        });

        // Loop through all historical entries lacking track identifiers to populate values
        $orders = DB::table('orders')->whereNull('order_number')->get();
        foreach ($orders as $order) {
            $uniqueNumber = 'CRCL-' . date('Y') . '-' . strval(random_int(100000, 999999));
            DB::table('orders')->where('id', $order->id)->update([
                'order_number' => $uniqueNumber
            ]);
        }

        // Apply strict index uniqueness validation constraints over fully saturated columns
        Schema::table('orders', function (Blueprint $table) {
            $table->string('order_number')->nullable(false)->change();
            $table->unique('order_number');
        });
    }

    // Rollback schema columns structural modifications clearing applied rows
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['order_number']);
            $table->dropColumn(['order_number', 'status']);
        });
    }
};