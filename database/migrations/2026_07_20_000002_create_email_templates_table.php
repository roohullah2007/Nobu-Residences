<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Admin-editable subject/headline/intro for the listing alert emails, with
 * %merge_tag% personalization. website_id NULL = the global template; a row
 * with a website_id overrides it for that landing site. Empty fields fall
 * through to the next level (site -> global -> built-in defaults).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('type', 50);
            $table->foreignId('website_id')->nullable()->constrained('websites')->cascadeOnDelete();
            $table->string('subject')->nullable();
            $table->string('headline')->nullable();
            $table->text('intro')->nullable();
            $table->timestamps();

            $table->unique(['type', 'website_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_templates');
    }
};
