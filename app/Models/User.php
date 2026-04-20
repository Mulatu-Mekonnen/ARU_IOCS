<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

#[Hidden(['password'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'active',
        'office_id',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::uuid();
            }
        });
    }

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function office(): BelongsTo
    {
        return $this->belongsTo(Office::class);
    }

    public function agendas(): HasMany
    {
        return $this->hasMany(Agenda::class, 'created_by_id');
    }

    public function approvedAgendas(): HasMany
    {
        return $this->hasMany(Agenda::class, 'approved_by_id');
    }

    public function approvalActions(): HasMany
    {
        return $this->hasMany(ApprovalHistory::class, 'action_by_id');
    }

    public function routedAgendas(): HasMany
    {
        return $this->hasMany(AgendaRoute::class, 'routed_by_id');
    }

    public function announcements(): HasMany
    {
        return $this->hasMany(Announcement::class, 'author_id');
    }
}
