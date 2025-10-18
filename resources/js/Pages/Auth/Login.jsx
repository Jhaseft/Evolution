import { useState } from "react";
import { Head, Link, useForm } from '@inertiajs/react';
import GoogleLoginButton from "./GoogleLoginButton";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'), // limpia el password
            preserveState: true, // opcional para mantener otros campos
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <Head title="Login" />

            <form
                onSubmit={submit}
                className="w-full max-w-md p-8 bg-gradient-to-br from-gray-800 via-black to-gray-900
                           rounded-r-3xl border-l-4 border-r-4 border-green-500 shadow-2xl hover:shadow-green-600 transition-shadow duration-300"
            >
                <h2 className="text-2xl text-center mb-6 bg-clip-text text-transparent 
                               bg-gradient-to-r from-green-400 to-green-900 tracking-wide">
                    Iniciar Sesión
                </h2>

                {status && <div className="mb-4 text-sm font-medium text-green-400">{status}</div>}

                {/* Email */}
                <div className="mb-4">
                    <label htmlFor="email" className="block text-green-400 font-medium mb-1">Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-green-400 bg-gray-800 text-green-200
                                   focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                        autoComplete="username"
                    />
                    {errors.email && <p className="text-red-500 mt-1 text-sm">{errors.email}</p>}
                </div>

                {/* Password */}
                <div className="mb-4">
                    <label htmlFor="password" className="block text-green-400 font-medium mb-1">Contraseña</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-green-400 bg-gray-800 text-green-200
                                   focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                        autoComplete="current-password"
                    />
                    {errors.password && <p className="text-red-500 mt-1 text-sm">{errors.password}</p>}
                </div>

                {/* Remember Me */}
                <div className="mb-6 flex items-center">
                    <input
                        id="remember"
                        type="checkbox"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="h-4 w-4 text-green-400 focus:ring-green-500 border-gray-600 rounded"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-green-200">
                        Recordarme
                    </label>
                </div>

                {/* Botón y link */}
                <div className="flex items-center justify-between">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-green-400 text-sm underline hover:text-green-300"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    )}

                    <button
                        type="submit"
                        disabled={processing}
                        className={`px-4 py-2 rounded-lg font-medium text-gray-900
                                    ${processing ? 'bg-gray-600' : 'bg-green-400 hover:bg-green-500'} transition-colors duration-200`}
                    >
                        {processing ? 'Procesando...' : 'Iniciar Sesión'}
                    </button>
                </div>
                {/* Botón de Google */}
                <div className="mt-6">
                   <GoogleLoginButton/>
                </div>
            </form>
        </div>
    );
}
