import { useState, useEffect } from 'react';
import DatePicker from './ui/DatePicker';
import ChatWidget from './ChatWidget';

export default function ManagerDashboard({ onLogout, currentUser }) {
    const [activeTab, setActiveTab] = useState('inicio');
    const [users, setUsers] = useState([]);
    const [systemUsers, setSystemUsers] = useState([]);

    // Dark mode state
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' ||
                (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    // Dark mode effect
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const [showCreateUserForm, setShowCreateUserForm] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [newUser, setNewUser] = useState({
        Nombre: '',
        RIF: '',
        Direccion: '',
        Telefono: '',
        FechaInicio: new Date().toISOString().split('T')[0],
        FechaFin: '2026-12-31'
    });
    const [homeTab, setHomeTab] = useState('tareas');

    // System Users states
    const [showCreateSystemUserForm, setShowCreateSystemUserForm] = useState(false);
    const [selectedSystemUser, setSelectedSystemUser] = useState(null);
    const [showEditSystemUserModal, setShowEditSystemUserModal] = useState(false);
    const [newSystemUser, setNewSystemUser] = useState({
        nombre: '',
        rol: 'Vendedor',
        username: '',
        password: ''
    });

    // Cargar usuarios desde la base de datos al iniciar
    useEffect(() => {
        fetch('http://localhost:3002/api/clientes')
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.error("Error cargando usuarios:", err));
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3002/api/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });

            if (response.ok) {
                // Mostrar notificación de éxito
                setNotification({ show: true, message: '¡Cliente guardado exitosamente!', type: 'success' });

                // Recargar la lista de clientes desde la base de datos
                const refreshResponse = await fetch('http://localhost:3002/api/clientes');
                const updatedUsers = await refreshResponse.json();
                setUsers(updatedUsers);

                // Cerrar formulario y resetear
                setShowCreateUserForm(false);
                setNewUser({
                    Nombre: '',
                    RIF: '',
                    Direccion: '',
                    Telefono: '',
                    FechaInicio: new Date().toISOString().split('T')[0],
                    FechaFin: '2026-12-31'
                });

                // Ocultar notificación después de 3 segundos
                setTimeout(() => {
                    setNotification({ show: false, message: '', type: '' });
                }, 3000);
            } else {
                setNotification({ show: true, message: 'Error al guardar el cliente', type: 'error' });
                setTimeout(() => {
                    setNotification({ show: false, message: '', type: '' });
                }, 3000);
            }
        } catch (error) {
            console.error("Error creando usuario:", error);
            setNotification({ show: true, message: 'Error de conexión con el servidor', type: 'error' });
            setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 3000);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:3002/api/clientes/${selectedClient.RIF}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedClient)
            });

            if (response.ok) {
                setNotification({ show: true, message: '¡Cliente actualizado exitosamente!', type: 'success' });

                const refreshResponse = await fetch('http://localhost:3002/api/clientes');
                const updatedUsers = await refreshResponse.json();
                setUsers(updatedUsers);

                setShowEditModal(false);
                setSelectedClient(null);

                setTimeout(() => {
                    setNotification({ show: false, message: '', type: '' });
                }, 3000);
            } else {
                setNotification({ show: true, message: 'Error al actualizar el cliente', type: 'error' });
                setTimeout(() => {
                    setNotification({ show: false, message: '', type: '' });
                }, 3000);
            }
        } catch (error) {
            console.error("Error actualizando cliente:", error);
            setNotification({ show: true, message: 'Error de conexión con el servidor', type: 'error' });
            setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 3000);
        }
    };

    const handleRowClick = (user) => {
        setSelectedClient({ ...user });
        setShowEditModal(true);
    };

    // System Users Handlers
    useEffect(() => {
        if (activeTab === 'configuracion') {
            fetch('http://localhost:3002/api/system-users')
                .then(res => res.json())
                .then(data => setSystemUsers(data))
                .catch(err => console.error("Error cargando usuarios del sistema:", err));
        }
    }, [activeTab]);

    const handleCreateSystemUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3002/api/system-users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSystemUser)
            });

            if (response.ok) {
                setNotification({ show: true, message: '\u00a1Usuario creado exitosamente!', type: 'success' });
                setShowCreateSystemUserForm(false);
                setNewSystemUser({ nombre: '', rol: 'Vendedor', username: '', password: '' });

                // Refresh list
                const res = await fetch('http://localhost:3002/api/system-users');
                const data = await res.json();
                setSystemUsers(data);

                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            }
        } catch (error) {
            console.error("Error creando usuario:", error);
            setNotification({ show: true, message: 'Error al crear usuario', type: 'error' });
        }
    };

    const handleUpdateSystemUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:3002/api/system-users/${selectedSystemUser.username}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedSystemUser)
            });

            if (response.ok) {
                setNotification({ show: true, message: '\u00a1Usuario actualizado exitosamente!', type: 'success' });
                setShowEditSystemUserModal(false);
                setSelectedSystemUser(null);

                // Refresh list
                const res = await fetch('http://localhost:3002/api/system-users');
                const data = await res.json();
                setSystemUsers(data);

                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            }
        } catch (error) {
            console.error("Error actualizando usuario:", error);
            setNotification({ show: true, message: 'Error al actualizar usuario', type: 'error' });
        }
    };

    const handleSystemUserRowClick = (user) => {
        setSelectedSystemUser({ ...user, password: '' });
        setShowEditSystemUserModal(true);
    };


    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 flex flex-col items-center py-6 gap-6 fixed h-full z-20 shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 px-4 w-full">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-unisa-green to-unisa-blue flex items-center justify-center text-white font-bold shadow-lg shadow-unisa-blue/20 shrink-0">
                        U
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">Unisa</span>
                </div>

                <nav className="flex flex-col gap-2 mt-4 w-full px-4">
                    {[
                        {
                            id: 'inicio', label: 'Home', icon: (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            )
                        },
                        {
                            id: 'marketing', label: 'Panel', icon: (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            )
                        },
                        {
                            id: 'promocion', label: 'Servicios', icon: (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            )
                        },
                        {
                            id: 'clientes', label: 'Productos', icon: (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            )
                        },
                        {
                            id: 'gestion-usuarios', label: 'Clientes', icon: (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            )
                        },
                        {
                            id: 'plan', label: 'Plan', icon: (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            )
                        },
                        {
                            id: 'configuracion', label: 'Configuración', icon: (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            )
                        },
                    ].filter(item => (item.id !== 'gestion-usuarios' && item.id !== 'clientes') || currentUser?.role === 'Gerente' || true).map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`p-3 rounded-xl transition-all duration-200 group relative flex items-center gap-3 w-full ${activeTab === item.id
                                ? 'bg-unisa-blue text-white shadow-lg shadow-unisa-blue/30'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {item.icon}
                            </svg>
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-auto mb-4 w-full px-4">
                    <button
                        onClick={onLogout}
                        className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors w-full flex items-center gap-3"
                    >
                        <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto dark:text-slate-200 transition-all duration-300">
                {/* Header Section */}
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                            Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-unisa-blue to-unisa-blue-dark">{currentUser.name || 'Usuario'}</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-unisa-blue/30 text-unisa-blue font-semibold hover:bg-unisa-blue hover:text-white shadow-sm hover:shadow-md transition-all duration-300 group">
                            <div className="relative">
                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-unisa-green opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-unisa-green"></span>
                                </span>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <span>Chatear con UniAmigo</span>
                        </button>

                        {/* Theme Toggle Button */}
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-unisa-blue dark:hover:text-unisa-blue hover:border-unisa-blue dark:hover:border-unisa-blue shadow-sm transition-all"
                        >
                            {isDarkMode ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>
                        <button className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-unisa-blue hover:border-unisa-blue shadow-sm transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                            {/* Placeholder avatar */}
                            <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-slate-600 font-bold text-xs">U</div>
                        </div>
                    </div>
                </header>

                {/* Notification Toast */}
                {notification.show && (
                    <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-top-5 fade-in duration-300 ${notification.type === 'success'
                        ? 'bg-green-100 dark:bg-green-800 border-green-300 dark:border-green-600 text-green-900 dark:text-green-50'
                        : 'bg-red-100 dark:bg-red-800 border-red-300 dark:border-red-600 text-red-900 dark:text-red-50'
                        }`}>
                        {notification.type === 'success' ? (
                            <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        <span className="font-semibold">{notification.message}</span>
                    </div>
                )}

                {activeTab === 'gestion-usuarios' ? (
                    <div className="animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                {showCreateUserForm ? 'Crear Nuevo Cliente' : 'Gestión de Clientes'}
                            </h2>
                            {!showCreateUserForm && (
                                <button
                                    onClick={() => setShowCreateUserForm(true)}
                                    className="bg-unisa-blue hover:bg-unisa-blue-dark text-white px-4 py-2 rounded-lg font-medium shadow-md transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Crear Nuevo Cliente
                                </button>
                            )}
                        </div>

                        {showCreateUserForm ? (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 max-w-2xl mx-auto">
                                <form onSubmit={handleCreateUser} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nombre</label>
                                            <input
                                                required
                                                type="text"
                                                value={newUser.Nombre}
                                                onChange={(e) => {
                                                    const value = e.target.value.toUpperCase();
                                                    setNewUser({ ...newUser, Nombre: value });
                                                }}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-unisa-blue focus:border-transparent outline-none uppercase"
                                                placeholder="Ej. JUAN PEREZ"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">RIF</label>
                                            <input
                                                required
                                                type="text"
                                                value={newUser.RIF}
                                                onChange={(e) => {
                                                    const value = e.target.value.toUpperCase();
                                                    // Solo permite V, E, G, J seguido de guión y números
                                                    if (value === '' || /^[VEGJ](-\d{0,8})?$/.test(value)) {
                                                        setNewUser({ ...newUser, RIF: value });
                                                    }
                                                }}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-unisa-blue focus:border-transparent outline-none uppercase"
                                                placeholder="Ej. V-12345678"
                                                pattern="^[VEGJ]-\d{7,8}$"
                                                title="Formato: V-12345678 (V, E, G o J seguido de guión y 7-8 dígitos)"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Telefono</label>
                                            <input
                                                required
                                                type="text"
                                                value={newUser.Telefono}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    // Solo permite números y guiones
                                                    if (value === '' || /^[0-9-]*$/.test(value)) {
                                                        setNewUser({ ...newUser, Telefono: value });
                                                    }
                                                }}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-unisa-blue focus:border-transparent outline-none"
                                                placeholder="Ej. 0412-1234567"
                                                pattern="^[0-9-]+$"
                                                title="Solo se permiten números y guiones"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Dirección</label>
                                            <input
                                                required
                                                type="text"
                                                value={newUser.Direccion}
                                                onChange={(e) => {
                                                    const value = e.target.value.toUpperCase();
                                                    setNewUser({ ...newUser, Direccion: value });
                                                }}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-unisa-blue focus:border-transparent outline-none uppercase"
                                                placeholder="Ej. CALLE 123"
                                            />
                                        </div>
                                        <div>
                                            <DatePicker
                                                label="Fecha Inicio"
                                                date={newUser.FechaInicio}
                                                setDate={(date) => setNewUser({ ...newUser, FechaInicio: date })}
                                            />
                                        </div>
                                        <div>
                                            <DatePicker
                                                label="Fecha Fin"
                                                date={newUser.FechaFin}
                                                setDate={(date) => setNewUser({ ...newUser, FechaFin: date })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateUserForm(false)}
                                            className="px-6 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 rounded-lg bg-unisa-blue hover:bg-unisa-blue-dark text-white font-medium shadow-md hover:shadow-lg transition-all"
                                        >
                                            Guardar Cliente
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Nombre</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Rif</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Direccion</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Telefono</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Fecha Inicio</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Fecha Fin</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user, index) => (
                                            <tr key={index} onClick={() => handleRowClick(user)} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer">
                                                <td className="p-4 font-medium text-slate-700 dark:text-slate-200">
                                                    {user.Nombre}
                                                </td>
                                                <td className="p-4 text-slate-600 dark:text-slate-400">
                                                    {user.RIF}
                                                </td>
                                                <td className="p-4 text-slate-600 dark:text-slate-400">
                                                    {user.Direccion}
                                                </td>
                                                <td className="p-4 text-slate-600 dark:text-slate-400">
                                                    {user.Telefono}
                                                </td>
                                                <td className="p-4 text-slate-600 dark:text-slate-400">
                                                    {user.FechaInicio ? new Date(user.FechaInicio).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="p-4 text-right text-slate-600 dark:text-slate-400">
                                                    {user.FechaFin ? new Date(user.FechaFin).toLocaleDateString() : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Edit Client Modal */}
                        {showEditModal && selectedClient && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8 max-w-2xl w-full mx-4 animate-in zoom-in-95 duration-200">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Editar Cliente</h2>
                                        <button
                                            onClick={() => setShowEditModal(false)}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                        >
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <form onSubmit={handleUpdateUser} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nombre</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={selectedClient.Nombre}
                                                    onChange={(e) => {
                                                        const value = e.target.value.toUpperCase();
                                                        setSelectedClient({ ...selectedClient, Nombre: value });
                                                    }}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-unisa-blue focus:border-transparent outline-none uppercase"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">RIF</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={selectedClient.RIF}
                                                    onChange={(e) => {
                                                        const value = e.target.value.toUpperCase();
                                                        // Solo permite V, E, G, J seguido de guión y números
                                                        if (value === '' || /^[VEGJ](-\d{0,8})?$/.test(value)) {
                                                            setSelectedClient({ ...selectedClient, RIF: value });
                                                        }
                                                    }}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-unisa-blue focus:border-transparent outline-none uppercase"
                                                    pattern="^[VEGJ]-\d{7,8}$"
                                                    title="Formato: V-12345678 (V, E, G o J seguido de guión y 7-8 dígitos)"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Teléfono</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={selectedClient.Telefono}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        // Solo permite números y guiones
                                                        if (value === '' || /^[0-9-]*$/.test(value)) {
                                                            setSelectedClient({ ...selectedClient, Telefono: value });
                                                        }
                                                    }}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-unisa-blue focus:border-transparent outline-none"
                                                    pattern="^[0-9-]+$"
                                                    title="Solo se permiten números y guiones"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Dirección</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={selectedClient.Direccion}
                                                    onChange={(e) => {
                                                        const value = e.target.value.toUpperCase();
                                                        setSelectedClient({ ...selectedClient, Direccion: value });
                                                    }}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-unisa-blue focus:border-transparent outline-none uppercase"
                                                />
                                            </div>
                                            <div>
                                                <DatePicker
                                                    label="Fecha Inicio"
                                                    date={selectedClient.FechaInicio ? selectedClient.FechaInicio.split('T')[0] : ''}
                                                    setDate={(date) => setSelectedClient({ ...selectedClient, FechaInicio: date })}
                                                />
                                            </div>
                                            <div>
                                                <DatePicker
                                                    label="Fecha Fin"
                                                    date={selectedClient.FechaFin ? selectedClient.FechaFin.split('T')[0] : ''}
                                                    setDate={(date) => setSelectedClient({ ...selectedClient, FechaFin: date })}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-4 justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                                            <button
                                                type="button"
                                                onClick={() => setShowEditModal(false)}
                                                className="px-6 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2 rounded-lg bg-unisa-blue hover:bg-unisa-blue-dark text-white font-medium shadow-md hover:shadow-lg transition-all"
                                            >
                                                Actualizar Cliente
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'configuracion' ? (
                    <div className="animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                {showCreateSystemUserForm ? 'Crear Nuevo Usuario de Sistema' : 'Configuración de Usuarios'}
                            </h2>
                            {!showCreateSystemUserForm && (
                                <button
                                    onClick={() => setShowCreateSystemUserForm(true)}
                                    className="bg-unisa-blue hover:bg-unisa-blue-dark text-white px-4 py-2 rounded-lg font-medium shadow-md transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Crear Nuevo Usuario
                                </button>
                            )}
                        </div>

                        {showCreateSystemUserForm ? (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 max-w-2xl mx-auto">
                                <form onSubmit={handleCreateSystemUser} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nombre Completo</label>
                                            <input
                                                required
                                                type="text"
                                                value={newSystemUser.nombre}
                                                onChange={(e) => setNewSystemUser({ ...newSystemUser, nombre: e.target.value.toUpperCase() })}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-unisa-blue focus:border-transparent outline-none uppercase"
                                                placeholder="Ej. JUAN PEREZ"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Rol</label>
                                            <select
                                                value={newSystemUser.rol}
                                                onChange={(e) => setNewSystemUser({ ...newSystemUser, rol: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-unisa-blue focus:border-transparent outline-none"
                                            >
                                                <option value="Vendedor">Vendedor</option>
                                                <option value="Gerente">Gerente</option>
                                                <option value="Administrador">Administrador</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nombre de Usuario</label>
                                            <input
                                                required
                                                type="text"
                                                value={newSystemUser.username}
                                                onChange={(e) => setNewSystemUser({ ...newSystemUser, username: e.target.value.toLowerCase() })}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-unisa-blue focus:border-transparent outline-none"
                                                placeholder="ej. jperez"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Contraseña</label>
                                            <input
                                                required
                                                type="password"
                                                value={newSystemUser.password}
                                                onChange={(e) => setNewSystemUser({ ...newSystemUser, password: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-unisa-blue focus:border-transparent outline-none"
                                                placeholder="********"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateSystemUserForm(false)}
                                            className="px-6 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 rounded-lg bg-unisa-blue hover:bg-unisa-blue-dark text-white font-medium shadow-md hover:shadow-lg transition-all"
                                        >
                                            Guardar Usuario
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Nombre</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Usuario</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Rol</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {systemUsers.map((user, index) => (
                                            <tr key={index} onClick={() => handleSystemUserRowClick(user)} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer">
                                                <td className="p-4 font-medium text-slate-700 dark:text-slate-200">
                                                    {user.nombre}
                                                </td>
                                                <td className="p-4 text-slate-600 dark:text-slate-400">
                                                    {user.username}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.rol === 'Gerente' || user.rol === 'Administrador'
                                                        ? 'bg-unisa-blue/10 text-unisa-blue'
                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                                        }`}>
                                                        {user.rol}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Edit System User Modal */}
                        {showEditSystemUserModal && selectedSystemUser && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8 max-w-2xl w-full mx-4 animate-in zoom-in-95 duration-200">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Editar Usuario</h2>
                                        <button
                                            onClick={() => setShowEditSystemUserModal(false)}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                        >
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <form onSubmit={handleUpdateSystemUser} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nombre Completo</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={selectedSystemUser.nombre}
                                                    onChange={(e) => setSelectedSystemUser({ ...selectedSystemUser, nombre: e.target.value.toUpperCase() })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-unisa-blue focus:border-transparent outline-none uppercase"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Rol</label>
                                                <select
                                                    value={selectedSystemUser.rol}
                                                    onChange={(e) => setSelectedSystemUser({ ...selectedSystemUser, rol: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-unisa-blue focus:border-transparent outline-none"
                                                >
                                                    <option value="Vendedor">Vendedor</option>
                                                    <option value="Gerente">Gerente</option>
                                                    <option value="Administrador">Administrador</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nombre de Usuario</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={selectedSystemUser.username}
                                                    onChange={(e) => setSelectedSystemUser({ ...selectedSystemUser, username: e.target.value.toLowerCase() })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-unisa-blue focus:border-transparent outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nueva Contraseña (opcional)</label>
                                                <input
                                                    type="password"
                                                    value={selectedSystemUser.password || ''}
                                                    onChange={(e) => setSelectedSystemUser({ ...selectedSystemUser, password: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-unisa-blue focus:border-transparent outline-none"
                                                    placeholder="Dejar en blanco para no cambiar"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-4 justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                                            <button
                                                type="button"
                                                onClick={() => setShowEditSystemUserModal(false)}
                                                className="px-6 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2 rounded-lg bg-unisa-blue hover:bg-unisa-blue-dark text-white font-medium shadow-md hover:shadow-lg transition-all"
                                            >
                                                Actualizar Usuario
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Welcome & Stats */}
                        <div className="mb-8">
                            <p className="text-xl text-slate-600 font-medium mb-6">Tu agenda de hoy parece tranquila. ¿Qué deseas hacer?</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Card 1 */}
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer group">
                                    <div className="w-12 h-12 rounded-xl bg-unisa-blue/10 text-unisa-blue flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Gestión de Promociones</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Crea nuevas ofertas o modifica las promociones vigentes.</p>
                                    <span className="text-unisa-blue text-sm font-semibold group-hover:underline flex items-center gap-1">
                                        Ir a promociones <span className="text-lg">&rarr;</span>
                                    </span>
                                </div>

                                {/* Card 2 */}
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer group">
                                    <div className="w-12 h-12 rounded-xl bg-unisa-blue-dark/10 text-unisa-blue-dark flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Gestión de Marketing</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Crea o modifica nuevas ideas y estrategias de marketing.</p>
                                    <span className="text-unisa-blue-dark text-sm font-semibold group-hover:underline flex items-center gap-1">
                                        Ver estrategias <span className="text-lg">&rarr;</span>
                                    </span>
                                </div>

                                {/* Card 3 - Stats Summary */}
                                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg text-white">
                                    <h3 className="text-lg font-bold text-white mb-4">Resumen Diario</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                                            <span className="text-slate-300 text-sm">Ideas de Marketing</span>
                                            <span className="text-2xl font-bold text-unisa-green">12</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                                            <span className="text-slate-300 text-sm">Promociones Activas</span>
                                            <span className="text-2xl font-bold text-unisa-blue">5</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Planning Section (Tasks & Calendar) */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden min-h-[500px]">
                            {/* Tabs Header */}
                            <div className="flex border-b border-slate-100">
                                <button
                                    onClick={() => setHomeTab('tareas')}
                                    className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${homeTab === 'tareas' ? 'border-unisa-blue text-unisa-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    Tareas
                                </button>
                                <button
                                    onClick={() => setHomeTab('calendario')}
                                    className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${homeTab === 'calendario' ? 'border-unisa-blue text-unisa-blue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    Calendario
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {homeTab === 'tareas' ? (
                                    <div className="animate-fade-in">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex gap-2">
                                                <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold">Todos (7)</span>
                                                <span className="text-slate-400 dark:text-slate-500 px-3 py-1 rounded-full text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">Vencen hoy</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <input type="text" placeholder="Buscar..." className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-unisa-blue dark:text-white" />
                                                <button className="bg-unisa-blue text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-unisa-blue-dark transition-colors">
                                                    + Crear Tarea
                                                </button>
                                            </div>
                                        </div>

                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                                                    <th className="py-3 pl-4 w-10">
                                                        <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-unisa-blue focus:ring-unisa-blue bg-white dark:bg-slate-700" />
                                                    </th>
                                                    <th className="py-3 font-semibold text-slate-500 dark:text-slate-400">Estado</th>
                                                    <th className="py-3 font-semibold text-slate-500 dark:text-slate-400">Título</th>
                                                    <th className="py-3 font-semibold text-slate-500 dark:text-slate-400">Vencimiento</th>
                                                    <th className="py-3 font-semibold text-slate-500 dark:text-slate-400">Asignado a</th>
                                                    <th className="py-3 font-semibold text-slate-500 dark:text-slate-400 text-right pr-4">Prioridad</th>
                                                </tr>
                                            </thead>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="animate-fade-in min-h-[600px] mr-2">
                                        <div className="h-full flex flex-col">
                                            <div className="flex justify-between mb-4">
                                                <h3 className="text-lg font-bold text-slate-700 dark:text-white">Mayo 2025</h3>
                                                <div className="flex gap-2">
                                                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded dark:text-slate-300"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                                                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded dark:text-slate-300"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-7 text-center mb-2">
                                                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                                                    <div key={d} className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">{d}</div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-7 flex-1 border-t border-l border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-700 gap-px">
                                                {/* Calendar Days Mock */}
                                                {Array.from({ length: 35 }).map((_, i) => {
                                                    const day = i - 2; // Offset for starting day
                                                    const isCurrentMonth = day > 0 && day <= 31;
                                                    return (
                                                        <div key={i} className={`bg-white dark:bg-slate-800 p-2 min-h-[100px] relative ${!isCurrentMonth && 'bg-slate-50/50 dark:bg-slate-800/50'}`}>
                                                            <span className={`text-sm ${isCurrentMonth ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600'}`}>{day > 0 && day <= 31 ? day : ''}</span>

                                                            {/* Fake Events */}
                                                            {day === 8 && (
                                                                <div className="mt-1 bg-unisa-blue/10 text-unisa-blue text-[10px] font-bold px-1 py-0.5 rounded border-l-2 border-unisa-blue truncate">
                                                                    Lanzamiento Promo
                                                                </div>
                                                            )}
                                                            {day === 15 && (
                                                                <div className="mt-1 bg-purple-100 text-purple-600 text-[10px] font-bold px-1 py-0.5 rounded border-l-2 border-purple-500 truncate">
                                                                    Webinar Salud
                                                                </div>
                                                            )}
                                                            {day === 24 && (
                                                                <div className="mt-1 bg-orange-100 text-orange-600 text-[10px] font-bold px-1 py-0.5 rounded border-l-2 border-orange-500 truncate">
                                                                    Cierre Mes
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
            <ChatWidget />
        </div>
    );
}
