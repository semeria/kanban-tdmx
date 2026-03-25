import { Transition } from '@headlessui/react';
import { Form, Head, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuración de Perfil',
        href: edit(),
    },
];

export default function Profile() {
    const { auth } = usePage().props as any;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración de Perfil" />

            <h1 className="sr-only">Configuración de Perfil</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Información del Perfil"
                        description="Actualiza tu nombre y opciones de personalización."
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Nombre completo"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                {/* --- CAMPO DE CORREO (BLOQUEADO) --- */}
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="email"
                                        className="text-neutral-500"
                                    >
                                        Correo electrónico
                                    </Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        // Agregamos clases para que se vea gris y con cursor bloqueado
                                        className="mt-1 block w-full cursor-not-allowed bg-neutral-100 text-neutral-500 opacity-70 focus-visible:ring-0 dark:bg-neutral-800 dark:text-neutral-400"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        readOnly // <--- Esto bloquea la edición pero permite que se envíe el dato
                                        autoComplete="username"
                                        title="El correo no se puede modificar. Contacta al administrador."
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>
                                {/* ----------------------------------- */}

                                {/* --- NUEVO CAMPO: COLOR DE TEMA --- */}
                                <div className="mt-4 grid gap-2">
                                    <Label htmlFor="theme_color">
                                        Color de personalización
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            id="theme_color"
                                            type="color"
                                            name="theme_color"
                                            defaultValue={
                                                auth.user.theme_color ||
                                                '#3b82f6'
                                            }
                                            className="h-10 w-14 cursor-pointer p-1"
                                            title="Elige tu color personalizado"
                                        />
                                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                            Selecciona tu color preferido
                                        </span>
                                    </div>
                                    <InputError
                                        className="mt-2"
                                        message={errors.theme_color}
                                    />
                                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                        Este color se usará para personalizar tu
                                        experiencia visual en la plataforma.
                                    </p>
                                </div>
                                {/* ---------------------------------- */}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Guardar cambios
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                            Guardado
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
