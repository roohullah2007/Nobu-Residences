<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Alert emails (saved searches + favourite updates) need to be branded with
 * and link to the landing site they were created on — website_id captures
 * that at save time. The last_notified_* columns are the favourite-update
 * detector's snapshot of the last price/status the user was told about.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('saved_searches', function (Blueprint $table) {
            $table->foreignId('website_id')->nullable()->after('user_id')
                ->constrained('websites')->nullOnDelete();
        });

        Schema::table('user_property_favourites', function (Blueprint $table) {
            $table->foreignId('website_id')->nullable()->after('user_id')
                ->constrained('websites')->nullOnDelete();
            $table->decimal('last_notified_price', 12, 2)->nullable()->after('property_price');
            $table->string('last_notified_status', 30)->nullable()->after('last_notified_price');
        });
    }

    public function down(): void
    {
        Schema::table('saved_searches', function (Blueprint $table) {
            $table->dropConstrainedForeignId('website_id');
        });

        Schema::table('user_property_favourites', function (Blueprint $table) {
            $table->dropConstrainedForeignId('website_id');
            $table->dropColumn(['last_notified_price', 'last_notified_status']);
        });
    }
};
