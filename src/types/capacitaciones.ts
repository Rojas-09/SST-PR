// Domain types for the SST Capacitaciones module (RBAC Opción A & SG-SST)

export type UserRole = 'ADMINISTRADOR' | 'RESPONSABLE_SST' | 'INSTRUCTOR_EXTERNO' | 'LECTURA';

export interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  cargo: string;
  entidad: string;
  licenciaOId?: string;
  capacitadorId?: string; // Links to capacitadorId for INSTRUCTOR_EXTERNO
}

export type ModalidadCapacitacion =
  | 'PRESENCIAL_TEORICO_PRACTICO'
  | 'TALLER_PUESTO_TRABAJO'
  | 'CHARLA_5_MIN'
  | 'VIRTUAL_ARL';

export type EstadoPlan = 'PROGRAMADA' | 'REPROGRAMADA' | 'EJECUTADA' | 'ANULADA';

export type EstadoActaSesion = 'PENDIENTE' | 'FIRMADA' | 'CONVALIDADA' | 'REABIERTA';

export type TipoCapacitador = 'INTERNO' | 'EXTERNO' | 'ARL';

export type ResultadoEficacia = 'EFICAZ' | 'REQUIERE_REFUERZO' | 'PENDIENTE';

export type TipoEvidencia =
  | 'FOTOGRAFIA'
  | 'LISTA_ASISTENCIA_FISICA'
  | 'EVALUACION_ESCRITA'
  | 'CERTIFICADO'
  | 'OTRO';

export type PrintTemplateType =
  | 'ACTA_OFICIAL'
  | 'LISTA_ASISTENCIA'
  | 'CRONOGRAMA_ANUAL'
  | 'REPORTE_COBERTURA';

// 1. Independent Entity: Plan de Capacitación (Cronograma Anual)
export interface PlanCapacitacion {
  id: string; // e.g. "PLAN-2025-001"
  codigo: string; // e.g. "CAP-2025-001"
  ano: number; // e.g. 2025
  mesProgramado: number; // 1 to 12
  fechaProgramada: string; // YYYY-MM-DD
  fechaProgramadaOriginal: string; // YYYY-MM-DD
  tema: string;
  objetivo: string;
  peligroGtc45Id?: string;
  codigoPeligro?: string;
  tipoPeligroGTC45: string;
  areaDirigida: string;
  modalidad: ModalidadCapacitacion;
  duracionHoras: number;
  publicoObjetivo: string[];
  temario: string[];
  normativaAplicable: string;
  requiereEvaluacionEficacia: boolean;
  criterioEficaciaMinima: number; // Porcentaje mínimo para ser EFICAZ (por defecto 80%)
  estado: EstadoPlan;
  implementosRequeridos?: string[]; // EPP, equipos y herramientas requeridos para la sesión
  empresa?: string; // Amarrado a la empresa (Taller Los Andes S.A.S.)
  
  // Rescheduling tracking
  motivoReprogramacion?: string;
  reprogramadoPor?: string;
  reprogramadoFecha?: string;

  // Logical Annulment tracking
  motivoAnulacion?: string;
  anuladoPor?: string;
  anuladoFecha?: string;

  createdAt: string;
  updatedAt: string;
}

// 2. Independent Entity: Sesión Ejecutada
export interface SesionEjecutada {
  id: string; // e.g. "SES-2025-001"
  planId: string;
  fechaEjecucion: string; // YYYY-MM-DD
  horaInicio?: string; // HH:mm
  horaFin?: string; // HH:mm
  capacitadorId: string;
  capacitadorNombre: string;
  capacitadorEntidad: string;
  capacitadorLicencia: string;
  capacitadorTipo: TipoCapacitador;
  estadoActa: EstadoActaSesion;
  
  // Reopening tracking (Only ADMINISTRADOR)
  reabiertaPor?: string;
  reabiertaMotivo?: string;
  reabiertaFecha?: string;

  // Digital signatures
  firmaCapacitador?: {
    firmante: string;
    cargo: string;
    fecha: string;
    hash: string;
  };
  firmaResponsableSST?: {
    firmante: string;
    cargo: string;
    fecha: string;
    hash: string;
  };

  observaciones?: string;
  eficaciaEvaluada: boolean;
  resultadoEficacia: ResultadoEficacia;
  accionesRefuerzo?: string;

  createdAt: string;
  updatedAt: string;
}

// 3. Independent Entity: Asistencia y Calificación individual
export interface AsistenciaCalificacion {
  id: string; // e.g. "ASIS-001-EMP-1"
  sesionId: string;
  trabajadorId: string;
  nombre: string;
  cedula: string;
  cargo: string;
  area: string;
  asistio: boolean;
  calificacion: number | null; // 0 a 100, ONLY populated/editable if asistio === true
  calificacionPrevia?: number | null;
  firmaRegistrada: boolean;
  hashFirma?: string;
  observaciones?: string;
  updatedAt?: string;
}

// 4. Independent Entity: Auditoría append-only de modificaciones de notas
export interface AuditoriaCalificacion {
  id: string; // e.g. "AUD-001"
  sesionId: string;
  trabajadorId: string;
  trabajadorNombre: string;
  valorPrevio: number | null;
  valorNuevo: number | null;
  autor: string;
  autorRol: UserRole;
  fecha: string; // ISO
  justificacion: string;
}

// 5. Independent Entity: Evidencias de Expediente (Documentos y Fotos)
export interface EvidenciaExpediente {
  id: string; // e.g. "EVI-001"
  sesionId: string;
  nombre: string;
  nombreArchivo: string;
  mimeType: string;
  tamanoBytes: number;
  url: string; // Blob URL or base64 data
  tipoEvidencia: TipoEvidencia;
  subidoPor: string;
  subidoRol: UserRole;
  subidoFecha: string; // ISO
  validaMagicBytes: boolean;
  sha256Hash?: string;
}

// Derived Metrics (Calculated Live)
export interface MetricasSesion {
  convocadosTotal: number;
  asistentesTotal: number;
  evaluadosTotal: number;
  aprobadosTotal: number;
  reprobadosTotal: number;
  promedioCalificacion: number;
  porcentajeCobertura: number; // (asistentes / convocados) * 100
  porcentajeAprobacion: number; // (aprobados / evaluados) * 100
  cumpleEficacia: boolean;
  resultadoEficacia: ResultadoEficacia;
}
