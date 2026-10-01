import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  FileText,
  Search,
  Filter,
  ShieldCheck,
  Award,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Sparkles,
  Users,
  Building2,
  Printer,
  Edit3,
} from 'lucide-react';
import { CapacitacionRecord, HazardRecord, CompanyInfo, ActiveView } from '../types';
import { workshopEmployees } from '../data/initialData';
import { ActaCapacitacionModal } from './ActaCapacitacionModal';

interface CapacitacionesViewProps {
  capacitaciones: CapacitacionRecord[];
  hazards: HazardRecord[];
  company: CompanyInfo;
  onNavigate: (view: ActiveView) => void;
  onSelectHazard: (hazard: HazardRecord) => void;
  onAddCapacitacion: (nueva: CapacitacionRecord) => void;
  onUpdateCapacitacion: (actualizada: CapacitacionRecord) => void;
}

export function CapacitacionesView({
  capacitaciones,
  hazards,
  company,
  onNavigate,
  onSelectHazard,
  onAddCapacitacion,
  onUpdateCapacitacion,
}: CapacitacionesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHazardFilter, setSelectedHazardFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'EJECUTADA' | 'PROGRAMADA'>('ALL');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(capacitaciones[0]?.id || null);
  
  // Modal for viewing printable official certificate/record
  const [activeActaCapacitacion, setActiveActaCapacitacion] = useState<CapacitacionRecord | null>(null);
  
  // Modal for creating a new training
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New training form state
  const [newTema, setNewTema] = useState('');
  const [newObjetivo, setNewObjetivo] = useState('');
  const [newPeligroId, setNewPeligroId] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newModalidad, setNewModalidad] = useState<CapacitacionRecord['modalidad']>('PRESENCIAL_TEORICO_PRACTICO');
  const [newDuracionHoras, setNewDuracionHoras] = useState(2);
  const [newFechaProgramada, setNewFechaProgramada] = useState(new Date().toISOString().split('T')[0]);
  const [newCapacitadorNombre, setNewCapacitadorNombre] = useState('Ing. Carlos Méndez');
  const [newCapacitadorEntidad, setNewCapacitadorEntidad] = useState('Especialista SST • Taller Los Andes');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>(
    workshopEmployees.map((e) => e.id)
  );

  // Stats calculation
  const totalCount = capacitaciones.length;
  const ejecutadasCount = capacitaciones.filter((c) => c.estado === 'EJECUTADA').length;
  const programadasCount = capacitaciones.filter((c) => c.estado === 'PROGRAMADA').length;
  const pctCumplimiento = totalCount > 0 ? Math.round((ejecutadasCount / totalCount) * 100) : 0;
  
  const totalHorasImpartidas = capacitaciones
    .filter((c) => c.estado === 'EJECUTADA')
    .reduce((acc, curr) => acc + curr.duracionHoras, 0);

  const coberturaPromedio = useMemo(() => {
    const executed = capacitaciones.filter((c) => c.estado === 'EJECUTADA');
    if (executed.length === 0) return 0;
    const sum = executed.reduce((acc, curr) => acc + curr.porcentajeCobertura, 0);
    return Math.round(sum / executed.length);
  }, [capacitaciones]);

  // Hazards linked to training
  const criticalHazardsWithTraining = useMemo(() => {
    const critical = hazards.filter((h) => h.evaluacion.level === 'NIVEL_I');
    const covered = critical.filter((h) =>
      capacitaciones.some((c) => c.peligroIdRelacionado === h.id)
    );
    return { covered: covered.length, total: critical.length };
  }, [hazards, capacitaciones]);

  // Filtered trainings
  const filteredCapacitaciones = useMemo(() => {
    return capacitaciones.filter((cap) => {
      // Search query
      const matchSearch =
        searchQuery.trim() === '' ||
        cap.tema.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cap.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cap.areaAfectada.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cap.capacitador.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cap.tipoPeligroGTC45.toLowerCase().includes(searchQuery.toLowerCase());

      // Hazard filter
      const matchHazard =
        selectedHazardFilter === 'ALL' ||
        (selectedHazardFilter === 'GENERAL' && !cap.peligroIdRelacionado) ||
        cap.peligroIdRelacionado === selectedHazardFilter;

      // Status filter
      const matchStatus =
        selectedStatusFilter === 'ALL' || cap.estado === selectedStatusFilter;

      return matchSearch && matchHazard && matchStatus;
    });
  }, [capacitaciones, searchQuery, selectedHazardFilter, selectedStatusFilter]);

  // Handler to toggle worker attendance
  const handleToggleAttendance = (capId: string, employeeId: string) => {
    const cap = capacitaciones.find((c) => c.id === capId);
    if (!cap) return;

    const updatedAsistentes = cap.asistentes.map((a) => {
      if (a.id === employeeId) {
        const nextAsistio = !a.asistio;
        return {
          ...a,
          asistio: nextAsistio,
          firmaRegistrada: nextAsistio,
          calificacion: nextAsistio ? (a.calificacion || 90) : undefined,
        };
      }
      return a;
    });

    const asistentesCount = updatedAsistentes.filter((a) => a.asistio).length;
    const porcentajeCobertura =
      cap.convocadosCount > 0
        ? Math.round((asistentesCount / cap.convocadosCount) * 100)
        : 0;

    const graded = updatedAsistentes.filter((a) => a.asistio && a.calificacion !== undefined);
    const avgGrade =
      graded.length > 0
        ? Math.round(graded.reduce((acc, curr) => acc + (curr.calificacion || 0), 0) / graded.length)
        : 0;

    const updatedCap: CapacitacionRecord = {
      ...cap,
      asistentes: updatedAsistentes,
      asistentesCount,
      porcentajeCobertura,
      porcentajeAprobacion: avgGrade,
      estado: asistentesCount > 0 ? 'EJECUTADA' : 'PROGRAMADA',
      fechaEjecucion: asistentesCount > 0 ? (cap.fechaEjecucion || new Date().toISOString().split('T')[0]) : undefined,
      eficaciaEvaluada: asistentesCount > 0,
      resultadoEficacia: avgGrade >= 80 ? 'EFICAZ' : 'REQUIERE_REFUERZO',
    };

    onUpdateCapacitacion(updatedCap);
  };

  // Handler to create training
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTema.trim()) return;

    const relatedHazard = hazards.find((h) => h.id === newPeligroId);

    const targetWorkers = workshopEmployees.filter((emp) =>
      selectedEmployeeIds.includes(emp.id)
    );

    const newCode = `CAP-2025-00${capacitaciones.length + 1}`;

    const nueva: CapacitacionRecord = {
      id: `CAP-${Date.now()}`,
      codigo: newCode,
      tema: newTema.trim(),
      objetivo:
        newObjetivo.trim() ||
        `Entrenar y capacitar a los operarios en prácticas seguras para prevención de peligros ocupacionales en ${newArea || 'el taller'}.`,
      peligroIdRelacionado: relatedHazard ? relatedHazard.id : undefined,
      codigoPeligro: relatedHazard ? relatedHazard.code : undefined,
      tipoPeligroGTC45: relatedHazard
        ? `${relatedHazard.tipoPeligroGeneral} (${relatedHazard.factorEspecifico})`
        : 'Seguridad y Salud en el Trabajo General',
      areaAfectada: newArea.trim() || (relatedHazard ? relatedHazard.zonaLugar : 'Taller General'),
      modalidad: newModalidad,
      duracionHoras: Number(newDuracionHoras) || 2,
      fechaProgramada: newFechaProgramada,
      estado: 'PROGRAMADA',
      capacitador: {
        nombre: newCapacitadorNombre.trim() || 'Ing. Carlos Méndez',
        entidad: newCapacitadorEntidad.trim() || 'Especialista SST • Taller Los Andes',
        licenciaOId: 'Lic. 18492-2018 (DDS)',
      },
      publicoObjetivo: Array.from(new Set(targetWorkers.map((w) => w.cargo))),
      convocadosCount: targetWorkers.length,
      asistentesCount: 0,
      porcentajeCobertura: 0,
      porcentajeAprobacion: 0,
      asistentes: targetWorkers.map((emp) => ({
        id: emp.id,
        nombre: emp.nombre,
        cedula: emp.cedula,
        cargo: emp.cargo,
        asistio: false,
        firmaRegistrada: false,
      })),
      temario: [
        `Identificación de factores de riesgo asociados a ${relatedHazard ? relatedHazard.factorEspecifico : newTema}`,
        'Medidas preventivas técnicas y uso de elementos de protección personal certificados',
        'Procedimiento de trabajo seguro y reporte inmediato de condiciones anómalas',
        'Evaluación teórico-práctica y compromiso de cumplimiento de normas SST',
      ],
      normativaAplicable: 'Decreto 1072 de 2015 (Art. 2.2.4.6.11), Res. 0312 de 2019 (Estándar 2.2.1)',
      requiereEvaluacionEficacia: true,
      eficaciaEvaluada: false,
    };

    onAddCapacitacion(nueva);
    setIsNewModalOpen(false);
    setExpandedCardId(nueva.id);

    // Reset form
    setNewTema('');
    setNewObjetivo('');
    setNewPeligroId('');
    setNewArea('');
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 text-[13px]">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11.5px] font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
              <span>Estándar 2.2.1 • Resolución 0312 de 2019 & Art. 2.2.4.6.11 Dec. 1072/2015</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Plan Anual de Capacitación y Entrenamiento en Peligros GTC 45
            </h1>
            <p className="text-slate-300 text-xs md:text-[13px] leading-relaxed">
              Gestión, asistencia y evaluación de la eficacia de capacitaciones técnicas dirigidas a mitigar los peligros prioritarios evaluados en <strong>{company.name}</strong> (Riesgo IV).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>+ Programar Capacitación</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const firstExecuted = capacitaciones.find((c) => c.estado === 'EJECUTADA') || capacitaciones[0];
                if (firstExecuted) setActiveActaCapacitacion(firstExecuted);
              }}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
            >
              <FileText className="w-4 h-4 text-blue-300" />
              <span>Ver Modelo de Acta Legal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Executive KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Cumplimiento Plan */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Cumplimiento del Plan
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {pctCumplimiento}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({ejecutadasCount} de {totalCount} temas)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${pctCumplimiento}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {programadasCount} capacitaciones pendientes en cronograma
          </p>
        </div>

        {/* KPI 2: Cobertura Operarios */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Cobertura de Asistencia
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 font-mono">
              {coberturaPromedio}%
            </span>
            <span className="text-xs text-emerald-800 font-medium">Promedio en ejecutadas</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            100% de firmas registradas en sesiones cerradas
          </p>
        </div>

        {/* KPI 3: Cobertura de Peligros Críticos */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Peligros Nivel I Cubiertos
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {criticalHazardsWithTraining.covered}/{criticalHazardsWithTraining.total}
            </span>
            <span className="text-xs text-emerald-700 font-medium font-semibold">100% Blindados</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Soldadura (PEL-001) y Tablero 220V (PEL-002) capacitados
          </p>
        </div>

        {/* KPI 4: Horas Técnicas */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Horas de Formación
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-700 font-mono">
              {totalHorasImpartidas}h
            </span>
            <span className="text-xs text-slate-500 font-medium">acumuladas año 2025</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Facilitadores: ARL Positiva y Especialista SST
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por tema, peligro, facilitador o área..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Hazard Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedHazardFilter}
              onChange={(e) => setSelectedHazardFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Todos los Peligros</option>
              {hazards.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.code}: {h.title.slice(0, 35)}...
                </option>
              ))}
              <option value="GENERAL">Capacitaciones Generales / Biomecánicas</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setSelectedStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                selectedStatusFilter === 'ALL'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({capacitaciones.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusFilter('EJECUTADA')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                selectedStatusFilter === 'EJECUTADA'
                  ? 'bg-white text-emerald-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ejecutadas ({ejecutadasCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusFilter('PROGRAMADA')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                selectedStatusFilter === 'PROGRAMADA'
                  ? 'bg-white text-amber-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Programadas ({programadasCount})
            </button>
          </div>
        </div>
      </div>

      {/* List of Training Cards */}
      <div className="space-y-4">
        {filteredCapacitaciones.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              No se encontraron capacitaciones con los filtros seleccionados
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Prueba cambiando el término de búsqueda o limpia los filtros.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedHazardFilter('ALL');
                setSelectedStatusFilter('ALL');
              }}
              className="mt-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          filteredCapacitaciones.map((cap) => {
            const isExpanded = expandedCardId === cap.id;
            const relatedHazard = hazards.find((h) => h.id === cap.peligroIdRelacionado);

            return (
              <div
                key={cap.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Main Card Header */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {cap.codigo}
                      </span>

                      {/* Status Badge */}
                      {cap.estado === 'EJECUTADA' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Ejecutada • {cap.fechaEjecucion}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Programada • {cap.fechaProgramada}
                        </span>
                      )}

                      {/* Associated Hazard Link */}
                      {relatedHazard ? (
                        <button
                          type="button"
                          onClick={() => onSelectHazard(relatedHazard)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200 transition-colors cursor-pointer"
                          title="Hacer clic para ver el peligro en la Matriz GTC 45"
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Peligro: {relatedHazard.code}</span>
                          <ExternalLink className="w-2.5 h-2.5 ml-0.5 text-blue-500" />
                        </button>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          Capacitación General / Ergonómica
                        </span>
                      )}

                      {cap.resultadoEficacia === 'EFICAZ' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          <Award className="w-3 h-3" />
                          Eficaz (Res. 0312)
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {cap.tema}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {cap.objetivo}
                    </p>

                    {/* Meta info tags */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                      <span>
                        <strong className="text-slate-700">Área:</strong> {cap.areaAfectada}
                      </span>
                      <span>•</span>
                      <span>
                        <strong className="text-slate-700">Facilitador:</strong> {cap.capacitador.nombre} ({cap.capacitador.entidad})
                      </span>
                      <span>•</span>
                      <span>
                        <strong className="text-slate-700">Intensidad:</strong> {cap.duracionHoras}h ({cap.modalidad.replace(/_/g, ' ')})
                      </span>
                    </div>
                  </div>

                  {/* Actions & Summary Metrics */}
                  <div className="flex items-center gap-4 shrink-0 justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-xs text-slate-500">
                        Asistencia:{' '}
                        <strong className="font-mono text-slate-900 text-sm">
                          {cap.asistentesCount}/{cap.convocadosCount}
                        </strong>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {cap.porcentajeCobertura}% Cobertura
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveActaCapacitacion(cap)}
                        className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Generar Acta Oficial con Formato del SG-SST"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Acta Oficial</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandedCardId(isExpanded ? null : cap.id)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
                      >
                        <span>{isExpanded ? 'Ocultar Asistentes' : 'Ver Asistentes'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details: Syllabus & Attendance List */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/70 p-5 space-y-4">
                    {/* Temario Desarrollado */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        Puntos Temáticos Desarrollados en la Formación
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
                        {cap.temario.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2 shadow-2xs"
                          >
                            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-snug">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Attendance Roster */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-700" />
                          Lista de Trabajadores Convocados y Registro de Asistencia
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          Haz clic en el estado de asistencia para registrar participación y firma
                        </span>
                      </div>

                      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
                        <table className="table-stack w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-2.5 w-[26%]">Trabajador</th>
                              <th className="py-2.5 px-2.5 w-[12%]">Cédula</th>
                              <th className="py-2.5 px-2.5 w-[24%]">Cargo</th>
                              <th className="py-2.5 px-2.5 text-center w-[16%]">Estado Asistencia</th>
                              <th className="py-2.5 px-2.5 text-center w-[10%]">Nota /100</th>
                              <th className="py-2.5 px-2.5 text-center w-[12%]">Firma</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {cap.asistentes.map((asistente) => (
                              <tr key={asistente.id} className="hover:bg-slate-50/80">
                                <td data-label="Trabajador" className="py-2 px-3 font-semibold text-slate-900">
                                  {asistente.nombre}
                                </td>
                                <td data-label="Cédula" className="py-2 px-3 font-mono text-slate-600">
                                  {asistente.cedula}
                                </td>
                                <td data-label="Cargo" className="py-2 px-3 text-slate-600">{asistente.cargo}</td>
                                <td data-label="Estado Asistencia" className="py-2 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleAttendance(cap.id, asistente.id)}
                                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                                      asistente.asistio
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                    }`}
                                  >
                                    {asistente.asistio ? (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        Asistió
                                      </>
                                    ) : (
                                      'Marcar Presente'
                                    )}
                                  </button>
                                </td>
                                <td data-label="Nota /100" className="py-2 px-3 text-center font-mono font-bold">
                                  {asistente.asistio ? (
                                    <span className="text-emerald-700">
                                      {asistente.calificacion || 95}/100
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </td>
                                <td data-label="Firma" className="py-2 px-3 text-center">
                                  {asistente.firmaRegistrada ? (
                                    <span className="font-serif italic text-blue-800 text-[11px] font-semibold">
                                      Firma digital OK
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[11px]">Pendiente</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Bottom Legal Footer & Shortcut */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-xs text-slate-500">
                      <span>
                        Soporte técnico auditado conforme a la Resolución 0312 de 2019 (Estándar 2.2.1)
                      </span>
                      <div className="flex items-center gap-2">
                        {relatedHazard && (
                          <button
                            type="button"
                            onClick={() => onSelectHazard(relatedHazard)}
                            className="text-blue-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <span>Ir al Control Administrativo en Peligro {relatedHazard.code}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Programar Nueva Capacitación */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center text-blue-300">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Programar Nueva Capacitación en Peligros SST
                  </h3>
                  <p className="text-xs text-slate-400">
                    Conforme al Plan Anual de Capacitación (Res. 0312 Est. 2.2.1)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              {/* Tema de la Capacitación */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tema Central de la Capacitación <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTema}
                  onChange={(e) => setNewTema(e.target.value)}
                  placeholder="Ej: Protocolo de Seguridad en Soldadura MIG y Protección UV"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Peligro GTC 45 Asociado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Peligro GTC 45 Asociado
                  </label>
                  <select
                    value={newPeligroId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setNewPeligroId(id);
                      const h = hazards.find((haz) => haz.id === id);
                      if (h && !newArea) setNewArea(h.zonaLugar);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="">Ninguno / Capacitación General</option>
                    {hazards.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.code} - {h.title.slice(0, 40)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Área o Puesto de Trabajo Afectado
                  </label>
                  <input
                    type="text"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    placeholder="Ej: Bahía 4 - Soldadura / Muro Norte"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Modalidad, Horas, Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Modalidad
                  </label>
                  <select
                    value={newModalidad}
                    onChange={(e) => setNewModalidad(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="PRESENCIAL_TEORICO_PRACTICO">Presencial Teórico-Práctico</option>
                    <option value="TALLER_PUESTO_TRABAJO">Taller en Puesto de Trabajo</option>
                    <option value="CHARLA_5_MIN">Charla 5 Minutos / Operativa</option>
                    <option value="VIRTUAL_ARL">Virtual Positiva ARL</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Intensidad (Horas)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={newDuracionHoras}
                    onChange={(e) => setNewDuracionHoras(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fecha Programada
                  </label>
                  <input
                    type="date"
                    required
                    value={newFechaProgramada}
                    onChange={(e) => setNewFechaProgramada(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Facilitador */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nombre del Facilitador / Capacitador
                  </label>
                  <input
                    type="text"
                    value={newCapacitadorNombre}
                    onChange={(e) => setNewCapacitadorNombre(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Entidad / Cargo
                  </label>
                  <input
                    type="text"
                    value={newCapacitadorEntidad}
                    onChange={(e) => setNewCapacitadorEntidad(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Convocados */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Trabajadores Convocados ({selectedEmployeeIds.length} seleccionados)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 max-h-36 overflow-y-auto">
                  {workshopEmployees.map((emp) => {
                    const isSelected = selectedEmployeeIds.includes(emp.id);
                    return (
                      <label
                        key={emp.id}
                        className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setSelectedEmployeeIds((prev) => prev.filter((id) => id !== emp.id));
                            } else {
                              setSelectedEmployeeIds((prev) => [...prev, emp.id]);
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="truncate">{emp.nombre}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  Programar Capacitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Visualizar Acta Oficial para Imprimir */}
      {activeActaCapacitacion && (
        <ActaCapacitacionModal
          isOpen={Boolean(activeActaCapacitacion)}
          onClose={() => setActiveActaCapacitacion(null)}
          capacitacion={activeActaCapacitacion}
          company={company}
        />
      )}
    </div>
  );
}
