<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Icon;

class IconSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $icons = [
            // Key Facts Icons
            [
                'name' => 'building',
                'category' => 'key_facts',
                'svg_content' => '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.3333 2.66675L2.66663 9.33341" stroke="#293056" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 4V29.3333H9.33333C6.81917 29.3333 5.56209 29.3333 4.78105 28.5523C4 27.7712 4 26.5141 4 24V9.33333" stroke="#293056" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 9.33325L29.3333 15.9999" stroke="#293056" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.3334 29.3329H22.6667C25.1808 29.3329 26.4379 29.3329 27.219 28.5518C28 27.7707 28 26.5137 28 23.9995V15.3333" stroke="#293056" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M24 13.3333V9.33325" stroke="#293056" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.33337 14.6667H10.6667M9.33337 20.0001H10.6667" stroke="#293056" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21.3334 18.6667H22.6667" stroke="#293056" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 29.3333V24" stroke="#293056" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>',
                'description' => 'Building icon for key facts',
                'is_active' => true,
            ],
            [
                'name' => 'calendar',
                'category' => 'key_facts',
                'svg_content' => '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.6668 5.33325H9.3335C7.49258 5.33325 6.00016 6.82567 6.00016 8.66659V21.9999C6.00016 23.8408 7.49258 25.3333 9.3335 25.3333H22.6668C24.5077 25.3333 26.0002 23.8408 26.0002 21.9999V8.66659C26.0002 6.82567 24.5077 5.33325 22.6668 5.33325Z" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21.3335 2.66675V8.00008" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10.6665 2.66675V8.00008" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.00016 12H26.0002" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>',
                'description' => 'Calendar icon for dates',
                'is_active' => true,
            ],
            [
                'name' => 'measurement',
                'category' => 'key_facts',
                'svg_content' => '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M26.6668 5.33325H5.3335C4.22893 5.33325 3.3335 6.22868 3.3335 7.33325V24.6666C3.3335 25.7711 4.22893 26.6666 5.3335 26.6666H26.6668C27.7714 26.6666 28.6668 25.7711 28.6668 24.6666V7.33325C28.6668 6.22868 27.7714 5.33325 26.6668 5.33325Z" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12.0002 12H20.0002" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8.00016 16H24.0002" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10.6668 20H21.3335" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>',
                'description' => 'Measurement icon for square footage',
                'is_active' => true,
            ],
            [
                'name' => 'tower',
                'category' => 'key_facts',
                'svg_content' => '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.0002 2.66675L6.66683 8.00008V28.0001H25.3335V8.00008L16.0002 2.66675Z" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12.0002 14.6667H14.6668" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17.3335 14.6667H20.0002" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12.0002 18.6667H14.6668" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17.3335 18.6667H20.0002" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14.6668 28.0001V22.6667H17.3335V28.0001" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>',
                'description' => 'High-rise tower icon',
                'is_active' => true,
            ],
            [
                'name' => 'price',
                'category' => 'key_facts',
                'svg_content' => '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.0002 29.3333C23.3335 29.3333 29.3335 23.3333 29.3335 16C29.3335 8.66667 23.3335 2.66667 16.0002 2.66667C8.66683 2.66667 2.66683 8.66667 2.66683 16C2.66683 23.3333 8.66683 29.3333 16.0002 29.3333Z" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12.0002 16C12.0002 13.7909 13.7911 12 16.0002 12C18.2093 12 20.0002 13.7909 20.0002 16C20.0002 18.2091 18.2093 20 16.0002 20C13.7911 20 12.0002 18.2091 12.0002 16Z" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16.0002 8V24" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>',
                'description' => 'Price per square foot icon',
                'is_active' => true,
            ],

            // Amenities Icons
            [
                'name' => 'concierge',
                'category' => 'amenities',
                'svg_content' => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" stroke="#020202" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5901 20C18.5901 16.13 14.7402 13 10.0002 13C5.26015 13 1.41016 16.13 1.41016 20" stroke="#020202" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>',
                'description' => 'Concierge service icon',
                'is_active' => true,
            ],
            [
                'name' => 'gym',
                'category' => 'amenities',
                'svg_content' => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.25 10H13.75" stroke="#020202" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4.375 8.125V11.875" stroke="#020202" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M15.625 8.125V11.875" stroke="#020202" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2.5 7.5V12.5" stroke="#020202" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M17.5 7.5V12.5" stroke="#020202" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>',
                'description' => 'Gym/fitness facility icon',
                'is_active' => true,
            ],
            [
                'name' => 'pool',
                'category' => 'amenities',
                'svg_content' => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 12.5C3.75 12.5 4.375 13.75 5.625 13.75C6.875 13.75 7.5 12.5 8.75 12.5C10 12.5 10.625 13.75 11.875 13.75C13.125 13.75 13.75 12.5 15 12.5C16.25 12.5 16.875 13.75 17.5 13.75" stroke="#020202" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2.5 16.25C3.75 16.25 4.375 17.5 5.625 17.5C6.875 17.5 7.5 16.25 8.75 16.25C10 16.25 10.625 17.5 11.875 17.5C13.125 17.5 13.75 16.25 15 16.25C16.25 16.25 16.875 17.5 17.5 17.5" stroke="#020202" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M15.625 6.25C15.625 8.04493 14.1699 9.5 12.375 9.5C10.5801 9.5 9.125 8.04493 9.125 6.25C9.125 4.45507 10.5801 3 12.375 3C14.1699 3 15.625 4.45507 15.625 6.25Z" stroke="#020202" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4.375 8.75L6.875 3.125" stroke="#020202" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.5 8.75L6.25 6.25" stroke="#020202" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>',
                'description' => 'Swimming pool icon',
                'is_active' => true,
            ],
            [
                'name' => 'parking',
                'category' => 'amenities',
                'svg_content' => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 2.5H17.5V17.5H2.5V2.5Z" stroke="#020202" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.25 5.625V14.375" stroke="#020202" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.25 5.625H11.875C12.7038 5.625 13.4987 5.95424 14.0847 6.54029C14.6708 7.12634 15 7.92121 15 8.75C15 9.57879 14.6708 10.3737 14.0847 10.9597C13.4987 11.5458 12.7038 11.875 11.875 11.875H6.25" stroke="#020202" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>',
                'description' => 'Parking facilities icon',
                'is_active' => true,
            ],
            [
                'name' => 'security',
                'category' => 'amenities',
                'svg_content' => '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 1.25L3.75 3.75V8.75C3.75 13.125 6.875 17.1875 10 18.75C13.125 17.1875 16.25 13.125 16.25 8.75V3.75L10 1.25Z" stroke="#020202" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.5 10L9.375 11.875L13.125 8.125" stroke="#020202" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>',
                'description' => 'Security services icon',
                'is_active' => true,
            ],

            // Highlights Icons
            [
                'name' => 'location',
                'category' => 'highlights',
                'svg_content' => '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 17.3334C18.2091 17.3334 20 15.5425 20 13.3334C20 11.1243 18.2091 9.33341 16 9.33341C13.7909 9.33341 12 11.1243 12 13.3334C12 15.5425 13.7909 17.3334 16 17.3334Z" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 2.66675C13.3478 2.66675 10.8043 3.72 8.92893 5.59537C7.05357 7.47073 6 10.0143 6 12.6667C6 18.6667 16 29.3334 16 29.3334C16 29.3334 26 18.6667 26 12.6667C26 10.0143 24.9464 7.47073 23.0711 5.59537C21.1957 3.72 18.6522 2.66675 16 2.66675Z" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>',
                'description' => 'Location/address icon',
                'is_active' => true,
            ],
            [
                'name' => 'restaurant',
                'category' => 'highlights',
                'svg_content' => '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.66675V12.0001C8 13.4728 9.19391 14.6667 10.6667 14.6667C12.1394 14.6667 13.3333 13.4728 13.3333 12.0001V2.66675" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10.6667 14.6667V29.3334" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21.3333 2.66675V8.00008C21.3333 10.9456 18.9456 13.3334 16 13.3334C18.9456 13.3334 21.3333 15.7211 21.3333 18.6667V29.3334" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>',
                'description' => 'Restaurant/dining icon',
                'is_active' => true,
            ],
            [
                'name' => 'amenities',
                'category' => 'highlights',
                'svg_content' => '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 10.6667C18.9455 10.6667 21.3333 8.27885 21.3333 5.33341C21.3333 2.38799 18.9455 8.19564e-05 16 8.19564e-05C13.0545 8.19564e-05 10.6667 2.38799 10.6667 5.33341C10.6667 8.27885 13.0545 10.6667 16 10.6667Z" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 32.0001C4 25.3726 9.37258 20.0001 16 20.0001C22.6274 20.0001 28 25.3726 28 32.0001H4Z" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M24 16.0001V12.0001C22.6667 12.0001 21.3333 10.6667 21.3333 10.6667C21.3333 10.6667 20 12.0001 18.6667 12.0001V16.0001C18.6667 20.0001 21.3333 21.3334 21.3333 21.3334C21.3333 21.3334 24 20.0001 24 16.0001Z" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>',
                'description' => 'Premium amenities icon',
                'is_active' => true,
            ],
            [
                'name' => 'transit',
                'category' => 'highlights',
                'svg_content' => '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.66667 21.3334H25.3333C26.8061 21.3334 28 20.1395 28 18.6667V8.00008C28 6.52732 26.8061 5.33341 25.3333 5.33341H6.66667C5.19391 5.33341 4 6.52732 4 8.00008V18.6667C4 20.1395 5.19391 21.3334 6.66667 21.3334Z" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 12.0001H28" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.33333 26.6667L6.66667 21.3334" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22.6667 26.6667L25.3333 21.3334" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 16.0001H13.3333" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.6667 16.0001H20" stroke="#293056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>',
                'description' => 'Public transit access icon',
                'is_active' => true,
            ],

            // Contact Icons
            [
                'name' => 'email',
                'category' => 'contact',
                'svg_content' => '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.6665 2.66675H13.3332C14.0665 2.66675 14.6665 3.26675 14.6665 4.00008V12.0001C14.6665 12.7334 14.0665 13.3334 13.3332 13.3334H2.6665C1.93317 13.3334 1.33317 12.7334 1.33317 12.0001V4.00008C1.33317 3.26675 1.93317 2.66675 2.6665 2.66675Z" stroke="#293056" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14.6665 4L7.99984 8.66667L1.33317 4" stroke="#293056" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>',
                'description' => 'Email contact icon',
                'is_active' => true,
            ],
            [
                'name' => 'phone',
                'category' => 'contact',
                'svg_content' => '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.6665 11.2801V13.2801C14.6665 13.7801 14.2665 14.1801 13.7665 14.1801C6.39984 14.1801 1.33317 9.11341 1.33317 1.74675C1.33317 1.24675 1.73317 0.846748 2.23317 0.846748H4.23317C4.73317 0.846748 5.13317 1.24675 5.13317 1.74675V3.74675L3.1665 5.71341C4.83317 9.04675 7.4665 11.6801 10.7998 13.3467L12.7665 11.3801H14.6665V11.2801Z" stroke="#293056" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>',
                'description' => 'Phone contact icon',
                'is_active' => true,
            ],
            [
                'name' => 'address',
                'category' => 'contact',
                'svg_content' => '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 8.66675C9.10457 8.66675 10 7.77132 10 6.66675C10 5.56218 9.10457 4.66675 8 4.66675C6.89543 4.66675 6 5.56218 6 6.66675C6 7.77132 6.89543 8.66675 8 8.66675Z" stroke="#141B34" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 1.33341C6.67392 1.33341 5.40215 1.86008 4.46447 2.79775C3.52678 3.73543 3 5.0072 3 6.33341C3 9.33341 8 14.6667 8 14.6667C8 14.6667 13 9.33341 13 6.33341C13 5.0072 12.4732 3.73543 11.5355 2.79775C10.5979 1.86008 9.32608 1.33341 8 1.33341Z" stroke="#141B34" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>',
                'description' => 'Address/location contact icon',
                'is_active' => true,
            ],
        ];

        foreach ($icons as $iconData) {
            Icon::updateOrCreate(
                ['name' => $iconData['name'], 'category' => $iconData['category']],
                $iconData
            );
        }
    }
}
