import { useState } from 'react';
import { Search, ChevronDown, CheckCircle2, ShieldAlert } from 'lucide-react';
import { CompanyInfo } from '../types';

interface TopHeaderProps {
  company: CompanyInfo;
  criticalCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onFilterCritical: () => void;
  onSelectCompany?: () => void;
}

export function TopHeader({
  company,
  criticalCount,
  searchQuery,
  onSearchChange,
  onFilterCritical,
}: TopHeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-13 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 font-sans">
      {/* Search Bar matching Linear style */}
      <div className="relative w-full max-w-sm">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar peligro, puesto, EPP o código..."
          className="w-full pl-8 pr-4 py-1 text-xs bg-slate-50 border border-slate-200 rounded-[4px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800 transition-colors font-sans"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 font-mono cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        {/* Nivel I Crítico encapsulated pill badge */}
        <button
          type="button"
          onClick={onFilterCritical}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium transition-colors cursor-pointer border bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20"
          title="Filtrar peligros con Nivel I Crítico (Paro inmediato)"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
          <span>Nivel I Crítico ({criticalCount})</span>
        </button>

        {/* Company Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-800 rounded-[4px] text-[11px] font-medium">
          <span className="truncate max-w-[140px]">{company.name}</span>
          <span className="text-[9px] font-mono text-slate-400">R-IV</span>
        </div>

        {/* User profile avatar */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-7 h-7 rounded-[4px] bg-[#0F172A] text-amber-400 flex items-center justify-center font-mono font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
            aria-label="Perfil de usuario SST"
          >
            CM
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-[5px] shadow-lg border border-slate-200 p-3.5 z-50 text-left animate-in fade-in">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-2.5">
                <div className="w-8 h-8 rounded-[4px] bg-[#0F172A] text-amber-400 flex items-center justify-center font-bold text-xs">
                  CM
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {company.responsableSST.nombre}
                  </h4>
                  <p className="text-[11px] text-slate-500">{company.responsableSST.cargo}</p>
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-600 mt-0.5 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Licencia {company.responsableSST.licencia}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 space-y-1.5 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Curso 50 Horas:</span>
                  <span className="font-semibold text-emerald-700">{company.responsableSST.curso50h}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Normativa:</span>
                  <span className="font-mono text-slate-700">Res. 0312 / Dec. 1072</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hash Firma:</span>
                  <span className="font-mono text-[10px] text-slate-500">{company.responsableSST.hashFirma}</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-[10px]">
                <span className="text-slate-400 uppercase tracking-wide">Perfil Legal:</span>
                <span className="px-1.5 py-0.2 rounded-full font-mono font-medium bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                  HABILITADO
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

