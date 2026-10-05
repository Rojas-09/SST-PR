import {
  PlanCapacitacion,
  SesionEjecutada,
  AsistenciaCalificacion,
  EvidenciaExpediente,
  AuditoriaCalificacion,
  MetricasSesion,
  ResultadoEficacia,
} from '../types/capacitaciones';
import { getCompanyDataset } from '../data/companiesData';
import { CapacitacionRecord } from '../types';

const getStorageKeys = (companyId: string) => ({
  PLANES: `sst_planes_capacitacion_${companyId}_v5`,
  SESIONES: `sst_sesiones_ejecutadas_${companyId}_v5`,
  ASISTENCIAS: `sst_asistencias_calificaciones_${companyId}_v5`,
  EVIDENCIAS: `sst_evidencias_expediente_${companyId}_v5`,
  AUDITORIAS: `sst_auditorias_calificaciones_${companyId}_v5`,
});

// Seed initial data separating the unified initialCapacitaciones into normalized independent schemas
function getInitialSeededData(companyId: string = 'taller-los-andes') {
  const companyData = getCompanyDataset(companyId);
  const planes: PlanCapacitacion[] = [];
  const sesiones: SesionEjecutada[] = [];
  const asistencias: AsistenciaCalificacion[] = [];
  const evidencias: EvidenciaExpediente[] = [];
  const auditorias: AuditoriaCalificacion[] = [];

  companyData.capacitaciones.forEach((legacy) => {
    const ano = parseInt(legacy.fechaProgramada.split('-')[0] || '2026', 10);
    const mes = parseInt(legacy.fechaProgramada.split('-')[1] || '1', 10);

    const planId = `PLAN-${legacy.id}`;
    const sesionId = `SES-${legacy.id}`;

    // Implementos específicos según la capacitación
    let defaultImplementos: string[] = ['Gafas de seguridad panorámicas con filtro UV 400'];
    if (legacy.codigo.includes('001') && companyId === 'taller-los-andes') {
      defaultImplementos = [
        'Careta fotosensible electrónica regulable DIN 9-13',
        'Guantes de vaqueta y carnaza para soldador MIG/TIG',
        'Biombo ignífugo perimetral ámbar con absorción UV/IR',
        'Gafas de seguridad panorámicas con filtro UV 400',
      ];
    } else if (legacy.codigo.includes('002') && companyId === 'taller-los-andes') {
      defaultImplementos = [
        'Guantes dieléctricos Clase 0 (1.000V) con sobreguantes',
        'Kit de Bloqueo y Etiquetado LOTO (5 candados, pinzas y tarjetas)',
        'Pértiga dieléctrica de salvamento para rescate en tensión',
        'Tapete aislante dieléctrico de piso (Capacidad 10.000V)',
      ];
    } else if (legacy.codigo.includes('003') && companyId === 'taller-los-andes') {
      defaultImplementos = [
        'Cinturón biomecánico con tirantes para manipulación de cargas',
        'Polipasto mecánico y tecle de cadena (Capacidad 1 Tonelada)',
      ];
    } else if (legacy.codigo.includes('004') && companyId === 'taller-los-andes') {
      defaultImplementos = [
        'Guantes de nitrilo para manipulación química',
        'Kit de control de derrames de hidrocarburos (20 Galones)',
        'Conos reflectivos de 70 cm y cinta de demarcación "Peligro"',
      ];
    } else if (legacy.codigo.includes('005') && companyId === 'taller-los-andes') {
      defaultImplementos = [
        'Guantes de poda y carnaza reforzada',
        'Guantes anticorte nivel F con fibra de Kevlar/Acero',
        'Careta facial de policarbonato alto impacto para desbaste',
        'Protector auditivo tipo copa de alta atenuación (NRR 27 dB)',
      ];
    } else if (legacy.codigo.includes('006') && companyId === 'taller-los-andes') {
      defaultImplementos = [
        'Fichas de Datos de Seguridad (FDS) del Sistema Globalmente Armonizado',
        'Proyector audiovisual y presentaciones técnicas interactivas',
      ];
    } else if (companyId === 'servic-crear') {
      if (legacy.codigo.includes('001')) {
        defaultImplementos = [
          'Arnés de 4 argollas para rescate en espacios confinados ANSI Z359.11',
          'Detector portátil multigás 4 gases con bomba de muestreo continuo',
          'Trípode de aluminio certificado de 2.4 m con malacate retráctil',
          'Respirador 3M silicona con cartuchos combinados para vapores de cloro',
        ];
      } else if (legacy.codigo.includes('002')) {
        defaultImplementos = [
          'Careta con pantalla de malla forestal y protector auditivo SNR 28 dB',
          'Perneras de protección anticorte Clase 1 STIHL (20 m/s)',
          'Guantes de descarne antivibración para maquinaria a batería',
          'Polainas rígidas protectoras de canilla contra impacto de piedras',
        ];
      } else if (legacy.codigo.includes('003')) {
        defaultImplementos = [
          'Monogafas químicas herméticas con ventilación indirecta ANSI Z87.1',
          'Guantes de nitrilo verde pesado de 13 pulgadas resistentes a cloro',
          'Pechera de PVC impermeable para manipulación de químicos de piscina',
          'Kit colorimétrico digital DPD para cloro residual y pH',
        ];
      } else if (legacy.codigo.includes('004')) {
        defaultImplementos = [
          'Máscara Full Face 3M Serie 6800 para plaguicidas y desinfección',
          'Traje de protección química microporoso Tipo 4/5/6 con capucha',
          'Estaciones de monitoreo y cebado de roedores con llave de seguridad',
        ];
      } else {
        defaultImplementos = [
          'Zapatos ergonómicos impermeables con suela antideslizante SRC',
          'Mopas de microfibra ultralivianas y carro escurridor ergonómico',
          'Avisos plegables "Piso Húmedo" color amarillo reflectivo',
        ];
      }
    }

    // 1. Plan entity
    const plan: PlanCapacitacion = {
      id: planId,
      codigo: legacy.codigo,
      ano,
      mesProgramado: mes,
      fechaProgramada: legacy.fechaProgramada,
      fechaProgramadaOriginal: legacy.fechaProgramada,
      tema: legacy.tema,
      objetivo: legacy.objetivo,
      peligroGtc45Id: legacy.peligroIdRelacionado,
      codigoPeligro: legacy.codigoPeligro,
      tipoPeligroGTC45: legacy.tipoPeligroGTC45,
      areaDirigida: legacy.areaAfectada,
      modalidad: legacy.modalidad,
      duracionHoras: legacy.duracionHoras,
      publicoObjetivo: legacy.publicoObjetivo || ['Personal del área'],
      temario: legacy.temario || [],
      normativaAplicable: legacy.normativaAplicable,
      requiereEvaluacionEficacia: legacy.requiereEvaluacionEficacia ?? true,
      criterioEficaciaMinima: 80,
      estado: legacy.estado as PlanCapacitacion['estado'],
      implementosRequeridos: defaultImplementos,
      empresa: companyData.company.name,
      createdAt: legacy.fechaProgramada + 'T08:00:00.000Z',
      updatedAt: legacy.fechaProgramada + 'T08:00:00.000Z',
    };
    planes.push(plan);

    // 2. Sesion entity (if executed or scheduled)
    const capacitadorId = legacy.capacitador.nombre.includes('Vega')
      ? 'cap-claudia-vega'
      : legacy.capacitador.nombre.includes('Peñaloza')
      ? 'cap-mauricio-penaloza'
      : legacy.capacitador.nombre.includes('Andrea')
      ? 'cap-andrea-morales'
      : legacy.capacitador.nombre.includes('STIHL')
      ? 'cap-stihl-colombia'
      : 'cap-carlos-mendez';

    const sesion: SesionEjecutada = {
      id: sesionId,
      planId: planId,
      fechaEjecucion: legacy.fechaEjecucion || legacy.fechaProgramada,
      horaInicio: '08:30',
      horaFin: `${8 + legacy.duracionHoras}:30`,
      capacitadorId,
      capacitadorNombre: legacy.capacitador.nombre,
      capacitadorEntidad: legacy.capacitador.entidad,
      capacitadorLicencia: legacy.capacitador.licenciaOId,
      capacitadorTipo: legacy.capacitador.entidad.includes(companyData.company.name) ? 'INTERNO' : 'EXTERNO',
      estadoActa: legacy.estado === 'EJECUTADA' ? 'FIRMADA' : 'PENDIENTE',
      firmaCapacitador:
        legacy.estado === 'EJECUTADA'
          ? {
              firmante: legacy.capacitador.nombre,
              cargo: 'Instructor Técnico SST',
              fecha: legacy.fechaEjecucion || legacy.fechaProgramada,
              hash: `SHA-CAP-${legacy.id.substring(4)}`,
            }
          : undefined,
      firmaResponsableSST:
        legacy.estado === 'EJECUTADA'
          ? {
              firmante: companyData.company.responsableSST.nombre,
              cargo: companyData.company.responsableSST.cargo,
              fecha: legacy.fechaEjecucion || legacy.fechaProgramada,
              hash: `SHA-SST-${legacy.id.substring(4)}`,
            }
          : undefined,
      observaciones: legacy.observaciones || 'Sesión desarrollada con apego al temario oficial.',
      eficaciaEvaluada: legacy.eficaciaEvaluada,
      resultadoEficacia: (legacy.resultadoEficacia as ResultadoEficacia) || 'EFICAZ',
      createdAt: legacy.fechaProgramada + 'T08:30:00.000Z',
      updatedAt: (legacy.fechaEjecucion || legacy.fechaProgramada) + 'T17:00:00.000Z',
    };
    sesiones.push(sesion);

    // 3. Asistencias individuales
    if (legacy.asistentes && legacy.asistentes.length > 0) {
      legacy.asistentes.forEach((asist) => {
        asistencias.push({
          id: `ASIS-${legacy.id}-${asist.id}`,
          sesionId: sesionId,
          trabajadorId: asist.id,
          nombre: asist.nombre,
          cedula: asist.cedula,
          cargo: asist.cargo,
          area: legacy.areaAfectada,
          asistio: asist.asistio,
          calificacion: asist.calificacion ?? null,
          firmaRegistrada: asist.firmaRegistrada,
          hashFirma: asist.firmaRegistrada ? `BIO-${asist.cedula.replace(/\D/g, '')}` : undefined,
          updatedAt: (legacy.fechaEjecucion || legacy.fechaProgramada) + 'T10:00:00.000Z',
        });
      });
    }

    // 4. Initial Evidence for executed sessions
    if (legacy.estado === 'EJECUTADA') {
      evidencias.push({
        id: `EVI-${legacy.id}-01`,
        sesionId: sesionId,
        nombre: `Registro Fotográfico de Campo - ${legacy.codigo}`,
        nombreArchivo: `Evidencia_Fotografica_${legacy.codigo}.jpg`,
        mimeType: 'image/jpeg',
        tamanoBytes: 1845000, // ~1.8 MB
        url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
        tipoEvidencia: 'FOTOGRAFIA',
        subidoPor: legacy.capacitador.nombre,
        subidoRol: 'RESPONSABLE_SST',
        subidoFecha: (legacy.fechaEjecucion || legacy.fechaProgramada) + 'T11:30:00.000Z',
        validaMagicBytes: true,
        sha256Hash: `hash-evi-${legacy.id}-01`,
      });
      evidencias.push({
        id: `EVI-${legacy.id}-02`,
        sesionId: sesionId,
        nombre: `Planilla de Firmas Físicas - ${legacy.codigo}`,
        nombreArchivo: `Planilla_Firmas_${legacy.codigo}.pdf`,
        mimeType: 'application/pdf',
        tamanoBytes: 940000, // ~940 KB
        url: '#documento-firmado-pdf',
        tipoEvidencia: 'LISTA_ASISTENCIA_FISICA',
        subidoPor: companyData.company.responsableSST.nombre,
        subidoRol: 'RESPONSABLE_SST',
        subidoFecha: (legacy.fechaEjecucion || legacy.fechaProgramada) + 'T11:45:00.000Z',
        validaMagicBytes: true,
        sha256Hash: `hash-evi-${legacy.id}-02`,
      });
    }
  });

  return { planes, sesiones, asistencias, evidencias, auditorias };
}

// Memory cache + LocalStorage synchronization
class CapacitacionesStorageService {
  private activeCompanyId: string = 'taller-los-andes';
  private planes: PlanCapacitacion[] = [];
  private sesiones: SesionEjecutada[] = [];
  private asistencias: AsistenciaCalificacion[] = [];
  private evidencias: EvidenciaExpediente[] = [];
  private auditorias: AuditoriaCalificacion[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  public setCompany(companyId: string) {
    if (this.activeCompanyId === companyId) return;
    this.activeCompanyId = companyId;
    this.init();
    this.notify();
  }

  public getCompanyId(): string {
    return this.activeCompanyId;
  }

  private init() {
    try {
      const keys = getStorageKeys(this.activeCompanyId);
      const storedPlanes = localStorage.getItem(keys.PLANES);
      const storedSesiones = localStorage.getItem(keys.SESIONES);
      const storedAsistencias = localStorage.getItem(keys.ASISTENCIAS);
      const storedEvidencias = localStorage.getItem(keys.EVIDENCIAS);
      const storedAuditorias = localStorage.getItem(keys.AUDITORIAS);

      if (storedPlanes && storedSesiones && storedAsistencias) {
        this.planes = JSON.parse(storedPlanes);
        this.sesiones = JSON.parse(storedSesiones);
        this.asistencias = JSON.parse(storedAsistencias);
        this.evidencias = storedEvidencias ? JSON.parse(storedEvidencias) : [];
        this.auditorias = storedAuditorias ? JSON.parse(storedAuditorias) : [];
      } else {
        const seeded = getInitialSeededData(this.activeCompanyId);
        this.planes = seeded.planes;
        this.sesiones = seeded.sesiones;
        this.asistencias = seeded.asistencias;
        this.evidencias = seeded.evidencias;
        this.auditorias = seeded.auditorias;
        this.persistAll();
      }
    } catch (e) {
      console.error('Error initializing capacitaciones storage, fallback to seed', e);
      const seeded = getInitialSeededData(this.activeCompanyId);
      this.planes = seeded.planes;
      this.sesiones = seeded.sesiones;
      this.asistencias = seeded.asistencias;
      this.evidencias = seeded.evidencias;
      this.auditorias = seeded.auditorias;
    }
  }

  private persistAll() {
    try {
      const keys = getStorageKeys(this.activeCompanyId);
      localStorage.setItem(keys.PLANES, JSON.stringify(this.planes));
      localStorage.setItem(keys.SESIONES, JSON.stringify(this.sesiones));
      localStorage.setItem(keys.ASISTENCIAS, JSON.stringify(this.asistencias));
      localStorage.setItem(keys.EVIDENCIAS, JSON.stringify(this.evidencias));
      localStorage.setItem(keys.AUDITORIAS, JSON.stringify(this.auditorias));
    } catch (err) {
      console.warn('LocalStorage save quota or access error:', err);
    }
    this.notify();
  }

  public subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error(e);
      }
    });
  }

  // --- Planes CRUD ---
  public getPlanes(): PlanCapacitacion[] {
    return [...this.planes];
  }

  public getPlanById(id: string): PlanCapacitacion | undefined {
    return this.planes.find((p) => p.id === id);
  }

  public createPlan(
    newPlan: Omit<PlanCapacitacion, 'id' | 'createdAt' | 'updatedAt' | 'fechaProgramadaOriginal'>,
    capacitadorInitial: { nombre: string; entidad: string; licencia: string; id: string },
    convocadosIds: string[]
  ): { plan: PlanCapacitacion; sesion: SesionEjecutada } {
    const id = `PLAN-${Date.now()}`;
    const sesionId = `SES-${Date.now()}`;

    const plan: PlanCapacitacion = {
      ...newPlan,
      id,
      fechaProgramadaOriginal: newPlan.fechaProgramada,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sesion: SesionEjecutada = {
      id: sesionId,
      planId: id,
      fechaEjecucion: newPlan.fechaProgramada,
      capacitadorId: capacitadorInitial.id,
      capacitadorNombre: capacitadorInitial.nombre,
      capacitadorEntidad: capacitadorInitial.entidad,
      capacitadorLicencia: capacitadorInitial.licencia,
      capacitadorTipo: capacitadorInitial.entidad.includes('Taller Los Andes') ? 'INTERNO' : 'EXTERNO',
      estadoActa: 'PENDIENTE',
      observaciones: 'Sesión programada en el Plan Anual.',
      eficaciaEvaluada: false,
      resultadoEficacia: 'PENDIENTE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create attendee entries
    const companyData = getCompanyDataset(this.activeCompanyId);
    const attendeeRecords: AsistenciaCalificacion[] = convocadosIds.map((empId) => {
      const emp = companyData.employees.find((e) => e.id === empId);
      return {
        id: `ASIS-${sesionId}-${empId}`,
        sesionId,
        trabajadorId: empId,
        nombre: emp?.nombre || 'Trabajador',
        cedula: emp?.cedula || '0.000.000',
        cargo: emp?.cargo || 'Operario',
        area: newPlan.areaDirigida,
        asistio: false,
        calificacion: null,
        firmaRegistrada: false,
        updatedAt: new Date().toISOString(),
      };
    });

    this.planes.push(plan);
    this.sesiones.push(sesion);
    this.asistencias.push(...attendeeRecords);
    this.persistAll();

    return { plan, sesion };
  }

  public updatePlan(updated: PlanCapacitacion) {
    this.planes = this.planes.map((p) =>
      p.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : p
    );
    this.persistAll();
  }

  /**
   * Reschedule training to a new date/month
   * Preserves fechaProgramadaOriginal, sets status to REPROGRAMADA, requires reason
   */
  public reprogramarPlan(
    planId: string,
    nuevaFecha: string,
    motivo: string,
    autor: string
  ): boolean {
    const plan = this.getPlanById(planId);
    if (!plan) return false;

    const ano = parseInt(nuevaFecha.split('-')[0], 10);
    const mes = parseInt(nuevaFecha.split('-')[1], 10);

    const updatedPlan: PlanCapacitacion = {
      ...plan,
      ano,
      mesProgramado: mes,
      fechaProgramada: nuevaFecha,
      estado: 'REPROGRAMADA',
      motivoReprogramacion: motivo,
      reprogramadoPor: autor,
      reprogramadoFecha: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update session date if session exists
    const sesion = this.getSesionByPlanId(planId);
    if (sesion && sesion.estadoActa === 'PENDIENTE') {
      this.sesiones = this.sesiones.map((s) =>
        s.id === sesion.id
          ? { ...s, fechaEjecucion: nuevaFecha, updatedAt: new Date().toISOString() }
          : s
      );
    }

    this.updatePlan(updatedPlan);
    return true;
  }

  /**
   * Logical Annulment of a plan
   */
  public anularPlan(planId: string, motivo: string, autor: string): boolean {
    const plan = this.getPlanById(planId);
    if (!plan) return false;

    const updatedPlan: PlanCapacitacion = {
      ...plan,
      estado: 'ANULADA',
      motivoAnulacion: motivo,
      anuladoPor: autor,
      anuladoFecha: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.updatePlan(updatedPlan);
    return true;
  }

  /**
   * Physical deletion: ONLY permitted if status is PROGRAMADA and no attendances or evidence exist!
   */
  public deletePlanPhysical(planId: string): { success: boolean; error?: string } {
    const plan = this.getPlanById(planId);
    if (!plan) return { success: false, error: 'Plan no encontrado.' };

    if (plan.estado !== 'PROGRAMADA') {
      return {
        success: false,
        error: `No se puede eliminar físicamente un registro en estado "${plan.estado}". Se debe realizar Anulación Lógica.`,
      };
    }

    const sesion = this.getSesionByPlanId(planId);
    if (sesion) {
      const asistieron = this.getAsistenciasBySesionId(sesion.id).some((a) => a.asistio);
      if (asistieron) {
        return {
          success: false,
          error: 'No se puede eliminar físicamente porque ya cuenta con asistencias registradas. Utilice Anulación Lógica.',
        };
      }

      const tieneEvidencias = this.getEvidenciasBySesionId(sesion.id).length > 0;
      if (tieneEvidencias) {
        return {
          success: false,
          error: 'No se puede eliminar físicamente porque contiene evidencias adjuntas en el expediente. Utilice Anulación Lógica.',
        };
      }

      // Safe to physically purge session and attendance stubs
      this.asistencias = this.asistencias.filter((a) => a.sesionId !== sesion.id);
      this.sesiones = this.sesiones.filter((s) => s.id !== sesion.id);
    }

    this.planes = this.planes.filter((p) => p.id !== planId);
    this.persistAll();
    return { success: true };
  }

  // --- Sesiones CRUD ---
  public getSesionByPlanId(planId: string): SesionEjecutada | undefined {
    return this.sesiones.find((s) => s.planId === planId);
  }

  public getSesionById(id: string): SesionEjecutada | undefined {
    return this.sesiones.find((s) => s.id === id);
  }

  public updateSesion(updated: SesionEjecutada) {
    this.sesiones = this.sesiones.map((s) =>
      s.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : s
    );
    this.persistAll();
  }

  /**
   * Reopen a locked/signed acta (Exclusive to ADMINISTRADOR with justification)
   */
  public reabrirSesion(sesionId: string, justificacion: string, autor: string): boolean {
    const sesion = this.getSesionById(sesionId);
    if (!sesion) return false;

    const updated: SesionEjecutada = {
      ...sesion,
      estadoActa: 'REABIERTA',
      reabiertaPor: autor,
      reabiertaMotivo: justificacion,
      reabiertaFecha: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Also register audit log
    this.auditorias.push({
      id: `AUD-REOPEN-${Date.now()}`,
      sesionId,
      trabajadorId: 'SISTEMA_ACTA',
      trabajadorNombre: 'Acta Completa',
      valorPrevio: null,
      valorNuevo: null,
      autor,
      autorRol: 'ADMINISTRADOR',
      fecha: new Date().toISOString(),
      justificacion: `Reapertura formal de acta: ${justificacion}`,
    });

    this.updateSesion(updated);
    return true;
  }

  /**
   * Mark session as executed and update plan state
   */
  public executeSesion(
    sesionId: string,
    observaciones: string,
    criterioEficaciaMinima: number = 80
  ): { success: boolean; error?: string } {
    const sesion = this.getSesionById(sesionId);
    if (!sesion) return { success: false, error: 'Sesión no encontrada.' };

    const plan = this.getPlanById(sesion.planId);
    if (!plan) return { success: false, error: 'Plan asociado no encontrado.' };

    // Validate requirement 6: Min 1 graphic evidence for TALLER_PUESTO_TRABAJO and VIRTUAL_ARL
    if (
      plan.modalidad === 'TALLER_PUESTO_TRABAJO' ||
      plan.modalidad === 'VIRTUAL_ARL'
    ) {
      const fotos = this.getEvidenciasBySesionId(sesionId).filter(
        (e) => e.tipoEvidencia === 'FOTOGRAFIA'
      );
      if (fotos.length === 0) {
        return {
          success: false,
          error: `Para la modalidad "${plan.modalidad.replace(/_/g, ' ')}" es obligatorio adjuntar al menos una evidencia fotográfica antes de marcar la capacitación como EJECUTADA.`,
        };
      }
    }

    // Check attendance
    const asistencias = this.getAsistenciasBySesionId(sesionId);
    const asistieron = asistencias.filter((a) => a.asistio);
    if (asistieron.length === 0) {
      return {
        success: false,
        error: 'Debe registrar la asistencia de al menos un participante para ejecutar la sesión.',
      };
    }

    const metricas = this.calcularMetricas(sesionId, criterioEficaciaMinima);

    const updatedSesion: SesionEjecutada = {
      ...sesion,
      estadoActa: 'PENDIENTE', // Ready for digital signing
      observaciones,
      eficaciaEvaluada: true,
      resultadoEficacia: metricas.resultadoEficacia,
      updatedAt: new Date().toISOString(),
    };

    const updatedPlan: PlanCapacitacion = {
      ...plan,
      estado: 'EJECUTADA',
      updatedAt: new Date().toISOString(),
    };

    this.updateSesion(updatedSesion);
    this.updatePlan(updatedPlan);
    return { success: true };
  }

  // --- Asistencia y Calificaciones ---
  public getAsistenciasBySesionId(sesionId: string): AsistenciaCalificacion[] {
    return this.asistencias.filter((a) => a.sesionId === sesionId);
  }

  /**
   * Refactored attendance toggle: presence (asistio) is separate from grade (calificacion).
   * Turning asistio to false resets calificacion to null.
   * Turning asistio to true keeps calificacion null until instructor enters it.
   */
  public toggleAsistencia(asistenciaId: string): AsistenciaCalificacion | undefined {
    const target = this.asistencias.find((a) => a.id === asistenciaId);
    if (!target) return undefined;

    const nextAsistio = !target.asistio;
    const updated: AsistenciaCalificacion = {
      ...target,
      asistio: nextAsistio,
      firmaRegistrada: nextAsistio,
      calificacion: nextAsistio ? target.calificacion : null, // Separate presence from grade!
      updatedAt: new Date().toISOString(),
    };

    this.asistencias = this.asistencias.map((a) => (a.id === asistenciaId ? updated : a));
    this.persistAll();
    return updated;
  }

  /**
   * Update individual grade with audit logging
   */
  public updateCalificacion(
    asistenciaId: string,
    nuevaNota: number | null,
    autor: string,
    autorRol: PlanCapacitacion['estado'] extends string ? any : never,
    justificacion?: string
  ): { success: boolean; asistencia?: AsistenciaCalificacion; error?: string } {
    const target = this.asistencias.find((a) => a.id === asistenciaId);
    if (!target) return { success: false, error: 'Registro no encontrado' };

    if (!target.asistio && nuevaNota !== null) {
      return {
        success: false,
        error: 'No se puede calificar a un trabajador que no ha registrado asistencia.',
      };
    }

    if (nuevaNota !== null && (nuevaNota < 0 || nuevaNota > 100)) {
      return { success: false, error: 'La calificación debe estar comprendida entre 0 y 100 puntos.' };
    }

    const valorPrevio = target.calificacion;
    if (valorPrevio === nuevaNota) {
      return { success: true, asistencia: target };
    }

    const updated: AsistenciaCalificacion = {
      ...target,
      calificacionPrevia: valorPrevio,
      calificacion: nuevaNota,
      updatedAt: new Date().toISOString(),
    };

    // Register append-only audit record
    const auditRecord: AuditoriaCalificacion = {
      id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sesionId: target.sesionId,
      trabajadorId: target.trabajadorId,
      trabajadorNombre: target.nombre,
      valorPrevio,
      valorNuevo: nuevaNota,
      autor,
      autorRol,
      fecha: new Date().toISOString(),
      justificacion: justificacion || (valorPrevio === null ? 'Ingreso inicial de calificación' : 'Ajuste de calificación'),
    };

    this.auditorias.push(auditRecord);
    this.asistencias = this.asistencias.map((a) => (a.id === asistenciaId ? updated : a));
    this.persistAll();

    return { success: true, asistencia: updated };
  }

  // --- Auditoría ---
  public getAuditoriasBySesionId(sesionId: string): AuditoriaCalificacion[] {
    return this.auditorias
      .filter((a) => a.sesionId === sesionId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  // --- Evidencias ---
  public getEvidenciasBySesionId(sesionId: string): EvidenciaExpediente[] {
    return this.evidencias.filter((e) => e.sesionId === sesionId);
  }

  public addEvidencia(evidencia: EvidenciaExpediente): { success: boolean; error?: string } {
    // Check session accumulated size limit
    const existing = this.getEvidenciasBySesionId(evidencia.sesionId);
    const totalBytes = existing.reduce((sum, e) => sum + e.tamanoBytes, 0) + evidencia.tamanoBytes;
    const maxAccumulated = 50 * 1024 * 1024; // 50 MB

    if (totalBytes > maxAccumulated) {
      return {
        success: false,
        error: `Se supera el límite acumulado de 50 MB para esta sesión. (Total acumulado resultante: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB)`,
      };
    }

    this.evidencias.push(evidencia);
    this.persistAll();
    return { success: true };
  }

  public deleteEvidencia(evidenciaId: string): boolean {
    this.evidencias = this.evidencias.filter((e) => e.id !== evidenciaId);
    this.persistAll();
    return true;
  }

  // --- Live Metrics Calculation ---
  public calcularMetricas(sesionId: string, criterioEficaciaMinima: number = 80): MetricasSesion {
    const list = this.getAsistenciasBySesionId(sesionId);
    const convocadosTotal = list.length;
    const asistentes = list.filter((a) => a.asistio);
    const asistentesTotal = asistentes.length;

    const evaluados = asistentes.filter((a) => a.calificacion !== null && a.calificacion !== undefined);
    const evaluadosTotal = evaluados.length;

    // Aprobación: calificación >= 70
    const aprobados = evaluados.filter((a) => (a.calificacion ?? 0) >= 70);
    const aprobadosTotal = aprobados.length;
    const reprobadosTotal = evaluadosTotal - aprobadosTotal;

    const sumaCalificaciones = evaluados.reduce((sum, a) => sum + (a.calificacion ?? 0), 0);
    const promedioCalificacion = evaluadosTotal > 0 ? Math.round(sumaCalificaciones / evaluadosTotal) : 0;

    const porcentajeCobertura = convocadosTotal > 0 ? Math.round((asistentesTotal / convocadosTotal) * 100) : 0;
    const porcentajeAprobacion = evaluadosTotal > 0 ? Math.round((aprobadosTotal / evaluadosTotal) * 100) : 0;

    const cumpleEficacia = porcentajeAprobacion >= criterioEficaciaMinima;
    const resultadoEficacia: ResultadoEficacia =
      evaluadosTotal === 0
        ? 'PENDIENTE'
        : cumpleEficacia
        ? 'EFICAZ'
        : 'REQUIERE_REFUERZO';

    return {
      convocadosTotal,
      asistentesTotal,
      evaluadosTotal,
      aprobadosTotal,
      reprobadosTotal,
      promedioCalificacion,
      porcentajeCobertura,
      porcentajeAprobacion,
      cumpleEficacia,
      resultadoEficacia,
    };
  }

  // Digital Signatures
  public firmarActa(
    sesionId: string,
    role: 'CAPACITADOR' | 'RESPONSABLE',
    firmanteNombre: string,
    firmanteCargo: string
  ): boolean {
    const sesion = this.getSesionById(sesionId);
    if (!sesion) return false;

    const hash = `SIG-${role}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const firmaData = {
      firmante: firmanteNombre,
      cargo: firmanteCargo,
      fecha: new Date().toISOString().split('T')[0],
      hash,
    };

    let nextEstado = sesion.estadoActa;
    if (role === 'CAPACITADOR') {
      sesion.firmaCapacitador = firmaData;
      if (sesion.firmaResponsableSST) nextEstado = 'CONVALIDADA';
      else nextEstado = 'FIRMADA';
    } else {
      sesion.firmaResponsableSST = firmaData;
      if (sesion.firmaCapacitador) nextEstado = 'CONVALIDADA';
      else nextEstado = 'FIRMADA';
    }

    const updatedSesion: SesionEjecutada = {
      ...sesion,
      estadoActa: nextEstado,
      updatedAt: new Date().toISOString(),
    };

    this.updateSesion(updatedSesion);
    return true;
  }

  // --- Projection to Legacy CapacitacionRecord for backward compatibility with Dashboard, Calendars, etc. ---
  public getUnifiedCapacitacionRecords(): CapacitacionRecord[] {
    return this.planes.map((plan) => {
      const sesion = this.getSesionByPlanId(plan.id);
      const asistencias = sesion ? this.getAsistenciasBySesionId(sesion.id) : [];
      const metricas = sesion ? this.calcularMetricas(sesion.id, plan.criterioEficaciaMinima) : {
        convocadosTotal: asistencias.length,
        asistentesTotal: 0,
        porcentajeCobertura: 0,
        porcentajeAprobacion: 0,
        resultadoEficacia: 'PENDIENTE' as ResultadoEficacia,
      };

      return {
        id: plan.codigo, // Keep legacy ID format like "CAP-2025-001"
        codigo: plan.codigo,
        tema: plan.tema,
        objetivo: plan.objetivo,
        peligroIdRelacionado: plan.peligroGtc45Id,
        codigoPeligro: plan.codigoPeligro,
        tipoPeligroGTC45: plan.tipoPeligroGTC45,
        areaAfectada: plan.areaDirigida,
        modalidad: plan.modalidad,
        duracionHoras: plan.duracionHoras,
        fechaProgramada: plan.fechaProgramada,
        fechaEjecucion: sesion?.fechaEjecucion,
        estado: plan.estado === 'ANULADA' ? ('REPROGRAMADA' as any) : plan.estado,
        capacitador: {
          nombre: sesion?.capacitadorNombre || 'Sin asignar',
          entidad: sesion?.capacitadorEntidad || 'Taller Los Andes S.A.S.',
          licenciaOId: sesion?.capacitadorLicencia || 'Lic. 18492-2018',
        },
        publicoObjetivo: plan.publicoObjetivo,
        convocadosCount: metricas.convocadosTotal,
        asistentesCount: metricas.asistentesTotal,
        porcentajeCobertura: metricas.porcentajeCobertura,
        porcentajeAprobacion: metricas.porcentajeAprobacion,
        asistentes: asistencias.map((a) => ({
          id: a.trabajadorId,
          nombre: a.nombre,
          cedula: a.cedula,
          cargo: a.cargo,
          asistio: a.asistio,
          calificacion: a.calificacion ?? undefined,
          firmaRegistrada: a.firmaRegistrada,
        })),
        temario: plan.temario,
        normativaAplicable: plan.normativaAplicable,
        observaciones: sesion?.observaciones,
        requiereEvaluacionEficacia: plan.requiereEvaluacionEficacia,
        eficaciaEvaluada: sesion?.eficaciaEvaluada ?? false,
        resultadoEficacia: (sesion?.resultadoEficacia as any) || 'EFICAZ',
      };
    });
  }

  public resetToSeed() {
    const keys = getStorageKeys(this.activeCompanyId);
    localStorage.removeItem(keys.PLANES);
    localStorage.removeItem(keys.SESIONES);
    localStorage.removeItem(keys.ASISTENCIAS);
    localStorage.removeItem(keys.EVIDENCIAS);
    localStorage.removeItem(keys.AUDITORIAS);
    this.init();
    this.notify();
  }
}

export const capacitacionesStorage = new CapacitacionesStorageService();
