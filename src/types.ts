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
  trabajadores?: number;
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

export interface IncapacidadRecord {
  id: string;
  codigo: string; // e.g. "INC-2025-001"
  empleado: string;
  cedula: string;
  cargo: string;
  tipo: 'ENFERMEDAD_GENERAL' | 'ACCIDENTE_TRABAJO' | 'ENFERMEDAD_LABORAL';
  codigoCIE10: string; // e.g. "M54.5", "S61.0"
  diagnostico: string;
  fechaInicio: string;
  fechaFin: string;
  diasIncapacidad: number;
  entidadExpide: string; // e.g. "Sura EPS", "Positiva ARL"
  soporteNombre?: string;
  estado: 'RADICADO' | 'EN_COBRO_ARL_EPS' | 'RECONOCIDO';
  costoAsumido: number;
  fechaRegistro: string;
}

export type ActiveView =
  | 'inicio'
  | 'matriz-gtc45'
  | 'gestion-peligros'
  | 'capacitaciones'
  | 'calendario'
  | 'diagnostico-0312'
  | 'ausentismo'
  | 'actas-entrega'
  | 'peligros-lista'
  | 'peligro-detalle'
  | 'registrar-nuevo';

export type CalendarEventCategory = 'CAPACITACION' | 'INSPECCION' | 'INCAPACIDAD' | 'EPP' | 'LEGAL' | 'AUDITORIA';

export interface CalendarEventItem {
  id: string;
  fecha: string; // YYYY-MM-DD
  hora?: string;
  titulo: string;
  subtitulo?: string;
  categoria: CalendarEventCategory;
  estado?: 'PROGRAMADA' | 'EJECUTADA' | 'VENCIDA' | 'URGENTE' | 'PROXIMO' | 'PENDIENTE' | 'REPROGRAMADA';
  responsable?: string;
  lugar?: string;
  normativa?: string;
  relacionadoId?: string;
  tipoAccion?: 'IR_PELIGRO' | 'IR_AUSENTISMO' | 'IR_ACTAS' | 'IR_0312' | 'IR_CAPACITACIONES' | 'ACCION_INTERNA';
}

export type VencimientoCategoria = 
  | 'DOCUMENTO' 
  | 'INSPECCION' 
  | 'INCAPACIDAD' 
  | 'EPP' 
  | 'CAPACITACION'
  | 'AUDITORIA';

export type VencimientoUrgencia = 
  | 'VENCIDO' 
  | 'URGENTE' 
  | 'PROXIMO' 
  | 'PROGRAMADO';

export interface VencimientoItem {
  id: string;
  titulo: string;
  categoria: VencimientoCategoria;
  subtitulo: string;
  fechaLimite: string;
  diasRestantes: number; // Negativo si está vencido, 0 hoy, positivo si futuro
  urgencia: VencimientoUrgencia;
  normativa: string;
  responsable: string;
  areaAfectada: string;
  relacionadoId?: string;
  tipoAccion: 'IR_PELIGRO' | 'IR_AUSENTISMO' | 'IR_ACTAS' | 'IR_0312' | 'IR_CAPACITACIONES' | 'ACCION_INTERNA';
  completado?: boolean;
}

export interface CapacitacionAsistente {
  id: string;
  nombre: string;
  cedula: string;
  cargo: string;
  asistio: boolean;
  calificacion?: number; // 0 a 100
  firmaRegistrada: boolean;
}

export interface CapacitacionRecord {
  id: string;
  codigo: string; // e.g. "CAP-2025-001"
  tema: string;
  objetivo: string;
  peligroIdRelacionado?: string; // e.g. "PEL-2024-001"
  codigoPeligro?: string; // "GTC45-TLA-2024-09"
  tipoPeligroGTC45: string;
  areaAfectada: string;
  modalidad: 'PRESENCIAL_TEORICO_PRACTICO' | 'TALLER_PUESTO_TRABAJO' | 'CHARLA_5_MIN' | 'VIRTUAL_ARL';
  duracionHoras: number;
  fechaProgramada: string;
  fechaEjecucion?: string;
  estado: 'PROGRAMADA' | 'EJECUTADA' | 'VENCIDA' | 'REPROGRAMADA';
  capacitador: {
    nombre: string;
    entidad: string;
    licenciaOId: string;
  };
  publicoObjetivo: string[];
  convocadosCount: number;
  asistentesCount: number;
  porcentajeCobertura: number;
  porcentajeAprobacion: number;
  asistentes: CapacitacionAsistente[];
  temario: string[];
  normativaAplicable: string;
  observaciones?: string;
  requiereEvaluacionEficacia: boolean;
  eficaciaEvaluada: boolean;
  resultadoEficacia?: 'EFICAZ' | 'REQUIERE_REFUERZO';
}
