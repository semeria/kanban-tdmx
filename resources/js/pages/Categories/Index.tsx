import { router, useForm, Head } from '@inertiajs/react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Trash2 } from 'lucide-react';

const handleDelete = (categoryId: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta categoría? Las tareas que la usen simplemente se quedarán sin etiqueta.')) {
            router.delete(`/categorias/${categoryId}`, {
                preserveScroll: true,
                onSuccess: () => {
                    // Si tienes una función de showNotification, úsala aquí. 
                    // Si no, puedes usar un simple alert o tu sistema de tostadas (toast).
                    alert('Categoría eliminada correctamente 🗑️'); 
                },
                onError: () => alert('Error al eliminar la categoría ❌')
            });
        }
    };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Categorías', href: '/categorias' },
];

export default function CategoriesIndex({ categories = [] }: { categories: any[] }) {
    const [notification, setNotification] = useState<string | null>(null);

    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    // Formulario para CREAR
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/categorias', {
            onSuccess: () => {
                reset();
                showNotification('Categoría creada exitosamente 🎉');
            },
        });
    };

    // Función para ACTUALIZAR
    const handleNameChange = (categoryId: number, newName: string, oldName: string) => {
        if (!newName.trim() || newName === oldName) return;

        router.put(`/categorias/${categoryId}`, { name: newName }, {
            preserveScroll: true,
            onSuccess: () => showNotification('Categoría actualizada 📝')
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categorías" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:max-w-4xl mx-auto w-full">

                {/* Formulario de Creación */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">Agregar Categoría</h3>
                    <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-4">
                        <div className="flex flex-col flex-1 min-w-[250px]">
                            <input
                                type="text"
                                placeholder="Nombre de la nueva categoría (ej. Diseño, Backend)"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                            />
                            {errors.name && <span className="mt-1 text-xs text-red-500">{errors.name}</span>}
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-neutral-900 dark:bg-neutral-100 px-4 py-2 text-sm font-medium text-white dark:text-neutral-900 transition-colors hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50"
                        >
                            {processing ? 'Guardando...' : 'Crear'}
                        </button>
                    </form>
                </div>

                {/* Lista de Categorías */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
                    <div className="border-b border-sidebar-border/50 px-6 py-4 bg-neutral-50 dark:bg-neutral-900/50">
                        <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Tus Categorías</h3>
                    </div>
                    <ul className="divide-y divide-sidebar-border/50 dark:divide-sidebar-border">
                        {categories.map((category: any) => (
                            <li key={category.id} className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                <input
                                    type="text"
                                    defaultValue={category.name}
                                    onBlur={(e) => handleNameChange(category.id, e.target.value, category.name)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') e.currentTarget.blur();
                                    }}
                                    className="w-full max-w-md bg-transparent font-medium text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-950 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 -ml-2 transition-colors"
                                    title="Haz clic para editar"
                                />
                                <button 
                                    onClick={() => handleDelete(category.id)}
                                    className="ml-2 rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600 transition-colors dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                    title="Eliminar categoría"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </li>
                            
                        ))}
                        {categories.length === 0 && (
                            <li className="px-6 py-8 text-center text-sm text-neutral-500">
                                Aún no tienes categorías. ¡Crea la primera!
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Notificación flotante */}
            {notification && (
                <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5 rounded-lg bg-neutral-900 dark:bg-white px-4 py-3 text-sm font-medium text-white dark:text-neutral-900 shadow-lg">
                    {notification}
                </div>
            )}
        </AppLayout>
    );
}
