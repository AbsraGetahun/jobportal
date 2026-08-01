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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('plan_type'); // basic, premium, etc.
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->string('billing_period'); // monthly, yearly
            $table->timestamp('start_date');
            $table->timestamp('end_date');
            $table->string('status')->default('active'); // active, cancelled, expired
            $table->string('payment_method')->nullable(); // stripe, paypal, etc.
            $table->string('subscription_id')->nullable(); // external subscription ID (e.g., Stripe)
            $table->timestamps();
            
            // Indexes for better query performance
            $table->index('user_id');
            $table->index('status');
            $table->index('end_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};