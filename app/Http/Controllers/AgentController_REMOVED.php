<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\ContactPurchase;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class AgentController extends Controller
{
    /**
     * Show property details with conditional address display
     */
    public function showProperty(Property $property)
    {
        // Increment view count
        $property->incrementViewCount();
        
        // Get secure property data using the enhanced model method
        $propertyData = $property->getSecureDisplayData(Auth::user(), Session::getId());
        
        // Debug: Force no access for testing address masking
        if (!$property->isOwnedBy(Auth::id())) {
            $propertyData['has_contact_access'] = false;
            $propertyData['address'] = $property->getMaskedAddress();
            $propertyData['full_address'] = null;
            $propertyData['postal_code'] = $property->getMaskedPostalCode();
            $propertyData['latitude'] = $property->getApproximateLatitude();
            $propertyData['longitude'] = $property->getApproximateLongitude();
        }
        
        // Get agent data with conditional contact information
        $agentData = $property->getAgentDisplayData($propertyData['has_contact_access']);
        
        // Merge agent data into property data
        $propertyData['agent'] = $agentData;
        
        return Inertia::render('Agent/PropertyDetail', [
            'property' => $propertyData,
            'title' => $property->title,
            'canPurchaseContact' => !$propertyData['has_contact_access'],
        ]);
    }
    
    /**
     * Purchase contact information for a property
     */
    public function purchaseContact(Request $request, Property $property)
    {
        $request->validate([
            'payment_method' => 'required|string',
            'buyer_email' => 'required|email',
            'buyer_name' => 'required|string|max:255',
        ]);
        
        // Check if already purchased
        if ($property->hasContactAccess()) {
            return response()->json([
                'success' => false,
                'message' => 'Contact information already purchased for this property.'
            ], 400);
        }
        
        try {
            // Here you would integrate with your payment processor
            // For now, we'll simulate a successful payment
            
            $purchase = ContactPurchase::create([
                'property_id' => $property->id,
                'buyer_email' => $request->buyer_email,
                'buyer_name' => $request->buyer_name,
                'amount' => $property->contact_price ?? 10.00,
                'payment_method' => $request->payment_method,
                'payment_status' => 'completed',
                'session_id' => Session::getId(),
                'user_id' => Auth::id(),
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Contact information purchased successfully!',
                'purchase_id' => $purchase->id,
                'redirect_url' => route('agent.properties.show', $property->id)
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment processing failed. Please try again.'
            ], 500);
        }
    }
    
    /**
     * Check contact purchase status for AJAX requests
     */
    public function checkContactStatus(Property $property)
    {
        $hasAccess = $property->hasContactAccess();
        
        return response()->json([
            'has_access' => $hasAccess,
            'address' => $hasAccess ? $property->address : $property->getMaskedAddress(),
            'full_address' => $hasAccess ? $property->full_address : null,
            'postal_code' => $hasAccess ? $property->postal_code : $property->getMaskedPostalCode(),
            'latitude' => $hasAccess ? $property->latitude : $property->getApproximateLatitude(),
            'longitude' => $hasAccess ? $property->longitude : $property->getApproximateLongitude(),
            'agent' => $property->getAgentDisplayData($hasAccess),
        ]);
    }
    

    
    /**
     * List all agent properties with address protection for public viewing
     */
    public function publicPropertyListing(Request $request)
    {
        $query = Property::with(['agent'])
            ->where('status', 'active')
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('city')) {
            $query->where('city', 'like', '%' . $request->city . '%');
        }

        if ($request->filled('property_type')) {
            $query->where('property_type', $request->property_type);
        }

        if ($request->filled('transaction_type')) {
            $query->where('transaction_type', $request->transaction_type);
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->filled('bedrooms')) {
            $query->where('bedrooms', '>=', $request->bedrooms);
        }

        if ($request->filled('bathrooms')) {
            $query->where('bathrooms', '>=', $request->bathrooms);
        }

        $properties = $query->paginate(12);

        // Transform properties with security considerations
        $properties->getCollection()->transform(function ($property) {
            return $property->getSecureDisplayData(Auth::user(), session()->getId());
        });

        if ($request->expectsJson()) {
            return response()->json($properties);
        }

        return Inertia::render('Agent/PublicPropertyListing', [
            'properties' => $properties,
            'filters' => $request->only(['city', 'property_type', 'transaction_type', 'min_price', 'max_price', 'bedrooms', 'bathrooms']),
        ]);
    }

    /**
     * Agent dashboard
     */
    public function dashboard()
    {
        $agent = Auth::user();
        
        $stats = [
            'total_properties' => $agent->properties()->count(),
            'active_properties' => $agent->properties()->where('status', 'active')->count(),
            'total_contact_purchases' => ContactPurchase::whereHas('property', function($query) {
                $query->where('agent_id', Auth::id());
            })->count(),
            'total_revenue' => ContactPurchase::whereHas('property', function($query) {
                $query->where('agent_id', Auth::id());
            })->sum('amount'),
        ];
        
        return Inertia::render('Agent/Dashboard', [
            'stats' => $stats,
        ]);
    }
    
    /**
     * List agent's properties
     */
    public function properties()
    {
        $properties = Auth::user()->properties()
            ->with(['contactPurchases'])
            ->paginate(12);
            
        return Inertia::render('Agent/Properties/Index', [
            'properties' => $properties,
        ]);
    }
    
    /**
     * Show contact purchases for agent's properties
     */
    public function contactPurchases()
    {
        $purchases = ContactPurchase::whereHas('property', function($query) {
            $query->where('agent_id', Auth::id());
        })->with(['property'])->orderBy('created_at', 'desc')->paginate(20);
        
        return Inertia::render('Agent/ContactPurchases', [
            'purchases' => $purchases,
        ]);
    }

    /**
     * Debug endpoint to see property data
     */
    public function debugProperty(Property $property)
    {
        $propertyData = $property->getSecureDisplayData(Auth::user(), Session::getId());
        
        // Force no access for testing
        if (!$property->isOwnedBy(Auth::id())) {
            $propertyData['has_contact_access'] = false;
            $propertyData['address'] = $property->getMaskedAddress();
            $propertyData['full_address'] = null;
            $propertyData['postal_code'] = $property->getMaskedPostalCode();
        }
        
        return response()->json([
            'original_address' => $property->address,
            'masked_address' => $property->getMaskedAddress(),
            'user_id' => Auth::id(),
            'is_owner' => $property->isOwnedBy(Auth::id()),
            'property_data' => $propertyData,
        ]);
    }
}
