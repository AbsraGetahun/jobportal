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
            if (!Schema::hasColumn('applications', 'status')) {
                $table->enum('status', ['applied', 'shortlisted', 'rejected', 'hired'])->default('applied')->after('cover_letter');
            }
            if (!Schema::hasColumn('applications', 'status_updated_at')) {
                $table->timestamp('status_updated_at')->nullable()->after('status');
            }
            if (!Schema::hasColumn('applications', 'updated_by')) {
                $table->unsignedBigInteger('updated_by')->nullable()->after('status_updated_at');
                $table->foreign('updated_by')->references('id')->on('users');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropForeign(['updated_by']);
            $table->dropColumn(['status', 'status_updated_at', 'updated_by']);
        });
    }
};
