import { Link, usePage } from '@inertiajs/react';
import {Kanban, Tags, BarChart3 } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const userRoles = auth.roles || [];

    const allNavItems = [
        {
            title: 'Métricas',
            href: '/metricas',
            icon: BarChart3,
            roles: ['administrador'],
        },
        {
            title: 'Tablero Kanban',
            href: '/kanban',
            icon: Kanban,
        },
        {
            title: 'Categorías',
            href: '/categorias',
            icon: Tags,
            roles: ['administrador'],
        },
    ];

    const filteredNavItems = allNavItems.filter((item) => {
        if (!item.roles) return true;
        return item.roles.some((role) => userRoles.includes(role));
    });
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/kanban" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
