import { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Plus,
  Target,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { HazardRecord, CompanyInfo, ActiveView } from '../types';

interface MainExplorerViewProps {
  hazards: HazardRecord[];
  company: CompanyInfo;
  onSelectHazard: (hazard: HazardRecord) => void;
  onNavigate: (view: ActiveView) => void;
  onOpenNewHazard: () => void;
}

export function MainExplorerView({
  hazards,
  company,
  onSelectHazard,
  onNavigate,
  onOpenNewHazard,
}: MainExplorerViewProps) {
  const [activeTab, setActiveTab] = useState<'folders' | 'created_by_you' | 'matriz_tecnica'>('folders');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'CRITICO' | 'ALTO' | 'MEJORABLE'>('ALL');
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  const tableItems = useMemo(() => {
    const items = [
      {
        id: 'item-1',
        title: 'Matriz General GTC 45',
        subLabel: 'Matriz GTC 45 • Taller Los Andes S.A.S. (SST-MR-001)',
        hazardRef: hazards[0],
        iconType: 'target',
        contributor: 'Carlos M.',
        updated: 'Hace 2 días',
        created: 'Hace 6 días',
        level: 'NIVEL_I',
        levelText: 'CRÍTICO (Nivel I)',
        isCritical: true,
      },
      {
        id: 'item-2',
        title: 'Soldadura y Oxicorte Bahía 4',
        subLabel: 'PEL-2024-001: Falta de EPP en zona de soldadura y corte',
        hazardRef: hazards[0],
        iconType: 'target',
        contributor: 'Carlos M.',
        updated: 'Hace 2 días',
        created: 'Hace 3 días',
        level: 'NIVEL_I',
        levelText: 'CRÍTICO (Nivel I)',
        isCritical: true,
      },
      {
        id: 'item-3',
        title: 'Red Eléctrica 220V Bodega',
        subLabel: 'PEL-2024-002: Red eléctrica 220V expuesta a filtraciones',
        hazardRef: hazards[1] || hazards[0],
        iconType: 'target',
        contributor: 'Carlos M.',
        updated: 'Ayer',
        created: 'Ayer',
        level: 'NIVEL_I',
        levelText: 'CRÍTICO (Nivel I)',
        isCritical: true,
      },
      {
        id: 'item-4',
        title: 'Pisos y Tránsito Cocina',
        subLabel: 'PEL-2024-003: Piso resbaloso por grasas en cocina',
        hazardRef: hazards[2] || hazards[0],
        iconType: 'activity',
        contributor: 'Carlos M.',
        updated: 'Ayer',
        created: 'Ayer',
        level: 'NIVEL_III',
        levelText: 'MEJORABLE (Nivel III)',
        isCritical: false,
      },
      {
        id: 'item-5',
        title: 'Diagnóstico Resolución 0312',
        subLabel: 'Estándares Mínimos Res. 0312/2019 (78.5% de cumplimiento)',
        hazardRef: null,
        targetView: 'diagnostico-0312' as ActiveView,
        iconType: 'target',
        contributor: 'Carlos M.',
        updated: 'Hace 7 min',
        created: '15/01/2025',
        level: 'NIVEL_IV',
        levelText: 'ESTÁNDAR',
        isCritical: false,
      },
    ];

    return items.filter((item) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!item.title.toLowerCase().includes(q) && !item.subLabel.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (filterLevel === 'CRITICO') return item.isCritical;
      if (filterLevel === 'MEJORABLE') return item.level === 'NIVEL_III';
      return true;
    });
  }, [hazards, searchQuery, filterLevel]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-5 bg-white min-h-screen text-[13px] text-slate-800 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-[18px] font-bold text-slate-900 tracking-tight">
            Explorador de Archivos y Registros SG-SST
          </h1>
          <p className="text-[13px] text-slate-500">
            {company.name} • Registros de seguridad y salud en el trabajo
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenNewHazard}
          className="bg-[#1877F2] hover:bg-[#1464CC] text-white rounded-lg px-3.5 py-1.5 font-medium text-[13px] flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nuevo Registro</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('folders')}
          className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
            activeTab === 'folders'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Carpetas y Documentos
        </button>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-2xs">
        <table className="table-stack w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-[12px] font-semibold text-slate-600">
              <th className="py-2.5 px-2.5 w-[34%]">Nombre del Registro</th>
              <th className="py-2.5 px-2.5 w-[16%]">Nivel de Riesgo</th>
              <th className="py-2.5 px-2.5 w-[20%]">Responsable</th>
              <th className="py-2.5 px-2.5 w-[18%]">Última Edición</th>
              <th className="py-2.5 px-2.5 text-right w-[12%]">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tableItems.map((item) => (
              <tr
                key={item.id}
                onClick={() => {
                  if (item.hazardRef) onSelectHazard(item.hazardRef);
                  else if (item.targetView) onNavigate(item.targetView);
                }}
                className="hover:bg-slate-50/70 cursor-pointer transition-colors"
              >
                <td data-label="Nombre del Registro" className="py-3 px-3">
                  <span className="font-medium text-slate-900 block">{item.title}</span>
                  <span className="text-[11px] text-slate-400">{item.subLabel}</span>
                </td>
                <td data-label="Nivel de Riesgo" className="py-3 px-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                      item.isCritical
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.levelText}
                  </span>
                </td>
                <td data-label="Responsable" className="py-3 px-3 text-slate-600">{item.contributor}</td>
                <td data-label="Última Edición" className="py-3 px-3 text-slate-500">{item.updated}</td>
                <td data-label="Acción" className="py-3 px-3 text-right">
                  <span className="text-blue-600 hover:underline text-[12px] font-medium">
                    Ver detalle →
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
