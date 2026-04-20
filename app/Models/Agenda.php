<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Agenda extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'title',
        'description',
        'attachment_url',
        'attachment_name',
        'attachment_size',
        'status',
        'created_by_id',
        'sender_office_id',
        'receiver_office_id',
        'current_office_id',
        'approved_by_id',
    ];

    protected $casts = [
        'attachment_size' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::random(25);
            }
        });
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function senderOffice(): BelongsTo
    {
        return $this->belongsTo(Office::class, 'sender_office_id');
    }

    public function receiverOffice(): BelongsTo
    {
        return $this->belongsTo(Office::class, 'receiver_office_id');
    }

    public function currentOffice(): BelongsTo
    {
        return $this->belongsTo(Office::class, 'current_office_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_id');
    }

    public function approvalHistories(): HasMany
    {
        return $this->hasMany(ApprovalHistory::class);
    }

    public function routes(): HasMany
    {
        return $this->hasMany(AgendaRoute::class);
    }
}