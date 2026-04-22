<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Agenda;
use App\Models\Office;
use App\Models\AuditLog;
use Inertia\Inertia;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function dashboard(Request $request)
    {
        $stats = [
            'totalUsers' => User::count(),
            'totalAgendas' => Agenda::count(),
            'pendingAgendas' => Agenda::where('status', 'PENDING')->count(),
            'approvedAgendas' => Agenda::where('status', 'APPROVED')->count(),
            'rejectedAgendas' => Agenda::where('status', 'REJECTED')->count(),
            'forwardedAgendas' => Agenda::where('status', 'FORWARDED')->count(),
            'totalOffices' => Office::count(),
        ];

        $agendaByStatus = Agenda::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $agendaByOffice = Office::withCount('currentAgendas')
            ->orderByDesc('current_agendas_count')
            ->take(8)
            ->get()
            ->map(function ($office) {
                return [
                    'name' => $office->name,
                    'count' => $office->current_agendas_count,
                ];
            });

        $recentActivities = AuditLog::latest('created_at')
            ->take(10)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'category' => $log->category,
                    'details' => $log->details,
                    'actor' => $log->user_name ?? 'System',
                    'timestamp' => optional($log->created_at)->toIso8601String(),
                ];
            });

        return Inertia::render('Dashboard/Admin/Dashboard', [
            'stats' => $stats,
            'agendaByStatus' => $agendaByStatus,
            'agendaByOffice' => $agendaByOffice,
            'recentActivities' => $recentActivities,
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }
}
