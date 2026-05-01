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

        $stats = [
            'totalAgendas' => Agenda::count(),
            'pendingAgendas' => Agenda::where('status', 'PENDING')->count(),
            'approvedAgendas' => Agenda::where('status', 'APPROVED')->count(),
            'rejectedAgendas' => Agenda::where('status', 'REJECTED')->count(),
            'forwardedAgendas' => Agenda::where('status', 'FORWARDED')->count(),
        ];

        // Agendas by status (all approved agendas for viewer)
        $agendasByStatus = Agenda::selectRaw('status, COUNT(*) as count')
            ->where('status', 'APPROVED')
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'count' => $item->count,
                    'label' => ucfirst(strtolower($item->status)),
                ];
            });

        // Recent activity for viewer (approved agendas and announcements)
        $recentActivities = collect();

        // Recent approved agendas
        $recentAgendas = Agenda::with(['createdBy', 'currentOffice'])
            ->where('status', 'APPROVED')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(function ($agenda) {
                return [
                    'id' => $agenda->id,
                    'type' => 'agenda',
                    'title' => 'Approved Agenda: ' . $agenda->title,
                    'description' => 'From ' . $agenda->currentOffice->name,
                    'timestamp' => $agenda->created_at,
                    'icon' => 'Calendar',
                ];
            });

        // Recent announcements
        $recentAnnouncements = Announcement::with('author')
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

        $announcements = Announcement::with('author')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return Inertia::render('Dashboard/Viewer/Dashboard', [
            'stats' => $stats,
            'agendasByStatus' => $agendasByStatus,
            'recentActivities' => $recentActivities,
            'announcements' => $announcements,
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }

    public function inbox(Request $request)
    {
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

    public function notifications(Request $request)
    {
        $user = $request->user();

        // Fetch real approved agendas
        $agendaNotifications = Agenda::where('status', 'APPROVED')
            ->with(['createdBy', 'currentOffice'])
            ->latest('updated_at')
            ->take(8)
            ->get()
            ->map(function ($agenda) {
                return [
                    'id' => 'agenda-' . $agenda->id,
                    'type' => 'communication_approved',
                    'title' => 'Approved Agenda Available',
                    'message' => sprintf(
                        '%s - Approved and available for review',
                        $agenda->title
                    ),
                    'priority' => 'medium',
                    'timestamp' => optional($agenda->updated_at ?? $agenda->created_at)?->toIso8601String(),
                    'read' => false,
                    'actionUrl' => '/dashboard/viewer/inbox',
                ];
            });

        // Fetch real announcements
        $announcementNotifications = Announcement::with('author')
            ->latest('created_at')
            ->take(4)
            ->get()
            ->map(function ($announcement) {
                return [
                    'id' => 'announcement-' . $announcement->id,
                    'type' => 'new_announcement',
                    'title' => 'System Announcement Posted',
                    'message' => sprintf(
                        '%s%s',
                        $announcement->title,
                        $announcement->author?->name ? ' by ' . $announcement->author->name : ''
                    ),
                    'priority' => 'medium',
                    'timestamp' => optional($announcement->created_at)?->toIso8601String(),
                    'read' => false,
                    'actionUrl' => '/dashboard/viewer/announcements',
                ];
            });

        $notifications = $agendaNotifications
            ->concat($announcementNotifications)
            ->sortByDesc('timestamp')
            ->take(12)
            ->values()
            ->all();

        $readIds = NotificationRead::where('user_id', $user->id)->pluck('notification_id')->all();
        $notifications = collect($notifications)->map(function ($notification) use ($readIds) {
            $notification['read'] = in_array($notification['id'], $readIds, true);
            return $notification;
        })->all();

        return Inertia::render('Dashboard/Viewer/Notifications/Index', [
            'notifications' => $notifications,
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