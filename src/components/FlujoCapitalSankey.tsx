import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, Briefcase, Activity, ShoppingBag, ShieldCheck } from 'lucide-react';

interface SankeyProps {
  bimont: number;
  janlu: number;
  vitales: number;
  variables: number;
  excedente: number;
}

export function FlujoCapitalSankey({ bimont, janlu, vitales, variables, excedente }: SankeyProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 400 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const formatNumber = (num: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(num).replace('ARS', '$').trim();

  const totalInput = bimont + janlu || 1;
  const totalOutput = vitales + variables + excedente || 1;

  // The Y positions (in percentages 0-100)
  const yPos = {
    bimont: 30,
    janlu: 70,
    vitales: 15,
    variables: 50,
    excedente: 85,
  };

  // Flows proportional routing (Dorado = Cimiento, Fucsia = Acelerador, Cian = Liquidez/Excedentes)
  const flows = [
    { id: 'b-vit', from: 'bimont', to: 'vitales', value: bimont * (vitales / totalOutput), colorFrom: '#F1C40F', colorTo: '#F1C40F' },
    { id: 'b-var', from: 'bimont', to: 'variables', value: bimont * (variables / totalOutput), colorFrom: '#F1C40F', colorTo: '#E5A93B' },
    { id: 'b-exc', from: 'bimont', to: 'excedente', value: bimont * (excedente / totalOutput), colorFrom: '#F1C40F', colorTo: '#E5A93B' },
    { id: 'j-vit', from: 'janlu', to: 'vitales', value: janlu * (vitales / totalOutput), colorFrom: '#D946EF', colorTo: '#F1C40F' },
    { id: 'j-var', from: 'janlu', to: 'variables', value: janlu * (variables / totalOutput), colorFrom: '#D946EF', colorTo: '#E5A93B' },
    { id: 'j-exc', from: 'janlu', to: 'excedente', value: janlu * (excedente / totalOutput), colorFrom: '#D946EF', colorTo: '#E5A93B' },
  ].filter(f => f.value > 0);

  const maxFlow = Math.max(...flows.map(f => f.value), 1);

  const getOpacity = (flow: any) => {
    if (!hoveredNode) return 0.25; // Base translucency
    if (hoveredNode === flow.from || hoveredNode === flow.to) return 0.85; // Highlight
    return 0.03; // Dim others
  };

  return (
      <div className="relative w-full h-[350px] sm:h-[450px] glass-premium neumorphic-dark-out rounded-[2rem] overflow-hidden flex px-2 sm:px-4">
        {/* Decorative Grid & Lights */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        
        {/* Left Nodes Container */}
        <div className="w-[120px] sm:w-[150px] h-full relative z-10 shrink-0">
           <NodeCard 
              id="bimont" 
              title="Bimont" 
              amount={bimont} 
              color="#F1C40F" 
              icon={<Briefcase />}
              pos={yPos.bimont} 
              isHovered={hoveredNode === 'bimont'}
              onHover={setHoveredNode}
              formatNumber={formatNumber}
           />
           <NodeCard 
              id="janlu" 
              title="Janlu Velas" 
              amount={janlu} 
              color="#D946EF" 
              icon={<Zap />}
              pos={yPos.janlu} 
              isHovered={hoveredNode === 'janlu'}
              onHover={setHoveredNode}
              formatNumber={formatNumber}
           />
        </div>

        {/* SVG Flow Container */}
        <div ref={containerRef} className="flex-1 h-full relative z-0 mx-[-5px] sm:mx-[-10px] pointer-events-none drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
            <svg className="absolute inset-0 w-full h-full">
               <defs>
                  {flows.map((flow) => (
                     <linearGradient key={`grad-${flow.id}`} id={`grad-${flow.id}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={flow.colorFrom} stopOpacity="1" />
                        <stop offset="100%" stopColor={flow.colorTo} stopOpacity="1" />
                     </linearGradient>
                  ))}
               </defs>
               {flows.map((flow) => {
                  const y1 = (yPos[flow.from as keyof typeof yPos] / 100) * dimensions.height;
                  const y2 = (yPos[flow.to as keyof typeof yPos] / 100) * dimensions.height;
                  const path = `M 0 ${y1} C ${dimensions.width / 2} ${y1}, ${dimensions.width / 2} ${y2}, ${dimensions.width} ${y2}`;
                  const strokeWidth = Math.max(2, (flow.value / maxFlow) * 15); 

                  return (
                     <motion.path 
                        key={flow.id}
                        d={path}
                        fill="none"
                        stroke={`url(#grad-${flow.id})`}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: getOpacity(flow) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{ transition: 'opacity 0.4s ease' }}
                     />
                  )
               })}
            </svg>
        </div>

        {/* Right Nodes Container */}
        <div className="w-[120px] sm:w-[150px] h-full relative z-10 shrink-0">
           <NodeCard 
              id="vitales" 
              title="C. Vitales" 
              amount={vitales} 
              color="#F1C40F" 
              icon={<Activity />}
              pos={yPos.vitales} 
              isHovered={hoveredNode === 'vitales'}
              onHover={setHoveredNode}
              formatNumber={formatNumber}
           />
           <NodeCard 
              id="variables" 
              title="Variables" 
              amount={variables} 
              color="#E5A93B" 
              icon={<ShoppingBag />}
              pos={yPos.variables} 
              isHovered={hoveredNode === 'variables'}
              onHover={setHoveredNode}
              formatNumber={formatNumber}
           />
           <NodeCard 
              id="excedente" 
              title="Excedente" 
              amount={excedente} 
              color="#E5A93B" 
              icon={<ShieldCheck />}
              pos={yPos.excedente} 
              isHovered={hoveredNode === 'excedente'}
              onHover={setHoveredNode}
              formatNumber={formatNumber}
           />
        </div>
      </div>
  );
}

const NodeCard = ({ id, title, amount, color, icon, pos, isHovered, onHover, formatNumber }: any) => {
    return (
       <div 
         className={`absolute w-full cursor-pointer transition-transform duration-300 ${isHovered ? 'scale-105 z-20' : 'scale-100 z-10'}`}
         style={{
            top: `${pos}%`,
            transform: `translateY(-50%)`,
         }}
         onMouseEnter={() => onHover(id)}
         onMouseLeave={() => onHover(null)}
       >
          <div 
            className={`bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl p-2 sm:p-3 shadow-2xl flex items-center gap-2 sm:gap-3 hover:bg-white/10 hover:border-white/10 transition-all duration-300 ${isHovered ? 'ring-1' : ''}`} 
            style={{ ringColor: `${color}80` }}
          >
             <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}40`, color: color }}>
                {React.cloneElement(icon, { className: "w-4 h-4 sm:w-5 sm:h-5" })}
             </div>
             <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-slate-400 text-[8px] sm:text-[9px] uppercase font-bold tracking-widest truncate">{title}</p>
                <p className="text-white font-black text-[11px] sm:text-[13px] tracking-tight truncate font-contable">
                  {formatNumber(amount)}
                </p>
             </div>
          </div>
       </div>
    )
}
