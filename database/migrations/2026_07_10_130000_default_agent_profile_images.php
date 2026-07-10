<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Every agent_infos row without a working profile photo gets the
     * standard default (public/assets/default-agent-profile.png — the
     * Jatin Gill photo). Covers NULL/empty values and local paths whose
     * file no longer exists on this host; external http(s) URLs are left
     * alone. Runs on deploy so existing websites heal too.
     */
    public function up(): void
    {
        $default = '/assets/default-agent-profile.png';

        foreach (DB::table('agent_infos')->get(['id', 'profile_image']) as $row) {
            $image = trim((string) $row->profile_image);

            $broken = $image === ''
                || (str_starts_with($image, '/') && !file_exists(public_path(ltrim($image, '/'))));

            if ($broken && $image !== $default) {
                DB::table('agent_infos')->where('id', $row->id)->update(['profile_image' => $default]);
            }
        }
    }

    public function down(): void
    {
        // Data heal — nothing to revert (original broken values are gone).
    }
};
