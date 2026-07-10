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
        Schema::table('websites', function (Blueprint $table) {
            $table->string('ai_content_status')->nullable()->after('cloudflare_active_at'); // pending | completed | failed
            $table->text('ai_content_error')->nullable()->after('ai_content_status');
            $table->timestamp('ai_content_generated_at')->nullable()->after('ai_content_error');
        });
    }

    public function down(): void
    {
        Schema::table('websites', function (Blueprint $table) {
            $table->dropColumn(['ai_content_status', 'ai_content_error', 'ai_content_generated_at']);
        });
    }
};
