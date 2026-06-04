import { useState, useMemo } from 'react';

export type TipoProtocolo = 
  | 'BLINDAJE' 
  | 'EXPANSION' 
  | 'DISFRUTE' 
  | 'FRENAR_FUGAS' 
  | 'ABSORBER_IMPACTO' 
  | 'ROMPER_CRISTAL'
  | 'TACTICO_LIBRE';

export interface SituacionFinanciera {
  ingresosTotales: number;
  gastosTotales: number;
}

export interface EscenarioProtocolo {
  id: TipoProtocolo;
  nombre: string;
  descripcionBreve: string;
  resultadoProyectado: string;
  esActivo: boolean;
}

/**
 * Hook personalizado para calcular escenarios simultáneos en tiempo real.
 */
export function useSimuladorEscenarios(
  situacionBase: SituacionFinanciera,
  protocoloInicial: TipoProtocolo = 'BLINDAJE'
) {
  const [protocoloActivo, setProtocoloActivo] = useState<TipoProtocolo>(protocoloInicial);

  const escenariosCalculados = useMemo(() => {
    const balance = situacionBase.ingresosTotales - situacionBase.gastosTotales;
    const hayExcedente = balance >= 0;

    const escenarioLibre: EscenarioProtocolo = {
      id: 'TACTICO_LIBRE',
      nombre: 'Táctico Libre',
      descripcionBreve: 'Asignación manual por niveles de supervivencia.',
      resultadoProyectado: 'Tú dictas la distribución de cada peso según tu criterio táctico.',
      esActivo: protocoloActivo === 'TACTICO_LIBRE'
    };

    const escenariosExcedente: EscenarioProtocolo[] = [
      {
        id: 'BLINDAJE',
        nombre: 'Modo Blindaje',
        descripcionBreve: '100% del excedente al Fondo de Emergencia.',
        resultadoProyectado: `Completarías tu fondo absorbiendo $${balance.toLocaleString()} extras este mes.`,
        esActivo: protocoloActivo === 'BLINDAJE'
      },
      {
        id: 'EXPANSION',
        nombre: 'Modo Expansión',
        descripcionBreve: 'Aceleración patrimonial y pago de deuda.',
        resultadoProyectado: `Inyectarías $${(balance * 0.8).toLocaleString()} a deudas/capital y $${(balance * 0.2).toLocaleString()} a disfrute.`,
        esActivo: protocoloActivo === 'EXPANSION'
      },
      {
        id: 'DISFRUTE',
        nombre: 'Modo Disfrute',
        descripcionBreve: 'Recompensa táctica. Liberación total del excedente.',
        resultadoProyectado: `Liberarías $${balance.toLocaleString()} para ocio y recarga mental.`,
        esActivo: protocoloActivo === 'DISFRUTE'
      },
      escenarioLibre
    ];

    const escenariosDeficit: EscenarioProtocolo[] = [
      {
        id: 'FRENAR_FUGAS',
        nombre: 'Frenar Fugas',
        descripcionBreve: 'Auditoría agresiva y corte de gastos secundarios.',
        resultadoProyectado: `Se requiere recortar $${Math.abs(balance).toLocaleString()} en gastos de Nivel 3 a 5.`,
        esActivo: protocoloActivo === 'FRENAR_FUGAS'
      },
      {
        id: 'ABSORBER_IMPACTO',
        nombre: 'Absorber Impacto',
        descripcionBreve: 'Quema controlada de reservas tácticas.',
        resultadoProyectado: `Drenarías $${Math.abs(balance).toLocaleString()} de tu Fondo de Emergencia.`,
        esActivo: protocoloActivo === 'ABSORBER_IMPACTO'
      },
      {
        id: 'ROMPER_CRISTAL',
        nombre: 'Romper el Cristal',
        descripcionBreve: 'Alerta Roja. Financiación de emergencia.',
        resultadoProyectado: `Requieres $${Math.abs(balance).toLocaleString()} en inyección de Janlu o toma de deuda estratégica.`,
        esActivo: protocoloActivo === 'ROMPER_CRISTAL'
      },
      escenarioLibre
    ];

    return hayExcedente ? escenariosExcedente : escenariosDeficit;

  }, [situacionBase, protocoloActivo]);

  const escenarioActivo = escenariosCalculados.find(e => e.esActivo) || escenariosCalculados[0];
  const escenariosAlternativos = escenariosCalculados.filter(e => !e.esActivo);

  const cambiarProtocolo = (nuevoProtocolo: TipoProtocolo) => {
    setProtocoloActivo(nuevoProtocolo);
  };

  return {
    protocoloActivo,
    escenarioActivo,
    escenariosAlternativos,
    cambiarProtocolo
  };
}
