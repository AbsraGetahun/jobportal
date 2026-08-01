<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    // Get all notifications for the authenticated user
    public function index()
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($notifications);
    }

    // Mark a notification as read
    public function markAsRead($id)
    {
        $notification = Notification::where('user_id', Auth::id())->findOrFail($id);
        $notification->is_read = true;
        $notification->save();
        
        return response()->json(['message' => 'Notification marked as read']);
    }

    // Mark all notifications as read
    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())->update(['is_read' => true]);
        
        return response()->json(['message' => 'All notifications marked as read']);
    }

    // Delete a notification
    public function destroy($id)
    {
        $notification = Notification::where('user_id', Auth::id())->findOrFail($id);
        $notification->delete();
        
        return response()->json(['message' => 'Notification deleted']);
    }
}
