<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Category;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KanbanController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $selectedUserId = $request->input('user_id');

        $query = Activity::with(['category', 'user', 'assignedUser']);

        // ==========================================
        // NIVEL 1: ADMINISTRADOR
        // ==========================================
        if ($user->hasRole('administrador')) {

            // 1. Carga a TODOS los usuarios en el select
            $users = User::select('id', 'name')->get();

            // 2. Filtra las actividades (Ve TODO, a menos que elija a alguien)
            if ($selectedUserId) {
                $query->where(function ($q) use ($selectedUserId) {
                    $q->where('assigned_user_id', $selectedUserId)
                        ->orWhere('user_id', $selectedUserId);
                });
            }

            // ==========================================
            // NIVEL 2: GERENCIA (DINÁMICO CON SPATIE)
            // ==========================================
        } elseif ($user->hasRole('gerencia')) {

            // 1. Buscamos todos los roles que existen en el sistema
            $allRoles = \Spatie\Permission\Models\Role::pluck('name');
            $rolesQuePuedeVer = [];

            // 2. Revisamos a cuáles de esos roles tiene permiso de ver este usuario
            foreach ($allRoles as $roleName) {
                if ($user->can('ver rol '.$roleName)) {
                    $rolesQuePuedeVer[] = $roleName;
                }
            }

            // 3. Spatie trae a los usuarios SOLO de los roles autorizados
            $users = User::role($rolesQuePuedeVer)->select('id', 'name')->get();

            // 4. Extraemos solo los IDs de esos usuarios para filtrar las actividades
            $managedUserIds = $users->pluck('id')->toArray();

            // 5. Filtramos las actividades de manera segura
            if ($selectedUserId) {
                // Seguridad: Verificamos que el ID que pasaron por la URL realmente pertenezca a su equipo
                if (in_array($selectedUserId, $managedUserIds) || $selectedUserId == $user->id) {
                    $query->where(function ($q) use ($selectedUserId) {
                        $q->where('assigned_user_id', $selectedUserId)
                            ->orWhere('user_id', $selectedUserId);
                    });
                } else {
                    // Si intenta poner el ID de un admin en la URL, lo ignoramos y cargamos lo de su equipo
                    $query->where(function ($q) use ($managedUserIds, $user) {
                        $q->whereIn('assigned_user_id', $managedUserIds)
                            ->orWhereIn('user_id', $managedUserIds)
                            ->orWhere('assigned_user_id', $user->id)
                            ->orWhere('user_id', $user->id);
                    });
                }
            } else {
                // Si no hay filtro, ve las tareas de todo su equipo asignado + las suyas propias
                $query->where(function ($q) use ($managedUserIds, $user) {
                    $q->whereIn('assigned_user_id', $managedUserIds)
                        ->orWhereIn('user_id', $managedUserIds)
                        ->orWhere('assigned_user_id', $user->id)
                        ->orWhere('user_id', $user->id);
                });
            }

            // ==========================================
            // NIVEL 3: EMPLEADOS (RESTO)
            // ==========================================
        } else {

            // 1. Solo se ven a sí mismos en el select
            $users = User::where('id', $user->id)->select('id', 'name')->get();

            // 2. Solo ven sus propias tareas
            $query->where(function ($q) use ($user) {
                $q->where('assigned_user_id', $user->id)
                    ->orWhere('user_id', $user->id);
            });
        }

        $activities = $query->latest()->get();
        $categories = Category::all();

        return Inertia::render('Kanban/Board', [
            'activities' => $activities,
            'categories' => $categories,
            'users' => $users,
            'selectedUserId' => $selectedUserId,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'priority' => 'required|in:low,medium,high',
            'category_id' => 'required|exists:categories,id',
            'due_date' => 'nullable|date',
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
        if (! auth()->user()->hasAnyRole(['administrador', 'gerencia'])) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $activity = Activity::findOrFail($id);
        $activity->update([
            'assigned_user_id' => $request->assigned_user_id,
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
        if (! auth()->user()->hasAnyRole(['administrador', 'gerencia']) && $activity->user_id !== auth()->id()) {
            abort(403, 'No tienes permiso para editar esta tarea.');
        }

        $activity->update([
            'due_date' => $request->due_date,
        ]);

        return redirect()->back();
    }

    public function updateDescription(Request $request, $id)
    {
        $activity = Activity::findOrFail($id);
        $request->validate([
            'description' => 'nullable|string|max:1000',
        ]);

        $activity->update([
            'description' => $request->description,
        ]);

        return redirect()->back();
    }
}
