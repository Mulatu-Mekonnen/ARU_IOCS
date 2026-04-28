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
        $query = Agenda::with(['createdBy', 'senderOffice', 'receiverOffice', 'currentOffice', 'approvalHistories']);

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
            $query->where('current_office_id', $request->office);
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
        $agenda->load(['createdBy', 'senderOffice', 'receiverOffice', 'currentOffice', 'approvalHistories.actionBy']);

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

        $validated['created_by_id'] = $request->user()->id;
        $validated['sender_office_id'] = $request->user()->office_id;
        $validated['current_office_id'] = $request->user()->office_id;
        $validated['status'] = 'PENDING';

        Agenda::create($validated);

        return redirect()->route('staff.agendas.create')->with('success', 'Agenda created successfully');
    }

    public function update(Request $request, Agenda $agenda)
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject,forward',
            'receiver_office_id' => 'nullable|exists:offices,id',
        ]);

        $action = $validated['action'];

        if ($action === 'forward' && empty($validated['receiver_office_id'])) {
            return redirect()->back()->with('error', 'Please select a receiver office to forward.');
        }

        if ($action === 'approve') {
            $agenda->update([
                'status' => 'APPROVED',
                'approved_by_id' => $request->user()->id,
            ]);
        }

        if ($action === 'reject') {
            $agenda->update([
                'status' => 'REJECTED',
                'approved_by_id' => $request->user()->id,
            ]);
        }

        if ($action === 'forward') {
            $agenda->update([
                'status' => 'FORWARDED',
                'receiver_office_id' => $validated['receiver_office_id'],
                'current_office_id' => $validated['receiver_office_id'],
                'approved_by_id' => $request->user()->id,
            ]);
        }

        return redirect()->back()->with('success', 'Agenda action completed successfully.');
    }
}