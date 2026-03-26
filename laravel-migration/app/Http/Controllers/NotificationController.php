<?php

namespace App\Http\Controllers;

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
        // Sample notifications data
        $notifications = [
            [
                'id' => 1,
                'type' => 'new_agenda',
                'title' => 'New Communication Received',
                'message' => 'A new communication has been submitted from Engineering office',
                'priority' => 'high',
                'timestamp' => now()->subHours(1)->toIso8601String(),
                'read' => false,
                'actionUrl' => '/dashboard/admin/agendas#1',
                'metadata' => null,
            ],
            [
                'id' => 2,
                'type' => 'agenda_approved',
                'title' => 'Communication Approved',
                'message' => 'Communication #5 has been approved by Head of Department',
                'priority' => 'medium',
                'timestamp' => now()->subHours(3)->toIso8601String(),
                'read' => false,
                'actionUrl' => '/dashboard/admin/agendas#5',
                'metadata' => null,
            ],
            [
                'id' => 3,
                'type' => 'new_user',
                'title' => 'New User Registration',
                'message' => 'New user created: Sarah Johnson (sarah.j@example.com)',
                'priority' => 'low',
                'timestamp' => now()->subHours(6)->toIso8601String(),
                'read' => true,
                'actionUrl' => '/dashboard/admin/users',
                'metadata' => null,
            ],
            [
                'id' => 4,
                'type' => 'new_announcement',
                'title' => 'System Announcement Posted',
                'message' => 'New announcement: "System Maintenance Schedule" has been posted',
                'priority' => 'medium',
                'timestamp' => now()->subHours(8)->toIso8601String(),
                'read' => true,
                'actionUrl' => '/dashboard/admin/announcements',
                'metadata' => null,
            ],
            [
                'id' => 5,
                'type' => 'agenda_rejected',
                'title' => 'Communication Rejected',
                'message' => 'Communication #3 has been rejected. Please review comments for more information.',
                'priority' => 'high',
                'timestamp' => now()->subHours(12)->toIso8601String(),
                'read' => true,
                'actionUrl' => '/dashboard/admin/agendas#3',
                'metadata' => [
                    'comment' => 'Missing required signatures. Please resubmit.',
                ],
            ],
        ];

        return Inertia::render('Dashboard/Admin/Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }
}