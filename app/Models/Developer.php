<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

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

    public function buildings()
    {
        return $this->hasMany(Building::class);
    }
}
