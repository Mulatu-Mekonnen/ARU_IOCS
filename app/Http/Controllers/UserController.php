<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Office;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use App\Support\AuditLogger;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $query = User::with('office');

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Role filter
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        // Status filter
        if ($request->has('status') && $request->status) {
            $query->where('active', $request->status === 'active');
        }

        $users = $query->paginate(10);

        $offices = Office::all();

        return Inertia::render('Dashboard/Admin/Users/Index', [
            'users' => $users,
            'offices' => $offices,
            'filters' => $request->only(['search', 'role', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $request->merge([
            'office_id' => $request->filled('office_id') ? $request->office_id : null,
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:ADMIN,HEAD,STAFF,VIEWER',
            'office_id' => 'nullable|exists:offices,id',
            'active' => 'boolean',
        ]);

        $validated['password'] = Hash::make($validated['password'] ?? 'password123');
        $validated['active'] = $validated['active'] ?? true;

        $user = User::create($validated);
        AuditLogger::log($request->user(), 'Created User', 'User Management', 'Created user ' . $user->email, [
            'target_user_id' => $user->id,
        ]);

        return redirect()->back()->with('success', 'User created successfully');
    }

    public function update(Request $request, User $user)
    {
        $request->merge([
            'office_id' => $request->filled('office_id') ? $request->office_id : null,
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:ADMIN,HEAD,STAFF,VIEWER',
            'office_id' => 'nullable|exists:offices,id',
            'active' => 'boolean',
        ]);

        if ($validated['password']) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);
        AuditLogger::log($request->user(), 'Updated User', 'User Management', 'Updated user ' . $user->email, [
            'target_user_id' => $user->id,
        ]);

        return redirect()->back()->with('success', 'User updated successfully');
    }

    public function destroy(User $user)
    {
        $email = $user->email;
        $id = $user->id;
        $user->delete();
        AuditLogger::log(request()->user(), 'Deleted User', 'User Management', 'Deleted user ' . $email, [
            'target_user_id' => $id,
        ]);

        return redirect()->back()->with('success', 'User deleted successfully');
    }
}