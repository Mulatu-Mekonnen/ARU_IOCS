<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        // Sample audit logs data
        $logs = [
            [
                'id' => 1,
                'timestamp' => now()->subHours(2)->toIso8601String(),
                'user' => 'John Doe',
                'userRole' => 'ADMIN',
                'action' => 'Created User',
                'category' => 'User Management',
                'details' => 'User john.smith@example.com was created',
            ],
            [
                'id' => 2,
                'timestamp' => now()->subHours(4)->toIso8601String(),
                'user' => 'Jane Smith',
                'userRole' => 'HEAD',
                'action' => 'Approved Agenda',
                'category' => 'Approval',
                'details' => 'Agenda #12 was approved and forwarded',
            ],
            [
                'id' => 3,
                'timestamp' => now()->subHours(6)->toIso8601String(),
                'user' => 'Admin User',
                'userRole' => 'ADMIN',
                'action' => 'Created Office',
                'category' => 'Office Management',
                'details' => 'New office "Engineering" was created',
            ],
            [
                'id' => 4,
                'timestamp' => now()->subHours(8)->toIso8601String(),
                'user' => 'Staff Member',
                'userRole' => 'STAFF',
                'action' => 'Submitted Communication',
                'category' => 'Communications',
                'details' => 'New communication sent to Engineering office',
            ],
        ];

        return Inertia::render('Dashboard/Admin/AuditLogs/Index', [
            'logs' => $logs,
        ]);
    }
}