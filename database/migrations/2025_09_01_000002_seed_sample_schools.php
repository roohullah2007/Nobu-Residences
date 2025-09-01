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
        // Insert sample school data for Toronto area
        $schools = [
            [
                'name' => "St Michael's Choir (Sr) School",
                'slug' => 'st-michaels-choir-sr-school',
                'description' => 'A prestigious Catholic secondary school known for its excellent choir program and academic excellence.',
                'address' => '71 Bond Street',
                'city' => 'Toronto',
                'province' => 'ON',
                'postal_code' => 'M5B 1X2',
                'phone' => '(416) 393-5519',
                'email' => 'contact@stmichaelschoir.ca',
                'website_url' => 'https://www.tcdsb.org/schools/stmichaelschoir',
                'latitude' => 43.6532,
                'longitude' => -79.3832,
                'school_type' => 'catholic',
                'grade_level' => 'secondary',
                'school_board' => 'Toronto Catholic District School Board',
                'principal_name' => 'John Smith',
                'student_capacity' => 800,
                'established_year' => 1954,
                'rating' => 8.5,
                'programs' => json_encode(['Music', 'Arts', 'Advanced Placement', 'French Immersion']),
                'languages' => json_encode(['English', 'French']),
                'facilities' => json_encode(['Concert Hall', 'Music Studios', 'Library', 'Computer Lab', 'Gymnasium']),
                'is_active' => true,
                'is_featured' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Central Elementary School',
                'slug' => 'central-elementary-school',
                'description' => 'A vibrant public elementary school serving the downtown Toronto community with innovative programs.',
                'address' => '145 King Street East',
                'city' => 'Toronto',
                'province' => 'ON',
                'postal_code' => 'M5C 2Y7',
                'phone' => '(416) 393-9440',
                'email' => 'office@central.tdsb.on.ca',
                'website_url' => 'https://www.tdsb.on.ca/schools/central',
                'latitude' => 43.6485,
                'longitude' => -79.3756,
                'school_type' => 'public',
                'grade_level' => 'elementary',
                'school_board' => 'Toronto District School Board',
                'principal_name' => 'Sarah Johnson',
                'student_capacity' => 400,
                'established_year' => 1889,
                'rating' => 7.8,
                'programs' => json_encode(['STEM', 'Arts Integration', 'Environmental Studies']),
                'languages' => json_encode(['English', 'French']),
                'facilities' => json_encode(['Library', 'Science Lab', 'Art Room', 'Gymnasium', 'Playground']),
                'is_active' => true,
                'is_featured' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Downtown Secondary Institute',
                'slug' => 'downtown-secondary-institute',
                'description' => 'A modern public secondary school offering comprehensive academic and vocational programs.',
                'address' => '22 Wellesley Street West',
                'city' => 'Toronto',
                'province' => 'ON',
                'postal_code' => 'M4Y 1G3',
                'phone' => '(416) 393-0260',
                'email' => 'info@downtown.tdsb.on.ca',
                'website_url' => 'https://www.tdsb.on.ca/schools/downtown',
                'latitude' => 43.6644,
                'longitude' => -79.3849,
                'school_type' => 'public',
                'grade_level' => 'secondary',
                'school_board' => 'Toronto District School Board',
                'principal_name' => 'Michael Brown',
                'student_capacity' => 1200,
                'established_year' => 1923,
                'rating' => 8.1,
                'programs' => json_encode(['International Baccalaureate', 'Business Studies', 'Computer Science', 'Co-op Programs']),
                'languages' => json_encode(['English', 'French', 'Spanish']),
                'facilities' => json_encode(['Cafeteria', 'Auditorium', 'Computer Labs', 'Science Labs', 'Gymnasium', 'Library']),
                'is_active' => true,
                'is_featured' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Jarvis Collegiate Institute',
                'slug' => 'jarvis-collegiate-institute',
                'description' => 'One of Toronto\'s oldest and most prestigious public secondary schools with a rich history of academic excellence.',
                'address' => '495 Jarvis Street',
                'city' => 'Toronto',
                'province' => 'ON',
                'postal_code' => 'M4Y 2H4',
                'phone' => '(416) 393-9180',
                'email' => 'jarvis@tdsb.on.ca',
                'website_url' => 'https://www.tdsb.on.ca/schools/jarvis',
                'latitude' => 43.6676,
                'longitude' => -79.3758,
                'school_type' => 'public',
                'grade_level' => 'secondary',
                'school_board' => 'Toronto District School Board',
                'principal_name' => 'Lisa Anderson',
                'student_capacity' => 1000,
                'established_year' => 1807,
                'rating' => 8.9,
                'programs' => json_encode(['Advanced Placement', 'University Preparation', 'Arts Programs', 'Athletics']),
                'languages' => json_encode(['English', 'French']),
                'facilities' => json_encode(['Historic Building', 'Library', 'Gymnasium', 'Auditorium', 'Computer Labs']),
                'is_active' => true,
                'is_featured' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Nelson Mandela Park Public School',
                'slug' => 'nelson-mandela-park-public-school',
                'description' => 'A diverse elementary school located in the heart of downtown Toronto, serving families in condominiums and nearby neighborhoods.',
                'address' => '179 Sackville Street',
                'city' => 'Toronto',
                'province' => 'ON',
                'postal_code' => 'M5A 3E7',
                'phone' => '(416) 393-9505',
                'email' => 'nelson.mandela@tdsb.on.ca',
                'website_url' => 'https://www.tdsb.on.ca/schools/nelson-mandela',
                'latitude' => 43.6580,
                'longitude' => -79.3623,
                'school_type' => 'public',
                'grade_level' => 'elementary',
                'school_board' => 'Toronto District School Board',
                'principal_name' => 'David Wilson',
                'student_capacity' => 350,
                'established_year' => 2010,
                'rating' => 8.0,
                'programs' => json_encode(['Dual Track', 'French Immersion', 'Extended Day']),
                'languages' => json_encode(['English', 'French']),
                'facilities' => json_encode(['Library', 'Gymnasium', 'Computer Lab', 'Music Room', 'Art Room']),
                'is_active' => true,
                'is_featured' => false,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        DB::table('schools')->insert($schools);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('schools')->truncate();
    }
};
