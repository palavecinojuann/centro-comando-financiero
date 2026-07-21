import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot 
} from 'recharts';
import { 
  ShieldCheck, TrendingUp, Coffee, Settings, AlertOctagon, Flame, Scissors, Shield, Info, BookOpen, CheckCircle2, ChevronDown, Sparkles
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

interface ProtocoloManual {
  id: TipoProtocolo;
  nombre: string;
  categoria: 'EXPANSIÓN' | 'BLINDAJE' | 'EMERGENCIA' | 'PERSONALIZADO';
  colorTag: string;
  icono: React.ReactNode;
  metodo: string;
  cuandoUsarlo: string;
  consejoCL: string;
}

const MANUAL_PROTOCOLOS: ProtocoloManual[] = [
  {
    id: 'BLINDAJE',
    nombre: 'Modo Blindaje',
    categoria: 'BLINDAJE',
    colorTag: 'bg-[#E5A93B]/10 text-[#E5A93B] border-[#E5A93B]/30',
    icono: <ShieldCheck className="w-6 h-6 text-[#E5A93B]" />,
    metodo: 'Canaliza el 100% del excedente líquido mensual directamente a construir y consolidar el Fondo de Emergencias.',
    cuandoUsarlo: 'Recomendado cuando el Fondo de Reserva cubre menos de 3 a 6 meses de gastos vitales, o en meses de alta volatilidad macroeconómica.',
    consejoCL: 'Cerebro Lógico: El Punto de Paz es tu prioridad número uno. Antes de acelerar inversiones o consumo de placer, asegura la cobertura de supervivencia.'
  },
  {
    id: 'EXPANSION',
    nombre: 'Modo Expansión',
    categoria: 'EXPANSIÓN',
    colorTag: 'bg-[#D946EF]/10 text-[#D946EF] border-[#D946EF]/30',
    icono: <TrendingUp className="w-6 h-6 text-[#D946EF]" />,
    metodo: 'Asigna el 80% del excedente a la liquidación acelerada de pasivos (Bola de Nieve) o inyección de capital en Janlu, liberando un 20% para disfrute.',
    cuandoUsarlo: 'Ideal cuando tenés un blindaje base estable y liquidez sobrante que querés multiplicar para extinguir intereses de deudas.',
    consejoCL: 'Cerebro Lógico: Al cancelar una deuda a saldo cero, el capital mensual comprometido se absorbe y redirige automáticamente al siguiente pasivo de mayor daño.'
  },
  {
    id: 'DISFRUTE',
    nombre: 'Modo Disfrute',
    categoria: 'EXPANSIÓN',
    colorTag: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    icono: <Coffee className="w-6 h-6 text-yellow-400" />,
    metodo: 'Libera el 100% del excedente mensual para el consumo de estilo de vida, salidas, vacaciones o recompensas familiares.',
    cuandoUsarlo: 'Usalo tras haber cumplido metas clave (extinción de una deuda grande o cofre de emergencia lleno) para evitar el agotamiento financiero.',
    consejoCL: 'Cerebro Lógico: Se congela automáticamente si el monitoreo de velocidad de consumo (Burn Rate) proyecta quiebre del Punto de Estabilidad a mitad de mes.'
  },
  {
    id: 'FRENAR_FUGAS',
    nombre: 'Frenar Fugas',
    categoria: 'EMERGENCIA',
    colorTag: 'bg-red-500/10 text-red-400 border-red-500/30',
    icono: <Scissors className="w-6 h-6 text-red-400" />,
    metodo: 'Ejecuta un triaje y recorte agresivo e inmediato de gastos no esenciales (categorías de Nivel 3 a Nivel 5: suscripciones, salidas, microgastos).',
    cuandoUsarlo: 'Utilízalo de inmediato ante la primera señal de déficit proyectado en el mes o ante caídas repentinas de ingresos fijos.',
    consejoCL: 'Cerebro Lógico: Elimina la grasa presupuestaria sin tocar los compromisos del Cimiento ni requerir endeudamiento.'
  },
  {
    id: 'ABSORBER_IMPACTO',
    nombre: 'Absorber Impacto',
    categoria: 'EMERGENCIA',
    colorTag: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    icono: <Shield className="w-6 h-6 text-orange-400" />,
    metodo: 'Autoriza una quema controlada del Fondo de Reserva táctico para absorber un faltante o gasto imprevisto de supervivencia.',
    cuandoUsarlo: 'Usalo exclusivamente frente a emergencias médicas, reparaciones imprevistas del hogar o eventos extraordinarios no postergables.',
    consejoCL: 'Cerebro Lógico: Es un escudo temporal. Tan pronto pase la tormenta, el sistema restablecerá la directriz a Modo Blindaje para reconstituir la reserva.'
  },
  {
    id: 'ROMPER_CRISTAL',
    nombre: 'Romper el Cristal',
    categoria: 'EMERGENCIA',
    colorTag: 'bg-red-600/15 text-red-500 border-red-600/40 animate-pulse',
    icono: <Flame className="w-6 h-6 text-red-500" />,
    metodo: 'Alerta Roja: Activa financiación de emergencia mediante inyección directa de capital exterior (Janlu) o deuda estratégica barata.',
    cuandoUsarlo: 'Reservado estrictamente para situaciones extremas donde los gastos del Cimiento superan la liquidez y las reservas están en cero.',
    consejoCL: 'Cerebro Lógico: Medida de supervivencia extrema. Requiere auditoría inmediata y suspensión total del Modo Disfrute.'
  },
  {
    id: 'TACTICO_LIBRE',
    nombre: 'Táctico Libre',
    categoria: 'PERSONALIZADO',
    colorTag: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    icono: <Settings className="w-6 h-6 text-purple-400" />,
    metodo: 'Permite configurar manualmente la distribución peso por peso entre los niveles de supervivencia y estilo de vida.',
    cuandoUsarlo: 'Meses atípicos con gastos mixtos, mudanzas o proyectos especiales donde requieras flexibilizar las reglas fijas.',
    consejoCL: 'Cerebro Lógico: Mantén siempre bajo la lupa la tasa de cobertura del Punto de Estabilidad (P.E. > 100%).'
  }
];

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
  const [protocoloExpandido, setProtocoloExpandido] = useState<string | null>(null);

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
    <div className="w-full space-y-6 pb-24 lg:pb-8 pt-4 fade-in font-sans">
      
      {/* 1. RESUMEN DE SITUACIÓN Y REPORTE TÁCTICO */}
      <div className="bg-[#161a23]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          {haySuperavit ? <TrendingUp className="w-32 h-32 text-[#E5A93B]" /> : <AlertOctagon className="w-32 h-32 text-[#ff007f]" />}
        </div>
        
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl text-white font-serif font-black tracking-wider uppercase">Arquitectura Estratégica</h2>
            <p className="text-[10px] text-[#E5A93B] font-mono tracking-widest uppercase font-black">Triaje y Directrices // Cerebro Lógico</p>
          </div>
          <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 border text-[9px] font-black tracking-widest font-mono uppercase ${haySuperavit ? 'bg-[#E5A93B]/10 border-[#E5A93B]/30 text-[#E5A93B]' : 'bg-[#ff007f]/10 border-[#ff007f]/30 text-[#ff007f]'}`}>
            {haySuperavit ? <ShieldCheck className="w-3.5 h-3.5" /> : <Flame className="w-3.5 h-3.5" />}
            {haySuperavit ? 'SUPERÁVIT DETECTADO' : 'DÉFICIT DETECTADO'}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/30 p-5 rounded-2xl border border-white/5 shadow-inner">
            <p className="text-[9px] text-slate-400 font-mono font-black uppercase tracking-widest mb-1">INGRESO LIQUIDEZ</p>
            <p className="text-2xl font-bold font-contable text-[#E5A93B]">{formatMoney(ingresosTotales)}</p>
          </div>
          <div className="bg-black/30 p-5 rounded-2xl border border-white/5 shadow-inner">
            <p className="text-[9px] text-slate-400 font-mono font-black uppercase tracking-widest mb-1">CONSUMO PROYECTADO</p>
            <p className="text-2xl font-bold font-contable text-[#F1C40F]">{formatMoney(gastosTotales)}</p>
          </div>
          <div className={`bg-black/30 p-5 rounded-2xl border ${haySuperavit ? 'border-[#E5A93B]/30' : 'border-[#ff007f]/30'} shadow-inner`}>
            <p className="text-[9px] text-slate-400 font-mono font-black uppercase tracking-widest mb-1">BALANCE DISPONIBLE</p>
            <p className={`text-2xl font-bold font-contable ${haySuperavit ? 'text-[#E5A93B]' : 'text-[#ff007f]'}`}>
              {formatMoney(balanceNeto)}
            </p>
          </div>
        </div>
      </div>

      {/* 2. SELECTOR DE PROTOCOLO EN TIEMPO REAL */}
      <div className="bg-[#161a23]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
        <h2 className="text-lg text-white font-serif font-black mb-2 tracking-wider flex items-center gap-2 uppercase">
          <Settings className="w-5 h-5 text-[#F1C40F]" /> Directriz Activa de Operación
        </h2>
        <p className="text-xs text-slate-400 mb-6 font-medium">
          Selecciona la directriz que ejecutará el Búnker este mes. La configuración se actualizará automáticamente en Firestore.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {opcionesActuales.map((proto) => {
            const isActivo = protocoloId === proto.id;
            return (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={proto.id}
                onClick={() => onProtocoloChange(proto.id as TipoProtocolo, proto.nombre)}
                className={`cursor-pointer p-5 rounded-2xl border flex flex-col items-center justify-between text-center gap-3 transition-all duration-300 ${
                  isActivo 
                    ? 'bg-gradient-to-br from-[#E5A93B]/20 to-[#D946EF]/20 border-[#E5A93B] shadow-[0_0_25px_rgba(229,169,59,0.25)] scale-[1.02]' 
                    : 'bg-black/30 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`p-3 rounded-2xl ${isActivo ? 'bg-[#E5A93B] text-black shadow-lg' : 'bg-white/5 text-slate-400'}`}>
                    {proto.icono}
                  </div>
                  <h3 className={`font-serif font-bold text-sm tracking-wider uppercase ${isActivo ? 'text-white font-black' : 'text-white/70'}`}>
                    {proto.nombre}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {proto.desc}
                  </p>
                </div>
                
                {isActivo ? (
                  <div className="mt-2 text-[9px] font-mono font-black text-black bg-[#E5A93B] px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                    ✓ EN EJECUCIÓN
                  </div>
                ) : (
                  <div className="mt-2 text-[9px] font-mono font-bold text-slate-500 border border-white/10 px-3 py-1 rounded-full uppercase tracking-widest">
                    ACTIVAR
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 3. 📖 MANUAL & CONSEJOS TÁCTICOS DE CADA MODO */}
      <div className="bg-[#161a23]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#E5A93B]/10 border border-[#E5A93B]/30 flex items-center justify-center text-[#E5A93B]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg text-white font-serif font-black tracking-wider uppercase">Manual de Protocolos & Consejos Tácticos</h2>
            <p className="text-xs text-slate-400">Guía de operación y recomendaciones del Cerebro Lógico para cada escenario financiero.</p>
          </div>
        </div>

        <div className="space-y-3">
          {MANUAL_PROTOCOLOS.map((manual) => {
            const isSelectedMode = protocoloId === manual.id;
            const isExpanded = protocoloExpandido === manual.id;

            return (
              <div 
                key={manual.id} 
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isSelectedMode 
                    ? 'bg-black/50 border-[#E5A93B]/40 shadow-lg' 
                    : 'bg-black/20 border-white/5 hover:border-white/10'
                }`}
              >
                {/* Cabecera del Acordeón */}
                <button
                  onClick={() => setProtocoloExpandido(isExpanded ? null : manual.id)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer focus:outline-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                      {manual.icono}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-serif font-bold text-sm uppercase tracking-wide">{manual.nombre}</span>
                        <span className={`text-[8px] font-mono font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${manual.colorTag}`}>
                          {manual.categoria}
                        </span>
                        {isSelectedMode && (
                          <span className="text-[8px] font-mono font-black text-black bg-[#E5A93B] px-2 py-0.5 rounded-full uppercase tracking-widest">
                            ACTIVO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{manual.metodo}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#E5A93B]' : ''}`} />
                </button>

                {/* Contenido Expandible */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-white/5 px-5 py-4 space-y-4 bg-white/[0.01]"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 p-4 bg-black/40 border border-white/5 rounded-xl">
                          <span className="text-[9px] font-mono font-black text-[#E5A93B] uppercase tracking-widest flex items-center gap-1.5">
                            <Settings className="w-3.5 h-3.5" /> MÉTODO DE OPERACIÓN
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">{manual.metodo}</p>
                        </div>
                        <div className="space-y-1.5 p-4 bg-black/40 border border-white/5 rounded-xl">
                          <span className="text-[9px] font-mono font-black text-[#D946EF] uppercase tracking-widest flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> ¿CUÁNDO USAR ESTE MODO?
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">{manual.cuandoUsarlo}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-[#E5A93B]/5 border border-[#E5A93B]/20 rounded-xl space-y-1.5">
                        <span className="text-[9px] font-mono font-black text-[#E5A93B] uppercase tracking-widest flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#E5A93B]" /> RECOMENDACIÓN CEREBRO LÓGICO
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed italic font-sans">{manual.consejoCL}</p>
                      </div>

                      {!isSelectedMode && (
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => onProtocoloChange(manual.id, manual.nombre)}
                            className="px-5 py-2 bg-[#E5A93B] text-black font-sans font-black text-[10px] tracking-widest uppercase rounded-xl hover:scale-105 transition-all shadow-md cursor-pointer"
                          >
                            Establecer como Directriz Activa
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. GRÁFICO COMPARATIVO DE PROYECCIÓN A 24 MESES */}
      <div className="bg-[#161a23]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-lg text-white font-serif font-black tracking-wider uppercase">Proyección Patrimonial Comparativa</h2>
            <p className="text-xs text-slate-400 mt-1">Superposición de curvas de Patrimonio Neto estimado a 24 meses</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400 font-bold uppercase">Comparar:</span>
            <select 
              value={est1} 
              onChange={e => setEst1(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none font-bold"
            >
              <option value="conservador">Conservador (50/30/20)</option>
              <option value="agresivo">Agresivo (Bola de Nieve)</option>
              <option value="estacional">Reserva Estacional</option>
              <option value="emprendedor">Sueldo Emprendedor</option>
            </select>
            <span className="py-2 text-white/30 font-black">vs</span>
            <select 
              value={est2} 
              onChange={e => setEst2(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none font-bold"
            >
              <option value="conservador">Conservador (50/30/20)</option>
              <option value="agresivo">Agresivo (Bola de Nieve)</option>
              <option value="estacional">Reserva Estacional</option>
              <option value="emprendedor">Sueldo Emprendedor</option>
            </select>
          </div>
        </div>

        <div className="h-[320px] w-full">
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
                contentStyle={{ backgroundColor: '#0D0E15', borderColor: '#ffffff20', borderRadius: '12px' }}
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
                stroke="#D946EF" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "#D946EF" }}
                name={`Estrategia: ${est2.toUpperCase()}`}
              />
              
              <ReferenceDot x="Mes 14" y={datosChart[13][est1 as keyof typeof datosChart[0]] as number} r={5} fill="#E5A93B" stroke="none" />
              <ReferenceDot x="Mes 14" y={datosChart[13][est2 as keyof typeof datosChart[0]] as number} r={5} fill="#D946EF" stroke="none" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-start gap-3 bg-[#E5A93B]/5 p-4 rounded-2xl border border-[#E5A93B]/20">
          <Info className="w-5 h-5 text-[#E5A93B] shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            <strong className="text-white">Punto de Inflexión (Día de Libertad):</strong> Las curvas muestran cómo varía la velocidad de desendeudamiento y acumulación patrimonial. El modo agresivo elimina intereses de manera óptima a corto plazo, mientras que los esquemas estacionales suavizan los picos de gasto a fin de año.
          </p>
        </div>
      </div>

    </div>
  );
};
