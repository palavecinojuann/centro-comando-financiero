import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowDownAZ, ArrowUpAZ, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface Operacion {
    id: string;
    type: 'ingreso' | 'janlu' | 'gasto' | 'deuda';
    montoNeto?: number;
    utilidad_neta?: number;
    montoTotal?: number;
    capitalOrig?: number;
    fechaIngreso?: any;
    fechaInyeccion?: any;
    fechaGasto?: any;
    fechaRegistro?: any;
    fechaVencimiento?: any;
    categoria?: string;
    referencia?: string;
    categoriaMacro?: string;
    nombreCompromiso?: string;
    nivel?: number;
    cuotasTotales?: number;
    cuotasPagadas?: number;
    recurrente?: boolean;
    estado?: string;
}

interface LibroDiarioProps {
    operaciones: Operacion[];
    onEdit?: (id: string, type: string) => void;
    onDelete?: (id: string, type: string) => void;
    onPay?: (id: string, type: string) => void;
    onToggleStatus?: (id: string, type: string, currentStatus: string) => void;
}

interface FilaDiario {
    id: string;
    fechaOriginal: Date;
    fechaTexto: string;
    concepto: string;
    naturaleza: string;
    naturalezaColor: string;
    monto: number;
    esIngreso: boolean;
    balanceAcumulado: number;
    type: string;
    rawOp: Operacion;
}

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
};

export function LibroDiario({ operaciones, onEdit, onDelete, onPay, onToggleStatus }: LibroDiarioProps) {
    const [ordenInverso, setOrdenInverso] = useState(false);

    const filasCalculadas = useMemo(() => {
        // 1. Mapear y normalizar fechas y montos
        const datosNormalizados = operaciones.map(op => {
            let fechaStr = op.fechaIngreso || op.fechaInyeccion || op.fechaGasto || op.fechaRegistro || op.fechaVencimiento;
            let fechaOriginal = new Date();
            if (fechaStr?.toDate) {
                fechaOriginal = fechaStr.toDate();
            } else if (typeof fechaStr === 'string' || typeof fechaStr === 'number') {
                fechaOriginal = new Date(fechaStr);
            }

            let monto = 0;
            let esIngreso = false;
            let concepto = "Operación";
            let categoria = op.categoria || "Varios";
            let cuenta = "Bimont Central";

            if (op.type === 'ingreso') {
                monto = op.montoNeto || 0;
                esIngreso = true;
                concepto = "Sueldo Bimont";
                categoria = "Sueldo";
                cuenta = "Bimont S.A.";
            } else if (op.type === 'janlu') {
                monto = op.utilidad_neta || 0;
                esIngreso = true;
                concepto = "Utilidad Ventas";
                categoria = "Janlu Velas";
                cuenta = "Janlu Bridge";
            } else if (op.type === 'gasto') {
                monto = op.montoTotal || 0;
                esIngreso = false;
                concepto = op.referencia || "Gasto Vital";
                categoria = op.categoria || "Gasto";
                cuenta = op.categoriaMacro === 'COMPROMISOS_INDISPENSABLES' ? "Cimiento" : "Acelerador";
            } else if (op.type === 'deuda') {
                monto = op.capitalOrig || 0;
                esIngreso = false;
                concepto = op.nombreCompromiso || "Compromiso";
                categoria = "Deuda";
                cuenta = "Pasivos";
            }

            return {
                id: op.id,
                fechaOriginal,
                fechaTexto: format(fechaOriginal, "dd/M/yy", { locale: es }),
                concepto,
                categoria,
                cuenta,
                monto,
                esIngreso,
                type: op.type,
                rawOp: op
            };
        });

        // 2. Ordenar cronológicamente (más antiguo primero)
        const datosOrdenados = datosNormalizados.sort((a, b) => a.fechaOriginal.getTime() - b.fechaOriginal.getTime());

        // 3. Calcular Balance Acumulado (Running Balance)
        let balanceActual = 0;
        const datosConBalance: FilaDiario[] = datosOrdenados.map(fila => {
            if (fila.esIngreso) {
                balanceActual += fila.monto;
            } else {
                balanceActual -= fila.monto;
            }
            return {
                ...fila,
                balanceAcumulado: balanceActual,
                concepto: fila.concepto,
                naturaleza: fila.categoria,
                naturalezaColor: '',
                rawOp: fila.rawOp
            };
        });

        // 4. Invertir orden si es necesario para la visualización, pero manteniendo el balance de running balance intacto
        if (ordenInverso) {
            return datosConBalance.reverse();
        }

        return datosConBalance;
    }, [operaciones, ordenInverso]);

    return (
        <div className="flex flex-col h-full font-sans selection:bg-[#00E5FF] selection:text-black">
            <div className="flex justify-between items-center mb-6 px-4">
                <div>
                  <h3 className="text-white text-lg font-sans font-black uppercase tracking-widest">Libro Diario</h3>
                  <p className="text-[9px] font-mono text-bunker-mutado uppercase tracking-widest">// DETALLE TRANSACCIONAL COMPACTO</p>
                </div>
                <button 
                    onClick={() => setOrdenInverso(!ordenInverso)}
                    className="flex items-center gap-2 px-3 py-2 bg-bunker-panel hover:border-[#00E5FF]/30 transition-all rounded-xl border border-white/5 text-bunker-texto text-[9px] font-black uppercase tracking-widest font-sans shadow-lg group cursor-pointer"
                >
                    {ordenInverso ? <ArrowUpAZ className="w-3.5 h-3.5 text-[#00E5FF]" /> : <ArrowDownAZ className="w-3.5 h-3.5 text-[#00E5FF]" />}
                    <span className="group-hover:text-[#00E5FF] transition-colors">
                        {ordenInverso ? 'Cronología ↓' : 'Cronología ↑'}
                    </span>
                </button>
            </div>

            <div className="bg-bunker-panel border border-white/5 rounded-2xl shadow-2xl overflow-hidden flex-1 flex flex-col min-h-[400px]">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="financial-table">
                        <thead>
                            <tr>
                                <th className="w-16">Fecha</th>
                                <th>Categoría</th>
                                <th>Cuenta / Destino</th>
                                <th className="text-right">Cantidad</th>
                                <th className="text-center w-24">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filasCalculadas.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-bunker-mutado font-sans text-xs uppercase tracking-widest font-black opacity-30">
                                        [ SISTEMA VACÍO // NO SE REGISTRAN OPERACIONES ]
                                    </td>
                                </tr>
                            ) : (
                                filasCalculadas.map((fila) => {
                                    // Determinar color de cantidad de la transacción
                                    let colorCantidad = "text-white";
                                    if (fila.type === 'ingreso' || fila.type === 'janlu') {
                                        colorCantidad = "text-[#00E5FF]"; // Cian
                                    } else if (fila.type === 'deuda') {
                                        colorCantidad = "text-[#FFD500]"; // Amarillo Oro
                                    } else if (fila.type === 'gasto') {
                                        colorCantidad = fila.rawOp.categoriaMacro === 'COMPROMISOS_INDISPENSABLES' ? "text-white" : "text-[#8A9A9E]";
                                    }

                                    return (
                                        <tr key={fila.id} className={`transition-colors ${fila.rawOp.estado === 'Pausado' ? 'opacity-30 grayscale' : ''}`}>
                                            {/* Fecha */}
                                            <td className="font-mono text-[10px] text-bunker-mutado font-semibold">
                                                {fila.fechaTexto}
                                            </td>
                                            
                                            {/* Categoría */}
                                            <td className="font-bold text-white uppercase tracking-wide text-xs">
                                                {fila.categoria}
                                            </td>

                                            {/* Cuenta / Detalle */}
                                            <td className="text-bunker-mutado text-[11px] font-medium">
                                                <div className="flex flex-col">
                                                    <span>{fila.cuenta}</span>
                                                    <span className="text-[9px] opacity-60 truncate max-w-[150px]">{fila.concepto}</span>
                                                </div>
                                            </td>

                                            {/* Cantidad */}
                                            <td className={`text-right font-black font-sans text-xs tracking-tight ${colorCantidad}`}>
                                                {fila.esIngreso ? '+' : '-'}{formatNumber(fila.monto)}
                                            </td>

                                            {/* Acciones */}
                                            <td className="text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* Pagar/Ejecutar */}
                                                    {(fila.type === 'deuda' || fila.rawOp.recurrente || fila.rawOp.estado === 'Pendiente') && (
                                                        <button
                                                            title="Ejecutar/Pagar"
                                                            onClick={() => onPay && onPay(fila.id, fila.type)}
                                                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all cursor-pointer"
                                                        >
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}

                                                    {/* Cancelar/Finalizar */}
                                                    {(fila.type === 'gasto' || fila.type === 'deuda') && (
                                                        <button
                                                            title={fila.rawOp.estado === 'Finalizado' ? 'Reactivar' : 'Finalizar'}
                                                            onClick={() => onToggleStatus && onToggleStatus(fila.id, fila.type, fila.rawOp.estado || 'Activo')}
                                                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${fila.rawOp.estado === 'Finalizado' ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10' : 'text-bunker-mutado hover:text-white hover:bg-white/5'}`}
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}

                                                    {/* Editar */}
                                                    <button
                                                        title="Editar"
                                                        onClick={() => onEdit && onEdit(fila.id, fila.type)}
                                                        className="p-1.5 text-[#00E5FF] hover:text-[#00E5FF]/80 hover:bg-[#00E5FF]/10 rounded-lg transition-all cursor-pointer"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Borrar */}
                                                    <button
                                                        title="Borrar"
                                                        onClick={() => onDelete && onDelete(fila.id, fila.type)}
                                                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
