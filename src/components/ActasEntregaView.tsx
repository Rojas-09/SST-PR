import { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Printer,
  Search,
  Filter,
  Eye,
  PenTool,
  Clock,
  UserCheck,
  Building2,
  QrCode,
  Sparkles,
  ArrowRight,
  Check,
  Award,
} from 'lucide-react';
import { HazardRecord, CompanyInfo, ActiveView } from '../types';
import { SignatureCarlosMendez, SignatureRodrigoGomez, QrAuditStamp } from './SignatureSvgs';

interface ActasEntregaViewProps {
  hazards: HazardRecord[];
  company: CompanyInfo;
  onSelectHazard: (hazard: HazardRecord) => void;
  onNavigate: (view: ActiveView) => void;
  onOpenActaModalForHazard: (hazard: HazardRecord) => void;
}

export function ActasEntregaView({
  hazards,
  company,
  onSelectHazard,
  onNavigate,
  onOpenActaModalForHazard,
}: ActasEntregaViewProps) {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'FIRMADA' | 'PENDIENTE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActaForPrint, setSelectedActaForPrint] = useState<HazardRecord | null>(null);

  // Workers assigned per hazard for demo delivery realism (2026)
  const workersDirectory: Record<string, { nombre: string; cedula: string; cargo: string; fecha: string }> = {
    // Taller Los Andes
    'PEL-2026-001': {
      nombre: 'Javier Morales',
      cedula: '80.123.456',
      cargo: 'Soldador MIG/MAG Especialista',
      fecha: '18 Enero 2026',
    },
    'PEL-2026-002': {
      nombre: 'Wilmer Antonio Parra',
      cedula: '1.022.345.678',
      cargo: 'Electricista Automotriz Matriculado',
      fecha: '22 Enero 2026',
    },
    'PEL-2026-003': {
      nombre: 'Nelson Martínez',
      cedula: '80.987.654',
      cargo: 'Auxiliar de Mantenimiento y Servicios',
      fecha: '05 Febrero 2026',
    },
    'PEL-2024-001': {
      nombre: 'Javier Morales',
      cedula: '80.123.456',
      cargo: 'Soldador MIG/MAG',
      fecha: '18 Enero 2026',
    },
    'PEL-2024-002': {
      nombre: 'Wilmer Antonio Parra',
      cedula: '1.022.345.678',
      cargo: 'Electricista Automotriz',
      fecha: '22 Enero 2026',
    },
    'PEL-2024-003': {
      nombre: 'Nelson Martínez',
      cedula: '80.987.654',
      cargo: 'Auxiliar de Mantenimiento',
      fecha: '05 Febrero 2026',
    },
    // SERVIC CREAR S.A.S.
    'PEL-SC-2026-001': {
      nombre: 'Carlos Eduardo Téllez',
      cedula: '93.412.556',
      cargo: 'Operario Especialista en Tanques de Agua Potable',
      fecha: '18 Marzo 2026',
    },
    'PEL-SC-2026-002': {
      nombre: 'Diego Armando Méndez',
      cedula: '93.390.112',
      cargo: 'Operario de Poda y Zonas Verdes STIHL',
      fecha: '10 Abril 2026',
    },
    'PEL-SC-2026-003': {
      nombre: 'Álvaro Hernán Devia',
      cedula: '93.284.102',
      cargo: 'Operario Técnico de Piscinas',
      fecha: '05 Mayo 2026',
    },
    'PEL-SC-2026-004': {
      nombre: 'Fabián Andrés Guzmán',
      cedula: '1.110.489.123',
      cargo: 'Técnico en Mantenimiento Locativo',
      fecha: '15 Junio 2026',
    },
    'PEL-SC-2026-005': {
      nombre: 'Gloria Esperanza Prada',
      cedula: '38.256.789',
      cargo: 'Supervisora de Sanidad Ambiental',
      fecha: '20 Agosto 2026',
    },
  };

  const filteredActas = useMemo(() => {
    return hazards.filter((h) => {
      if (filterStatus === 'FIRMADA' && h.estadoEntregaEPP !== 'FIRMADA') return false;
      if (filterStatus === 'PENDIENTE' && h.estadoEntregaEPP === 'FIRMADA') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const worker = workersDirectory[h.id];
        const matchTitle = h.title.toLowerCase().includes(q);
        const matchCode = h.code.toLowerCase().includes(q);
        const matchWorker =
          worker &&
          (worker.nombre.toLowerCase().includes(q) ||
            worker.cedula.includes(q) ||
            worker.cargo.toLowerCase().includes(q));
        const matchEpp = h.planIntervencion.epp.items.some((it) => it.text.toLowerCase().includes(q));
        if (!matchTitle && !matchCode && !matchWorker && !matchEpp) return false;
      }
      return true;
    });
  }, [hazards, filterStatus, searchQuery]);

  const totalFirmadas = hazards.filter((h) => h.estadoEntregaEPP === 'FIRMADA').length;
  const totalPendientes = hazards.filter((h) => h.estadoEntregaEPP === 'PENDIENTE').length;
  const totalItemsEPP = hazards.reduce((acc, curr) => acc + curr.planIntervencion.epp.items.length, 0);

  const handlePrintCertificate = (hazard: HazardRecord) => {
    setSelectedActaForPrint(hazard);
  };

  return (
    <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 md:px-8 xl:px-10 py-5 sm:py-6 space-y-6 font-sans text-sm sm:text-base text-slate-800">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-sans font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
              DECRETO 1072/2015 ART. 2.2.4.6.24 • RESOLUCIÓN 0312 ÍTEM 4.2.6
            </span>
            <span className="text-xs text-slate-500 font-sans font-medium">• Custodia Legal 20 Años</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Actas Oficiales de Dotación y Entrega de EPP
          </h1>
          <p className="text-sm sm:text-base font-normal text-slate-600 mt-1.5 max-w-4xl leading-relaxed font-sans">
            Gestión y archivo digital de entrega de Elementos de Protección Personal certificados con firma del operario receptor y del Responsable SST, garantizando trazabilidad para auditorías del Ministerio del Trabajo y ARL.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-sans font-semibold flex items-center gap-2 cursor-pointer shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Imprimir Listado</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('gestion-peligros')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-sans font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Matriz de Controles</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs font-sans">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-sans font-medium text-slate-500">
              Total Actas Registradas
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-sans">{hazards.length}</div>
          <span className="text-[12px] font-normal text-slate-500 font-sans">Actas individuales de planta</span>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-2xs font-sans bg-emerald-50/10">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-sans font-medium text-emerald-800">
              Actas Firmadas y Validadas
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-900 font-sans">{totalFirmadas}</div>
          <span className="text-[12px] font-normal text-emerald-700 font-sans">Con firma y cédula verificada</span>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-2xs font-sans bg-amber-50/10">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-sans font-medium text-amber-800">
              Pendientes de Firma
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-900 font-sans">{totalPendientes}</div>
          <span className="text-[12px] font-normal text-amber-700 font-sans">Requiere ratificación de dotación</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs font-sans">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-sans font-medium text-slate-500">
              Equipos de Protección
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-900 font-sans">{totalItemsEPP}</div>
          <span className="text-[12px] font-normal text-slate-500 font-sans">Unidades certificadas (ANSI / EN)</span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-fit font-sans">
          <button
            type="button"
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-md text-[13px] font-sans font-medium cursor-pointer transition-colors ${
              filterStatus === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({hazards.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('FIRMADA')}
            className={`px-3 py-1.5 rounded-md text-[13px] font-sans font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
              filterStatus === 'FIRMADA'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Firmadas ({totalFirmadas})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('PENDIENTE')}
            className={`px-3 py-1.5 rounded-md text-[13px] font-sans font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
              filterStatus === 'PENDIENTE'
                ? 'bg-white text-amber-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Pendientes ({totalPendientes})
          </button>
        </div>

        {/* Search input with explicit font-sans & 13px */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por operario, cédula o equipo..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-sans font-normal text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Main Actas Table with consistent font-sans and 13px font-size */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden font-sans">
        <div className="overflow-x-auto">
          <table className="table-stack-lg w-full text-left border-collapse font-sans text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[12px] font-sans font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3 font-sans w-[12%]">Acta / Cód.</th>
                <th className="py-3 px-3 font-sans w-[18%]">Trabajador Receptor</th>
                <th className="py-3 px-3 font-sans w-[18%]">Peligro Asociado (GTC 45)</th>
                <th className="py-3 px-3 font-sans w-[24%]">Equipos de Protección Entregados</th>
                <th className="py-3 px-3 text-center font-sans w-[12%]">Estado</th>
                <th className="py-3 px-3 text-right font-sans w-[16%]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px] font-sans">
              {filteredActas.map((hazard, index) => {
                const worker = workersDirectory[hazard.id] || {
                  nombre: 'Trabajador Operativo',
                  cedula: 'N/A',
                  cargo: hazard.zonaLugar.split('•')[0].trim(),
                  fecha: '2026',
                };
                const isFirmada = hazard.estadoEntregaEPP === 'FIRMADA';

                return (
                  <tr key={hazard.id} className="hover:bg-slate-50/70 transition-colors font-sans">
                    {/* Code and Date */}
                    <td data-label="Acta / Cód." className="py-3.5 px-3 font-sans">
                      <div className="font-sans font-semibold text-slate-900 text-[13px]">
                        ACT-EPP-2026-{String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="text-[12px] text-slate-400 font-sans font-normal mt-0.5">
                        {worker.fecha}
                      </div>
                    </td>

                    {/* Worker Info */}
                    <td data-label="Trabajador Receptor" className="py-3.5 px-3 font-sans">
                      <div className="font-sans font-semibold text-slate-900 text-[13px]">
                        {worker.nombre}
                      </div>
                      <div className="text-[12px] text-slate-500 font-sans font-normal">
                        C.C. {worker.cedula} • {worker.cargo}
                      </div>
                    </td>

                    {/* Associated Hazard */}
                    <td data-label="Peligro Asociado (GTC 45)" className="py-3.5 px-3 font-sans">
                      <div className="font-sans font-medium text-slate-800 text-[13px]">
                        {hazard.title}
                      </div>
                      <div className="text-[12px] text-slate-400 font-sans font-normal mt-0.5">
                        {hazard.code} • {hazard.evaluacion.levelText}
                      </div>
                    </td>

                    {/* EPP Items List */}
                    <td data-label="Equipos de Protección Entregados" className="py-3.5 px-3 font-sans">
                      <div className="space-y-1 font-sans">
                        {hazard.planIntervencion.epp.items.map((item, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-slate-700 text-[12.5px] font-sans font-normal">
                            <CheckCircle2
                              className={`w-3.5 h-3.5 shrink-0 mt-px ${
                                isFirmada ? 'text-emerald-600' : 'text-slate-300'
                              }`}
                            />
                            <span>{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td data-label="Estado" className="py-3.5 px-3 text-center font-sans">
                      {isFirmada ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-sans font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Firmada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-sans font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Pendiente Firma
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td data-label="Acciones" className="py-3.5 px-3 text-right font-sans">
                      <div className="flex flex-wrap items-center justify-end gap-1.5 font-sans">
                        {!isFirmada ? (
                          <button
                            type="button"
                            onClick={() => onOpenActaModalForHazard(hazard)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[12.5px] font-sans font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          >
                            <PenTool className="w-3.5 h-3.5" />
                            <span>Firmar Acta</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePrintCertificate(hazard)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[12.5px] font-sans font-medium flex items-center gap-1 cursor-pointer transition-colors"
                            title="Ver e Imprimir Certificado Oficial"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Ver Certificado</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectHazard(hazard);
                            onNavigate('gestion-peligros');
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer transition-colors"
                          title="Ver en Gestión de Peligros"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Print Preview for Official Legal Certificate */}
      {selectedActaForPrint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 font-sans text-[13px]">
            {/* Certificate Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4 font-sans">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight font-sans">
                    Constancia Oficial de Dotación de EPP
                  </h2>
                  <p className="text-[12px] text-slate-500 font-sans font-normal mt-0.5">
                    Art. 2.2.4.6.24 Dec. 1072/2015 • Res. 0312/2019 • SG-SST
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedActaForPrint(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer font-sans"
              >
                ✕
              </button>
            </div>

            {/* Legal Body */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5 text-[13px] leading-relaxed text-slate-700 font-sans">
              <div className="grid grid-cols-2 gap-3 text-[12.5px] border-b border-slate-200 pb-3 font-sans">
                <div>
                  <span className="text-slate-500 font-sans font-normal text-[11.5px] block">EMPRESA:</span>
                  <span className="font-sans font-semibold text-slate-900">{company.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-sans font-normal text-[11.5px] block">NIT / CLASE DE RIESGO:</span>
                  <span className="font-sans font-semibold text-slate-900">{company.nit} • Riesgo IV (SURA)</span>
                </div>
                <div>
                  <span className="text-slate-500 font-sans font-normal text-[11.5px] block">TRABAJADOR RECEPTOR:</span>
                  <span className="font-sans font-semibold text-slate-900">
                    {workersDirectory[selectedActaForPrint.id]?.nombre || 'Operario de Planta'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-sans font-normal text-[11.5px] block">CÉDULA DE CIUDADANÍA:</span>
                  <span className="font-sans font-semibold text-slate-900">
                    {workersDirectory[selectedActaForPrint.id]?.cedula || 'N/A'}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-[13px] font-sans font-semibold text-slate-900 block mb-1.5">
                  ELEMENTOS DE PROTECCIÓN PERSONAL SUMINISTRADOS:
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc text-slate-800 font-sans text-[13px]">
                  {selectedActaForPrint.planIntervencion.epp.items.map((it, idx) => (
                    <li key={idx} className="font-sans font-normal leading-relaxed">
                      <strong className="font-medium text-slate-900">{it.text}</strong> — Inspeccionado y recibido a entera satisfacción.
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-[12px] text-slate-600 italic pt-2.5 border-t border-slate-200 font-sans font-normal leading-relaxed">
                "El trabajador se compromete al uso obligatorio, cuidado, mantenimiento y reporte inmediato de cualquier deterioro de los EPP suministrados conforme al Art. 2.2.4.6.24 del Decreto 1072 de 2015. El empleador garantiza la reposición oportuna sin costo para el trabajador."
              </p>
            </div>

            {/* Signatures & Stamp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-sans">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-sans">
                <div className="h-14 flex items-center justify-center">
                  <SignatureCarlosMendez />
                </div>
                <div className="border-t border-slate-300 pt-2 mt-1 font-sans">
                  <div className="text-[13px] font-sans font-semibold text-slate-900">Ing. Carlos Méndez</div>
                  <div className="text-[12px] text-slate-500 font-sans font-normal">
                    Especialista SST • Lic. 18492-2018 (DDS)
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center flex flex-col justify-between font-sans">
                <div className="h-14 flex items-center justify-center font-sans text-slate-700 italic text-base">
                  {workersDirectory[selectedActaForPrint.id]?.nombre || 'Firma de Recibido'}
                </div>
                <div className="border-t border-slate-300 pt-2 mt-1 font-sans">
                  <div className="text-[13px] font-sans font-semibold text-slate-900">
                    {workersDirectory[selectedActaForPrint.id]?.nombre || 'Trabajador'}
                  </div>
                  <div className="text-[12px] text-slate-500 font-sans font-normal">
                    C.C. {workersDirectory[selectedActaForPrint.id]?.cedula || 'N/A'} • Huella Digital Verificada
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 font-sans">
              <button
                type="button"
                onClick={() => setSelectedActaForPrint(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-[13px] font-sans font-medium text-slate-700 cursor-pointer transition-colors"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[13px] font-sans font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Certificado</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
