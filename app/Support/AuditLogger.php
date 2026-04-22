<?php

namespace App\Support;

use App\Models\AuditLog;
use App\Models\User;

class AuditLogger
{
    public static function log(?User $user, string $action, string $category, string $details, array $metadata = []): void
    {
        AuditLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name,
            'user_role' => $user?->role,
            'action' => $action,
            'category' => $category,
            'details' => $details,
            'metadata' => empty($metadata) ? null : $metadata,
        ]);
    }
}
