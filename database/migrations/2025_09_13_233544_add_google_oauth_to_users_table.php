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
            $table->string('google_id')->nullable()->after('id');
            $table->string('avatar')->nullable()->after('email');
            $table->string('provider')->nullable()->after('avatar');
            $table->string('provider_id')->nullable()->after('provider');
            $table->string('password')->nullable()->change();
            
            $table->index('google_id');
            $table->index('provider');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['google_id']);
            $table->dropIndex(['provider']);
            
            $table->dropColumn('google_id');
            $table->dropColumn('avatar');
            $table->dropColumn('provider');
            $table->dropColumn('provider_id');
            
            $table->string('password')->nullable(false)->change();
        });
    }
};
