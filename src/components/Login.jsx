import { useState } from 'react';
import bgImage from '../assets/DESCARGAR_CREDI_UNISA.jpg';
import logoImage from '../assets/logo.png';

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3002/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const foundUser = await response.json();
                setTimeout(() => {
                    onLogin(foundUser);
                }, 1000);
            } else {
                const data = await response.json();
                setError(data.message || 'Usuario o contraseña incorrectos');
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error en login:", error);
            setError('Error de conexión con el servidor');
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div
                className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-0" />
                <div className="relative z-10 flex flex-col items-center animate-pulse">
                    <svg className="w-24 h-24 text-white animate-spin mb-4 drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Iniciando...</h2>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-2 relative overflow-hidden bg-cover bg-center"
            style={{
                backgroundImage: `url(${bgImage})`
            }}
        >
            {/* Dark overlay for better text contrast */}
            <div className="absolute inset-0 bg-slate-900/40 z-0" />

            {/* Login Card */}
            <div className="bg-white/20 backdrop-blur-xl shadow-2xl rounded-2xl p-8 w-full max-w-md relative z-10 border border-white/30">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-6 rounded-2xl bg-white/10 backdrop-blur-sm shadow-lg p-3">
                        <img src={logoImage} alt="Logo UNISA" className="h-24 w-auto object-contain rounded-xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">Centro de Salud UNISA</h1>
                    <p className="text-slate-100 mt-2 text-sm font-medium uppercase tracking-wide drop-shadow">Consultas medicas y Realizacion de Estudios</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-2 rounded-lg text-sm text-center backdrop-blur-sm">
                            {error}
                        </div>
                    )}
                    <div>
                        <label htmlFor="username" className="block text-sm font-semibold text-white mb-2 ml-1 shadow-sm">
                            Usuario
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-white/50 border border-white/40 text-slate-900 placeholder-slate-700 focus:bg-white/70 focus:border-unisa-blue focus:ring-2 focus:ring-unisa-blue outline-none transition-all duration-200 backdrop-blur-sm"
                            placeholder="Ingrese su usuario"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="password" className="block text-sm font-semibold text-white ml-1 shadow-sm">
                                Contraseña
                            </label>
                        </div>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-white/50 border border-white/40 text-slate-900 placeholder-slate-700 focus:bg-white/70 focus:border-unisa-blue focus:ring-2 focus:ring-unisa-blue outline-none transition-all duration-200 backdrop-blur-sm"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-unisa-blue to-unisa-blue-dark hover:from-unisa-blue-dark hover:to-unisa-blue text-white font-bold py-3.5 rounded-lg shadow-lg shadow-black/20 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border border-transparent hover:border-white/20"
                    >
                        Iniciar Sesión
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-100">
                    ¿No tienes una cuenta?{' '}
                    <a href="#" className="font-bold text-unisa-blue hover:text-white transition-colors">
                        Contactar Administración
                    </a>
                </div>
            </div>
        </div>
    );
}
