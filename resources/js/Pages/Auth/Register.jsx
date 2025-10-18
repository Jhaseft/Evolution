import { Head, Link, useForm } from '@inertiajs/react';
import GoogleLoginButton from "./GoogleLoginButton";
export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'), // limpia los passwords
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <Head title="Register" />
            <form
                onSubmit={submit}
                className="w-full max-w-md p-8 bg-gradient-to-br from-gray-800 via-black to-gray-900
                           rounded-r-3xl border-l-4 border-r-4 border-green-500 shadow-2xl hover:shadow-green-600 transition-shadow duration-300"
            >
                <h2 className="text-2xl text-center mb-6 bg-clip-text text-transparent 
                               bg-gradient-to-r from-green-400 to-green-900 tracking-wide">
                    Crear Cuenta
                </h2>

                {/* Nombre */}
                <div className="mb-4">
                    <label htmlFor="name" className="block text-green-400 font-medium mb-1">Nombre</label>
                    <input
                        id="name"
                        name="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-green-400 bg-gray-800 text-green-200
                                   focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                    />
                    {errors.name && <p className="text-red-500 mt-1 text-sm">{errors.name}</p>}
                </div>

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
                    />
                    {errors.password && <p className="text-red-500 mt-1 text-sm">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="mb-6">
                    <label htmlFor="password_confirmation" className="block text-green-400 font-medium mb-1">Confirmar Contraseña</label>
                    <input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-green-400 bg-gray-800 text-green-200
                                   focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                    />
                    {errors.password_confirmation && <p className="text-red-500 mt-1 text-sm">{errors.password_confirmation}</p>}
                </div>

                {/* Botón y link */}
                <div className="flex items-center justify-between">
                    <Link
                        href={route('login')}
                        className="text-green-400 text-sm underline hover:text-green-300"
                    >
                        ¿Ya tienes cuenta?
                    </Link>

                    <button
                        type="submit"
                        disabled={processing}
                        className={`px-4 py-2 rounded-lg font-medium text-gray-900 
                                    ${processing ? 'bg-gray-600' : 'bg-green-400 hover:bg-green-500'} transition-colors duration-200`}
                    >
                        {processing ? 'Procesando...' : 'Registrarse'}
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
