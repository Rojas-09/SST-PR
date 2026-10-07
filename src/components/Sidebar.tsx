import {
  Home,
  LayoutGrid,
  AlertTriangle,
  Calendar,
  FileCheck,
  ShieldCheck,
  Download,
  Trash2,
  Settings,
  Sparkles,
  BookOpen,
  ChevronRight,
  ShieldAlert,
  Building2,
  PlusCircle,
  Clock,
  GraduationCap,
  CalendarDays,
  X,
  Lock,
  ArrowLeftRight,
} from 'lucide-react';
import { ActiveView, CompanyInfo } from '../types';
import { useAuthRole } from '../context/AuthRoleContext';

interface SidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  company: CompanyInfo;
  hazardCount: number;
  incapacidadCount?: number;
  criticalCount?: number;
  capacitacionesCount?: number;
  onToggleChat?: () => void;
  onOpenSettings?: () => void;
  onOpenNewHazard?: () => void;
  onClose?: () => void;
  onOpenCompanySwitcher?: () => void;
  onSwitchCompany?: (companyId: string) => void;
}

export function Sidebar({
  activeView,
  onNavigate,
  company,
  hazardCount,
  incapacidadCount = 3,
  criticalCount = 2,
  capacitacionesCount = 6,
  onToggleChat,
  onOpenSettings,
  onOpenNewHazard,
  onClose,
  onOpenCompanySwitcher,
  onSwitchCompany,
}: SidebarProps) {
  const { currentUser } = useAuthRole();
  const isSSTLeader = currentUser.rol === 'RESPONSABLE_SST';
  const otherCompanyId = company.id === 'servic-crear' ? 'taller-los-andes' : 'servic-crear';
  const otherCompanyName = company.id === 'servic-crear' ? 'Taller Los Andes' : 'SERVIC CREAR';

  const handleToggleCompany = () => {
    if (isSSTLeader && onSwitchCompany) {
      onSwitchCompany(otherCompanyId);
      if (onClose) onClose();
    } else if (onOpenCompanySwitcher) {
      onOpenCompanySwitcher();
      if (onClose) onClose();
    }
  };
  // Cálculo dinámico de estándares aplicables según régimen Res. 0312
  const riskNum = company.claseRiesgo?.includes('V') && !company.claseRiesgo?.includes('IV') ? 5 :
                  company.claseRiesgo?.includes('IV') ? 4 :
                  company.claseRiesgo?.includes('III') ? 3 :
                  company.claseRiesgo?.includes('II') ? 2 : 1;
  const workers = company.trabajadores || 8;
  const applicableStandards = workers > 50 || riskNum >= 4 ? 60 : (workers >= 11 ? 21 : 7);

  return (
    <aside className="w-full md:w-60 bg-white md:border-r border-slate-200 flex flex-col justify-between shrink-0 h-full overflow-y-auto select-none font-sans py-4 px-3 text-[13px]">
      <div className="space-y-4">
        {/* Clay-style Brand Logo Header */}
        <div className="px-2 py-1 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('matriz-gtc45')}
            className="flex items-center gap-2 cursor-pointer text-left group"
          >
            {/* Clay-like colorful mark */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-amber-400 flex items-center justify-center shadow-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[17px] text-slate-900 tracking-tight">SST</span>
              <span className="font-bold text-[17px] text-blue-600 tracking-tight">Fácil</span>
            </div>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Cerrar menú"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modern Enterprise Organization Card with direct switcher action */}
        <div className="mx-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                company.id === 'servic-crear'
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white'
                  : 'bg-slate-900 text-amber-400'
              }`}
            >
              {company.id === 'servic-crear' ? 'SC' : 'TLA'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-slate-900 text-xs truncate leading-tight" title={company.name}>
                {company.name}
              </div>
              <div className="text-[10px] font-mono text-slate-400 truncate">
                NIT {company.nit}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10.5px] px-1 text-slate-500 font-medium">
            <span>{company.sede?.includes('Ibagué') ? 'Ibagué, Tolima' : 'Bogotá D.C.'}</span>
            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded">
              {company.claseRiesgo?.includes('IV') ? 'Riesgo IV' : 'Riesgo III'}
            </span>
          </div>

          {/* Botón explícito para alternar directamente a la otra empresa - EXCLUSIVO PARA LÍDER SG-SST */}
          {isSSTLeader && (
            <button
              type="button"
              onClick={handleToggleCompany}
              className="w-full py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border bg-white hover:bg-blue-50 text-blue-700 border-blue-200 shadow-2xs anim-button"
              title={`Alternar de empresa activa a ${otherCompanyName}`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">Alternar a {otherCompanyName}</span>
            </button>
          )}

          {onOpenCompanySwitcher && (
            <button
              type="button"
              onClick={() => {
                onOpenCompanySwitcher();
                if (onClose) onClose();
              }}
              className="w-full text-center text-[10.5px] text-slate-500 hover:text-blue-700 font-medium hover:underline transition-colors cursor-pointer pt-0.5 anim-button"
            >
              {isSSTLeader ? 'Ver ficha legal y portafolio →' : `Ver ficha legal de ${company.name} →`}
            </button>
          )}
        </div>

        {/* Primary Navigation in Spanish with Key SG-SST Names and Fluid Micro-interactions */}
        <nav className="space-y-1">
          {/* Inicio */}
          <button
            type="button"
            onClick={() => onNavigate('inicio')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium anim-menu-item group cursor-pointer text-left ${
              activeView === 'inicio'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs border-l-2 border-blue-600 pl-2.5'
                : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Home className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${activeView === 'inicio' ? 'text-blue-600' : 'text-slate-600'}`} strokeWidth={1.75} />
              <span>Inicio</span>
            </div>
          </button>

          {/* Matriz GTC 45 */}
          <button
            type="button"
            onClick={() => onNavigate('matriz-gtc45')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] anim-menu-item group cursor-pointer text-left ${
              activeView === 'matriz-gtc45'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs border-l-2 border-blue-600 pl-2.5'
                : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-4 h-4 text-slate-600 shrink-0 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.75} />
              <span>Matriz GTC 45</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 shrink-0 group-hover:bg-slate-200 px-1.5 py-0.2 rounded transition-colors">
              {hazardCount}
            </span>
          </button>

          {/* Peligros */}
          <button
            type="button"
            onClick={() => onNavigate('gestion-peligros')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] anim-menu-item group cursor-pointer text-left ${
              activeView === 'gestion-peligros' || activeView === 'peligro-detalle'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs border-l-2 border-blue-600 pl-2.5'
                : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-slate-600 shrink-0 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.75} />
              <span>Peligros</span>
            </div>
            {criticalCount > 0 && (
              <span className="text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60 px-1.5 py-0.5 rounded shrink-0">
                {criticalCount}
              </span>
            )}
          </button>

          {/* Incapacidades */}
          <button
            type="button"
            onClick={() => onNavigate('ausentismo')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] anim-menu-item group cursor-pointer text-left ${
              activeView === 'ausentismo'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs border-l-2 border-blue-600 pl-2.5'
                : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-purple-600 shrink-0 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.75} />
              <span>Incapacidades</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 shrink-0 group-hover:bg-slate-200 px-1.5 py-0.2 rounded transition-colors">
              {incapacidadCount}
            </span>
          </button>

          {/* Estándares 0312 */}
          <button
            type="button"
            onClick={() => onNavigate('diagnostico-0312')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] anim-menu-item group cursor-pointer text-left ${
              activeView === 'diagnostico-0312'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs border-l-2 border-blue-600 pl-2.5'
                : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.75} />
              <span>Estándares 0312</span>
            </div>
            <span className="text-[10px] font-mono font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded shrink-0">
              {applicableStandards}
            </span>
          </button>

          {/* Entrega EPP */}
          <button
            type="button"
            onClick={() => onNavigate('actas-entrega')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] anim-menu-item group cursor-pointer text-left ${
              activeView === 'actas-entrega'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs border-l-2 border-blue-600 pl-2.5'
                : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${activeView === 'actas-entrega' ? 'text-blue-600' : 'text-slate-600'}`} strokeWidth={1.75} />
              <span>Entrega EPP</span>
            </div>
          </button>

          {/* Capacitaciones */}
          <button
            type="button"
            onClick={() => onNavigate('capacitaciones')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] anim-menu-item group cursor-pointer text-left ${
              activeView === 'capacitaciones'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs border-l-2 border-blue-600 pl-2.5'
                : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <GraduationCap className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${activeView === 'capacitaciones' ? 'text-blue-600' : 'text-slate-600'}`} strokeWidth={1.75} />
              <span>Capacitaciones</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 shrink-0 group-hover:bg-slate-200 px-1.5 py-0.2 rounded transition-colors">
              {capacitacionesCount}
            </span>
          </button>

          {/* Calendario */}
          <button
            type="button"
            onClick={() => onNavigate('calendario')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] anim-menu-item group cursor-pointer text-left ${
              activeView === 'calendario'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs border-l-2 border-blue-600 pl-2.5'
                : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <CalendarDays className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${activeView === 'calendario' ? 'text-blue-600' : 'text-slate-600'}`} strokeWidth={1.75} />
              <span>Calendario</span>
            </div>
          </button>

          {/* Vencimientos */}
          <button
            type="button"
            onClick={() => onNavigate('vencimientos')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] anim-menu-item group cursor-pointer text-left ${
              activeView === 'vencimientos'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs border-l-2 border-blue-600 pl-2.5'
                : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.75} />
              <span>Vencimientos</span>
            </div>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60">
              Alertas
            </span>
          </button>
        </nav>

        {/* Sección de Peligros Críticos Prioritarios */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">
              Atención Inmediata
            </span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </div>

          <button
            type="button"
            onClick={() => onNavigate('gestion-peligros')}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12.5px] text-slate-800 hover:bg-red-50/60 hover:text-red-800 transition-colors cursor-pointer text-left truncate"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="truncate">
              {company.id === 'servic-crear' ? 'Tanques Agua Potable (Nivel I)' : 'Soldadura Bahía 4 (Nivel I)'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('gestion-peligros')}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12.5px] text-slate-800 hover:bg-red-50/60 hover:text-red-800 transition-colors cursor-pointer text-left truncate"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="truncate">
              {company.id === 'servic-crear' ? 'Poda STIHL Zonas Verdes (Nivel II)' : 'Red Eléctrica 220V (Nivel I)'}
            </span>
          </button>
        </div>
      </div>

      {/* Clay-style Bottom Utilities Navigation */}
      <div className="space-y-0.5 border-t border-slate-100 pt-3">
        {/* Exportar Reportes */}
        <button
          type="button"
          onClick={() => onNavigate('matriz-gtc45')}
          className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] font-normal text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer text-left"
        >
          <Download className="w-4 h-4 text-slate-600" strokeWidth={1.75} />
          <span>Exportar Matriz</span>
        </button>

        {/* Asistente IA Normativo */}
        <button
          type="button"
          onClick={onToggleChat}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] font-medium text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-blue-600" strokeWidth={1.75} />
            <span>Asistente Copilot</span>
          </div>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-md font-semibold">
            IA
          </span>
        </button>

        {/* Configuración de la Empresa */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] font-normal text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer text-left"
        >
          <Settings className="w-4 h-4 text-slate-600" strokeWidth={1.75} />
          <span>Configuración ARL ({company.id === 'servic-crear' ? 'SURA' : 'Positiva'})</span>
        </button>

        {/* Normativas y Recursos */}
        <button
          type="button"
          onClick={() => onNavigate('diagnostico-0312')}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] font-normal text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-slate-600" strokeWidth={1.75} />
            <span>Recursos GTC 45</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </aside>
  );
}
