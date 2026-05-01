<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\HeadController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OfficeController;
use App\Http\Controllers\AgendaController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\ViewerController;

Route::get('/', [HomeController::class, 'index']);

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/forgot-password', [AuthController::class, 'showForgotPasswordForm'])->name('password.request');
    Route::post('/forgot-password', [AuthController::class, 'sendResetLinkEmail'])->name('password.email');
    Route::get('/reset-password/{token}', [AuthController::class, 'showResetPasswordForm'])->name('password.reset');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.update');
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard/admin', [AdminController::class, 'dashboard']);
    Route::get('/dashboard/admin/users', [UserController::class, 'index'])->name('admin.users.index');
    Route::post('/dashboard/admin/users', [UserController::class, 'store'])->name('admin.users.store');
    Route::put('/dashboard/admin/users/{user}', [UserController::class, 'update'])->name('admin.users.update');
    Route::delete('/dashboard/admin/users/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');
    Route::get('/dashboard/admin/offices', [OfficeController::class, 'index'])->name('admin.offices.index');
    Route::post('/dashboard/admin/offices', [OfficeController::class, 'store'])->name('admin.offices.store');
    Route::put('/dashboard/admin/offices/{office}', [OfficeController::class, 'update'])->name('admin.offices.update');
    Route::delete('/dashboard/admin/offices/{office}', [OfficeController::class, 'destroy'])->name('admin.offices.destroy');
    Route::get('/dashboard/admin/agendas', [AgendaController::class, 'index'])->name('admin.agendas.index');
    Route::get('/dashboard/admin/agendas/{agenda}', [AgendaController::class, 'show'])->name('admin.agendas.show');
    Route::put('/dashboard/admin/agendas/{agenda}', [AgendaController::class, 'update'])->name('admin.agendas.update');
    Route::get('/dashboard/admin/announcements', [AnnouncementController::class, 'index'])->name('admin.announcements.index');
    Route::post('/dashboard/admin/announcements', [AnnouncementController::class, 'store'])->name('admin.announcements.store');
    Route::put('/dashboard/admin/announcements/{announcement}', [AnnouncementController::class, 'update'])->name('admin.announcements.update');
    Route::delete('/dashboard/admin/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('admin.announcements.destroy');
    Route::get('/dashboard/admin/reports', [ReportController::class, 'index'])->name('admin.reports.index');
    Route::get('/dashboard/admin/audit-logs', [AuditLogController::class, 'index'])->name('admin.audit-logs.index');
    Route::get('/dashboard/admin/notifications', [NotificationController::class, 'index'])->name('admin.notifications.index');
    // API endpoint for frontend announcement components (Inertia/JS)
    Route::get('/api/announcements', [AnnouncementController::class, 'apiIndex'])->name('api.announcements');
    Route::get('/dashboard/admin/settings', [SettingsController::class, 'index'])->name('admin.settings.index');
    Route::post('/dashboard/admin/settings', [SettingsController::class, 'update'])->name('admin.settings.update');
    Route::get('/dashboard/head', [HeadController::class, 'dashboard']);
    Route::get('/dashboard/head/agendas', [HeadController::class, 'agendas'])->name('head.agendas.index');
    Route::get('/dashboard/head/pending', [HeadController::class, 'pending'])->name('head.pending.index');
    Route::patch('/dashboard/head/pending/{agenda}', [HeadController::class, 'review'])->name('head.pending.review');
    Route::get('/dashboard/head/reports', [HeadController::class, 'reports'])->name('head.reports.index');
    Route::get('/dashboard/head/archive', [HeadController::class, 'archive'])->name('head.archive.index');
    Route::get('/dashboard/head/notifications', [HeadController::class, 'notifications'])->name('head.notifications.index');
    Route::get('/dashboard/head/staff', [HeadController::class, 'staff'])->name('head.staff.index');
    Route::get('/dashboard/staff', [StaffController::class, 'dashboard']);
    Route::get('/dashboard/staff/agendas', [StaffController::class, 'agendas'])->name('staff.agendas.index');
    Route::get('/dashboard/staff/agendas/create', [AgendaController::class, 'create'])->name('staff.agendas.create');
    Route::post('/dashboard/staff/agendas', [AgendaController::class, 'store'])->name('staff.agendas.store');
    Route::get('/dashboard/staff/inbox', [StaffController::class, 'inbox'])->name('staff.inbox.index');
    Route::get('/dashboard/staff/sent', [StaffController::class, 'sent'])->name('staff.sent.index');
    Route::get('/dashboard/staff/archive', [StaffController::class, 'archive'])->name('staff.archive.index');
    Route::get('/dashboard/staff/notifications', [StaffController::class, 'notifications'])->name('staff.notifications.index');
    Route::get('/dashboard/viewer', [ViewerController::class, 'dashboard']);
    Route::get('/dashboard/viewer/inbox', [ViewerController::class, 'inbox'])->name('viewer.inbox.index');
    Route::get('/dashboard/viewer/archive', [ViewerController::class, 'archive'])->name('viewer.archive.index');
    Route::get('/dashboard/viewer/announcements', [ViewerController::class, 'announcements'])->name('viewer.announcements.index');
    Route::get('/dashboard/viewer/notifications', [ViewerController::class, 'notifications'])->name('viewer.notifications.index');
    Route::get('/profile', [UserController::class, 'profile'])->name('profile.index');
    Route::put('/profile', [UserController::class, 'updateProfile'])->name('profile.update');
    // Shared notification routes for all authenticated users
    Route::post('/dashboard/notifications/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/dashboard/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.readAll');
});
