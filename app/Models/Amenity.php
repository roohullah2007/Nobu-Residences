<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Amenity extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'icon'
    ];

    public function buildings()
    {
        return $this->belongsToMany(Building::class)->withTimestamps();
    }
}
