import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight,
  FileCheck,
  Building,
  Plus,
  Copy,
  Check,
  Clock,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Eye,
  Printer,
  Camera,
  Activity,
  UserCheck,
  ShieldCheck,
  AlertOctagon,
  FileText,
  Filter,
  Table as TableIcon,
  LayoutGrid,
} from 'lucide-react';
import { HazardRecord, CompanyInfo, ActiveView, RiskLevel } from '../types';
import { calculateGTC45, NP_LABELS, NC_LABELS } from '../utils/gtc45Calculator';

interface GestionPeligrosSplitViewProps {
  hazards: HazardRecord[];
  company: CompanyInfo;
  selectedHazardId?: string;
  onSelectHazard: (hazard: HazardRecord) => void;
  onUpdateHazard: (updated: HazardRecord) => void;
  onNavigate: (view: ActiveView) => void;
  onOpenActaModal: () => void;
}

export function GestionPeligrosSplitView({
  hazards,
  company,
  selectedHazardId,
  onSelectHazard,
  onUpdateHazard,
  onNavigate,
  onOpenActaModal,
}: GestionPeligrosSplitViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('TODOS');
  const [filterProceso, setFilterProceso] = useState<string>('TODOS');
  const [filterRutinaria, setFilterRutinaria] = useState<'TODOS' | 'RUTINARIA' | 'NO_RUTINARIA'>('TODOS');
  const [displayMode, setDisplayMode] = useState<'SPLIT' | 'TABULAR'>('SPLIT');
  const [copiedCode, setCopiedCode] = useState(false);

  // Active hazard state
  const currentHazard = useMemo(() => {
    if (selectedHazardId) {
      const found = hazards.find((h) => h.id === selectedHazardId);
      if (found) return found;
    }
    return hazards[0] || null;
  }, [hazards, selectedHazardId]);

  // Filters
  const filteredHazards = useMemo(() => {
    return hazards.filter((h) => {
      const matchSearch =
        h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.zonaLugar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.proceso.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.descripcionDetallada && h.descripcionDetallada.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchLevel = filterLevel === 'TODOS' || h.evaluacion.level === filterLevel;
      const matchProceso = filterProceso === 'TODOS' || h.proceso.toLowerCase().includes(filterProceso.toLowerCase());
      const matchRutinaria =
        filterRutinaria === 'TODOS' ||
        (filterRutinaria === 'RUTINARIA' && h.rutinaria) ||
        (filterRutinaria === 'NO_RUTINARIA' && !h.rutinaria);

      return matchSearch && matchLevel && matchProceso && matchRutinaria;
    });
  }, [hazards, searchTerm, filterLevel, filterProceso, filterRutinaria]);

  // Counts for filters and KPI bar
  const countI = hazards.filter((h) => h.evaluacion.level === 'NIVEL_I').length;
  const countII = hazards.filter((h) => h.evaluacion.level === 'NIVEL_II').length;
  const countIII = hazards.filter((h) => h.evaluacion.level === 'NIVEL_III').length;
  const countIV = hazards.filter((h) => h.evaluacion.level === 'NIVEL_IV').length;
  const totalExpuestos = hazards.reduce((acc, curr) => acc + (curr.operariosExpuestos || 0), 0);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Real-time calculation change
  const handleUpdateEvaluation = (newNp: number, newNc: number) => {
    if (!currentHazard) return;
    const newEval = calculateGTC45(newNp, newNc);
    const updated: HazardRecord = {
      ...currentHazard,
      evaluacion: newEval,
    };
    onUpdateHazard(updated);
  };

  const toggleEppCheck = (eppId: string) => {
    if (!currentHazard) return;
    const updatedItems = currentHazard.planIntervencion.epp.items.map((item) =>
      item.id === eppId ? { ...item, checked: !item.checked } : item
    );
    const updated: HazardRecord = {
      ...currentHazard,
      planIntervencion: {
        ...currentHazard.planIntervencion,
        epp: {
          ...currentHazard.planIntervencion.epp,
          items: updatedItems,
        },
      },
    };
    onUpdateHazard(updated);
  };

  // Helper for encapsulated pill badges
  const renderLevelBadge = (level: RiskLevel) => {
    switch (level) {
      case 'NIVEL_I':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-sans font-normal bg-red-100 text-red-800 border border-red-200">
            Nivel I • Crítico
          </span>
        );
      case 'NIVEL_II':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-sans font-normal bg-amber-100 text-amber-800 border border-amber-200">
            Nivel II • Alto
          </span>
        );
      case 'NIVEL_III':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-sans font-normal bg-yellow-100 text-yellow-800 border border-yellow-200">
            Nivel III • Mejorable
          </span>
        );
      case 'NIVEL_IV':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-sans font-normal bg-emerald-100 text-emerald-800 border border-emerald-200">
            Nivel IV • Aceptable
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-[13px] text-slate-800">
      {/* HEADER BANNER CON CONTEXTO NORMATIVO */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5 font-sans">
            <span className="text-[11.5px] font-sans font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              GTC 45:2012 • DECRETO 1072/2015 ART. 2.2.4.6.15 • RES. 0312 ÍTEM 4.1.2
            </span>
            <span className="text-[12px] text-slate-500 font-sans font-normal">• Matriz de Identificación y Valoración</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-sans">
            Gestión de Peligros e Intervención GTC 45
          </h1>
          <p className="text-[13px] font-sans font-normal text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Identificación sistemática de peligros, valoración cuantitativa del nivel de riesgo (NR = NP × NC) y jerarquía de controles de seguridad y salud en el trabajo para las operaciones activas de {company.name} (CIIU {company.ciiu} - {company.claseRiesgo}).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 font-sans">
          {/* Display Mode Switch */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 font-sans">
            <button
              type="button"
              onClick={() => setDisplayMode('SPLIT')}
              className={`px-3 py-1.5 rounded-md text-[12.5px] font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                displayMode === 'SPLIT'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Vista Dividida</span>
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('TABULAR')}
              className={`px-3 py-1.5 rounded-md text-[12.5px] font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                displayMode === 'TABULAR'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Vista Tabular</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('actas-entrega')}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[13px] font-sans font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span>Actas de Dotación EPP</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('registrar-nuevo')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[13px] font-sans font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nuevo Peligro</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-sans">
        <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs font-sans">
          <span className="text-[12px] font-sans font-normal text-slate-500 block">Total Registrados</span>
          <span className="text-xl font-bold text-slate-900 block mt-0.5 font-sans">{hazards.length}</span>
          <span className="text-[12px] font-sans font-normal text-slate-500 mt-1 block">Expedientes técnicos</span>
        </div>

        <div className="bg-white rounded-lg border border-red-200 p-3.5 shadow-2xs bg-red-50/20 font-sans">
          <span className="text-[12px] font-sans font-normal text-red-700 block">Nivel I • Crítico</span>
          <span className="text-xl font-bold text-red-700 block mt-0.5 font-sans">{countI}</span>
          <span className="text-[12px] font-sans font-normal text-red-600 mt-1 block">Intervención inmediata</span>
        </div>

        <div className="bg-white rounded-lg border border-amber-200 p-3.5 shadow-2xs bg-amber-50/20 font-sans">
          <span className="text-[12px] font-sans font-normal text-amber-800 block">Nivel II • Alto</span>
          <span className="text-xl font-bold text-amber-800 block mt-0.5 font-sans">{countII}</span>
          <span className="text-[12px] font-sans font-normal text-amber-700 mt-1 block">Control específico</span>
        </div>

        <div className="bg-white rounded-lg border border-yellow-200 p-3.5 shadow-2xs bg-yellow-50/20 font-sans">
          <span className="text-[12px] font-sans font-normal text-yellow-800 block">Nivel III • Mejorable</span>
          <span className="text-xl font-bold text-yellow-800 block mt-0.5 font-sans">{countIII}</span>
          <span className="text-[12px] font-sans font-normal text-yellow-700 mt-1 block">Monitoreo periódico</span>
        </div>

        <div className="bg-white rounded-lg border border-emerald-200 p-3.5 shadow-2xs bg-emerald-50/20 font-sans">
          <span className="text-[12px] font-sans font-normal text-emerald-800 block">Nivel IV • Aceptable</span>
          <span className="text-xl font-bold text-emerald-800 block mt-0.5 font-sans">{countIV}</span>
          <span className="text-[12px] font-sans font-normal text-emerald-700 mt-1 block">Riesgo controlado</span>
        </div>

        <div className="bg-white rounded-lg border border-blue-200 p-3.5 shadow-2xs bg-blue-50/20 font-sans">
          <span className="text-[12px] font-sans font-normal text-blue-700 block">Operarios Expuestos</span>
          <span className="text-xl font-bold text-blue-800 block mt-0.5 font-sans">{totalExpuestos}</span>
          <span className="text-[12px] font-sans font-normal text-blue-600 mt-1 block">Planta activa (8 trab.)</span>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 font-sans">
        {/* Search input with explicit font-sans & 13px */}
        <div className="relative flex-1 min-w-[240px] max-w-md font-sans">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código, peligro, proceso o zona de taller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-[13px] font-sans font-normal text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Level Filters */}
        <div className="flex flex-wrap items-center gap-1.5 font-sans">
          <span className="text-[12px] font-sans font-normal text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Nivel:
          </span>

          <button
            type="button"
            onClick={() => setFilterLevel('TODOS')}
            className={`px-2.5 py-1 rounded-md text-[12.5px] font-sans font-normal transition-colors cursor-pointer ${
              filterLevel === 'TODOS'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todos ({hazards.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterLevel('NIVEL_I')}
            className={`px-2.5 py-1 rounded-md text-[12.5px] font-sans font-normal transition-colors cursor-pointer border ${
              filterLevel === 'NIVEL_I'
                ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
            }`}
          >
            Nivel I ({countI})
          </button>

          <button
            type="button"
            onClick={() => setFilterLevel('NIVEL_II')}
            className={`px-2.5 py-1 rounded-md text-[12.5px] font-sans font-normal transition-colors cursor-pointer border ${
              filterLevel === 'NIVEL_II'
                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            Nivel II ({countII})
          </button>

          <button
            type="button"
            onClick={() => setFilterLevel('NIVEL_III')}
            className={`px-2.5 py-1 rounded-md text-[12.5px] font-sans font-normal transition-colors cursor-pointer border ${
              filterLevel === 'NIVEL_III'
                ? 'bg-yellow-600 text-white border-yellow-600 shadow-2xs'
                : 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100'
            }`}
          >
            Nivel III ({countIII})
          </button>

          <button
            type="button"
            onClick={() => setFilterLevel('NIVEL_IV')}
            className={`px-2.5 py-1 rounded-md text-[12.5px] font-sans font-normal transition-colors cursor-pointer border ${
              filterLevel === 'NIVEL_IV'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Nivel IV ({countIV})
          </button>
        </div>

        {/* Routine filter */}
        <div className="flex items-center gap-1 font-sans">
          <button
            type="button"
            onClick={() => setFilterRutinaria(filterRutinaria === 'RUTINARIA' ? 'TODOS' : 'RUTINARIA')}
            className={`px-2.5 py-1 rounded-md text-[12px] font-sans font-normal cursor-pointer transition-colors ${
              filterRutinaria === 'RUTINARIA'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Solo Rutinarias
          </button>
        </div>
      </div>

      {/* CONDITIONAL DISPLAY: TABULAR VIEW VS SPLIT MASTER-DETAIL VIEW */}
      {displayMode === 'TABULAR' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden font-sans">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between font-sans">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 font-sans">
                Matriz General de Peligros e Intervención (Formato GTC 45)
              </h3>
              <p className="text-[12px] text-slate-500 font-sans font-normal mt-0.5">
                Tabla unificada de valoración cuantitativa y jerarquía de controles de seguridad en taller
              </p>
            </div>
            <span className="text-[12px] font-sans text-slate-500">
              {filteredHazards.length} registros listados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="table-stack-lg w-full text-left border-collapse font-sans text-[13px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-[12px] font-sans font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-2.5 font-sans w-[10%]">Código / Proceso</th>
                  <th className="py-3 px-2.5 font-sans w-[18%]">Peligro y Descripción</th>
                  <th className="py-3 px-2.5 font-sans w-[12%]">Clasificación GTC 45</th>
                  <th className="py-3 px-2 font-sans text-center w-[9%]">NP × NC = NR</th>
                  <th className="py-3 px-2 font-sans text-center w-[10%]">Nivel de Riesgo</th>
                  <th className="py-3 px-2.5 font-sans w-[19%]">Intervención Principal</th>
                  <th className="py-3 px-2 font-sans text-center w-[9%]">Estado EPP</th>
                  <th className="py-3 px-2.5 font-sans text-right w-[13%]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px] font-sans">
                {filteredHazards.map((hazard) => (
                  <tr
                    key={hazard.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer font-sans"
                    onClick={() => {
                      onSelectHazard(hazard);
                      setDisplayMode('SPLIT');
                    }}
                  >
                    <td data-label="Código / Proceso" className="py-3 px-2.5 font-sans">
                      <div className="font-semibold text-slate-900 text-[13px] font-sans">{hazard.code}</div>
                      <div className="text-[12px] text-slate-500 font-sans font-normal">{hazard.proceso}</div>
                    </td>

                    <td data-label="Peligro y Descripción" className="py-3 px-2.5 font-sans">
                      <div className="font-medium text-slate-900 text-[13px] font-sans">{hazard.title}</div>
                      <div className="text-[12px] text-slate-500 font-sans font-normal">{hazard.subtitle}</div>
                    </td>

                    <td data-label="Clasificación GTC 45" className="py-3 px-2.5 font-sans">
                      <span className="px-2 py-0.5 rounded text-[12px] font-sans font-normal bg-slate-100 text-slate-700 border border-slate-200 inline-block">
                        {hazard.tipoPeligroGeneral}
                      </span>
                    </td>

                    <td data-label="NP × NC = NR" className="py-3 px-2 text-center font-sans">
                      <span className="font-sans font-medium text-slate-800 text-[13px]">
                        {hazard.evaluacion.np} × {hazard.evaluacion.nc} = {hazard.evaluacion.nr}
                      </span>
                    </td>

                    <td data-label="Nivel de Riesgo" className="py-3 px-2 text-center font-sans">
                      {renderLevelBadge(hazard.evaluacion.level)}
                    </td>

                    <td data-label="Intervención Principal" className="py-3 px-2.5 font-sans">
                      <div className="text-[12.5px] font-sans text-slate-700 font-normal">
                        {hazard.planIntervencion.ingenieria.titulo || hazard.planIntervencion.administrativa.titulo}
                      </div>
                    </td>

                    <td data-label="Estado EPP" className="py-3 px-2 text-center font-sans">
                      {hazard.estadoEntregaEPP === 'FIRMADA' ? (
                        <span className="inline-flex items-center gap-1 text-[12px] font-sans text-emerald-700 font-normal">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Firmada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[12px] font-sans text-amber-700 font-normal">
                          <Clock className="w-3.5 h-3.5 shrink-0" /> Pendiente
                        </span>
                      )}
                    </td>

                    <td data-label="Acciones" className="py-3 px-2.5 text-right font-sans">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectHazard(hazard);
                          setDisplayMode('SPLIT');
                        }}
                        className="px-2.5 py-1 text-blue-600 hover:bg-blue-50 rounded text-[12.5px] font-sans font-medium cursor-pointer transition-colors"
                      >
                        Inspeccionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* MASTER-DETAIL WORKSPACE (2 COLUMNS: LIST + COMPLETE TECHNICAL INSPECTION) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
          {/* LEFT COLUMN: LIST OF HAZARDS (4 COLS) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-sans">
              <span className="text-[12px] font-sans font-normal text-slate-600">
                Peligros Identificados ({filteredHazards.length})
              </span>
              <span className="text-[12px] font-sans font-normal text-slate-500">Taller Los Andes S.A.S.</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[820px] overflow-y-auto font-sans">
              {filteredHazards.length === 0 ? (
                <div className="p-8 text-center text-[13px] font-sans font-normal text-slate-500">
                  No se encontraron peligros con los filtros seleccionados.
                </div>
              ) : (
                filteredHazards.map((hazard) => {
                  const isSelected = currentHazard?.id === hazard.id;
                  return (
                    <div
                      key={hazard.id}
                      onClick={() => {
                        onSelectHazard(hazard);
                      }}
                      className={`p-4 transition-all cursor-pointer text-left border-l-4 font-sans ${
                        isSelected
                          ? 'bg-blue-50/50 border-l-blue-600 shadow-2xs'
                          : 'border-l-transparent hover:bg-slate-50'
                      }`}
                    >
                      {/* Row 1: Code, Proceso & Badge */}
                      <div className="flex items-center justify-between gap-2 mb-1.5 font-sans">
                        <span className="text-[12px] font-sans font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {hazard.code}
                        </span>
                        {renderLevelBadge(hazard.evaluacion.level)}
                      </div>

                      {/* Row 2: Title */}
                      <h3 className="text-[13px] font-sans font-semibold text-slate-900 leading-snug mb-1">
                        {hazard.title}
                      </h3>

                      {/* Row 3: Subtitle/Proceso */}
                      <p className="text-[12.5px] font-sans font-normal text-slate-600 line-clamp-2 leading-relaxed mb-2">
                        {hazard.subtitle}
                      </p>

                      {/* Row 4: Ubicación & Exposición */}
                      <div className="flex items-center justify-between text-[12px] font-sans font-normal text-slate-500 pt-2 border-t border-slate-100">
                        <span className="truncate max-w-[170px]">{hazard.zonaLugar}</span>
                        <span>{hazard.operariosExpuestos} expuestos</span>
                      </div>

                      {/* Row 5: Formula GTC 45 & EPP Status */}
                      <div className="flex items-center justify-between text-[12px] font-sans font-normal pt-2 mt-1">
                        <span className="text-slate-700 bg-slate-100/80 px-1.5 py-0.5 rounded border border-slate-200 font-sans">
                          NP {hazard.evaluacion.np} × NC {hazard.evaluacion.nc} = NR {hazard.evaluacion.nr}
                        </span>

                        {hazard.estadoEntregaEPP === 'FIRMADA' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-sans font-normal">
                            <CheckCircle2 className="w-3.5 h-3.5" /> EPP Firmada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-sans font-normal">
                            <Clock className="w-3.5 h-3.5" /> EPP Pendiente
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: DETAILED INSPECTION PANEL WITH GTC 45 CALCULATOR & INTERVENTION (8 COLS) */}
          {currentHazard ? (
            <div className="lg:col-span-8 space-y-5 font-sans">
              {/* CARD 1: FICHA TÉCNICA PRINCIPAL DEL PELIGRO SELECCIONADO */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4 font-sans">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 font-sans">
                  <div className="flex items-center gap-2 font-sans">
                    <span className="text-[12px] font-sans font-medium text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                      ID: {currentHazard.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(currentHazard.code)}
                      className="text-slate-400 hover:text-slate-700 p-1 transition-colors cursor-pointer font-sans"
                      title="Copiar código del peligro"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <span className="text-slate-300">•</span>
                    <span className="text-[12px] font-sans font-normal text-slate-600">
                      {currentHazard.macroproceso} / {currentHazard.proceso}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-sans">
                    {renderLevelBadge(currentHazard.evaluacion.level)}
                    <span className="text-[12px] font-sans font-normal text-slate-500">
                      Inspección: {currentHazard.fechaInspeccion}
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug font-sans">
                    {currentHazard.title}
                  </h2>
                  <p className="text-[13px] font-sans font-normal text-slate-600 mt-1.5 leading-relaxed">
                    {currentHazard.subtitle}
                  </p>
                  {currentHazard.descripcionDetallada && (
                    <p className="text-[13px] font-sans font-normal text-slate-600 mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200/80 leading-relaxed">
                      {currentHazard.descripcionDetallada}
                    </p>
                  )}
                </div>

                {/* Parámetros Operativos del Puesto */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 font-sans">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 font-sans">
                    <span className="text-[11.5px] font-sans font-normal text-slate-500 block">ÁREA / LUGAR</span>
                    <span className="text-[13px] font-sans font-normal text-slate-800 block mt-0.5">
                      {currentHazard.zonaLugar}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 font-sans">
                    <span className="text-[11.5px] font-sans font-normal text-slate-500 block">OPERARIOS EXPUESTOS</span>
                    <span className="text-[13px] font-sans font-normal text-slate-800 block mt-0.5">
                      {currentHazard.operariosExpuestos} trabajadores directos
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 font-sans">
                    <span className="text-[11.5px] font-sans font-normal text-slate-500 block">ACTIVIDAD</span>
                    <span className="text-[13px] font-sans font-normal text-slate-800 block mt-0.5">
                      {currentHazard.rutinaria ? 'Rutinaria (Diaria)' : 'No Rutinaria'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 font-sans">
                    <span className="text-[11.5px] font-sans font-normal text-slate-500 block">CLASIFICACIÓN GTC 45</span>
                    <span className="text-[13px] font-sans font-normal text-slate-800 block mt-0.5 truncate">
                      {currentHazard.tipoPeligroGeneral}
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD 2: CALCULADORA INTERACTIVA DE RIESGO GTC 45 EN TIEMPO REAL */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4 font-sans">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2 font-sans">
                  <div className="flex items-center gap-2 font-sans">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-semibold text-slate-900 font-sans">
                      Evaluación y Recálculo de Riesgo en Tiempo Real (GTC 45)
                    </h3>
                  </div>
                  <span className="text-[12px] font-sans font-normal text-slate-500">
                    Fórmula oficial: NR = Probabilidad (NP) × Consecuencia (NC)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                  {/* Selector Nivel de Probabilidad (NP) */}
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5 font-sans">
                    <div className="flex items-center justify-between font-sans">
                      <label className="text-[12.5px] font-sans font-normal text-slate-700">
                        1. Nivel de Probabilidad (NP):
                      </label>
                      <span className="text-[13px] font-sans font-medium text-slate-900">
                        NP = {currentHazard.evaluacion.np} ({NP_LABELS[currentHazard.evaluacion.np]?.label})
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 pt-1 font-sans">
                      {[1, 2, 3, 4, 5].map((val) => {
                        const isActive = currentHazard.evaluacion.np === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleUpdateEvaluation(val, currentHazard.evaluacion.nc)}
                            className={`py-2 px-1 rounded-md text-center transition-all cursor-pointer border font-sans ${
                              isActive
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className="text-[13px] font-sans font-medium">{val}</div>
                            <div className="text-[11px] font-sans font-normal leading-none mt-0.5">
                              {NP_LABELS[val]?.label.slice(0, 5)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[12px] font-sans font-normal text-slate-500 leading-relaxed">
                      {NP_LABELS[currentHazard.evaluacion.np]?.desc}
                    </p>
                  </div>

                  {/* Selector Nivel de Consecuencia / Severidad (NC) */}
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5 font-sans">
                    <div className="flex items-center justify-between font-sans">
                      <label className="text-[12.5px] font-sans font-normal text-slate-700">
                        2. Nivel de Consecuencia / Severidad (NC):
                      </label>
                      <span className="text-[13px] font-sans font-medium text-slate-900">
                        NC = {currentHazard.evaluacion.nc} ({NC_LABELS[currentHazard.evaluacion.nc]?.label})
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 pt-1 font-sans">
                      {[1, 2, 3, 4, 5].map((val) => {
                        const isActive = currentHazard.evaluacion.nc === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleUpdateEvaluation(currentHazard.evaluacion.np, val)}
                            className={`py-2 px-1 rounded-md text-center transition-all cursor-pointer border font-sans ${
                              isActive
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className="text-[13px] font-sans font-medium">{val}</div>
                            <div className="text-[11px] font-sans font-normal leading-none mt-0.5">
                              {NC_LABELS[val]?.label.slice(0, 5)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[12px] font-sans font-normal text-slate-500 leading-relaxed">
                      {NC_LABELS[currentHazard.evaluacion.nc]?.desc}
                    </p>
                  </div>
                </div>

                {/* Dictamen Dinámico Resultante */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs font-sans">
                  <div className="font-sans">
                    <div className="flex items-center gap-2 font-sans">
                      <span className="text-[12px] font-sans font-normal text-slate-500">
                        DICTAMEN GTC 45:
                      </span>
                      <span className="text-[13px] font-sans font-semibold text-slate-900">
                        NP ({currentHazard.evaluacion.np}) × NC ({currentHazard.evaluacion.nc}) = NR {currentHazard.evaluacion.nr} ({currentHazard.evaluacion.levelText})
                      </span>
                    </div>
                    <div className="text-[13px] font-sans font-semibold text-slate-900 mt-1">
                      Aceptabilidad: {currentHazard.evaluacion.aceptabilidad}
                    </div>
                    <p className="text-[13px] font-sans font-normal text-slate-600 mt-1 max-w-2xl leading-relaxed">
                      {currentHazard.evaluacion.normativaText}
                    </p>
                  </div>

                  <div className="sm:text-right shrink-0 p-3 bg-slate-50 rounded-lg border border-slate-100 font-sans">
                    <span className="text-[11.5px] font-sans font-normal text-slate-500 block">PLAZO LEGAL INTERVENCIÓN</span>
                    <span className="text-[13px] font-sans font-semibold text-red-700 block mt-0.5">
                      {currentHazard.planIntervencion.plazoLegal}
                    </span>
                    <span className="text-[11px] font-sans font-normal text-slate-500 mt-0.5 block">
                      Dec. 1072 Art. 2.2.4.6.24
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD 3: EFECTOS EN SALUD Y VIGILANCIA EPIDEMIOLÓGICA */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3.5 font-sans">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 font-sans">
                  <div className="flex items-center gap-2 font-sans">
                    <Activity className="w-4 h-4 text-red-600" />
                    <h3 className="text-sm font-semibold text-slate-900 font-sans">
                      Efectos en la Salud y Patologías Ocupacionales Previstas
                    </h3>
                  </div>
                  <span className="text-[12px] font-sans font-normal text-slate-500">
                    Protocolo de Vigilancia Médica
                  </span>
                </div>

                <p className="text-[13px] font-sans font-normal text-slate-700 leading-relaxed">
                  {currentHazard.efectosSalud}
                </p>

                {currentHazard.patologiasPrevistas && currentHazard.patologiasPrevistas.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-sans">
                    {currentHazard.patologiasPrevistas.map((pat, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1 font-sans"
                      >
                        <h4 className="text-[13px] font-sans font-semibold text-slate-900">{pat.titulo}</h4>
                        <p className="text-[12.5px] font-sans font-normal text-slate-600 leading-relaxed">
                          {pat.descripcion}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CARD 4: JERARQUÍA DE MEDIDAS DE INTERVENCIÓN */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4 font-sans">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2 font-sans">
                  <div className="flex items-center gap-2 font-sans">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-semibold text-slate-900 font-sans">
                      Plan de Intervención (Jerarquía de Controles GTC 45 y Dec. 1072)
                    </h3>
                  </div>
                  <span className="text-[12px] font-sans font-normal text-slate-500">
                    Responsable: {currentHazard.planIntervencion.responsable}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                  {/* Control de Ingeniería */}
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 font-sans">
                    <span className="text-[11.5px] font-sans font-normal text-blue-700 block">
                      1. CONTROL DE INGENIERÍA (EN LA FUENTE / MEDIO)
                    </span>
                    <h4 className="text-[13px] font-sans font-semibold text-slate-900">
                      {currentHazard.planIntervencion.ingenieria.titulo}
                    </h4>
                    <p className="text-[13px] font-sans font-normal text-slate-600 leading-relaxed">
                      {currentHazard.planIntervencion.ingenieria.descripcion}
                    </p>
                  </div>

                  {/* Control Administrativo */}
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 font-sans">
                    <span className="text-[11.5px] font-sans font-normal text-slate-500 block">
                      2. CONTROL ADMINISTRATIVO Y SEÑALIZACIÓN
                    </span>
                    <h4 className="text-[13px] font-sans font-semibold text-slate-900">
                      {currentHazard.planIntervencion.administrativa.titulo}
                    </h4>
                    <p className="text-[13px] font-sans font-normal text-slate-600 leading-relaxed">
                      {currentHazard.planIntervencion.administrativa.descripcion}
                    </p>
                  </div>
                </div>

                {/* Elementos de Protección Personal (EPP) Checklist with explicit font-sans & 13px */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 font-sans">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-sans">
                    <div>
                      <span className="text-[11.5px] font-sans font-normal text-slate-500 block">
                        3. EQUIPOS Y ELEMENTOS DE PROTECCIÓN PERSONAL (EPP OBLIGATORIOS)
                      </span>
                      <h4 className="text-[13px] font-sans font-semibold text-slate-900 mt-0.5">
                        {currentHazard.planIntervencion.epp.titulo}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={onOpenActaModal}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[13px] font-sans font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
                    >
                      <FileCheck className="w-4 h-4 text-white" />
                      <span>Convalidar Acta de Entrega</span>
                    </button>
                  </div>

                  <div className="space-y-2 pt-1 font-sans">
                    {currentHazard.planIntervencion.epp.items.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-slate-200 text-[13px] font-sans font-normal text-slate-800 cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleEppCheck(item.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer w-4 h-4"
                        />
                        <span className={item.checked ? 'text-slate-900 font-sans font-normal' : 'text-slate-600 font-sans font-normal'}>
                          {item.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* CARD 5: REGISTRO FOTOGRÁFICO DE CAMPO */}
              {currentHazard.evidenciaFotos && currentHazard.evidenciaFotos.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3.5 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 font-sans">
                    <div className="flex items-center gap-2 font-sans">
                      <Camera className="w-4 h-4 text-slate-600" />
                      <h3 className="text-sm font-semibold text-slate-900 font-sans">
                        Evidencia Fotográfica de la Inspección de Campo
                      </h3>
                    </div>
                    <span className="text-[12px] font-sans font-normal text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      {currentHazard.evidenciaFotos.length} capturas verificadas
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-sans">
                    {currentHazard.evidenciaFotos.map((foto, idx) => (
                      <div key={idx} className="rounded-lg border border-slate-200 overflow-hidden bg-slate-900 group font-sans">
                        <img
                          src={foto.url}
                          alt={foto.caption}
                          referrerPolicy="no-referrer"
                          className="w-full h-44 object-cover object-center group-hover:scale-102 transition-transform duration-200 opacity-90 group-hover:opacity-100"
                        />
                        <div className="p-2.5 bg-slate-900/90 text-white font-sans">
                          <p className="text-[12px] font-sans font-normal leading-snug">
                            {foto.caption}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-12 text-center text-[13px] font-sans font-normal text-slate-500 shadow-xs">
              Selecciona un peligro de la columna izquierda para inspeccionar sus especificaciones técnicas y recalcular su nivel de riesgo.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
