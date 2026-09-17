export type RiskLevel = 'NIVEL_I' | 'NIVEL_II' | 'NIVEL_III' | 'NIVEL_IV';

export interface ControlItem {
  status: 'INEXISTENTE' | 'INSUFICIENTE' | 'ACEPTABLE' | 'CRÍTICO';
  description: string;
}

export interface EppItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface HazardEvaluation {
  np: number; // 1-5
  nc: number; // 1-5
  nr: number; // np * nc (1-25)
  level: RiskLevel;
  levelText: string;
  aceptabilidad: string;
  normativaText: string;
}

export interface PhotographicEvidence {
  url: string;
  caption: string;
}

export interface HazardRecord {
  id: string; // e.g. "PEL-2024-001"
  code: string; // e.g. "GTC45-TLA-2024-09"
  title: string;
  subtitle: string;
  macroproceso: 'OPERATIVO / PRODUCCIÓN TÉCNICA AUTOMOTRIZ' | 'BIENESTAR / SERVICIOS • SEDE OPERATIVA' | 'ADMINISTRATIVO / GESTIÓN GENERAL';
  proceso: string;
  zonaLugar: string;
  actividadEspecifica: string;
  rutinaria: boolean;
  operariosExpuestos: number;
  
  // Classification
  tipoPeligroGeneral: string;
  factorEspecifico: string;
  descripcionDetallada: string;
  efectosSalud: string;
  patologiasPrevistas?: {
    titulo: string;
    descripcion: string;
  }[];

  // Existing controls
  controles: {
    fuente: ControlItem;
    medio: ControlItem;
    individuo: ControlItem;
  };

  // Evaluation
  evaluacion: HazardEvaluation;

  // Plan de Intervención
  planIntervencion: {
    administrativa: {
      titulo: string;
      estado: string;
      descripcion: string;
    };
    epp: {
      titulo: string;
      prioridad: string;
      items: EppItem[];
    };
    ingenieria: {
      titulo: string;
      fase: string;
      descripcion: string;
    };
    responsable: string;
    plazoLegal: string;
  };

  evidenciaFotos: PhotographicEvidence[];
  estadoEntregaEPP: 'PENDIENTE' | 'FIRMADA';
  fechaInspeccion: string;
}

export interface CompanyInfo {
  name: string;
  nit: string;
  claseRiesgo: string;
  ciiu: string;
  sede: string;
  responsableSST: {
    nombre: string;
    cargo: string;
    licencia: string;
    curso50h: string;
    hashFirma: string;
    estado: 'ACTIVO' | 'INACTIVO';
  };
  representanteLegal: {
    nombre: string;
    cargo: string;
    cedula: string;
    estadoAprobacion: 'PENDIENTE CONVALIDACIÓN' | 'APROBADO';
  };
}

export type ActiveView = 'peligros-lista' | 'peligro-detalle' | 'matriz-gtc45' | 'registrar-nuevo' | 'diagnostico-0312';
