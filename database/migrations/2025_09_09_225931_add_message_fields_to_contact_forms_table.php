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
        Schema::table('contact_forms', function (Blueprint $table) {
            if (!Schema::hasColumn('contact_forms', 'message')) {
                $table->text('message')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('contact_forms', 'submitted_at')) {
                $table->timestamp('submitted_at')->nullable()->after('user_agent');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contact_forms', function (Blueprint $table) {
            //
        });
    }
};
