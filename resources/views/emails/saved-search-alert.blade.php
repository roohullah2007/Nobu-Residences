@component('mail::message')
# New Listings Match Your Search!

Hi {{ $user->name }},

Great news! We found **{{ $count }} new {{ $count === 1 ? 'listing' : 'listings' }}** matching your saved search "**{{ $searchName }}**".

**Search Criteria:** {{ $criteria }}

---

## Your New Listings

@foreach($listings as $listing)
@component('mail::panel')
**{{ $listing['formatted_price'] }}**
{{ $listing['address'] }}, {{ $listing['city'] }}

@if($listing['bedrooms'] || $listing['bathrooms'])
{{ $listing['bedrooms'] }} Bedrooms | {{ $listing['bathrooms'] }} Bathrooms
@endif

@if($listing['property_type'])
Type: {{ $listing['property_type'] }}
@endif

@if($listing['url'])
[View Property]({{ $listing['url'] }})
@endif
@endcomponent
@endforeach

---

@component('mail::button', ['url' => $searchUrl, 'color' => 'primary'])
View All Matching Properties
@endcomponent

You're receiving this email because you have a {{ $frequency }} alert set up for "{{ $searchName }}".

To manage your saved searches and email preferences, visit your [Dashboard]({{ config('app.url') }}/dashboard).

Thanks,<br>
{{ config('app.name') }}

@slot('subcopy')
If you no longer wish to receive these alerts, you can disable them from your dashboard.
@endslot
@endcomponent
