<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Activity;
use App\Models\User;
use Inertia\Inertia;

class MetricsController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Activity::query();
        $selectedUserId = $request->input('user_id');

        // 1. Verificamos los permisos de Spatie (El admin siempre puede ver todo)
        $isAdmin = $user->hasRole('administrador');
        $canViewGerentes = $isAdmin || $user->hasPermissionTo('view metrics gerentes');
        $canViewVPs = $isAdmin || $user->hasPermissionTo('view metrics vp');

        $gerentes = [];
        $vps = [];

        // 2. Cargamos a los usuarios usando el scope 'role' de Spatie
        if ($canViewGerentes) {
            $gerentes = User::role('gerencia')->select('id', 'name')->get();
        }

        if ($canViewVPs) {
            $vps = User::role('vacation_planner')->select('id', 'name')->get();
        }

        // 3. Aplicamos el filtro si tiene permiso y eligió a alguien
        if ($canViewGerentes || $canViewVPs) {
            if ($selectedUserId) {
                $query->where(function ($q) use ($selectedUserId) {
                    $q->where('assigned_user_id', $selectedUserId)
                      ->orWhere('user_id', $selectedUserId);
                });
            }
        } else {
            // Si no tiene permisos de ver a otros, solo ve lo suyo
            $query->where(function ($q) use ($user) {
                $q->where('assigned_user_id', $user->id)
                  ->orWhere('user_id', $user->id);
            });
        }

        // 4. Calculamos las métricas (tu código actual)
        $metrics = [
            'total' => (clone $query)->count(),
            'todo' => (clone $query)->where('status', 'todo')->count(),
            'in_progress' => (clone $query)->where('status', 'in_progress')->count(),
            'done' => (clone $query)->where('status', 'done')->count(),
            'priority_high' => (clone $query)->where('priority', 'high')->count(),
            'priority_medium' => (clone $query)->where('priority', 'medium')->count(),
            'priority_low' => (clone $query)->where('priority', 'low')->count(),
        ];

        return Inertia::render('Metrics/Index', [
            'metrics' => $metrics,
            'gerentes' => $gerentes,
            'vps' => $vps,
            'selectedUserId' => $selectedUserId,
            // Enviamos los permisos al frontend para saber qué Select mostrar
            'canViewGerentes' => $canViewGerentes,
            'canViewVPs' => $canViewVPs,
        ]);
    }
}
