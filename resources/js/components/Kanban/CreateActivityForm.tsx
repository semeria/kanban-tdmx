import { useForm } from '@inertiajs/react';
import React from 'react';

export default function CreateActivityForm({ categories, onSuccess }: { categories: any[], onSuccess: (msg: string) => void }) {
    // 1. Agregamos due_date al estado inicial del formulario
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        priority: 'medium',
        category_id: categories.length > 0 ? categories[0].id : '',
        due_date: '', // Nuevo campo
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/kanban', {
            onSuccess: () => {
                reset(); // Limpiamos todo el formulario
                if (categories.length > 0) setData('category_id', categories[0].id);
                onSuccess('Actividad creada exitosamente 🎉');
            },
        });
    };

    return (
        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
            <h3 className="mb-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">
                Crear Nueva Actividad
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-4">

                {/* Título */}
                <div className="flex flex-col">
                    <input
                        type="text"
                        placeholder="Título de la actividad"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:text-neutral-100"
                        required
                    />
                    {errors.title && <span className="mt-1 text-xs text-red-500">{errors.title}</span>}
                </div>

                {/* Categoría */}
                <div className="flex flex-col">
                    <select
                        value={data.category_id}
                        onChange={(e) => setData('category_id', e.target.value)}
                        className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm text-neutral-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:text-neutral-100"
                        required
                    >
                        <option value="" disabled className="dark:bg-neutral-900">Selecciona Categoría</option>
                        {categories.map((cat: any) => (
                            <option key={cat.id} value={cat.id} className="dark:bg-neutral-900">{cat.name}</option>
                        ))}
                    </select>
                    {errors.category_id && <span className="mt-1 text-xs text-red-500">{errors.category_id}</span>}
                </div>

                {/* Prioridad */}
                <div className="flex flex-col">
                    <select
                        value={data.priority}
                        onChange={(e) => setData('priority', e.target.value)}
                        className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm text-neutral-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:text-neutral-100"
                    >
                        <option value="low" className="dark:bg-neutral-900">Baja</option>
                        <option value="medium" className="dark:bg-neutral-900">Media</option>
                        <option value="high" className="dark:bg-neutral-900">Alta</option>
                    </select>
                </div>

                {/* 2. NUEVO CAMPO: Fecha de Vencimiento */}
                <div className="flex flex-col">
                    <input
                        type="date"
                        value={data.due_date}
                        onChange={(e) => setData('due_date', e.target.value)}
                        className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm text-neutral-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:text-neutral-100"
                        title="Fecha de vencimiento (Opcional)"
                    />
                    {/* Mostramos el error si el backend rechaza la fecha */}
                    {errors.due_date && <span className="mt-1 text-xs text-red-500">{errors.due_date}</span>}
                </div>

                {/* Botón de envío */}
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                    {processing ? 'Guardando...' : 'Agregar Tarea'}
                </button>
            </form>

            {categories.length === 0 && (
                <p className="mt-3 text-sm text-red-500">
                    ⚠️ Por favor, ve a "Categorías" y crea al menos una antes de agregar tareas.
                </p>
            )}
        </div>
    );
}
