<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('developers')) {
            return;
        }

        Schema::table('developers', function (Blueprint $table) {
            if (!Schema::hasColumn('developers', 'slug')) {
                $table->string('slug')->nullable()->unique()->after('name');
            }
            if (!Schema::hasColumn('developers', 'meta_title')) {
                $table->string('meta_title')->nullable();
            }
            if (!Schema::hasColumn('developers', 'meta_description')) {
                $table->string('meta_description', 500)->nullable();
            }
            if (!Schema::hasColumn('developers', 'projects_completed')) {
                $table->unsignedInteger('projects_completed')->nullable();
            }
            if (!Schema::hasColumn('developers', 'projects_under_construction')) {
                $table->unsignedInteger('projects_under_construction')->nullable();
            }
            if (!Schema::hasColumn('developers', 'upcoming_projects')) {
                $table->unsignedInteger('upcoming_projects')->nullable();
            }
            if (!Schema::hasColumn('developers', 'highlights')) {
                $table->json('highlights')->nullable();
            }
            if (!Schema::hasColumn('developers', 'awards')) {
                $table->json('awards')->nullable();
            }
        });

        // Backfill slugs (unique via numeric suffix on collision)
        $used = [];
        foreach (DB::table('developers')->whereNull('slug')->orderBy('created_at')->get(['id', 'name']) as $developer) {
            $base = Str::slug($developer->name) ?: 'developer';
            $slug = $base;
            $i = 2;
            while (isset($used[$slug]) || DB::table('developers')->where('slug', $slug)->exists()) {
                $slug = $base . '-' . $i++;
            }
            $used[$slug] = true;
            DB::table('developers')->where('id', $developer->id)->update(['slug' => $slug]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('developers')) {
            return;
        }

        Schema::table('developers', function (Blueprint $table) {
            foreach (['slug', 'meta_title', 'meta_description', 'projects_completed', 'projects_under_construction', 'upcoming_projects', 'highlights', 'awards'] as $column) {
                if (Schema::hasColumn('developers', $column)) {
                    if ($column === 'slug') {
                        $table->dropUnique(['slug']);
                    }
                    $table->dropColumn($column);
                }
            }
        });
    }
};
