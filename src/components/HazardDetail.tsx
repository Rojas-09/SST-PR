import { useState } from 'react';
import { ArrowLeft, FileCheck, LayoutGrid, Edit3, AlertOctagon, CheckSquare, Clock, ShieldAlert, Check, Camera } from 'lucide-react';
import { HazardRecord, CompanyInfo, ActiveView } from '../types';
import { CompactSeverityTable } from './Gtc45MatrixGrid';

interface HazardDetailProps {
  hazard: HazardRecord;
  company: CompanyInfo;
  onBack: () => void;
  onNavigate: (view: ActiveView) => void;
  onUpdateHazard: (updated: HazardRecord) => void;
  onOpenActaModal: () => void;
}

export function HazardDetail({
  hazard,
  company,
  onBack,
  onNavigate,
  onUpdateHazard,
  onOpenActaModal,
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-sans">
          <button
            onClick={onBack}
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-[#D97706] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver a Peligros
          </button>
          <span>/</span>
          <span>Peligros</span>
          <span>/</span>
          <span>Detalle</span>
          <span>/</span>
          <span className="font-mono text-slate-800 font-semibold">{hazard.id}</span>
        </div>

        <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Decreto 1072/2015 • Res. 0312/2019
        </div>
      </div>

      {/* Main Hazard Header Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs relative">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-1 text-xs font-mono font-bold uppercase rounded flex items-center gap-1.5 shadow-2xs ${
                isLevelOne ? 'bg-[#DC2626] text-white' : 'bg-[#EA580C] text-white'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              {hazard.evaluacion.levelText} • NP {hazard.evaluacion.np} × NC {hazard.evaluacion.nc} = {hazard.evaluacion.nr}/25
            </span>

            <span className="px-2.5 py-1 text-xs font-mono font-medium rounded bg-red-50 text-red-700 border border-red-200">
              {hazard.evaluacion.aceptabilidad}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <FileCheck className="w-3.5 h-3.5 text-slate-500" /> Ficha Técnica
            </button>
            <button
              onClick={() => onNavigate('matriz-gtc45')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-slate-500" /> Ver en Matriz
            </button>
            <button
              onClick={() => onNavigate('registrar-nuevo')}
              className="px-3 py-1.5 bg-[#8D4B00] hover:bg-[#6E3900] text-white text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-white" /> Editar Peligro
            </button>
          </div>
        </div>

        {/* Hazard Title & Subtitle */}
        <div className="mt-4">
          <button
            onClick={handleCopyCode}
            className="text-[11px] font-mono text-slate-500 uppercase tracking-wider hover:text-slate-800 transition-colors"
            title="Copiar código"
          >
            ID: <span className="font-semibold text-slate-700">{hazard.code}</span> {copiedId ? '(Copiado!)' : ''}
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 leading-tight font-chivo">
            {hazard.title}
          </h1>
          <p className="text-slate-600 text-sm mt-2 max-w-4xl leading-relaxed">
            {hazard.subtitle}
          </p>
        </div>
      </div>

      {/* Two Column Layout matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Operational Context, Hazards, Current Controls) - 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Localización y Contexto Operativo */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-amber-600 font-bold">📍</span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide font-chivo">
                  Localización y Contexto Operativo
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">MÓDULO A - PLANTA 1</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                  RAZÓN SOCIAL & CENTRO
                </span>
                <span className="font-bold text-slate-800 block mt-0.5">{company.name}</span>
                <span className="text-[11px] text-slate-500">{company.sede}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                  ÁREA / PROCESO
                </span>
                <span className="font-bold text-slate-800 block mt-0.5">{hazard.zonaLugar}</span>
                <span className="text-[11px] text-slate-500">Mecánica Pesada y Estructuras</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                  ACTIVIDAD ESPECÍFICA
                </span>
                <span className="text-slate-800 block mt-0.5 leading-snug">
                  {hazard.actividadEspecifica}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-100 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                    NATURALEZA & FRECUENCIA
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="font-semibold text-slate-800">
                      {hazard.rutinaria ? 'Rutinaria (Diaria - Jornada 8h)' : 'Ocasional / Emergencia'}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 font-mono">
                  Operarios directos expuestos:{' '}
                  <strong className="text-slate-800 text-xs">{hazard.operariosExpuestos} trabajadores</strong>
                </div>
              </div>
            </div>

            {/* Photographic Evidence verified */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-slate-400" /> EVIDENCIA FOTOGRÁFICA DE LA INSPECCIÓN DE CAMPO
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                  {hazard.evidenciaFotos.length} capturas verificadas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hazard.evidenciaFotos.map((foto, idx) => (
                  <div key={idx} className="group relative rounded border border-slate-200 overflow-hidden bg-slate-900">
                    <img
                      src={foto.url}
                      alt={foto.caption}
                      referrerPolicy="no-referrer"
                      className="w-full h-36 object-cover object-center group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2.5">
                      <p className="text-[11px] text-white font-sans leading-tight line-clamp-2">
                        {foto.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Factor de Peligro & Daño a la Salud */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-bold">🩺</span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide font-chivo">
                  Factor de Peligro & Daño a la Salud
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-red-50 text-red-700 font-bold rounded border border-red-100">
                GTC 45: Clasificación Dual
              </span>
            </div>

            {/* Clasificación tags */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold mb-1">
                  CLASIFICACIÓN MATRIZ GTC 45:
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-50 text-blue-800 rounded font-medium border border-blue-200">
                    Peligro Físico (Radiación No Ionizante UV / IR)
                  </span>
                  <span className="px-2 py-1 bg-amber-50 text-amber-900 rounded font-medium border border-amber-200">
                    Peligro Mecánico (Proyección de partículas)
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-100 text-slate-700 leading-relaxed">
                {hazard.descripcionDetallada}
              </div>

              {/* Patologías Previstas */}
              <div className="pt-2">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-2">
                  Efectos y Patologías Ocupacionales Previstas
                </span>
                <div className="space-y-2">
                  {hazard.patologiasPrevistas?.map((pat, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5 p-2 bg-red-50/50 border border-red-100 rounded text-xs">
                      <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-red-900 font-semibold">{pat.titulo}: </strong>
                        <span className="text-slate-700">{pat.descripcion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Controles Existentes en Planta */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-700 font-bold">🛡️</span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide font-chivo">
                  Controles Existentes en Planta (Estado Actual)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-red-600 font-semibold">
                Deficientes / Inoperantes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Fuente */}
              <div className="p-3 rounded border border-red-200 bg-red-50/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-700">EN LA FUENTE</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-red-600 text-white rounded">
                      {hazard.controles.fuente.status}
                    </span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    {hazard.controles.fuente.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-red-200/60 text-[10px] font-mono text-red-700 flex items-center gap-1">
                  <span>✕ Sin mitigación activa</span>
                </div>
              </div>

              {/* Medio */}
              <div className="p-3 rounded border border-amber-200 bg-amber-50/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-700">EN EL MEDIO</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-amber-600 text-white rounded">
                      {hazard.controles.medio.status}
                    </span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    {hazard.controles.medio.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-200/60 text-[10px] font-mono text-amber-800 flex items-center gap-1">
                  <span>! Cobertura menor al 30%</span>
                </div>
              </div>

              {/* Trabajador / EPP */}
              <div className="p-3 rounded border border-red-300 bg-red-100/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-700">EN EL TRABAJADOR</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-red-700 text-white rounded">
                      {hazard.controles.individuo.status}
                    </span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    {hazard.controles.individuo.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-red-300/60 text-[10px] font-mono text-red-800 flex items-center gap-1">
                  <span>⊗ Falso sentido de seguridad</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (GTC 45 Risk Evaluation, Plan de Intervención, Legal Signature) - 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Evaluación GTC 45 */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-800 font-bold font-mono">⊞</span>
                <h3 className="text-sm font-bold text-slate-900 font-chivo">
                  Evaluación GTC 45 (Colombia)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">NP × NC = NR</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-100">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                    NIVEL DE PROBABILIDAD (NP)
                  </span>
                  <span className="text-slate-700 text-[11px]">Exposición continua en jornada completa</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold font-mono text-slate-900">{hazard.evaluacion.np}</span>
                  <span className="block text-[9px] font-mono uppercase text-red-600 font-bold">MUY ALTA</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-100">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                    NIVEL DE SEVERIDAD / CONSECUENCIA (NC)
                  </span>
                  <span className="text-slate-700 text-[11px]">Lesiones o incapacidad laboral permanente parcial</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold font-mono text-slate-900">{hazard.evaluacion.nc}</span>
                  <span className="block text-[9px] font-mono uppercase text-red-600 font-bold">GRAVE</span>
                </div>
              </div>

              {/* Big Red Risk Card matching screenshot */}
              <div className="bg-[#B91C1C] text-white p-4 rounded-md shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-red-200 block">
                      NIVEL DE RIESGO RESULTANTE (NR)
                    </span>
                    <h4 className="text-lg font-black tracking-wide font-chivo">
                      {hazard.evaluacion.levelText}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black font-mono leading-none">{hazard.evaluacion.nr}</span>
                    <span className="block text-[9px] font-mono text-red-200">Puntaje / 25</span>
                  </div>
                </div>
              </div>

              {/* Obligación Normativa Inmediata */}
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-900 text-xs leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold font-chivo text-red-800 mb-1">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Obligación Normativa Inmediata</span>
                </div>
                <p className="text-[11px] text-red-950">
                  De acuerdo con la <strong>GTC 45</strong> y el <strong>Decreto 1072/2015</strong>, una calificación en <strong>Nivel I</strong> exige la <strong>suspensión temporal de la labor</strong> hasta que se adopten los controles indispensables y se emita el acta de entrega formal de EPP homologados.
                </p>
              </div>

              {/* Mini Cuadrícula */}
              <CompactSeverityTable currentNp={hazard.evaluacion.np} currentNc={hazard.evaluacion.nc} />
            </div>
          </div>

          {/* Card 2: Plan de Intervención Obligatorio */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-amber-600 font-bold">📋</span>
                <h3 className="text-sm font-bold text-slate-900 font-chivo">
                  Plan de Intervención Obligatorio
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Jerarquía de Controles</span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Medida 1: Administrativa */}
              <div className="p-3 bg-red-50/70 border border-red-200 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-white bg-red-600 px-1.5 py-0.5 rounded">
                    1. Medida Administrativa Inmediata
                  </span>
                  <span className="text-[10px] font-mono text-red-700 font-semibold">
                    {hazard.planIntervencion.administrativa.estado}
                  </span>
                </div>
                <h5 className="font-bold text-slate-900 text-xs mt-1">
                  {hazard.planIntervencion.administrativa.titulo}
                </h5>
                <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">
                  {hazard.planIntervencion.administrativa.descripcion}
                </p>
              </div>

              {/* Medida 2: EPP (Interactive checkboxes!) */}
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-200 px-1.5 py-0.5 rounded">
                    2. Equipos de Protección Personal (EPP)
                  </span>
                  <span className="text-[10px] font-mono text-amber-800 font-semibold">
                    {hazard.planIntervencion.epp.prioridad}
                  </span>
                </div>
                <h5 className="font-bold text-slate-900 text-xs mt-1">
                  {hazard.planIntervencion.epp.titulo}
                </h5>

                <div className="mt-2 space-y-1.5">
                  {hazard.planIntervencion.epp.items.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start gap-2 p-1.5 hover:bg-amber-100/50 rounded cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleEppCheck(item.id)}
                        className="mt-0.5 w-4 h-4 rounded text-[#D97706] focus:ring-[#D97706] border-slate-300 cursor-pointer"
                      />
                      <span className={`text-[11px] leading-snug ${item.checked ? 'text-slate-800 font-medium' : 'text-slate-600 line-through opacity-70'}`}>
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Medida 3: Control de Ingeniería */}
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-200 px-1.5 py-0.5 rounded">
                    3. Control de Ingeniería
                  </span>
                  <span className="text-[10px] font-mono text-blue-800 font-semibold">
                    {hazard.planIntervencion.ingenieria.fase}
                  </span>
                </div>
                <h5 className="font-bold text-slate-900 text-xs mt-1">
                  {hazard.planIntervencion.ingenieria.titulo}
                </h5>
                <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">
                  {hazard.planIntervencion.ingenieria.descripcion}
                </p>
              </div>

              {/* Plazo legal */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs gap-2">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">Responsable de Cumplimiento:</span>
                  <span className="font-semibold text-slate-800 text-[11px]">
                    {hazard.planIntervencion.responsable}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-red-600 block flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" /> Plazo Límite Legal:
                  </span>
                  <span className="font-mono font-bold text-red-700 text-xs">
                    {hazard.planIntervencion.plazoLegal}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Trazabilidad Legal y Firma de Auditoría */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <FileCheck className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900 font-chivo">
                Trazabilidad Legal y Firma de Auditoría
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Registrado bajo cumplimiento estricto de la Resolución 0312 de 2019 (Estándares Mínimos) y Decreto 1072 de 2015 del Ministerio del Trabajo de Colombia.
            </p>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase font-semibold">
                  AUDITOR TITULAR:
                </span>
                <span className="font-bold text-slate-900 block">{company.responsableSST.nombre}</span>
                <span className="text-[11px] font-mono text-slate-500">Lic. {company.responsableSST.licencia}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block uppercase font-semibold">
                  ESTADO DE VALIDACIÓN:
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold ${
                    hazard.estadoEntregaEPP === 'FIRMADA' ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current" />
                  {hazard.estadoEntregaEPP === 'FIRMADA' ? 'Acta Firmada & Archivada' : 'Pendiente Firma de Entrega'}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={onOpenActaModal}
                className="w-full py-2.5 px-4 bg-[#1E293B] hover:bg-[#0F172A] text-white font-semibold rounded text-xs tracking-wide flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <CheckSquare className="w-4 h-4 text-amber-400" />
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
    </div>
  );
}
