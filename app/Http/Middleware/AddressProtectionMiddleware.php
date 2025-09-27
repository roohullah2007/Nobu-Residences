<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class AddressProtectionMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        
        // Only apply to agent property pages
        if (!$request->is('agent/properties/*')) {
            return $response;
        }
        
        // Extract property ID from URL
        $propertyId = $this->extractPropertyIdFromUrl($request->url());
        
        if (!$propertyId) {
            return $response;
        }
        
        // Check if user has purchased contact for this property
        $hasContactAccess = $this->checkContactAccess($propertyId);
        
        // If no access, modify the response to mask addresses
        if (!$hasContactAccess && $response->getContent()) {
            $content = $response->getContent();
            $modifiedContent = $this->maskAddressesInContent($content, $propertyId);
            $response->setContent($modifiedContent);
        }
        
        return $response;
    }
    
    /**
     * Extract property ID from URL
     */
    private function extractPropertyIdFromUrl(string $url): ?string
    {
        if (preg_match('/\/agent\/properties\/([a-f0-9\-]+)/', $url, $matches)) {
            return $matches[1];
        }
        return null;
    }
    
    /**
     * Check if user has access to contact information
     */
    private function checkContactAccess(string $propertyId): bool
    {
        // For testing, always return false to mask addresses
        // You can remove this line later
        return false;
        
        // Check by session ID (for anonymous users) using simple table
        $sessionPurchase = DB::table('contact_purchases_simple')
            ->where('property_id', $propertyId)
            ->where('session_id', Session::getId())
            ->where('payment_status', 'completed')
            ->exists();
            
        if ($sessionPurchase) {
            return true;
        }
        
        // Check by user ID (for logged-in users)
        if (Auth::check()) {
            $userPurchase = DB::table('contact_purchases_simple')
                ->where('property_id', $propertyId)
                ->where('user_id', Auth::id())
                ->where('payment_status', 'completed')
                ->exists();
                
            return $userPurchase;
        }
        
        return false;
    }
    
    /**
     * Mask addresses in HTML content
     */
    private function maskAddressesInContent(string $content, string $propertyId): string
    {
        // Specific patterns to mask common address formats
        $addressPatterns = [
            // Pattern for "33 Rue Nationale, 13000 Marseille"
            '/\d+\s+Rue\s+[A-Za-zÀ-ÿ\s]+,?\s*\d{5}\s+[A-Za-zÀ-ÿ\s]+/u',
            // Pattern for numbered streets
            '/\d+[A-Za-z]?\s+[A-Za-zÀ-ÿ\s]+(?:Street|St|Road|Rd|Avenue|Ave|Boulevard|Blvd|Drive|Dr|Lane|Ln|Place|Pl|Court|Ct|Way|Rue)[A-Za-zÀ-ÿ\s,\d]*/u',
            // Pattern for apartment/unit numbers
            '/\d+\s*-\s*\d+\s+[A-Za-zÀ-ÿ\s]+(?:Street|St|Road|Rd|Avenue|Ave|Boulevard|Blvd|Drive|Dr|Lane|Ln|Place|Pl|Court|Ct|Way|Rue)[A-Za-zÀ-ÿ\s,\d]*/u',
        ];
        
        foreach ($addressPatterns as $pattern) {
            $content = preg_replace_callback($pattern, function($matches) {
                return $this->maskAddress($matches[0]);
            }, $content);
        }
        
        // Add purchase warning
        $content = $this->injectPurchaseWarning($content, $propertyId);
        
        return $content;
    }
    
    /**
     * Mask a single address
     */
    private function maskAddress(string $address): string
    {
        // Split by comma to preserve city/postal code
        $parts = explode(',', $address);
        
        if (count($parts) >= 2) {
            // Keep only the last part (city/postal code)
            $cityPart = trim(end($parts));
            return 'XXX XXXXXXXXX XXXXXX, ' . $cityPart;
        }
        
        // Fallback masking
        $words = explode(' ', trim($address));
        if (count($words) > 1) {
            $lastWord = array_pop($words);
            return 'XXX XXXXXXXXX XXXXXX ' . $lastWord;
        }
        
        return 'XXX XXXXXXXXX XXXXXX';
    }
    
    /**
     * Inject purchase warning into the page
     */
    private function injectPurchaseWarning(string $content, string $propertyId): string
    {
        $warningScript = '
        <div id="address-warning" style="
            position: fixed; 
            top: 0; 
            left: 0; 
            right: 0; 
            background: #fee2e2; 
            border-bottom: 2px solid #fca5a5; 
            padding: 12px; 
            text-align: center; 
            font-weight: 600; 
            color: #991b1b; 
            z-index: 9999;
        ">
            🔒 Address is hidden. <a href="#purchase" onclick="openPurchaseModal()" style="color: #dc2626; text-decoration: underline; cursor: pointer;">Purchase contact details (€15)</a> to view full address.
        </div>
        
        <script>
        document.addEventListener("DOMContentLoaded", function() {
            document.body.style.paddingTop = "60px";
            
            window.openPurchaseModal = function() {
                if (confirm("Purchase contact information for €15? This will reveal the full address and owner contact details.")) {
                    // Simulate purchase for now
                    fetch("/agent/properties/' . $propertyId . '/purchase-contact", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": document.querySelector("meta[name=csrf-token]")?.content || ""
                        },
                        body: JSON.stringify({
                            buyer_name: "Test User",
                            buyer_email: "test@example.com",
                            payment_method: "stripe"
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert("Contact purchased! Refreshing page...");
                            location.reload();
                        } else {
                            alert("Purchase failed: " + (data.message || "Unknown error"));
                        }
                    })
                    .catch(error => {
                        console.error("Error:", error);
                        alert("An error occurred during purchase.");
                    });
                }
            };
        });
        </script>
        ';
        
        // Inject before closing head tag
        return str_replace('</head>', $warningScript . '</head>', $content);
    }
}
