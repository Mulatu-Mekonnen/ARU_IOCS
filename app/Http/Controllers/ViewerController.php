<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Agenda;
use App\Models\Office;
use App\Models\Announcement;
use App\Models\NotificationRead;
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

        $recentActivities = Agenda::with(['createdBy', 'senderOffice'])
            ->where('current_office_id', $office->id)
            ->latest('updated_at')
            ->take(8)
            ->get()
            ->map(function ($agenda) {
                return [
                    'id' => $agenda->id,
                    'title' => $agenda->title,
                    'status' => $agenda->status,
                    'actor' => $agenda->createdBy?->name ?? ($agenda->senderOffice?->name ?? 'System'),
                    'timestamp' => optional($agenda->updated_at ?? $agenda->created_at)?->toIso8601String(),
                ];
            });

        return Inertia::render('Dashboard/Viewer/Dashboard', [
            'stats' => $stats,
            'announcements' => $announcements,
            'recentActivities' => $recentActivities,
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }

    public function inbox(Request $request)
    {
        $user = $request->user();
        $office = $user->office;

        $agendas = Agenda::where('status', 'APPROVED')
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

    public function notifications(Request $request)
    {
        $user = $request->user();
        $office = $user->office;

        $notifications = Agenda::with(['createdBy', 'senderOffice'])
            ->where('current_office_id', $office->id)
            ->latest('updated_at')
            ->take(30)
            ->get()
            ->map(function ($agenda) {
                $type = match ($agenda->status) {
                    'APPROVED' => 'communication_approved',
                    'REJECTED' => 'communication_rejected',
                    'FORWARDED' => 'communication_forwarded',
                    default => 'new_communication',
                };

                $title = match ($agenda->status) {
                    'APPROVED' => 'Communication Approved',
                    'REJECTED' => 'Communication Rejected',
                    'FORWARDED' => 'Communication Forwarded',
                    default => 'New Communication',
                };

                return [
                    'id' => 'viewer-' . $agenda->id,
                    'type' => $type,
                    'title' => $title,
                    'message' => sprintf(
                        '%s from %s',
                        $agenda->title,
                        $agenda->senderOffice?->name ?? ($agenda->createdBy?->name ?? 'Unknown sender')
                    ),
                    'timestamp' => optional($agenda->updated_at ?? $agenda->created_at)?->toIso8601String(),
                    'priority' => $agenda->status === 'REJECTED' ? 'high' : 'medium',
                    'read' => false,
                    'actionUrl' => '/dashboard/viewer/inbox',
                    'metadata' => null,
                ];
            })
            ->values()
            ->all();

        $readIds = NotificationRead::where('user_id', $user->id)
            ->pluck('notification_id')
            ->all();

        $notifications = collect($notifications)->map(function ($n) use ($readIds) {
            $n['read'] = in_array($n['id'], $readIds, true);
            return $n;
        })->all();

        $stats = [
            'total' => count($notifications),
            'unread' => collect($notifications)->where('read', false)->count(),
            'highPriority' => collect($notifications)->where('priority', 'high')->where('read', false)->count(),
            'today' => collect($notifications)
                ->filter(fn($n) => now()->isSameDay(new \DateTime($n['timestamp'])))
                ->count(),
        ];

        return Inertia::render('Dashboard/Viewer/Notifications/Index', [
            'notifications' => $notifications,
            'stats' => $stats,
        ]);
    }
}