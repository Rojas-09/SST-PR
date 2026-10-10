import { useState, useRef, useEffect } from 'react';
import {
  HelpCircle,
  Bell,
  CheckCircle2,
  Shield,
  Building2,
  ChevronDown,
  Menu,
  ShieldCheck,
  KeyRound,
  Lock,
  ChevronsUpDown,
  Check,
  ArrowLeftRight,
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
  onOpenCompanySwitcher?: () => void;
  onSwitchCompany?: (companyId: string) => void;
}

export function ClayTopHeader({
  company,
  criticalCount,
  onNavigate,
  onOpenNewHazard,
  onOpenSettings,
  onOpenMobileMenu,
  onOpenCompanySwitcher,
  onSwitchCompany,
}: ClayTopHeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const companyMenuRef = useRef<HTMLDivElement>(null);
  const { currentUser, switchRole } = useAuthRole();
  const isSSTLeader = currentUser.rol === 'RESPONSABLE_SST';

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (companyMenuRef.current && !companyMenuRef.current.contains(event.target as Node)) {
        setShowCompanyMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleSelectCompany = (companyId: string) => {
    if (company.id === companyId) {
      setShowCompanyMenu(false);
      return;
    }
    if (!isSSTLeader) {
      // Si no es líder, abre el modal con aviso o permite ver
      setShowCompanyMenu(false);
      if (onOpenCompanySwitcher) onOpenCompanySwitcher();
      return;
    }
    if (onSwitchCompany) {
      onSwitchCompany(companyId);
    } else if (onOpenCompanySwitcher) {
      onOpenCompanySwitcher();
    }
    setShowCompanyMenu(false);
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-3 sm:px-5 flex items-center justify-between font-sans text-[13px] sticky top-0 z-20">
      {/* Left indicator with Mobile Hamburger and Modern Workspace Selector */}
      <div className="flex items-center gap-2 min-w-0">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors shrink-0"
            title="Abrir menú"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Enterprise Workspace Selector Pill */}
        <div className="relative flex-1 sm:flex-initial" ref={companyMenuRef}>
          <button
            type="button"
            onClick={() => {
              if (isSSTLeader) {
                setShowCompanyMenu((prev) => !prev);
              } else if (onOpenCompanySwitcher) {
                onOpenCompanySwitcher();
              }
            }}
            className={`flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-left transition-all group shadow-2xs w-full sm:w-auto sm:min-w-[190px] max-w-[200px] xs:max-w-[240px] md:max-w-[280px] lg:max-w-md anim-button ${
              isSSTLeader
                ? 'bg-slate-50/90 hover:bg-blue-50/70 border-slate-200 hover:border-blue-300 cursor-pointer'
                : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 cursor-pointer'
            }`}
            title={
              isSSTLeader
                ? 'Alternar de empresa activa (Multi-empresa Líder SG-SST)'
                : `Empresa vinculada: ${company.name} • Clic para ver ficha legal`
            }
            aria-label="Selector de empresa"
          >
            {/* Avatar / Sigla institucional */}
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 shadow-2xs transition-transform group-hover:scale-105 ${
                company.id === 'servic-crear'
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white'
                  : 'bg-slate-900 text-amber-400'
              }`}
            >
              {company.id === 'servic-crear' ? 'SC' : 'TLA'}
            </div>

            {/* Nombre y datos de la empresa con máxima claridad institucional */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-950 text-xs xs:text-sm sm:text-[15px] truncate block leading-tight tracking-tight">
                  {company.name}
                </span>
                {isSSTLeader ? (
                  <ChevronsUpDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 shrink-0 transition-colors" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-2xs" title="Empresa Activa" />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-600 font-mono leading-none mt-0.5">
                <span className="truncate font-semibold">NIT {company.nit}</span>
                <span className="text-slate-300">•</span>
                <span className="font-sans font-bold text-blue-700 truncate">
                  {company.id === 'servic-crear' ? 'SURA • Ibagué' : 'Positiva • Bogotá'}
                </span>
              </div>
            </div>
          </button>

          {/* Menú Desplegable Rápido de Alternar Empresa (EXCLUSIVO PARA LÍDER SG-SST) */}
          {showCompanyMenu && isSSTLeader && (
            <div className="absolute left-0 mt-2 w-[calc(100vw-2rem)] max-w-[340px] sm:w-88 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 anim-dropdown">
              <div className="px-2 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Organizaciones Registradas</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Multi-Empresa SG-SST
                </span>
              </div>

              <div className="py-2 space-y-1.5">
                {/* Opción 1: SERVIC CREAR S.A.S. */}
                <button
                  type="button"
                  onClick={() => handleSelectCompany('servic-crear')}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 anim-card ${
                    company.id === 'servic-crear'
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/30'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    SC
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs truncate">
                        SERVIC CREAR S.A.S.
                      </h4>
                      {company.id === 'servic-crear' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                          <Check className="w-3 h-3" />
                          Activa
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                          Cambiar
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      NIT 901306354-9 • Ibagué, Tolima
                    </p>
                    <p className="text-[10.5px] text-emerald-700 font-medium mt-0.5 truncate">
                      Saneamiento, tanques, alturas & paisajismo STIHL
                    </p>
                  </div>
                </button>

                {/* Opción 2: TALLER LOS ANDES S.A.S. */}
                <button
                  type="button"
                  onClick={() => handleSelectCompany('taller-los-andes')}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 anim-card ${
                    company.id === 'taller-los-andes'
                      ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-400/30'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    TLA
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs truncate">
                        Taller Los Andes S.A.S.
                      </h4>
                      {company.id === 'taller-los-andes' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-full">
                          <Check className="w-3 h-3" />
                          Activa
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                          Cambiar
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      NIT 901.458.210-3 • Bogotá D.C.
                    </p>
                    <p className="text-[10.5px] text-slate-600 font-medium mt-0.5 truncate">
                      Metalmecánica pesada, soldadura & automotriz
                    </p>
                  </div>
                </button>
              </div>

              {/* Botón para ver la Ficha Legal y Servicios completos */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                {onOpenCompanySwitcher && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCompanyMenu(false);
                      onOpenCompanySwitcher();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 transition-colors cursor-pointer anim-button"
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Ver Ficha Legal y Portafolio Completo</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Clay-style controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Riesgo & ARL Status Pill (Desktop only to prevent tablet overlap) */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
        >
          <Shield className="w-4 h-4 text-emerald-600" />
          <span className="truncate max-w-[180px]">{company.claseRiesgo || 'Riesgo IV'} • {company.arl || (company.id === 'servic-crear' ? 'SURA' : 'Positiva')}</span>
        </button>

        {/* Help icon / Guía técnica Res. 0312 & GTC 45 */}
        <button
          type="button"
          onClick={() => onNavigate('diagnostico-0312')}
          className="hidden sm:inline-flex items-center justify-center gap-1.5 h-9 min-w-[36px] px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 cursor-pointer transition-colors shadow-2xs shrink-0"
          title="Guía técnica Resolución 0312 y GTC 45"
          aria-label="Guía técnica Resolución 0312 y GTC 45"
        >
          <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="hidden lg:inline text-xs font-semibold text-slate-700">Guía 0312</span>
        </button>

        {/* Notification bell with alert indicator */}
        <button
          type="button"
          onClick={() => onNavigate('gestion-peligros')}
          className="h-9 w-9 min-w-[36px] rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-slate-900 relative cursor-pointer transition-colors shadow-2xs shrink-0"
          title={`${criticalCount} alertas críticas activas`}
          aria-label={`${criticalCount} alertas críticas activas`}
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
            <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-[360px] sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 sm:p-5 z-50 max-h-[85vh] overflow-y-auto anim-dropdown-right">
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
                  <span className="text-slate-900 font-bold truncate">{company.name}</span>
                </div>
                {onOpenCompanySwitcher && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenCompanySwitcher();
                    }}
                    className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 transition-colors cursor-pointer anim-button"
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isSSTLeader ? 'Alternar Entre Empresas (Líder SG-SST)' : `Ver Ficha Legal (${company.name})`}</span>
                  </button>
                )}
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
                          ? (company.id === 'servic-crear' ? 'Gerencia SERVIC CREAR' : 'Gerencia Taller Los Andes')
                          : r === 'RESPONSABLE_SST'
                          ? (company.id === 'servic-crear' ? 'Líder SG-SST Tolima' : 'Líder SG-SST Bogotá')
                          : r === 'INSTRUCTOR_EXTERNO'
                          ? (company.id === 'servic-crear' ? 'STIHL Col. / SURA' : 'Positiva ARL')
                          : (company.id === 'servic-crear' ? 'Auditor MinTrabajo Tolima' : 'Auditor Mintrabajo')}
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
