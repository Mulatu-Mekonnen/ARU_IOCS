<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Agenda;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $stats = [
            'totalUsers' => User::count(),
            'totalAgendas' => Agenda::count(),
            'pendingAgendas' => Agenda::where('status', 'PENDING')->count(),
        ];

        return Inertia::render('Home', [
            'stats' => $stats,
        ]);
    }
}
