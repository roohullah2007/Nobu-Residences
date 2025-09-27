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
        Schema::table('buildings', function (Blueprint $table) {
            // Add new columns
            $table->uuid('developer_id')->nullable()->after('id');
            $table->string('management_name')->nullable()->after('description');
            $table->string('corp_number')->nullable()->after('management_name');
            $table->date('date_registered')->nullable()->after('corp_number');
            
            // Add foreign key
            $table->foreign('developer_id')->references('id')->on('developers')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buildings', function (Blueprint $table) {
            $table->dropForeign(['developer_id']);
            $table->dropColumn(['developer_id', 'management_name', 'corp_number', 'date_registered']);
        });
    }
};
