import type { DropResult } from '@hello-pangea/dnd';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useForm, Head, router, usePage } from '@inertiajs/react';
import {
    User,
    Star,
    Zap,
    Smile,
    Heart,
    Coffee,
    Shield,
    Rocket,
    Trash2,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tablero Kanban', href: '/kanban' },
];

const getUserIconAndColor = (userId: number) => {
    const icons = [User, Star, Zap, Smile, Heart, Coffee, Shield, Rocket];
    const colors = [
        'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400',
        'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
        'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400',
        'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400',
        'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
        'bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-400',
        'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400',
        'bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400',
    ];

    // Usamos el operador % (módulo) para que siempre le toque el mismo a cada ID
    const Icon = icons[userId % icons.length];
    const colorClass = colors[userId % colors.length];

    return { Icon, colorClass };
};

export default function Board({
    activities = [],
    categories = [],
    users = []
}: {
    activities: any[];
    categories: any[];
    users : any[];
}) {
    const [notification, setNotification] = useState<string | null>(null);
    const { auth } = usePage().props as any;
    const canAssign = auth.roles?.some((role: string) =>
        ['administrador', 'gerencia'].includes(role),
    );
    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    // --- CAMBIO 2: Agregamos category_id al estado inicial del formulario ---
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        priority: 'medium',
        category_id: categories.length > 0 ? categories[0].id : '', // Por defecto toma la primera
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/kanban', {
            onSuccess: () => {
                reset(); // Limpia el formulario
                // Nos aseguramos de volver a seleccionar la primera categoría tras limpiar
                if (categories.length > 0)
                    setData('category_id', categories[0].id);
                showNotification('Actividad creada exitosamente 🎉');
            },
        });
    };

    const handleAssignUser = (activityId: number, newUserId: string) => {
        router.put(
            `/kanban/${activityId}/assign`,
            {
                // Convertimos a número o a null si eligió "Sin asignar"
                assigned_user_id: newUserId ? parseInt(newUserId) : null,
            },
            {
                preserveScroll: true,
                onSuccess: () =>
                    showNotification('Usuario asignado correctamente 👤'),
            },
        );
    };

    const [columns, setColumns] = useState<any>({
        todo: { name: 'Por Hacer', items: [] },
        in_progress: { name: 'En Progreso', items: [] },
        done: { name: 'Finalizado', items: [] },
    });

    useEffect(() => {
        const initialColumns = {
            todo: {
                name: 'Por Hacer ahora',
                items: activities.filter((a: any) => a.status === 'todo'),
            },
            in_progress: {
                name: 'En Progreso',
                items: activities.filter(
                    (a: any) => a.status === 'in_progress',
                ),
            },
            done: {
                name: 'Finalizado',
                items: activities.filter((a: any) => a.status === 'done'),
            },
        };
        setColumns(initialColumns);
    }, [activities]);

    const onDragEnd = (result: DropResult) => {
        // ... (Mantén tu lógica onDragEnd intacta)
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        )
            return;
        const sourceCol = columns[source.droppableId];
        const destCol = columns[destination.droppableId];
        const sourceItems = [...sourceCol.items];
        const destItems = [...destCol.items];
        const [removed] = sourceItems.splice(source.index, 1);
        removed.status = destination.droppableId;
        destItems.splice(destination.index, 0, removed);
        setColumns({
            ...columns,
            [source.droppableId]: { ...sourceCol, items: sourceItems },
            [destination.droppableId]: { ...destCol, items: destItems },
        });
        router.put(
            `/kanban/${draggableId}/status`,
            {
                status: destination.droppableId,
            },
            {
                preserveScroll: true,
                onSuccess: () =>
                    showNotification('Estado actualizado correctamente ✅'),
            },
        );
    };

    const handlePriorityChange = (
        activityId: number,
        newPriority: string,
        columnId: string,
    ) => {
        // Actualización visual local (ya la tienes)
        const updatedColumns = { ...columns };
        const itemIndex = updatedColumns[columnId].items.findIndex(
            (i: any) => i.id === activityId,
        );
        updatedColumns[columnId].items[itemIndex].priority = newPriority;
        setColumns(updatedColumns);

        router.put(
            `/kanban/${activityId}/priority`,
            {
                priority: newPriority,
            },
            {
                preserveScroll: true,
                onSuccess: () => showNotification('Prioridad actualizada 🚀'),
            },
        );
    };

    const handleTitleChange = (
        activityId: number,
        newTitle: string,
        columnId: string,
    ) => {
        // ... (Mantén tu lógica handleTitleChange intacta)
        const currentTitle = columns[columnId].items.find(
            (i: any) => i.id === activityId,
        ).title;
        if (!newTitle.trim() || newTitle === currentTitle) return;
        const updatedColumns = { ...columns };
        const itemIndex = updatedColumns[columnId].items.findIndex(
            (i: any) => i.id === activityId,
        );
        updatedColumns[columnId].items[itemIndex].title = newTitle;
        setColumns(updatedColumns);
        router.put(
            `/kanban/${activityId}/title`,
            {
                title: newTitle,
            },
            {
                preserveScroll: true,
                onSuccess: () => showNotification('Título actualizado 📝'),
            },
        );
    };

    const handleDelete = (activityId: number) => {
        if (
            confirm(
                '¿Estás seguro de que deseas eliminar esta actividad? Esta acción no se puede deshacer.',
            )
        ) {
            router.delete(`/kanban/${activityId}`, {
                preserveScroll: true,
                onSuccess: () =>
                    showNotification('Actividad eliminada correctamente 🗑️'),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kanban" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                    <h3 className="mb-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">
                        Crear Nueva Actividad
                    </h3>
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-wrap items-start gap-4"
                    >
                        <div className="flex flex-col">
                            <input
                                type="text"
                                placeholder="Título de la actividad"
                                value={data.title}
                                onChange={(e) =>
                                    setData('title', e.target.value)
                                }
                                className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:text-neutral-100"
                                required
                            />
                            {errors.title && (
                                <span className="mt-1 text-xs text-red-500">
                                    {errors.title}
                                </span>
                            )}
                        </div>

                        {/* --- CAMBIO 3: Nuevo Select para elegir la Categoría --- */}
                        <div className="flex flex-col">
                            <select
                                value={data.category_id}
                                onChange={(e) =>
                                    setData('category_id', e.target.value)
                                }
                                className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm text-neutral-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:text-neutral-100"
                                required
                            >
                                <option
                                    value=""
                                    disabled
                                    className="dark:bg-neutral-900"
                                >
                                    Selecciona Categoría
                                </option>
                                {categories.map((cat: any) => (
                                    <option
                                        key={cat.id}
                                        value={cat.id}
                                        className="dark:bg-neutral-900"
                                    >
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category_id && (
                                <span className="mt-1 text-xs text-red-500">
                                    {errors.category_id}
                                </span>
                            )}
                        </div>
                        {/* ----------------------------------------------------- */}

                        <div className="flex flex-col">
                            <select
                                value={data.priority}
                                onChange={(e) =>
                                    setData('priority', e.target.value)
                                }
                                className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm text-neutral-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:text-neutral-100"
                            >
                                <option
                                    value="low"
                                    className="dark:bg-neutral-900"
                                >
                                    Baja
                                </option>
                                <option
                                    value="medium"
                                    className="dark:bg-neutral-900"
                                >
                                    Media
                                </option>
                                <option
                                    value="high"
                                    className="dark:bg-neutral-900"
                                >
                                    Alta
                                </option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                        >
                            {processing ? 'Guardando...' : 'Agregar Tarea'}
                        </button>
                    </form>

                    {/* Mensaje si no hay categorías creadas */}
                    {categories.length === 0 && (
                        <p className="mt-3 text-sm text-red-500">
                            ⚠️ Por favor, ve a "Categorías" y crea al menos una
                            antes de agregar tareas.
                        </p>
                    )}
                </div>

                {/* Resto de tu código Kanban (El DragDropContext y las columnas) */}
                <div className="relative flex min-h-[60vh] flex-1 gap-6 overflow-x-auto rounded-xl border border-sidebar-border/70 bg-neutral-50/50 p-4 dark:border-sidebar-border dark:bg-neutral-900/20">
                    <DragDropContext onDragEnd={onDragEnd}>
                        {Object.entries(columns).map(
                            ([columnId, column]: [string, any]) => (
                                <div
                                    key={columnId}
                                    className="flex min-w-75 flex-1 flex-col rounded-xl border border-sidebar-border/50 bg-white shadow-sm dark:border-sidebar-border dark:bg-neutral-900"
                                >
                                    <div className="border-b border-sidebar-border/50 px-4 py-3 text-center dark:border-sidebar-border">
                                        <h2 className="font-semibold text-neutral-800 dark:text-neutral-200">
                                            {column.name}
                                        </h2>
                                    </div>
                                    <Droppable droppableId={columnId}>
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={`flex-1 p-3 transition-colors ${snapshot.isDraggingOver ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-transparent'}`}
                                            >
                                                {column.items.map(
                                                    (
                                                        item: any,
                                                        index: number,
                                                    ) => (
                                                        <Draggable
                                                            key={item.id.toString()}
                                                            draggableId={item.id.toString()}
                                                            index={index}
                                                        >
                                                            {(
                                                                provided,
                                                                snapshot,
                                                            ) => (
                                                                <div
                                                                    ref={
                                                                        provided.innerRef
                                                                    }
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={`group mb-3 rounded-lg border border-sidebar-border/50 p-4 shadow-sm transition-shadow select-none dark:border-sidebar-border ${snapshot.isDragging ? 'bg-blue-50/50 ring-1 ring-blue-500/50 dark:bg-neutral-800' : 'bg-white dark:bg-neutral-950'}`}
                                                                    style={{
                                                                        ...provided
                                                                            .draggableProps
                                                                            .style,
                                                                    }}
                                                                >
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <input
                                                                            type="text"
                                                                            defaultValue={
                                                                                item.title
                                                                            }
                                                                            onBlur={(
                                                                                e,
                                                                            ) =>
                                                                                handleTitleChange(
                                                                                    item.id,
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                    columnId,
                                                                                )
                                                                            }
                                                                            onKeyDown={(
                                                                                e,
                                                                            ) => {
                                                                                if (
                                                                                    e.key ===
                                                                                    'Enter'
                                                                                ) {
                                                                                    e.preventDefault(); // Evita que el navegador intente hacer un "submit" tradicional
                                                                                    e.currentTarget.blur();
                                                                                }
                                                                            }}
                                                                            className="-ml-1 flex-1 rounded bg-transparent px-1 font-semibold text-neutral-900 transition-colors hover:bg-neutral-100 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none dark:text-neutral-100 dark:hover:bg-neutral-800 dark:focus:bg-neutral-950"
                                                                            title="Haz clic para editar"
                                                                        />
                                                                        {(canAssign || item.user_id === auth.user.id) && (
                                                                            <button
                                                                                onClick={() => handleDelete(item.id)}
                                                                                className="text-neutral-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                                                title="Eliminar tarea"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        )}
                                                                    </div>

                                                                    <div className="mt-3 flex items-center justify-between">
                                                                        <label className="text-xs text-neutral-500 dark:text-neutral-400">
                                                                            Prioridad:
                                                                        </label>
                                                                        <select
                                                                            value={
                                                                                item.priority
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                handlePriorityChange(
                                                                                    item.id,
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                    columnId,
                                                                                )
                                                                            }
                                                                            className="rounded border border-neutral-200 bg-transparent px-2 py-1 text-xs text-neutral-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:text-neutral-300"
                                                                        >
                                                                            <option
                                                                                value="low"
                                                                                className="dark:bg-neutral-900"
                                                                            >
                                                                                Baja
                                                                            </option>
                                                                            <option
                                                                                value="medium"
                                                                                className="dark:bg-neutral-900"
                                                                            >
                                                                                Media
                                                                            </option>
                                                                            <option
                                                                                value="high"
                                                                                className="dark:bg-neutral-900"
                                                                            >
                                                                                Alta
                                                                            </option>
                                                                        </select>
                                                                    </div>

                                                                    {/* Sección del Usuario (Icono de color y Nombre) */}
                                                                    <div className="flex items-center gap-2">
                                                                        {item.user ? (
                                                                            (() => {
                                                                                // Obtenemos el icono y color para este usuario
                                                                                const {
                                                                                    Icon,
                                                                                    colorClass,
                                                                                } =
                                                                                    getUserIconAndColor(
                                                                                        item
                                                                                            .user
                                                                                            .id,
                                                                                    );
                                                                                return (
                                                                                    <>
                                                                                        <div
                                                                                            className={`flex h-6 w-6 items-center justify-center rounded-full ${colorClass}`}
                                                                                        >
                                                                                            <Icon
                                                                                                size={
                                                                                                    12
                                                                                                }
                                                                                                strokeWidth={
                                                                                                    2.5
                                                                                                }
                                                                                            />
                                                                                        </div>
                                                                                        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                                                                            {
                                                                                                item
                                                                                                    .user
                                                                                                    .name
                                                                                            }
                                                                                        </span>
                                                                                    </>
                                                                                );
                                                                            })()
                                                                        ) : (
                                                                            <span className="text-xs text-neutral-500">
                                                                                Sin
                                                                                asignar
                                                                            </span>
                                                                        )}
                                                                        {item.assigned_user ? (
                                                                            (() => {
                                                                                const {
                                                                                    Icon,
                                                                                    colorClass,
                                                                                } =
                                                                                    getUserIconAndColor(
                                                                                        item
                                                                                            .assigned_user
                                                                                            .id,
                                                                                    );
                                                                                return (
                                                                                    <div
                                                                                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${colorClass}`}
                                                                                    >
                                                                                        <Icon
                                                                                            size={
                                                                                                12
                                                                                            }
                                                                                            strokeWidth={
                                                                                                2.5
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                );
                                                                            })()
                                                                        ) : (
                                                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800">
                                                                                <User
                                                                                    size={
                                                                                        12
                                                                                    }
                                                                                    strokeWidth={
                                                                                        2.5
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        )}

                                                                        {canAssign ? (
                                                                            <select
                                                                                className="h-7 cursor-pointer appearance-none rounded-md border-transparent bg-transparent py-0 pr-6 pl-1 text-xs font-medium text-neutral-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-transparent dark:text-neutral-400 dark:focus:border-blue-500"
                                                                                value={
                                                                                    item.assigned_user_id ||
                                                                                    ''
                                                                                }
                                                                                onChange={(
                                                                                    e,
                                                                                ) =>
                                                                                    handleAssignUser(
                                                                                        item.id,
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <option value="">
                                                                                    Sin
                                                                                    asignar
                                                                                </option>
                                                                                {users.map(
                                                                                    (
                                                                                        u: any,
                                                                                    ) => (
                                                                                        <option
                                                                                            key={
                                                                                                u.id
                                                                                            }
                                                                                            value={
                                                                                                u.id
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                u.name
                                                                                            }
                                                                                        </option>
                                                                                    ),
                                                                                )}
                                                                            </select>
                                                                        ) : (
                                                                            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                                                                {item.assigned_user
                                                                                    ? item
                                                                                          .assigned_user
                                                                                          .name
                                                                                    : 'Sin asignar'}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {item.category && (
                                                                        <div className="mt-3 text-right">
                                                                            <span className="inline-block rounded-md bg-purple-600 px-2 py-1 text-xs font-semibold text-white shadow-sm dark:bg-purple-700">
                                                                                {
                                                                                    item
                                                                                        .category
                                                                                        .name
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ),
                                                )}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            ),
                        )}
                    </DragDropContext>
                </div>
            </div>

            {notification && (
                <div className="fixed right-4 bottom-4 z-50 animate-in rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white shadow-lg slide-in-from-bottom-5 fade-in dark:bg-white dark:text-neutral-900">
                    {notification}
                </div>
            )}
        </AppLayout>
    );
}
