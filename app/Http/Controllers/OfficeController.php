<?php

namespace App\Http\Controllers;

use App\Models\Office;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OfficeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $offices = Office::with('users')->get();

        return Inertia::render('Dashboard/Admin/Offices/Index', [
            'offices' => $offices,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:offices,name',
        ]);

        Office::create($validated);

        return redirect()->route('admin.offices.index')->with('success', 'Office created successfully');
    }

    public function update(Request $request, Office $office)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:offices,name,' . $office->id,
        ]);

        $office->update($validated);

        return redirect()->route('admin.offices.index')->with('success', 'Office updated successfully');
    }

    public function destroy(Office $office)
    {
        $office->delete();

        return redirect()->route('admin.offices.index')->with('success', 'Office deleted successfully');
    }
}