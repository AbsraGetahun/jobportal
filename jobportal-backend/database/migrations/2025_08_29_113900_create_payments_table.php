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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('subscription_id')->nullable()->onDelete('set null');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->string('status')->default('pending'); // pending, completed, failed, refunded
            $table->string('payment_method')->nullable(); // stripe, paypal, etc.
            $table->string('transaction_id')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
            
            // Indexes for better query performance
            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
        });

        // Add deferred FKs now that all referenced tables exist (MySQL requires the
        // referenced table to be created first; this keeps migrations order-independent).
        Schema::table('payments', function (Blueprint $table) {
            $table->foreign('subscription_id')->references('id')->on('subscriptions')->onDelete('set null');
        });
        Schema::table('premium_job_postings', function (Blueprint $table) {
            $table->foreign('payment_id')->references('id')->on('payments')->onDelete('set null');
        });
        Schema::table('featured_listings', function (Blueprint $table) {
            $table->foreign('payment_id')->references('id')->on('payments')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};