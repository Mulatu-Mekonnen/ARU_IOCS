<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Agenda;
use App\Models\Office;
use App\Models\Announcement;
use App\Models\AuditLog;
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

        $announcements = Announcement::with('author')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        $recentActivities = AuditLog::where('user_id', $user->id)
            ->latest('created_at')
            ->take(8)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'details' => $log->details,
                    'timestamp' => optional($log->created_at)->toIso8601String(),
                ];
            });

        return Inertia::render('Dashboard/Staff/Dashboard', [
            'stats' => $stats,
            'announcements' => $announcements,
            'recentActivities' => $recentActivities,
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
        $office = $user->office;

        $createdNotifications = Agenda::with('receiverOffice')
            ->where('created_by_id', $user->id)
            ->latest('updated_at')
            ->take(15)
            ->get()
            ->map(function ($agenda) {
                return [
                    'id' => 'staff-created-' . $agenda->id,
                    'type' => 'approval_update',
                    'title' => 'Communication Status Updated',
                    'message' => sprintf(
                        '%s - %s%s',
                        $agenda->title,
                        $agenda->status,
                        $agenda->receiverOffice?->name ? ' to ' . $agenda->receiverOffice->name : ''
                    ),
                    'timestamp' => optional($agenda->updated_at ?? $agenda->created_at)?->toIso8601String(),
                    'priority' => $agenda->status === 'REJECTED' ? 'high' : 'medium',
                    'read' => false,
                    'actionUrl' => '/dashboard/staff/sent',
                    'metadata' => ['comment' => null],
                ];
            });

        $inboxNotifications = Agenda::with(['createdBy', 'senderOffice'])
            ->where(function ($q) use ($office) {
                $q->where('receiver_office_id', $office->id)
                    ->orWhere('current_office_id', $office->id);
            })
            ->latest('updated_at')
            ->take(15)
            ->get()
            ->map(function ($agenda) {
                return [
                    'id' => 'staff-inbox-' . $agenda->id,
                    'type' => 'new_communication',
                    'title' => 'New Communication Received',
                    'message' => sprintf(
                        '%s from %s',
                        $agenda->title,
                        $agenda->senderOffice?->name ?? ($agenda->createdBy?->name ?? 'Unknown sender')
                    ),
                    'timestamp' => optional($agenda->updated_at ?? $agenda->created_at)?->toIso8601String(),
                    'priority' => $agenda->status === 'PENDING' ? 'high' : 'medium',
                    'read' => false,
                    'actionUrl' => '/dashboard/staff/inbox',
                    'metadata' => ['comment' => null],
                ];
            });

        $notifications = $createdNotifications
            ->concat($inboxNotifications)
            ->sortByDesc('timestamp')
            ->take(30)
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

        return Inertia::render('Dashboard/Staff/Notifications/Index', [
            'notifications' => $notifications,
            'stats' => $stats,
        ]);
    }
}