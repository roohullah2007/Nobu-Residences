<?php

use App\Services\Tenancy\TenantResolver;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Host-header tenant resolution needs the domain column to be canonical
     * and unique: duplicates make "which website answers this Host" depend on
     * insertion order, and un-normalized values (scheme, www, uppercase)
     * silently never match. Normalize existing rows, then add a unique index
     * (falls back to a plain index if legacy duplicates block uniqueness).
     */
    public function up(): void
    {
        // 1. Canonicalize existing values (lowercase, no scheme/port/path/www).
        //    Placeholder junk like "Default Website" normalizes to a non-host
        //    string; anything without a dot is treated as no-domain.
        DB::table('websites')->whereNotNull('domain')->orderBy('id')
            ->each(function ($row) {
                $normalized = TenantResolver::normalizeHost((string) $row->domain);
                if ($normalized === '' || !str_contains($normalized, '.')) {
                    $normalized = null;
                }
                if ($normalized !== $row->domain) {
                    DB::table('websites')->where('id', $row->id)->update(['domain' => $normalized]);
                }
            });

        // 2. Null out exact duplicates (keep the oldest row) so the unique
        //    index can be created; log what was cleared.
        $dupes = DB::table('websites')
            ->select('domain')
            ->whereNotNull('domain')
            ->groupBy('domain')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('domain');

        foreach ($dupes as $domain) {
            $ids = DB::table('websites')->where('domain', $domain)->orderBy('id')->pluck('id');
            $losers = $ids->slice(1)->values();
            DB::table('websites')->whereIn('id', $losers)->update(['domain' => null]);
            Log::warning('Duplicate website domain cleared during migration', [
                'domain' => $domain,
                'kept_website_id' => $ids->first(),
                'cleared_website_ids' => $losers->all(),
            ]);
        }

        // 3. Unique index (nullable column: multiple NULLs are allowed).
        try {
            Schema::table('websites', function (Blueprint $table) {
                $table->unique('domain', 'websites_domain_unique');
            });
        } catch (\Throwable $e) {
            Log::warning('Could not add unique index on websites.domain — adding plain index instead', [
                'error' => $e->getMessage(),
            ]);
            try {
                Schema::table('websites', function (Blueprint $table) {
                    $table->index('domain', 'websites_domain_index');
                });
            } catch (\Throwable $e2) {
                // Index already exists — nothing to do.
            }
        }
    }

    public function down(): void
    {
        Schema::table('websites', function (Blueprint $table) {
            try {
                $table->dropUnique('websites_domain_unique');
            } catch (\Throwable $e) {
                // fall through
            }
            try {
                $table->dropIndex('websites_domain_index');
            } catch (\Throwable $e) {
                // fall through
            }
        });
    }
};
