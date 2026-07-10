<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class WebsitePage extends Model
{
    use HasFactory;

    protected $fillable = [
        'website_id',
        'page_type',
        'title',
        'content',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'content' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Published pages are cached at Cloudflare's edge — purge the parent
     * website's domain whenever page content changes so publishes show on
     * the live custom domain in real time.
     */
    protected static function booted(): void
    {
        $purge = function (self $page): void {
            $page->website?->purgeEdgeCache();
        };

        static::saved($purge);
        static::deleted($purge);
    }

    /**
     * Get the website that owns this page
     */
    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class);
    }

    /**
     * Get default home page content structure
     */
    public static function getDefaultHomeContent(): array
    {
        return [
            'hero' => [
                'welcome_text' => 'WELCOME TO NOBU RESIDENCES',
                'main_heading' => 'Your Next Home Is Just a Click Away',
                'subheading' => 'Whether buying or renting, Nobu makes finding your home easy and reliable.',
                'background_image' => '/assets/hero-section.jpg',
                'buttons' => [
                    [
                        'text' => '6 Condos for rent',
                        'url' => '/rent',
                        'style' => 'primary'
                    ],
                    [
                        'text' => '6 Condos for sale',
                        'url' => '/sale',
                        'style' => 'secondary'
                    ]
                ]
            ],
            'carousel_settings' => [
                'featured_properties' => [
                    'title' => 'What you are looking for?',
                    'address_filter' => 'Toronto, ON',
                    'property_subtype' => 'Condo',
                    'enabled' => true,
                    'limit' => 6
                ],
                'for_rent' => [
                    'title' => 'Properties for Rent',
                    'address_filter' => 'Toronto, ON', 
                    'property_subtype' => 'Condo',
                    'enabled' => true,
                    'limit' => 6
                ],
                'for_sale' => [
                    'title' => 'Properties for Sale',
                    'address_filter' => 'Toronto, ON',
                    'property_subtype' => 'Condo', 
                    'enabled' => true,
                    'limit' => 6
                ]
            ],
            'about' => [
                'title' => 'Learn everything about Nobu Residence',
                'image' => '/assets/nobu-building.jpg',
                'image_alt' => 'Nobu Residence Building',
                'tabs' => [
                    'overview' => [
                        'title' => 'Overview',
                        'content' => 'Found in Toronto\'s King West area and built in 2024, Nobu Residences was built by Madison Group. This Toronto condo sits near the intersection of Spadina Ave and Wellington St W. Nobu Residences is a High-Rise condo located in the King West neighbourhood.'
                    ],
                    'key_facts' => [
                        'title' => 'Key Facts',
                        'items' => [
                            ['icon' => 'building', 'text' => '45 floors/ 657 units'],
                            ['icon' => 'calendar', 'text' => 'Built in 2024'],
                            ['icon' => 'dimensions', 'text' => '416 sqft - 1389 sqft'],
                            ['icon' => 'building-type', 'text' => 'High-rise condo'],
                            ['icon' => 'price', 'text' => 'Avg $1,100 per square foot']
                        ]
                    ],
                    'amenities' => [
                        'title' => 'Amenities',
                        'items' => [
                            ['icon' => 'concierge', 'text' => 'Concierge'],
                            ['icon' => 'gym', 'text' => 'Gym'],
                            ['icon' => 'guest-suites', 'text' => 'Guest Suites'],
                            ['icon' => 'pool', 'text' => 'Outdoor Pool'],
                            ['icon' => 'party-room', 'text' => 'Party Room'],
                            ['icon' => 'parking', 'text' => 'Visitor Parking'],
                            ['icon' => 'pet', 'text' => 'Pet Restriction'],
                            ['icon' => 'media', 'text' => 'Media Room'],
                            ['icon' => 'meeting', 'text' => 'Meeting Room'],
                            ['icon' => 'garage', 'text' => 'Parking Garage'],
                            ['icon' => 'bbq', 'text' => 'BBQ Permitted'],
                            ['icon' => 'rooftop', 'text' => 'Rooftop Deck'],
                            ['icon' => 'security-guard', 'text' => 'Security Guard'],
                            ['icon' => 'security-system', 'text' => 'Security System']
                        ]
                    ],
                    'highlights' => [
                        'title' => 'Highlights',
                        'items' => [
                            ['icon' => 'location', 'text' => 'Located at 15 Mercer St in Toronto\'s Entertainment District, with two iconic 49-storey towers and a heritage podium.'],
                            ['icon' => 'luxury', 'text' => 'Integrated with the world-renowned Nobu Hotel and Restaurant, offering a luxury lifestyle experience.'],
                            ['icon' => 'amenities', 'text' => 'Premium amenities including concierge services, fitness facilities, and exclusive resident lounges.'],
                            ['icon' => 'transit', 'text' => 'Steps away from major transit, shopping, dining, and cultural attractions in downtown Toronto.']
                        ]
                    ],
                    'contact' => [
                        'title' => 'Contact',
                        'use_global_contact' => true // Uses website's global contact info
                    ]
                ]
            ],
            'faq' => [
                'title' => 'Frequently Asked Questions',
                'enabled' => true,
                'items' => [
                    [
                        'question' => 'What are the rental prices at Nobu Residences?',
                        'answer' => 'Rental prices vary based on unit size and floor level. Our 1-bedroom units start from $2,800/month, 2-bedroom units from $3,800/month, and luxury penthouses from $8,000/month. Contact us for current availability and pricing.'
                    ],
                    [
                        'question' => 'What amenities are included for residents?',
                        'answer' => 'Residents enjoy access to a state-of-the-art fitness center, rooftop pool, concierge services, party room, guest suites, media room, BBQ areas, and 24/7 security. Additionally, residents have exclusive access to Nobu Hotel amenities.'
                    ],
                    [
                        'question' => 'What are the nearby amenities?',
                        'answer' => 'Nobu Residences is located in Toronto\'s Entertainment District, steps away from CN Tower, Rogers Centre, Air Canada Centre, Union Station, King Street restaurants, Financial District, and numerous shopping centers. Transit access includes TTC subway, streetcar lines, and GO Transit.'
                    ],
                    [
                        'question' => 'What makes this location special?',
                        'answer' => 'Our prime location at 15 Mercer Street puts you in the heart of Toronto\'s Entertainment District. You\'ll be integrated with the world-renowned Nobu Hotel and Restaurant, offering unparalleled luxury living with access to exclusive dining, spa services, and concierge amenities.'
                    ],
                    [
                        'question' => 'Are pets allowed in the building?',
                        'answer' => 'Yes, pets are welcome at Nobu Residences with certain restrictions. We allow cats and dogs under 25 lbs with a one-time pet deposit. Please contact our leasing office for detailed pet policy information.'
                    ],
                    [
                        'question' => 'How do I schedule a viewing?',
                        'answer' => 'You can schedule a viewing by calling our leasing office at +1 437 998 1795, emailing contact@noburesidences.com, or filling out our online contact form. We offer both in-person and virtual tours.'
                    ]
                ]
            ],
            'footer' => [
                'enabled' => true,
                'heading' => 'Your new home is waiting',
                'subheading' => 'Apply online in minutes or get in touch to schedule a personalized tour',
                'logo_url' => '/assets/logo.png',
                'background_image' => '/assets/house-img.jpg',
                'description' => 'Experience luxury living at Nobu Residences in the heart of Toronto. Modern condos with world-class amenities and unparalleled service.',
                'quick_links' => [
                    ['text' => 'Properties for Rent', 'url' => '/rent'],
                    ['text' => 'Properties for Sale', 'url' => '/sale'],
                    ['text' => 'Search Properties', 'url' => '/search'],
                    ['text' => 'Contact Us', 'url' => '/contact']
                ],
                'contact_info' => [
                    'use_global_contact' => true, // Uses website's global contact info
                    'show_phone' => true,
                    'show_email' => true,
                    'show_address' => true,
                    // Override fields - only used if use_global_contact is false
                    'custom_phone' => '',
                    'custom_email' => '',
                    'custom_address' => '',
                    'custom_agent_name' => '',
                    'custom_agent_title' => ''
                ],
                'social_media' => [
                    'use_global_social' => true, // Uses website's global social media
                    'show_facebook' => true,
                    'show_instagram' => true,
                    'show_twitter' => false,
                    'show_linkedin' => true
                ],
                'copyright_text' => '© 2024 Nobu Residences. All rights reserved.',
                'additional_links' => [
                    ['text' => 'Privacy Policy', 'url' => '/privacy'],
                    ['text' => 'Terms of Service', 'url' => '/terms']
                ]
            ]
        ];
    }

    /**
     * Default home content personalized for a building website (created via
     * the "Launch Website" / building-picker flow). Starts from
     * getDefaultHomeContent() and overrides the Nobu-specific copy with the
     * building's own name, city, image and facts — everything stays editable
     * afterwards in Admin → Websites → Edit Home Page.
     */
    public static function getDefaultHomeContentForBuilding(Building $building): array
    {
        $content = static::getDefaultHomeContent();
        $name = trim((string) $building->name) ?: 'This Building';
        $city = trim((string) $building->city);

        $content['hero']['welcome_text'] = 'WELCOME TO ' . strtoupper($name);
        // Hero subheading: a short summary of the building's own description
        // beats the generic tagline. Falls back when no description exists.
        $descriptionSummary = trim(preg_replace('/\s+/', ' ', strip_tags((string) $building->description)));
        $content['hero']['subheading'] = $descriptionSummary !== ''
            ? Str::limit($descriptionSummary, 180, '…')
            : "Whether buying or renting, {$name} makes finding your home easy and reliable.";
        if ($building->main_image) {
            $content['hero']['background_image'] = $building->main_image;
        }

        $content['about']['title'] = "Learn everything about {$name}";
        if ($building->main_image) {
            $content['about']['image'] = $building->main_image;
        }
        $content['about']['image_alt'] = $name . ' Building';
        $content['about']['tabs']['overview']['content'] = $building->description
            ?: ($name . ($city ? " is located in {$city}." : ' — building profile coming soon.'));

        // Key facts from real building fields; keep only the ones we have.
        $keyFacts = [];
        if ($building->floors || $building->total_units) {
            $parts = array_filter([
                $building->floors ? "{$building->floors} floors" : null,
                $building->total_units ? "{$building->total_units} units" : null,
            ]);
            $keyFacts[] = ['icon' => 'building', 'text' => implode(' / ', $parts)];
        }
        if ($building->year_built) {
            $keyFacts[] = ['icon' => 'calendar', 'text' => "Built in {$building->year_built}"];
        }
        if ($building->sqft_range) {
            $keyFacts[] = ['icon' => 'dimensions', 'text' => $building->sqft_range];
        }
        if ($building->building_type) {
            $keyFacts[] = ['icon' => 'building-type', 'text' => $building->building_type];
        }
        if ($building->avg_price_per_sqft) {
            $keyFacts[] = ['icon' => 'price', 'text' => "Avg {$building->avg_price_per_sqft} per square foot"];
        }
        if (!empty($keyFacts)) {
            $content['about']['tabs']['key_facts']['items'] = $keyFacts;
        }

        // FAQ copy: swap the brand name; the Nobu-specific facts (prices,
        // address) remain editable via the admin home-page editor.
        foreach ($content['faq']['items'] as &$item) {
            $item['question'] = str_replace(['Nobu Residences', 'Nobu'], $name, $item['question']);
            $item['answer'] = str_replace(['Nobu Residences', 'Nobu'], $name, $item['answer']);
        }
        unset($item);

        $content['footer']['description'] = "Experience luxury living at {$name}"
            . ($city ? " in the heart of {$city}." : '.');
        $content['footer']['copyright_text'] = '© ' . date('Y') . " {$name}. All rights reserved.";

        return $content;
    }
}
