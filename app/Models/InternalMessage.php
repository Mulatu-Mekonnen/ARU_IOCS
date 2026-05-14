<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class InternalMessage extends Model
{
    use HasFactory;

    public const DELIVERY_OFFICE_BROADCAST = 'office_broadcast';

    public const DELIVERY_DIRECT_USER = 'direct_user';

    public const DELIVERY_ALL_ADMINS = 'all_admins';

    public const DELIVERY_OFFICE_HEADS_ONLY = 'office_heads_only';

    /** Viewer-only communication categories (not official agendas). */
    public const CATEGORIES = [
        'FEEDBACK',
        'REQUEST',
        'ACKNOWLEDGMENT',
        'COMMENT',
        'INQUIRY',
    ];

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'sender_id',
        'parent_id',
        'subject',
        'body',
        'delivery_type',
        'recipient_user_id',
        'recipient_office_id',
        'category',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (InternalMessage $model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
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

    public function recipientOffice(): BelongsTo
    {
        return $this->belongsTo(Office::class, 'recipient_office_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(InternalMessage::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(InternalMessage::class, 'parent_id')->orderBy('created_at');
    }

    /**
     * Root-level inbox visibility (no eager loads / ordering). Used for inbox lists and deduping thread replies.
     */
    public static function inboxRootsBaseQueryForUser(User $user): Builder
    {
        return static::query()
            ->whereNull('parent_id')
            ->where(function ($q) use ($user) {
                $q->where(function ($q2) use ($user) {
                    $q2->where('delivery_type', self::DELIVERY_DIRECT_USER)
                        ->where('recipient_user_id', $user->id);
                });

                if ($user->office_id) {
                    $q->orWhere(function ($q2) use ($user) {
                        $q2->where('delivery_type', self::DELIVERY_OFFICE_BROADCAST)
                            ->where('recipient_office_id', $user->office_id)
                            ->where('sender_id', '!=', $user->id);
                    });

                    if ($user->role === 'HEAD') {
                        $q->orWhere(function ($q2) use ($user) {
                            $q2->where('delivery_type', self::DELIVERY_OFFICE_HEADS_ONLY)
                                ->where('recipient_office_id', $user->office_id);
                        });
                    }
                }

                if ($user->role === 'ADMIN') {
                    $q->orWhere('delivery_type', self::DELIVERY_ALL_ADMINS);
                }
            })
            ->when($user->role === 'VIEWER', function (Builder $q) use ($user) {
                $q->whereHas('sender', function (Builder $sq) use ($user) {
                    $sq->where('role', 'ADMIN')
                        ->orWhere(function (Builder $oq) use ($user) {
                            $oq->whereIn('role', ['HEAD', 'STAFF'])
                                ->where('office_id', $user->office_id);
                        });
                });
            });
    }

    /**
     * Root-level messages visible in the given user's inbox (not including replies listed separately).
     */
    public static function inboxRootsForUser(User $user): Builder
    {
        return static::inboxRootsBaseQueryForUser($user)
            ->with(['sender.office', 'recipientOffice', 'recipientUser', 'replies.sender'])
            ->orderByDesc('created_at');
    }

    /**
     * Direct replies to the user that are not already shown under an inbox root thread (avoids duplicate UI).
     */
    public static function inboxDirectRepliesForUser(User $user, int $limit = 40): Builder
    {
        return static::query()
            ->whereNotNull('parent_id')
            ->where('delivery_type', self::DELIVERY_DIRECT_USER)
            ->where('recipient_user_id', $user->id)
            ->whereNotIn('parent_id', static::inboxRootsBaseQueryForUser($user)->select('id'))
            ->orderByDesc('created_at')
            ->limit($limit);
    }

    public function userCanView(User $user): bool
    {
        if ($this->sender_id === $user->id) {
            return true;
        }

        if ($this->parent_id) {
            return $this->parent?->userCanView($user) ?? false;
        }

        if ($this->delivery_type === self::DELIVERY_DIRECT_USER) {
            return $this->recipient_user_id === $user->id;
        }

        if ($this->delivery_type === self::DELIVERY_OFFICE_BROADCAST && $user->office_id) {
            return (string) $this->recipient_office_id === (string) $user->office_id;
        }

        if ($this->delivery_type === self::DELIVERY_ALL_ADMINS) {
            return $user->role === 'ADMIN';
        }

        if ($this->delivery_type === self::DELIVERY_OFFICE_HEADS_ONLY && $user->office_id) {
            return $user->role === 'HEAD'
                && (string) $this->recipient_office_id === (string) $user->office_id;
        }

        return false;
    }

    public function userCanReply(User $user): bool
    {
        if (! $this->userCanView($user)) {
            return false;
        }

        if ($this->delivery_type === self::DELIVERY_ALL_ADMINS) {
            return $user->role === 'ADMIN' && $this->sender_id !== $user->id;
        }

        return $this->sender_id === $user->id
            || $this->recipient_user_id === $user->id
            || ($this->delivery_type === self::DELIVERY_OFFICE_BROADCAST && $user->office_id && (string) $this->recipient_office_id === (string) $user->office_id)
            || ($this->delivery_type === self::DELIVERY_OFFICE_HEADS_ONLY && $user->role === 'HEAD' && $user->office_id && (string) $this->recipient_office_id === (string) $user->office_id);
    }
}
