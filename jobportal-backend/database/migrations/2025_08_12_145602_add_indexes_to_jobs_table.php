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
        Schema::table('job_listings', function (Blueprint $table) {
            // Index for employer_id foreign key
            $table->index('employer_id');
            
            // Index for location for location-based searches
            $table->index('location');
            
            // Composite index for job_type and experience_level for filtering
            $table->index(['job_type', 'experience_level']);
            
            // Index for category for category-based searches
            $table->index('category');
            
            // Index for is_active for active job filtering
            $table->index('is_active');
            
            // Index for created_at for sorting by date
            $table->index('created_at');
            
            // Composite index for salary range queries
            $table->index(['salary_min', 'salary_max']);
            
            // Index for remote jobs filter
            $table->index('is_remote');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_listings', function (Blueprint $table) {
            $table->dropIndex(['employer_id']);
            $table->dropIndex(['location']);
            $table->dropIndex(['job_type', 'experience_level']);
            $table->dropIndex(['category']);
            $table->dropIndex(['is_active']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['salary_min', 'salary_max']);
            $table->dropIndex(['is_remote']);
        });
    }
};
