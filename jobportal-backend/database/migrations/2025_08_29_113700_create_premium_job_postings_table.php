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
        Schema::create('premium_job_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained('job_listings')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('start_date');
            $table->timestamp('end_date');
            $table->string('status')->default('active'); // active, expired
            $table->decimal('amount', 10, 2)->nullable();
            $table->string('currency', 3)->default('USD');
            $table->foreignId('payment_id')->nullable()->onDelete('set null');
            $table->timestamps();
            
            // Indexes for better query performance
            $table->index('job_id');
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
        Schema::dropIfExists('premium_job_postings');
    }
};