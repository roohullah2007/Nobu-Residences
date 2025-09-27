<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Fix any existing buildings with string JSON data
        $buildings = DB::table('buildings')->get();
        
        foreach ($buildings as $building) {
            $updates = [];
            
            // Fix images field
            if (is_string($building->images) && !empty($building->images)) {
                if ($building->images === '[]' || $building->images === 'null') {
                    $updates['images'] = json_encode([]);
                } elseif (json_decode($building->images) === null) {
                    // If it's not valid JSON, convert to empty array
                    $updates['images'] = json_encode([]);
                }
            } elseif ($building->images === null) {
                $updates['images'] = json_encode([]);
            }
            
            // Fix amenities field
            if (is_string($building->amenities) && !empty($building->amenities)) {
                if ($building->amenities === '[]' || $building->amenities === 'null') {
                    $updates['amenities'] = json_encode([]);
                } elseif (json_decode($building->amenities) === null) {
                    $updates['amenities'] = json_encode([]);
                }
            } elseif ($building->amenities === null) {
                $updates['amenities'] = json_encode([]);
            }
            
            // Fix features field
            if (is_string($building->features) && !empty($building->features)) {
                if ($building->features === '[]' || $building->features === 'null') {
                    $updates['features'] = json_encode([]);
                } elseif (json_decode($building->features) === null) {
                    $updates['features'] = json_encode([]);
                }
            } elseif ($building->features === null) {
                $updates['features'] = json_encode([]);
            }
            
            // Fix mls_data field
            if (is_string($building->mls_data) && !empty($building->mls_data)) {
                if ($building->mls_data === '[]' || $building->mls_data === 'null' || $building->mls_data === '{}') {
                    $updates['mls_data'] = json_encode([]);
                } elseif (json_decode($building->mls_data) === null) {
                    $updates['mls_data'] = json_encode([]);
                }
            } elseif ($building->mls_data === null) {
                $updates['mls_data'] = json_encode([]);
            }
            
            if (!empty($updates)) {
                DB::table('buildings')
                    ->where('id', $building->id)
                    ->update($updates);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse this fix
    }
};
