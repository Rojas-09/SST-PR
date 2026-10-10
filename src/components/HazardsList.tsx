import { useState } from 'react';
import { PlusCircle, Search, AlertOctagon, ArrowRight, ShieldCheck, Camera, CheckSquare } from 'lucide-react';
import { HazardRecord, ActiveView, CompanyInfo } from '../types';
import { ConstanciaTecnicaCard } from './ConstanciaTecnicaCard';

interface HazardsListProps {
  hazards: HazardRecord[];
  searchQuery: string;
  onSelectHazard: (hazard: HazardRecord) => void;
  onNavigate: (view: ActiveView) => void;
  company?: CompanyInfo;
  onUpdateCompany?: (updated: CompanyInfo) => void;
}

export function HazardsList({
  hazards,
  searchQuery,
  onSelectHazard,
  onNavigate,
  company,
  onUpdateCompany,
}: HazardsListProps) {
  const [levelFilter, setLevelFilter] = useState<string>('ALL');

  const filtered = hazards.filter((h) => {
    const matchesSearch =
      searchQuery === '' ||
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.zonaLugar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.factorEspecifico.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel = levelFilter === 'ALL' || h.evaluacion.level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  return (
    <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 md:px-8 xl:px-10 py-5 sm:py-6 space-y-6 text-sm sm:text-base">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block font-semibold">
            SISTEMA DE GESTIÓN SST • INVENTARIO TÉCNICO
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            Peligros Identificados en Planta
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Inspección de campo activa para {company?.name || 'la empresa'}. Valoración según <strong>GTC 45:2012</strong>.
          </p>
        </div>

        <button
          onClick={() => onNavigate('registrar-nuevo')}
          className="px-4 py-2 bg-[#1877F2] hover:bg-[#1464CC] text-white text-[13px] font-medium rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
        >
          <PlusCircle className="w-4 h-4" /> Registrar Nuevo Peligro
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setLevelFilter('ALL')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
            levelFilter === 'ALL'
              ? 'bg-[#0F172A] text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Todos ({hazards.length})
        </button>
        <button
          onClick={() => setLevelFilter('NIVEL_I')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            levelFilter === 'NIVEL_I'
              ? 'bg-[#DC2626] text-white shadow-2xs'
              : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
          }`}
        >
          <span>✱</span> Nivel I Crítico ({hazards.filter((h) => h.evaluacion.level === 'NIVEL_I').length})
        </button>
        <button
          onClick={() => setLevelFilter('NIVEL_II')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
            levelFilter === 'NIVEL_II'
              ? 'bg-[#EA580C] text-white shadow-2xs'
              : 'bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200'
          }`}
        >
          Nivel II Alto ({hazards.filter((h) => h.evaluacion.level === 'NIVEL_II').length})
        </button>
        <button
          onClick={() => setLevelFilter('NIVEL_III')}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
            levelFilter === 'NIVEL_III'
              ? 'bg-[#CA8A04] text-white shadow-2xs'
              : 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border border-yellow-200'
          }`}
        >
          Nivel III Mejorable ({hazards.filter((h) => h.evaluacion.level === 'NIVEL_III').length})
        </button>
      </div>

      {/* Hazards Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((hazard) => {
          const isCritical = hazard.evaluacion.level === 'NIVEL_I';

          return (
            <div
              key={hazard.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Photo Header if available */}
                {hazard.evidenciaFotos.length > 0 && (
                  <div className="h-32 w-full relative bg-slate-900 overflow-hidden">
                    <img
                      src={hazard.evidenciaFotos[0].url}
                      alt={hazard.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/70 text-white backdrop-blur-xs flex items-center gap-1">
                        <Camera className="w-3 h-3" /> {hazard.evidenciaFotos.length} fotos
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow-xs ${
                          isCritical ? 'bg-[#DC2626]' : 'bg-[#CA8A04]'
                        }`}
                      >
                        NR {hazard.evaluacion.nr} • {hazard.evaluacion.levelText}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>{hazard.id}</span>
                    <span className="text-slate-600 font-semibold">{hazard.code}</span>
                  </div>

                  <h3 className="text-[15px] font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {hazard.title}
                  </h3>

                  <div className="mt-2 text-xs text-slate-500 font-sans">
                    <span className="font-semibold text-slate-700 block">{hazard.zonaLugar}</span>
                    <span className="text-[11px] block mt-0.5 text-slate-500">{hazard.actividadEspecifica}</span>
                  </div>

                  <div className="mt-3 p-2 bg-slate-50 border border-slate-100 rounded text-xs">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Factor Específico:
                    </span>
                    <span className="text-slate-800 font-medium text-[11px] line-clamp-1">
                      {hazard.factorEspecifico}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      hazard.estadoEntregaEPP === 'FIRMADA' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  <span className="text-slate-500 font-semibold">
                    {hazard.estadoEntregaEPP === 'FIRMADA' ? 'EPP Firmado' : 'EPP Pendiente'}
                  </span>
                </div>

                <button
                  onClick={() => onSelectHazard(hazard)}
                  className="px-3.5 py-1.5 bg-[#1877F2] hover:bg-[#1464CC] text-white rounded-lg text-[12.5px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <span>Ver Ficha</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Constancia Técnica y Responsabilidad Jurídica */}
      {company && (
        <ConstanciaTecnicaCard company={company} onUpdateCompany={onUpdateCompany} className="mt-8" />
      )}
    </div>
  );
}
