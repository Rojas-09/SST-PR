import React, { useState, useEffect, useMemo } from 'react';
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
  History,
  UploadCloud,
  Unlock,
  RotateCcw,
  Check,
  FileCheck,
} from 'lucide-react';
import { HazardRecord, CompanyInfo, ActiveView } from '../types';
import {
  PlanCapacitacion,
  SesionEjecutada,
  AsistenciaCalificacion,
  EvidenciaExpediente,
  AuditoriaCalificacion,
  PrintTemplateType,
} from '../types/capacitaciones';
import { capacitacionesStorage } from '../services/capacitacionesStorage';
import { useAuthRole } from '../context/AuthRoleContext';
import { CapacitacionesRBACBar } from './capacitaciones/CapacitacionesRBACBar';
import { CronogramaAnualMatriz } from './capacitaciones/CronogramaAnualMatriz';
import { EditableGradesGrid } from './capacitaciones/EditableGradesGrid';
import { AuditoriaCalificacionesModal } from './capacitaciones/AuditoriaCalificacionesModal';
import { CargaEvidenciasModal } from './capacitaciones/CargaEvidenciasModal';
import { ReaperturaActaModal } from './capacitaciones/ReaperturaActaModal';
import { DocumentoImpresionModal } from './capacitaciones/DocumentoImpresionModal';

interface CapacitacionesViewProps {
  hazards: HazardRecord[];
  company: CompanyInfo;
  onNavigate: (view: ActiveView) => void;
  onSelectHazard: (hazard: HazardRecord) => void;
}

export function CapacitacionesView({
  hazards,
  company,
  onNavigate,
  onSelectHazard,
}: CapacitacionesViewProps) {
  const { currentUser, canSignActa, canExecuteSession } = useAuthRole();

  // Internal reactive state loaded directly from persistent storage
  const [planes, setPlanes] = useState<PlanCapacitacion[]>(() =>
    capacitacionesStorage.getPlanes()
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
    const list = capacitacionesStorage.getPlanes();
    return list[0]?.id || '';
  });

  // Active view tab inside module
  const [moduleTab, setModuleTab] = useState<'CRONOGRAMA' | 'SESION' | 'IMPRESION'>('CRONOGRAMA');

  // Active modals
  const [isAuditoriaOpen, setIsAuditoriaOpen] = useState(false);
  const [isEvidenciasOpen, setIsEvidenciasOpen] = useState(false);
  const [isReaperturaOpen, setIsReaperturaOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [activePrintTemplate, setActivePrintTemplate] = useState<PrintTemplateType>('ACTA_OFICIAL');

  // Subscribe to persistent storage events
  useEffect(() => {
    const unsubscribe = capacitacionesStorage.subscribe(() => {
      setPlanes(capacitacionesStorage.getPlanes());
    });
    return () => unsubscribe();
  }, []);

  const refreshData = () => {
    setPlanes(capacitacionesStorage.getPlanes());
  };

  // Selected Plan and Session
  const activePlan = useMemo(() => {
    return planes.find((p) => p.id === selectedPlanId) || planes[0];
  }, [planes, selectedPlanId]);

  const activeSesion = useMemo(() => {
    if (!activePlan) return undefined;
    return capacitacionesStorage.getSesionByPlanId(activePlan.id);
  }, [activePlan, planes]);

  const activeAsistencias = useMemo(() => {
    if (!activeSesion) return [];
    return capacitacionesStorage.getAsistenciasBySesionId(activeSesion.id);
  }, [activeSesion, planes]);

  const activeEvidencias = useMemo(() => {
    if (!activeSesion) return [];
    return capacitacionesStorage.getEvidenciasBySesionId(activeSesion.id);
  }, [activeSesion, planes]);

  const activeAuditorias = useMemo(() => {
    if (!activeSesion) return [];
    return capacitacionesStorage.getAuditoriasBySesionId(activeSesion.id);
  }, [activeSesion, planes]);

  // Overall module stats
  const totalCount = planes.length;
  const ejecutadasCount = planes.filter((c) => c.estado === 'EJECUTADA').length;
  const programadasCount = planes.filter((c) => c.estado === 'PROGRAMADA').length;
  const reprogramadasCount = planes.filter((c) => c.estado === 'REPROGRAMADA').length;
  const pctCumplimiento = totalCount > 0 ? Math.round((ejecutadasCount / totalCount) * 100) : 0;

  // Handlers
  const handleSelectPlanFromMatrix = (planId: string) => {
    setSelectedPlanId(planId);
    setModuleTab('SESION');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = (type: PrintTemplateType) => {
    setActivePrintTemplate(type);
    setIsPrintModalOpen(true);
  };

  const handleExecuteSession = () => {
    if (!activeSesion || !activePlan) return;
    const result = capacitacionesStorage.executeSesion(
      activeSesion.id,
      'Sesión ejecutada conforme a estándares del SG-SST.',
      activePlan.criterioEficaciaMinima
    );
    if (!result.success) {
      alert(result.error);
    } else {
      refreshData();
    }
  };

  const handleSignCapacitador = () => {
    if (!activeSesion) return;
    capacitacionesStorage.firmarActa(
      activeSesion.id,
      'CAPACITADOR',
      currentUser.nombre,
      `${currentUser.cargo} • ${currentUser.entidad}`
    );
    refreshData();
  };

  const handleSignResponsable = () => {
    if (!activeSesion) return;
    capacitacionesStorage.firmarActa(
      activeSesion.id,
      'RESPONSABLE',
      company.responsableSST.nombre,
      `${company.responsableSST.cargo} • ${company.responsableSST.licencia}`
    );
    refreshData();
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6 w-full max-w-7xl mx-auto font-sans text-slate-800 text-sm sm:text-base">
      {/* RBAC Top Bar: Role Simulation & Authentication State */}
      <CapacitacionesRBACBar />

      {/* Main Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Programa de Capacitación y Entrenamiento SST
                </h1>
                <span className="text-xs sm:text-sm font-mono px-3 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                  Res. 0312 / Est. 2.2.1 • Dec. 1072
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 mt-1 leading-relaxed">
                Plan anual, control de asistencias, calificación individual con auditoría y expedientes en{' '}
                <strong className="text-slate-900">{company.name}</strong>.
              </p>
            </div>
          </div>

          {/* Module Navigation Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 p-1.5 sm:p-2 rounded-2xl border border-slate-200 overflow-x-auto max-w-full w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setModuleTab('CRONOGRAMA')}
              className={`whitespace-nowrap shrink-0 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                moduleTab === 'CRONOGRAMA'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Cronograma 12 Meses</span>
            </button>

            <button
              type="button"
              onClick={() => setModuleTab('SESION')}
              className={`whitespace-nowrap shrink-0 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                moduleTab === 'SESION'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Sesión y Calificaciones</span>
            </button>

            <button
              type="button"
              onClick={() => setModuleTab('IMPRESION')}
              className={`whitespace-nowrap shrink-0 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                moduleTab === 'IMPRESION'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>Informes e Impresión</span>
            </button>
          </div>
        </div>

        {/* Global Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider block">Cumplimiento Legal</span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono mt-1.5">{pctCumplimiento}%</div>
            <span className="text-xs sm:text-sm text-slate-600 mt-1 block font-medium">
              {ejecutadasCount} de {totalCount} ejecutadas
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider block">Capacitaciones Pendientes</span>
            <div className="text-3xl sm:text-4xl font-black text-blue-600 font-mono mt-1.5">{programadasCount}</div>
            <span className="text-xs sm:text-sm text-slate-600 mt-1 block font-medium">Con fecha programada activa</span>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider block">Reprogramadas</span>
            <div className="text-3xl sm:text-4xl font-black text-amber-600 font-mono mt-1.5">{reprogramadasCount}</div>
            <span className="text-xs sm:text-sm text-slate-600 mt-1 block font-medium">Con justificación histórica</span>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider block">Cobertura Promedio</span>
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 font-mono mt-1.5">98.5%</div>
            <span className="text-xs sm:text-sm text-slate-600 mt-1 block font-medium">Meta Res. 0312: ≥ 85%</span>
          </div>
        </div>
      </div>

      {/* VIEW TAB 1: 12-Month Matrix Schedule */}
      {moduleTab === 'CRONOGRAMA' && (
        <CronogramaAnualMatriz
          planes={planes}
          hazards={hazards}
          company={company}
          onSelectPlan={handleSelectPlanFromMatrix}
          onRefreshData={refreshData}
        />
      )}

      {/* VIEW TAB 2: Session Execution & Individual Grade Grid */}
      {moduleTab === 'SESION' && activePlan && activeSesion && (
        <div className="space-y-5">
          {/* Session Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-sm sm:text-base font-black px-3.5 py-1.5 bg-blue-100 text-blue-900 rounded-lg">
                    {activePlan.codigo}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {activePlan.tema}
                  </h2>
                  <span
                    className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-full ${
                      activeSesion.estadoActa === 'FIRMADA' || activeSesion.estadoActa === 'CONVALIDADA'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : activeSesion.estadoActa === 'REABIERTA'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    Acta: {activeSesion.estadoActa}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-4xl">{activePlan.objetivo}</p>
                <div className="flex items-center gap-x-5 gap-y-2 text-sm text-slate-600 pt-1 flex-wrap">
                  <span>
                    <strong className="text-slate-900">Área:</strong> {activePlan.areaDirigida}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>
                    <strong className="text-slate-900">Modalidad:</strong> {activePlan.modalidad.replace(/_/g, ' ')}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>
                    <strong className="text-slate-900">Instructor:</strong> {activeSesion.capacitadorNombre} ({activeSesion.capacitadorEntidad})
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>
                    <strong className="text-slate-900">Fecha:</strong> {activeSesion.fechaEjecucion || activePlan.fechaProgramada}
                  </span>
                </div>
              </div>

              {/* Action Toolbar with generous width and no clipping */}
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full lg:w-auto pt-2 lg:pt-0">
                {/* Evidence Modal Button */}
                <button
                  type="button"
                  onClick={() => setIsEvidenciasOpen(true)}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shadow-2xs"
                >
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  <span>Evidencias ({activeEvidencias.length})</span>
                </button>

                {/* Audit Modal Button */}
                <button
                  type="button"
                  onClick={() => setIsAuditoriaOpen(true)}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shadow-2xs"
                >
                  <History className="w-4 h-4 text-slate-600" />
                  <span>Auditoría</span>
                </button>

                {/* Print Acta Official */}
                <button
                  type="button"
                  onClick={() => handlePrint('ACTA_OFICIAL')}
                  className="px-3 sm:px-4.5 py-2 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Acta</span>
                </button>

                {/* Print Lista de Asistencia (sin notas) */}
                <button
                  type="button"
                  onClick={() => handlePrint('LISTA_ASISTENCIA')}
                  className="px-3 sm:px-4.5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <FileText className="w-4 h-4" />
                  <span>Planilla de Campo</span>
                </button>
              </div>
            </div>

            {/* Execution / Signing Bar */}
            <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 p-3 sm:p-3.5 rounded-xl">
              <div className="flex items-center gap-3 text-xs sm:text-sm">
                <span className="font-bold text-slate-700">Estado de Ejecución:</span>
                {activePlan.estado === 'EJECUTADA' ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                    EJECUTADA Y EVALUADA
                  </span>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <span className="text-amber-700 font-bold">EN PROCESO / PROGRAMADA</span>
                    {canExecuteSession(activeSesion).allowed && (
                      <button
                        type="button"
                        onClick={handleExecuteSession}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer"
                      >
                        Marcar como EJECUTADA
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Digital Signature Blocks */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Trainer Signature */}
                {activeSesion.firmaCapacitador ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Firmada por Capacitador</span>
                  </span>
                ) : (
                  canSignActa(activeSesion, 'CAPACITADOR').allowed && (
                    <button
                      type="button"
                      onClick={handleSignCapacitador}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Firmar como Capacitador</span>
                    </button>
                  )
                )}

                {/* SST Manager Signature */}
                {activeSesion.firmaResponsableSST ? (
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Convalidada por Responsable SST</span>
                  </span>
                ) : (
                  canSignActa(activeSesion, 'RESPONSABLE').allowed && (
                    <button
                      type="button"
                      onClick={handleSignResponsable}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Convalidar Acta (SST)</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Editable Grades & Attendance Grid */}
          <EditableGradesGrid
            plan={activePlan}
            sesion={activeSesion}
            asistencias={activeAsistencias}
            onOpenAuditoria={() => setIsAuditoriaOpen(true)}
            onOpenReapertura={() => setIsReaperturaOpen(true)}
            onDataChanged={refreshData}
          />
        </div>
      )}

      {/* VIEW TAB 3: Reports and Print Hub */}
      {moduleTab === 'IMPRESION' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Centro de Impresión y Generación de Informes Normativos
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-4xl leading-relaxed">
              Las plantillas cumplen los requisitos de inspección del Ministerio del Trabajo, ARL SURA y
              Decreto 1072/2015. Al imprimir, se generan documentos aislados y limpios sin fondos oscuros ni botones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Template 1: Acta Oficial */}
            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-base shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Acta Oficial de Capacitación y Evaluación</h3>
                  <span className="text-xs text-slate-500 font-medium">Formato formal completo con notas y firmas</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Incluye encabezado institucional, matriz nominal de asistentes, calificaciones individuales,
                cálculo de eficacia y firmas digitales con hash.
              </p>
              <button
                type="button"
                onClick={() => handlePrint('ACTA_OFICIAL')}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Acta Oficial ({activePlan?.codigo})</span>
              </button>
            </div>

            {/* Template 2: Lista de Asistencia sin notas */}
            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-base shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Planilla de Asistencia Física (En Campo)</h3>
                  <span className="text-xs font-bold text-emerald-700">
                    Estrictamente sin columna de notas
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Diseñada para imprimir en tabla con renglones limpios y líneas de firma física para el registro
                autógrafo de operarios en talleres o fosas.
              </p>
              <button
                type="button"
                onClick={() => handlePrint('LISTA_ASISTENCIA')}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Planilla de Asistencia (Sin Notas)</span>
              </button>
            </div>

            {/* Template 3: Cronograma Anual Horizontal */}
            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-base shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Cronograma Anual de Capacitación (Horizontal)</h3>
                  <span className="text-xs text-slate-500 font-medium">Matriz anual de 12 meses para auditoría</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Formato apaisado (landscape) con el consolidado cronológico de actividades, peligros vinculados,
                estados legales y firmas de aprobación de Gerencia.
              </p>
              <button
                type="button"
                onClick={() => handlePrint('CRONOGRAMA_ANUAL')}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Cronograma Anual 2025</span>
              </button>
            </div>

            {/* Template 4: Reporte de Cobertura y Eficacia */}
            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-base shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Informe Ejecutivo de Cobertura y Eficacia</h3>
                  <span className="text-xs text-slate-500 font-medium">Tablero de indicadores SG-SST</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Consolidado estadístico con horas hombre de entrenamiento, porcentaje global de cobertura y estado
                de cumplimiento de metas formativas.
              </p>
              <button
                type="button"
                onClick={() => handlePrint('REPORTE_COBERTURA')}
                className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Informe de Indicadores</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}

      {/* 1. Modal Auditoría de Notas */}
      {activeSesion && activePlan && (
        <AuditoriaCalificacionesModal
          isOpen={isAuditoriaOpen}
          onClose={() => setIsAuditoriaOpen(false)}
          auditorias={activeAuditorias}
          codigoSesion={activePlan.codigo}
        />
      )}

      {/* 2. Modal Carga de Evidencias (Magic Bytes & Quota) */}
      {activeSesion && activePlan && (
        <CargaEvidenciasModal
          isOpen={isEvidenciasOpen}
          onClose={() => setIsEvidenciasOpen(false)}
          sesion={activeSesion}
          plan={activePlan}
          evidencias={activeEvidencias}
          onEvidenciasChanged={refreshData}
        />
      )}

      {/* 3. Modal Reapertura de Acta (Exclusivo Administrador) */}
      {activeSesion && activePlan && (
        <ReaperturaActaModal
          isOpen={isReaperturaOpen}
          onClose={() => setIsReaperturaOpen(false)}
          sesion={activeSesion}
          codigoCapacitacion={activePlan.codigo}
          onReopened={refreshData}
        />
      )}

      {/* 4. Modal Oficial de Vista Previa e Impresión SG-SST */}
      <DocumentoImpresionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        template={activePrintTemplate}
        plan={activePlan}
        sesion={activeSesion}
        asistencias={activeAsistencias}
        planes={planes}
        company={company}
        hazards={hazards}
      />
    </div>
  );
}
