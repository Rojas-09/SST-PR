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
  const [selectedYear, setSelectedYear] = useState<number>(2025);
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
  const [newFecha, setNewFecha] = useState('2025-04-15');
  const [newCapacitadorNombre, setNewCapacitadorNombre] = useState('Ing. Carlos Méndez');
  const [newCapacitadorEntidad, setNewCapacitadorEntidad] = useState('Especialista SST • Taller Los Andes');
  const [newCapacitadorLicencia, setNewCapacitadorLicencia] = useState('Lic. 18492-2018 (DDS)');
  const [newCapacitadorId, setNewCapacitadorId] = useState('cap-carlos-mendez');
  const [formError, setFormError] = useState('');
  const [formWarning, setFormWarning] = useState('');

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

    // Overlap validation
    const overlapMsg = checkOverlap(newFecha, newCapacitadorId, newArea);
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
      if (associatedHazard.evaluacion.level === 'NIVEL_I') {
        // High priority warning
      }
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
      },
      {
        id: newCapacitadorId,
        nombre: newCapacitadorNombre,
        entidad: newCapacitadorEntidad,
        licencia: newCapacitadorLicencia,
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
              <option value={2025}>2025 (Vigencia Actual)</option>
              <option value={2026}>2026 (Proyección)</option>
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
              <div className="px-3.5 py-2 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  {monthName}
                </span>
                <span
                  className={`text-[10.5px] font-bold px-1.5 py-0.2 rounded-full ${
                    monthPlanes.length > 0 ? 'bg-blue-100 text-blue-800' : 'text-slate-400'
                  }`}
                >
                  {monthPlanes.length} {monthPlanes.length === 1 ? 'actividad' : 'actividades'}
                </span>
              </div>

              {/* Month Cards */}
              <div className="p-2.5 flex-1 space-y-2 overflow-y-auto max-h-[360px]">
                {monthPlanes.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-[11.5px] italic py-6">
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
                        className={`p-2.5 rounded-lg border transition-all text-xs space-y-1.5 ${
                          isAnulada
                            ? 'bg-slate-50 border-slate-200 opacity-60'
                            : isEjecutada
                            ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                            : isReprogramada
                            ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                            : 'bg-white border-slate-200 hover:border-blue-400 shadow-2xs'
                        }`}
                      >
                        {/* Status badge and code */}
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className="font-mono font-bold text-[10.5px] text-blue-700">
                            {plan.codigo}
                          </span>
                          {isEjecutada ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              EJECUTADA
                            </span>
                          ) : isReprogramada ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <RotateCcw className="w-3 h-3 text-amber-600" />
                              REPROGRAMADA
                            </span>
                          ) : isAnulada ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                              <Ban className="w-3 h-3 text-red-600" />
                              ANULADA
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <Clock className="w-3 h-3 text-blue-500" />
                              PROGRAMADA
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4
                          className={`font-bold leading-snug line-clamp-2 ${
                            isAnulada ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {plan.tema}
                        </h4>

                        {/* Area & Hazard */}
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {plan.areaDirigida}
                        </div>

                        {/* Date info with original tracking */}
                        <div className="text-[10.5px] font-mono flex items-center justify-between text-slate-600 pt-0.5 border-t border-slate-100">
                          <span>{plan.fechaProgramada}</span>
                          {isReprogramada && plan.fechaProgramadaOriginal && (
                            <span className="text-[9.5px] text-amber-700" title={`Fecha original: ${plan.fechaProgramadaOriginal}`}>
                              (Orig: {plan.fechaProgramadaOriginal})
                            </span>
                          )}
                        </div>

                        {/* Card Action Buttons */}
                        <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => onSelectPlan(plan.id)}
                            className="px-2 py-0.8 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10.5px] font-semibold flex items-center gap-1 cursor-pointer"
                            title="Gestionar sesión, calificaciones y acta"
                          >
                            <Eye className="w-3 h-3" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Programar Nueva Capacitación en el SG-SST</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewPlanModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlanSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tema de Capacitación *</label>
                <input
                  type="text"
                  required
                  value={newTema}
                  onChange={(e) => setNewTema(e.target.value)}
                  placeholder="Ej: Prevención de Atrapamientos y Guardas de Protección en Tornos"
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Objetivo de la Formación *</label>
                <textarea
                  rows={2}
                  required
                  value={newObjetivo}
                  onChange={(e) => setNewObjetivo(e.target.value)}
                  placeholder="Defina el objetivo formativo medible..."
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peligro Asociado (GTC 45)</label>
                  <select
                    value={newPeligroId}
                    onChange={(e) => {
                      setNewPeligroId(e.target.value);
                      const hz = hazards.find((h) => h.id === e.target.value);
                      if (hz) setNewArea(hz.zonaLugar);
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-blue-500 text-xs"
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
                  <label className="block font-bold text-slate-700 mb-1">Área / Proceso Dirigido *</label>
                  <input
                    type="text"
                    required
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    placeholder="Ej: Zona de Torno y Fresado"
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Modalidad</label>
                  <select
                    value={newModalidad}
                    onChange={(e) => setNewModalidad(e.target.value as ModalidadCapacitacion)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white outline-none focus:border-blue-500 text-xs"
                  >
                    <option value="PRESENCIAL_TEORICO_PRACTICO">Presencial Teórico-Práctico</option>
                    <option value="TALLER_PUESTO_TRABAJO">Taller en Puesto de Trabajo</option>
                    <option value="CHARLA_5_MIN">Charla Operativa (5 Minutos)</option>
                    <option value="VIRTUAL_ARL">Virtual ARL / Plataforma</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duración (Horas)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={newDuracionHoras}
                    onChange={(e) => setNewDuracionHoras(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fecha Programada *</label>
                  <input
                    type="date"
                    required
                    value={newFecha}
                    onChange={(e) => setNewFecha(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="font-bold text-slate-800 block text-[11px] uppercase">
                  Capacitador / Entidad Responsable
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newCapacitadorNombre}
                    onChange={(e) => setNewCapacitadorNombre(e.target.value)}
                    placeholder="Nombre del instructor"
                    className="p-1.5 border border-slate-300 rounded bg-white text-xs"
                  />
                  <input
                    type="text"
                    value={newCapacitadorEntidad}
                    onChange={(e) => setNewCapacitadorEntidad(e.target.value)}
                    placeholder="Entidad (Ej: Positiva ARL / Taller Los Andes)"
                    className="p-1.5 border border-slate-300 rounded bg-white text-xs"
                  />
                </div>
              </div>

              {formWarning && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{formWarning}</span>
                </div>
              )}

              {formError && <p className="text-red-600 font-semibold text-xs">{formError}</p>}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewPlanModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-xs"
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
