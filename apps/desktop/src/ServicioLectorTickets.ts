/**
 * ServicioLectorTickets.ts
 * Procesador de texto OCR para la automatización de carga de gastos.
 */

export interface GastoProcesado {
  fechaGasto: string;
  nombreComercio: string;
  montoTotal: number;
  categoriaSugerida: string;
  estadoLectura: string;
}

export class ServicioLectorTickets {
  private readonly diccionarioCategorias = [
    { 
      nombre: 'Logística Laboral', 
      palabrasClave: ["YPF", "AXION", "SHELL", "PEAJE", "ESTACION", "COMBUSTIBLE", "NAFTA"], 
      prioridad: 4 
    },
    { 
      nombre: 'Sostenimiento Vital', 
      palabrasClave: ["COTO", "CARREFOUR", "DIA", "MERCADO", "CHINO", "FARMACIA", "SALUD", "CLINICA", "SUPERMERCADO"], 
      prioridad: 5 
    },
    { 
      nombre: 'Educación', 
      palabrasClave: ["LIBRERIA", "UNIFORME", "COLEGIO", "CUOTA", "MATRICULA", "UTILES"], 
      prioridad: 5 
    }
  ];

  public procesarTexto(textoBruto: string): GastoProcesado {
    if (!textoBruto || textoBruto.trim().length === 0) {
      return {
        fechaGasto: new Date().toISOString().split('T')[0],
        nombreComercio: "Desconocido",
        montoTotal: 0,
        categoriaSugerida: "Sin Clasificar",
        estadoLectura: "ERROR: No se detectó texto en la imagen"
      };
    }

    const textoLimpio = textoBruto.toUpperCase();
    const montoFinal = this.extraerMontoMaximo(textoLimpio);
    const fechaFinal = this.extraerFecha(textoLimpio);
    const categoria = this.clasificarGasto(textoLimpio);
    const comercio = this.identificarComercio(textoLimpio);

    return {
      fechaGasto: fechaFinal,
      nombreComercio: comercio,
      montoTotal: montoFinal,
      categoriaSugerida: categoria,
      estadoLectura: montoFinal > 0 ? "EXITOSO" : "ADVERTENCIA: Monto no detectado con claridad"
    };
  }

  private extraerMontoMaximo(texto: string): number {
    const patronMonto = /(?:\$?\s?)(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:\.\d{2})?)/g;
    const coincidencias = texto.match(patronMonto);
    if (!coincidencias) return 0;
    const valores = coincidencias.map(m => {
      let limpio = m.replace(/\$|\s/g, '').replace(/\./g, '').replace(',', '.');
      return parseFloat(limpio);
    }).filter(v => !isNaN(v));
    return valores.length > 0 ? Math.max(...valores) : 0;
  }

  private extraerFecha(texto: string): string {
    const patronFecha = /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/;
    const coincidencia = texto.match(patronFecha);
    if (coincidencia) {
      const [_, dia, mes, anio] = coincidencia;
      const anioCompleto = anio.length === 2 ? `20${anio}` : anio;
      return `${anioCompleto}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
    return new Date().toISOString().split('T')[0];
  }

  private clasificarGasto(texto: string): string {
    for (const cat of this.diccionarioCategorias) {
      if (cat.palabrasClave.some(p => texto.includes(p))) {
        return cat.nombre;
      }
    }
    return 'Otros Gastos';
  }

  private identificarComercio(texto: string): string {
    const lineas = texto.split('\n').filter(l => l.trim().length > 3);
    return lineas.length > 0 ? lineas[0].trim() : "Comercio no identificado";
  }
}
