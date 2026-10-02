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
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { CompanyInfo, ActiveView } from '../types';
import { useAuthRole } from '../context/AuthRoleContext';
import { UserRole } from '../types/capacitaciones';

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
  const { currentUser, switchRole, availableUsers } = useAuthRole();

  const initials = currentUser.nombre
    .replace(/^(Ing\.|Ft\.|Dr\.|Dra\.|Téc\.)\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'US';

  const roleLabels: Record<UserRole, string> = {
    ADMINISTRADOR: 'Administrador (Gerencia)',
    RESPONSABLE_SST: 'Responsable SG-SST',
    INSTRUCTOR_EXTERNO: 'Instructor Externo',
    LECTURA: 'Auditoría / Lectura',
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-3 sm:px-5 flex items-center justify-between font-sans text-[13px] sticky top-0 z-20">
      {/* Left indicator with Mobile Hamburger button */}
      <div className="flex items-center gap-2 min-w-0">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors shrink-0"
            title="Abrir menú"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-slate-900 text-[13.5px] sm:text-[14px] truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none">
            {company.name}
          </span>
          <span className="hidden sm:inline text-[11px] font-mono-data text-slate-400 shrink-0">
            NIT {company.nit}
          </span>
        </div>
      </div>

      {/* Right Clay-style controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Clay Vibrant Blue Primary Button */}
        <button
          type="button"
          onClick={onOpenNewHazard}
          className="bg-[#1877F2] hover:bg-[#1464CC] text-white rounded-lg px-2.5 sm:px-3.5 py-1.5 font-medium text-[12px] sm:text-[13px] flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
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

        {/* Help icon (hidden on small phones to save header space) */}
        <button
          type="button"
          onClick={() => onNavigate('diagnostico-0312')}
          className="hidden sm:flex w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 items-center justify-center text-slate-600 cursor-pointer transition-colors"
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

        {/* User profile dropdown pill matching Clay with dynamic reactive name */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-1.5 sm:pr-2.5 sm:py-1 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all bg-white shadow-2xs"
            title="Perfil de Usuario y Selección de Rol"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-black text-sm flex items-center justify-center shrink-0 ring-2 ring-blue-500/20 shadow-2xs">
              {initials}
            </div>
            <div className="hidden md:block text-left leading-tight md:max-w-[200px] lg:max-w-[280px]">
              <div className="font-bold text-slate-900 text-sm truncate">
                {currentUser.nombre}
              </div>
              <div className="text-xs text-blue-700 font-bold truncate flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>{roleLabels[currentUser.rol]}</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-[360px] sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 sm:p-5 z-50 animate-in fade-in">
              <div className="flex items-center gap-3.5 pb-3.5 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-slate-900 text-amber-400 font-black text-base flex items-center justify-center shrink-0 ring-2 ring-blue-500/20 shadow-xs">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-slate-900 text-base truncate">
                    {currentUser.nombre}
                  </div>
                  <div className="text-sm text-blue-700 font-bold truncate">
                    {roleLabels[currentUser.rol]}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 truncate mt-0.5">
                    {currentUser.cargo}
                  </div>
                </div>
              </div>

              <div className="py-3.5 space-y-2.5 text-xs sm:text-sm text-slate-700">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 font-medium">Entidad:</span>
                  <span className="font-bold text-slate-900 text-right truncate">{currentUser.entidad}</span>
                </div>
                {currentUser.licenciaOId && (
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-500 shrink-0 font-medium">Licencia / Reg.:</span>
                    <span className="font-bold text-slate-900 truncate font-mono">{currentUser.licenciaOId}</span>
                  </div>
                )}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0 font-medium">Empresa SG-SST:</span>
                  <span className="text-slate-900 font-bold truncate">Taller Los Andes S.A.S.</span>
                </div>
              </div>

              {/* Quick Role Switcher in Header Dropdown */}
              <div className="pt-3.5 border-t border-slate-100 space-y-2.5">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    <span>Cambiar Rol Activo:</span>
                  </span>
                  <span className="text-xs text-slate-500 font-mono font-bold">RBAC SG-SST</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {(['ADMINISTRADOR', 'RESPONSABLE_SST', 'INSTRUCTOR_EXTERNO', 'LECTURA'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        switchRole(r);
                        setShowProfileMenu(false);
                      }}
                      className={`p-3 text-xs sm:text-sm rounded-xl text-left font-medium transition-all cursor-pointer ${
                        currentUser.rol === r
                          ? 'bg-blue-600 text-white font-bold shadow-md'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                      }`}
                    >
                      <div className="truncate font-bold">
                        {r === 'ADMINISTRADOR'
                          ? '1. Administrador'
                          : r === 'RESPONSABLE_SST'
                          ? '2. Responsable SST'
                          : r === 'INSTRUCTOR_EXTERNO'
                          ? '3. Instructor Ext.'
                          : '4. Solo Lectura'}
                      </div>
                      <div className={`text-xs truncate mt-0.5 ${currentUser.rol === r ? 'text-blue-100' : 'text-slate-500'}`}>
                        {r === 'ADMINISTRADOR'
                          ? 'Gerencia General'
                          : r === 'RESPONSABLE_SST'
                          ? 'Líder SG-SST'
                          : r === 'INSTRUCTOR_EXTERNO'
                          ? 'Positiva ARL'
                          : 'Auditor Mintrabajo'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2.5 mt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full text-left text-xs text-blue-600 hover:text-blue-700 hover:underline font-semibold cursor-pointer"
                >
                  Configuración institucional SG-SST
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
