<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgentInfo extends Model
{
    protected $fillable = [
        'website_id',
        'agent_name',
        'agent_title',
        'agent_phone',
        'brokerage',
        'profile_image'
    ];

    public function website()
    {
        return $this->belongsTo(Website::class);
    }
}
