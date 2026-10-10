import React, { useState } from 'react';
import {
  Clock,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  FileText,
  Filter,
  ArrowRight,
  Info,
  Calendar,
  Sparkles,
  Award,
  RefreshCw,
} from 'lucide-react';
import {
  HazardRecord,
  IncapacidadRecord,
  CompanyInfo,
  ActiveView,
  CapacitacionRecord,
} from '../types';
import { ProximosVencimientosSection } from './ProximosVencimientosSection';
import { CalendarioVencimientos } from './CalendarioVencimientos';

interface VencimientosViewProps {
  hazards: HazardRecord[];
  incapacidades: IncapacidadRecord[];
  company: CompanyInfo;
  capacitaciones?: CapacitacionRecord[];
  onNavigate: (view: ActiveView) => void;
  onSelectHazard: (hazard: HazardRecord) => void;
}

export function VencimientosView({
  hazards,
  incapacidades,
  company,
  capacitaciones,
  onNavigate,
  onSelectHazard,
}: VencimientosViewProps) {
  const [activeTab, setActiveTab] = useState<'LISTA' | 'CALENDARIO'>('LISTA');

  return (
    <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 md:px-8 xl:px-10 2xl:px-12 py-5 sm:py-6 lg:py-8 space-y-6 sm:space-y-8 font-sans text-sm sm:text-base text-slate-800">
      {/* Header Ejecutivo de Vencimientos */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-7 lg:p-8 shadow-md border border-slate-700/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-amber-500/15 via-blue-500/15 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs sm:text-[13px] font-mono uppercase px-3 py-1 rounded-md font-semibold tracking-wider">
                CONTROL DE CADUCIDADES & AUDITORÍA
              </span>
              <span className="text-xs sm:text-sm text-slate-300">
                {company.name} • {company.claseRiesgo} • ARL {company.arl || 'SURA'}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 shrink-0" />
              Gestión Integral de Vencimientos y Compromisos SG-SST
            </h1>
            
            <p className="text-sm sm:text-base text-slate-200 mt-2 max-w-4xl leading-relaxed">
              Monitoreo y trazabilidad obligatoria de inspecciones GTC 45, reposición de EPP (Dec. 1072),
              exámenes ocupacionales periódicos, recargas de extintores y capacitaciones legales de la Res. 0312.
            </p>
          </div>

          {/* Selector de Vista (Tabs) */}
          <div className="flex items-center gap-2 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700/80 shadow-inner shrink-0 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('LISTA')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                activeTab === 'LISTA'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Lista de Alertas</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('CALENDARIO')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                activeTab === 'CALENDARIO'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Calendario Mensual</span>
            </button>
          </div>
        </div>

        {/* Banner de Recordatorio Legal */}
        <div className="mt-5 pt-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Base Jurídica:</strong> Decreto 1072 de 2015 Art. 2.2.4.6.8 y Resolución 0312 de 2019 Estándares 2.1.1, 4.1.2 y 6.1.1.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('inicio')}
              className="text-slate-300 hover:text-white underline text-xs sm:text-sm font-semibold cursor-pointer"
            >
              ← Volver al Tablero de Inicio
            </button>
          </div>
        </div>
      </div>

      {/* Renderizado Condicional del Contenido de Vencimientos */}
      {activeTab === 'LISTA' ? (
        <div className="space-y-4">
          <ProximosVencimientosSection
            hazards={hazards}
            incapacidades={incapacidades}
            company={company}
            capacitaciones={capacitaciones}
            onNavigate={onNavigate}
            onSelectHazard={onSelectHazard}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <CalendarioVencimientos
            hazards={hazards}
            incapacidades={incapacidades}
            company={company}
            capacitaciones={capacitaciones}
            onNavigate={onNavigate}
            onSelectHazard={onSelectHazard}
          />
        </div>
      )}
    </div>
  );
}
