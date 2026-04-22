<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Inertia\Inertia;
use App\Support\AuditLogger;

class AuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user && Hash::check($request->password, $user->password)) {
            Auth::login($user);
            $request->session()->regenerate();

            // Debug: Log authentication success
            \Log::info('User logged in: ' . $user->email . ' with role: ' . $user->role . ' and session=' . $request->session()->getId());
            \Log::info('Post-login Auth check: ' . (Auth::check() ? 'true' : 'false'));
            AuditLogger::log($user, 'User Login', 'Authentication', 'User logged in successfully');

            $dashboardUrl = match ($user->role) {
                'ADMIN' => '/dashboard/admin',
                'HEAD' => '/dashboard/head',
                'VIEWER' => '/dashboard/viewer',
                default => '/dashboard/staff',
            };

            // Same-origin SPA redirect: use a normal redirect so Inertia follows with one visit (no 409 + full reload).
            return redirect()->intended($dashboardUrl);
        }

        return back()->withErrors(['email' => 'Invalid credentials']);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        AuditLogger::log($user, 'User Logout', 'Authentication', 'User logged out');
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
