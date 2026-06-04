export interface GastoProcesado {
  fechaGasto: string;
  nombreComercio: string;
  montoTotal: number;
  categoriaMacroSugerida: 'COMPROMISOS_INDISPENSABLES' | 'GASTOS_VARIABLES';
  estadoLectura: string;
}

export class ServicioLectorTickets { 
  private readonly dic_indispensables = ["COLEGIO", "COTO", "FARMACIA", "LUZ", "AGUA", "GAS", "INTERNET", "ALQUILER", "SUPER", "CARREFOUR", "DIA"];
  
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
                matriz[j][i - 1] + 1,
                matriz[j - 1][i] + 1,
                matriz[j - 1][i - 1] + indicadorSustitucion
            );
        }
    }
    return matriz[b.length][a.length];
  }

  public procesarTexto(textoBruto: string): GastoProcesado { 
    if (!textoBruto || textoBruto.trim().length === 0) { 
      return { fechaGasto: new Date().toISOString().split('T')[0], nombreComercio: "Desconocido", montoTotal: 0, categoriaMacroSugerida: "GASTOS_VARIABLES", estadoLectura: "ERROR: Sin texto" }; 
    }
    return {
      fechaGasto: this.extraerFecha(textoBruto),
      nombreComercio: "Extracción Automática",
      montoTotal: this.extraerMontoMaximo(textoBruto),
      categoriaMacroSugerida: this.clasificarGasto(textoBruto),
      estadoLectura: "EXITO"
    };
  }

  private extraerMontoMaximo(texto: string): number { 
    const patronMonto = /(?:\$?\s?)(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:\.\d{2})?)/g; 
    const coincidencias = texto.match(patronMonto); 
    if (!coincidencias) return 0; 
    const valores = coincidencias.map(m => parseFloat(m.replace(/\$|\s|\./g, '').replace(',', '.'))).filter(v => !isNaN(v)); 
    return Math.max(...valores); 
  }

  private extraerFecha(texto: string): string { 
    const patronFecha = /\b(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})\b/; 
    const coincidencia = texto.match(patronFecha); 
    if (coincidencia) return `20${coincidencia[3].slice(-2)}-${coincidencia[2].padStart(2, '0')}-${coincidencia[1].padStart(2, '0')}`; 
    return new Date().toISOString().split('T')[0]; 
  }

  private clasificarGasto(texto: string): 'COMPROMISOS_INDISPENSABLES' | 'GASTOS_VARIABLES' {
    const palabrasTicket = texto.toUpperCase().split(/\s+/);
    const MARGEN_ERROR = 2;
    for (const palabraClave of this.dic_indispensables) {
        for (const palabraTicket of palabrasTicket) {
            if (palabraTicket.includes(palabraClave)) return 'COMPROMISOS_INDISPENSABLES';
            if (Math.abs(palabraTicket.length - palabraClave.length) <= MARGEN_ERROR) {
                if (this.calcularDistancia(palabraClave, palabraTicket) <= MARGEN_ERROR) return 'COMPROMISOS_INDISPENSABLES';
            }
        }
    }
    return 'GASTOS_VARIABLES';
  }
}
