<?php

namespace App\Http\Controllers;

use App\Models\InternalMessage;
use App\Models\Office;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class InternalMessageController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    protected function threadRoot(InternalMessage $message): InternalMessage
    {
        $current = $message;
        while ($current->parent_id) {
            $current = InternalMessage::query()->findOrFail($current->parent_id);
        }

        return $current;
    }

    public function staffIndex(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'STAFF', 403);
        $office = $user->office;
        abort_unless($office, 403);

        $inboxRoots = InternalMessage::inboxRootsForUser($user)->limit(50)->get();
        $inboxDirectReplies = InternalMessage::inboxDirectRepliesForUser($user, 30)
            ->with(['sender.office', 'parent.sender'])
            ->get();

        $officeUsers = User::query()
            ->where('office_id', $office->id)
            ->where('id', '!=', $user->id)
            ->where('active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role']);

        $sent = InternalMessage::query()
            ->whereNull('parent_id')
            ->where('sender_id', $user->id)
            ->with(['recipientUser', 'recipientOffice', 'replies.sender'])
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return Inertia::render('Dashboard/Staff/Messages/Index', [
            'officeUsers' => $officeUsers,
            'inboxRoots' => $inboxRoots,
            'inboxDirectReplies' => $inboxDirectReplies,
            'sent' => $sent,
        ]);
    }

    public function staffStore(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'STAFF', 403);
        $office = $user->office;
        abort_unless($office, 403);

        $validated = $request->validate([
            'subject' => 'nullable|string|max:255',
            'body' => 'required|string|max:20000',
            'delivery_type' => 'required|in:office_broadcast,direct_user',
            'recipient_user_id' => 'nullable|uuid|exists:users,id',
        ]);

        $payload = [
            'sender_id' => $user->id,
            'subject' => $validated['subject'] ?? null,
            'body' => $validated['body'],
            'delivery_type' => $validated['delivery_type'],
            'recipient_user_id' => null,
            'recipient_office_id' => null,
        ];

        if ($validated['delivery_type'] === InternalMessage::DELIVERY_OFFICE_BROADCAST) {
            $payload['recipient_office_id'] = $office->id;
        }

        if ($validated['delivery_type'] === InternalMessage::DELIVERY_DIRECT_USER) {
            if (empty($validated['recipient_user_id'])) {
                return redirect()->back()->withErrors(['recipient_user_id' => 'Select a user.'])->withInput();
            }
            $recipient = User::findOrFail($validated['recipient_user_id']);
            if ((string) $recipient->office_id !== (string) $office->id) {
                return redirect()->back()->withErrors(['recipient_user_id' => 'You can only message users in your office.'])->withInput();
            }
            $payload['recipient_user_id'] = $recipient->id;
        }

        InternalMessage::create($payload);

        return redirect()->route('staff.messages.index')->with('success', 'Message sent.');
    }

    public function viewerIndex(Request $request)
    {
        $user = $request->user();
        abort_unless($user && $user->role === 'VIEWER', 403);

        $inboxRoots = InternalMessage::inboxRootsForUser($user)
            ->limit(50)
            ->get();

        $inboxDirectReplies = InternalMessage::inboxDirectRepliesForUser($user, 40)
            ->whereHas('sender', function ($sq) use ($user) {
                $sq->where('role', 'ADMIN')
                    ->orWhere(function ($oq) use ($user) {
                        $oq->whereIn('role', ['HEAD', 'STAFF'])
                            ->where('office_id', $user->office_id);
                    });
            })
            ->with(['sender.office', 'parent.sender'])
            ->get();

        $sent = InternalMessage::query()
            ->where('sender_id', $user->id)
            ->with(['recipientUser', 'recipientOffice', 'parent.sender'])
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return Inertia::render('Dashboard/Viewer/Messages/Index', [
            'inboxRoots' => $inboxRoots,
            'inboxDirectReplies' => $inboxDirectReplies,
            'sent' => $sent,
            'eligibleRecipients' => $this->eligibleViewerMessageRecipients($user),
            'categories' => InternalMessage::CATEGORIES,
        ]);
    }

    public function viewerStore(Request $request)
    {
        $user = $request->user();
        abort_unless($user && $user->role === 'VIEWER', 403);

        $validated = $request->validate([
            'recipient_user_id' => ['required', 'uuid', 'exists:users,id'],
            'body' => ['required', 'string', 'max:20000'],
            'category' => ['required', 'in:FEEDBACK,REQUEST,ACKNOWLEDGMENT,COMMENT,INQUIRY'],
            'parent_id' => ['nullable', 'uuid', 'exists:internal_messages,id'],
        ]);

        $recipient = User::query()->findOrFail($validated['recipient_user_id']);
        $this->assertViewerMessageRecipient($user, $recipient);

        $parentId = null;
        if (! empty($validated['parent_id'])) {
            $parent = InternalMessage::query()->findOrFail($validated['parent_id']);
            abort_unless($parent->userCanView($user), 403);
            $parentId = $this->threadRoot($parent)->id;
        }

        InternalMessage::create([
            'sender_id' => $user->id,
            'parent_id' => $parentId,
            'subject' => null,
            'body' => $validated['body'],
            'delivery_type' => InternalMessage::DELIVERY_DIRECT_USER,
            'recipient_user_id' => $recipient->id,
            'recipient_office_id' => null,
            'category' => $validated['category'],
        ]);

        return redirect()->route('viewer.messages.index')->with('success', 'Message sent.');
    }

    public function headIndex(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'HEAD', 403);

        $office = $user->office;
        abort_unless($office, 403);

        $officeUsers = User::query()
            ->where('office_id', $office->id)
            ->where('id', '!=', $user->id)
            ->where('active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role']);

        $inboxRoots = InternalMessage::inboxRootsForUser($user)->limit(50)->get();
        $inboxDirectReplies = InternalMessage::inboxDirectRepliesForUser($user, 30)
            ->with(['sender.office', 'parent.sender'])
            ->get();

        $sent = InternalMessage::query()
            ->whereNull('parent_id')
            ->where('sender_id', $user->id)
            ->with(['recipientUser', 'recipientOffice', 'replies.sender'])
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return Inertia::render('Dashboard/Head/Messages/Index', [
            'officeUsers' => $officeUsers,
            'inboxRoots' => $inboxRoots,
            'inboxDirectReplies' => $inboxDirectReplies,
            'sent' => $sent,
        ]);
    }

    public function headStore(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'HEAD', 403);
        $office = $user->office;
        abort_unless($office, 403);

        $validated = $request->validate([
            'subject' => 'nullable|string|max:255',
            'body' => 'required|string|max:20000',
            'delivery_type' => 'required|in:office_broadcast,direct_user,all_admins',
            'recipient_user_id' => 'nullable|uuid|exists:users,id',
        ]);

        $payload = [
            'sender_id' => $user->id,
            'subject' => $validated['subject'] ?? null,
            'body' => $validated['body'],
            'delivery_type' => $validated['delivery_type'],
            'recipient_user_id' => null,
            'recipient_office_id' => null,
        ];

        if ($validated['delivery_type'] === 'office_broadcast') {
            $payload['recipient_office_id'] = $office->id;
        }

        if ($validated['delivery_type'] === 'direct_user') {
            if (empty($validated['recipient_user_id'])) {
                return redirect()->back()->withErrors(['recipient_user_id' => 'Select a user.'])->withInput();
            }
            $recipient = User::findOrFail($validated['recipient_user_id']);
            if ((string) $recipient->office_id !== (string) $office->id) {
                return redirect()->back()->withErrors(['recipient_user_id' => 'You can only message users in your office.'])->withInput();
            }
            $payload['recipient_user_id'] = $recipient->id;
        }

        InternalMessage::create($payload);

        return redirect()->route('head.messages.index')->with('success', 'Message sent.');
    }

    public function adminIndex(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'ADMIN', 403);

        $inboxRoots = InternalMessage::inboxRootsForUser($user)->limit(80)->get();
        $inboxDirectReplies = InternalMessage::inboxDirectRepliesForUser($user, 40)
            ->with(['sender.office', 'parent.sender'])
            ->get();

        $fromHeads = $inboxRoots->filter(function (InternalMessage $m) {
            return $m->sender && $m->sender->role === 'HEAD';
        })->values();

        $heads = User::query()
            ->where('role', 'HEAD')
            ->where('active', true)
            ->with('office')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'office_id']);

        $offices = Office::orderBy('name')->get(['id', 'name']);

        $usersForPicker = User::query()
            ->where('active', true)
            ->with('office')
            ->orderBy('name')
            ->limit(500)
            ->get(['id', 'name', 'email', 'role', 'office_id']);

        $sent = InternalMessage::query()
            ->whereNull('parent_id')
            ->where('sender_id', $user->id)
            ->with(['recipientUser', 'recipientOffice', 'replies.sender'])
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return Inertia::render('Dashboard/Admin/Messages/Index', [
            'inboxRoots' => $inboxRoots,
            'inboxDirectReplies' => $inboxDirectReplies,
            'fromHeads' => $fromHeads,
            'heads' => $heads,
            'offices' => $offices,
            'usersForPicker' => $usersForPicker,
            'sent' => $sent,
        ]);
    }

    public function adminStore(Request $request)
    {
        $user = $request->user();
        abort_unless($user->role === 'ADMIN', 403);

        $validated = $request->validate([
            'subject' => 'nullable|string|max:255',
            'body' => 'required|string|max:20000',
            'delivery_type' => 'required|in:direct_user,office_broadcast,office_heads_only',
            'recipient_user_id' => 'nullable|uuid|exists:users,id',
            'recipient_office_id' => 'nullable|uuid|exists:offices,id',
        ]);

        $payload = [
            'sender_id' => $user->id,
            'subject' => $validated['subject'] ?? null,
            'body' => $validated['body'],
            'delivery_type' => $validated['delivery_type'],
            'recipient_user_id' => null,
            'recipient_office_id' => null,
        ];

        if ($validated['delivery_type'] === 'direct_user') {
            if (empty($validated['recipient_user_id'])) {
                return redirect()->back()->withErrors(['recipient_user_id' => 'Select a user.'])->withInput();
            }
            $payload['recipient_user_id'] = $validated['recipient_user_id'];
        } elseif (in_array($validated['delivery_type'], ['office_broadcast', 'office_heads_only'], true)) {
            if (empty($validated['recipient_office_id'])) {
                return redirect()->back()->withErrors(['recipient_office_id' => 'Select an office.'])->withInput();
            }
            $payload['recipient_office_id'] = $validated['recipient_office_id'];
        }

        InternalMessage::create($payload);

        return redirect()->route('admin.messages.index')->with('success', 'Message sent.');
    }

    public function reply(Request $request, InternalMessage $internalMessage)
    {
        $user = $request->user();
        $root = $this->threadRoot($internalMessage);

        if (! $root->userCanReply($user)) {
            abort(403);
        }

        $rules = [
            'body' => ['required', 'string', 'max:20000'],
        ];
        if ($user->role === 'VIEWER') {
            $rules['category'] = ['required', 'in:FEEDBACK,REQUEST,ACKNOWLEDGMENT,COMMENT,INQUIRY'];
        } else {
            $rules['category'] = ['nullable', 'in:FEEDBACK,REQUEST,ACKNOWLEDGMENT,COMMENT,INQUIRY'];
        }

        $validated = $request->validate($rules);

        if ($root->delivery_type === InternalMessage::DELIVERY_ALL_ADMINS && $user->role !== 'ADMIN') {
            return redirect()->back()->with('error', 'Only administrators can reply in this thread.');
        }

        $recipientId = match ($root->delivery_type) {
            InternalMessage::DELIVERY_DIRECT_USER => $user->id === $root->sender_id
                ? $root->recipient_user_id
                : $root->sender_id,
            InternalMessage::DELIVERY_ALL_ADMINS => $root->sender_id,
            default => $root->sender_id,
        };

        if (! $recipientId || $recipientId === $user->id) {
            return redirect()->back()->with('error', 'Use the compose form for this type of message.');
        }

        InternalMessage::create([
            'sender_id' => $user->id,
            'parent_id' => $root->id,
            'subject' => null,
            'body' => $validated['body'],
            'delivery_type' => InternalMessage::DELIVERY_DIRECT_USER,
            'recipient_user_id' => $recipientId,
            'recipient_office_id' => null,
            'category' => $validated['category'] ?? null,
        ]);

        $redirect = match ($user->role) {
            'ADMIN' => route('admin.messages.index'),
            'HEAD' => route('head.messages.index'),
            'STAFF' => route('staff.messages.index'),
            'VIEWER' => route('viewer.messages.index'),
            default => null,
        };

        if ($redirect === null) {
            return redirect()->back()->with('success', 'Reply sent.');
        }

        return redirect()->to($redirect)->with('success', 'Reply sent.');
    }

    /**
     * @return array<int, array{id: string, name: string, email: string|null, role: string}>
     */
    protected function eligibleViewerMessageRecipients(User $viewer): array
    {
        $admins = User::query()
            ->where('role', 'ADMIN')
            ->where('active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role']);

        $officePeers = collect();
        if ($viewer->office_id) {
            $officePeers = User::query()
                ->where('office_id', $viewer->office_id)
                ->whereIn('role', ['HEAD', 'STAFF'])
                ->where('id', '!=', $viewer->id)
                ->where('active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'role']);
        }

        return $admins->merge($officePeers)->unique('id')->values()->all();
    }

    protected function assertViewerMessageRecipient(User $viewer, User $recipient): void
    {
        if ($recipient->role === 'ADMIN') {
            return;
        }

        if (
            $viewer->office_id
            && (string) $recipient->office_id === (string) $viewer->office_id
            && in_array($recipient->role, ['HEAD', 'STAFF'], true)
        ) {
            return;
        }

        throw ValidationException::withMessages([
            'recipient_user_id' => ['You can only message administrators or heads and staff in your office.'],
        ]);
    }
}
