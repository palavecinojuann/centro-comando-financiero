import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface FacturaDetectada {
    id: string;
    proveedor: string;
    montoTotal: number;
    fechaVencimiento: string;
    asunto: string;
    fechaRecepcion: string;
    estado: 'Pendiente de Pago' | 'Pagado' | 'Ignorado';
}

export class RadarFacturasService {
    // Simulamos la autenticación con la API de Gmail
    private async autenticarGmail(): Promise<boolean> {
        // En un entorno real, aquí se usaría gapi.auth2 o @react-oauth/google
        console.log("[RadarFacturas] Autenticando con Gmail API...");
        await new Promise(resolve => setTimeout(resolve, 800)); // Simular delay de red
        return true;
    }

    // Simulamos la búsqueda de correos (ej: from:edenor OR from:colegio has:attachment)
    public async escanearBandeja(): Promise<FacturaDetectada[]> {
        const autenticado = await this.autenticarGmail();
        if (!autenticado) {
            throw new Error("No se pudo autenticar con Gmail.");
        }

        console.log("[RadarFacturas] Escaneando bandeja de entrada: 'from:edenor OR from:colegio has:attachment'...");
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulamos el escaneo

        // Simulamos la extracción de datos
        return this.simularExtraccionTexto();
    }

    private simularExtraccionTexto(): FacturaDetectada[] {
        // En producción, aquí se descargaría el PDF del correo y se pasaría por OCR / IA para extraer montos
        const facturasEncontradas: FacturaDetectada[] = [];

        // Simulamos un 70% de probabilidad de encontrar una factura nueva en el escaneo
        if (Math.random() > 0.3) {
            const proveedoresMocks = [
                { nombre: "Edenor", montoBase: 18500, variacion: 5000 },
                { nombre: "Colegio San Martín", montoBase: 120000, variacion: 15000 },
                { nombre: "Personal Flow", montoBase: 25000, variacion: 2000 },
                { nombre: "Metrogas", montoBase: 9000, variacion: 3000 },
            ];

            const proveedorAleatorio = proveedoresMocks[Math.floor(Math.random() * proveedoresMocks.length)];
            const montoFinal = proveedorAleatorio.montoBase + (Math.random() * proveedorAleatorio.variacion);
            
            // Fecha de vencimiento: ~10 días en el futuro
            const fechaVenc = new Date();
            fechaVenc.setDate(fechaVenc.getDate() + 10 + Math.floor(Math.random() * 5));

            facturasEncontradas.push({
                id: `fact_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                proveedor: proveedorAleatorio.nombre,
                montoTotal: Number(montoFinal.toFixed(2)),
                fechaVencimiento: fechaVenc.toISOString().split('T')[0],
                asunto: `Tu factura de ${proveedorAleatorio.nombre} ya está disponible`,
                fechaRecepcion: new Date().toISOString(),
                estado: 'Pendiente de Pago'
            });
        }

        return facturasEncontradas;
    }

    // Método para inyectar la factura descubierta en Firebase (Radar de Compromisos)
    public async integrarFacturaEnRadar(factura: FacturaDetectada, idHogar: string): Promise<void> {
        try {
            console.log(`[RadarFacturas] Integrando factura de ${factura.proveedor} por $${factura.montoTotal} en Firebase...`);
            
            // Lo guardamos en la colección "debts" (Compromisos) asumiendo que debe pagarse
            const payload = {
                nombreCompromiso: `Factura ${factura.proveedor}`,
                montoEstimado: factura.montoTotal,
                fechaVencimiento: new Date(`${factura.fechaVencimiento}T12:00:00`),
                tipoLiquidacion: 'mensual',
                estado: 'Activo',
                prioridad: 'Alta', // Gastos fijos suelen ser alta prioridad
                diaVencimiento: parseInt(factura.fechaVencimiento.split('-')[2], 10),
                createdAt: serverTimestamp(),
                origen: 'RadarFacturas_Gmail'
            };

            await addDoc(collection(db, `hogares/${idHogar}/debts`), payload);
            console.log("[RadarFacturas] Factura integrada exitosamente.");
        } catch (error) {
            console.error("[RadarFacturas] Error al integrar factura:", error);
            throw new Error("No se pudo integrar la factura en la base de datos.");
        }
    }
}
