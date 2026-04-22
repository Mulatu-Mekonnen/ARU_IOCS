<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $logs = AuditLog::latest('created_at')
            ->take(300)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'timestamp' => optional($log->created_at)->toIso8601String(),
                    'user' => $log->user_name ?? 'System',
                    'userRole' => $log->user_role ?? 'SYSTEM',
                    'action' => $log->action,
                    'category' => $log->category,
                    'details' => $log->details,
                ];
            });

        return Inertia::render('Dashboard/Admin/AuditLogs/Index', [
            'logs' => $logs,
        ]);
    }
}