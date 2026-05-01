<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Support\AuditLogger;
use App\Models\Setting;

class SettingsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $defaultSettings = [
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

        // Get settings from database, fallback to defaults
        $settings = Setting::all()->pluck('value', 'key')->toArray();
        $settings = array_merge($defaultSettings, $settings);

        // Convert string values back to appropriate types
        $settings['require2FA'] = filter_var($settings['require2FA'], FILTER_VALIDATE_BOOLEAN);
        $settings['allowGuestAccess'] = filter_var($settings['allowGuestAccess'], FILTER_VALIDATE_BOOLEAN);
        $settings['emailNotifications'] = filter_var($settings['emailNotifications'], FILTER_VALIDATE_BOOLEAN);
        $settings['autoApproveAgendas'] = filter_var($settings['autoApproveAgendas'], FILTER_VALIDATE_BOOLEAN);
        $settings['requireApprovalForAll'] = filter_var($settings['requireApprovalForAll'], FILTER_VALIDATE_BOOLEAN);
        $settings['enableAuditLogging'] = filter_var($settings['enableAuditLogging'], FILTER_VALIDATE_BOOLEAN);
        $settings['allowFileUploads'] = filter_var($settings['allowFileUploads'], FILTER_VALIDATE_BOOLEAN);
        $settings['maxFileSize'] = (int) $settings['maxFileSize'];
        $settings['defaultApprovalDeadline'] = (int) $settings['defaultApprovalDeadline'];
        $settings['enableEmailAlerts'] = filter_var($settings['enableEmailAlerts'], FILTER_VALIDATE_BOOLEAN);
        $settings['maintenanceMode'] = filter_var($settings['maintenanceMode'], FILTER_VALIDATE_BOOLEAN);
        $settings['allowUserRegistration'] = filter_var($settings['allowUserRegistration'], FILTER_VALIDATE_BOOLEAN);
        $settings['requireOfficeApproval'] = filter_var($settings['requireOfficeApproval'], FILTER_VALIDATE_BOOLEAN);

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

        // Store settings in database
        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        AuditLogger::log($request->user(), 'Updated Settings', 'System Settings', 'Updated system settings');
        return redirect()->back()->with('success', 'Settings updated successfully');
    }
}