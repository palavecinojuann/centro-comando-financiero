import React from 'react';
import { CreditCard, Landmark, Coins, Home, Percent, ArrowUpRight, Plus } from 'lucide-react';

interface VistaSaldoProps {
  cajaRealTotal: number;
  totalCuotasDeudas: number;
  deudas: any[];
}

export function VistaSaldo({ cajaRealTotal, totalCuotasDeudas, deudas }: VistaSaldoProps) {
  
  // Formateador de moneda
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Cuentas y activos mocks realistas inspirados en la primera pantalla
  const cuentasCorrientes = [
    { id: 'cc1', nombre: 'Banco Nacional', balance: cajaRealTotal * 0.4, progreso: 80, logo: <Landmark className="w-4 h-4" /> },
    { id: 'cc2', nombre: 'Banco Money Pro', balance: cajaRealTotal * 0.35, progreso: 65, logo: <Landmark className="w-4 h-4" /> },
    { id: 'cc3', nombre: 'Cartera USD', balance: cajaRealTotal * 0.15, progreso: 30, logo: <Coins className="w-4 h-4" /> },
    { id: 'cc4', nombre: 'Cartera Efectivo', balance: cajaRealTotal * 0.1, progreso: 20, logo: <Coins className="w-4 h-4" /> }
  ];

  const tarjetasCredito = [
    { id: 'tc1', nombre: 'Banco Money Pro', consumido: totalCuotasDeudas * 2, limite: 450000, logo: <CreditCard className="w-4 h-4" /> },
    { id: 'tc2', nombre: 'Banco Nacional', consumido: totalCuotasDeudas * 1.5, limite: 300000, logo: <CreditCard className="w-4 h-4" /> }
  ];

  const otrosActivos = [
    { id: 'oa1', nombre: 'Ahorros USD', balance: 9480000, logo: <Coins className="w-4 h-4" /> },
    { id: 'oa2', nombre: 'Ahorros Pesos', balance: 233000, logo: <Coins className="w-4 h-4" /> },
    { id: 'oa3', nombre: 'Casa Propia', balance: 54520000, logo: <Home className="w-4 h-4" /> },
    { id: 'oa4', nombre: 'Moto / Movilidad', balance: 2000000, logo: <Home className="w-4 h-4" /> }
  ];

  const totalCuentasCorrientes = cuentasCorrientes.reduce((acc, c) => acc + c.balance, 0);
  const totalTarjetasConsumido = tarjetasCredito.reduce((acc, t) => acc + t.consumido, 0);
  const totalOtrosActivos = otrosActivos.reduce((acc, o) => acc + o.balance, 0);

  return (
    <div className="flex flex-col h-full font-sans select-none pb-12 animate-in fade-in duration-300">
      
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-6 px-4">
        <div>
          <h3 className="text-white text-lg font-serif font-black uppercase tracking-widest">Saldo</h3>
          <p className="text-[9px] font-mono text-bunker-mutado uppercase tracking-widest">// BALANCES Y ACTIVOS CONSOLIDADOS</p>
        </div>
        <button className="px-3 py-1.5 bg-bunker-panel border border-white/5 text-[9px] text-[#00E5FF] font-black uppercase tracking-widest font-sans rounded-xl hover:bg-white/5 transition-all">
          Editar
        </button>
      </div>

      {/* Bloques Destacados Planos Superiores (idénticos a la Pantalla 1) */}
      <div className="px-4 mb-8 space-y-3">
        {/* Caja 1: Saldo Líquido en Turquesa */}
        <div className="w-full bg-[#00E5FF] text-black font-contable font-black text-sm px-4 py-3 rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.2)] flex justify-between items-center">
          <span className="text-[8px] font-mono font-black tracking-widest uppercase">// CAJA REAL LÍQUIDA</span>
          <span>{formatMoney(cajaRealTotal)}</span>
        </div>

        {/* Caja 2: Tarjetas / Deuda en Amarillo */}
        <div className="w-full bg-[#FFD500] text-black font-contable font-black text-sm px-4 py-3 rounded-xl shadow-[0_0_15px_rgba(255,213,0,0.15)] flex justify-between items-center">
          <span className="text-[8px] font-mono font-black tracking-widest uppercase">// CRÉDITO COMPROMETIDO</span>
          <span>{formatMoney(totalTarjetasConsumido)}</span>
        </div>
      </div>

      <div className="space-y-8 px-2">

        {/* CUENTAS CORRIENTES */}
        <section className="bg-bunker-panel border border-white/5 p-5 rounded-3xl backdrop-blur-xl">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
            <span className="text-[10px] font-serif font-black uppercase tracking-[0.25em] text-white">Cuentas Corrientes</span>
            <span className="text-[10px] font-black text-white/70 font-sans font-contable">{formatMoney(totalCuentasCorrientes)}</span>
          </div>

          <div className="space-y-4">
            {cuentasCorrientes.map(cuenta => (
              <div key={cuenta.id} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-bunker-mutado">
                    {cuenta.logo}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-white font-bold tracking-wide uppercase text-[10px]">{cuenta.nombre}</span>
                    {/* Barra de progreso de cuenta en turquesa */}
                    <div className="w-24 h-1 bg-black/50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00E5FF]" style={{ width: `${cuenta.progreso}%` }} />
                    </div>
                  </div>
                </div>
                <span className="text-white font-black font-sans text-xs font-contable">{formatMoney(cuenta.balance)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* TARJETAS DE CREDITO */}
        <section className="bg-bunker-panel border border-white/5 p-5 rounded-3xl backdrop-blur-xl">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
            <span className="text-[10px] font-serif font-black uppercase tracking-[0.25em] text-white">Tarjetas de Crédito</span>
            <span className="text-[10px] font-black text-[#FFD500] font-sans font-contable">{formatMoney(totalTarjetasConsumido)}</span>
          </div>

          <div className="space-y-4">
            {tarjetasCredito.map(tc => {
              const pct = (tc.consumido / tc.limite) * 100;
              return (
                <div key={tc.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-[#FFD500]/60">
                      {tc.logo}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-white font-bold tracking-wide uppercase text-[10px]">{tc.nombre}</span>
                      <div className="w-24 h-1 bg-black/50 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FFD500]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[#FFD500] font-black font-sans text-xs font-contable">{formatMoney(tc.consumido)}</span>
                    <span className="text-[8px] font-mono text-bunker-mutado font-contable">Límite {formatMoney(tc.limite)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* OTROS ACTIVOS */}
        <section className="bg-bunker-panel border border-white/5 p-5 rounded-3xl backdrop-blur-xl">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
            <span className="text-[10px] font-serif font-black uppercase tracking-[0.25em] text-white">Otros Activos</span>
            <span className="text-[10px] font-black text-white/70 font-sans font-contable">{formatMoney(totalOtrosActivos)}</span>
          </div>

          <div className="space-y-4">
            {otrosActivos.map(activo => (
              <div key={activo.id} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-bunker-mutado">
                    {activo.logo}
                  </div>
                  <span className="text-white font-bold tracking-wide uppercase text-[10px]">{activo.nombre}</span>
                </div>
                <span className="text-white font-black font-sans text-xs font-contable">{formatMoney(activo.balance)}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
