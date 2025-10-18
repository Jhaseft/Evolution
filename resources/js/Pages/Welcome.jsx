import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Bienvenido a WaEvolution" />
            <div className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-16 bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-8 py-16">

                {/* Sección Izquierda */}
                <div className="md:w-1/2 text-center md:text-left space-y-6">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-800 dark:from-green-400 dark:to-green-600">
                        Enviador de Mensajes para WhatsApp
                    </h1>
                    <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300">
                        💬 El mejor enviador automático de mensajes para mantenerte conectado con tus contactos y clientes de forma rápida y gratuita.
                    </p>
                </div>

                {/* Sección Derecha (Login / Register) */}
                <div className="md:w-1/3 bg-gradient-to-br from-white via-green-50 to-green-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 
                                shadow-2xl rounded-3xl p-8 border-l-4 border-r-4 border-green-500 hover:shadow-green-600 transition-shadow duration-300">
                    <h2 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-900 dark:from-green-300 dark:to-green-500">
                        {auth.user
                            ? `Bienvenido de nuevo, ${auth.user.name} 👋`
                            : 'Accede a tu cuenta'}
                    </h2>

                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="block text-center w-full mb-3 px-4 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                        >
                            Ir al Panel
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="block w-full text-center mb-3 px-4 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                href={route('register')}
                                className="block w-full text-center px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                            >
                                Registrarse
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
