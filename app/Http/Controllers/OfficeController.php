<?php

namespace App\Http\Controllers;

use App\Models\Office;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Support\AuditLogger;

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

        $office = Office::create($validated);
        AuditLogger::log($request->user(), 'Created Office', 'Office Management', 'Created office "' . $office->name . '"', [
            'office_id' => $office->id,
        ]);

        return redirect()->route('admin.offices.index')->with('success', 'Office created successfully');
    }

    public function update(Request $request, Office $office)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:offices,name,' . $office->id,
        ]);

        $office->update($validated);
        AuditLogger::log($request->user(), 'Updated Office', 'Office Management', 'Updated office "' . $office->name . '"', [
            'office_id' => $office->id,
        ]);

        return redirect()->route('admin.offices.index')->with('success', 'Office updated successfully');
    }

    public function destroy(Office $office)
    {
        $name = $office->name;
        $id = $office->id;
        $office->delete();
        AuditLogger::log(request()->user(), 'Deleted Office', 'Office Management', 'Deleted office "' . $name . '"', [
            'office_id' => $id,
        ]);

        return redirect()->route('admin.offices.index')->with('success', 'Office deleted successfully');
    }
}