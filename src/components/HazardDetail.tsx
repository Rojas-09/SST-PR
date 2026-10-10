import { useState } from 'react';
import { ArrowLeft, FileCheck, LayoutGrid, Edit3, AlertOctagon, CheckSquare, Clock, ShieldAlert, Check, Camera } from 'lucide-react';
import { HazardRecord, CompanyInfo, ActiveView } from '../types';
import { CompactSeverityTable } from './Gtc45MatrixGrid';
import { ConstanciaTecnicaCard } from './ConstanciaTecnicaCard';
import { safePrint } from '../utils/browserSafe';

interface HazardDetailProps {
  hazard: HazardRecord;
  company: CompanyInfo;
  onBack: () => void;
  onNavigate: (view: ActiveView) => void;
  onUpdateHazard: (updated: HazardRecord) => void;
  onOpenActaModal: () => void;
  onUpdateCompany?: (updated: CompanyInfo) => void;
}

export function HazardDetail({
  hazard,
  company,
  onBack,
  onNavigate,
  onUpdateHazard,
  onOpenActaModal,
  onUpdateCompany,
}: HazardDetailProps) {
  const [copiedId, setCopiedId] = useState(false);

  const toggleEppCheck = (eppId: string) => {
    const updatedItems = hazard.planIntervencion.epp.items.map((item) =>
      item.id === eppId ? { ...item, checked: !item.checked } : item
    );
    const updated = {
      ...hazard,
      planIntervencion: {
        ...hazard.planIntervencion,
        epp: {
          ...hazard.planIntervencion.epp,
          items: updatedItems,
        },
      },
    };
    onUpdateHazard(updated);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(hazard.code);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const isLevelOne = hazard.evaluacion.level === 'NIVEL_I';

  return (
    <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 md:px-8 xl:px-10 py-5 sm:py-6 space-y-6 font-sans text-sm sm:text-base text-slate-800">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-normal">
        <div className="flex items-center gap-2 text-slate-500">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a Gestión de Peligros
          </button>
          <span>/</span>
          <span>Peligros</span>
          <span>/</span>
          <span>Ficha Técnica</span>
          <span>/</span>
          <span className="text-slate-800 font-bold">{hazard.code}</span>
        </div>

        <div className="text-xs font-normal text-slate-500 flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
          Decreto 1072/2015 • Res. 0312/2019 • GTC 45:2012
        </div>
      </div>

      {/* Main Hazard Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs relative">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 text-[12.5px] font-medium rounded flex items-center gap-1.5 shadow-2xs ${
                isLevelOne ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
              }`}
            >
              <AlertOctagon className="w-4 h-4" />
              {hazard.evaluacion.levelText} • NP {hazard.evaluacion.np} × NC {hazard.evaluacion.nc} = {hazard.evaluacion.nr}
            </span>

            <span className="px-2.5 py-1 text-[12.5px] font-normal rounded bg-red-50 text-red-700 border border-red-200">
              {hazard.evaluacion.aceptabilidad}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => safePrint()}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[13px] font-normal rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <FileCheck className="w-4 h-4 text-slate-500" /> Imprimir Ficha
            </button>
            <button
              onClick={() => onNavigate('matriz-gtc45')}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[13px] font-normal rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <LayoutGrid className="w-4 h-4 text-slate-500" /> Ver en Matriz
            </button>
            <button
              onClick={() => onNavigate('registrar-nuevo')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-normal rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Edit3 className="w-4 h-4 text-white" /> Editar Peligro
            </button>
          </div>
        </div>

        {/* Hazard Title & Subtitle */}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="text-[12px] font-normal text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              title="Copiar código"
            >
              Código: <span className="font-medium text-slate-700">{hazard.code}</span> {copiedId ? '(Copiado!)' : ''}
            </button>
            <span className="text-slate-300">•</span>
            <span className="text-[12px] font-normal text-slate-500">{hazard.macroproceso}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 leading-tight">
            {hazard.title}
          </h1>
          <p className="text-slate-600 text-[13px] font-normal mt-2 max-w-4xl leading-relaxed">
            {hazard.subtitle}
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Operational Context, Hazards, Current Controls) - 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Localización y Contexto Operativo */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Localización y Contexto Operativo
              </h3>
              <span className="text-[12px] font-normal text-slate-500">Módulo de Planta 1</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-[13px]">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                <span className="text-[11.5px] text-slate-500 block font-normal">
                  RAZÓN SOCIAL & CENTRO
                </span>
                <span className="font-medium text-slate-800 block mt-0.5">{company.name}</span>
                <span className="text-[12px] text-slate-500 font-normal">{company.sede}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                <span className="text-[11.5px] text-slate-500 block font-normal">
                  ÁREA / PROCESO
                </span>
                <span className="font-medium text-slate-800 block mt-0.5">{hazard.zonaLugar}</span>
                <span className="text-[12px] text-slate-500 font-normal">{hazard.proceso}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                <span className="text-[11.5px] text-slate-500 block font-normal">
                  ACTIVIDAD ESPECÍFICA
                </span>
                <span className="text-slate-800 font-normal block mt-0.5 leading-snug">
                  {hazard.actividadEspecifica}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 flex flex-col justify-between">
                <div>
                  <span className="text-[11.5px] text-slate-500 block font-normal">
                    NATURALEZA & FRECUENCIA
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="font-normal text-slate-800">
                      {hazard.rutinaria ? 'Rutinaria (Diaria - Jornada 8h)' : 'Ocasional / Emergencia'}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-[12px] text-slate-600 font-normal">
                  Operarios directos expuestos:{' '}
                  <span className="text-slate-900 font-medium">{hazard.operariosExpuestos} trabajadores</span>
                </div>
              </div>
            </div>

            {/* Photographic Evidence verified */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-normal text-slate-600 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-slate-400" /> Evidencia fotográfica de la inspección de campo
                </span>
                <span className="text-[12px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded font-normal border border-emerald-200">
                  {hazard.evidenciaFotos.length} capturas verificadas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {hazard.evidenciaFotos.map((foto, idx) => (
                  <div key={idx} className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900 shadow-2xs">
                    <div className="w-full h-44 sm:h-48 bg-slate-950 overflow-hidden relative">
                      <img
                        src={foto.url}
                        alt={foto.caption}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-2.5 bg-slate-900 text-white border-t border-slate-800">
                      <p className="text-xs font-medium leading-snug text-slate-100">
                        {foto.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Factor de Peligro & Daño a la Salud */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Factor de Peligro & Daño a la Salud
              </h3>
              <span className="text-[12px] px-2.5 py-0.5 bg-red-50 text-red-700 font-normal rounded-md border border-red-100">
                GTC 45: Clasificación Dual
              </span>
            </div>

            <div className="space-y-3 text-[13px]">
              <div>
                <span className="text-[11.5px] text-slate-500 block font-normal mb-1">
                  CLASIFICACIÓN MATRIZ GTC 45:
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-md font-normal border border-blue-200">
                    Peligro Físico (Radiación No Ionizante UV / IR)
                  </span>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-900 rounded-md font-normal border border-amber-200">
                    Peligro Mecánico (Proyección de partículas)
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 text-slate-700 font-normal leading-relaxed">
                {hazard.descripcionDetallada}
              </div>

              {/* Patologías Previstas */}
              <div className="pt-2">
                <span className="text-[12px] text-slate-600 font-normal block mb-2">
                  Efectos y Patologías Ocupacionales Previstas:
                </span>
                <div className="space-y-2">
                  {hazard.patologiasPrevistas?.map((pat, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5 p-2.5 bg-red-50/40 border border-red-100 rounded-lg text-[13px]">
                      <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-red-900 font-medium">{pat.titulo}: </span>
                        <span className="text-slate-700 font-normal">{pat.descripcion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Controles Existentes en Planta */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Controles Existentes en Planta (Estado Actual)
              </h3>
              <span className="text-[12px] text-red-600 font-normal">
                Deficientes / Inoperantes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[13px]">
              {/* Fuente */}
              <div className="p-3 rounded-lg border border-red-200 bg-red-50/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-slate-700 font-medium">EN LA FUENTE</span>
                    <span className="text-[11px] px-1.5 py-0.5 bg-red-600 text-white rounded font-normal">
                      {hazard.controles.fuente.status}
                    </span>
                  </div>
                  <p className="text-slate-700 text-[12px] font-normal leading-relaxed">
                    {hazard.controles.fuente.description}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-red-200/60 text-[11.5px] text-red-700">
                  ✕ Sin mitigación activa
                </div>
              </div>

              {/* Medio */}
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-slate-700 font-medium">EN EL MEDIO</span>
                    <span className="text-[11px] px-1.5 py-0.5 bg-amber-600 text-white rounded font-normal">
                      {hazard.controles.medio.status}
                    </span>
                  </div>
                  <p className="text-slate-700 text-[12px] font-normal leading-relaxed">
                    {hazard.controles.medio.description}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-amber-200/60 text-[11.5px] text-amber-800">
                  ! Cobertura menor al 30%
                </div>
              </div>

              {/* Trabajador / EPP */}
              <div className="p-3 rounded-lg border border-red-300 bg-red-100/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-slate-700 font-medium">EN EL TRABAJADOR</span>
                    <span className="text-[11px] px-1.5 py-0.5 bg-red-700 text-white rounded font-normal">
                      {hazard.controles.individuo.status}
                    </span>
                  </div>
                  <p className="text-slate-700 text-[12px] font-normal leading-relaxed">
                    {hazard.controles.individuo.description}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-red-300/60 text-[11.5px] text-red-800">
                  ⊗ Falso sentido de seguridad
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (GTC 45 Risk Evaluation, Plan de Intervención, Legal Signature) - 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Evaluación GTC 45 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Evaluación GTC 45 (Colombia)
              </h3>
              <span className="text-[12px] font-normal text-slate-500">NP × NC = NR</span>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[11.5px] text-slate-500 block font-normal">
                    NIVEL DE PROBABILIDAD (NP)
                  </span>
                  <span className="text-slate-700 text-[12.5px] font-normal">Exposición continua en jornada</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-slate-900">{hazard.evaluacion.np}</span>
                  <span className="block text-[11px] text-red-600 font-normal">MUY ALTA</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[11.5px] text-slate-500 block font-normal">
                    NIVEL DE SEVERIDAD / CONSECUENCIA (NC)
                  </span>
                  <span className="text-slate-700 text-[12.5px] font-normal">Incapacidad laboral severa</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-slate-900">{hazard.evaluacion.nc}</span>
                  <span className="block text-[11px] text-red-600 font-normal">GRAVE</span>
                </div>
              </div>

              {/* Big Red Risk Card */}
              <div className="bg-red-600 text-white p-4 rounded-xl shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[12px] text-red-100 block font-normal">
                      NIVEL DE RIESGO RESULTANTE (NR)
                    </span>
                    <h4 className="text-base font-bold tracking-tight">
                      {hazard.evaluacion.levelText}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black leading-none">{hazard.evaluacion.nr}</span>
                    <span className="block text-[11px] text-red-100">Puntaje / 25</span>
                  </div>
                </div>
              </div>

              {/* Obligación Normativa Inmediata */}
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-900 text-[12.5px] leading-relaxed">
                <div className="flex items-center gap-1.5 font-medium text-red-800 mb-1">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Obligación Normativa Inmediata</span>
                </div>
                <p className="text-[12px] text-red-950 font-normal">
                  De acuerdo con la GTC 45 y el Decreto 1072/2015, una calificación en Nivel I exige la suspensión temporal o controles prioritarios hasta formalizar la entrega de EPP homologados.
                </p>
              </div>

              {/* Mini Cuadrícula */}
              <CompactSeverityTable currentNp={hazard.evaluacion.np} currentNc={hazard.evaluacion.nc} />
            </div>
          </div>

          {/* Card 2: Plan de Intervención Obligatorio */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Plan de Intervención Obligatorio
              </h3>
              <span className="text-[12px] font-normal text-slate-500">Jerarquía de Controles</span>
            </div>

            <div className="space-y-3.5 text-[13px]">
              {/* Medida 1: Administrativa */}
              <div className="p-3 bg-red-50/50 border border-red-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white bg-red-600 px-2 py-0.5 rounded font-normal">
                    1. Medida Administrativa Inmediata
                  </span>
                  <span className="text-[11.5px] text-red-700 font-normal">
                    {hazard.planIntervencion.administrativa.estado}
                  </span>
                </div>
                <h5 className="font-semibold text-slate-900 text-[13px] mt-1">
                  {hazard.planIntervencion.administrativa.titulo}
                </h5>
                <p className="text-[12.5px] font-normal text-slate-700 leading-relaxed">
                  {hazard.planIntervencion.administrativa.descripcion}
                </p>
              </div>

              {/* Medida 2: EPP (Interactive checkboxes) */}
              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-amber-900 bg-amber-200 px-2 py-0.5 rounded font-normal">
                    2. Equipos de Protección Personal (EPP)
                  </span>
                  <span className="text-[11.5px] text-amber-800 font-normal">
                    {hazard.planIntervencion.epp.prioridad}
                  </span>
                </div>
                <h5 className="font-semibold text-slate-900 text-[13px] mt-1">
                  {hazard.planIntervencion.epp.titulo}
                </h5>

                <div className="mt-2 space-y-1.5">
                  {hazard.planIntervencion.epp.items.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start gap-2.5 p-1.5 hover:bg-amber-100/50 rounded cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleEppCheck(item.id)}
                        className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-600 border-slate-300 cursor-pointer"
                      />
                      <span className={`text-[12.5px] font-normal leading-snug ${item.checked ? 'text-slate-800' : 'text-slate-500 line-through opacity-70'}`}>
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Medida 3: Control de Ingeniería */}
              <div className="p-3 bg-blue-50/40 border border-blue-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-blue-900 bg-blue-100 px-2 py-0.5 rounded font-normal">
                    3. Control de Ingeniería
                  </span>
                  <span className="text-[11.5px] text-blue-800 font-normal">
                    {hazard.planIntervencion.ingenieria.fase}
                  </span>
                </div>
                <h5 className="font-semibold text-slate-900 text-[13px] mt-1">
                  {hazard.planIntervencion.ingenieria.titulo}
                </h5>
                <p className="text-[12.5px] font-normal text-slate-700 leading-relaxed">
                  {hazard.planIntervencion.ingenieria.descripcion}
                </p>
              </div>

              {/* Plazo legal */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[12.5px] gap-2">
                <div>
                  <span className="text-slate-500 block font-normal">Responsable:</span>
                  <span className="font-medium text-slate-800">
                    {hazard.planIntervencion.responsable}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-red-600 block flex items-center justify-end gap-1 font-normal">
                    <Clock className="w-3.5 h-3.5" /> Plazo Límite Legal:
                  </span>
                  <span className="font-medium text-red-700">
                    {hazard.planIntervencion.plazoLegal}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Trazabilidad Legal y Firma de Auditoría */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <FileCheck className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-semibold text-slate-900">
                Trazabilidad Legal y Firma de Auditoría
              </h3>
            </div>

            <p className="text-[13px] font-normal text-slate-600 leading-relaxed">
              Registrado bajo cumplimiento estricto de la Resolución 0312 de 2019 (Estándares Mínimos) y Decreto 1072 de 2015 del Ministerio del Trabajo de Colombia.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-[12.5px]">
              <div>
                <span className="text-slate-500 block font-normal text-[11.5px]">
                  AUDITOR TITULAR:
                </span>
                <span className="font-medium text-slate-900 block">{company.responsableSST.nombre}</span>
                <span className="text-slate-500 font-normal">Lic. {company.responsableSST.licencia}</span>
              </div>

              <div className="text-right">
                <span className="text-slate-500 block font-normal text-[11.5px]">
                  ESTADO DE VALIDACIÓN:
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-normal ${
                    hazard.estadoEntregaEPP === 'FIRMADA' ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current" />
                  {hazard.estadoEntregaEPP === 'FIRMADA' ? 'Acta Firmada & Archivada' : 'Pendiente Firma de Entrega'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenActaModal}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-normal rounded-lg text-[13px] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <CheckSquare className="w-4 h-4 text-white" />
                <span>
                  {hazard.estadoEntregaEPP === 'FIRMADA'
                    ? 'Ver Acta de Entrega EPP Foliada'
                    : 'Registrar Acta de Entrega EPP'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Constancia Técnica y Responsabilidad Jurídica */}
      <ConstanciaTecnicaCard company={company} onUpdateCompany={onUpdateCompany} />
    </div>
  );
}
