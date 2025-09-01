<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add coordinates to some sample properties
        // These are various Toronto locations for demonstration
        $coordinates = [
            ['lat' => 43.6532, 'lng' => -79.3832], // Downtown Toronto
            ['lat' => 43.6426, 'lng' => -79.3871], // Harbourfront
            ['lat' => 43.6629, 'lng' => -79.3957], // Yorkville
            ['lat' => 43.6677, 'lng' => -79.3948], // Annex
            ['lat' => 43.6481, 'lng' => -79.3785], // Financial District
            ['lat' => 43.6453, 'lng' => -79.3806], // Entertainment District
            ['lat' => 43.6542, 'lng' => -79.3606], // Corktown
            ['lat' => 43.6591, 'lng' => -79.3499], // Leslieville
            ['lat' => 43.6708, 'lng' => -79.3865], // University of Toronto
            ['lat' => 43.6461, 'lng' => -79.4044], // Liberty Village
        ];
        
        // Get the first 10 properties
        $properties = DB::table('properties')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get(['id']);
        
        // Update each property with coordinates
        foreach ($properties as $index => $property) {
            if (isset($coordinates[$index])) {
                DB::table('properties')
                    ->where('id', $property->id)
                    ->update([
                        'latitude' => $coordinates[$index]['lat'],
                        'longitude' => $coordinates[$index]['lng'],
                        'updated_at' => now()
                    ]);
                    
                echo "Updated property {$property->id} with coordinates: {$coordinates[$index]['lat']}, {$coordinates[$index]['lng']}\n";
            }
        }
        
        echo "Successfully added coordinates to " . min(count($properties), count($coordinates)) . " properties.\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reset coordinates to null
        DB::table('properties')
            ->whereNotNull('latitude')
            ->orWhereNotNull('longitude')
            ->update([
                'latitude' => null,
                'longitude' => null
            ]);
    }
};