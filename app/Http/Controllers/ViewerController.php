<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Agenda;
use App\Models\Office;
use App\Models\Announcement;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ViewerController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();
        $office = $user->office;

        $stats = [
            'totalAgendas' => Agenda::where('current_office_id', $office->id)->count(),
            'pendingAgendas' => Agenda::where('current_office_id', $office->id)->where('status', 'PENDING')->count(),
            'approvedAgendas' => Agenda::where('current_office_id', $office->id)->where('status', 'APPROVED')->count(),
            'rejectedAgendas' => Agenda::where('current_office_id', $office->id)->where('status', 'REJECTED')->count(),
            'forwardedAgendas' => Agenda::where('current_office_id', $office->id)->where('status', 'FORWARDED')->count(),
        ];

        $announcements = Announcement::with('author')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return Inertia::render('Dashboard/Viewer/Dashboard', [
            'stats' => $stats,
            'announcements' => $announcements,
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }

    public function inbox(Request $request)
    {
        $user = $request->user();
        $office = $user->office;

        $agendas = Agenda::where('current_office_id', $office->id)
            ->where('status', 'APPROVED')
            ->with(['createdBy', 'senderOffice', 'receiverOffice'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Dashboard/Viewer/Inbox/Index', [
            'agendas' => $agendas,
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }

    public function archive(Request $request)
    {
        $user = $request->user();
        $office = $user->office;

        $agendas = Agenda::where('current_office_id', $office->id)
            ->where('status', 'ARCHIVED')
            ->with(['createdBy'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Dashboard/Viewer/Archive/Index', [
            'agendas' => $agendas,
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }

    public function announcements(Request $request)
    {
        $announcements = Announcement::with(['author'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Dashboard/Viewer/Announcements/Index', [
            'announcements' => $announcements,
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }
}