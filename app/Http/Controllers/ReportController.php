<?php

namespace App\Http\Controllers;

use App\Models\Agenda;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $summary = [
            'totalAgendas' => Agenda::count(),
            'pendingAgendas' => Agenda::where('status', 'PENDING')->count(),
            'approvedAgendas' => Agenda::where('status', 'APPROVED')->count(),
            'rejectedAgendas' => Agenda::where('status', 'REJECTED')->count(),
        ];

        $recentReports = [
            ['id' => 1, 'name' => 'Agenda Status Summary', 'owner' => 'System', 'createdAt' => now()->format('Y-m-d H:i'), 'status' => 'Live'],
            ['id' => 2, 'name' => 'User Activity Report', 'owner' => 'Admin', 'createdAt' => now()->format('Y-m-d H:i'), 'status' => 'Live'],
            ['id' => 3, 'name' => 'Office Activity Report', 'owner' => 'System', 'createdAt' => now()->format('Y-m-d H:i'), 'status' => 'Live'],
        ];

        $userActivity = AuditLog::selectRaw('COALESCE(user_name, "System") as user_name, COUNT(*) as actions_count, MAX(created_at) as last_activity')
            ->groupBy('user_name')
            ->orderByDesc('actions_count')
            ->take(15)
            ->get()
            ->map(function ($row) {
                return [
                    'user' => $row->user_name,
                    'actionsCount' => (int) $row->actions_count,
                    'lastActivity' => $row->last_activity ? Carbon::parse($row->last_activity)->toDateTimeString() : null,
                ];
            });

        $officeActivity = AuditLog::where('category', 'Office Management')
            ->orWhere('details', 'like', '%office%')
            ->latest('created_at')
            ->take(20)
            ->get()
            ->map(function ($log) {
                return [
                    'office' => $this->extractOfficeName($log->details),
                    'action' => $log->action,
                    'by' => $log->user_name ?? 'System',
                    'at' => optional($log->created_at)->toDateTimeString(),
                ];
            });

        return Inertia::render('Dashboard/Admin/Reports/Index', [
            'summary' => $summary,
            'reports' => $recentReports,
            'userActivity' => $userActivity,
            'officeActivity' => $officeActivity,
        ]);
    }

    private function extractOfficeName(string $details): string
    {
        if (preg_match('/office\s+"([^"]+)"/i', $details, $matches)) {
            return $matches[1];
        }

        return 'General';
    }
}