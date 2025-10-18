import { useState } from "react";
import { Link } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";

export default function AppLayout({ user, children }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-gray-950 text-green-300">
            {/* HEADER */}
            <header className="w-full bg-black text-green-400 px-6 py-4 flex justify-between items-center shadow-md fixed top-0 left-0 z-50">
                {/* Nombre o logo */}
                <div className="flex items-center gap-8">
                    <a href="/" className="text-2xl font-bold tracking-wide select-none">
                        Whatevolution
                    </a>

                </div>

                {/* Perfil */}
                <div className="relative">
                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-2 focus:outline-none hover:opacity-80 transition"
                    >
                        <FaUserCircle className="text-3xl text-green-400" />
                    </button>

                    {/* Dropdown animado */}
                    <AnimatePresence>
                        {open && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="absolute right-0 mt-3 w-56 bg-gray-900 text-white rounded-xl shadow-lg p-4 border border-green-500"
                            >
                                <p className="text-sm text-green-300 font-semibold">
                                    {user?.name || "Usuario"}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {user?.email || "correo@ejemplo.com"}
                                </p>

                                <div className="mt-4 border-t   border-green-800 pt-3">
                                    <Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                        className="text-sm  text-red-400 hover:text-red-300 transition"
                                    >
                                        Cerrar sesión
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            {/* CONTENIDO */}
            <main className="flex-grow pt-24 pb-10 px-4 flex justify-center items-center">
                {children}
            </main>

            <footer className="bg-gray-950 h-0"></footer>
        </div>
    );
}
