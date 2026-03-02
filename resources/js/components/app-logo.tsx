export default function AppLogo() {
    return (
        <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-transparent">
                <img
                    src="https://tudestinomx-bucket.storage.googleapis.com/wp-content/uploads/2024/10/23150122/tdmx_logo_footer.png"
                    alt="Logo"
                    className="h-full w-full object-contain"
                />
            </div>

            <div className="flex flex-col">
                <span className="text-sm leading-none font-bold text-neutral-900 dark:text-neutral-100">
                    Kanban TDMX
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    Control de tareas pendientes
                </span>
            </div>
        </div>
    );
}
