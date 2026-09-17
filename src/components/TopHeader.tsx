import { useState } from 'react';
import { Search, User, ShieldAlert, ChevronDown, CheckCircle2 } from 'lucide-react';
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
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Search Bar matching screenshot */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar peligro, puesto, EPP..."
          className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D97706]/30 focus:border-[#D97706] transition-all font-sans"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-mono"
          >
            ✕
          </button>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Nivel I Crítico badge */}
        <button
          onClick={onFilterCritical}
          className="flex items-center gap-1.5 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-xs font-mono font-semibold transition-colors cursor-pointer shadow-2xs"
          title="Ver peligros con Nivel I Crítico (Paralización inmediata)"
        >
          <span className="text-red-600 font-bold">✱</span>
          <span>Nivel I Crítico {criticalCount}</span>
        </button>

        {/* Company Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-blue-50/70 border border-blue-200 text-blue-900 rounded text-xs font-medium font-sans">
          <span>{company.name}</span>
          <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
        </div>

        {/* User profile avatar */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-8 h-8 rounded-full bg-[#8D4B00] text-white flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shadow-xs focus:ring-2 focus:ring-[#D97706]"
            aria-label="Perfil de usuario SST"
          >
            <User className="w-4 h-4" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 p-4 z-50 text-left">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-full bg-[#8D4B00] text-white flex items-center justify-center font-bold">
                  CM
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">{company.responsableSST.nombre}</h4>
                  <p className="text-xs text-slate-500">{company.responsableSST.cargo}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-600 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Licencia {company.responsableSST.licencia}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-2 text-xs font-sans text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Curso 50 Horas:</span>
                  <span className="font-semibold text-emerald-700">{company.responsableSST.curso50h}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Normativa Vigente:</span>
                  <span className="font-mono text-slate-700">Res. 0312 / Dec. 1072</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hash Firma Electrónica:</span>
                  <span className="font-mono text-[11px] text-slate-500">{company.responsableSST.hashFirma}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400">Perfil legal idóneo:</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold rounded">
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
