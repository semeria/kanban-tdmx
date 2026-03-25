import { Head, router, usePage } from '@inertiajs/react';
import { Target, ListTodo, Clock, CheckCircle2 } from 'lucide-react';
import React from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inicio / Métricas', href: '/metricas' },
];

const MONTHS = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' }, { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' }, { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' },
];

export default function MetricsIndex({ metrics, gerentes, vps, marketing, canViewGerentes, canViewVPs, canViewMarketing, filters }: any) {
    const { auth } = usePage().props as any;

    // --- MANEJO DE FILTROS ---
    const handleFilterChange = (filterName: string, value: string | number) => {
        const newFilters: any = {
            user_id: filters?.user_id || '',
            month: filters?.month,
            week: filters?.week,
            [filterName]: value
        };

        // Si cambia el mes, reseteamos a la semana 1 por UX
        if (filterName === 'month') {
            newFilters.week = 1;
        }

        router.get('/metricas', newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };
    // -------------------------

    const totalTasks = metrics.total || 0;
    const doneTasks = metrics.done || 0;
    const progressPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const circleRadius = 70;
    const circleCircumference = 2 * Math.PI * circleRadius;
    const strokeDashoffset = circleCircumference - (progressPercentage / 100) * circleCircumference;

    const high = metrics.priority_high || 0;
    const medium = metrics.priority_medium || 0;
    const low = metrics.priority_low || 0;
    const maxPriority = Math.max(high, medium, low) || 1;

    const highHeight = (high / maxPriority) * 100;
    const mediumHeight = (medium / maxPriority) * 100;
    const lowHeight = (low / maxPriority) * 100;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Métricas" />

            <div className="mx-auto flex h-full w-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:max-w-6xl">
                <div className="mb-2">
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        Resumen de Actividades
                    </h2>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Controla el progreso y estado de las tareas.
                    </p>
                </div>

                {/* --- CONTENEDOR DE SELECTORES (Filtros) --- */}
                <div className="flex flex-col flex-wrap gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row dark:border-neutral-800 dark:bg-neutral-900">

                    {/* Filtros de Fecha (Mes y Semana) */}
                    <div className="flex w-full gap-4 sm:w-auto">
                        <div className="flex w-1/2 flex-col sm:w-40">
                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                Mes
                            </label>
                            <select
                                className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-1.5 text-sm text-neutral-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:text-neutral-300"
                                value={filters?.month || 1}
                                onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
                            >
                                {MONTHS.map((m) => (
                                    <option key={m.value} value={m.value} className="dark:bg-neutral-900">{m.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex w-1/2 flex-col sm:w-48">
                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                Semana
                            </label>
                            <select
                                className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-1.5 text-sm text-neutral-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:text-neutral-300"
                                value={filters?.week || 1}
                                onChange={(e) => handleFilterChange('week', parseInt(e.target.value))}
                            >
                                <option value={1} className="dark:bg-neutral-900">Semana 1 (Días 1-7)</option>
                                <option value={2} className="dark:bg-neutral-900">Semana 2 (Días 8-14)</option>
                                <option value={3} className="dark:bg-neutral-900">Semana 3 (Días 15-21)</option>
                                <option value={4} className="dark:bg-neutral-900">Semana 4 (Días 22-28)</option>
                                <option value={5} className="dark:bg-neutral-900">Semana 5 (Resto)</option>
                            </select>
                        </div>
                    </div>

                    {/* Divisor vertical (solo visible en desktop) */}
                    <div className="hidden w-px bg-neutral-200 sm:block dark:bg-neutral-700"></div>

                    {/* Filtros de Usuario (Los que ya tenías) */}
                    <div className="flex flex-1 flex-col gap-4 sm:flex-row">
                        {canViewGerentes && (
                            <div className="w-full sm:w-48">
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                    Gerencia
                                </label>
                                <select
                                    className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-1.5 text-sm text-neutral-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:text-neutral-300"
                                    value={filters?.user_id || ''}
                                    onChange={(e) => handleFilterChange('user_id', e.target.value)}
                                >
                                    <option value="">General (Todos)</option>
                                    {gerentes.map((u: any) => <option key={u.id} value={u.id} className="dark:bg-neutral-900">{u.name}</option>)}
                                </select>
                            </div>
                        )}

                        {canViewMarketing && (
                            <div className="w-full sm:w-48">
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                    Marketing
                                </label>
                                <select
                                    className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-1.5 text-sm text-neutral-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:text-neutral-300"
                                    value={filters?.user_id || ''}
                                    onChange={(e) => handleFilterChange('user_id', e.target.value)}
                                >
                                    <option value="">General (Todos)</option>
                                    {marketing.map((u: any) => <option key={u.id} value={u.id} className="dark:bg-neutral-900">{u.name}</option>)}
                                </select>
                            </div>
                        )}

                        {canViewVPs && (
                            <div className="w-full sm:w-48">
                                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                    Vacation Planner
                                </label>
                                <select
                                    className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-1.5 text-sm text-neutral-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:text-neutral-300"
                                    value={filters?.user_id || ''}
                                    onChange={(e) => handleFilterChange('user_id', e.target.value)}
                                >
                                    <option value="">General (Todos)</option>
                                    {vps.map((u: any) => <option key={u.id} value={u.id} className="dark:bg-neutral-900">{u.name}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
                {/* ------------------------------------------------ */}

                {/* 1. Tarjetas de Estadísticas (Cantidades) */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:bg-neutral-900">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                                <Target size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    Total Creadas
                                </p>
                                <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                                    {metrics.total}
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:bg-neutral-900">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                <ListTodo size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    Por Hacer
                                </p>
                                <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                                    {metrics.todo}
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:bg-neutral-900">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    En Progreso
                                </p>
                                <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                                    {metrics.in_progress}
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:bg-neutral-900">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    Finalizadas
                                </p>
                                <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                                    {metrics.done}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid gap-6 md:grid-cols-2">
                    <div
                        className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl p-6 shadow-sm"
                        style={{ backgroundColor: '#0A4A6B' }}
                    >
                        <div className="absolute top-4 left-6">
                            <h3 className="text-xl font-bold tracking-wide text-white">
                                Avance
                            </h3>
                        </div>

                        <div className="relative mt-6 flex h-48 w-48 items-center justify-center">
                            <svg className="h-full w-full -rotate-90 transform">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r={circleRadius}
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth="20"
                                    fill="transparent"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r={circleRadius}
                                    stroke="#ffffff"
                                    strokeWidth="20"
                                    fill="transparent"
                                    strokeDasharray={circleCircumference}
                                    strokeDashoffset={strokeDashoffset}
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <span className="absolute text-5xl font-bold text-white">
                                {progressPercentage}%
                            </span>
                        </div>
                        <p className="mt-4 text-sm text-white/80">
                            {doneTasks} de {totalTasks} tareas completadas
                        </p>
                    </div>
                    <div
                        className="relative flex flex-col rounded-xl p-6 shadow-sm"
                        style={{ backgroundColor: '#0B5D45' }}
                    >
                        <div className="mt-2 mb-6 text-center">
                            <h3 className="text-xl font-bold tracking-wide text-white">
                                Actividades por Prioridad
                            </h3>
                        </div>

                        <div className="flex h-48 w-full items-end justify-center gap-6 border-b border-l border-white/40 pr-4 pl-4 sm:gap-12">
                            <div className="flex h-full w-12 flex-col items-center justify-end sm:w-16">
                                <span className="mb-2 text-lg font-bold text-white">
                                    {high}
                                </span>
                                <div
                                    className="w-full rounded-t-md bg-yellow-400 transition-all duration-1000 ease-out"
                                    style={{
                                        height: `${highHeight}%`,
                                        minHeight: high > 0 ? '4px' : '0',
                                    }}
                                ></div>
                            </div>

                            <div className="flex h-full w-12 flex-col items-center justify-end sm:w-16">
                                <span className="mb-2 text-lg font-bold text-white">
                                    {medium}
                                </span>
                                <div
                                    className="w-full rounded-t-md bg-yellow-400 transition-all duration-1000 ease-out"
                                    style={{
                                        height: `${mediumHeight}%`,
                                        minHeight: medium > 0 ? '4px' : '0',
                                    }}
                                ></div>
                            </div>

                            <div className="flex h-full w-12 flex-col items-center justify-end sm:w-16">
                                <span className="mb-2 text-lg font-bold text-white">
                                    {low}
                                </span>
                                <div
                                    className="w-full rounded-t-md bg-yellow-400 transition-all duration-1000 ease-out"
                                    style={{
                                        height: `${lowHeight}%`,
                                        minHeight: low > 0 ? '4px' : '0',
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div className="mt-3 flex w-full items-center justify-center gap-6 pr-4 pl-4 sm:gap-12">
                            <div className="w-12 text-center sm:w-16">
                                <span className="text-sm font-medium text-white">
                                    Alta
                                </span>
                            </div>
                            <div className="w-12 text-center sm:w-16">
                                <span className="text-sm font-medium text-white">
                                    Media
                                </span>
                            </div>
                            <div className="w-12 text-center sm:w-16">
                                <span className="text-sm font-medium text-white">
                                    Baja
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
