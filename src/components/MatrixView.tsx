import { useState, useMemo } from 'react';
import {
  Printer,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Building,
  Filter,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { HazardRecord, CompanyInfo, ActiveView } from '../types';
import { SignatureCarlosMendez, SignatureRodrigoGomez, QrAuditStamp } from './SignatureSvgs';

interface MatrixViewProps {
  hazards: HazardRecord[];
  company: CompanyInfo;
  onSelectHazard: (hazard: HazardRecord) => void;
  onNavigate: (view: ActiveView) => void;
}

export function MatrixView({
  hazards,
  company,
  onSelectHazard,
  onNavigate,
}: MatrixViewProps) {
  const [filterProceso, setFilterProceso] = useState('ALL');
  const [filterNivel, setFilterNivel] = useState('ALL');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Grouped and filtered hazards
  const filteredHazards = useMemo(() => {
    return hazards.filter((h) => {
      if (filterProceso !== 'ALL' && h.proceso !== filterProceso) return false;
      if (filterNivel !== 'ALL' && h.evaluacion.level !== filterNivel) return false;
      return true;
    });
  }, [hazards, filterProceso, filterNivel]);

  // Counts
  const totalCount = hazards.length;
  const criticalCount = hazards.filter((h) => h.evaluacion.level === 'NIVEL_I').length;
  const improvedCount = hazards.filter((h) => h.evaluacion.level === 'NIVEL_II' || h.evaluacion.level === 'NIVEL_III').length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    // Generate clean CSV download
    const headers = [
      'Código',
      'Macroproceso',
      'Proceso',
      'Zona/Lugar',
      'Actividad',
      'Rutinaria',
      'Peligro General',
      'Factor Específico',
      'Efectos Posibles',
      'Control Fuente',
      'Control Medio',
      'Control Individuo',
      'NP',
      'NC',
      'NR',
      'Nivel de Riesgo',
      'Aceptabilidad',
    ];

    const rows = hazards.map((h) => [
      `"${h.code}"`,
      `"${h.macroproceso}"`,
      `"${h.proceso}"`,
      `"${h.zonaLugar}"`,
      `"${h.actividadEspecifica}"`,
      h.rutinaria ? 'Sí' : 'No',
      `"${h.tipoPeligroGeneral}"`,
      `"${h.factorEspecifico}"`,
      `"${h.efectosSalud}"`,
      `"${h.controles.fuente.description}"`,
      `"${h.controles.medio.description}"`,
      `"${h.controles.individuo.description}"`,
      h.evaluacion.np,
      h.evaluacion.nc,
      h.evaluacion.nr,
      `"${h.evaluacion.levelText}"`,
      `"${h.evaluacion.aceptabilidad}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Matriz_GTC45_TallerLosAndes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Matriz exportada exitosamente en formato compatible con Excel (.xlsx/.csv)');
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Export notification popup */}
      {exportNotice && (
        <div className="fixed bottom-6 right-6 bg-[#0F172A] text-white px-4 py-3 rounded-lg shadow-xl border border-amber-500/40 text-xs font-mono flex items-center gap-2 z-50 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Top Banner Tag Line matching Screenshot 3 */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
        <div className="flex items-center gap-2 text-slate-600">
          <ShieldCheck className="w-4 h-4 text-slate-700" />
          <span className="font-semibold uppercase">
            SG-SST DECRETO 1072/2015 • ESTÁNDARES MÍNIMOS RES. 0312/2019
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />● 2 RIESGOS CRÍTICOS NIVEL I
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-semibold">
            Auditoría ARL: Al Día
          </span>
        </div>
      </div>

      {/* Official Legal Document Header Block matching Screenshot 3 */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-slate-200">
          {/* Left Company Identity */}
          <div className="md:col-span-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#0F172A] flex items-center justify-center text-amber-500 shadow-xs shrink-0">
              <ShieldCheck className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="text-[9px] font-mono font-bold text-amber-800 uppercase tracking-tight flex items-center gap-1">
                <span>RUT ACTIVO</span> • <span>{company.claseRiesgo}</span>
              </div>
              <h2 className="text-sm font-black text-slate-900 leading-tight font-chivo">
                {company.name}
              </h2>
              <div className="text-[10px] font-mono text-slate-500 leading-tight mt-0.5">
                NIT: {company.nit}
              </div>
              <div className="text-[9px] text-slate-400 font-sans truncate max-w-[190px]">
                {company.ciiu}
              </div>
            </div>
          </div>

          {/* Center Official Title */}
          <div className="md:col-span-6 text-center border-y md:border-y-0 md:border-x border-slate-200 py-3 md:py-0 px-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              SISTEMA DE GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO
            </span>
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5 font-chivo leading-tight">
              MATRIZ DE IDENTIFICACIÓN DE PELIGROS Y VALORACIÓN DE RIESGOS
            </h1>
            <span className="text-xs font-semibold text-[#8D4B00] block mt-1">
              Metodología Técnica Colombiana: Guía GTC 45 (Versión 2012)
            </span>
          </div>

          {/* Right Document Control Info */}
          <div className="md:col-span-3 text-right space-y-0.5 text-[10px] font-mono">
            <div className="text-slate-500">
              CÓDIGO: <strong className="text-slate-800">MAT-SST-2025-01</strong>
            </div>
            <div className="text-slate-500">
              VERSIÓN: <strong className="text-emerald-700">02 (Vigente)</strong>
            </div>
            <div className="text-slate-500">
              FECHA EMISIÓN: <strong className="text-slate-800">24/OCT/2025</strong>
            </div>
            <div className="text-slate-500">
              VIGENCIA LEGAL: <strong className="text-slate-800">1 Año (Oct 2026)</strong>
            </div>
          </div>
        </div>

        {/* Header Sub-bar */}
        <div className="bg-slate-50 px-5 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 font-sans border-t border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#8D4B00] text-white flex items-center justify-center text-[10px] font-bold">
              CM
            </span>
            <span>
              Responsable del Diseño SG-SST:{' '}
              <strong className="text-slate-900">{company.responsableSST.nombre}</strong> (Licencia SST No. {company.responsableSST.licencia} • Secretaría Distrital de Salud de Bogotá • Res. 0312 / Dec. 1072)
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-600">🛡️</span> Documento Oficial Auditado y Foliado
          </div>
        </div>
      </div>

      {/* Toolbar & Filters matching Screenshot 3 */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-[11px] uppercase">FILTRAR:</span>
          </div>

          <select
            value={filterProceso}
            onChange={(e) => setFilterProceso(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D97706]"
          >
            <option value="ALL">Todos los Procesos (2)</option>
            <option value="Operativo">Operativo</option>
            <option value="Bienestar / Servicios">Bienestar / Servicios</option>
          </select>

          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="font-mono text-[11px] uppercase">NIVEL:</span>
          </div>

          <select
            value={filterNivel}
            onChange={(e) => setFilterNivel(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#D97706]"
          >
            <option value="ALL">Todos los Niveles</option>
            <option value="NIVEL_I">Nivel I (Crítico)</option>
            <option value="NIVEL_II">Nivel II (Alto)</option>
            <option value="NIVEL_III">Nivel III (Mejorable)</option>
            <option value="NIVEL_IV">Nivel IV (Aceptable)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" /> Imprimir para Cartelera
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Exportar a Excel (.xlsx)
          </button>
          <button
            onClick={handleDownloadPdf}
            className="px-3 py-1.5 bg-[#8D4B00] hover:bg-[#6E3900] text-white text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-white" /> Descargar Matriz Oficial (PDF)
          </button>
        </div>
      </div>

      {/* Summary Metric Tiles matching Screenshot 3 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-center text-slate-500 text-[10px] font-mono uppercase font-bold">
            <span>TOTAL PELIGROS</span>
            <Building className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-slate-900">
            0{totalCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-red-200 shadow-2xs">
          <div className="flex justify-between items-center text-red-700 text-[10px] font-mono uppercase font-bold">
            <span>NIVEL I (CRÍTICO)</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-red-600">
            0{criticalCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-amber-200 shadow-2xs">
          <div className="flex justify-between items-center text-amber-800 text-[10px] font-mono uppercase font-bold">
            <span>NIVEL II (MEJORABLE)</span>
            <span className="text-amber-600 text-xs font-mono font-bold">⚡</span>
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-amber-700">
            0{improvedCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-center text-emerald-800 text-[10px] font-mono uppercase font-bold">
            <span>INTERVENCIONES EPP</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-emerald-700">
            100%
          </div>
        </div>
      </div>

      {/* Full GTC 45 Data Table matching Screenshot 3 */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          {/* Main grouped header rows */}
          <thead>
            <tr className="bg-blue-50/70 border-b border-slate-300 text-[10px] font-mono uppercase font-bold text-slate-700 tracking-wider">
              <th colSpan={3} className="py-2.5 px-3 border-r border-slate-300 text-center">
                1. LOCALIZACIÓN & ACTIVIDAD
              </th>
              <th colSpan={2} className="py-2.5 px-3 border-r border-slate-300 text-center">
                2. IDENTIFICACIÓN DEL PELIGRO
              </th>
              <th className="py-2.5 px-3 border-r border-slate-300 text-center">
                3. EFECTOS
              </th>
              <th colSpan={3} className="py-2.5 px-3 border-r border-slate-300 text-center">
                4. CONTROLES EXISTENTES
              </th>
              <th colSpan={4} className="py-2.5 px-3 text-center bg-amber-100/60 text-amber-900">
                5. EVALUACIÓN GTC 45
              </th>
            </tr>
            <tr className="bg-slate-100 border-b border-slate-300 text-[9px] font-mono uppercase font-semibold text-slate-600">
              <th className="py-2 px-2.5 border-r border-slate-200">PROCESO</th>
              <th className="py-2 px-2.5 border-r border-slate-200">ZONA / LUGAR</th>
              <th className="py-2 px-2.5 border-r border-slate-200">ACTIVIDADES</th>
              <th className="py-2 px-2.5 border-r border-slate-200">DESCRIPCIÓN PELIGRO</th>
              <th className="py-2 px-2.5 border-r border-slate-200">CLASIFICACIÓN</th>
              <th className="py-2 px-2.5 border-r border-slate-200">EFECTOS POSIBLES</th>
              <th className="py-2 px-2 border-r border-slate-200">FUENTE</th>
              <th className="py-2 px-2 border-r border-slate-200">MEDIO</th>
              <th className="py-2 px-2 border-r border-slate-200">INDIVIDUO</th>
              <th className="py-2 px-1.5 border-r border-slate-200 text-center w-8">NP</th>
              <th className="py-2 px-1.5 border-r border-slate-200 text-center w-8">NC</th>
              <th className="py-2 px-1.5 border-r border-slate-200 text-center w-8">NR</th>
              <th className="py-2 px-2 text-center">INTERPRETACIÓN</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 text-[11px]">
            {/* Macroproceso 1: OPERATIVO */}
            <tr className="bg-slate-50 font-mono font-bold text-[10px] text-slate-700 tracking-wide">
              <td colSpan={13} className="py-2 px-3 border-y border-slate-300">
                ⚙️ MACROPROCESO: OPERATIVO / PRODUCCIÓN TÉCNICA AUTOMOTRIZ
              </td>
            </tr>

            {filteredHazards
              .filter((h) => h.macroproceso === 'OPERATIVO / PRODUCCIÓN TÉCNICA AUTOMOTRIZ')
              .map((hazard) => (
                <tr
                  key={hazard.id}
                  onClick={() => onSelectHazard(hazard)}
                  className="hover:bg-amber-50/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-2.5 border-r border-slate-200 font-semibold text-slate-900 align-top">
                    {hazard.proceso}
                  </td>
                  <td className="py-3 px-2.5 border-r border-slate-200 align-top">
                    <span className="font-bold text-slate-900 block">{hazard.zonaLugar.split('•')[0]}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {hazard.zonaLugar.split('•')[1] || ''}
                    </span>
                  </td>
                  <td className="py-3 px-2.5 border-r border-slate-200 align-top max-w-[180px]">
                    <p className="text-slate-800 leading-snug">{hazard.actividadEspecifica}</p>
                    <span className="mt-1 inline-block text-[9px] font-mono px-1.5 py-0.5 bg-blue-50 text-blue-800 rounded font-semibold border border-blue-200">
                      Rutinaria: {hazard.rutinaria ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="py-3 px-2.5 border-r border-slate-200 align-top max-w-[200px]">
                    <strong className="text-slate-900 block leading-snug">{hazard.factorEspecifico}</strong>
                    <span className="text-[10px] text-red-700 font-mono font-semibold block mt-0.5">
                      Exposición Continua (8 hrs)
                    </span>
                  </td>
                  <td className="py-3 px-2.5 border-r border-slate-200 align-top font-mono text-[10px] text-slate-700 uppercase">
                    {hazard.tipoPeligroGeneral}
                  </td>
                  <td className="py-3 px-2.5 border-r border-slate-200 align-top max-w-[190px] text-slate-700 leading-snug">
                    {hazard.efectosSalud}
                  </td>
                  <td className="py-3 px-2 border-r border-slate-200 align-top text-[10px] text-slate-600">
                    <span className="text-red-700 font-bold block">{hazard.controles.fuente.status}</span>
                    {hazard.controles.fuente.description.slice(0, 45)}...
                  </td>
                  <td className="py-3 px-2 border-r border-slate-200 align-top text-[10px] text-slate-600">
                    <span className="text-amber-700 font-bold block">{hazard.controles.medio.status}</span>
                    {hazard.controles.medio.description.slice(0, 45)}...
                  </td>
                  <td className="py-3 px-2 border-r border-slate-200 align-top text-[10px] text-slate-600">
                    <span className="text-red-700 font-bold block">{hazard.controles.individuo.status}</span>
                    {hazard.controles.individuo.description.slice(0, 45)}...
                  </td>
                  <td className="py-3 px-1.5 border-r border-slate-200 text-center font-mono font-bold text-slate-900 align-top">
                    {hazard.evaluacion.np}
                  </td>
                  <td className="py-3 px-1.5 border-r border-slate-200 text-center font-mono font-bold text-slate-900 align-top">
                    {hazard.evaluacion.nc}
                  </td>
                  <td className="py-3 px-1.5 border-r border-slate-200 text-center font-mono font-black text-red-600 text-sm align-top">
                    {hazard.evaluacion.nr}
                  </td>
                  <td className="py-3 px-2 text-center align-top">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#DC2626] text-white whitespace-nowrap">
                      NIVEL I
                    </span>
                    <span className="block text-[8px] font-mono text-red-700 font-semibold mt-0.5">
                      No Aceptable
                    </span>
                  </td>
                </tr>
              ))}

            {/* Macroproceso 2: BIENESTAR / SERVICIOS */}
            <tr className="bg-slate-50 font-mono font-bold text-[10px] text-slate-700 tracking-wide">
              <td colSpan={13} className="py-2 px-3 border-y border-slate-300">
                🍽️ MACROPROCESO: BIENESTAR / SERVICIOS • SEDE OPERATIVA
              </td>
            </tr>

            {filteredHazards
              .filter((h) => h.macroproceso === 'BIENESTAR / SERVICIOS • SEDE OPERATIVA')
              .map((hazard) => (
                <tr
                  key={hazard.id}
                  onClick={() => onSelectHazard(hazard)}
                  className="hover:bg-amber-50/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-2.5 border-r border-slate-200 font-semibold text-slate-900 align-top">
                    {hazard.proceso}
                  </td>
                  <td className="py-3 px-2.5 border-r border-slate-200 align-top">
                    <span className="font-bold text-slate-900 block">{hazard.zonaLugar.split('•')[0]}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {hazard.zonaLugar.split('•')[1] || ''}
                    </span>
                  </td>
                  <td className="py-3 px-2.5 border-r border-slate-200 align-top max-w-[180px]">
                    <p className="text-slate-800 leading-snug">{hazard.actividadEspecifica}</p>
                    <span className="mt-1 inline-block text-[9px] font-mono px-1.5 py-0.5 bg-blue-50 text-blue-800 rounded font-semibold border border-blue-200">
                      Rutinaria: {hazard.rutinaria ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="py-3 px-2.5 border-r border-slate-200 align-top max-w-[200px]">
                    <strong className="text-slate-900 block leading-snug">{hazard.factorEspecifico}</strong>
                    <span className="text-[10px] text-amber-700 font-mono font-semibold block mt-0.5">
                      Superficie resbaladiza
                    </span>
                  </td>
                  <td className="py-3 px-2.5 border-r border-slate-200 align-top font-mono text-[10px] text-slate-700 uppercase">
                    {hazard.tipoPeligroGeneral}
                  </td>
                  <td className="py-3 px-2.5 border-r border-slate-200 align-top max-w-[190px] text-slate-700 leading-snug">
                    {hazard.efectosSalud}
                  </td>
                  <td className="py-3 px-2 border-r border-slate-200 align-top text-[10px] text-slate-600">
                    <span className="text-amber-700 font-bold block">{hazard.controles.fuente.status}</span>
                    {hazard.controles.fuente.description.slice(0, 45)}...
                  </td>
                  <td className="py-3 px-2 border-r border-slate-200 align-top text-[10px] text-slate-600">
                    <span className="text-amber-700 font-bold block">{hazard.controles.medio.status}</span>
                    {hazard.controles.medio.description.slice(0, 45)}...
                  </td>
                  <td className="py-3 px-2 border-r border-slate-200 align-top text-[10px] text-slate-600">
                    <span className="text-amber-700 font-bold block">{hazard.controles.individuo.status}</span>
                    {hazard.controles.individuo.description.slice(0, 45)}...
                  </td>
                  <td className="py-3 px-1.5 border-r border-slate-200 text-center font-mono font-bold text-slate-900 align-top">
                    {hazard.evaluacion.np}
                  </td>
                  <td className="py-3 px-1.5 border-r border-slate-200 text-center font-mono font-bold text-slate-900 align-top">
                    {hazard.evaluacion.nc}
                  </td>
                  <td className="py-3 px-1.5 border-r border-slate-200 text-center font-mono font-black text-amber-600 text-sm align-top">
                    {hazard.evaluacion.nr}
                  </td>
                  <td className="py-3 px-2 text-center align-top">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#CA8A04] text-white whitespace-nowrap">
                      NIVEL III
                    </span>
                    <span className="block text-[8px] font-mono text-amber-800 font-semibold mt-0.5">
                      Mejorable
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Legend matching Screenshot 3 */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">CONVENCIONES GTC 45:</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
              <strong>I (20 - 40):</strong> No Aceptable / Crítico (Paralización o intervención inmediata)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
              <strong>II (10 - 18):</strong> No Aceptable / Control Específico
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CA8A04]" />
              <strong>III (4 - 8):</strong> Mejorable
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
              <strong>IV (1 - 3):</strong> Aceptable
            </span>
          </div>

          <div className="text-slate-500">
            Fórmula: <strong>NR = NP × NC</strong> • Vigencia Estándar Resolución 0312
          </div>
        </div>
      </div>

      {/* Two Column Footer Info matching Screenshot 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Box 1: Algoritmo de Valoración del Riesgo Legal */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 font-bold font-mono">🧮</span>
              <h3 className="text-sm font-bold text-slate-900 font-chivo">
                Algoritmo de Valoración del Riesgo Legal (GTC 45:2012)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-semibold">
              Matemática Normativa
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            El Nivel de Riesgo (<strong>NR</strong>) es el producto del Nivel de Probabilidad (<strong>NP = ND × NE</strong>) por el Nivel de Consecuencia (<strong>NC</strong>). En talleres de mantenimiento mecánico (CIIU 4520), las intervenciones en controles de ingeniería tienen prioridad absoluta sobre los EPP según el Artículo 2.2.4.6.24 del Decreto 1072 de 2015.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">
                PASO 1: DEFICIENCIA & EXPOSICIÓN
              </span>
              <span className="font-mono font-bold text-slate-800 block mt-1">
                ND × NE = NP
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Determina la frecuencia y gravedad de la exposición sin control.
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">
                PASO 2: CONSECUENCIA DAÑO
              </span>
              <span className="font-mono font-bold text-slate-800 block mt-1">
                NC (10 a 100)
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Evalúa muerte, invalidez o lesiones con incapacidad laboral.
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">
                PASO 3: NIVEL DE RIESGO FINAL
              </span>
              <span className="font-mono font-bold text-red-600 block mt-1">
                NR = NP × NC
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Clasifica el riesgo de Grado I a IV ante la ARL.
              </span>
            </div>
          </div>
        </div>

        {/* Box 2: Plan de Acción Inmediato */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-bold text-slate-900 font-chivo">
              Plan de Acción Inmediato
            </h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            La zona de <strong>Soldadura y Corte</strong> y la <strong>Bodega 220V</strong> requieren radicar evidencias de cierre ante el COPASST en un plazo improrrogable de 5 días hábiles.
          </p>

          <div className="space-y-2 pt-1 text-xs">
            <div className="p-2 bg-red-50 border border-red-200 rounded flex items-center justify-between">
              <span className="font-semibold text-red-900">Caretas Fotosensibles</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-red-600 text-white rounded">
                ENTREGA EN 24H
              </span>
            </div>

            <div className="p-2 bg-amber-50 border border-amber-200 rounded flex items-center justify-between">
              <span className="font-semibold text-amber-950">Inspección RETIE Bodega</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-600 text-white rounded">
                AGENDADO 26/OCT
              </span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 font-mono flex justify-between items-center border-t border-slate-100">
            <span>PRÓXIMA REVISIÓN ORDINARIA:</span>
            <strong className="text-slate-800">24 de Octubre de 2026</strong>
          </div>
        </div>
      </div>

      {/* Legal Signatures and Technical Responsibility Card matching Screenshot 3 */}
      <div className="bg-white rounded-lg border border-slate-300 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <span className="text-amber-600 font-bold">✒️</span>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide font-chivo">
            Aprobación Legal y Responsabilidad Técnica
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Signer 1: Ing. Carlos Méndez */}
          <div className="md:col-span-5 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
              ELABORÓ Y EVALUÓ TÉCNICA:
            </span>
            <div className="h-16 flex items-center justify-center border-b border-slate-300/80 mb-2 relative">
              <SignatureCarlosMendez className="w-56 h-14" />
              <span className="absolute bottom-1 right-2 text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Firma Digital Verificada
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 font-chivo leading-tight">
              {company.responsableSST.nombre}
            </h4>
            <p className="text-xs text-slate-600">{company.responsableSST.cargo}</p>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5">
              Licencia SST No. {company.responsableSST.licencia}
            </p>
            <p className="text-[10px] text-slate-400 font-sans">
              Secretaría Distrital de Salud de Bogotá D.C.
            </p>
          </div>

          {/* Signer 2: Rodrigo Gómez Mendoza */}
          <div className="md:col-span-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
              APROBÓ & ASIGNÓ RECURSOS:
            </span>
            <div className="h-16 flex items-center justify-center border-b border-slate-300/80 mb-2 relative">
              <SignatureRodrigoGomez className="w-56 h-14" />
              <span className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                Firma Autógrafa
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 font-chivo leading-tight">
              {company.representanteLegal.nombre}
            </h4>
            <p className="text-xs text-slate-600">{company.representanteLegal.cargo}</p>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5">
              C.C. {company.representanteLegal.cedula}
            </p>
            <p className="text-[10px] text-slate-400 font-sans">{company.name}</p>
          </div>

          {/* Auditor QR Stamp */}
          <div className="md:col-span-3">
            <QrAuditStamp code="MINTRAD-2025-V02-BOG" />
          </div>
        </div>

        {/* Legal Declaration */}
        <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500 leading-relaxed font-sans max-w-4xl mx-auto">
          <strong>Declaración de Conformidad Legal:</strong> El presente documento ha sido estructurado conforme a los parámetros exigidos por la <strong>Resolución 0312 de 2019</strong> del Ministerio del Trabajo de Colombia y las directrices metodológicas de la <strong>Guía Técnica Colombiana GTC 45 (segunda actualización)</strong>. Su custodia reposa en el expediente digital del SG-SST del Taller Los Andes S.A.S. y su vigencia es de un (1) año a partir de su emisión, requiriendo actualización inmediata en caso de accidentes de trabajo mortales, cambio de procesos tecnológicos o nuevas instalaciones físicas.
        </div>
      </div>
    </div>
  );
}
