<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KanbanController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        if ($user->hasAnyRole(['administrador', 'gerencia'])) {
            $activities = Activity::with(['category', 'user', 'assignedUser'])->latest()->get();
        } else {
            $activities = Activity::with(['category', 'user', 'assignedUser'])
                ->where(function ($query) use ($user) {
                    $query->where('assigned_user_id', $user->id) // Tareas que le asignaron los jefes
                    ->orWhere('user_id', $user->id);       // Tareas personales que él mismo creó
                })
                ->latest()
                ->get();
        }

        $categories = Category::all();
        $users = \App\Models\User::select('id', 'name')->get();

        return Inertia::render('Kanban/Board', [
            'activities' => $activities,
            'categories' => $categories,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'priority' => 'required|in:low,medium,high',
            'category_id' => 'required|exists:categories,id',
        ]);
        $validated['user_id'] = auth()->id() ?? 1;

        $validated['status'] = 'todo';

        Activity::create($validated);

        return redirect()->back();
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:todo,in_progress,done',
        ]);

        $activity = Activity::findOrFail($id);
        $activity->status = $request->input('status');
        $activity->save();

        return redirect()->back(); // Inertia recargará los datos automáticamente
    }

    public function updatePriority(Request $request, $id)
    {
        $request->validate([
            'priority' => 'required|in:low,medium,high',
        ]);

        $activity = Activity::findOrFail($id);
        $activity->priority = $request->input('priority');
        $activity->save();

        return redirect()->back(); // Inertia refrescará los datos sin recargar la página
    }

    public function updateTitle(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $activity = Activity::findOrFail($id);
        $activity->title = $request->input('title');
        $activity->save();

        return redirect()->back();
    }

    public function assignUser(Request $request, $id)
    {
        // Doble seguridad en el backend: si no tiene el rol, bloqueamos la acción
        if (!auth()->user()->hasAnyRole(['administrador', 'gerencia'])) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $activity = Activity::findOrFail($id);
        $activity->update([
            'assigned_user_id' => $request->assigned_user_id
        ]);

        return redirect()->back();
    }

    public function destroy($id)
    {
        $activity = Activity::findOrFail($id);
        $user = auth()->user();

        if ($user->hasAnyRole(['administrador', 'gerencia']) || $activity->user_id === $user->id) {
            $activity->delete();
            return redirect()->back();
        }

        abort(403, 'No tienes permiso para eliminar esta actividad.');
    }
}
