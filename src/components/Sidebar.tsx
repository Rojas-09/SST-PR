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
} from 'lucide-react';
import { ActiveView, CompanyInfo } from '../types';

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
}: SidebarProps) {
  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-full select-none font-sans py-4 px-3 text-[13px]">
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
        </div>

        {/* Primary Navigation in Spanish with Key SG-SST Names */}
        <nav className="space-y-0.5">
          {/* Inicio / Resumen General */}
          <button
            type="button"
            onClick={() => onNavigate('inicio')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer text-left ${
              activeView === 'inicio'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <Home className={`w-4 h-4 shrink-0 ${activeView === 'inicio' ? 'text-blue-600' : 'text-slate-600'}`} strokeWidth={1.75} />
              <span className="truncate">Inicio / Resumen</span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
              Panel
            </span>
          </button>

          {/* Matriz GTC 45 (Riesgos) */}
          <button
            type="button"
            onClick={() => onNavigate('matriz-gtc45')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-normal transition-colors cursor-pointer text-left ${
              activeView === 'matriz-gtc45'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <LayoutGrid className="w-4 h-4 text-slate-600 shrink-0" strokeWidth={1.75} />
              <span className="truncate">Matriz GTC 45</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 shrink-0">
              {hazardCount}
            </span>
          </button>

          {/* Gestión de Peligros e Intervención */}
          <button
            type="button"
            onClick={() => onNavigate('gestion-peligros')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-normal transition-colors cursor-pointer text-left ${
              activeView === 'gestion-peligros' || activeView === 'peligro-detalle'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <AlertTriangle className="w-4 h-4 text-slate-600 shrink-0" strokeWidth={1.75} />
              <span className="truncate">Gestión de Peligros</span>
            </div>
            {criticalCount > 0 && (
              <span className="text-[10px] font-medium bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md shrink-0">
                {criticalCount} crít.
              </span>
            )}
          </button>

          {/* Incapacidades y Ausentismo */}
          <button
            type="button"
            onClick={() => onNavigate('ausentismo')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-normal transition-colors cursor-pointer text-left ${
              activeView === 'ausentismo'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <Calendar className="w-4 h-4 text-purple-600 shrink-0" strokeWidth={1.75} />
              <span className="truncate">Incapacidades</span>
            </div>
            <span className="text-[11px] font-medium bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md shrink-0">
              {incapacidadCount} casos
            </span>
          </button>

          {/* Diagnóstico Res. 0312 */}
          <button
            type="button"
            onClick={() => onNavigate('diagnostico-0312')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-normal transition-colors cursor-pointer text-left ${
              activeView === 'diagnostico-0312'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
              <span className="truncate">Diagnóstico 0312</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 shrink-0 font-medium">
              60 Est.
            </span>
          </button>

          {/* Entrega de EPP y Firmas */}
          <button
            type="button"
            onClick={() => onNavigate('actas-entrega')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-normal transition-colors cursor-pointer text-left ${
              activeView === 'actas-entrega'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <ShieldCheck className={`w-4 h-4 shrink-0 ${activeView === 'actas-entrega' ? 'text-blue-600' : 'text-slate-600'}`} strokeWidth={1.75} />
              <span className="truncate">Actas y Entrega EPP</span>
            </div>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
              Legal
            </span>
          </button>

          {/* Capacitaciones SST */}
          <button
            type="button"
            onClick={() => onNavigate('capacitaciones')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-normal transition-colors cursor-pointer text-left ${
              activeView === 'capacitaciones'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <GraduationCap className={`w-4 h-4 shrink-0 ${activeView === 'capacitaciones' ? 'text-blue-600' : 'text-slate-600'}`} strokeWidth={1.75} />
              <span className="truncate">Capacitaciones SST</span>
            </div>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200/60">
              Plan ({capacitacionesCount})
            </span>
          </button>

          {/* Calendario SST */}
          <button
            type="button"
            onClick={() => onNavigate('calendario')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-normal transition-colors cursor-pointer text-left ${
              activeView === 'calendario'
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <CalendarDays className={`w-4 h-4 shrink-0 ${activeView === 'calendario' ? 'text-blue-600' : 'text-slate-600'}`} strokeWidth={1.75} />
              <span className="truncate">Calendario SST</span>
            </div>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Agenda
            </span>
          </button>

          {/* Próximos Vencimientos */}
          <button
            type="button"
            onClick={() => {
              onNavigate('inicio');
              setTimeout(() => {
                const el = document.getElementById('seccion-proximos-vencimientos');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 80);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-normal transition-colors cursor-pointer text-left text-slate-700 hover:bg-amber-50/60 hover:text-amber-900"
          >
            <div className="flex items-center gap-3 truncate">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" strokeWidth={1.75} />
              <span className="truncate">Próximos Vencimientos</span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
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
            <span className="truncate">Soldadura Bahía 4 (Nivel I)</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('gestion-peligros')}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12.5px] text-slate-800 hover:bg-red-50/60 hover:text-red-800 transition-colors cursor-pointer text-left truncate"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="truncate">Red Eléctrica 220V (Nivel I)</span>
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
          <span>Configuración ARL</span>
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
