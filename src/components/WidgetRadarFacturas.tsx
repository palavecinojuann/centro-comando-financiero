import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radar, FileText, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { RadarFacturasService, FacturaDetectada } from '../services/RadarFacturasService';

interface WidgetRadarFacturasProps {
    idHogar: string;
    onFacturaIntegrada?: () => void;
}

export function WidgetRadarFacturas({ idHogar, onFacturaIntegrada }: WidgetRadarFacturasProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [facturaReciente, setFacturaReciente] = useState<FacturaDetectada | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [integrating, setIntegrating] = useState(false);
    const [success, setSuccess] = useState(false);

    const radarService = new RadarFacturasService();

    const scanInbox = async () => {
        setIsScanning(true);
        setError(null);
        setFacturaReciente(null);
        setSuccess(false);

        try {
            const facturas = await radarService.escanearBandeja();
            if (facturas && facturas.length > 0) {
                setFacturaReciente(facturas[0]); // Por simplicidad, tomamos la primera
            }
        } catch (err: any) {
            setError(err.message || 'Error al conectar con Gmail.');
        } finally {
            setIsScanning(false);
        }
    };

    const handleIntegrar = async () => {
        if (!facturaReciente) return;
        
        setIntegrating(true);
        setError(null);
        
        try {
            await radarService.integrarFacturaEnRadar(facturaReciente, idHogar);
            setSuccess(true);
            setTimeout(() => {
                setFacturaReciente(null);
                setSuccess(false);
                if (onFacturaIntegrada) {
                    onFacturaIntegrada();
                }
            }, 2000);
        } catch (err: any) {
            setError('Fallo al agregar la factura al Radar.');
        } finally {
            setIntegrating(false);
        }
    };

    // Formateador de moneda
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Formateador de fecha simple (ej. "15/06")
    const formatDate = (dateStr: string) => {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}`;
        }
        return dateStr;
    };

    return (
        <div className="bg-[#161A23]/50 backdrop-blur-xl rounded-none p-5 border border-white/10 shadow-lg relative overflow-hidden font-sans">
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-50" />
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#06b6d4] font-black tracking-tight flex items-center gap-2">
                        <Radar className={`w-5 h-5 ${isScanning ? 'animate-spin opacity-80' : ''}`} />
                        Radar de Facturas
                    </h3>
                    <button 
                        onClick={scanInbox}
                        disabled={isScanning || integrating}
                        className="text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
                        title="Escanear Gmail ahora"
                    >
                        <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-reverse-spin' : ''}`} />
                    </button>
                </div>

                <div className="min-h-[80px] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {isScanning && (
                            <motion.div
                                key="scanning"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center space-y-2"
                            >
                                <div className="relative flex items-center justify-center">
                                    <div className="absolute w-12 h-12 rounded-full border-2 border-[#06b6d4]/30 animate-ping" />
                                    <Radar className="w-6 h-6 text-[#06b6d4] animate-pulse" />
                                </div>
                                <p className="text-xs text-slate-300 font-medium">Escaneando bandeja de entrada...</p>
                            </motion.div>
                        )}

                        {!isScanning && !facturaReciente && !error && !success && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center"
                            >
                                <p className="text-sm text-gray-400">El radar está inactivo. Ninguna factura pendiente detectada recientemente.</p>
                                <button 
                                    onClick={scanInbox}
                                    className="mt-3 px-4 py-1.5 rounded-full bg-[#161A23]/50 border border-white/10 text-slate-200 text-xs font-semibold hover:bg-white/10 transition-colors"
                                >
                                    Escanear Ahora
                                </button>
                            </motion.div>
                        )}

                        {error && !isScanning && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-red-500/10 border border-red-500/20 rounded-none p-3 flex items-start gap-3 w-full"
                            >
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <p className="text-sm text-red-200">{error}</p>
                            </motion.div>
                        )}

                        {success && !isScanning && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center w-full"
                            >
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                                </div>
                                <p className="text-sm text-green-400 font-medium">¡Integrada con éxito!</p>
                            </motion.div>
                        )}

                        {facturaReciente && !isScanning && !success && (
                            <motion.div
                                key="factura"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full bg-[#0D0E15]/80 border border-t border-l border-white/10 border-b-black/50 border-r-black/50 p-4 rounded-none shadow-inner relative"
                            >
                                {/* Notificación content */}
                                <div className="flex gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-[#D946EF]/20 flex items-center justify-center flex-shrink-0 border border-[#D946EF]/30">
                                        <FileText className="w-4 h-4 text-[#D946EF]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-white font-medium mb-1 leading-tight">
                                            Nueva factura de <span className="font-bold text-[#06b6d4]">{facturaReciente.proveedor}</span> detectada.
                                        </p>
                                        <p className="text-xs text-gray-400 flex items-center gap-2">
                                            <span className="font-mono font-bold text-white">{formatMoney(facturaReciente.montoTotal)}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-500" />
                                            <span>Vence el {formatDate(facturaReciente.fechaVencimiento)}</span>
                                        </p>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={handleIntegrar}
                                    disabled={integrating}
                                    className="w-full py-2 bg-[#D946EF] hover:bg-[#D946EF]/90 text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(255,0,127,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {integrating ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <ArrowRight className="w-4 h-4" />
                                    )}
                                    Revisar e Integrar
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
