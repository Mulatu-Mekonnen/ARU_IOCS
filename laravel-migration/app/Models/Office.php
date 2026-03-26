<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Office extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::uuid();
            }
        });
    }
    public $timestamps = false;

    protected $fillable = ['name'];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function sentAgendas(): HasMany
    {
        return $this->hasMany(Agenda::class, 'sender_office_id');
    }

    public function receivedAgendas(): HasMany
    {
        return $this->hasMany(Agenda::class, 'receiver_office_id');
    }

    public function currentAgendas(): HasMany
    {
        return $this->hasMany(Agenda::class, 'current_office_id');
    }

    public function routesFrom(): HasMany
    {
        return $this->hasMany(AgendaRoute::class, 'from_office_id');
    }

    public function routesTo(): HasMany
    {
        return $this->hasMany(AgendaRoute::class, 'to_office_id');
    }
}