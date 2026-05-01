<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Agenda;
use App\Models\Office;
use App\Models\Announcement;
use App\Models\NotificationRead;
use Inertia\Inertia;
use Illuminate\Http\Request;

class StaffController extends Controller
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
            'totalAgendas' => Agenda::where('created_by_id', $user->id)->count(),
            'pendingAgendas' => Agenda::where('created_by_id', $user->id)->where('status', 'PENDING')->count(),
            'approvedAgendas' => Agenda::where('created_by_id', $user->id)->where('status', 'APPROVED')->count(),
            'rejectedAgendas' => Agenda::where('created_by_id', $user->id)->where('status', 'REJECTED')->count(),
            'forwardedAgendas' => Agenda::where('created_by_id', $user->id)->where('status', 'FORWARDED')->count(),
        ];

        // Agendas by status for agendas created by this user
        $agendasByStatus = Agenda::selectRaw('status, COUNT(*) as count')
            ->where('created_by_id', $user->id)
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'count' => $item->count,
                    'label' => ucfirst(strtolower($item->status)),
                ];
            });

        // Recent activity for this user
        $recentActivities = collect();

        // Recent agendas created by this user
        $recentAgendas = Agenda::with(['createdBy', 'currentOffice'])
            ->where('created_by_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(function ($agenda) {
                return [
                    'id' => $agenda->id,
                    'type' => 'agenda',
                    'title' => 'Your Agenda: ' . $agenda->title,
                    'description' => 'Status: ' . ucfirst(strtolower($agenda->status)),
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

        return Inertia::render('Dashboard/Staff/Dashboard', [
            'stats' => $stats,
            'agendasByStatus' => $agendasByStatus,
            'recentActivities' => $recentActivities,
            'announcements' => $announcements,
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }

    public function agendas(Request $request)
    {
        $user = $request->user();

        $query = Agenda::where('created_by_id', $user->id)
            ->with(['createdBy', 'senderOffice', 'receiverOffice', 'currentOffice', 'approvalHistories']);

        // Status filter
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $agendas = $query->paginate(10);

        return Inertia::render('Dashboard/Staff/Agendas/Index', [
            'agendas' => $agendas,
            'filters' => $request->only(['status']),
        ]);
    }

    public function inbox(Request $request)
    {
        $user = $request->user();
        $office = $user->office;

        // Agendas sent to this office (inbox)
        $agendas = Agenda::where('receiver_office_id', $office->id)
            ->orWhere('current_office_id', $office->id)
            ->with(['createdBy', 'senderOffice', 'receiverOffice', 'currentOffice', 'approvalHistories'])
            ->paginate(20);

        return Inertia::render('Dashboard/Staff/Inbox/Index', [
            'agendas' => $agendas,
        ]);
    }

    public function sent(Request $request)
    {
        $user = $request->user();

        // Agendas created by this user
        $agendas = Agenda::where('created_by_id', $user->id)
            ->with(['createdBy', 'senderOffice', 'receiverOffice', 'currentOffice', 'approvalHistories'])
            ->paginate(20);

        return Inertia::render('Dashboard/Staff/Sent/Index', [
            'agendas' => $agendas,
        ]);
    }

    public function archive(Request $request)
    {
        $user = $request->user();
        $office = $user->office;

        $query = Agenda::where(function ($q) use ($user, $office) {
            $q->where('created_by_id', $user->id)
                ->orWhere('receiver_office_id', $office->id)
                ->orWhere('current_office_id', $office->id);
        })
        ->whereIn('status', ['APPROVED', 'REJECTED', 'FORWARDED', 'ARCHIVED'])
        ->with(['createdBy', 'senderOffice', 'receiverOffice', 'currentOffice', 'approvalHistories']);

        // Status filter
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Date range filter
        if ($request->has('dateFrom') && $request->dateFrom) {
            $query->whereDate('created_at', '>=', $request->dateFrom);
        }
        if ($request->has('dateTo') && $request->dateTo) {
            $query->whereDate('created_at', '<=', $request->dateTo);
        }

        $agendas = $query->paginate(20);

        return Inertia::render('Dashboard/Staff/Archive/Index', [
            'agendas' => $agendas,
            'filters' => $request->only(['status', 'search', 'dateFrom', 'dateTo']),
        ]);
    }

    public function notifications(Request $request)
    {
        $user = $request->user();

        // Fetch real agendas created by this user
        $agendaNotifications = Agenda::where('created_by_id', $user->id)
            ->with(['createdBy', 'currentOffice'])
            ->latest('updated_at')
            ->take(8)
            ->get()
            ->map(function ($agenda) {
                $type = 'communication_created';
                $title = 'Your Communication Submitted';
                $priority = 'medium';

                if ($agenda->status === 'APPROVED') {
                    $type = 'communication_approved';
                    $title = 'Your Communication Approved';
                    $priority = 'high';
                } elseif ($agenda->status === 'REJECTED') {
                    $type = 'communication_rejected';
                    $title = 'Your Communication Rejected';
                    $priority = 'high';
                } elseif ($agenda->status === 'FORWARDED') {
                    $type = 'communication_forwarded';
                    $title = 'Your Communication Forwarded';
                    $priority = 'medium';
                }

                return [
                    'id' => 'agenda-' . $agenda->id,
                    'type' => $type,
                    'title' => $title,
                    'message' => sprintf(
                        '%s - Status: %s',
                        $agenda->title,
                        $agenda->status
                    ),
                    'priority' => $priority,
                    'timestamp' => optional($agenda->updated_at ?? $agenda->created_at)?->toIso8601String(),
                    'read' => false,
                    'actionUrl' => '/dashboard/staff/sent',
                    'metadata' => null,
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
                    'actionUrl' => '/dashboard/staff/notifications',
                    'metadata' => null,
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

        $stats = [
            'total' => count($notifications),
            'unread' => collect($notifications)->where('read', false)->count(),
            'highPriority' => collect($notifications)->where('priority', 'high')->where('read', false)->count(),
            'today' => collect($notifications)
                ->filter(fn($n) => now()->isSameDay(new \DateTime($n['timestamp'])))
                ->count(),
        ];

        return Inertia::render('Dashboard/Staff/Notifications/Index', [
            'notifications' => $notifications,
            'stats' => $stats,
        ]);
    }
}