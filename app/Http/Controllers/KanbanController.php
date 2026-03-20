<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;

class KanbanController extends Controller
{
    public function index(Request $request) // <-- Agregamos Request $request
    {
        $user = auth()->user();

        // Verificamos roles y permisos
        $isAdminOrManager = $user->hasAnyRole(['administrador', 'gerencia']);
        $canViewGerencia = $user->hasPermissionTo('view activities gerencia');

        // Capturamos el ID del usuario que se quiere filtrar
        $selectedUserId = $request->input('user_id');

        // Iniciamos la consulta base
        $query = Activity::with(['category', 'user', 'assignedUser']);

        if ($isAdminOrManager) {
            // Si es administrador/gerencia y eligió un usuario en el filtro
            if ($selectedUserId) {
                $query->where(function ($q) use ($selectedUserId) {
                    $q->where('assigned_user_id', $selectedUserId)
                        ->orWhere('user_id', $selectedUserId);
                });
            }
            // Si no hay filtro, el query sigue limpio y traerá TODO
        } else {
            // Empleados normales: ven sus tareas y (si tienen permiso) las de gerencia
            $query->where(function ($q) use ($user, $canViewGerencia) {
                // Sus propias tareas (asignadas o creadas)
                $q->where('assigned_user_id', $user->id)
                    ->orWhere('user_id', $user->id);

                // Tareas de gerencia si tiene el permiso de lectura
                if ($canViewGerencia) {
                    $q->orWhereHas('user', function ($sub) {
                        $sub->role('gerencia');
                    })->orWhereHas('assignedUser', function ($sub) {
                        $sub->role('gerencia');
                    });
                }
            });
        }

        $activities = $query->latest()->get();
        $categories = Category::all();
        $users = User::select('id', 'name')->get();

        return Inertia::render('Kanban/Board', [
            'activities' => $activities,
            'categories' => $categories,
            'users' => $users,
            'selectedUserId' => $selectedUserId // <-- Mandamos el ID seleccionado a React
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

    public function updateDueDate(Request $request, $id)
    {
        $activity = Activity::findOrFail($id);

        // Verificación de seguridad básica
        if (!auth()->user()->hasAnyRole(['administrador', 'gerencia']) && $activity->user_id !== auth()->id()) {
            abort(403, 'No tienes permiso para editar esta tarea.');
        }

        $activity->update([
            'due_date' => $request->due_date
        ]);

        return redirect()->back();
    }
}
