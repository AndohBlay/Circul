<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
  public function up(): void
{
    Schema::create('installment_schedules', function (Blueprint $table) {
        $table->id();
        $table->foreignId('plan_id')->constrained('installment_plans')->cascadeOnDelete();
        $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
        $table->decimal('amount_due', 10, 2);
        $table->date('due_date');
        $table->enum('status', ['pending', 'paid', 'overdue'])->default('pending');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('installment_schedules');
    }
};
