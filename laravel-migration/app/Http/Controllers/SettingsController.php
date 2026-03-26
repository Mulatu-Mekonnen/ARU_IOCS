<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $settings = [
            'require2FA' => true,
            'allowGuestAccess' => false,
            'emailNotifications' => true,
            'autoApproveAgendas' => false,
            'requireApprovalForAll' => true,
            'enableAuditLogging' => true,
            'allowFileUploads' => true,
            'maxFileSize' => 10,
            'defaultApprovalDeadline' => 7,
            'enableEmailAlerts' => true,
            'maintenanceMode' => false,
            'allowUserRegistration' => false,
            'requireOfficeApproval' => true,
        ];

        return Inertia::render('Dashboard/Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'require2FA' => 'boolean',
            'allowGuestAccess' => 'boolean',
            'emailNotifications' => 'boolean',
            'autoApproveAgendas' => 'boolean',
            'requireApprovalForAll' => 'boolean',
            'enableAuditLogging' => 'boolean',
            'allowFileUploads' => 'boolean',
            'maxFileSize' => 'integer|min:1|max:100',
            'defaultApprovalDeadline' => 'integer|min:1|max:30',
            'enableEmailAlerts' => 'boolean',
            'maintenanceMode' => 'boolean',
            'allowUserRegistration' => 'boolean',
            'requireOfficeApproval' => 'boolean',
        ]);

        // Store settings in cache or database
        // For now, we'll just return them
        return redirect()->back()->with('success', 'Settings updated successfully');
    }
}