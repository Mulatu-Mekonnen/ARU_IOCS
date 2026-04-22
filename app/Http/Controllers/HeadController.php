<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Agenda;
use App\Models\ApprovalHistory;
use App\Models\Office;
use App\Models\Announcement;
use App\Models\AuditLog;
use App\Models\NotificationRead;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Support\AuditLogger;

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

        $announcements = Announcement::with('author')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        $recentActivities = AuditLog::where('user_role', 'HEAD')
            ->orWhere('details', 'like', '%' . ($office?->name ?? '') . '%')
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

        return Inertia::render('Dashboard/Head/Dashboard', [
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
            'comment' => 'nullable|string|max:1000|required_if:action,reject',
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
            ApprovalHistory::create([
                'id' => Str::random(25),
                'agenda_id' => $agenda->id,
                'action' => 'APPROVED',
                'comment' => $validated['comment'] ?? null,
                'action_by_id' => $user->id,
            ]);
            AuditLogger::log($user, 'Approved Communication', 'Approval', 'Head approved "' . $agenda->title . '"', [
                'agenda_id' => $agenda->id,
            ]);
        }

        if ($action === 'reject') {
            $agenda->update([
                'status' => 'REJECTED',
                'approved_by_id' => $user->id,
            ]);
            ApprovalHistory::create([
                'id' => Str::random(25),
                'agenda_id' => $agenda->id,
                'action' => 'REJECTED',
                'comment' => $validated['comment'] ?? null,
                'action_by_id' => $user->id,
            ]);
            AuditLogger::log($user, 'Rejected Communication', 'Approval', 'Head rejected "' . $agenda->title . '"', [
                'agenda_id' => $agenda->id,
                'reason' => $validated['comment'] ?? null,
            ]);
        }

        if ($action === 'forward') {
            $agenda->update([
                'status' => 'PENDING',
                'receiver_office_id' => $receiverOfficeId,
                'current_office_id' => $receiverOfficeId,
                'approved_by_id' => $user->id,
            ]);
            ApprovalHistory::create([
                'id' => Str::random(25),
                'agenda_id' => $agenda->id,
                'action' => 'FORWARDED',
                'comment' => $validated['comment'] ?? null,
                'action_by_id' => $user->id,
            ]);
            AuditLogger::log($user, 'Forwarded Communication', 'Approval', 'Head forwarded "' . $agenda->title . '"', [
                'agenda_id' => $agenda->id,
                'receiver_office_id' => $receiverOfficeId,
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
                $type = 'new_communication';
                $title = 'New Communication Received';
                $priority = 'high';
                $actionUrl = '/dashboard/head/pending';

                if ($agenda->status === 'APPROVED') {
                    $type = 'communication_approved';
                    $title = 'Communication Approved';
                    $priority = 'low';
                    $actionUrl = '/dashboard/head/archive';
                } elseif ($agenda->status === 'REJECTED') {
                    $type = 'communication_rejected';
                    $title = 'Communication Rejected';
                    $priority = 'high';
                    $actionUrl = '/dashboard/head/archive';
                } elseif ($agenda->status === 'FORWARDED') {
                    $type = 'communication_forwarded';
                    $title = 'Communication Forwarded';
                    $priority = 'medium';
                    $actionUrl = '/dashboard/head/archive';
                }

                return [
                    'id' => 'head-agenda-' . $agenda->id,
                    'type' => $type,
                    'title' => $title,
                    'message' => sprintf(
                        '%s from %s',
                        $agenda->title,
                        $agenda->senderOffice?->name ?? ($agenda->createdBy?->name ?? 'Unknown sender')
                    ),
                    'timestamp' => optional($agenda->updated_at ?? $agenda->created_at)?->toIso8601String(),
                    'priority' => $priority,
                    'read' => false,
                    'actionUrl' => $actionUrl,
                    'metadata' => ['comment' => null],
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

        return Inertia::render('Dashboard/Head/Notifications/Index', [
            'notifications' => $notifications,
            'stats' => $stats,
        ]);
    }
    }