import { db } from '../firebase';

export interface AgrupadoInput {
    ingresosBimont: number;
    ingresosJanlu: number;
    gastosEducacion: number;
    gastosAlquilerHogar: number;
    gastosVariables: number;
    deudas: number;
    blindajeAhorro: number;
    expansion: number;
}

export interface SankeyNode {
    name: string;
    category: string;
    colorBase: string;
}

export interface SankeyLink {
    source: number;
    target: number;
    value: number;
}

export interface SankeyData {
    nodes: SankeyNode[];
    links: SankeyLink[];
}

export class MotorSankey {
    public generarDataFlujo(datos: AgrupadoInput): SankeyData {
        // Nodos con sus colores tácticos
        const nodes: SankeyNode[] = [
            { name: 'Bimont S.A.', category: 'ingreso_bimont', colorBase: '#E5A93B' },  // 0 - Cian
            { name: 'Janlu Velas', category: 'ingreso_janlu', colorBase: '#d946ef' },   // 1 - Fucsia Neon
            { name: 'Caudal Total', category: 'caudal_total', colorBase: '#E8DFD1' },   // 2 - Crema
            { name: 'Gastos Vitales', category: 'vitales', colorBase: '#8B735B' },      // 3 - Madera
            { name: 'Gastos Variables', category: 'variables', colorBase: '#F59E0B' },  // 4 - Naranja/Ambar
            { name: 'Excedente Táctico', category: 'excedente', colorBase: '#10B981' }, // 5 - Verde
            { name: 'Educación (Lauty y Martu)', category: 'vitales', colorBase: '#8B735B' }, // 6 - Madera
            { name: 'Alquiler/Hogar', category: 'vitales', colorBase: '#8B735B' },      // 7 - Madera
            { name: 'Cofres / Expansión', category: 'expansion', colorBase: '#D9A852' }, // 8 - Dorado
            { name: 'Blindaje', category: 'blindaje', colorBase: '#10B981' },           // 9 - Verde (Ahorro)
            { name: 'Deudas', category: 'deudas', colorBase: '#ef4444' }                // 10 - Rojo (Peligro)
        ];

        // Validar mínimos para que las líneas se rendericen (evitar ceros absolutos si se quiere ver el flujo simulado)
        const caudalBimont = Math.max(datos.ingresosBimont, 0);
        const caudalJanlu = Math.max(datos.ingresosJanlu, 0);
        const total = caudalBimont + caudalJanlu;

        const educacion = Math.max(datos.gastosEducacion, 0);
        const alquiler = Math.max(datos.gastosAlquilerHogar, 0);
        const vitales = educacion + alquiler;
        
        const variables = Math.max(datos.gastosVariables, 0);
        const totalGastos = vitales + variables;
        const excedente = Math.max(0, total - totalGastos);

        const links: SankeyLink[] = [
            // Fuentes -> Caudal Total
            { source: 0, target: 2, value: caudalBimont },
            { source: 1, target: 2, value: caudalJanlu },
            
            // Caudal Total -> Ramas principales
            { source: 2, target: 3, value: vitales },
            { source: 2, target: 4, value: variables },
            { source: 2, target: 5, value: excedente },

            // Vitales -> Detalles
            { source: 3, target: 6, value: educacion },
            { source: 3, target: 7, value: alquiler },
        ];

        // Excedente -> Destinos
        const extrasTotal = Math.max(datos.expansion, 0) + Math.max(datos.blindajeAhorro, 0) + Math.max(datos.deudas, 0);
        
        if (excedente > 0) {
            if (extrasTotal > 0) {
                // Distribución proporcional del excedente
                if (datos.expansion > 0) links.push({ source: 5, target: 8, value: (datos.expansion / extrasTotal) * excedente });
                if (datos.blindajeAhorro > 0) links.push({ source: 5, target: 9, value: (datos.blindajeAhorro / extrasTotal) * excedente });
                if (datos.deudas > 0) links.push({ source: 5, target: 10, value: (datos.deudas / extrasTotal) * excedente });
            } else {
                // Si no hay distribución especificada pero hay excedente, va todo a blindaje
                links.push({ source: 5, target: 9, value: excedente });
            }
        }

        // Agregamos un pequeño epsilon si total = 0 para que no rompa el gráfico, 
        // aunque idealmente se lo pasa con datos de prueba
        const validLinks = links.filter(l => l.value > 0);

        return { nodes, links: validLinks };
    }
}
