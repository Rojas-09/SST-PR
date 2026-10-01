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
      if (filterProceso !== 'ALL') {
        const proc = (h.proceso || '').toLowerCase();
        const zona = (h.zonaLugar || '').toLowerCase();
        const act = (h.actividadEspecifica || '').toLowerCase();
        if (filterProceso === 'Mantenimiento') {
          if (!proc.includes('operativo') && !proc.includes('mantenimiento') && !zona.includes('soldadura') && !act.includes('soldadura')) return false;
        } else if (filterProceso === 'Almacenamiento') {
          if (!zona.includes('bodega') && !zona.includes('almacen') && !act.includes('almacen')) return false;
        } else if (filterProceso === 'Producción') {
          if (!proc.includes('bienestar') && !proc.includes('producción') && !zona.includes('cocina')) return false;
        } else if (h.proceso !== filterProceso) {
          return false;
        }
      }
      if (filterNivel !== 'ALL') {
        if (filterNivel === 'CRITICO') {
          if (h.evaluacion.level !== 'NIVEL_I' && h.evaluacion.nr < 15) return false;
        } else if (filterNivel === 'NIVEL_I' && h.evaluacion.level !== 'NIVEL_I') {
          return false;
        } else if (filterNivel === 'NIVEL_II' && h.evaluacion.level !== 'NIVEL_II') {
          return false;
        } else if (filterNivel === 'NIVEL_III' && h.evaluacion.level !== 'NIVEL_III') {
          return false;
        } else if (filterNivel === 'NIVEL_IV' && h.evaluacion.level !== 'NIVEL_IV') {
          return false;
        }
      }
      return true;
    });
  }, [hazards, filterProceso, filterNivel]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    // Generate clean CSV download
    const headers = [
      'Proceso',
      'Actividad',
      'Peligro Identificado',
      'Efectos Posibles',
      'P',
      'S',
      'P×S',
      'Nivel',
      'Plan de Intervención',
    ];

    const rows = filteredHazards.map((h) => [
      `"${h.proceso === 'Operativo' ? 'Mantenimiento' : h.proceso === 'Bienestar / Servicios' ? 'Producción' : h.proceso}"`,
      `"${h.zonaLugar.split('•')[0].trim()}"`,
      `"${h.id === 'PEL-2024-001' ? 'Falta de EPP en zona de soldadura' : h.id === 'PEL-2024-003' ? 'Piso resbaloso por grasas' : h.factorEspecifico || h.title}"`,
      `"${h.id === 'PEL-2024-001' ? 'Quemaduras, lesiones oculares, intoxicación.' : h.id === 'PEL-2024-003' ? 'Caídas al mismo nivel, contusiones.' : h.efectosSalud}"`,
      h.evaluacion.np,
      h.evaluacion.nc,
      h.evaluacion.nr,
      `"${h.evaluacion.level === 'NIVEL_I' || h.evaluacion.nr >= 15 ? 'CRÍTICO' : h.evaluacion.level === 'NIVEL_II' ? 'ALTO' : h.evaluacion.level === 'NIVEL_III' ? 'MEJORABLE' : 'ACEPTABLE'}"`,
      `"${h.id === 'PEL-2024-001' ? 'Entregar EPP individual certificado e instalar extracción localizada.' : h.id === 'PEL-2024-003' ? 'Instalar cinta antideslizante y definir protocolo de limpieza por turno.' : h.planIntervencion.epp.titulo}"`,
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

    setExportNotice('Matriz exportada exitosamente en formato CSV oficial');
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-6 space-y-4">
      {/* Export notification popup */}
      {exportNotice && (
        <div className="fixed bottom-6 right-6 left-6 sm:left-auto sm:max-w-[calc(100vw-3rem)] bg-slate-900 text-white px-4 py-3 rounded-sm shadow-xl border border-amber-500/40 text-xs font-mono-data flex items-center gap-2 z-50 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* CABECERA TÉCNICA DE INGENIERÍA (MEMBRETE OFICIAL) */}
      <div className="max-w-7xl mx-auto bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-[#1877F2] text-white font-bold px-3 py-1 text-[13px] rounded-lg tracking-wide shadow-2xs">
              SST Fácil
            </div>
            <span className="text-slate-300">|</span>
            <h1 className="text-[13px] font-bold text-slate-900 uppercase tracking-wide">
              SISTEMA DE GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
              CÓDIGO: SST-MR-001
            </span>
            <span className="text-[11.5px] text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
              VERSIÓN: 03
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[12.5px] text-slate-600">
          <div>
            <span className="text-slate-400 text-[11px] block uppercase font-semibold">Organización</span>
            <span className="font-medium text-slate-900">{company.name}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block uppercase font-semibold">NIT</span>
            <span className="font-medium text-slate-900">{company.nit}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block uppercase font-semibold">Responsable Técnico</span>
            <span className="font-medium text-slate-900">{company.responsableSST.nombre} (Lic. {company.responsableSST.licencia})</span>
          </div>
          <div className="lg:text-right">
            <span className="text-slate-400 text-[11px] block uppercase font-semibold">Fecha de Emisión</span>
            <span className="font-medium text-slate-900">17/09/2026</span>
          </div>
        </div>
      </div>

      {/* BARRA DE ACCIONES Y FILTROS */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <select
            value={filterProceso}
            onChange={(e) => setFilterProceso(e.target.value)}
            className="h-9 text-[12.5px] bg-white border border-slate-200 rounded-lg px-3 text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
          >
            <option value="ALL">PROCESO: Todos los procesos</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Almacenamiento">Almacenamiento</option>
            <option value="Producción">Producción</option>
          </select>
          <select
            value={filterNivel}
            onChange={(e) => setFilterNivel(e.target.value)}
            className="h-9 text-[12.5px] bg-white border border-slate-200 rounded-lg px-3 text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
          >
            <option value="ALL">NIVEL: Todos los niveles</option>
            <option value="CRITICO">Crítico (≥15)</option>
            <option value="NIVEL_II">Alto (Nivel II)</option>
            <option value="NIVEL_III">Mejorable (Nivel III)</option>
            <option value="NIVEL_IV">Aceptable (Nivel IV)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="h-9 px-3.5 text-[12.5px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>Exportar CSV</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="h-9 px-4 text-[13px] font-medium text-white bg-[#1877F2] hover:bg-[#1464CC] rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Descargar PDF Oficial</span>
          </button>
        </div>
      </div>

      {/* TABLA DENTRO DE MATRIZ TÉCNICA */}
      <div className="max-w-7xl mx-auto bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs mb-6">
        <div className="overflow-x-auto">
          <table className="table-stack-lg w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[12px] font-semibold text-slate-700">
                <th className="py-3 px-2 border-r border-slate-100 w-[8%]">Proceso</th>
                <th className="py-3 px-2 border-r border-slate-100 w-[8%]">Actividad</th>
                <th className="py-3 px-2 border-r border-slate-100 w-[15%]">Peligro Identificado</th>
                <th className="py-3 px-2 border-r border-slate-100 w-[14%]">Efectos Posibles</th>
                <th className="py-2 px-1 text-center border-r border-slate-100 w-[4%]">P</th>
                <th className="py-2 px-1 text-center border-r border-slate-100 w-[4%]">S</th>
                <th className="py-2 px-1 text-center border-r border-slate-100 w-[5%]">P×S</th>
                <th className="py-2 px-1.5 border-r border-slate-100 w-[9%] text-center">Nivel</th>
                <th className="py-3 px-2 w-[33%]">Plan de Intervención</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[12.5px]">
              {filteredHazards.map((hazard) => {
                const p = hazard.evaluacion.np;
                const s = hazard.evaluacion.nc;
                const pxs = hazard.evaluacion.nr;
                const isCritical = hazard.evaluacion.level === 'NIVEL_I' || pxs >= 15;
                const isAlto = hazard.evaluacion.level === 'NIVEL_II' && pxs < 15;
                const isMejorable = hazard.evaluacion.level === 'NIVEL_III';

                const procesoLabel =
                  hazard.proceso === 'Operativo'
                    ? 'Mantenimiento'
                    : hazard.proceso === 'Bienestar / Servicios'
                    ? 'Producción'
                    : hazard.proceso;

                const actividadLabel =
                  hazard.id === 'PEL-2024-001'
                    ? 'Zona de soldadura'
                    : hazard.id === 'PEL-2024-002'
                    ? 'Bodega 220V'
                    : hazard.id === 'PEL-2024-003'
                    ? 'Cocina'
                    : hazard.zonaLugar.split('•')[0].trim();

                const peligroLabel =
                  hazard.id === 'PEL-2024-001'
                    ? 'Falta de EPP en zona de soldadura'
                    : hazard.id === 'PEL-2024-002'
                    ? 'Red eléctrica 220V expuesta a humedad'
                    : hazard.id === 'PEL-2024-003'
                    ? 'Piso resbaloso por grasas'
                    : hazard.factorEspecifico || hazard.title;

                const efectosLabel =
                  hazard.id === 'PEL-2024-001'
                    ? 'Quemaduras, lesiones oculares, intoxicación.'
                    : hazard.id === 'PEL-2024-002'
                    ? 'Electrocución, choque eléctrico, fibrilación.'
                    : hazard.id === 'PEL-2024-003'
                    ? 'Caídas al mismo nivel, contusiones.'
                    : hazard.efectosSalud;

                const planLabel =
                  hazard.id === 'PEL-2024-001'
                    ? 'Entregar EPP individual certificado e instalar extracción localizada.'
                    : hazard.id === 'PEL-2024-002'
                    ? 'Inspección RETIE, sustitución de cableado e instalación de diferencial.'
                    : hazard.id === 'PEL-2024-003'
                    ? 'Instalar cinta antideslizante y definir protocolo de limpieza por turno.'
                    : `${hazard.planIntervencion.epp.titulo}. ${hazard.planIntervencion.ingenieria.descripcion}`;

                return (
                  <tr
                    key={hazard.id}
                    onClick={() => onSelectHazard(hazard)}
                    className="hover:bg-amber-50/30 transition-colors cursor-pointer"
                  >
                    <td data-label="Proceso" className="py-2.5 px-2 font-medium text-slate-900 border-r border-slate-100">
                      {procesoLabel}
                    </td>
                    <td data-label="Actividad" className="py-2.5 px-2 text-slate-600 border-r border-slate-100">
                      {actividadLabel}
                    </td>
                    <td data-label="Peligro Identificado" className="py-2.5 px-2 text-slate-800 font-medium border-r border-slate-100">
                      {peligroLabel}
                    </td>
                    <td data-label="Efectos Posibles" className="py-2.5 px-2 text-slate-500 border-r border-slate-100 text-[11px]">
                      {efectosLabel}
                    </td>
                    <td data-label="P" className="py-2.5 px-1 text-center font-mono-data font-bold border-r border-slate-100">
                      {p}
                    </td>
                    <td data-label="S" className="py-2.5 px-1 text-center font-mono-data font-bold border-r border-slate-100">
                      {s}
                    </td>
                    <td data-label="P×S"
                      className={`py-2.5 px-1 text-center font-mono-data font-bold border-r border-slate-100 ${
                        isCritical
                          ? 'text-red-600 bg-red-50/50'
                          : isAlto
                          ? 'text-orange-600 bg-orange-50/50'
                          : isMejorable
                          ? 'text-amber-600 bg-amber-50/50'
                          : 'text-emerald-600 bg-emerald-50/50'
                      }`}
                    >
                      {pxs}
                    </td>
                    <td data-label="Nivel" className="py-2.5 px-1.5 border-r border-slate-100 text-center">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono-data font-semibold bg-red-50 text-red-700 border border-red-200">
                          CRÍTICO
                        </span>
                      ) : isAlto ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono-data font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                          ALTO
                        </span>
                      ) : isMejorable ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono-data font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          MEJORABLE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono-data font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ACEPTABLE
                        </span>
                      )}
                    </td>
                    <td data-label="Plan de Intervención" className="py-2.5 px-2 text-slate-600 text-[11px]">
                      {planLabel}
                    </td>
                  </tr>
                );
              })}

              {filteredHazards.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-mono-data text-xs">
                    No se encontraron registros coincidentes con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PIE DE PÁGINA TÉCNICO / CONTROL DE CAMBIOS */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-[11px] font-mono-data text-slate-400 border-t border-slate-200 pt-3 gap-2">
        <div>
          METODOLOGÍA: GTC 45 (SEGUNDA ACTUALIZACIÓN) • DECRETO 1072/2015
        </div>
        <div>
          DOCUMENTO CONTROLADO — PROHIBIDA SU REPRODUCCIÓN NO AUTORIZADA
        </div>
      </div>

      {/* Two Column Technical Details */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Box 1: Algoritmo de Valoración del Riesgo Legal */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 text-[13px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-bold text-[13px]">#</span>
              <h3 className="text-[12.5px] font-bold text-slate-900 uppercase tracking-wide">
                Algoritmo de Valoración del Riesgo Legal (GTC 45:2012)
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
              Matemática Normativa
            </span>
          </div>

          <p className="text-[12.5px] text-slate-600 leading-relaxed">
            El Nivel de Riesgo (<strong>NR</strong>) es el producto del Nivel de Probabilidad (<strong>NP = ND × NE</strong>) por el Nivel de Consecuencia (<strong>NC</strong>). En talleres de mantenimiento mecánico (CIIU 4520), las intervenciones en controles de ingeniería tienen prioridad sobre los EPP (Art. 2.2.4.6.24 Decreto 1072/2015).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[12px]">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                PASO 1: DEFICIENCIA & EXPOSICIÓN
              </span>
              <span className="font-bold text-slate-800 block mt-1 text-[13px]">
                ND × NE = NP
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Frecuencia y exposición sin control.
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                PASO 2: CONSECUENCIA DAÑO
              </span>
              <span className="font-bold text-slate-800 block mt-1 text-[13px]">
                NC (10 a 100)
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Invalidez, muerte o incapacidad temporal.
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                PASO 3: NIVEL DE RIESGO FINAL
              </span>
              <span className="font-bold text-red-600 block mt-1 text-[13px]">
                NR = NP × NC
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Clasificación de Grado I a IV (ARL).
              </span>
            </div>
          </div>
        </div>

        {/* Box 2: Plan de Acción Inmediato */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 text-[13px]">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h3 className="text-[12.5px] font-bold text-slate-900 uppercase tracking-wide">
              Plan de Acción Inmediato
            </h3>
          </div>

          <p className="text-[12.5px] text-slate-600 leading-relaxed">
            La zona de <strong className="text-slate-800">Soldadura</strong> y la <strong className="text-slate-800">Bodega 220V</strong> requieren radicar evidencias de cierre técnico ante el COPASST en 5 días hábiles.
          </p>

          <div className="space-y-2 pt-1">
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
              <span className="font-medium text-red-900 text-[12.5px]">Caretas Fotosensibles Certificadas</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-600 text-white rounded-md">
                24H
              </span>
            </div>

            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
              <span className="font-medium text-amber-950 text-[12.5px]">Inspección RETIE Red Eléctrica</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-600 text-white rounded-md">
                26/OCT
              </span>
            </div>
          </div>

          <div className="pt-2 text-[11.5px] text-slate-500 flex justify-between items-center border-t border-slate-100">
            <span>PRÓXIMA REVISIÓN ORDINARIA:</span>
            <strong className="text-slate-800">24/10/2026</strong>
          </div>
        </div>
      </div>

      {/* Aprobación Legal y Responsabilidad Técnica */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 text-[13px]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-[12.5px] font-bold text-slate-900 uppercase tracking-wide">
            Aprobación Legal y Responsabilidad Técnica
          </h3>
          <span className="text-[11px] text-slate-400">
            DECRETO 1072 / RESOLUCIÓN 0312
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Signer 1: Ing. Carlos Méndez */}
          <div className="md:col-span-5 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase text-slate-400 font-semibold block mb-1">
              ELABORÓ Y EVALUÓ TÉCNICAMENTE:
            </span>
            <div className="h-14 flex items-center justify-center border-b border-slate-200 mb-2 relative">
              <SignatureCarlosMendez className="w-48 h-12" />
              <span className="absolute bottom-0.5 right-1 text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                Firma Digital
              </span>
            </div>
            <h4 className="text-[12.5px] font-bold text-slate-900 leading-tight">
              {company.responsableSST.nombre}
            </h4>
            <p className="text-[12px] text-slate-600">{company.responsableSST.cargo}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Licencia SST No. {company.responsableSST.licencia}
            </p>
          </div>

          {/* Signer 2: Rodrigo Gómez Mendoza */}
          <div className="md:col-span-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase text-slate-400 font-semibold block mb-1">
              APROBÓ & ASIGNÓ RECURSOS:
            </span>
            <div className="h-14 flex items-center justify-center border-b border-slate-200 mb-2 relative">
              <SignatureRodrigoGomez className="w-48 h-12" />
              <span className="absolute bottom-0.5 right-1 text-[9px] text-slate-500 bg-slate-200 px-1.5 py-0.2 rounded">
                Autógrafa
              </span>
            </div>
            <h4 className="text-[12.5px] font-bold text-slate-900 leading-tight">
              {company.representanteLegal.nombre}
            </h4>
            <p className="text-[12px] text-slate-600">{company.representanteLegal.cargo}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              C.C. {company.representanteLegal.cedula}
            </p>
          </div>

          {/* Auditor QR Stamp */}
          <div className="md:col-span-3">
            <QrAuditStamp code="MINTRAD-2025-V02-BOG" />
          </div>
        </div>

        {/* Legal Declaration */}
        <div className="pt-2 border-t border-slate-100 text-center text-[11px] text-slate-400 leading-relaxed max-w-4xl mx-auto">
          <strong>Declaración de Conformidad Legal:</strong> Documento estructurado conforme a la <strong>Resolución 0312 de 2019</strong> y la <strong>Guía Técnica Colombiana GTC 45 (segunda actualización)</strong>. Expediente digital SG-SST custodio en sede operativa.
        </div>
      </div>
    </div>
  );
}
