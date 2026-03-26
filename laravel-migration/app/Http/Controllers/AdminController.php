<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Agenda;
use App\Models\Office;
use Inertia\Inertia;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function dashboard(Request $request)
    {
        $stats = [
            'totalUsers' => User::count(),
            'totalAgendas' => Agenda::count(),
            'pendingAgendas' => Agenda::where('status', 'PENDING')->count(),
            'approvedAgendas' => Agenda::where('status', 'APPROVED')->count(),
            'rejectedAgendas' => Agenda::where('status', 'REJECTED')->count(),
            'forwardedAgendas' => Agenda::where('status', 'FORWARDED')->count(),
            'totalOffices' => Office::count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }
}
