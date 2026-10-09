import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  X,
  GraduationCap,
  Users,
  Search,
  CheckSquare,
  Square,
  UserPlus,
  PenTool,
  Layers,
  Wrench,
  Tag,
  Check,
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { CompanyInfo, HazardRecord } from '../../types';
import { ModalidadCapacitacion } from '../../types/capacitaciones';
import { capacitacionesStorage } from '../../services/capacitacionesStorage';
import { workersStorage, WorkerRecord } from '../../services/workersStorage';
import { getAvailableTrainers } from './CronogramaAnualMatriz';
import { CATALOGO_IMPLEMENTOS } from '../../data/implementosCatalog';

interface CrearCapacitacionPanelProps {
  company: CompanyInfo;
  hazards: HazardRecord[];
  selectedYear: number;
  onClose: () => void;
  onCreated: (newPlanId: string) => void;
}

export function CrearCapacitacionPanel({
  company,
  hazards,
  selectedYear,
  onClose,
  onCreated,
}: CrearCapacitacionPanelProps) {
  // Form fields
  const [tema, setTema] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [peligroId, setPeligroId] = useState('');
  const [area, setArea] = useState('Taller y Operaciones');
  const [modalidad, setModalidad] = useState<ModalidadCapacitacion>('PRESENCIAL_TEORICO_PRACTICO');
  const [fecha, setFecha] = useState(`${selectedYear}-03-15`);
  const [duracionHoras, setDuracionHoras] = useState<number>(2);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('CAP-01');

  // Implementos / EPP
  const [selectedImplementos, setSelectedImplementos] = useState<string[]>([
    'Gafas de seguridad',
  ]);

  // Worker Selection & Mode (Requirement 4 & 6)
  const [convocatoriaMode, setConvocatoriaMode] = useState<'SISTEMA' | 'MIXTA' | 'BLANCO'>('SISTEMA');
  const [blankRowsCount, setBlankRowsCount] = useState<number>(5);
  const [workerSearchQuery, setWorkerSearchQuery] = useState('');
  
  // Available workers for this company
  const [workersList, setWorkersList] = useState<WorkerRecord[]>(() => {
    return workersStorage.getWorkers(company.id);
  });

  // Selected worker IDs (default to all active workers)
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>(() => {
    return workersStorage.getWorkers(company.id).map((w) => w.id);
  });

  // Inline "+ Agregar Trabajador a Mano"
  const [isAddingWorkerInline, setIsAddingWorkerInline] = useState(false);
  const [inlineNombre, setInlineNombre] = useState('');
  const [inlineCedula, setInlineCedula] = useState('');
  const [inlineCargo, setInlineCargo] = useState('');
  const [inlineArea, setInlineArea] = useState(area);
  const [inlineFeedback, setInlineFeedback] = useState<string | null>(null);

  // Form errors
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeTrainers = useMemo(() => {
    return getAvailableTrainers(company.id);
  }, [company.id]);

  const catalogImplementos = useMemo(() => {
    return CATALOGO_IMPLEMENTOS;
  }, []);

  // Filtered workers based on search query
  const filteredWorkers = useMemo(() => {
    const q = workerSearchQuery.toLowerCase().trim();
    if (!q) return workersList;
    return workersList.filter(
      (w) =>
        w.nombre.toLowerCase().includes(q) ||
        w.cedula.toLowerCase().includes(q) ||
        w.cargo.toLowerCase().includes(q) ||
        (w.area && w.area.toLowerCase().includes(q))
    );
  }, [workersList, workerSearchQuery]);

  const toggleWorkerSelection = (id: string) => {
    setSelectedWorkerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFilteredWorkers = () => {
    const filteredIds = filteredWorkers.map((w) => w.id);
    setSelectedWorkerIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
  };

  const deselectAllFilteredWorkers = () => {
    const filteredIdsSet = new Set(filteredWorkers.map((w) => w.id));
    setSelectedWorkerIds((prev) => prev.filter((id) => !filteredIdsSet.has(id)));
  };

  const toggleImplemento = (nombre: string) => {
    setSelectedImplementos((prev) =>
      prev.includes(nombre) ? prev.filter((i) => i !== nombre) : [...prev, nombre]
    );
  };

  // Quick save inline manual worker directly to company database
  const handleSaveInlineWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineNombre.trim() || !inlineCedula.trim() || !inlineCargo.trim()) {
      setInlineFeedback('Complete nombre, cédula y cargo.');
      return;
    }

    const newWorker = workersStorage.createWorker(company.id, {
      nombre: inlineNombre.trim(),
      cedula: inlineCedula.trim(),
      cargo: inlineCargo.trim(),
      area: inlineArea.trim() || area,
      eps: 'SURA EPS',
      arl: company.arl || 'Positiva',
      estado: 'ACTIVO',
    });

    // Refresh workers list and auto-select new worker
    const updated = workersStorage.getWorkers(company.id);
    setWorkersList(updated);
    setSelectedWorkerIds((prev) => [...prev, newWorker.id]);

    // Reset inline form
    setInlineNombre('');
    setInlineCedula('');
    setInlineCargo('');
    setIsAddingWorkerInline(false);
    setInlineFeedback('Trabajador guardado e incluido en la lista');
    setTimeout(() => setInlineFeedback(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tema.trim() || !objetivo.trim() || !fecha) {
      setErrorMsg('Por favor complete todos los campos obligatorios (*)');
      return;
    }

    // Target attendee IDs based on chosen mode
    let targetAttendeeIds: string[] = [];
    if (convocatoriaMode === 'SISTEMA' || convocatoriaMode === 'MIXTA') {
      targetAttendeeIds = selectedWorkerIds;
    }

    const chosenHazard = hazards.find((h) => h.id === peligroId);
    const trainerObj = activeTrainers.find((t) => t.id === selectedTrainerId) || activeTrainers[0];
    const uniqueNum = Date.now().toString().slice(-3);
    const codigo = `CAP-${selectedYear}-0${uniqueNum}`;

    const created = capacitacionesStorage.createPlan(
      {
        codigo,
        ano: parseInt(fecha.split('-')[0], 10) || selectedYear,
        mesProgramado: parseInt(fecha.split('-')[1], 10) || 1,
        fechaProgramada: fecha,
        tema: tema.trim(),
        objetivo: objetivo.trim(),
        peligroGtc45Id: peligroId || undefined,
        codigoPeligro: chosenHazard ? chosenHazard.code : undefined,
        tipoPeligroGTC45: chosenHazard ? chosenHazard.factorEspecifico : 'Seguridad Industrial',
        areaDirigida: area.trim(),
        modalidad,
        duracionHoras,
        publicoObjetivo: [area.trim(), 'Operarios y Supervisores'],
        temario: [
          'Marco normativo legal y responsabilidades SG-SST',
          'Identificación de peligros en el puesto de trabajo',
          'Protocolos de uso correcto de EPP y guardas de seguridad',
          'Evaluación práctica y compromisos de autocuidado',
        ],
        normativaAplicable: 'Decreto 1072/2015 Art. 2.2.4.6.11 • Res. 0312/2019 Est. 2.2.1',
        requiereEvaluacionEficacia: true,
        criterioEficaciaMinima: 80,
        estado: 'PROGRAMADA',
        implementosRequeridos: selectedImplementos,
        empresa: company.name,
      },
      trainerObj,
      targetAttendeeIds
    );

    onCreated(created.plan.id);
  };

  return (
    <div className="bg-white border-2 border-blue-500/40 rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
      {/* Top Header Bar with prominent Title and Actions right in view (Zero Scroll Required) */}
      <div className="px-5 py-4 sm:px-7 sm:py-4.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center shrink-0">
            <PlusCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Programar Nueva Capacitación SST
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Plan Anual {selectedYear}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 truncate mt-0.5">
              {company.name} • {company.claseRiesgo} • Convocatoria y Control de Asistencia
            </p>
          </div>
        </div>

        {/* Primary Action Buttons Pinned at Top Header */}
        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer border border-slate-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-md hover:shadow-blue-500/30 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Confirmar y Programar</span>
          </button>
        </div>
      </div>

      {/* Main Creation Grid: 2 Columns for instantaneous data entry without scrolling */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-7 space-y-5">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {inlineFeedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{inlineFeedback}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* LEFT COLUMN: Parámetros Formativos y Logísticos (7 cols) */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-4">
            {/* 1. Tema de Capacitación */}
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Tema de la Capacitación *</span>
                </label>
                <span className="text-[11px] text-slate-500 font-mono">GTC 45 / Dec. 1072</span>
              </div>
              <input
                type="text"
                required
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder="Ej: Prevención de atrapamientos y guardas de seguridad en tornos mecánicos"
                className="w-full py-2 px-3.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-blue-500"
              />
              {/* Quick suggestion chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Uso de EPP y Dotación',
                  'Riesgo Mecánico en Tornos',
                  'Seguridad en Fosas y Alturas',
                  'Prevención Riesgo Eléctrico',
                  'Manejo de Sustancias Químicas',
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setTema(sug)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-semibold transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Objetivo Formativo */}
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <label className="text-xs sm:text-sm font-black text-slate-900 block">
                Objetivo Formativo Medible *
              </label>
              <textarea
                rows={2}
                required
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                placeholder="Defina el objetivo de aprendizaje práctico que deben demostrar los operarios..."
                className="w-full py-2 px-3.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* 3. Grid de Parámetros Compactos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
              {/* Peligro Vinculado */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peligro Vinculado (GTC 45)
                </label>
                <select
                  value={peligroId}
                  onChange={(e) => {
                    setPeligroId(e.target.value);
                    const hz = hazards.find((h) => h.id === e.target.value);
                    if (hz) setArea(hz.zonaLugar);
                  }}
                  className="w-full py-2 px-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 truncate"
                >
                  <option value="">Capacitación General del SG-SST</option>
                  {hazards.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.code} • {h.factorEspecifico} ({h.evaluacion.level})
                    </option>
                  ))}
                </select>
              </div>

              {/* Área Convocada */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Área / Proceso Convocado *
                </label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Ej: Taller Mecánico • Zona 2"
                  className="w-full py-2 px-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              {/* Modalidad */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Modalidad Pedagógica
                </label>
                <select
                  value={modalidad}
                  onChange={(e) => setModalidad(e.target.value as ModalidadCapacitacion)}
                  className="w-full py-2 px-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="PRESENCIAL_TEORICO_PRACTICO">Presencial Teórico-Práctico</option>
                  <option value="TALLER_PUESTO_TRABAJO">Taller en Puesto de Trabajo</option>
                  <option value="CHARLA_5_MIN">Charla de Seguridad (5 Min)</option>
                  <option value="VIRTUAL_ARL">Virtual ARL</option>
                </select>
              </div>

              {/* Fecha Programada */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fecha Programada *
                </label>
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full py-2 px-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              {/* Duración */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Duración (Horas)
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={duracionHoras}
                  onChange={(e) => setDuracionHoras(Number(e.target.value))}
                  className="w-full py-2 px-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              {/* Capacitador */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Capacitador / Responsable *
                </label>
                <select
                  value={selectedTrainerId}
                  onChange={(e) => setSelectedTrainerId(e.target.value)}
                  className="w-full py-2 px-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 truncate"
                >
                  {activeTrainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} ({t.entidad})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Implementos y EPP Obligatorios */}
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Implementos y EPP para la Sesión ({selectedImplementos.length})</span>
                </label>
                <span className="text-[11px] text-slate-500 font-mono">Norma técnica</span>
              </div>

              {/* Quick EPP chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Gafas de seguridad',
                  'Careta fotosensible',
                  'Guantes de carnaza',
                  'Protector auditivo tipo copa',
                  'Botas con puntera',
                ].map((item) => {
                  const isSelected = selectedImplementos.some((s) =>
                    s.toLowerCase().includes(item.toLowerCase().substring(0, 6))
                  );
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleImplemento(item)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {item}
                    </button>
                  );
                })}
              </div>

              {/* Dropdown for complete catalog */}
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) toggleImplemento(e.target.value);
                }}
                className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-300 bg-white focus:border-blue-500 outline-none font-semibold text-slate-800 truncate"
              >
                <option value="">-- Agregar otro EPP o herramienta del catálogo institucional --</option>
                {catalogImplementos.map((item) => (
                  <option key={item.id} value={item.nombre}>
                    {selectedImplementos.includes(item.nombre) ? '✓ ' : '+ '}
                    {item.nombre} ({item.categoria})
                  </option>
                ))}
              </select>

              {/* Badges of selected implementos */}
              {selectedImplementos.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedImplementos.map((nombre) => (
                    <span
                      key={nombre}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg text-xs font-semibold"
                    >
                      <Tag className="w-3 h-3 text-blue-600 shrink-0" />
                      <span className="truncate max-w-[200px]">{nombre}</span>
                      <button
                        type="button"
                        onClick={() => toggleImplemento(nombre)}
                        className="p-0.5 hover:text-red-600 rounded cursor-pointer font-bold text-xs shrink-0 ml-0.5"
                        title="Quitar"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Convocatoria y Selección de Trabajadores (Requirement 4 & 6) (5 cols) */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col space-y-4">
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-emerald-300/80 space-y-3.5 flex-1 flex flex-col">
              <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-700 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">
                      Selección de Trabajadores a Capacitar
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Elija quiénes deben asistir y quiénes no
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-mono font-bold text-xs border border-emerald-200">
                  {selectedWorkerIds.length} de {workersList.length} convocados
                </span>
              </div>

              {/* Mode selector (Requirement 6: Mixta, Sistema, Blanco) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Modalidad de Convocatoria y Planilla:
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-200/70 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setConvocatoriaMode('SISTEMA')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      convocatoriaMode === 'SISTEMA'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span className="truncate">Nómina</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConvocatoriaMode('MIXTA')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      convocatoriaMode === 'MIXTA'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span className="truncate">Mixta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConvocatoriaMode('BLANCO')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      convocatoriaMode === 'BLANCO'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span className="truncate">En Blanco</span>
                  </button>
                </div>
              </div>

              {/* Renglones en blanco si es Mixta o Blanco */}
              {(convocatoriaMode === 'MIXTA' || convocatoriaMode === 'BLANCO') && (
                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-amber-900">
                    Renglones vacíos en planilla:
                  </span>
                  <div className="flex items-center gap-1">
                    {[5, 10, 15, 20].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setBlankRowsCount(num)}
                        className={`px-2 py-0.5 rounded font-mono font-bold cursor-pointer transition-colors ${
                          blankRowsCount === num
                            ? 'bg-amber-500 text-slate-950 shadow-2xs'
                            : 'bg-white text-slate-700 hover:bg-amber-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Optimized Search Filter (Requirement 4) */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={workerSearchQuery}
                  onChange={(e) => setWorkerSearchQuery(e.target.value)}
                  placeholder="Buscar trabajador por nombre, cédula o cargo..."
                  className="w-full text-xs py-2 pl-9 pr-3 rounded-xl border border-slate-300 bg-white focus:border-blue-500 outline-none font-medium"
                />
              </div>

              {/* Quick bulk actions and "+ Agregar a Mano" button */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllFilteredWorkers}
                    className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                  >
                    Seleccionar Todos ({filteredWorkers.length})
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={deselectAllFilteredWorkers}
                    className="text-[11px] font-bold text-slate-500 hover:underline cursor-pointer"
                  >
                    Deseleccionar
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingWorkerInline(!isAddingWorkerInline)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  title="Agregar nuevo trabajador a nómina y seleccionarlo de inmediato"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Agregar a Mano</span>
                </button>
              </div>

              {/* Inline drawer to add a worker manually (Requirement 6) */}
              {isAddingWorkerInline && (
                <div className="bg-white border border-emerald-300 rounded-xl p-3 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="font-bold text-xs text-emerald-900">
                      Nuevo Trabajador para Nómina y Planilla
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingWorkerInline(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Nombre Completo *"
                      value={inlineNombre}
                      onChange={(e) => setInlineNombre(e.target.value)}
                      className="p-1.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Cédula *"
                      value={inlineCedula}
                      onChange={(e) => setInlineCedula(e.target.value)}
                      className="p-1.5 border border-slate-300 rounded-lg outline-none font-mono focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Cargo / Ocupación *"
                      value={inlineCargo}
                      onChange={(e) => setInlineCargo(e.target.value)}
                      className="p-1.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Área Asignada"
                      value={inlineArea}
                      onChange={(e) => setInlineArea(e.target.value)}
                      className="p-1.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleSaveInlineWorker}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer shadow-2xs"
                    >
                      Guardar en Nómina e Incluir
                    </button>
                  </div>
                </div>
              )}

              {/* Worker Checkbox List with clean, responsive cards */}
              <div className="flex-1 overflow-y-auto max-h-[360px] divide-y divide-slate-100 bg-white border border-slate-200 rounded-xl overscroll-contain">
                {filteredWorkers.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs italic">
                    No se encontraron trabajadores que coincidan con &quot;{workerSearchQuery}&quot;
                  </div>
                ) : (
                  filteredWorkers.map((w) => {
                    const isSelected = selectedWorkerIds.includes(w.id);
                    return (
                      <div
                        key={w.id}
                        onClick={() => toggleWorkerSelection(w.id)}
                        className={`p-2.5 sm:p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/70 hover:bg-blue-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by parent div onClick
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-900 truncate">
                                {w.nombre}
                              </span>
                              <span className="text-[10.5px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                                {w.cedula}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {w.cargo} {w.area ? `• ${w.area}` : ''}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {isSelected ? 'Convocado' : 'Excluido'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Second set of action buttons for long screens */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Los datos se sincronizan con la matriz anual y las firmas legales de auditoría.
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Confirmar y Programar</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
