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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('email_notifications')->default(true);
            $table->boolean('sms_notifications')->default(false);
            $table->boolean('push_notifications')->default(true);
            $table->boolean('job_alerts')->default(true);
            $table->boolean('application_updates')->default(true);
            $table->boolean('company_news')->default(false);
            $table->boolean('profile_suggestions')->default(true);
            $table->boolean('saved_jobs_notifications')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'email_notifications',
                'sms_notifications',
                'push_notifications',
                'job_alerts',
                'application_updates',
                'company_news',
                'profile_suggestions',
                'saved_jobs_notifications'
            ]);
        });
    }
};
