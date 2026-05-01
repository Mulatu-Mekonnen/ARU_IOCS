<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Agenda;
use App\Models\Office;
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

        // Agendas by status
        $agendasByStatus = Agenda::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'count' => $item->count,
                    'label' => ucfirst(strtolower($item->status)),
                ];
            });

        // Agendas by office (using current_office_id)
        $agendasByOffice = Agenda::selectRaw('offices.name as office_name, COUNT(agendas.id) as count')
            ->join('offices', 'agendas.current_office_id', '=', 'offices.id')
            ->groupBy('offices.id', 'offices.name')
            ->get()
            ->map(function ($item) {
                return [
                    'office' => $item->office_name,
                    'count' => $item->count,
                ];
            });

        // Recent activity (last 10 activities)
        $recentActivities = collect();

        // Recent agendas
        $recentAgendas = Agenda::with(['createdBy', 'currentOffice'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(function ($agenda) {
                return [
                    'id' => $agenda->id,
                    'type' => 'agenda',
                    'title' => 'New Agenda: ' . $agenda->title,
                    'description' => 'Created by ' . $agenda->createdBy->name . ' in ' . $agenda->currentOffice->name,
                    'timestamp' => $agenda->created_at,
                    'icon' => 'Calendar',
                ];
            });

        // Recent announcements
        $recentAnnouncements = \App\Models\Announcement::with('author')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(function ($announcement) {
                return [
                    'id' => $announcement->id,
                    'type' => 'announcement',
                    'title' => 'New Announcement: ' . $announcement->title,
                    'description' => 'Posted by ' . $announcement->author->name,
                    'timestamp' => $announcement->created_at,
                    'icon' => 'Megaphone',
                ];
            });

        // Combine and sort by timestamp
        $recentActivities = $recentAgendas->concat($recentAnnouncements)
            ->sortByDesc('timestamp')
            ->take(10)
            ->values();

        return Inertia::render('Dashboard/Admin/Dashboard', [
            'stats' => $stats,
            'agendasByStatus' => $agendasByStatus,
            'agendasByOffice' => $agendasByOffice,
            'recentActivities' => $recentActivities,
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }
}
