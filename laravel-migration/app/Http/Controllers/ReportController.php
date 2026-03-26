<?php

namespace App\Http\Controllers;

use App\Models\Agenda;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $summary = [
            'totalAgendas' => Agenda::count(),
            'pendingAgendas' => Agenda::where('status', 'PENDING')->count(),
            'approvedAgendas' => Agenda::where('status', 'APPROVED')->count(),
            'rejectedAgendas' => Agenda::where('status', 'REJECTED')->count(),
        ];

        // Sample reports data
        $recentReports = [
            [
                'id' => 1,
                'name' => 'Monthly Agenda Summary',
                'owner' => 'System',
                'createdAt' => now()->subDays(5)->format('Y-m-d H:i'),
            ],
            [
                'id' => 2,
                'name' => 'User Activity Report',
                'owner' => 'Admin',
                'createdAt' => now()->subDays(10)->format('Y-m-d H:i'),
            ],
            [
                'id' => 3,
                'name' => 'Office Statistics',
                'owner' => 'System',
                'createdAt' => now()->subDays(15)->format('Y-m-d H:i'),
            ],
        ];

        return Inertia::render('Dashboard/Admin/Reports/Index', [
            'summary' => $summary,
            'reports' => $recentReports,
        ]);
    }
}