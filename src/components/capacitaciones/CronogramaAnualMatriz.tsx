import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Filter,
  Search,
  PlusCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trash2,
  Ban,
  ArrowRight,
  Eye,
  ShieldAlert,
  GraduationCap,
  Users,
  Building2,
  Lock,
  Shield,
  Wrench,
  Check,
  Tag,
} from 'lucide-react';
import {
  PlanCapacitacion,
  EstadoPlan,
  ModalidadCapacitacion,
  SesionEjecutada,
} from '../../types/capacitaciones';
import { HazardRecord, CompanyInfo } from '../../types';
import { useAuthRole } from '../../context/AuthRoleContext';
import { capacitacionesStorage } from '../../services/capacitacionesStorage';
import { workshopEmployees } from '../../data/initialData';
import { CATALOGO_IMPLEMENTOS, ImplementoCapacitacion } from '../../data/implementosCatalog';

export const AVAILABLE_TRAINERS = [
  {
    id: 'cap-carlos-mendez',
    nombre: 'Ing. Carlos Méndez',
    entidad: 'Taller Los Andes S.A.S.',
    cargo: 'Responsable SG-SST',
    licencia: 'Lic. 18492-2018 (DDS)',
    tipo: 'INTERNO' as const,
  },
  {
    id: 'cap-andrea-morales',
    nombre: 'Ing. Andrea Morales Peña',
    entidad: 'SERVIC CREAR S.A.S.',
    cargo: 'Líder SG-SST',
    licencia: 'Lic. 24890-SST Tolima',
    tipo: 'INTERNO' as const,
  },
  {
    id: 'cap-stihl-colombia',
    nombre: 'Instructor Técnico STIHL Colombia',
    entidad: 'STIHL Colombia • Soporte Técnico Especializado',
    cargo: 'Especialista en Maquinaria a Batería y Poda',
    licencia: 'Cert. STIHL-COL-4412',
    tipo: 'EXTERNO' as const,
  },
  {
    id: 'cap-claudia-vega',
    nombre: 'Ft. Claudia Marcela Vega',
    entidad: 'Positiva ARL • Fisioterapia & Ergonomía',
    cargo: 'Especialista en Ergonomía Ocupacional',
    licencia: 'Reg. Nacional Fisioterapia 39481',
    tipo: 'EXTERNO' as const,
  },
  {
    id: 'cap-mauricio-penaloza',
    nombre: 'Ing. Mauricio Peñaloza',
    entidad: 'Positiva ARL • Consultoría Técnica',
    cargo: 'Especialista en Riesgo Eléctrico RETIE',
    licencia: 'Mat. Profesional CN-84910',
    tipo: 'EXTERNO' as const,
  },
  {
    id: 'cap-norton',
    nombre: 'Téc. Instructor Norton / Abrasivos de Colombia',
    entidad: 'Abrasivos de Colombia S.A.S.',
    cargo: 'Asesor Técnico Certificado de Fabricante',
    licencia: 'Cert. TC-99214-COL',
    tipo: 'EXTERNO' as const,
  },
  {
    id: 'cap-sura-asesor',
    nombre: 'Asesor Técnico Especializado ARL SURA',
    entidad: 'Seguros SURA ARL',
    cargo: 'Consultor de Riesgos Laborales Clase IV',
    licencia: 'Lic. SURA-8841-BOG',
    tipo: 'EXTERNO' as const,
  },
  {
    id: 'cap-elena-santamaria',
    nombre: 'Dra. Elena Santamaría',
    entidad: 'Ministerio del Trabajo (Mintrabajo)',
    cargo: 'Inspectora Laboral / Auditora SST',
    licencia: 'Credencial MT-09412',
    tipo: 'EXTERNO' as const,
  },
  {
    id: 'cap-rodrigo-gomez',
    nombre: 'Ing. Rodrigo Gómez V.',
    entidad: 'Taller Los Andes S.A.S.',
    cargo: 'Gerente General / Representante Legal',
    licencia: 'Mat. Copnia 25202-0984',
    tipo: 'INTERNO' as const,
  },
];

interface CronogramaAnualMatrizProps {
  planes: PlanCapacitacion[];
  hazards: HazardRecord[];
  company: CompanyInfo;
  onSelectPlan: (planId: string) => void;
  onRefreshData: () => void;
}

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function CronogramaAnualMatriz({
  planes,
  hazards,
  company,
  onSelectPlan,
  onRefreshData,
}: CronogramaAnualMatrizProps) {
  const { currentUser, canCreatePlan, canReschedulePlan, canAnnulPlan, canDeletePhysicalPlan } =
    useAuthRole();

  // Filters
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [selectedEstado, setSelectedEstado] = useState<string>('ALL');
  const [selectedPeligro, setSelectedPeligro] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [reprogramarPlanTarget, setReprogramarPlanTarget] = useState<PlanCapacitacion | null>(null);
  const [anularPlanTarget, setAnularPlanTarget] = useState<PlanCapacitacion | null>(null);

  // Reprogramming form
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [motivoReprogramacion, setMotivoReprogramacion] = useState('');
  const [reprogramarError, setReprogramarError] = useState('');

  // Annulment form
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [anulacionError, setAnulacionError] = useState('');

  // New Plan form
  const [newTema, setNewTema] = useState('');
  const [newObjetivo, setNewObjetivo] = useState('');
  const [newPeligroId, setNewPeligroId] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newModalidad, setNewModalidad] = useState<ModalidadCapacitacion>('PRESENCIAL_TEORICO_PRACTICO');
  const [newDuracionHoras, setNewDuracionHoras] = useState(2);
  const [newFecha, setNewFecha] = useState('2026-04-15');
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('cap-carlos-mendez');

  // Implementos selection state
  const [selectedImplementos, setSelectedImplementos] = useState<string[]>([
    'Gafas de seguridad panorámicas con filtro UV 400',
  ]);
  const [implementoFilterText, setImplementoFilterText] = useState('');
  const [selectedImplementoCategory, setSelectedImplementoCategory] = useState<string>('TODOS');

  const [formError, setFormError] = useState('');
  const [formWarning, setFormWarning] = useState('');

  // Filter implementos list based on search and category
  const filteredImplementosList = useMemo(() => {
    return CATALOGO_IMPLEMENTOS.filter((item) => {
      const matchCat =
        selectedImplementoCategory === 'TODOS' || item.categoria === selectedImplementoCategory;
      const matchSearch =
        !implementoFilterText.trim() ||
        item.nombre.toLowerCase().includes(implementoFilterText.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(implementoFilterText.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [implementoFilterText, selectedImplementoCategory]);

  const toggleImplemento = (nombre: string) => {
    setSelectedImplementos((prev) =>
      prev.includes(nombre) ? prev.filter((i) => i !== nombre) : [...prev, nombre]
    );
  };

  // Filter options
  const areasDisponibles = useMemo(() => {
    const set = new Set(planes.map((p) => p.areaDirigida));
    return Array.from(set);
  }, [planes]);

  // Filtered planes
  const filteredPlanes = useMemo(() => {
    return planes.filter((plan) => {
      if (plan.ano !== selectedYear) return false;
      if (selectedArea !== 'ALL' && plan.areaDirigida !== selectedArea) return false;
      if (selectedEstado !== 'ALL' && plan.estado !== selectedEstado) return false;
      if (selectedPeligro !== 'ALL' && plan.peligroGtc45Id !== selectedPeligro) return false;
      if (
        searchQuery &&
        !plan.tema.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !plan.codigo.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [planes, selectedYear, selectedArea, selectedEstado, selectedPeligro, searchQuery]);

  // Validation: Check trainer or area overlap
  const checkOverlap = (date: string, trainerId: string, area: string, excludePlanId?: string) => {
    const existing = planes.filter((p) => p.id !== excludePlanId && p.fechaProgramada === date && p.estado !== 'ANULADA');
    if (existing.length === 0) return null;

    const areaConflict = existing.find((p) => p.areaDirigida.toLowerCase() === area.toLowerCase());
    if (areaConflict) {
      return `Advertencia: Ya existe una capacitación programada en "${area}" para el ${date} (${areaConflict.codigo} - ${areaConflict.tema}).`;
    }

    return null;
  };

  // Submit new plan
  const handleCreatePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormWarning('');

    if (!newTema.trim() || !newObjetivo.trim() || !newArea.trim()) {
      setFormError('Por favor complete tema, objetivo y área.');
      return;
    }

    // Trainer lookup
    const trainerObj =
      AVAILABLE_TRAINERS.find((t) => t.id === selectedTrainerId) || AVAILABLE_TRAINERS[0];

    // Overlap validation
    const overlapMsg = checkOverlap(newFecha, trainerObj.id, newArea);
    if (overlapMsg) {
      setFormWarning(overlapMsg);
    }

    // Associated hazard validation
    const associatedHazard = hazards.find((h) => h.id === newPeligroId);
    let codigoPeligro: string | undefined = undefined;
    let tipoPeligroGTC45 = 'Peligro General SST';

    if (associatedHazard) {
      codigoPeligro = associatedHazard.code;
      tipoPeligroGTC45 = `${associatedHazard.tipoPeligroGeneral} (${associatedHazard.factorEspecifico})`;
    }

    const nextNumber = planes.length + 1;
    const codigo = `CAP-${selectedYear}-00${nextNumber}`;
    const mes = parseInt(newFecha.split('-')[1], 10);

    capacitacionesStorage.createPlan(
      {
        codigo,
        ano: selectedYear,
        mesProgramado: mes,
        fechaProgramada: newFecha,
        tema: newTema.trim(),
        objetivo: newObjetivo.trim(),
        peligroGtc45Id: newPeligroId || undefined,
        codigoPeligro,
        tipoPeligroGTC45,
        areaDirigida: newArea,
        modalidad: newModalidad,
        duracionHoras: Number(newDuracionHoras),
        publicoObjetivo: [newArea, 'Personal técnico'],
        temario: ['Introducción y normativa', 'Procedimiento de control operacional', 'Evaluación de eficacia'],
        normativaAplicable: 'Decreto 1072/2015, Res. 0312/2019 Est. 2.2.1',
        requiereEvaluacionEficacia: true,
        criterioEficaciaMinima: 80,
        estado: 'PROGRAMADA',
        implementosRequeridos: selectedImplementos,
        empresa: company.name,
      },
      {
        id: trainerObj.id,
        nombre: trainerObj.nombre,
        entidad: trainerObj.entidad,
        licencia: trainerObj.licencia,
      },
      workshopEmployees.map((e) => e.id)
    );

    setIsNewPlanModalOpen(false);
    onRefreshData();
  };

  // Submit rescheduling
  const handleReprogramarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReprogramarError('');

    if (!reprogramarPlanTarget) return;
    if (!nuevaFecha) {
      setReprogramarError('Debe seleccionar una nueva fecha.');
      return;
    }
    if (motivoReprogramacion.trim().length < 8) {
      setReprogramarError('El motivo de reprogramación es obligatorio (mínimo 8 caracteres).');
      return;
    }

    // Check overlap
    const overlap = checkOverlap(nuevaFecha, '', reprogramarPlanTarget.areaDirigida, reprogramarPlanTarget.id);
    if (overlap) {
      // Allow proceeding with warning or error
    }

    capacitacionesStorage.reprogramarPlan(
      reprogramarPlanTarget.id,
      nuevaFecha,
      motivoReprogramacion.trim(),
      currentUser.nombre
    );

    setReprogramarPlanTarget(null);
    setNuevaFecha('');
    setMotivoReprogramacion('');
    onRefreshData();
  };

  // Submit deletion or logical annulment
  const handleAnularSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAnulacionError('');

    if (!anularPlanTarget) return;

    if (motivoAnulacion.trim().length < 8) {
      setAnulacionError('El motivo de anulación es obligatorio (mínimo 8 caracteres para trazabilidad legal).');
      return;
    }

    capacitacionesStorage.anularPlan(anularPlanTarget.id, motivoAnulacion.trim(), currentUser.nombre);

    setAnularPlanTarget(null);
    setMotivoAnulacion('');
    onRefreshData();
  };

  const handlePhysicalDelete = (plan: PlanCapacitacion) => {
    const result = capacitacionesStorage.deletePlanPhysical(plan.id);
    if (!result.success) {
      alert(result.error);
    } else {
      onRefreshData();
    }
  };

  return (
    <div className="space-y-4 font-sans text-[13px]">
      {/* Top Filter and Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Cronograma Anual de Capacitaciones ({selectedYear})
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {filteredPlanes.length} en cronograma
            </span>
          </div>

          <div className="flex items-center gap-2">
            {canCreatePlan() && (
              <button
                type="button"
                onClick={() => setIsNewPlanModalOpen(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Programar Capacitación</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
          {/* Year selector */}
          <div>
            <label className="block text-[10.5px] font-bold text-slate-500 uppercase mb-1">Año</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
            >
              <option value={2026}>2026 (Vigencia Actual)</option>
              <option value={2027}>2027 (Proyecciones Lejanas)</option>
              <option value={2025}>2025 (Histórico)</option>
            </select>
          </div>

          {/* Area */}
          <div>
            <label className="block text-[10.5px] font-bold text-slate-500 uppercase mb-1">Área / Proceso</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
            >
              <option value="ALL">Todas las áreas</option>
              {areasDisponibles.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-[10.5px] font-bold text-slate-500 uppercase mb-1">Estado Legal</label>
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
            >
              <option value="ALL">Todos los estados</option>
              <option value="PROGRAMADA">Programada</option>
              <option value="REPROGRAMADA">Reprogramada</option>
              <option value="EJECUTADA">Ejecutada</option>
              <option value="ANULADA">Anulada (Lógica)</option>
            </select>
          </div>

          {/* Peligro GTC 45 */}
          <div>
            <label className="block text-[10.5px] font-bold text-slate-500 uppercase mb-1">Peligro GTC 45</label>
            <select
              value={selectedPeligro}
              onChange={(e) => setSelectedPeligro(e.target.value)}
              className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
            >
              <option value="ALL">Todos los peligros</option>
              {hazards.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.code} - {h.factorEspecifico}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[10.5px] font-bold text-slate-500 uppercase mb-1">Buscar</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tema o código..."
                className="w-full text-xs py-1.5 pl-7 pr-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>
          </div>
        </div>
      </div>

      {/* 12-Month Matrix Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {MONTH_NAMES.map((monthName, idx) => {
          const monthNum = idx + 1;
          const monthPlanes = filteredPlanes.filter((p) => p.mesProgramado === monthNum);

          return (
            <div
              key={monthName}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col min-h-[180px]"
            >
              {/* Month Header */}
              <div className="px-3.5 py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
                <span className="font-black text-xs sm:text-sm text-slate-800 uppercase tracking-wider">
                  {monthName}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    monthPlanes.length > 0 ? 'bg-blue-100 text-blue-800' : 'text-slate-400'
                  }`}
                >
                  {monthPlanes.length} {monthPlanes.length === 1 ? 'actividad' : 'actividades'}
                </span>
              </div>

              {/* Month Cards */}
              <div className="p-2.5 flex-1 space-y-2">
                {monthPlanes.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs sm:text-sm italic py-6">
                    Sin capacitaciones
                  </div>
                ) : (
                  monthPlanes.map((plan) => {
                    const isEjecutada = plan.estado === 'EJECUTADA';
                    const isReprogramada = plan.estado === 'REPROGRAMADA';
                    const isAnulada = plan.estado === 'ANULADA';

                    return (
                      <div
                        key={plan.id}
                        className={`p-3 rounded-xl border transition-all text-xs sm:text-sm space-y-2 ${
                          isAnulada
                            ? 'bg-slate-50 border-slate-200 opacity-60'
                            : isEjecutada
                            ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                            : isReprogramada
                            ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                            : 'bg-white border-slate-200 hover:border-blue-400 shadow-2xs'
                        }`}
                      >
                        {/* Status badge and code */}
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className="font-mono font-black text-xs text-blue-700">
                            {plan.codigo}
                          </span>
                          {isEjecutada ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              EJECUTADA
                            </span>
                          ) : isReprogramada ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                              REPROGRAMADA
                            </span>
                          ) : isAnulada ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                              <Ban className="w-3.5 h-3.5 text-red-600" />
                              ANULADA
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <Clock className="w-3.5 h-3.5 text-blue-500" />
                              PROGRAMADA
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4
                          className={`font-bold text-xs sm:text-sm leading-snug line-clamp-2 ${
                            isAnulada ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {plan.tema}
                        </h4>

                        {/* Area & Hazard */}
                        <div className="text-xs text-slate-500 line-clamp-1 font-medium">
                          {plan.areaDirigida}
                        </div>

                        {/* Date info with original tracking */}
                        <div className="text-xs font-mono flex items-center justify-between text-slate-600 pt-1 border-t border-slate-100">
                          <span>{plan.fechaProgramada}</span>
                          {isReprogramada && plan.fechaProgramadaOriginal && (
                            <span className="text-xs text-amber-700 font-bold" title={`Fecha original: ${plan.fechaProgramadaOriginal}`}>
                              (Orig: {plan.fechaProgramadaOriginal})
                            </span>
                          )}
                        </div>

                        {/* Card Action Buttons */}
                        <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => onSelectPlan(plan.id)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Gestionar sesión, calificaciones y acta"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Sesión</span>
                          </button>

                          {/* Reprogramar Button (Only if not executed or annulled) */}
                          {!isEjecutada && !isAnulada && canReschedulePlan() && (
                            <button
                              type="button"
                              onClick={() => {
                                setReprogramarPlanTarget(plan);
                                setNuevaFecha(plan.fechaProgramada);
                              }}
                              className="p-1 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded cursor-pointer"
                              title="Reprogramar a nueva fecha"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Deletion / Annulment Button */}
                          {!isEjecutada && !isAnulada && canAnnulPlan() && (
                            <button
                              type="button"
                              onClick={() => {
                                // Rule: if PROGRAMADA and no attendances, can physically delete or logically annul
                                const sesion = capacitacionesStorage.getSesionByPlanId(plan.id);
                                const hasAttendances =
                                  sesion &&
                                  capacitacionesStorage
                                    .getAsistenciasBySesionId(sesion.id)
                                    .some((a) => a.asistio);
                                const hasEvidences =
                                  sesion &&
                                  capacitacionesStorage.getEvidenciasBySesionId(sesion.id).length > 0;

                                if (plan.estado === 'PROGRAMADA' && !hasAttendances && !hasEvidences) {
                                  if (
                                    confirm(
                                      `¿Desea eliminar físicamente el plan "${plan.codigo}"? Como no tiene asistencias ni evidencias, se permite purga física.`
                                    )
                                  ) {
                                    handlePhysicalDelete(plan);
                                  }
                                } else {
                                  // Must logically annul!
                                  setAnularPlanTarget(plan);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                              title="Anular o eliminar actividad"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Reprogramar Capacitación */}
      {reprogramarPlanTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 bg-amber-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-300" />
                <h3 className="font-bold text-sm">
                  Reprogramar Capacitación • {reprogramarPlanTarget.codigo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReprogramarPlanTarget(null)}
                className="text-amber-200 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleReprogramarSubmit} className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-600">
                Al reprogramar se conservará la <strong>fecha programada original</strong> (
                {reprogramarPlanTarget.fechaProgramadaOriginal || reprogramarPlanTarget.fechaProgramada})
                para fines de auditoría del SG-SST.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nueva Fecha Programada *</label>
                <input
                  type="date"
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-600 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Motivo Justificado de Reprogramación *
                </label>
                <textarea
                  rows={3}
                  value={motivoReprogramacion}
                  onChange={(e) => setMotivoReprogramacion(e.target.value)}
                  placeholder="Ej: Reprogramada por parada imprevista de planta y mantenimiento mayor de fosa."
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-600 text-xs"
                />
              </div>

              {reprogramarError && (
                <p className="text-red-600 font-semibold text-xs">{reprogramarError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setReprogramarPlanTarget(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Confirmar Reprogramación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Anulación Lógica */}
      {anularPlanTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 bg-red-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-300" />
                <h3 className="font-bold text-sm">
                  Anulación Lógica de Capacitación • {anularPlanTarget.codigo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAnularPlanTarget(null)}
                className="text-red-200 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAnularSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900">
                <p className="leading-relaxed">
                  Por directriz del SG-SST (Decreto 1072/2015), los registros que contengan historial
                  no pueden borrarse físicamente. Se ejecutará una <strong>Anulación Lógica</strong>{' '}
                  registrando el motivo obligatorio para la auditoría de Mintrabajo.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Motivo Formal de Anulación *
                </label>
                <textarea
                  rows={3}
                  value={motivoAnulacion}
                  onChange={(e) => setMotivoAnulacion(e.target.value)}
                  placeholder="Ej: Cancelada por cambio tecnológico en el proceso de soldadura que eliminó el uso del equipo anterior."
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-red-600 text-xs"
                />
              </div>

              {anulacionError && (
                <p className="text-red-600 font-semibold text-xs">{anulacionError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAnularPlanTarget(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Registrar Anulación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nueva Capacitación en el Plan */}
      {isNewPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Programar Nueva Capacitación en el SG-SST</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewPlanModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlanSubmit} className="p-6 sm:p-7 overflow-y-auto space-y-5 text-sm">
              {/* Empresa Responsable Amarrada al SG-SST (No editable por el momento) */}
              <div className="p-3.5 sm:p-4 bg-slate-100 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-black text-slate-900 block text-sm truncate">
                      Empresa Titular SG-SST: {company.name}
                    </span>
                    <span className="text-xs text-slate-600 font-mono mt-0.5 block truncate">
                      NIT {company.nit} • Clase de Riesgo {company.claseRiesgo} • CIIU {company.ciiu}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-200/90 text-slate-800 flex items-center gap-1.5 shrink-0 border border-slate-300 shadow-2xs w-fit">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Empresa Amarrada (No editable)</span>
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5 text-sm">Tema de Capacitación *</label>
                <input
                  type="text"
                  required
                  value={newTema}
                  onChange={(e) => setNewTema(e.target.value)}
                  placeholder="Ej: Prevención de Atrapamientos y Guardas de Protección en Tornos"
                  className="w-full p-2.5 sm:p-3 border border-slate-300 rounded-xl outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5 text-sm">Objetivo de la Formación *</label>
                <textarea
                  rows={2}
                  required
                  value={newObjetivo}
                  onChange={(e) => setNewObjetivo(e.target.value)}
                  placeholder="Defina el objetivo formativo medible..."
                  className="w-full p-2.5 sm:p-3 border border-slate-300 rounded-xl outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 text-sm">Peligro Asociado (GTC 45)</label>
                  <select
                    value={newPeligroId}
                    onChange={(e) => {
                      setNewPeligroId(e.target.value);
                      const hz = hazards.find((h) => h.id === e.target.value);
                      if (hz) setNewArea(hz.zonaLugar);
                    }}
                    className="w-full p-2.5 sm:p-3 border border-slate-300 rounded-xl bg-white outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="">Capacitación General del SG-SST</option>
                    {hazards.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.code} • {h.factorEspecifico} ({h.evaluacion.level})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 text-sm">Área / Proceso Dirigido *</label>
                  <input
                    type="text"
                    required
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    placeholder="Ej: Zona de Torno y Fresado"
                    className="w-full p-2.5 sm:p-3 border border-slate-300 rounded-xl outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 text-sm">Modalidad</label>
                  <select
                    value={newModalidad}
                    onChange={(e) => setNewModalidad(e.target.value as ModalidadCapacitacion)}
                    className="w-full p-2.5 sm:p-3 border border-slate-300 rounded-xl bg-white outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="PRESENCIAL_TEORICO_PRACTICO">Presencial Teórico-Práctico</option>
                    <option value="TALLER_PUESTO_TRABAJO">Taller en Puesto de Trabajo</option>
                    <option value="CHARLA_5_MIN">Charla Operativa (5 Minutos)</option>
                    <option value="VIRTUAL_ARL">Virtual ARL / Plataforma</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 text-sm">Duración (Horas)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={newDuracionHoras}
                    onChange={(e) => setNewDuracionHoras(Number(e.target.value))}
                    className="w-full p-2.5 sm:p-3 border border-slate-300 rounded-xl outline-none focus:border-blue-500 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 text-sm">Fecha Programada *</label>
                  <input
                    type="date"
                    required
                    value={newFecha}
                    onChange={(e) => setNewFecha(e.target.value)}
                    className="w-full p-2.5 sm:p-3 border border-slate-300 rounded-xl outline-none focus:border-blue-500 text-sm font-mono"
                  />
                </div>
              </div>

              {/* Capacitador Asignado como SELECT */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5 text-sm">
                  Capacitador / Entidad Responsable (Seleccionar) *
                </label>
                <select
                  value={selectedTrainerId}
                  onChange={(e) => setSelectedTrainerId(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl bg-white outline-none focus:border-blue-500 text-sm font-semibold"
                >
                  {AVAILABLE_TRAINERS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} — {t.entidad} ({t.cargo} • {t.licencia})
                    </option>
                  ))}
                </select>
                {(() => {
                  const currentT =
                    AVAILABLE_TRAINERS.find((t) => t.id === selectedTrainerId) || AVAILABLE_TRAINERS[0];
                  return (
                    <div className="mt-1.5 text-xs text-slate-600 flex items-center gap-2">
                      <span className="font-bold text-slate-800">{currentT.entidad}</span>
                      <span>•</span>
                      <span className="font-mono">{currentT.licencia}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-xs font-bold text-slate-700">
                        {currentT.tipo === 'INTERNO' ? 'Capacitador Interno' : 'Capacitador Externo / ARL'}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Implementos, Equipos y EPP Requeridos con SELECT y Búsqueda con Filtro */}
              <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/70 space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="block font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-blue-600" />
                    <span>Implementos, Equipos y EPP que se Ocuparán ({selectedImplementos.length})</span>
                  </label>
                  <span className="text-xs text-slate-500 font-medium">
                    Filtra y selecciona cada elemento específico
                  </span>
                </div>

                {/* Search input with live filter */}
                <div className="relative">
                  <input
                    type="text"
                    value={implementoFilterText}
                    onChange={(e) => setImplementoFilterText(e.target.value)}
                    placeholder="Filtrar implementos (ej: guantes de nitrilo, guantes de poda, careta, LOTO, extintor)..."
                    className="w-full text-sm py-2.5 pl-9 pr-3 rounded-xl border border-slate-300 bg-white focus:border-blue-500 outline-none"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>

                {/* SELECT Dropdown for Implementos */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                    Seleccionar implemento del catálogo (desplegable) *:
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        toggleImplemento(e.target.value);
                      }
                    }}
                    className="w-full text-sm p-2.5 sm:p-3 rounded-xl border border-slate-300 bg-white focus:border-blue-500 outline-none font-semibold text-slate-800"
                  >
                    <option value="">-- Elige un implemento para agregar a la capacitación --</option>
                    {filteredImplementosList.map((item) => (
                      <option key={item.id} value={item.nombre}>
                        {selectedImplementos.includes(item.nombre) ? '✓ ' : '+ '}
                        {item.nombre} ({item.normaReferencia || item.categoria})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: 'TODOS', label: 'Todos' },
                      { id: 'EPP_ESPECIFICO', label: 'EPP Específico' },
                      { id: 'HERRAMIENTAS_SEGURIDAD', label: 'Herramientas de Seguridad' },
                      { id: 'EMERGENCIAS_CONTROL', label: 'Control de Emergencias / Derrames' },
                      { id: 'MATERIAL_DIDACTICO', label: 'Material Didáctico' },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedImplementoCategory(cat.id)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        selectedImplementoCategory === cat.id
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* List of distinct implementos with descriptions */}
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-white divide-y divide-slate-100">
                  {filteredImplementosList.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 text-xs italic">
                      No se encontraron implementos con ese filtro.
                    </div>
                  ) : (
                    filteredImplementosList.map((item) => {
                      const isSelected = selectedImplementos.includes(item.nombre);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleImplemento(item.nombre)}
                          className={`p-2.5 sm:p-3 flex items-start gap-3 text-xs sm:text-sm cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50/90 hover:bg-blue-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="mt-0.5 w-4 h-4 rounded text-blue-600 border-slate-300 cursor-pointer pointer-events-none"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-900 flex items-center justify-between text-xs sm:text-sm">
                              <span className="truncate">{item.nombre}</span>
                              {item.normaReferencia && (
                                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 ml-2 shrink-0 font-semibold">
                                  {item.normaReferencia}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{item.descripcion}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Selected implementos badges */}
                {selectedImplementos.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1.5">
                    {selectedImplementos.map((nombre) => (
                      <span
                        key={nombre}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs sm:text-sm font-semibold"
                      >
                        <Tag className="w-3.5 h-3.5 text-blue-600" />
                        <span className="truncate max-w-[320px]">{nombre}</span>
                        <button
                          type="button"
                          onClick={() => toggleImplemento(nombre)}
                          className="p-0.5 hover:text-red-600 rounded cursor-pointer font-bold ml-1 text-sm"
                          title="Quitar implemento"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {formWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>{formWarning}</span>
                </div>
              )}

              {formError && <p className="text-red-600 font-bold text-xs sm:text-sm">{formError}</p>}

              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewPlanModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-md cursor-pointer text-center"
                >
                  Registrar en Cronograma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
