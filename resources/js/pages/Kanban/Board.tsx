import type { DropResult } from '@hello-pangea/dnd';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';

import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

// Importamos los nuevos componentes (Ajusta la ruta según donde los guardes)
import CreateActivityForm from '@/components/Kanban/CreateActivityForm';
import KanbanCard from '@/components/Kanban/KanbanCard';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tablero Kanban', href: '/kanban' },
];

export default function Board({
    activities = [],
    categories = [],
    users = [],
    selectedUserId = [],
}: any) {
    const [notification, setNotification] = useState<string | null>(null);
    const { auth } = usePage().props as any;

    const canAssign = auth.roles?.some((role: string) =>
        ['administrador', 'gerencia'].includes(role),
    );
    const canFilter = canAssign;

    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(
            '/kanban',
            { user_id: e.target.value },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    // --- MANEJADORES DE RUTAS INERTIA ---
    const handleAssignUser = (activityId: number, newUserId: string) => {
        router.put(
            `/kanban/${activityId}/assign`,
            { assigned_user_id: newUserId ? parseInt(newUserId) : null },
            {
                preserveScroll: true,
                onSuccess: () => showNotification('Usuario asignado 👤'),
            },
        );
    };

    const handlePriorityChange = (
        activityId: number,
        newPriority: string,
        columnId: string,
    ) => {
        const updatedColumns = { ...columns };
        const itemIndex = updatedColumns[columnId].items.findIndex(
            (i: any) => i.id === activityId,
        );
        updatedColumns[columnId].items[itemIndex].priority = newPriority;
        setColumns(updatedColumns);
        router.put(
            `/kanban/${activityId}/priority`,
            { priority: newPriority },
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
            { title: newTitle },
            {
                preserveScroll: true,
                onSuccess: () => showNotification('Título actualizado 📝'),
            },
        );
    };

    const handleDelete = (activityId: number) => {
        if (confirm('¿Estás seguro de eliminar esta actividad?')) {
            router.delete(`/kanban/${activityId}`, {
                preserveScroll: true,
                onSuccess: () => showNotification('Actividad eliminada 🗑️'),
            });
        }
    };

    const handleDueDateChange = (activityId: number, newDate: string) => {
        router.put(
            `/kanban/${activityId}/due-date`,
            { due_date: newDate || null },
            {
                preserveScroll: true,
                onSuccess: () => showNotification('Fecha actualizada 📅'),
            },
        );
    };

    const canModifyItem = (item: any) => {
        if (canAssign) return true;
        if (item.user_id === auth.user.id) return true;
        if (item.assigned_user_id === auth.user.id) return true;
        return false;
    };

    // --- LÓGICA DE COLUMNAS ---
    const [columns, setColumns] = useState<any>({
        todo: { name: 'Por Hacer', items: [] },
        in_progress: { name: 'En Progreso', items: [] },
        done: { name: 'Finalizado', items: [] },
    });

    useEffect(() => {
        setColumns({
            todo: {
                name: 'Por Hacer',
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
        });
    }, [activities]);

    const onDragEnd = (result: DropResult) => {
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
            { status: destination.droppableId },
            {
                preserveScroll: true,
                onSuccess: () => showNotification('Estado actualizado ✅'),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kanban" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* 1. COMPONENTE DE FORMULARIO */}
                <CreateActivityForm
                    categories={categories}
                    onSuccess={showNotification}
                />

                {/* FILTRO DE USUARIOS */}
                {canFilter && (
                    <div className="mt-2 mb-2 w-full sm:w-64">
                        <label className="mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                            Filtrar tablero por usuario
                        </label>
                        <select
                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 shadow-sm focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                            value={selectedUserId || ''}
                            onChange={handleFilterChange}
                        >
                            <option value="">Todos los usuarios</option>
                            {users.map((u: any) => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* 2. TABLERO KANBAN */}
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
                                                        /* 3. COMPONENTE DE TARJETA */
                                                        <KanbanCard
                                                            key={item.id.toString()}
                                                            item={item}
                                                            index={index}
                                                            columnId={columnId}
                                                            users={users}
                                                            auth={auth}
                                                            canAssign={
                                                                canAssign
                                                            }
                                                            canModifyItem={
                                                                canModifyItem
                                                            }
                                                            handleTitleChange={
                                                                handleTitleChange
                                                            }
                                                            handleDelete={
                                                                handleDelete
                                                            }
                                                            handlePriorityChange={
                                                                handlePriorityChange
                                                            }
                                                            handleAssignUser={
                                                                handleAssignUser
                                                            }
                                                            handleDueDateChange={
                                                                handleDueDateChange
                                                            }
                                                        />
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

            {/* NOTIFICACIÓN TOAST */}
            {notification && (
                <div className="fixed right-4 bottom-4 z-50 animate-in rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white shadow-lg slide-in-from-bottom-5 fade-in dark:bg-white dark:text-neutral-900">
                    {notification}
                </div>
            )}
        </AppLayout>
    );
}
