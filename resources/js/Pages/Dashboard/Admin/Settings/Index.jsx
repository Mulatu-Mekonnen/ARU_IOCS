import React from 'react';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { ShieldCheck, Mail, ToggleRight, FileText, Settings, AlertTriangle } from "lucide-react";

export default function Index({ settings: initialSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNumberChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: Math.max(1, parseInt(value) || 0) }));
  };

  const saveSettings = () => {
    setSaving(true);
    router.post('/dashboard/admin/settings', settings, {
      onSuccess: () => setSaving(false),
      onError: () => setSaving(false),
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure system preferences and security options. Changes are applied immediately.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Security Settings */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                <p className="text-gray-600 mt-1">Manage authentication and access policies.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">Require two-factor authentication</div>
                  <div className="text-sm text-gray-600">Help protect accounts with an additional verification step.</div>
                </div>
                <button
                  onClick={() => toggle("require2FA")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                    settings.require2FA
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  <ToggleRight className="w-5 h-5" />
                  {settings.require2FA ? "Enabled" : "Disabled"}
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">Allow guest access</div>
                  <div className="text-sm text-gray-600">Permit read-only access for external reviewers.</div>
                </div>
                <button
                  onClick={() => toggle("allowGuestAccess")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                    settings.allowGuestAccess
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  <ToggleRight className="w-5 h-5" />
                  {settings.allowGuestAccess ? "Enabled" : "Disabled"}
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">Allow user registration</div>
                  <div className="text-sm text-gray-600">Enable self-registration for new users.</div>
                </div>
                <button
                  onClick={() => toggle("allowUserRegistration")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                    settings.allowUserRegistration
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  <ToggleRight className="w-5 h-5" />
                  {settings.allowUserRegistration ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>
          </div>

          {/* Workflow Settings */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <Settings className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Workflow</h2>
                <p className="text-gray-600 mt-1">Configure agenda approval and routing processes.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">Auto-approve agendas</div>
                  <div className="text-sm text-gray-600">Automatically approve agendas from trusted offices.</div>
                </div>
                <button
                  onClick={() => toggle("autoApproveAgendas")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                    settings.autoApproveAgendas
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  <ToggleRight className="w-5 h-5" />
                  {settings.autoApproveAgendas ? "Enabled" : "Disabled"}
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">Require approval for all</div>
                  <div className="text-sm text-gray-600">All agendas must go through approval process.</div>
                </div>
                <button
                  onClick={() => toggle("requireApprovalForAll")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                    settings.requireApprovalForAll
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  <ToggleRight className="w-5 h-5" />
                  {settings.requireApprovalForAll ? "Enabled" : "Disabled"}
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">Require office approval</div>
                  <div className="text-sm text-gray-600">Agendas need office-level approval before routing.</div>
                </div>
                <button
                  onClick={() => toggle("requireOfficeApproval")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                    settings.requireOfficeApproval
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  <ToggleRight className="w-5 h-5" />
                  {settings.requireOfficeApproval ? "Enabled" : "Disabled"}
                </button>
              </div>

              <div className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Default approval deadline</div>
                    <div className="text-sm text-gray-600">Days allowed for agenda approval.</div>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.defaultApprovalDeadline}
                    onChange={(e) => handleNumberChange("defaultApprovalDeadline", e.target.value)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* File Settings */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <FileText className="w-6 h-6 text-green-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Files</h2>
                <p className="text-gray-600 mt-1">Manage file upload and storage settings.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">Allow file uploads</div>
                  <div className="text-sm text-gray-600">Enable attachment uploads for agendas.</div>
                </div>
                <button
                  onClick={() => toggle("allowFileUploads")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                    settings.allowFileUploads
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  <ToggleRight className="w-5 h-5" />
                  {settings.allowFileUploads ? "Enabled" : "Disabled"}
                </button>
              </div>

              <div className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Maximum file size</div>
                    <div className="text-sm text-gray-600">Maximum file size in MB for uploads.</div>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.maxFileSize}
                    onChange={(e) => handleNumberChange("maxFileSize", e.target.value)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Settings */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                <p className="text-gray-600 mt-1">Control how system notifications are delivered.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">Email notifications</div>
                  <div className="text-sm text-gray-600">Send email alerts for activity and updates.</div>
                </div>
                <button
                  onClick={() => toggle("emailNotifications")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                    settings.emailNotifications
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  <ToggleRight className="w-5 h-5" />
                  {settings.emailNotifications ? "Enabled" : "Disabled"}
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">Email alerts</div>
                  <div className="text-sm text-gray-600">Send urgent alerts for critical system events.</div>
                </div>
                <button
                  onClick={() => toggle("enableEmailAlerts")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                    settings.enableEmailAlerts
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  <ToggleRight className="w-5 h-5" />
                  {settings.enableEmailAlerts ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">System</h2>
                <p className="text-gray-600 mt-1">System-wide settings and maintenance options.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">Maintenance mode</div>
                  <div className="text-sm text-gray-600">Put the system in maintenance mode for updates.</div>
                </div>
                <button
                  onClick={() => toggle("maintenanceMode")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                    settings.maintenanceMode
                      ? "bg-red-50 border-red-200 text-red-700"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  <ToggleRight className="w-5 h-5" />
                  {settings.maintenanceMode ? "Active" : "Inactive"}
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">Enable audit logging</div>
                  <div className="text-sm text-gray-600">Log all system activities for compliance.</div>
                </div>
                <button
                  onClick={() => toggle("enableAuditLogging")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                    settings.enableAuditLogging
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  <ToggleRight className="w-5 h-5" />
                  {settings.enableAuditLogging ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}