<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $fillable = [
        'instance_id',
        'group_name',
    ];

    public function instance()
    {
        return $this->belongsTo(Instance::class, 'instance_id');
    }

    public function contacts()
    {
        return $this->hasMany(Contact::class, 'group_id');
    }
}
