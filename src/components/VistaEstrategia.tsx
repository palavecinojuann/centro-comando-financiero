import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot 
} from 'recharts';
import { 
  ShieldCheck, TrendingUp, Coffee, Settings, AlertOctagon, Flame, Scissors, Shield, Info
} from 'lucide-react';
import { TipoProtocolo } from '../hooks/useSimuladorEscenarios';

interface VistaEstrategiaProps {
  situacionBase: {
    ingresosTotales: number;
    gastosTotales: number;
  };
  protocoloId: TipoProtocolo | string;
  protocoloActivo: string;
  onProtocoloChange: (id: TipoProtocolo, nombre: string) => void;
}

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(amount);
};

// --- SIMULACIÓN DE DATOS A 24 MESES ---
const generarDatosSimulados = () => {
  const data = [];
  let navConservador = -500000;
  let navAgresivo = -500000;
  let navEstacional = -500000;
  let navEmprendedor = -500000;

  for (let month = 1; month <= 24; month++) {
    navConservador += 80000;
    navAgresivo += 150000; 
    if (month % 12 === 0) {
        navEstacional -= 100000; 
    } else {
        navEstacional += 90000;
    }
    navEmprendedor += 50000 + (month * 8000);

    data.push({
      mes: `Mes ${month}`,
      conservador: navConservador,
      agresivo: navAgresivo,
      estacional: navEstacional,
      emprendedor: navEmprendedor,
      hitoConservador: month === 14 ? navConservador : null,
      hitoAgresivo: month === 8 ? navAgresivo : null,
      hitoEstacional: month === 12 ? navEstacional : null,
      hitoEmprendedor: month === 18 ? navEmprendedor : null,
    });
  }
  return data;
};

const datosChart = generarDatosSimulados();

export const VistaEstrategia: React.FC<VistaEstrategiaProps> = ({
  situacionBase,
  protocoloId,
  protocoloActivo,
  onProtocoloChange
}) => {
  const { ingresosTotales, gastosTotales } = situacionBase;
  const balanceNeto = ingresosTotales - gastosTotales;
  const haySuperavit = balanceNeto >= 0;

  const [est1, setEst1] = useState('agresivo');
  const [est2, setEst2] = useState('conservador');

  const protocolosSuperavit = [
    { id: 'BLINDAJE', nombre: 'Modo Blindaje', icono: <ShieldCheck className="w-8 h-8" />, desc: '100% del excedente se destina al fondo de emergencias.' },
    { id: 'EXPANSION', nombre: 'Modo Expansión', icono: <TrendingUp className="w-8 h-8" />, desc: '80% destinado a deuda o capitalización, 20% disfrute.' },
    { id: 'DISFRUTE', nombre: 'Modo Disfrute', icono: <Coffee className="w-8 h-8" />, desc: '100% enfocado en calidad de vida, sin ahorro extra.' },
    { id: 'TACTICO_LIBRE', nombre: 'Táctico Libre', icono: <Settings className="w-8 h-8" />, desc: 'Asignación manual personalizada del flujo.' }
  ];

  const protocolosDeficit = [
    { id: 'FRENAR_FUGAS', nombre: 'Frenar Fugas', icono: <Scissors className="w-8 h-8" />, desc: 'Recorte agresivo de gastos Nivel 3-5.' },
    { id: 'ABSORBER_IMPACTO', nombre: 'Absorber Impacto', icono: <Shield className="w-8 h-8" />, desc: 'Drenaje estratégico del fondo de emergencias.' },
    { id: 'ROMPER_CRISTAL', nombre: 'Romper el Cristal', icono: <Flame className="w-8 h-8" />, desc: 'Inyección extra urgente o asunción de deuda barata.' },
    { id: 'TACTICO_LIBRE', nombre: 'Táctico Libre', icono: <AlertOctagon className="w-8 h-8" />, desc: 'Asignación manual de recursos escasos.' }
  ];

  const opcionesActuales = haySuperavit ? protocolosSuperavit : protocolosDeficit;

  return (
    <div className="w-full space-y-6 pb-24 lg:pb-8 pt-4 fade-in">
      
      {/* 1. RESUMEN DE SITUACIÓN */}
      <div className="bg-[#161a23]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          {haySuperavit ? <TrendingUp className="w-32 h-32 text-[#E5A93B]" /> : <AlertOctagon className="w-32 h-32 text-[#ff007f]" />}
        </div>
        
        <h2 className="text-xl text-white/90 font-cinzel mb-4 tracking-wider">REPORTE TÁCTICO</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/20 p-4 rounded-xl border border-white/5">
            <p className="text-xs text-white/50 font-mono mb-1">INGRESO OPERATIVO</p>
            <p className="text-2xl font-outfit text-[#E5A93B]">{formatMoney(ingresosTotales)}</p>
          </div>
          <div className="bg-black/20 p-4 rounded-xl border border-white/5">
            <p className="text-xs text-white/50 font-mono mb-1">CONSUMO PROYECTADO</p>
            <p className="text-2xl font-outfit text-[#F1C40F]">{formatMoney(gastosTotales)}</p>
          </div>
          <div className={`bg-black/20 p-4 rounded-xl border border-white/5 ${haySuperavit ? 'border-b-[#E5A93B]' : 'border-b-[#ff007f]'}`}>
            <p className="text-xs text-white/50 font-mono mb-1">SALDO NETO</p>
            <p className={`text-3xl font-outfit ${haySuperavit ? 'text-[#E5A93B]' : 'text-[#ff007f]'}`}>
              {formatMoney(balanceNeto)}
            </p>
          </div>
        </div>
        
        <div className={`mt-4 p-3 rounded-lg flex items-center justify-center gap-2 border ${haySuperavit ? 'bg-[#E5A93B]/10 border-[#E5A93B]/30 text-[#E5A93B]' : 'bg-[#ff007f]/10 border-[#ff007f]/30 text-[#ff007f]'}`}>
          {haySuperavit ? <ShieldCheck className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
          <span className="font-cinzel tracking-widest font-bold text-sm">
            {haySuperavit ? 'SUPERÁVIT DETECTADO' : 'DÉFICIT DETECTADO'}
          </span>
        </div>
      </div>

      {/* 2. SELECTOR DE PROTOCOLO */}
      <div className="bg-[#161a23]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl text-white/90 font-cinzel mb-4 tracking-wider flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#F1C40F]" /> DIRECTRIZ ACTIVA
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {opcionesActuales.map((proto) => {
            const isActivo = protocoloId === proto.id;
            return (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={proto.id}
                onClick={() => onProtocoloChange(proto.id as TipoProtocolo, proto.nombre)}
                className={`cursor-pointer p-5 rounded-xl border flex flex-col items-center justify-center text-center gap-3 transition-all ${
                  isActivo 
                    ? 'bg-gradient-to-br from-[#E5A93B]/20 to-[#ff007f]/20 border-[#F1C40F]/50 shadow-[0_0_20px_rgba(241,196,15,0.2)]' 
                    : 'bg-black/30 border-white/5 hover:border-white/20'
                }`}
              >
                <div className={`${isActivo ? 'text-[#F1C40F]' : 'text-white/40'}`}>
                  {proto.icono}
                </div>
                <h3 className={`font-cinzel font-bold text-sm tracking-wider ${isActivo ? 'text-white' : 'text-white/60'}`}>
                  {proto.nombre}
                </h3>
                <p className="text-xs text-white/50 font-outfit leading-relaxed">
                  {proto.desc}
                </p>
                {isActivo && (
                  <div className="mt-2 text-[10px] font-mono text-[#E5A93B] bg-[#E5A93B]/10 px-2 py-1 rounded">
                    EN EJECUCIÓN
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 3. GRÁFICO COMPARATIVO */}
      <div className="bg-[#161a23]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl text-white/90 font-cinzel tracking-wider">PROYECCIÓN TÁCTICA</h2>
            <p className="text-xs text-white/50 font-outfit mt-1">Evolución de Patrimonio Neto a 24 meses (Estimado)</p>
          </div>
          <div className="flex gap-2 text-xs font-mono">
            <select 
              value={est1} 
              onChange={e => setEst1(e.target.value)}
              className="bg-black/50 border border-white/10 rounded px-3 py-2 text-white outline-none"
            >
              <option value="conservador">Conservador</option>
              <option value="agresivo">Agresivo</option>
              <option value="estacional">Estacional</option>
              <option value="emprendedor">Emprendedor</option>
            </select>
            <span className="py-2 text-white/30">vs</span>
            <select 
              value={est2} 
              onChange={e => setEst2(e.target.value)}
              className="bg-black/50 border border-white/10 rounded px-3 py-2 text-white outline-none"
            >
              <option value="conservador">Conservador</option>
              <option value="agresivo">Agresivo</option>
              <option value="estacional">Estacional</option>
              <option value="emprendedor">Emprendedor</option>
            </select>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datosChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="mes" stroke="#ffffff30" fontSize={10} tickMargin={10} />
              <YAxis 
                stroke="#ffffff30" 
                fontSize={10} 
                tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} 
                width={60}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0D0E15', borderColor: '#ffffff20', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px', fontFamily: 'Outfit' }}
                labelStyle={{ color: '#ffffff80', fontSize: '12px', marginBottom: '4px' }}
                formatter={(value: number) => formatMoney(value)}
              />
              
              <Line 
                type="monotone" 
                dataKey={est1} 
                stroke="#E5A93B" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "#E5A93B" }}
                name={`Estrategia: ${est1.toUpperCase()}`}
              />
              <Line 
                type="monotone" 
                dataKey={est2} 
                stroke="#F1C40F" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "#F1C40F" }}
                name={`Estrategia: ${est2.toUpperCase()}`}
              />
              
              <ReferenceDot x="Mes 14" y={datosChart[13][est1 as keyof typeof datosChart[0]] as number} r={5} fill="#E5A93B" stroke="none" />
              <ReferenceDot x="Mes 14" y={datosChart[13][est2 as keyof typeof datosChart[0]] as number} r={5} fill="#F1C40F" stroke="none" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-start gap-2 bg-[#E5A93B]/5 p-3 rounded-xl border border-[#E5A93B]/20">
          <Info className="w-5 h-5 text-[#E5A93B] shrink-0" />
          <p className="text-xs text-white/70 font-outfit">
            El punto de inflexión ("Día de Libertad") varía drásticamente según la estrategia. 
            Modo agresivo liquida deudas rápido pero requiere máximo sacrificio a corto plazo.
          </p>
        </div>
      </div>
    </div>
  );
};
