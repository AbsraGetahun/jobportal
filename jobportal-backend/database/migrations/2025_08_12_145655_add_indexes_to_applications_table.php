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
        Schema::table('applications', function (Blueprint $table) {
            // Index for job_id foreign key
            $table->index('job_id');
            
            // Index for user_id foreign key
            $table->index('user_id');
            
            // Index for status for filtering applications by status
            $table->index('status');
            
            // Index for created_at for sorting by date
            $table->index('created_at');
            
            // Composite index for job_id and status for employer application management
            $table->index(['job_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropIndex(['job_id']);
            $table->dropIndex(['user_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['job_id', 'status']);
        });
    }
};
