<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Agenda;
use App\Models\Office;
use App\Models\Announcement;
use App\Models\NotificationRead;
use Inertia\Inertia;
use Illuminate\Http\Request;

class HeadController extends Controller
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
            'totalUsers' => User::where('office_id', $office->id)->count(),
            'totalAgendas' => Agenda::where('current_office_id', $office->id)->count(),
            'pendingAgendas' => Agenda::where('current_office_id', $office->id)->where('status', 'PENDING')->count(),
            'approvedAgendas' => Agenda::where('current_office_id', $office->id)->where('status', 'APPROVED')->count(),
            'rejectedAgendas' => Agenda::where('current_office_id', $office->id)->where('status', 'REJECTED')->count(),
            'forwardedAgendas' => Agenda::where('current_office_id', $office->id)->where('status', 'FORWARDED')->count(),
        ];

        // Agendas by status for this office
        $agendasByStatus = Agenda::selectRaw('status, COUNT(*) as count')
            ->where('current_office_id', $office->id)
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'count' => $item->count,
                    'label' => ucfirst(strtolower($item->status)),
                ];
            });

        // Recent activity for this office
        $recentActivities = collect();

        // Recent agendas in this office
        $recentAgendas = Agenda::with(['createdBy', 'currentOffice'])
            ->where('current_office_id', $office->id)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(function ($agenda) {
                return [
                    'id' => $agenda->id,
                    'type' => 'agenda',
                    'title' => 'New Agenda: ' . $agenda->title,
                    'description' => 'Created by ' . $agenda->createdBy->name,
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

        return Inertia::render('Dashboard/Head/Dashboard', [
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
        $office = $user->office;

        $query = Agenda::where('current_office_id', $office->id)
            ->with(['createdBy', 'senderOffice', 'receiverOffice', 'currentOffice', 'approvalHistories']);

        // Status filter
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $agendas = $query->paginate(10);

        return Inertia::render('Dashboard/Head/Agendas/Index', [
            'agendas' => $agendas,
            'filters' => $request->only(['status']),
        ]);
    }

    public function pending(Request $request)
    {
        $user = $request->user();
        $office = $user->office;

        $agendas = Agenda::where('current_office_id', $office->id)
            ->where('status', 'PENDING')
            ->with(['createdBy', 'senderOffice', 'receiverOffice', 'currentOffice', 'approvalHistories'])
            ->paginate(20);

        $offices = Office::all();

        return Inertia::render('Dashboard/Head/Pending/Index', [
            'agendas' => $agendas,
            'offices' => $offices,
        ]);
    }

    public function review(Request $request, Agenda $agenda)
    {
        $user = $request->user();
        $office = $user->office;

        if (!$office || $agenda->current_office_id !== $office->id) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'You are not allowed to review this agenda.'], 403);
            }

            return redirect()->back()->with('error', 'You are not allowed to review this agenda.');
        }

        $validated = $request->validate([
            'action' => 'required|in:approve,reject,forward',
            'comment' => 'nullable|string|max:1000',
            'receiver_office_id' => 'nullable|exists:offices,id',
            'receiverOfficeId' => 'nullable|exists:offices,id',
        ]);

        $action = $validated['action'];
        $receiverOfficeId = $validated['receiver_office_id'] ?? $validated['receiverOfficeId'] ?? null;

        if ($action === 'forward' && !$receiverOfficeId) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Please select an office to forward to.'], 422);
            }

            return redirect()->back()->with('error', 'Please select an office to forward to.');
        }

        if ($action === 'approve') {
            $agenda->update([
                'status' => 'APPROVED',
                'approved_by_id' => $user->id,
            ]);
        }

        if ($action === 'reject') {
            $agenda->update([
                'status' => 'REJECTED',
                'approved_by_id' => $user->id,
            ]);
        }

        if ($action === 'forward') {
            $agenda->update([
                'status' => 'FORWARDED',
                'receiver_office_id' => $receiverOfficeId,
                'current_office_id' => $receiverOfficeId,
                'approved_by_id' => $user->id,
            ]);
        }

        if ($request->expectsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->back()->with('success', 'Agenda reviewed successfully.');
    }

    public function reports(Request $request)
    {
        $user = $request->user();
        $office = $user->office;

        $statuses = ['PENDING', 'APPROVED', 'REJECTED', 'FORWARDED', 'ARCHIVED'];
        $stats = [];

        foreach ($statuses as $status) {
            $stats[strtolower($status)] = Agenda::where('current_office_id', $office->id)
                ->where('status', $status)
                ->count();
        }

        $stats['total'] = array_sum($stats);
        $stats['archived'] = $stats['archived'] ?? 0;

        $activityLogs = Agenda::where('current_office_id', $office->id)
            ->orderBy('updated_at', 'desc')
            ->take(10)
            ->get();

        return Inertia::render('Dashboard/Head/Reports/Index', [
            'stats' => $stats,
            'activityLogs' => $activityLogs,
        ]);
    }

    public function archive(Request $request)
    {
        $user = $request->user();
        $office = $user->office;

        $query = Agenda::where('current_office_id', $office->id)
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
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('createdBy', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
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

        return Inertia::render('Dashboard/Head/Archive/Index', [
            'agendas' => $agendas,
            'filters' => $request->only(['status', 'search', 'dateFrom', 'dateTo']),
        ]);
    }

    public function staff(Request $request)
    {
        $user = $request->user();
        $office = $user->office;

        $query = User::where('office_id', $office->id)->with('office');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        if ($request->has('status') && $request->status) {
            $query->where('active', $request->status === 'active');
        }

        $users = $query->orderBy('name')->paginate(20);

        return Inertia::render('Dashboard/Head/Staff/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'status']),
        ]);
    }

    public function notifications(Request $request)
    {
        $user = $request->user();
        $office = $user->office;

        // Fetch real agendas for this office
        $agendaNotifications = Agenda::where('current_office_id', $office->id)
            ->with(['createdBy', 'senderOffice'])
            ->latest('updated_at')
            ->take(8)
            ->get()
            ->map(function ($agenda) {
                $type = 'new_communication';
                $title = 'New Communication Received';
                $priority = 'high';

                if ($agenda->status === 'APPROVED') {
                    $type = 'communication_approved';
                    $title = 'Communication Approved';
                    $priority = 'medium';
                } elseif ($agenda->status === 'REJECTED') {
                    $type = 'communication_rejected';
                    $title = 'Communication Rejected';
                    $priority = 'high';
                } elseif ($agenda->status === 'FORWARDED') {
                    $type = 'communication_forwarded';
                    $title = 'Communication Forwarded';
                    $priority = 'medium';
                }

                return [
                    'id' => 'agenda-' . $agenda->id,
                    'type' => $type,
                    'title' => $title,
                    'message' => sprintf(
                        '%s (%s) - %s',
                        $agenda->title,
                        $agenda->senderOffice?->name ?? 'Unknown office',
                        $agenda->status
                    ),
                    'priority' => $priority,
                    'timestamp' => optional($agenda->updated_at ?? $agenda->created_at)?->toIso8601String(),
                    'read' => false,
                    'actionUrl' => '/dashboard/head/pending',
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
                    'actionUrl' => '/dashboard/head/notifications',
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

        return Inertia::render('Dashboard/Head/Notifications/Index', [
            'notifications' => $notifications,
            'stats' => $stats,
        ]);
    }
    }