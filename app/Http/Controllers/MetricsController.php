<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Inertia\Inertia;

class MetricsController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Preparamos la consulta base
        $query = Activity::query();

        // Si NO es administrador, filtramos solo sus tareas
        if (! $user->hasRole('administrador')) {
            $query->where('user_id', $user->id);
        }

        // Calculamos las cantidades clonando la consulta base para no afectarla
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
        ]);
    }
}
