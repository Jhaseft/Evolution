"use client";
import React from "react";
import { FcGoogle } from "react-icons/fc";

export default function GoogleLoginButton() {
  return (
    <a
      href={route("google.redirect")}
      className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl 
                 border border-green-500 bg-black text-green-400 
                 hover:bg-green-600 hover:text-black transition-all duration-300 
                 shadow-[0_0_15px_rgba(34,197,94,0.5)] hover:shadow-[0_0_25px_rgba(34,197,94,0.8)]
                 active:scale-95 focus:ring-2 focus:ring-green-400 focus:outline-none"
    >
      <FcGoogle className="text-2xl bg-white rounded-full p-[2px]" />
      <span className="font-semibold text-sm sm:text-base tracking-wide">
        Continuar con Google
      </span>
    </a>
  );
}
