/**
 * ServicioLectorTickets.ts
 * Procesador de texto OCR para la automatización de carga de gastos.
 */

export type GastoProcesado = {
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

  private calcularDistancia(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matriz = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i += 1) { matriz[0][i] = i; }
    for (let j = 0; j <= b.length; j += 1) { matriz[j][0] = j; }

    for (let j = 1; j <= b.length; j += 1) {
      for (let i = 1; i <= a.length; i += 1) {
        const indicadorSustitucion = a[i - 1] === b[j - 1] ? 0 : 1;
        matriz[j][i] = Math.min(
          matriz[j][i - 1] + 1, // inserción
          matriz[j - 1][i] + 1, // borrado
          matriz[j - 1][i - 1] + indicadorSustitucion // sustitución
        );
      }
    }
    return matriz[b.length][a.length];
  }

  private clasificarGasto(texto: string): string {
    // 1. Limpiamos y separamos el texto del ticket OCR en palabras individuales
    const palabrasTicket = texto.toUpperCase().split(/\s+/);
    
    // 2. Definimos el margen de error permitido (ej. 2 letras equivocadas)
    const MARGEN_ERROR = 2;

    for (const cat of this.diccionarioCategorias) {
      for (const palabraClave of cat.palabrasClave) {
        for (const palabraTicket of palabrasTicket) {
          
          // Primero intentamos una coincidencia exacta rápida
          if (palabraTicket.includes(palabraClave)) {
            return cat.nombre;
          }

          // Si falla, aplicamos Fuzzy Matching (Levenshtein)
          // Solo comparamos si las longitudes son similares para no gastar recursos
          if (Math.abs(palabraTicket.length - palabraClave.length) <= MARGEN_ERROR) {
            const distancia = this.calcularDistancia(palabraClave, palabraTicket);
            if (distancia <= MARGEN_ERROR) {
              return cat.nombre; // ¡Match difuso exitoso!
            }
          }
        }
      }
    }
    
    return 'Otros Gastos'; // Fallback si nada coincide
  }

  private identificarComercio(texto: string): string {
    const lineas = texto.split('\n').filter(l => l.trim().length > 3);
    return lineas.length > 0 ? lineas[0].trim() : "Comercio no identificado";
  }
}
