
import { useState, useEffect, useRef } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-day-picker/style.css';

export default function DatePicker({ label, date, setDate }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);



    const handleSelect = (selectedDate) => {
        if (selectedDate) {
            // Adjust to local timezone to prevent off-by-one errors when converting to string
            // simple fix: keep it as date object in state, but when sending to API format it.
            // For this component, we accept string or Date, but let's standardize.
            // If the parent passes a string "YYYY-MM-DD", we parse it.

            // However, the parent uses "YYYY-MM-DD" strings for the state usually.
            // Let's converting the selection to that format for the parent.
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            setDate(formattedDate);
            setIsOpen(false);
        }
    };

    // Parse the current date string to a Date object for the picker
    const selected = date ? new Date(date + 'T12:00:00') : undefined;

    return (
        <div className="relative w-full" ref={containerRef}>
            {label && <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{label}</label>}

            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className={`w-full px-4 py-2.5 rounded-lg border flex items-center justify-between transition-all outline-none
                    ${isOpen
                        ? 'border-unisa-blue ring-2 ring-unisa-blue/20 bg-white dark:bg-slate-700'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-slate-400'
                    }
                    text-slate-900 dark:text-white
                `}
            >
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className={!date ? 'text-slate-400' : ''}>
                        {date ? format(new Date(date + 'T12:00:00'), 'P', { locale: es }) : 'Seleccionar fecha'}
                    </span>
                </div>
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)} // Close on backdrop click
                >
                    <div
                        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside content
                    >
                        <DayPicker
                            mode="single"
                            selected={selected}
                            onSelect={handleSelect}
                            locale={es}
                            showOutsideDays
                            className="!m-0"
                            classNames={{
                                caption: "flex justify-between items-center mb-4 px-2",
                                caption_label: "text-lg font-bold text-slate-800 dark:text-white capitalize",
                                nav: "flex gap-1",
                                nav_button: "p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors",
                                table: "w-full border-collapse",
                                head_cell: "text-slate-400 dark:text-slate-500 font-medium text-xs uppercase pb-2 w-10",
                                cell: "text-center p-0 relative focus-within:z-10",
                                day: "w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors outline-none focus:ring-2 focus:ring-unisa-blue focus:ring-offset-2",
                                day_selected: "!bg-unisa-blue !text-white hover:!bg-unisa-blue-dark shadow-md",
                                day_today: "bg-slate-50 dark:bg-slate-700/50 font-bold text-unisa-blue",
                            }}
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-500 hover:text-slate-700 text-sm font-medium px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
