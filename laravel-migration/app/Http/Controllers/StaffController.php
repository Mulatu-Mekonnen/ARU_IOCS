<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Agenda;
use App\Models\Office;
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
            'totalAgendas' => Agenda::where('user_id', $user->id)->count(),
            'pendingAgendas' => Agenda::where('user_id', $user->id)->where('status', 'PENDING')->count(),
            'approvedAgendas' => Agenda::where('user_id', $user->id)->where('status', 'APPROVED')->count(),
            'rejectedAgendas' => Agenda::where('user_id', $user->id)->where('status', 'REJECTED')->count(),
            'forwardedAgendas' => Agenda::where('user_id', $user->id)->where('status', 'FORWARDED')->count(),
        ];

        return Inertia::render('Dashboard/Staff/Dashboard', [
            'stats' => $stats,
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }

    public function agendas(Request $request)
    {
        $user = $request->user();

        $query = Agenda::where('user_id', $user->id)->with(['user', 'office', 'approvals']);

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
            ->with(['user', 'office', 'approvals'])
            ->paginate(20);

        return Inertia::render('Dashboard/Staff/Inbox/Index', [
            'agendas' => $agendas,
        ]);
    }

    public function sent(Request $request)
    {
        $user = $request->user();

        // Agendas created by this user
        $agendas = Agenda::where('user_id', $user->id)
            ->with(['user', 'office', 'approvals'])
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
            $q->where('user_id', $user->id)
                ->orWhere('receiver_office_id', $office->id)
                ->orWhere('current_office_id', $office->id);
        })
        ->whereIn('status', ['APPROVED', 'REJECTED', 'FORWARDED', 'ARCHIVED'])
        ->with(['user', 'office', 'approvals']);

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

        // Create mock notifications
        $notifications = [
            [
                'id' => '1',
                'type' => 'new_communication',
                'title' => 'New Communication Received',
                'message' => 'A communication requires your review or action.',
                'timestamp' => now()->subHours(2)->toIso8601String(),
                'priority' => 'high',
                'read' => false,
                'actionUrl' => '/dashboard/staff/inbox',
                'metadata' => ['comment' => null]
            ],
            [
                'id' => '2',
                'type' => 'approval_update',
                'title' => 'Communication Status Updated',
                'message' => 'Your communication has been approved and is ready for review.',
                'timestamp' => now()->subHours(4)->toIso8601String(),
                'priority' => 'medium',
                'read' => false,
                'actionUrl' => '/dashboard/staff/sent',
                'metadata' => ['comment' => null]
            ],
            [
                'id' => '3',
                'type' => 'pending_reminder',
                'title' => 'Pending Communications Reminder',
                'message' => 'You have pending communications that need attention.',
                'timestamp' => now()->subDays(1)->toIso8601String(),
                'priority' => 'medium',
                'read' => true,
                'actionUrl' => '/dashboard/staff/agendas',
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

        return Inertia::render('Dashboard/Staff/Notifications/Index', [
            'notifications' => $notifications,
            'stats' => $stats,
        ]);
    }
}