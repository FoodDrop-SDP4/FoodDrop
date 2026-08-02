"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setStatusMessage(isLogin ? "Signed in successfully." : "Account created successfully.");

        window.setTimeout(() => {
            router.push("/");
        }, 500);
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4 py-12 text-zinc-900">
            <section className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-black/5">
                <div className="flex flex-col items-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 shadow-sm shadow-orange-100">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-950">
                        <span className="text-orange-600">Food</span>Drop
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                        {isLogin ? "Welcome back to your favorite food delivery experience." : "Create your FoodDrop account and start ordering faster."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    {!isLogin ? (
                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-zinc-700">Full Name</span>
                            <input required type="text" placeholder="Your full name" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" />
                        </label>
                    ) : null}

                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-zinc-700">Email</span>
                        <input required type="email" placeholder="you@example.com" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" />
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-zinc-700">Password</span>
                        <div className="relative">
                            <input required type={showPassword ? "text" : "password"} placeholder="Enter your password" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all pr-12" />
                            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400 transition hover:text-zinc-700" aria-label={showPassword ? "Hide password" : "Show password"}>
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </label>

                    {!isLogin ? (
                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-zinc-700">Confirm Password</span>
                            <input required type="password" placeholder="Confirm your password" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all" />
                        </label>
                    ) : null}

                    {isLogin ? (
                        <div className="flex justify-end">
                            <Link href="/" className="text-sm font-medium text-orange-600 transition hover:text-orange-700">
                                Forgot Password?
                            </Link>
                        </div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-orange-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isLogin ? "Sign In" : "Create Account"}
                    </button>

                    {statusMessage ? (
                        <p className="text-center text-sm font-medium text-green-600">{statusMessage}</p>
                    ) : null}
                </form>

                <div className="my-6 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    <span className="h-px flex-1 bg-zinc-200" />
                    <span>Or continue with</span>
                    <span className="h-px flex-1 bg-zinc-200" />
                </div>

                <div className="space-y-3">
                    {/* Google Premium Button */}
                    <button type="button" className="w-full py-3.5 border border-gray-200 rounded-2xl flex items-center justify-center gap-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition transform active:scale-[0.99] bg-white">
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.33 0 3.357 2.72 1.5 6.666l3.766 3.099z"/>
                            <path fill="#34A853" d="M16.04 15.345c-1.077.736-2.427 1.164-4.04 1.164-3.055 0-5.645-2.073-6.573-4.855L1.64 14.74C3.527 18.52 7.464 21.09 12 21.09c3.073 0 5.864-1.018 7.973-2.855l-3.933-2.89z"/>
                            <path fill="#4285F4" d="M23.49 12.275c0-.79-.073-1.545-.19-2.275H12v4.51h6.464c-.29 1.48-1.145 2.735-2.427 3.582l3.933 2.89c2.3-2.127 3.52-5.255 3.52-8.707z"/>
                            <path fill="#FBBC05" d="M5.427 11.655A6.99 6.99 0 0 1 5.427 9.8L1.66 6.702a11.962 11.962 0 0 0 0 10.598l3.766-3.099c-.19-.536-.29-1.118-.29-1.745z"/>
                        </svg>
                        Continue with Google
                    </button>

                    {/* Facebook Premium Button */}
                    <button type="button" className="w-full py-3.5 border border-gray-200 rounded-2xl flex items-center justify-center gap-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition transform active:scale-[0.99] bg-white">
                        <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Continue with Facebook
                    </button>
                </div>

                <div className="mt-6 text-center text-sm text-zinc-600">
                    {isLogin ? (
                        <button type="button" onClick={() => setIsLogin(false)} className="font-semibold text-orange-600 transition hover:text-orange-700">
                            Don’t have an account? Sign up
                        </button>
                    ) : (
                        <button type="button" onClick={() => setIsLogin(true)} className="font-semibold text-orange-600 transition hover:text-orange-700">
                            Already have an account? Log in
                        </button>
                    )}
                </div>
            </section>
        </main>
    );
}