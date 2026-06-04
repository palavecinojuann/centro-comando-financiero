import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface MiniCalendarProps {
    currentDate?: Date;
    transacciones: any[];
    onClose?: () => void;
    onDateClick?: (date: Date, transactions: any[]) => void;
}

export function MiniCalendar({ currentDate: initialDate = new Date(), transacciones = [], onClose, onDateClick }: MiniCalendarProps) {
    const [viewDate, setViewDate] = React.useState(new Date(initialDate));
    
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday...

    const days = [];
    for(let i = 0; i < firstDayIndex; i++) {
        days.push(null);
    }
    for(let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const nextMonth = () => {
        setViewDate(new Date(year, month + 1, 1));
    };

    const prevMonth = () => {
        setViewDate(new Date(year, month - 1, 1));
    };

    const goToToday = () => {
        setViewDate(new Date());
    };

    const getDateFromFirebase = (f: any) => {
        if (!f) return null;
        if (f.toDate) return f.toDate();
        if (f.seconds) return new Date(f.seconds * 1000);
        const d = new Date(f);
        return isNaN(d.getTime()) ? null : d;
    }

    const getTransactionsForDay = (day: number) => {
        if (!Array.isArray(transacciones)) return [];
        return transacciones.filter(t => {
            const date = getDateFromFirebase(t.fecha || t.fechaGasto || t.fechaIngreso || t.fechaInyeccion || t.fechaVencimiento);
            if (!date) return false;
            
            return date.getFullYear() === year && 
                   date.getMonth() === month && 
                   date.getDate() === day;
        });
    }

    const handleDayClick = (day: number, dayTransactions: any[]) => {
        if (!onDateClick) return;
        const selectedDate = new Date(year, month, day);
        onDateClick(selectedDate, dayTransactions);
        if (onClose) onClose();
    }

    const monthName = viewDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

    return (
        <div className="bg-bunker-panel/50 border border-white/5 rounded-2xl p-6 font-sans relative overflow-hidden group">
            {/* Iluminación sutil de fondo */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-bunker-limonDim rounded-full blur-[50px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            {/* Controles de Navegación */}
            <div className="flex items-center justify-between mb-8 px-1 relative z-10">
                <button 
                    onClick={prevMonth}
                    className="p-3 rounded-xl bg-black border border-white/5 hover:border-bunker-limon/30 transition-all text-bunker-mutado hover:text-bunker-limon active:scale-90 cursor-pointer"
                    title="Mes Anterior"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                
                <button 
                    onClick={goToToday}
                    className="flex flex-col items-center group/today hover:scale-105 transition-all cursor-pointer"
                >
                    <span className="text-[9px] font-black text-bunker-limon uppercase tracking-[0.3em] mb-1">
                        Auditoría de Flujos
                    </span>
                    <span className="text-base font-black text-white uppercase tracking-tight font-sans">
                        {monthName}
                    </span>
                </button>

                <button 
                    onClick={nextMonth}
                    className="p-3 rounded-xl bg-black border border-white/5 hover:border-bunker-limon/30 transition-all text-bunker-mutado hover:text-bunker-limon active:scale-90 cursor-pointer"
                    title="Mes Siguiente"
                >
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-6 text-center border-b border-white/5 pb-4 relative z-10">
                {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].map((d, i) => (
                    <div key={i} className="text-[9px] font-black text-bunker-mutado uppercase tracking-widest">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-3 relative z-10">
                {days.map((day, i) => {
                    if (day === null) return <div key={i} className="h-12"></div>;
                    
                    const dayTransactions = getTransactionsForDay(day);
                    const selectedDate = new Date(year, month, day);
                    const isToday = selectedDate.toDateString() === today.toDateString();
                    const isFuture = selectedDate > today;

                    const incomeTotal = dayTransactions.filter(t => t.type === 'ingreso' || t.type === 'janlu' || t.esIngreso).reduce((acc, t) => acc + (t.monto || 0), 0);
                    const expenseTotal = dayTransactions.filter(t => t.type === 'gasto' || t.type === 'deuda' || (!t.esIngreso && t.monto)).reduce((acc, t) => acc + (t.monto || 0), 0);
                    
                    const hasIncome = incomeTotal > 0;
                    const hasExpense = expenseTotal > 0;

                    let title = `Día ${day}`;
                    if (isFuture) title = `Día ${day} - Auditoría Proyectada`;
                    if (hasIncome) title += `\nEntradas: $${incomeTotal.toLocaleString()}`;
                    if (hasExpense) title += `\nSalidas: $${expenseTotal.toLocaleString()}`;

                    return (
                        <div 
                            key={i} 
                            onClick={() => handleDayClick(day, dayTransactions)}
                            className={`relative h-12 flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all hover:scale-105 active:scale-95 group/day ${isToday ? 'bg-bunker-limon shadow-[0_0_15px_rgba(204,255,0,0.3)] text-black border border-bunker-limon' : 'hover:bg-white/5 border border-transparent'}`} 
                            title={title}
                        >
                            <span className={`text-xs font-black font-sans ${isToday ? 'text-black font-bold' : isFuture ? 'text-bunker-limon/50 opacity-50 italic' : hasExpense ? 'text-white' : 'text-slate-400'}`}>
                                {day}
                            </span>
                            <div className="absolute bottom-2 w-full flex justify-center gap-1.5 px-1">
                               {hasIncome && <div className={`w-1 h-1 rounded-full ${isToday ? 'bg-black' : 'bg-bunker-limon'}`}></div>}
                               {hasExpense && <div className={`w-1 h-1 rounded-full ${isToday ? 'bg-black/60' : 'bg-white'}`}></div>}
                            </div>
                        </div>
                    )
                })}
            </div>
            {onClose && (
                <div className="mt-8 flex justify-center relative z-10">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-black border border-white/5 text-[9px] font-black text-bunker-mutado uppercase tracking-[0.3em] hover:text-white hover:border-bunker-limon/20 transition-all cursor-pointer">
                        Cerrar Vigilancia
                    </button>
                </div>
            )}
        </div>
    );
}
