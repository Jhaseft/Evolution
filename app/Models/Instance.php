<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Group;

class Instance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'instance_name',
        'phone_number',
        'status',
    ];

    // Relación con el usuario
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relación con los grupos
    public function groups()
    {
        return $this->hasMany(Group::class, 'instance_id');
    }
}
