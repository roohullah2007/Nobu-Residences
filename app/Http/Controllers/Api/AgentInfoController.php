<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Website;
use App\Models\AgentInfo;
use Illuminate\Http\Request;

class AgentInfoController extends Controller
{
    /**
     * Get agent info for the current website
     */
    public function getAgentInfo()
    {
        // Get the default website with agent info
        $website = Website::with('agentInfo')->default()->active()->first();

        if (!$website || !$website->agentInfo) {
            // Return default agent info if not found
            return response()->json([
                'agent_name' => 'Jatin Gill',
                'agent_title' => 'Property Manager',
                'agent_phone' => '+923487743243',
                'brokerage' => 'Keller Williams Realty',
                'profile_image' => null
            ]);
        }

        return response()->json($website->agentInfo);
    }

    /**
     * Get agent info by website ID
     */
    public function getAgentInfoByWebsite($websiteId)
    {
        $agentInfo = AgentInfo::where('website_id', $websiteId)->first();

        if (!$agentInfo) {
            return response()->json([
                'message' => 'Agent info not found'
            ], 404);
        }

        return response()->json($agentInfo);
    }
}