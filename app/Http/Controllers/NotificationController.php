<?php

namespace App\Http\Controllers;

use App\Models\Agenda;
use App\Models\Announcement;
use App\Models\NotificationRead;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $agendaNotifications = Agenda::with(['createdBy', 'senderOffice'])
            ->latest('updated_at')
            ->take(12)
            ->get()
            ->map(function ($agenda) {
                $type = 'new_agenda';
                $title = 'New Communication Received';
                $priority = 'high';

                if ($agenda->status === 'APPROVED') {
                    $type = 'agenda_approved';
                    $title = 'Communication Approved';
                    $priority = 'medium';
                } elseif ($agenda->status === 'REJECTED') {
                    $type = 'agenda_rejected';
                    $title = 'Communication Rejected';
                    $priority = 'high';
                } elseif ($agenda->status === 'FORWARDED') {
                    $type = 'agenda_forwarded';
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
                    'actionUrl' => '/dashboard/admin/agendas',
                    'metadata' => null,
                ];
            });

        $userNotifications = User::latest('created_at')
            ->take(6)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => 'user-' . $user->id,
                    'type' => 'new_user',
                    'title' => 'New User Registration',
                    'message' => sprintf('New user created: %s (%s)', $user->name, $user->email),
                    'priority' => 'low',
                    'timestamp' => optional($user->created_at)?->toIso8601String(),
                    'read' => false,
                    'actionUrl' => '/dashboard/admin/users',
                    'metadata' => null,
                ];
            });

        $announcementNotifications = Announcement::with('author')
            ->latest('created_at')
            ->take(6)
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
                    'actionUrl' => '/dashboard/admin/announcements',
                    'metadata' => null,
                ];
            });

        $notifications = $agendaNotifications
            ->concat($userNotifications)
            ->concat($announcementNotifications)
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

        return Inertia::render('Dashboard/Admin/Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function markRead(Request $request)
    {
        $validated = $request->validate([
            'notification_id' => 'required|string',
        ]);

        NotificationRead::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'notification_id' => $validated['notification_id'],
            ],
            [
                'read_at' => now(),
            ]
        );

        return back();
    }

    public function markAllRead(Request $request)
    {
        $validated = $request->validate([
            'notification_ids' => 'required|array',
            'notification_ids.*' => 'string',
        ]);

        foreach ($validated['notification_ids'] as $id) {
            NotificationRead::updateOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'notification_id' => $id,
                ],
                [
                    'read_at' => now(),
                ]
            );
        }

        return back();
    }
}