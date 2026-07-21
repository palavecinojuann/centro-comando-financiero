import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { ShieldCheck, TrendingUp, AlertTriangle, Calendar, Settings2, CheckCircle2 } from 'lucide-react';
import { proyectarCiclos, EscenarioIngreso } from '../services/motores/MotorProyeccionNMeses';
import { DeudaConInteres } from '../services/motores/MotorInteligenciaFinanciera';
import { formatNumber } from '../App';

interface PanelProyeccionProps {
  ingresoBimont: number;
  ingresoJanluActual: number;
  gastosVitales: number;
  gastosVariables: number;
  deudasIniciales: DeudaConInteres[];
  ahorroInicial: number;
  metaBlindaje: number;
}

export const PanelProyeccion: React.FC<PanelProyeccionProps> = ({
  ingresoBimont,
  ingresoJanluActual,
  gastosVitales,
  gastosVariables,
  deudasIniciales,
  ahorroInicial,
  metaBlindaje
}) => {
  const [nMeses, setNMeses] = useState(12);
  const [escenarioTipo, setEscenarioTipo] = useState<EscenarioIngreso>('base');
  const [fraccionDeudas, setFraccionDeudas] = useState(0.60);
  
  // Janlu variations based on scenario
  const ingresosJanluEscenarios = {
    pesimista: Math.max(0, ingresoJanluActual * 0.5),
    base: ingresoJanluActual,
    optimista: ingresoJanluActual * 1.5
  };

  const proyeccion = useMemo(() => {
    return proyectarCiclos(
      nMeses,
      {
        nombre: escenarioTipo,
        ingresoBimont: ingresoBimont,
        ingresoJanlu: ingresosJanluEscenarios[escenarioTipo]
      },
      gastosVitales,
      gastosVariables,
      // Copia profunda de deudas para no mutar el prop
      deudasIniciales.map(d => ({...d})),
      ahorroInicial,
      metaBlindaje,
      { fraccionDeudas, splitExpansion: 0.70 }
    );
  }, [nMeses, escenarioTipo, fraccionDeudas, ingresoBimont, ingresoJanluActual, gastosVitales, gastosVariables, deudasIniciales, ahorroInicial, metaBlindaje]);

  const datosGrafico = useMemo(() => {
    return proyeccion.meses.map(m => ({
      name: `M${m.mes}`,
      blindaje: m.ahorroAcumulado,
      deudaRestante: m.deudasActivas.reduce((acc, d) => acc + d.saldoRestante, 0),
      labelCompleto: m.label
    }));
  }, [proyeccion]);

  return (
    <div className="flex flex-col space-y-6">
      {/* Controles de Configuración */}
      <div className="bg-[#161A23]/50 backdrop-blur-md rounded-none p-6 border border-white/10 shadow-xl">
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Settings2 className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Centro de Simulación Táctica</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-white/70 uppercase tracking-wide">
              Horizonte: {nMeses} Meses
            </label>
            <input 
              type="range" 
              min="3" max="36" step="3"
              value={nMeses}
              onChange={(e) => setNMeses(Number(e.target.value))}
              className="w-full accent-[#E5A93B]"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>3m</span>
              <span>36m</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-white/70 uppercase tracking-wide">
              Agresividad a Deuda: {(fraccionDeudas * 100).toFixed(0)}%
            </label>
            <input 
              type="range" 
              min="0.1" max="1" step="0.1"
              value={fraccionDeudas}
              onChange={(e) => setFraccionDeudas(Number(e.target.value))}
              className="w-full accent-[#FF7675]"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>10%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-white/70 uppercase tracking-wide mb-2">
              Escenario Ingresos Janlu
            </label>
            <div className="flex gap-2">
              {(['pesimista', 'base', 'optimista'] as EscenarioIngreso[]).map(esc => (
                <button
                  key={esc}
                  onClick={() => setEscenarioTipo(esc)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                    escenarioTipo === esc 
                      ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50 shadow-inner' 
                      : 'bg-[#161A23]/50 text-white/50 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  {esc}
                </button>
              ))}
            </div>
            <p className="text-center text-[#8b949e] text-xs font-mono mt-2">
              Proyectado: {formatNumber(ingresosJanluEscenarios[escenarioTipo])}/mes
            </p>
          </div>
        </div>
      </div>

      {/* Resultados de la Proyección (Kpis) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#00B894]/10 border border-[#00B894]/30 rounded-none p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <ShieldCheck className="w-12 h-12 text-[#00B894]" />
          </div>
          <h4 className="text-[#00B894] text-[10px] uppercase font-black tracking-widest mb-1 relative z-10">Meta de Blindaje</h4>
          <p className="text-2xl font-bold text-white relative z-10">
            {proyeccion.resumenFinal.mesBlindarjeCompleto !== null 
              ? `Mes ${proyeccion.resumenFinal.mesBlindarjeCompleto}` 
              : 'No alcanzado'}
          </p>
        </div>

        <div className="bg-[#FF7675]/10 border border-[#FF7675]/30 rounded-none p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <AlertTriangle className="w-12 h-12 text-[#FF7675]" />
          </div>
          <h4 className="text-[#FF7675] text-[10px] uppercase font-black tracking-widest mb-1 relative z-10">Intereses Totales</h4>
          <p className="text-2xl font-bold text-[#FF7675] relative z-10">
            {formatNumber(proyeccion.resumenFinal.totalInteresesPagados)}
          </p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-none p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <TrendingUp className="w-12 h-12 text-blue-500" />
          </div>
          <h4 className="text-blue-400 text-[10px] uppercase font-black tracking-widest mb-1 relative z-10">Ahorro vs Original</h4>
          <p className="text-2xl font-bold text-blue-300 relative z-10">
            +{formatNumber(proyeccion.resumenFinal.totalAhorradoEnIntereses)}
          </p>
        </div>

        <div className="bg-[#161A23]/50 border border-white/10 rounded-none p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Calendar className="w-12 h-12 text-white" />
          </div>
          <h4 className="text-slate-300 text-[10px] uppercase font-black tracking-widest mb-1 relative z-10">Deudas Restantes</h4>
          <p className="text-2xl font-bold text-white relative z-10">
            {proyeccion.resumenFinal.deudasNoSaldadas.length}
          </p>
        </div>
      </div>

      {/* Gráfico de Evolución */}
      <div className="bg-[#161A23]/50 backdrop-blur-md rounded-none p-6 border border-white/10 shadow-xl">
        <h3 className="text-white font-bold text-lg mb-6">Trayectoria de Capital</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={datosGrafico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBlindaje" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B894" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00B894" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDeuda" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF7675" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FF7675" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#8b949e" tick={{fill: '#8b949e', fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis stroke="#8b949e" tick={{fill: '#8b949e', fontSize: 12}} tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '1rem', color: '#fff' }}
                itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}
                labelStyle={{ color: '#8b949e', marginBottom: '4px', fontSize: '12px' }}
                formatter={(value: number) => formatNumber(value)}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} iconType="circle" />
              <Area type="monotone" name="Fondo de Blindaje" dataKey="blindaje" stroke="#00B894" strokeWidth={3} fillOpacity={1} fill="url(#colorBlindaje)" />
              <Area type="monotone" name="Deuda Viva" dataKey="deudaRestante" stroke="#FF7675" strokeWidth={3} fillOpacity={1} fill="url(#colorDeuda)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Logros (Deudas Saldadas) */}
      {proyeccion.resumenFinal.deudasSaldadas.length > 0 && (
        <div className="bg-[#161A23]/50 backdrop-blur-md rounded-none p-6 border border-white/10 shadow-xl">
          <h3 className="text-white font-bold text-lg mb-4">Victorias Tácticas Proyectadas</h3>
          <div className="space-y-3">
            {proyeccion.resumenFinal.deudasSaldadas.map(logro => (
              <div key={logro.id} className="flex items-center gap-4 bg-green-500/10 border border-green-500/30 p-4 rounded-none">
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-green-300 font-bold">{logro.descripcion} saldada</p>
                  <p className="text-green-500/70 text-xs">Liberación de capital lograda en el <strong>Mes {logro.enMes}</strong>.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {proyeccion.resumenFinal.mesesEnDeficit > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-none flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
          <div>
            <p className="text-red-400 font-bold text-sm">Alerta Estructural</p>
            <p className="text-red-400/80 text-xs mt-1">
              La proyección detecta {proyeccion.resumenFinal.mesesEnDeficit} meses donde estarás en déficit (ingreso base menor a gastos vitales). Considera recalibrar tus gastos indispensables.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
