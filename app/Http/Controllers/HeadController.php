<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Agenda;
use App\Models\Office;
use App\Models\Announcement;
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

        $announcements = Announcement::with('author')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return Inertia::render('Dashboard/Head/Dashboard', [
            'stats' => $stats,
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

    public function notifications(Request $request)
    {
        $user = $request->user();
        $office = $user->office;

        // Create mock notifications
        $notifications = [
            [
                'id' => '1',
                'type' => 'new_communication',
                'title' => 'New Communication Received',
                'message' => 'A new agenda item has been submitted from the Finance Office requiring your review.',
                'timestamp' => now()->subHours(2)->toIso8601String(),
                'priority' => 'high',
                'read' => false,
                'actionUrl' => '/dashboard/head/pending',
                'metadata' => ['comment' => null]
            ],
            [
                'id' => '2',
                'type' => 'pending_reminder',
                'title' => 'Pending Approvals Reminder',
                'message' => 'You have 3 pending communications awaiting your approval.',
                'timestamp' => now()->subHours(4)->toIso8601String(),
                'priority' => 'medium',
                'read' => false,
                'actionUrl' => '/dashboard/head/pending',
                'metadata' => ['comment' => null]
            ],
            [
                'id' => '3',
                'type' => 'approval_update',
                'title' => 'Communication Approved',
                'message' => 'Your approval of "Q4 Budget Review" has been recorded and forwarded to the admin office.',
                'timestamp' => now()->subDays(1)->toIso8601String(),
                'priority' => 'low',
                'read' => true,
                'actionUrl' => '/dashboard/head/archive',
                'metadata' => ['comment' => null]
            ],
            [
                'id' => '4',
                'type' => 'forwarded_communication',
                'title' => 'Communication Forwarded',
                'message' => 'The "Annual Report Submission" has been forwarded to the Board Office for final review.',
                'timestamp' => now()->subDays(2)->toIso8601String(),
                'priority' => 'medium',
                'read' => true,
                'actionUrl' => '/dashboard/head/archive',
                'metadata' => ['comment' => null]
            ],
        ];

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