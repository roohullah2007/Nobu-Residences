<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * CSV imports no longer hotlink remote image URLs into main_image/images.
     * Instead the source URLs are parked in pending_image_urls and the
     * buildings:download-images command (scheduled in routes/console.php)
     * downloads them to local storage in small batches.
     *
     * image_download_attempts counts failed download runs per building so the
     * command can retry a few times and then give up instead of looping.
     */
    public function up(): void
    {
        Schema::table('buildings', function (Blueprint $table) {
            if (!Schema::hasColumn('buildings', 'pending_image_urls')) {
                $table->json('pending_image_urls')->nullable()->after('images');
            }
            if (!Schema::hasColumn('buildings', 'image_download_attempts')) {
                $table->unsignedTinyInteger('image_download_attempts')->default(0)->after('pending_image_urls');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buildings', function (Blueprint $table) {
            foreach (['pending_image_urls', 'image_download_attempts'] as $col) {
                if (Schema::hasColumn('buildings', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
