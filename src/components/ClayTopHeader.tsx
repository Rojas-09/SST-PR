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

        {/* User profile dropdown pill matching Clay with dynamic reactive name */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all bg-white shadow-2xs"
            title="Perfil de Usuario y Selección de Rol"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 ring-2 ring-blue-500/20">
              {initials}
            </div>
            <div className="text-left leading-tight max-w-[130px] sm:max-w-[180px] md:max-w-[220px]">
              <div className="font-bold text-slate-900 text-[12.5px] truncate">
                {currentUser.nombre}
              </div>
              <div className="text-[10px] text-blue-700 font-semibold truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{roleLabels[currentUser.rol]}</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-0.5" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-bold text-sm flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 text-[13.5px] truncate">
                    {currentUser.nombre}
                  </div>
                  <div className="text-[11px] text-blue-700 font-bold truncate">
                    {roleLabels[currentUser.rol]}
                  </div>
                  <div className="text-[10.5px] text-slate-500 truncate">
                    {currentUser.cargo}
                  </div>
                </div>
              </div>

              <div className="py-2.5 space-y-1.5 text-[11.5px] text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Entidad:</span>
                  <span className="font-medium text-slate-800 text-right truncate max-w-[170px]">{currentUser.entidad}</span>
                </div>
                {currentUser.licenciaOId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Licencia / Reg.:</span>
                    <span className="font-medium text-slate-800">{currentUser.licenciaOId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Empresa SG-SST:</span>
                  <span className="text-slate-900 font-semibold">Taller Los Andes S.A.S.</span>
                </div>
              </div>

              {/* Quick Role Switcher in Header Dropdown */}
              <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-blue-600" />
                    <span>Cambiar Rol Activo:</span>
                  </span>
                  <span className="text-[9.5px] text-slate-400 font-mono">RBAC Opción A</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['ADMINISTRADOR', 'RESPONSABLE_SST', 'INSTRUCTOR_EXTERNO', 'LECTURA'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        switchRole(r);
                        setShowProfileMenu(false);
                      }}
                      className={`px-2 py-1.5 text-[11px] rounded-lg text-left font-medium transition-all cursor-pointer ${
                        currentUser.rol === r
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      <div className="truncate font-semibold">
                        {r === 'ADMINISTRADOR'
                          ? '1. Administrador'
                          : r === 'RESPONSABLE_SST'
                          ? '2. Responsable SST'
                          : r === 'INSTRUCTOR_EXTERNO'
                          ? '3. Instructor Ext.'
                          : '4. Solo Lectura'}
                      </div>
                      <div className="text-[9.5px] opacity-80 truncate">
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

              <div className="pt-2 mt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full text-left text-[11.5px] text-blue-600 hover:underline font-medium cursor-pointer"
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
