<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentInfo extends Model
{
    /**
     * The Nobu site's agent phone that landing sites inherited at creation
     * (store() falls back to the default site's agentInfo). On non-default
     * sites this exact value reads as unset so tenant pages fall through to
     * their own contact info instead of showing Nobu's number — the same
     * self-heal pattern as Website::getContactInfo(). Real dashboard-entered
     * numbers pass through untouched.
     */
    private const LEGACY_SEED_PHONE = '647-490-1532';

    protected $fillable = [
        'website_id',
        'agent_name',
        'agent_title',
        'agent_phone',
        'brokerage',
        'profile_image'
    ];

    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class);
    }

    protected function agentPhone(): Attribute
    {
        return Attribute::get(function (?string $value) {
            if ($value === null) {
                return $value;
            }
            if ($this->website && !$this->website->is_default
                && trim($value) === self::LEGACY_SEED_PHONE) {
                return '';
            }

            return $value;
        });
    }
}
