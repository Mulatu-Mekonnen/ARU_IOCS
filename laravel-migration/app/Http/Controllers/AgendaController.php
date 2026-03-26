<?php

namespace App\Http\Controllers;

use App\Models\Agenda;
use App\Models\Office;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgendaController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $query = Agenda::with(['user', 'office', 'approvals']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Office filter
        if ($request->has('office') && $request->office) {
            $query->where('office_id', $request->office);
        }

        // Status filter
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $agendas = $query->paginate(10);

        $offices = Office::all();

        return Inertia::render('Dashboard/Admin/Agendas/Index', [
            'agendas' => $agendas,
            'offices' => $offices,
            'filters' => $request->only(['search', 'office', 'status']),
        ]);
    }

    public function show(Agenda $agenda)
    {
        $agenda->load(['user', 'office', 'approvals.user']);

        return Inertia::render('Dashboard/Admin/Agendas/Show', [
            'agenda' => $agenda,
        ]);
    }

    public function create(Request $request)
    {
        $offices = Office::all();

        return Inertia::render('Dashboard/Staff/Agendas/Create', [
            'offices' => $offices,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'receiver_office_id' => 'required|exists:offices,id',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['office_id'] = $request->user()->office_id;
        $validated['status'] = 'PENDING';

        Agenda::create($validated);

        return redirect()->route('staff.agendas.create')->with('success', 'Agenda created successfully');
    }
}