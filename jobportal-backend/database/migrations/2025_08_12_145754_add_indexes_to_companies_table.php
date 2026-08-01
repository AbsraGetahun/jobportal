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
        Schema::table('companies', function (Blueprint $table) {
            // Index for name for company searches
            $table->index('name');
            
            // Index for industry for industry-based filtering
            $table->index('industry');
            
            // Index for is_verified for verified company filtering
            $table->index('is_verified');
            
            // Index for created_at for sorting by date
            $table->index('created_at');
            
            // Composite index for industry and is_verified
            $table->index(['industry', 'is_verified']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropIndex(['name']);
            $table->dropIndex(['industry']);
            $table->dropIndex(['is_verified']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['industry', 'is_verified']);
        });
    }
};
