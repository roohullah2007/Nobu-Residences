<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RealEstateController extends Controller
{
    /**
     * Real Estate Buildings management
     * Redirects to the new building management system
     */
    public function buildings()
    {
        return redirect()->route('admin.buildings.index');
    }

    /**
     * Real Estate Developers management
     * Redirects to the new developer management system
     */
    public function developers()
    {
        return redirect()->route('admin.developers.index');
    }

    /**
     * Real Estate Schools management
     */
    public function schools(): Response
    {
        // Redirect to the new school management system
        return redirect()->route('admin.schools.index');
    }
}