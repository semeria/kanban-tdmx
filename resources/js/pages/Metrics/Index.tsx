import { Head } from '@inertiajs/react';
import { Target, ListTodo, Clock, CheckCircle2 } from 'lucide-react';
import React from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inicio / Métricas', href: '/metricas' },
];

export default function MetricsIndex({ metrics }: { metrics: any }) {
    // --- CÁLCULO PARA GRÁFICA CIRCULAR (AVANCE) ---
    const totalTasks = metrics.total || 0;
    const doneTasks = metrics.done || 0;
    const progressPercentage =
        totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const circleRadius = 70;
    const circleCircumference = 2 * Math.PI * circleRadius;
    const strokeDashoffset =
        circleCircumference - (progressPercentage / 100) * circleCircumference;

    // --- NUEVO: CÁLCULOS PARA GRÁFICA DE BARRAS (PRIORIDAD) ---
    const high = metrics.priority_high || 0;
    const medium = metrics.priority_medium || 0;
    const low = metrics.priority_low || 0;

    // Encontramos el valor máximo para calcular la altura del 100% de la barra
    // Usamos || 1 para evitar divisiones por cero si todas están vacías
    const maxPriority = Math.max(high, medium, low) || 1;

    // Calculamos el % de altura que ocupará cada barra en el recuadro
    const highHeight = (high / maxPriority) * 100;
    const mediumHeight = (medium / maxPriority) * 100;
    const lowHeight = (low / maxPriority) * 100;
    // ------------------------------------------------------------

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

                {/* 2. Sección de Gráficas */}
                <div className="mt-4 grid gap-6 md:grid-cols-2">
                    {/* Gráfica Circular: Avance */}
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

                    {/* --- NUEVA GRÁFICA DE BARRAS: Actividades por Prioridad --- */}
                    {/* --- NUEVA GRÁFICA DE BARRAS: Actividades por Prioridad --- */}
                    <div
                        className="relative flex flex-col rounded-xl p-6 shadow-sm"
                        style={{ backgroundColor: '#0B5D45' }}
                    >
                        <div className="mt-2 mb-6 text-center">
                            <h3 className="text-xl font-bold tracking-wide text-white">
                                Actividades por Prioridad
                            </h3>
                        </div>

                        {/* 1. Contenedor de las barras y la línea base (Eje Y) */}
                        <div className="flex h-48 w-full items-end justify-center gap-6 border-b border-l border-white/40 pr-4 pl-4 sm:gap-12">
                            {/* Barra: Alta */}
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

                            {/* Barra: Media */}
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

                            {/* Barra: Baja */}
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

                        {/* 2. Contenedor de las etiquetas (Eje X) */}
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
                    {/* -------------------------------------------------------- */}
                    {/* -------------------------------------------------------- */}
                </div>
            </div>
        </AppLayout>
    );
}
