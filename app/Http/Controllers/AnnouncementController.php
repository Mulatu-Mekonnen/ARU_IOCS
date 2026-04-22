<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Support\AuditLogger;

class AnnouncementController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        $announcements = Announcement::with('author')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Dashboard/Admin/Announcements/Index', [
            'announcements' => $announcements,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $validated['id'] = (string) Str::uuid();
        $validated['author_id'] = $request->user()->id;

        $announcement = Announcement::create($validated);
        AuditLogger::log($request->user(), 'Created Announcement', 'Announcements', 'Created announcement "' . $announcement->title . '"', [
            'announcement_id' => $announcement->id,
        ]);

        return redirect()->back()->with('success', 'Announcement created successfully');
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $announcement->update($validated);
        AuditLogger::log($request->user(), 'Updated Announcement', 'Announcements', 'Updated announcement "' . $announcement->title . '"', [
            'announcement_id' => $announcement->id,
        ]);

        return redirect()->back()->with('success', 'Announcement updated successfully');
    }

    public function destroy(Announcement $announcement)
    {
        $title = $announcement->title;
        $id = $announcement->id;
        $announcement->delete();
        AuditLogger::log(request()->user(), 'Deleted Announcement', 'Announcements', 'Deleted announcement "' . $title . '"', [
            'announcement_id' => $id,
        ]);

        return redirect()->back()->with('success', 'Announcement deleted successfully');
    }

    public function apiIndex(Request $request)
    {
        $announcements = Announcement::with('author')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($announcement) {
                return [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'content' => $announcement->content,
                    'createdAt' => $announcement->created_at->toISOString(),
                    'author' => $announcement->author ? ['name' => $announcement->author->name] : null,
                ];
            });

        return response()->json($announcements);
    }
}