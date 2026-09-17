import { AlertTriangle, LayoutGrid, FileText, PlusCircle, ShieldCheck } from 'lucide-react';
import { ActiveView, CompanyInfo } from '../types';

interface SidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  company: CompanyInfo;
  hazardCount: number;
}

export function Sidebar({ activeView, onNavigate, company, hazardCount }: SidebarProps) {
  const menuItems = [
    {
      id: 'peligros-lista' as ActiveView,
      label: 'Peligros',
      icon: AlertTriangle,
      badge: hazardCount,
    },
    {
      id: 'matriz-gtc45' as ActiveView,
      label: 'Matriz GTC 45',
      icon: LayoutGrid,
    },
    {
      id: 'diagnostico-0312' as ActiveView,
      label: 'Diagnóstico Res. 0312',
      icon: FileText,
    },
    {
      id: 'registrar-nuevo' as ActiveView,
      label: '+ Registrar Nuevo Peligro',
      icon: PlusCircle,
      isSpecial: true,
    },
  ];

  return (
    <aside className="w-64 bg-[#F8FAFC] border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Logo Section matching screenshot */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-200/60">
          <div className="w-10 h-10 rounded-lg bg-[#0F172A] flex items-center justify-center text-amber-500 shadow-xs">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight font-sans">SST</span>
              <span className="font-bold text-lg text-amber-600 font-sans">Fácil</span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block -mt-1 font-semibold">
              GESTIÓN SST SG-SST
            </span>
          </div>
        </div>

        {/* Empresa Activa Card */}
        <div className="p-3 m-3 bg-[#EFF4FF] border border-blue-100 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider">
              EMPRESA ACTIVA
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="mt-1 font-bold text-xs text-slate-900 truncate">{company.name}</div>
          <div className="text-[11px] font-mono text-slate-500">{company.nit}</div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = activeView === item.id || (item.id === 'peligros-lista' && activeView === 'peligro-detalle');

            if (item.isSpecial) {
              return (
                <div key={item.id} className="pt-2">
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#B15F00] text-white shadow-xs font-bold'
                        : 'bg-[#D97706]/10 text-[#92400E] hover:bg-[#D97706]/20'
                    }`}
                  >
                    <item.icon className="w-4 h-4 text-inherit" />
                    <span>{item.label}</span>
                  </button>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#B15F00] text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white font-bold' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile Card matching screenshot */}
      <div className="p-3 m-3 bg-[#EFF4FF] border border-blue-100 rounded-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#8D4B00] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              CM
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs text-slate-900 truncate">
                {company.responsableSST.nombre}
              </div>
              <div className="text-[10px] font-mono text-slate-500 leading-tight">
                Lic. {company.responsableSST.licencia}
              </div>
              <div className="text-[9px] font-mono text-slate-400 leading-tight">
                Res. 0312 / Dec. 1072
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#D97706] tracking-wider uppercase ml-1">
            ACTIVO
          </span>
        </div>
      </div>
    </aside>
  );
}
