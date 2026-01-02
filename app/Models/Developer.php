<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Str;

class Developer extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'name',
        'logo',
        'type',
        'email',
        'phone'
    ];

    protected $appends = ['slug'];

    /**
     * Get the slug for the developer (generated from name)
     */
    public function getSlugAttribute()
    {
        return Str::slug($this->name);
    }

    public function buildings()
    {
        return $this->hasMany(Building::class);
    }
}
