import { useState, useEffect } from 'react';
import bgImage from '../assets/DESCARGAR_CREDI_UNISA.jpg';

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Función para obtener los datos del server.js
    const fetchClients = async () => {
        try {
            // Asegúrate de que esta URL coincida con la ruta en tu server.js
            const response = await fetch('http://localhost:3002/api/clientes');

            if (!response.ok) {
                throw new Error('Error al obtener los datos');
            }

            const data = await response.json();
            setClients(data);
        } catch (err) {
            setError('No se pudo cargar la lista de clientes. Verifique la conexión con el servidor.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    return (
        <div
            className="min-h-screen flex flex-col p-4 relative overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            {/* Overlay oscuro */}
            <div className="absolute inset-0 bg-slate-900/60 z-0" />

            <div className="relative z-10 w-full max-w-6xl mx-auto mt-10">
                <h1 className="text-3xl font-bold text-white mb-6 drop-shadow-md border-b border-white/20 pb-4">
                    Módulo de Clientes
                </h1>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm">
                        {error}
                    </div>
                )}

                <div className="bg-white/20 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden border border-white/30">
                    {loading ? (
                        <div className="p-10 text-center text-white animate-pulse">
                            Cargando datos de clientes...
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-100">
                                <thead className="bg-slate-900/40 text-xs uppercase font-semibold text-white">
                                    <tr>
                                        <th className="px-6 py-4">Nombre</th>
                                        <th className="px-6 py-4">RIF</th>
                                        <th className="px-6 py-4">Teléfono</th>
                                        <th className="px-6 py-4">Direccion</th>
                                        <th className="px-6 py-4">Fecha Inicio</th>
                                        <th className="px-6 py-4">Fecha Fin</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {clients.length > 0 ? (
                                        clients.map((client, index) => (
                                            <tr key={index} className="hover:bg-white/10 transition-colors duration-150">
                                                <td className="px-6 py-4 font-medium text-white">
                                                    {client.Nombre || client.nombre}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {client.RIF || client.rif}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {client.Telefono || client.telefono}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {client.Direccion || client.direccion}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {client.FechaInicio ? new Date(client.FechaInicio).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {client.FechaFin ? new Date(client.FechaFin).toLocaleDateString() : '-'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-slate-300">
                                                No se encontraron clientes registrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
