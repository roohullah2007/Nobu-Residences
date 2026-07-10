<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tracks the background AI auto-provisioning of a new website's content
     * (SEO meta + homepage copy generated from the linked building's data).
     * Mirrors the cloudflare_status / cloudflare_last_error /
     * cloudflare_active_at trio so the Created status page can poll it.
     */
    public function up(): void
    {
        // No ->after('cloudflare_active_at'): that column is created by the
        // 2026_07_10_150000 cloudflare migration, which runs after this one.
        Schema::table('websites', function (Blueprint $table) {
            if (!Schema::hasColumn('websites', 'ai_content_status')) {
                $table->string('ai_content_status')->nullable(); // pending | completed | failed
            }
            if (!Schema::hasColumn('websites', 'ai_content_error')) {
                $table->text('ai_content_error')->nullable();
            }
            if (!Schema::hasColumn('websites', 'ai_content_generated_at')) {
                $table->timestamp('ai_content_generated_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('websites', function (Blueprint $table) {
            $table->dropColumn(['ai_content_status', 'ai_content_error', 'ai_content_generated_at']);
        });
    }
};
