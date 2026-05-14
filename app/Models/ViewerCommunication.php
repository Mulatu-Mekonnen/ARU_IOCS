<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ViewerCommunication extends Model
{
    use HasFactory;

    public const TYPES = ['FEEDBACK', 'REQUEST', 'ACKNOWLEDGMENT', 'COMMENT', 'INQUIRY'];

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'parent_id',
        'thread_root_id',
        'sender_id',
        'recipient_user_id',
        'communication_type',
        'subject',
        'body',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (ViewerCommunication $model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
            if ($model->parent_id) {
                $parent = ViewerCommunication::query()->find($model->parent_id);
                if ($parent) {
                    $model->thread_root_id = $parent->thread_root_id ?: $parent->id;
                }
            }
        });

        static::created(function (ViewerCommunication $model) {
            if (! $model->parent_id && empty($model->thread_root_id)) {
                $model->thread_root_id = $model->id;
                $model->saveQuietly();
            }
        });
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function recipientUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_user_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(ViewerCommunication::class, 'parent_id');
    }

    public function threadMessages()
    {
        return $this->hasMany(ViewerCommunication::class, 'thread_root_id', 'thread_root_id')
            ->orderBy('created_at');
    }

    public static function sameOfficeUsers(User $a, User $b): bool
    {
        if (! $a->office_id || ! $b->office_id) {
            return false;
        }

        return (string) $a->office_id === (string) $b->office_id;
    }
}
