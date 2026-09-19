import { useState } from 'react';
import {
  Sparkles,
  HelpCircle,
  Bell,
  CheckCircle2,
  Shield,
  Building2,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { CompanyInfo, ActiveView } from '../types';

interface ClayTopHeaderProps {
  company: CompanyInfo;
  criticalCount: number;
  onNavigate: (view: ActiveView) => void;
  onOpenNewHazard: () => void;
  onOpenSettings: () => void;
  onOpenMobileMenu?: () => void;
}

export function ClayTopHeader({
  company,
  criticalCount,
  onNavigate,
  onOpenNewHazard,
  onOpenSettings,
  onOpenMobileMenu,
}: ClayTopHeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-3 sm:px-5 flex items-center justify-between font-sans text-[13px] sticky top-0 z-20">
      {/* Left indicator with Mobile Hamburger button */}
      <div className="flex items-center gap-2">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
            title="Abrir menú"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-slate-900 text-[13.5px] sm:text-[14px] truncate">
            {company.name}
          </span>
          <span className="hidden sm:inline text-[11px] font-mono-data text-slate-400">
            NIT {company.nit}
          </span>
        </div>
      </div>

      {/* Right Clay-style controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Clay Vibrant Blue Primary Button */}
        <button
          type="button"
          onClick={onOpenNewHazard}
          className="bg-[#1877F2] hover:bg-[#1464CC] text-white rounded-lg px-2.5 sm:px-3.5 py-1.5 font-medium text-[12.5px] sm:text-[13px] flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span className="hidden xs:inline">+ Registrar</span>
          <span className="hidden sm:inline">Peligro</span>
        </button>

        {/* Riesgo & ARL Status Pill */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[12px] font-medium transition-colors cursor-pointer"
        >
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Riesgo IV • SURA</span>
        </button>

        {/* Help icon */}
        <button
          type="button"
          onClick={() => onNavigate('diagnostico-0312')}
          className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 cursor-pointer transition-colors"
          title="Guía técnica Resolución 0312 y GTC 45"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Notification bell with alert indicator */}
        <button
          type="button"
          onClick={() => onNavigate('gestion-peligros')}
          className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 relative cursor-pointer transition-colors"
          title={`${criticalCount} alertas críticas activas`}
        >
          <Bell className="w-4 h-4" />
          {criticalCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* User profile dropdown pill matching Clay */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-1.5 pr-1.5 sm:pr-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 font-bold text-[11px] flex items-center justify-center">
              CM
            </div>
            <div className="text-left hidden lg:block leading-tight">
              <div className="font-semibold text-slate-900 text-[12.5px] truncate max-w-[120px]">
                {company.responsableSST.nombre}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                Lic. {company.responsableSST.licencia}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center">
                  CM
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-[13px]">
                    {company.responsableSST.nombre}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {company.responsableSST.cargo}
                  </div>
                </div>
              </div>

              <div className="py-2 space-y-1.5 text-[12px] text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Licencia SST:</span>
                  <span className="font-medium text-slate-800">{company.responsableSST.licencia}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Curso 50 Horas:</span>
                  <span className="text-emerald-700 font-medium">{company.responsableSST.curso50h}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ARL Afiliada:</span>
                  <span className="text-slate-800">Seguros SURA</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full text-left text-[12px] text-blue-600 hover:underline font-medium cursor-pointer"
                >
                  Modificar datos de la empresa
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
