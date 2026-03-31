import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { User, Star, Zap, Smile, Heart, Coffee, Shield, Rocket, Trash2, Calendar } from 'lucide-react';

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
    return { Icon: icons[userId % icons.length], colorClass: colors[userId % colors.length] };
};

export default function KanbanCard({
    item,
    index,
    columnId,
    users,
    auth,
    canAssign,
    canModifyItem,
    handleTitleChange,
    handleDelete,
    handlePriorityChange,
    handleAssignUser,
    handleDueDateChange,
    handleDescriptionChange,
}: any) {
    // --- 1. LÓGICA DEL SEMÁFORO (COLORES DE FONDO) ---
    let cardBgColor =
        'bg-white border-sidebar-border/50 dark:bg-neutral-950 dark:border-sidebar-border';
    let dateIconColor = 'text-neutral-500 dark:text-neutral-400';

    if (item.due_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Desarmamos la fecha manual para evitar bugs de zonas horarias
        const [y, m, d] = item.due_date.split('T')[0].split('-');
        const dueDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));

        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (columnId === 'done') {
            // Si está terminada, la opacamos (no importa la fecha)
            cardBgColor =
                'bg-neutral-50/50 border-neutral-200 opacity-70 dark:bg-neutral-900/30 dark:border-neutral-800';
            dateIconColor = 'text-neutral-400';
        } else if (diffDays < 0) {
            // Expirada (Rojo)
            cardBgColor =
                'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50';
            dateIconColor = 'text-red-500 font-bold dark:text-red-400';
        } else if (diffDays <= 2) {
            // Faltan 2 días o menos (Amarillo)
            cardBgColor =
                'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900/50';
            dateIconColor = 'text-yellow-600 font-bold dark:text-yellow-500';
        } else {
            // A tiempo (Verde)
            cardBgColor =
                'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50';
            dateIconColor = 'text-emerald-600 font-bold dark:text-emerald-500';
        }
    } else if (columnId === 'done') {
        // Tareas sin fecha pero terminadas
        cardBgColor =
            'bg-neutral-50/50 border-neutral-200 opacity-70 dark:bg-neutral-900/30 dark:border-neutral-800';
    }

    return (
        <Draggable
            draggableId={item.id.toString()}
            index={index}
            isDragDisabled={!canModifyItem(item)}
        >
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    // Aplicamos el color dinámico a la clase principal de la tarjeta
                    className={`group mb-3 rounded-lg border p-4 shadow-sm transition-shadow select-none ${snapshot.isDragging ? 'bg-blue-50 ring-1 ring-blue-500/50 dark:bg-blue-900/20' : cardBgColor}`}
                    style={{ ...provided.draggableProps.style }}
                >
                    {/* Título y Basura */}
                    <div className="flex items-start justify-between gap-2">
                        <input
                            type="text"
                            defaultValue={item.title}
                            onBlur={(e) =>
                                handleTitleChange(
                                    item.id,
                                    e.target.value,
                                    columnId,
                                )
                            }
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    e.currentTarget.blur();
                                }
                            }}
                            // Hacemos el input del título transparente para que herede el color de la tarjeta
                            className="-ml-1 flex-1 rounded bg-transparent px-1 font-semibold text-neutral-900 transition-colors hover:bg-black/5 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none dark:text-neutral-100 dark:hover:bg-white/5 dark:focus:bg-neutral-900"
                            readOnly={!canModifyItem(item)}
                        />
                        {(canAssign || item.user_id === auth.user.id) && (
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1 text-neutral-400 opacity-0 transition-colors group-hover:opacity-100 hover:text-red-500 focus:opacity-100"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>

                    {/* --- NUEVO: DESCRIPCIÓN --- */}
                    <div className="mt-2">
                        <textarea
                            defaultValue={item.description || ''}
                            onBlur={(e) =>
                                handleDescriptionChange(
                                    item.id,
                                    e.target.value,
                                    columnId,
                                )
                            }
                            placeholder={
                                canModifyItem(item)
                                    ? 'Añadir una descripción...'
                                    : 'Sin descripción'
                            }
                            readOnly={!canModifyItem(item)}
                            rows={2} // Lo hacemos pequeño por defecto
                            className="w-full resize-y rounded bg-transparent px-1 py-1 text-xs text-neutral-600 transition-colors hover:bg-black/5 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none dark:text-neutral-400 dark:hover:bg-white/5 dark:focus:bg-neutral-900"
                            title="Haz clic para editar la descripción"
                        />
                    </div>

                    {/* Prioridad */}
                    <div className="mt-3 flex items-center justify-between">
                        <label className="text-xs text-neutral-500 dark:text-neutral-400">
                            Prioridad:
                        </label>
                        <select
                            value={item.priority}
                            onChange={(e) =>
                                handlePriorityChange(
                                    item.id,
                                    e.target.value,
                                    columnId,
                                )
                            }
                            disabled={!canModifyItem(item)}
                            className="rounded border border-neutral-200/50 bg-white/50 px-2 py-1 text-xs text-neutral-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700/50 dark:bg-black/20 dark:text-neutral-300"
                        >
                            <option value="low" className="dark:bg-neutral-900">
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

                    {/* SECCIÓN DE USUARIOS (Creador y Asignado) */}
                    <div className="mt-4 flex flex-col gap-2 border-t border-black/5 pt-3 dark:border-white/5">
                        {/* 1. CREADOR (De:) */}
                        <div className="flex items-center gap-2">
                            <span className="w-8 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                                De:
                            </span>
                            {item.user ? (
                                (() => {
                                    const { Icon, colorClass } =
                                        getUserIconAndColor(item.user.id);
                                    return (
                                        <>
                                            <div
                                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${colorClass}`}
                                            >
                                                <Icon
                                                    size={10}
                                                    strokeWidth={2.5}
                                                />
                                            </div>
                                            <span className="truncate text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                                {item.user.name}
                                            </span>
                                        </>
                                    );
                                })()
                            ) : (
                                <span className="text-xs text-neutral-500">
                                    Sistema
                                </span>
                            )}
                        </div>

                        {/* 2. ASIGNADO (Para:) */}
                        <div className="flex items-center gap-2">
                            <span className="w-8 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                                Para:
                            </span>
                            {item.assigned_user ? (
                                (() => {
                                    const { Icon, colorClass } =
                                        getUserIconAndColor(
                                            item.assigned_user.id,
                                        );
                                    return (
                                        <div
                                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${colorClass}`}
                                        >
                                            <Icon size={10} strokeWidth={2.5} />
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black/5 text-neutral-400 dark:bg-white/5">
                                    <User size={10} strokeWidth={2.5} />
                                </div>
                            )}

                            {canAssign ? (
                                <select
                                    className="h-6 cursor-pointer appearance-none rounded border-transparent bg-transparent py-0 pr-6 pl-1 text-xs font-medium text-neutral-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-transparent dark:text-neutral-400"
                                    value={item.assigned_user_id || ''}
                                    onChange={(e) =>
                                        handleAssignUser(
                                            item.id,
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">Sin asignar</option>
                                    {users.map((u: any) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <span className="truncate text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                    {item.assigned_user
                                        ? item.assigned_user.name
                                        : 'Sin asignar'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Categoría y Fecha */}
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={12} className={dateIconColor} />
                            <input
                                type="date"
                                value={
                                    item.due_date
                                        ? item.due_date.split('T')[0]
                                        : ''
                                }
                                onChange={(e) =>
                                    handleDueDateChange(item.id, e.target.value)
                                }
                                disabled={!canModifyItem(item)}
                                className={`cursor-pointer rounded border-none bg-transparent p-0 px-1 text-xs transition-colors hover:bg-black/5 focus:ring-0 focus:outline-none dark:hover:bg-white/5 ${dateIconColor}`}
                            />
                        </div>
                        {item.category && (
                            <span
                                className="inline-block rounded-md px-2 py-1 text-[10px] font-semibold text-white shadow-sm"
                                // Aquí inyectamos el color del CREADOR de la actividad, con un azul por defecto
                                style={{
                                    backgroundColor: item.user?.theme_color || '#3b82f6',
                                }}
                            >
        {item.category.name}
    </span>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
}
