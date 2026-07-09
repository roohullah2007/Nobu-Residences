<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Grandfather every existing user as verified. The `verified` middleware
     * already gates dashboard/favourites/alerts; enabling MustVerifyEmail on
     * the User model without this backfill would lock all existing users out
     * of those pages. Only NEW registrations (after this deploy) go through
     * the verification email flow.
     */
    public function up(): void
    {
        if (!Schema::hasTable('users') || !Schema::hasColumn('users', 'email_verified_at')) {
            return;
        }

        DB::table('users')->whereNull('email_verified_at')->update(['email_verified_at' => now()]);
    }

    /**
     * No-op: backfilled rows can't be distinguished from genuinely verified ones.
     */
    public function down(): void
    {
    }
};
