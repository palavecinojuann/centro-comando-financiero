import React, { useState, useMemo } from 'react';
import { Sankey, Tooltip, ResponsiveContainer, Layer } from 'recharts';
import { Activity } from 'lucide-react';
import { MotorSankey, AgrupadoInput } from '../services/MotorSankey';

// Datos estáticos para visualización
const DATOS_SIMULADOS: AgrupadoInput = {
    ingresosBimont: 3500000,
    ingresosJanlu: 800000,
    gastosEducacion: 500000,
    gastosAlquilerHogar: 900000,
    gastosVariables: 700000,
    deudas: 400000,
    blindajeAhorro: 1500000,
    expansion: 300000
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
    }).format(value);
};

// Componente para Dibujar los Flujos de Agua/Dinero con animaciones
const CustomLink = (props: any) => {
    const {
        sourceX,
        targetX,
        sourceY,
        targetY,
        sourceControlX,
        targetControlX,
        linkWidth,
        payload
    } = props;

    // Calculamos el color en base a la fuente para simular la herencia de color del caudal
    const colorBase = payload?.source?.payload?.colorBase || '#06b6d4';
    
    // Si la rama va a Peligro (Deudas), forzamos Rojo; si va a Blindaje, Verde
    let finalColor = colorBase;
    if (payload?.target?.payload?.category === 'deudas') finalColor = '#ef4444';
    if (payload?.target?.payload?.category === 'blindaje') finalColor = '#10B981';
    if (payload?.target?.payload?.category === 'expansion') finalColor = '#D9A852';

    return (
        <Layer key={`CustomLink${props.index}`}>
            {/* Sombra de fondo y borde base para efecto Glassmorphism */}
            <path
                d={`
                    M${sourceX},${sourceY}
                    C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
                `}
                fill="none"
                stroke={finalColor}
                strokeWidth={Math.max(linkWidth, 2)}
                strokeOpacity={0.15}
            />
            {/* Tubería con fluido animado */}
            <path
                d={`
                    M${sourceX},${sourceY}
                    C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
                `}
                fill="none"
                stroke={finalColor}
                strokeWidth={Math.max(linkWidth * 0.5, 1)}
                strokeOpacity={0.6}
                strokeDasharray="15 30"
                className="animate-[sankey-flow_1.5s_linear_infinite]"
                style={{
                   filter: `drop-shadow(0 0 5px ${finalColor}80)`
                }}
            />
        </Layer>
    );
};

// Componente para renderizar los Tanques/Nodos
const CustomNode = (props: any) => {
    const { x, y, width, height, index, payload } = props;
    const isIncome = payload.name.includes('Bimont') || payload.name.includes('Janlu');
    const isDarkBg = true;

    return (
        <Layer key={`CustomNode${index}`}>
            <rect
                x={x}
                y={y}
                width={width}
                height={Math.max(height, 5)}
                fill={payload.colorBase || '#fff'}
                fillOpacity={0.9}
                rx={4}
                ry={4}
                style={{
                    filter: `drop-shadow(0 0 8px ${payload.colorBase || '#06b6d4'}80)`
                }}
            />
            <text
                x={isIncome ? x + width + 10 : x - 10}
                y={y + height / 2}
                textAnchor={isIncome ? 'start' : 'end'}
                alignmentBaseline="middle"
                fill={isDarkBg ? '#E8DFD1' : '#1f2937'}
                fontSize={12}
                fontWeight="bold"
                className="pointer-events-none drop-shadow-md"
            >
                {payload.name}
            </text>
        </Layer>
    );
};

// Tooltip Personalizado con estilo Neumórfico
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        // Identificar si es un Link o un Nodo (Los Links de Recharts Sankey tienen source y target en su payload)
        if (data.source && data.target) {
           return (
               <div className="bg-[#0D0E15]/95 backdrop-blur-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-none p-4 max-w-[280px]">
                   <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-2">Fluido en la tubería</p>
                   <p className="text-[#E8DFD1] text-sm leading-relaxed">
                       Por esta tubería fluyen <span className="font-black text-white">{formatCurrency(data.value)}</span> desde <span className="text-slate-200 font-bold">{data.source.name}</span> hacia <span className="text-slate-200 font-bold">{data.target.name}</span>.
                   </p>
               </div>
           );
        }
        
        // Si es un Nodo
        return (
            <div className="bg-[#0D0E15]/95 backdrop-blur-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-none p-4 min-w-[200px]">
                <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-1">{data.category ? data.category.replace('_', ' ') : 'NODO'}</p>
                <h4 className="text-white font-black text-lg mb-1" style={{ color: data.colorBase }}>{data.name}</h4>
                <p className="text-xl font-bold text-[#E8DFD1] tracking-tight">{formatCurrency(data.value)}</p>
            </div>
        );
    }
    return null;
};

export function WidgetSankeyFluidos() {
    const dataFlujo = useMemo(() => {
        const motor = new MotorSankey();
        return motor.generarDataFlujo(DATOS_SIMULADOS);
    }, []);

    // Agregamos keyframes dinámicos al SVG global si queremos animación CSS pura
    // stroke-dashoffset de origen a destino
    const styleSheet = `
        @keyframes sankey-flow {
            to {
                stroke-dashoffset: -45;
            }
        }
        .recharts-sankey-link {
            transition: all 0.3s ease;
        }
        .recharts-sankey-link:hover {
            stroke-opacity: 0.8 !important;
        }
    `;

    return (
        <div className="w-full h-full bg-[#161A23]/50 backdrop-blur-xl border border-white/5 rounded-none p-6 shadow-2xl relative font-sans overflow-hidden">
            <style>{styleSheet}</style>
            
            {/* Efectos de luces de fondo (Glows) */}
            <div className="absolute top-0 right-[-10%] w-[400px] h-[400px] bg-[#d946ef]/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#06b6d4]/5 blur-[100px] rounded-full pointer-events-none" />
            
            <header className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-[#E8DFD1] flex items-center gap-3">
                        <Activity className="w-6 h-6 text-[#06b6d4]" />
                        Diagrama de Control por Fluidos
                    </h2>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-[#8B735B] mt-1 ml-9">
                        Radiografía Instantánea del Ecosistema Financiero
                    </p>
                </div>
            </header>

            <div className="w-full h-[350px] relative z-10 bg-[#000000]/20 rounded-none border border-white/5 p-4 shadow-inner">
                {/* Cuadrícula sutil de fondo */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none rounded-none" />
                
                <ResponsiveContainer width="100%" height="100%">
                    <Sankey
                        data={dataFlujo}
                        nodePadding={40}
                        margin={{ top: 20, left: 30, right: 120, bottom: 20 }}
                        link={<CustomLink />}
                        node={<CustomNode />}
                    >
                        <Tooltip content={<CustomTooltip />} />
                    </Sankey>
                </ResponsiveContainer>
            </div>
            
            <div className="flex flex-wrap justify-between items-center mt-6 relative z-10 px-2 gap-4">
               <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-[#06b6d4] shadow-[0_0_8px_#06b6d4]" />
                   <span className="text-xs text-white/70 font-bold tracking-widest uppercase">Bimont S.A.</span>
               </div>
               <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-[#d946ef] shadow-[0_0_8px_#d946ef]" />
                   <span className="text-xs text-white/70 font-bold tracking-widest uppercase">Janlu Velas</span>
               </div>
               <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
                   <span className="text-xs text-white/70 font-bold tracking-widest uppercase">Salvaguarda Total</span>
               </div>
               <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]" />
                   <span className="text-xs text-white/70 font-bold tracking-widest uppercase">Peligro / Deudas</span>
               </div>
               <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-[#8B735B] shadow-[0_0_8px_#8B735B]" />
                   <span className="text-xs text-white/70 font-bold tracking-widest uppercase">Vitales (Crecimiento)</span>
               </div>
            </div>
        </div>
    );
}
