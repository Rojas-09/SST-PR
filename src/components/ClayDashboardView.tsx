import { useState, useMemo, MouseEvent, FormEvent } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Plus,
  Star,
  MoreHorizontal,
  Folder,
  FileSpreadsheet,
  AlertTriangle,
  Calendar,
  FileCheck,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
  Clock,
  User,
  Info,
  Edit2,
  Copy,
  FolderInput,
  Tag,
  Trash2,
  ChevronUp,
} from 'lucide-react';
import { HazardRecord, CompanyInfo, ActiveView, IncapacidadRecord } from '../types';

interface ClayDashboardViewProps {
  hazards: HazardRecord[];
  incapacidades: IncapacidadRecord[];
  company: CompanyInfo;
  onSelectHazard: (hazard: HazardRecord) => void;
  onNavigate: (view: ActiveView) => void;
  onOpenNewHazard: () => void;
  onAskCopilot?: (question: string) => void;
}

export function ClayDashboardView({
  hazards,
  incapacidades,
  company,
  onSelectHazard,
  onNavigate,
  onOpenNewHazard,
  onAskCopilot,
}: ClayDashboardViewProps) {
  const [showHero, setShowHero] = useState(true);
  const [heroPrompt, setHeroPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'gtc45' | 'incapacidades' | 'diagnostico'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    'item-gtc-1': true,
    'item-inc-1': true,
  });
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const toggleFavorite = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleHeroSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (heroPrompt.trim() && onAskCopilot) {
      onAskCopilot(heroPrompt);
      setHeroPrompt('');
    }
  };

  // Build uniform table rows matching Clay
  const tableRows = useMemo(() => {
    const rows = [
      // Matriz GTC 45 General
      {
        id: 'item-gtc-1',
        title: 'Matriz GTC 45 General • Taller Los Andes S.A.S.',
        code: 'SST-MR-001',
        category: 'gtc45',
        tags: [{ label: 'Matriz Oficial', color: 'blue' }, { label: 'Riesgo IV', color: 'amber' }],
        createdAt: '15 Mar, 2025',
        lastOpened: 'Hace 10 minutos',
        owner: 'Ing. Carlos Méndez',
        access: 'Editar',
        targetView: 'matriz-gtc45' as ActiveView,
        hazardRef: null,
      },
      // Hazard 1
      {
        id: 'item-haz-1',
        title: hazards[0]?.title || 'Soldadura y corte sin careta fotosensible ni guantes 16"',
        code: hazards[0]?.code || 'PEL-2024-001',
        category: 'gtc45',
        tags: [{ label: 'Nivel I Crítico', color: 'red' }, { label: 'Paro Inmediato', color: 'red' }],
        createdAt: '14 Feb, 2025',
        lastOpened: 'Hace 1 hora',
        owner: 'Ing. Carlos Méndez',
        access: 'Editar',
        targetView: 'gestion-peligros' as ActiveView,
        hazardRef: hazards[0],
      },
      // Hazard 2
      {
        id: 'item-haz-2',
        title: hazards[1]?.title || 'Red eléctrica 220V expuesta a filtraciones de lluvia en bodega',
        code: hazards[1]?.code || 'PEL-2024-002',
        category: 'gtc45',
        tags: [{ label: 'Nivel I Crítico', color: 'red' }, { label: 'Riesgo Eléctrico', color: 'amber' }],
        createdAt: '18 Feb, 2025',
        lastOpened: 'Ayer',
        owner: 'Ing. Carlos Méndez',
        access: 'Editar',
        targetView: 'gestion-peligros' as ActiveView,
        hazardRef: hazards[1],
      },
      // Incapacidad 1 (Hernando Vargas)
      {
        id: 'item-inc-1',
        title: 'Incapacidad: Hernando Vargas • M54.5 Lumbago Mecánico (Foso)',
        code: 'INC-2025-001',
        category: 'incapacidades',
        tags: [{ label: 'Incapacidad Médica', color: 'purple' }, { label: 'Accidente Trabajo', color: 'amber' }],
        createdAt: '15 Feb, 2025',
        lastOpened: 'Ayer',
        owner: 'Ing. Carlos Méndez',
        access: 'Editar',
        targetView: 'ausentismo' as ActiveView,
        hazardRef: null,
      },
      // Incapacidad 2 (Javier Ortiz)
      {
        id: 'item-inc-2',
        title: 'Incapacidad: Javier Ortiz • S61.0 Herida en mano (Amoladora)',
        code: 'INC-2025-002',
        category: 'incapacidades',
        tags: [{ label: 'Incapacidad Médica', color: 'purple' }, { label: '5 Días Perdidos', color: 'purple' }],
        createdAt: '02 Feb, 2025',
        lastOpened: 'Hace 3 días',
        owner: 'Ing. Carlos Méndez',
        access: 'Editar',
        targetView: 'ausentismo' as ActiveView,
        hazardRef: null,
      },
      // Diagnóstico Res. 0312
      {
        id: 'item-diag-1',
        title: 'Diagnóstico Estándares Mínimos Resolución 0312/2019 (21 Estándares)',
        code: 'RES-0312-TLA',
        category: 'diagnostico',
        tags: [{ label: 'Cumplimiento 78.5%', color: 'emerald' }, { label: 'Auditoría MinTrabajo', color: 'blue' }],
        createdAt: '20 Ene, 2025',
        lastOpened: 'Hace 4 horas',
        owner: 'Ing. Carlos Méndez',
        access: 'Editar',
        targetView: 'diagnostico-0312' as ActiveView,
        hazardRef: null,
      },
      // Hazard 3 (Cocina)
      {
        id: 'item-haz-3',
        title: hazards[2]?.title || 'Piso resbaloso por grasas y líquidos en zona de cafetería',
        code: hazards[2]?.code || 'PEL-2024-003',
        category: 'gtc45',
        tags: [{ label: 'Nivel III Mejorable', color: 'amber' }],
        createdAt: '10 Feb, 2025',
        lastOpened: 'Hace 5 días',
        owner: 'Ing. Carlos Méndez',
        access: 'Editar',
        targetView: 'gestion-peligros' as ActiveView,
        hazardRef: hazards[2],
      },
    ];

    return rows.filter((r) => {
      // Tab filter
      if (activeTab === 'gtc45' && r.category !== 'gtc45') return false;
      if (activeTab === 'incapacidades' && r.category !== 'incapacidades') return false;
      if (activeTab === 'diagnostico' && r.category !== 'diagnostico') return false;

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          r.tags.some((t) => t.label.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [hazards, activeTab, searchQuery]);

  return (
    <div className="flex-1 bg-white min-h-full flex flex-col font-sans text-[13px] text-slate-800 p-6 md:p-8">
      {/* Clay-style Hero Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[20px] md:text-[22px] font-bold text-slate-900 tracking-tight">
            Hola {company.responsableSST.nombre.split(' ')[1] || 'Carlos'}, ¿listo para gestionar el SG-SST?
          </h1>
          <button
            type="button"
            onClick={() => setShowHero(!showHero)}
            className="flex items-center gap-1 text-[12px] font-medium text-slate-500 hover:text-slate-800 cursor-pointer border border-slate-200 px-2 py-1 rounded-md"
          >
            <span>{showHero ? 'Mostrar menos' : 'Mostrar accesos'}</span>
            {showHero ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showHero && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Clay-style Colorful Search / Copilot Input Bar */}
            <form
              onSubmit={handleHeroSubmit}
              className="relative flex items-center bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 focus-within:border-blue-500 transition-colors p-1"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 flex items-center justify-center text-white ml-2 shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={heroPrompt}
                onChange={(e) => setHeroPrompt(e.target.value)}
                placeholder="Pregúntame cualquier norma del SG-SST, cálculo de GTC 45 o describe qué peligro deseas registrar..."
                className="w-full bg-transparent px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="w-7 h-7 rounded-lg bg-[#1877F2] hover:bg-[#1464CC] text-white flex items-center justify-center mr-1 cursor-pointer transition-colors shadow-2xs shrink-0"
                title="Consultar Copilot"
              >
                ↑
              </button>
            </form>

            {/* 4 Clay-style Quick Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Card 1: Matriz GTC 45 */}
              <div
                onClick={() => onNavigate('matriz-gtc45')}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    🔍
                  </div>
                  <h3 className="font-semibold text-slate-900 text-[13.5px] group-hover:text-blue-600">
                    Matriz GTC 45
                  </h3>
                </div>
                <p className="text-[12px] text-slate-500 leading-relaxed">
                  Evalúa deficiencia, exposición y calcula el Nivel de Riesgo (NR = NP × NC).
                </p>
              </div>

              {/* Card 2: Incapacidades y Ausentismo (DESTACADO Y DIRECTO) */}
              <div
                onClick={() => onNavigate('ausentismo')}
                className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/30 hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                    🏥
                  </div>
                  <h3 className="font-semibold text-blue-900 text-[13.5px] group-hover:text-blue-700">
                    Incapacidades y Ausentismo
                  </h3>
                </div>
                <p className="text-[12px] text-slate-600 leading-relaxed">
                  Registra certificados CIE-10, calcula días perdidos y costos de ARL/EPS.
                </p>
              </div>

              {/* Card 3: Peligros Críticos */}
              <div
                onClick={() => onNavigate('gestion-peligros')}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-red-400 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
                    ⚠️
                  </div>
                  <h3 className="font-semibold text-slate-900 text-[13.5px] group-hover:text-red-600">
                    Peligros Críticos (Nivel I)
                  </h3>
                </div>
                <p className="text-[12px] text-slate-500 leading-relaxed">
                  2 situaciones con orden de intervención obligatoria en soldadura y bodega 220V.
                </p>
              </div>

              {/* Card 4: Diagnóstico 0312 */}
              <div
                onClick={() => onNavigate('diagnostico-0312')}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    📋
                  </div>
                  <h3 className="font-semibold text-slate-900 text-[13.5px] group-hover:text-blue-600">
                    Estándares Res. 0312
                  </h3>
                </div>
                <p className="text-[12px] text-slate-500 leading-relaxed">
                  Verifica los 21 estándares mínimos de Ley (78.5% cumplimiento legal).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clay-style Segmented Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'border border-blue-500 text-blue-600 bg-white shadow-2xs'
              : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Todos los registros
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('gtc45')}
          className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
            activeTab === 'gtc45'
              ? 'border border-blue-500 text-blue-600 bg-white shadow-2xs'
              : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Matriz GTC 45 ({hazards.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('incapacidades')}
          className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
            activeTab === 'incapacidades'
              ? 'border border-blue-500 text-blue-600 bg-white shadow-2xs'
              : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Incapacidades Médicas ({incapacidades.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('diagnostico')}
          className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
            activeTab === 'diagnostico'
              ? 'border border-blue-500 text-blue-600 bg-white shadow-2xs'
              : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Diagnóstico 0312 (21)
        </button>
      </div>

      {/* Table Header Controls matching Clay */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">
            {activeTab === 'incapacidades'
              ? 'Registros de Incapacidad y Ausentismo'
              : activeTab === 'gtc45'
              ? 'Peligros y Valoración GTC 45'
              : activeTab === 'diagnostico'
              ? 'Estándares Mínimos Res. 0312'
              : 'Todos los Registros del SG-SST'}
          </h2>

          <div className="flex items-center gap-1.5 ml-3">
            {/* Responsable dropdown pill */}
            <div className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[12px] text-slate-700">
              <span className="text-slate-400">Responsable:</span>
              <span className="font-medium">Todos</span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </div>

            {/* Filtros dropdown pill */}
            <div className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[12px] text-slate-700 cursor-pointer hover:bg-slate-50">
              <SlidersHorizontal className="w-3 h-3 text-slate-500" />
              <span>Filtros</span>
            </div>
          </div>
        </div>

        {/* Right Search & Clay Vibrant Blue Button */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar registro..."
              className="pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-[12.5px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 w-44 transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={onOpenNewHazard}
            className="bg-[#1877F2] hover:bg-[#1464CC] text-white rounded-lg px-3.5 py-1.5 font-medium text-[13px] flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nuevo</span>
          </button>
        </div>
      </div>

      {/* The Clay Table Container */}
      <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-2xs">
        <table className="table-stack-lg w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-[12px] font-semibold text-slate-600">
              <th className="py-2.5 px-2.5 font-semibold w-[22%]">Nombre del Registro</th>
              <th className="py-2.5 px-1.5 text-center w-[4%] font-semibold" title="Favorito">★</th>
              <th className="py-2.5 px-2.5 font-semibold w-[16%]">Etiquetas / Estado</th>
              <th className="py-2.5 px-2.5 font-semibold w-[13%]">Fecha de Creación</th>
              <th className="py-2.5 px-2.5 font-semibold w-[13%]">Última Edición</th>
              <th className="py-2.5 px-2.5 font-semibold w-[14%]">Responsable</th>
              <th className="py-2.5 px-2.5 font-semibold w-[10%]">Acceso</th>
              <th className="py-2.5 px-1.5 text-center w-[8%] font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tableRows.map((row) => {
              const isFav = !!favorites[row.id];
              return (
                <tr
                  key={row.id}
                  onClick={() => {
                    if (row.hazardRef) {
                      onSelectHazard(row.hazardRef);
                    } else if (row.targetView) {
                      onNavigate(row.targetView);
                    }
                  }}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Nombre & Icon */}
                  <td data-label="Nombre del Registro" className="py-3 px-2">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                        {row.category === 'incapacidades' ? (
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        ) : row.category === 'diagnostico' ? (
                          <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <FileSpreadsheet className="w-3.5 h-3.5 text-slate-700" />
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-slate-900 group-hover:text-blue-600 block">
                          {row.title}
                        </span>
                        <span className="text-[11px] font-mono-data text-slate-400">
                          {row.code}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Favorito Star */}
                  <td data-label="Favorito" className="py-3 px-1 text-center">
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(row.id, e)}
                      className="p-1 hover:text-amber-500 cursor-pointer transition-colors"
                      title={isFav ? 'Quitar de favoritos' : 'Marcar favorito'}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  </td>

                  {/* Tags */}
                  <td data-label="Etiquetas / Estado" className="py-3 px-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {row.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            tag.color === 'red'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : tag.color === 'purple'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : tag.color === 'emerald'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : tag.color === 'amber'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Creado el */}
                  <td data-label="Fecha de Creación" className="py-3 px-3 text-slate-500 text-[12.5px]">
                    {row.createdAt}
                  </td>

                  {/* Última edición */}
                  <td data-label="Última Edición" className="py-3 px-3 text-slate-500 text-[12.5px]">
                    {row.lastOpened}
                  </td>

                  {/* Responsable */}
                  <td data-label="Responsable" className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-900 text-amber-400 text-[10px] font-bold flex items-center justify-center">
                        CM
                      </div>
                      <span className="text-[12.5px] text-slate-700">
                        {row.owner}
                      </span>
                    </div>
                  </td>

                  {/* Acceso */}
                  <td data-label="Acceso" className="py-3 px-3">
                    <span className="text-[12px] text-slate-500 font-medium hover:text-slate-900">
                      {row.access}
                    </span>
                  </td>

                  {/* More Menu (...) with Context Menu matching Clay */}
                  <td data-label="Acciones" className="py-3 px-2 text-center relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === row.id ? null : row.id);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {/* Clay Context Menu Popup */}
                    {activeMenuId === row.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-3 top-8 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-left text-[12.5px] text-slate-700 animate-in fade-in"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            if (row.hazardRef) onSelectHazard(row.hazardRef);
                            else if (row.targetView) onNavigate(row.targetView);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-50 text-slate-800 cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5 text-slate-400" />
                          <span>Ver detalle técnico</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            if (row.hazardRef) onSelectHazard(row.hazardRef);
                            else if (row.targetView) onNavigate(row.targetView);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-50 text-slate-800 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Editar valoración</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            toggleFavorite(row.id, e);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-50 text-slate-800 cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-500" />
                          <span>{isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(null)}
                          className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-50 text-slate-800 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Duplicar registro</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(null)}
                          className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-50 text-slate-800 cursor-pointer"
                        >
                          <FolderInput className="w-3.5 h-3.5 text-slate-400" />
                          <span>Mover a proceso</span>
                        </button>
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(null)}
                          className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-red-50 text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          <span>Eliminar registro</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Direct Banner to Incapacidades if user wants to see it immediately */}
      <div className="mt-6 p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            🏥
          </div>
          <div>
            <h4 className="font-semibold text-blue-950 text-[13.5px]">
              Módulo de Ausentismo Laboral e Incapacidades Médicas (CIE-10)
            </h4>
            <p className="text-[12px] text-blue-800 leading-snug">
              Actualmente hay 3 incapacidades radicadas ({company.name}). Consulta el cálculo de días perdidos, costos asumidos por EPS/ARL y estadísticas de severidad.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('ausentismo')}
          className="bg-[#1877F2] hover:bg-[#1464CC] text-white rounded-lg px-4 py-2 font-medium text-[13px] shadow-2xs cursor-pointer transition-colors shrink-0"
        >
          Abrir Módulo de Incapacidades →
        </button>
      </div>
    </div>
  );
}
