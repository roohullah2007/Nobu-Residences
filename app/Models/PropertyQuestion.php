<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PropertyQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'question',
        'property_listing_key',
        'property_address',
        'property_type',
        'status',
        'admin_notes',
        'user_id',
        'contacted_at'
    ];

    protected $casts = [
        'contacted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    public function scopeContacted($query)
    {
        return $query->where('status', 'contacted');
    }

    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    public function markAsContacted()
    {
        $this->update([
            'status' => 'contacted',
            'contacted_at' => now()
        ]);
    }

    public function markAsResolved()
    {
        $this->update([
            'status' => 'resolved'
        ]);
    }
}
