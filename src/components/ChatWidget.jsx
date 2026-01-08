
import React, { useState, useRef, useEffect } from 'react';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '¡Hola! Soy UniAmigo. ¿En qué puedo ayudarte hoy con la base de datos?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3002/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input, history: messages })
            });

            const data = await response.json();

            if (data.error) {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error: ' + data.error }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexión con el servidor.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end max-w-[calc(100vw-3rem)]">
            {isOpen && (
                <div className="w-full sm:w-[380px] md:w-[420px] h-[500px] max-h-[calc(100vh-120px)] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 dark:border-slate-700/50 overflow-hidden flex flex-col mb-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8">

                    {/* Background Logo Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.05] overflow-hidden">
                        <div className="text-[300px] font-black select-none transform -rotate-12">U</div>
                    </div>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-unisa-blue to-unisa-blue-dark p-5 flex justify-between items-center text-white relative z-10 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
                                <div className="text-white font-bold text-lg">U</div>
                            </div>
                            <div>
                                <h3 className="font-bold text-base leading-tight">UniAmigo IA</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-unisa-green rounded-full animate-pulse"></span>
                                    <span className="text-[10px] text-white/80 font-medium uppercase tracking-wider">En línea</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-all duration-200 active:scale-90"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 relative z-10 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user'
                                    ? 'bg-unisa-blue text-white rounded-tr-none font-medium'
                                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                                    }`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start animate-pulse">
                                <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm flex gap-1.5 items-center">
                                    <div className="w-1.5 h-1.5 bg-unisa-blue rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-unisa-blue rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-unisa-blue rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 relative z-10">
                        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-unisa-blue/50 transition-all duration-300">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Escribe tu duda aquí..."
                                className="flex-1 bg-transparent border-none px-3 py-2 text-sm focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="w-10 h-10 flex items-center justify-center bg-unisa-blue hover:bg-unisa-blue-dark text-white rounded-xl transition-all duration-300 disabled:opacity-30 disabled:grayscale shadow-lg shadow-unisa-blue/20"
                            >
                                <svg className="w-5 h-5 transform rotate-45 -translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-slate-400 mt-3 font-medium uppercase tracking-tighter opacity-50">UniAmigo IA powered by Google Gemini</p>
                    </div>
                </div>
            )}

            {/* Main Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex items-center justify-center"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-unisa-blue to-unisa-blue-dark rounded-full blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative w-16 h-16 bg-unisa-blue hover:bg-unisa-blue-dark rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 text-white overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
                        <svg className="w-8 h-8 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>

                    {/* Tooltip */}
                    <div className="absolute right-20 bg-slate-900 text-white text-xs font-bold py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-xl border border-white/10">
                        ¿En qué puedo ayudarte?
                        <div className="absolute top-1/2 -right-1 w-2 h-2 bg-slate-900 rotate-45 -translate-y-1/2"></div>
                    </div>
                </button>
            )}
        </div>
    );
};

export default ChatWidget;
