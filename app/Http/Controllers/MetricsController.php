<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Activity;
use App\Models\User;
use Inertia\Inertia;
use Carbon\Carbon; // <-- Importante añadir esto

class MetricsController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Activity::query();
        $selectedUserId = $request->input('user_id');

        // --- 1. LÓGICA DE FECHAS (MES Y SEMANA) ---
        $currentMonth = now()->month;
        $currentWeek = (int) ceil(now()->day / 7);

        $month = (int) $request->input('month', $currentMonth);
        $week = (int) $request->input('week', $currentWeek);
        $year = now()->year;

        // Validamos la semana elegida (entre 1 y 5)
        $week = max(1, min(5, $week));

        $startDay = (($week - 1) * 7) + 1;
        $endDay = $week * 7;

        $daysInMonth = Carbon::createFromDate($year, $month, 1)->daysInMonth;
        if ($endDay > $daysInMonth) {
            $endDay = $daysInMonth;
        }

        $startDate = Carbon::createFromDate($year, $month, $startDay)->startOfDay();
        $endDate = Carbon::createFromDate($year, $month, $endDay)->endOfDay();

        // Filtramos las actividades por la fecha de creación
        $query->whereBetween('created_at', [$startDate, $endDate]);
        // -------------------------------------------

        // 2. Verificamos los permisos de Spatie
        $isAdmin = $user->hasRole('administrador');
        $canViewGerentes = $isAdmin || $user->can('view metrics gerentes');
        $canViewVPs = $isAdmin || $user->can('view metrics vp');
        $canViewMarketing = $isAdmin || $user->can('view metrics gerentes');

        $gerentes = [];
        $vps = [];
        $marketing = [];

        // 3. Cargamos a los usuarios
        if ($canViewGerentes) {
            $gerentes = User::role('gerencia')->select('id', 'name')->get();
        }

        if ($canViewVPs) {
            $vps = User::role('vacation_planner')->select('id', 'name')->get();
        }

        if ($canViewMarketing) {
            $marketing = User::role('marketing')->select('id', 'name')->get();
        }

        // 4. Aplicamos el filtro de usuario
        if ($canViewGerentes || $canViewVPs || $canViewMarketing) {
            if ($selectedUserId) {
                $query->where(function ($q) use ($selectedUserId) {
                    $q->where('assigned_user_id', $selectedUserId)
                        ->orWhere('user_id', $selectedUserId);
                });
            }
        } else {
            // Si no tiene permisos, solo ve lo suyo
            $query->where(function ($q) use ($user) {
                $q->where('assigned_user_id', $user->id)
                    ->orWhere('user_id', $user->id);
            });
        }

        // 5. Calculamos las métricas
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
            'marketing' => $marketing,
            // Enviamos los filtros actuales para que React los seleccione
            'filters' => [
                'user_id' => $selectedUserId,
                'month' => $month,
                'week' => $week,
            ],
            'canViewGerentes' => $canViewGerentes,
            'canViewVPs' => $canViewVPs,
            'canViewMarketing' => $canViewMarketing,
        ]);
    }
}
