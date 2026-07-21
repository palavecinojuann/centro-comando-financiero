import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceDot 
} from 'recharts';
import { 
  Shield, 
  Swords, 
  Umbrella, 
  Briefcase, 
  Info, 
  CheckCircle2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- DEFINICIÓN DE ESTRATEGIAS ---
type StrategyId = 'conservador' | 'agresivo' | 'estacional' | 'emprendedor';

interface StrategyInfo {
  id: StrategyId;
  title: string;
  icon: React.ReactNode;
  color: string;
  mechanics: string;
  explanation: string;
}

const strategies: Record<StrategyId, StrategyInfo> = {
  conservador: {
    id: 'conservador',
    title: 'Plan Conservador (50/30/20)',
    icon: <Shield className="w-5 h-5" />,
    color: '#E5A93B', // Cyan
    mechanics: 'Asigna automáticamente el excedente y reajusta presupuestos para mantener el equilibrio clásico: 50% Necesidades, 30% Estilo de Vida/Disfrute, y 20% Ahorro/Blindaje.',
    explanation: 'Ideal para meses de mantenimiento. Crece lento pero seguro, garantizando que el estilo de vida no se sacrifique.',
  },
  agresivo: {
    id: 'agresivo',
    title: 'Ahorro Agresivo (Bola de Nieve)',
    icon: <Swords className="w-5 h-5" />,
    color: '#D946EF', // Fucsia
    mechanics: 'Aplica la metodología "Bola de Nieve" extrema. Reduce el capital de Disfrute al 10% y canaliza el 40% o más del excedente directamente a liquidar los pasivos de menor a mayor.',
    explanation: 'Modo de guerra financiera. Minimiza el ocio temporalmente para erradicar los intereses punitorios en tiempo récord.',
  },
  estacional: {
    id: 'estacional',
    title: 'Reserva Estacional',
    icon: <Umbrella className="w-5 h-5" />,
    color: '#F1C40F', // Amarillo/Dorado
    mechanics: 'Algoritmo predictivo que detecta picos de gastos futuros (ej. inicio escolar, fiestas) y separa micro-ahorros obligatorios durante los meses previos.',
    explanation: 'Ahorra en silencio. Genera provisiones automáticas hoy para que los meses de alto consumo no impacten tu Punto de Paz.',
  },
  emprendedor: {
    id: 'emprendedor',
    title: 'Sueldo Emprendedor (Transición)',
    icon: <Briefcase className="w-5 h-5" />,
    color: '#00B894', // Verde Esmeralda
    mechanics: 'Fija un "Sueldo o Retiro Fijo" desde la cuenta comercial (Acelerador) hacia la economía familiar (Cimiento), evaluando el ROI y la liquidez de Janlu.',
    explanation: 'Transforma a Janlu en un segundo pilar. Extrae un monto fijo mensual consolidando la independencia financiera familiar.',
  }
};

// --- SIMULACIÓN DE DATOS A 24 MESES ---
// Eje Y: Patrimonio Neto (simulando que arranca en negativo por deudas)
const generarDatosSimulados = () => {
  const data = [];
  let navConservador = -500000;
  let navAgresivo = -500000;
  let navEstacional = -500000;
  let navEmprendedor = -500000;

  for (let month = 1; month <= 24; month++) {
    // Incrementos mensuales simulados
    navConservador += 80000;
    navAgresivo += 150000; // Liquidando deuda rápido
    // Estacional ahorra fijo, pero tiene caídas controladas en meses clave (ej. mes 12, mes 3)
    if (month % 12 === 0) {
        navEstacional -= 100000; // Gasto de fiestas ya previsto (crecimiento menor ese mes)
    } else {
        navEstacional += 90000;
    }
    // Emprendedor crece exponencial (interés compuesto por reinversión en Janlu + Sueldo)
    navEmprendedor += 50000 + (month * 8000);

    data.push({
      mes: `Mes ${month}`,
      conservador: navConservador,
      agresivo: navAgresivo,
      estacional: navEstacional,
      emprendedor: navEmprendedor,
      // Marcas para Hitos
      hitoConservador: month === 14 ? navConservador : null,
      hitoAgresivo: month === 8 ? navAgresivo : null,
      hitoEstacional: month === 12 ? navEstacional : null,
      hitoEmprendedor: month === 18 ? navEmprendedor : null,
    });
  }
  return data;
};

const mockData = generarDatosSimulados();

// Tooltip Personalizado para recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-white/10 p-4 rounded-none shadow-2xl backdrop-blur-md">
        <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-2">{label}</p>
        <div className="space-y-2">
            {payload.map((entry: any, index: number) => {
                const formatVal = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(entry.value);
                const isDebt = entry.value < 0;
                return (
                    <div key={index} className="flex justify-between items-center gap-4">
                        <span style={{ color: entry.color }} className="text-sm font-bold flex items-center gap-1">
                            {entry.name === 'conservador' && 'Conservador'}
                            {entry.name === 'agresivo' && 'Agresivo'}
                            {entry.name === 'estacional' && 'Estacional'}
                            {entry.name === 'emprendedor' && 'Emprendedor'}
                        </span>
                        <span className={`text-sm font-black ${isDebt ? 'text-[#FF7675]' : 'text-white'}`}>
                            {formatVal}
                        </span>
                    </div>
                )
            })}
        </div>
        
        {/* Lógica para mostrar mensajes de Hito si existen en el payload */}
        {payload.map((entry: any, idx: number) => {
            const hitoKey = `hito${entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}`;
            const hitoVal = entry.payload[hitoKey];
            if (hitoVal !== null) {
                let mensajeHito = "";
                if (entry.name === 'agresivo') mensajeHito = "¡Día de Libertad! Deuda liquidada.";
                if (entry.name === 'conservador') mensajeHito = "Día de Libertad alcanzado (6 meses después).";
                if (entry.name === 'estacional') mensajeHito = "Fiestas de fin de año cubiertas sin impacto.";
                if (entry.name === 'emprendedor') mensajeHito = "Independencia: Janlu sostiene el hogar.";

                return (
                    <div key={`hito-${idx}`} className="mt-3 pt-3 border-t border-white/10">
                        <div className="flex items-start gap-2">
                             <CheckCircle2 className="w-4 h-4 mt-0.5" style={{ color: entry.color }} />
                             <p className="text-xs font-bold text-white leading-tight">
                                <span style={{ color: entry.color }}>Hito: </span>{mensajeHito}
                             </p>
                        </div>
                    </div>
                );
            }
            return null;
        })}
      </div>
    );
  }
  return null;
};

export function PanelEstrategiasComparativas() {
  const [selectedStrats, setSelectedStrats] = useState<StrategyId[]>(['agresivo', 'conservador']);

  const toggleStrategy = (id: StrategyId) => {
    setSelectedStrats(prev => {
        if (prev.includes(id)) {
            // No permitir deseleccionar si queda menos de 1
            if (prev.length <= 1) return prev;
            return prev.filter(s => s !== id);
        } else {
            // Permitir máximo 2 para comparación
            if (prev.length >= 2) {
                return [prev[1], id];
            }
            return [...prev, id];
        }
    });
  };

  const getActiveColor = (id: StrategyId) => strategies[id].color;

  return (
    <div className="w-full bg-[#0D0E15] text-white font-sans flex flex-col gap-8 pb-10">
        
        {/* Cabecera del Panel */}
        <header className="px-6 pt-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161A23]/50 border border-white/10 mb-4">
                <TrendingUp className="w-4 h-4 text-[#E5A93B]" />
                <span className="text-[#E5A93B] text-[10px] font-bold uppercase tracking-widest">Motor de Simulación a Futuro</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-2">Simulador del Futuro</h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
                Selecciona <strong>dos estrategias</strong> para superponer sus curvas en el tiempo. Descubre objetivamente el impacto a largo plazo de tus decisiones presentes en el Patrimonio Neto de la familia.
            </p>
        </header>

        {/* Layout Principal: 1 Columna en móvil, 2 Columnas (Selector | Gráfico) en Tablet/Desktop */}
        <div className="px-6 flex flex-col lg:flex-row gap-8">
            
            {/* MÓDULO 1: SELECTOR DE ESTRATEGIAS */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Metodologías Disponibles</h3>
                
                {Object.values(strategies).map(strategy => {
                    const isSelected = selectedStrats.includes(strategy.id);
                    return (
                        <div key={strategy.id} className="relative group">
                            {/* Borde brilloso dinámico si está seleccionado */}
                            {isSelected && (
                                <div className="absolute inset-0 blur-md opacity-30 rounded-[20px] transition-opacity" style={{ backgroundColor: strategy.color }}></div>
                            )}
                            
                            <motion.button 
                                onClick={() => toggleStrategy(strategy.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full text-left relative z-10 p-5 rounded-[20px] backdrop-blur-xl border transition-all duration-300 ${isSelected ? 'bg-black/60 shadow-xl' : 'bg-black/30 border-white/5 hover:bg-[#161A23]/50'}`}
                                style={{ borderColor: isSelected ? strategy.color : 'rgba(255,255,255,0.05)' }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-none flex items-center justify-center`} style={{ backgroundColor: isSelected ? `${strategy.color}20` : 'rgba(255,255,255,0.05)', color: isSelected ? strategy.color : '#888' }}>
                                            {strategy.icon}
                                        </div>
                                        <h4 className={`font-bold tracking-wide ${isSelected ? 'text-white' : 'text-white/70'}`}>{strategy.title}</h4>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-transparent' : 'border-white/20'}`} style={{ backgroundColor: isSelected ? strategy.color : 'transparent' }}>
                                        {isSelected && <CheckCircle2 className="w-4 h-4 text-black" />}
                                    </div>
                                </div>
                                
                                <AnimatePresence>
                                    {isSelected && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-3 mt-3 border-t border-white/10 space-y-3">
                                                <div className="flex items-start gap-2">
                                                    <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                                    <p className="text-slate-200 text-xs leading-relaxed">
                                                        <strong className="text-white">Mecánica:</strong> {strategy.mechanics}
                                                    </p>
                                                </div>
                                                <div className="bg-[#161A23]/50 p-3 rounded-none border border-white/5 border-l-2" style={{ borderLeftColor: strategy.color }}>
                                                    <p className="text-slate-300 text-xs italic">
                                                        "{strategy.explanation}"
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </div>
                    );
                })}
                
                {selectedStrats.length < 2 && (
                    <div className="flex items-center gap-2 mt-2 p-3 bg-[#161A23]/50 rounded-none border border-white/5">
                        <AlertCircle className="w-4 h-4 text-[#F1C40F]" />
                        <span className="text-[#F1C40F] text-xs font-medium">Selecciona otra estrategia para comparar curvas.</span>
                    </div>
                )}
            </div>

            {/* MÓDULO 2: MOTOR DE COMPARACIÓN VISUAL (Gráfico) */}
            <div className="w-full lg:w-2/3 flex flex-col">
                <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-none p-6 lg:p-8 relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),_0_20px_40px_rgba(0,0,0,0.5)] h-[500px] flex flex-col">
                    
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-white font-bold tracking-wide text-lg">Proyección de Patrimonio Neto</h3>
                            <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">Evolución estimada a 24 meses</p>
                        </div>
                        
                        {/* Leyenda Dinámica */}
                        <div className="flex gap-4">
                            {selectedStrats.map(id => (
                                <div key={id} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getActiveColor(id) }}></div>
                                    <span className="text-slate-200 text-xs font-bold uppercase tracking-wider hidden sm:block">{strategies[id].title.split(' ')[1]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 w-full relative">
                        {/* Líneas de Cero (Para referenciar el fin de la deuda) */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full border-t border-white/10 border-dashed z-0"></div>

                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockData} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis 
                                    dataKey="mes" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold' }} 
                                    interval="preserveStartEnd"
                                    minTickGap={30}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold' }}
                                    tickFormatter={(val) => {
                                        if (val === 0) return 'Libre de Deuda';
                                        return `${val < 0 ? '-' : ''}$${Math.abs(val) / 1000}k`;
                                    }}
                                    domain={['dataMin - 100000', 'dataMax + 100000']}
                                    width={80}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                
                                <ReferenceDot y={0} r={0} stroke="none" fill="none" label={{ position: 'insideTopLeft', value: 'PUNTO CERO (Liquidación de Deuda)', fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700 }} />

                                {selectedStrats.map((id, index) => {
                                    const isPrimary = index === 0;
                                    const color = getActiveColor(id);
                                    const hitoKey = `hito${id.charAt(0).toUpperCase() + id.slice(1)}`;
                                    
                                    return (
                                        <Line 
                                            key={id}
                                            type="monotone" 
                                            dataKey={id} 
                                            stroke={color} 
                                            strokeWidth={isPrimary ? 4 : 3}
                                            strokeOpacity={isPrimary ? 1 : 0.7}
                                            dot={(props: any) => {
                                                const { cx, cy, payload } = props;
                                                const hitoData = payload[hitoKey];
                                                
                                                // Si este punto de datos coincide con el hito, dibujamos un punto resaltado
                                                if (hitoData === props.value) {
                                                    return (
                                                        <g key={`dot-${id}-${props.index}`}>
                                                            <circle cx={cx} cy={cy} r={8} fill={color} fillOpacity={0.3} className="animate-ping" style={{ transformOrigin: 'center' }} />
                                                            <circle cx={cx} cy={cy} r={4} fill={color} stroke="white" strokeWidth={2} />
                                                        </g>
                                                    );
                                                }
                                                return <circle key={`dot-${id}-${props.index}`} cx={cx} cy={cy} r={0} fill="none" />;
                                            }}
                                            activeDot={{ r: 6, fill: color, stroke: 'white', strokeWidth: 2 }}
                                            animationDuration={1500}
                                        />
                                    );
                                })}

                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                </div>
            </div>
        </div>

    </div>
  );
}

// Para usar este componente, puedes renderizarlo en App.tsx o en tu estructura de vistas correspondiente.
