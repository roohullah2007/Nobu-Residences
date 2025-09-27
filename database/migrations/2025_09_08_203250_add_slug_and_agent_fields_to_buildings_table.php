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
        // Check and add slug field
        if (!Schema::hasColumn('buildings', 'slug')) {
            Schema::table('buildings', function (Blueprint $table) {
                $table->string('slug')->nullable()->after('name')->index();
            });
        }
        
        // Check and add agent fields
        if (!Schema::hasColumn('buildings', 'agent_name')) {
            Schema::table('buildings', function (Blueprint $table) {
                $table->string('agent_name')->nullable()->after('interior_designer');
            });
        }
        
        if (!Schema::hasColumn('buildings', 'agent_title')) {
            Schema::table('buildings', function (Blueprint $table) {
                $table->string('agent_title')->default('Broker')->after('agent_name');
            });
        }
        
        if (!Schema::hasColumn('buildings', 'agent_brokerage')) {
            Schema::table('buildings', function (Blueprint $table) {
                $table->string('agent_brokerage')->default('Property.ca Inc., Brokerage')->after('agent_title');
            });
        }
        
        if (!Schema::hasColumn('buildings', 'agent_phone')) {
            Schema::table('buildings', function (Blueprint $table) {
                $table->string('agent_phone')->nullable()->after('agent_brokerage');
            });
        }
        
        if (!Schema::hasColumn('buildings', 'agent_email')) {
            Schema::table('buildings', function (Blueprint $table) {
                $table->string('agent_email')->nullable()->after('agent_phone');
            });
        }
        
        if (!Schema::hasColumn('buildings', 'agent_image')) {
            Schema::table('buildings', function (Blueprint $table) {
                $table->string('agent_image')->nullable()->after('agent_email');
            });
        }
        
        // Check and add developer_name if not exists
        if (!Schema::hasColumn('buildings', 'developer_name')) {
            Schema::table('buildings', function (Blueprint $table) {
                $table->string('developer_name')->nullable()->after('developer_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buildings', function (Blueprint $table) {
            $table->dropColumn([
                'slug',
                'agent_name',
                'agent_title',
                'agent_brokerage',
                'agent_phone',
                'agent_email',
                'agent_image',
                'developer_name'
            ]);
        });
    }
};
