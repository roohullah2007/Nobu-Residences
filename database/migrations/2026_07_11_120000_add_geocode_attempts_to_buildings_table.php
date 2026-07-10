<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The building CSV sheets carry no postal code (and usually no
     * coordinates). The buildings:geocode command (scheduled in
     * routes/console.php, same pattern as buildings:download-images) fills
     * postal_code — and latitude/longitude when empty — via the Google
     * Geocoding API in small batches.
     *
     * geocode_attempts counts geocoding runs per building so the command can
     * retry a few times and then give up instead of re-querying the same
     * unresolvable address forever.
     */
    public function up(): void
    {
        Schema::table('buildings', function (Blueprint $table) {
            if (!Schema::hasColumn('buildings', 'geocode_attempts')) {
                $table->unsignedTinyInteger('geocode_attempts')->default(0)->after('image_download_attempts');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buildings', function (Blueprint $table) {
            if (Schema::hasColumn('buildings', 'geocode_attempts')) {
                $table->dropColumn('geocode_attempts');
            }
        });
    }
};
