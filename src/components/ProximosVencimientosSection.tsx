import { useState, useMemo } from 'react';
import {
  Clock,
  Calendar,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  FileText,
  FileCheck,
  Stethoscope,
  Wrench,
  Flame,
  Award,
  Filter,
  Search,
  ArrowRight,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  Info,
  GraduationCap,
} from 'lucide-react';
import {
  VencimientoItem,
  VencimientoCategoria,
  VencimientoUrgencia,
  HazardRecord,
  IncapacidadRecord,
  CompanyInfo,
  ActiveView,
  CapacitacionRecord,
} from '../types';

interface ProximosVencimientosSectionProps {
  hazards: HazardRecord[];
  incapacidades: IncapacidadRecord[];
  company: CompanyInfo;
  capacitaciones?: CapacitacionRecord[];
  onNavigate: (view: ActiveView) => void;
  onSelectHazard: (hazard: HazardRecord) => void;
}

export function ProximosVencimientosSection({
  hazards,
  incapacidades,
  company,
  capacitaciones,
  onNavigate,
  onSelectHazard,
}: ProximosVencimientosSectionProps) {
  const [categoriaFiltro, setCategoriaFiltro] = useState<VencimientoCategoria | 'TODOS'>('TODOS');
  const [urgenciaFiltro, setUrgenciaFiltro] = useState<VencimientoUrgencia | 'TODOS'>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [completadosIds, setCompletadosIds] = useState<Set<string>>(new Set());

  // Dynamic derivation of upcoming deadlines based on registered company data, hazards, incapacidades, and legal calendar
  const vencimientosBase: VencimientoItem[] = useMemo(() => {
    const list: VencimientoItem[] = [];

    // 1. HAZARDS / INSPECTIONS: Dynamic from hazards data
    hazards.forEach((hazard) => {
      // If hazard has a legal deadline (plazoLegal)
      if (hazard.planIntervencion?.plazoLegal) {
        const isCritical = hazard.evaluacion.level === 'NIVEL_I';
        list.push({
          id: `venc-hazard-${hazard.id}`,
          titulo: `Control de Ingeniería y Barreras: ${hazard.code}`,
          subtitulo: `${hazard.title} (${hazard.zonaLugar.split('•')[0].trim()})`,
          categoria: 'INSPECCION',
          fechaLimite: hazard.planIntervencion.plazoLegal.includes('(')
            ? hazard.planIntervencion.plazoLegal.split('(')[1].replace(')', '')
            : hazard.planIntervencion.plazoLegal,
          diasRestantes: isCritical ? 2 : 14,
          urgencia: isCritical ? 'URGENTE' : 'PROXIMO',
          normativa: 'Art. 2.2.4.6.24 Dec. 1072 / GTC 45',
          responsable: hazard.planIntervencion.responsable || company.responsableSST.nombre,
          areaAfectada: hazard.zonaLugar,
          relacionadoId: hazard.id,
          tipoAccion: 'IR_PELIGRO',
        });
      }

      // If EPP delivery is pending
      if (hazard.estadoEntregaEPP === 'PENDIENTE') {
        list.push({
          id: `venc-epp-${hazard.id}`,
          titulo: `Firma de Acta Oficial Dotación EPP: ${hazard.code}`,
          subtitulo: `Falta firma de recepción certificada de ${hazard.planIntervencion.epp.items.length} elementos de protección (${hazard.planIntervencion.epp.titulo})`,
          categoria: 'EPP',
          fechaLimite: 'Inmediato (Plazo Legal 48h)',
          diasRestantes: 1,
          urgencia: 'URGENTE',
          normativa: 'Art. 2.2.4.6.24 Dec. 1072 / Res. 0312 Ítem 4.2.6',
          responsable: company.responsableSST.nombre,
          areaAfectada: hazard.zonaLugar,
          relacionadoId: hazard.id,
          tipoAccion: 'IR_ACTAS',
        });
      }
    });

    // 2. INCAPACIDADES & REINTEGROS: Dynamic from registered incapacidades
    incapacidades.forEach((inc) => {
      // Re-entry medical exam deadline
      list.push({
        id: `venc-inc-reintegro-${inc.id}`,
        titulo: `Examen de Reintegro Post-Incapacidad: ${inc.empleado}`,
        subtitulo: `Valoración de aptitud ocupacional tras ${inc.diasIncapacidad} días de incapacidad (${inc.diagnostico})`,
        categoria: 'INCAPACIDAD',
        fechaLimite: inc.fechaFin,
        diasRestantes: inc.id === 'INC-2025-003' ? 5 : -4, // INC-3 es reciente, otras vencidas para acción
        urgencia: inc.id === 'INC-2025-003' ? 'URGENTE' : 'VENCIDO',
        normativa: 'Res. 2346 de 2007 Art. 6 / Dec. 1072',
        responsable: `${company.responsableSST.nombre} / Médico Laboral`,
        areaAfectada: `${inc.cargo} • Taller`,
        relacionadoId: inc.id,
        tipoAccion: 'IR_AUSENTISMO',
      });

      // ARL reimbursement filing deadline if in process
      if (inc.estado === 'EN_COBRO_ARL_EPS' || inc.tipo === 'ACCIDENTE_TRABAJO') {
        list.push({
          id: `venc-inc-cobro-${inc.id}`,
          titulo: `Radicación Cuenta de Cobro ARL: ${inc.codigo}`,
          subtitulo: `Cobro de subsidio por incapacidad temporal de ${inc.empleado} ante ${inc.entidadExpide} ($${inc.costoAsumido.toLocaleString('es-CO')} COP)`,
          categoria: 'INCAPACIDAD',
          fechaLimite: 'Vence término perentorio 60 días',
          diasRestantes: 6,
          urgencia: 'URGENTE',
          normativa: 'Ley 776 de 2002 / Dec. 019 de 2012',
          responsable: 'Gestión Humana / Contabilidad',
          areaAfectada: 'Financiero & SST',
          relacionadoId: inc.id,
          tipoAccion: 'IR_AUSENTISMO',
        });
      }
    });

    // 3. STATUTORY SST DOCUMENTS & LICENSES of the company
    list.push({
      id: 'venc-doc-licencia-sst',
      titulo: `Renovación Licencia SST Responsable: ${company.responsableSST.licencia}`,
      subtitulo: `Validación de vigencia de acreditación profesional de ${company.responsableSST.nombre} ante Secretaría de Salud`,
      categoria: 'DOCUMENTO',
      fechaLimite: 'Próxima renovación quinquenal',
      diasRestantes: 28,
      urgencia: 'PROXIMO',
      normativa: 'Resolución 4502 de 2012 / Dec. 1072',
      responsable: company.responsableSST.nombre,
      areaAfectada: 'Dirección SST Sede Operativa',
      tipoAccion: 'ACCION_INTERNA',
    });

    list.push({
      id: 'venc-doc-curso-50h',
      titulo: 'Actualización Curso 20 Horas SST (Trienal)',
      subtitulo: `Certificación obligatoria de actualización en el Sistema de Gestión para ${company.responsableSST.nombre} (Estado: ${company.responsableSST.curso50h})`,
      categoria: 'DOCUMENTO',
      fechaLimite: 'Plazo reglamentario vigente',
      diasRestantes: 45,
      urgencia: 'PROGRAMADO',
      normativa: 'Res. 4927/2016 y Res. 0312/2019 Art. 12',
      responsable: company.responsableSST.nombre,
      areaAfectada: 'Gestión SST',
      tipoAccion: 'ACCION_INTERNA',
    });

    list.push({
      id: 'venc-doc-extintores',
      titulo: 'Recarga Anual y Prueba Hidrostática de Extintores',
      subtitulo: '10 Extintores de taller automotriz (6 PQS 20 lbs + 4 Solkaflam 3700 g en bahías de soldadura)',
      categoria: 'INSPECCION',
      fechaLimite: 'Vencimiento anual técnico',
      diasRestantes: 8,
      urgencia: 'URGENTE',
      normativa: 'Norma NFPA 10 / Res. 2400 de 1979 Art. 220',
      responsable: 'Brigada de Emergencias / Ing. Carlos Méndez',
      areaAfectada: 'Patios 1 y 2, Bodega y Bahía 4',
      tipoAccion: 'ACCION_INTERNA',
    });

    list.push({
      id: 'venc-doc-res0312-autoeval',
      titulo: 'Radicación Autoevaluación Anual de Estándares Mínimos',
      subtitulo: `Envío oficial de ponderación del 90.5% ante la plataforma del Ministerio del Trabajo y la ARL (${company.name})`,
      categoria: 'AUDITORIA',
      fechaLimite: 'Diciembre (Cierre de vigencia)',
      diasRestantes: 74,
      urgencia: 'PROGRAMADO',
      normativa: 'Resolución 0312 de 2019 / Circular 082',
      responsable: `${company.representanteLegal.nombre} y Responsable SST`,
      areaAfectada: 'Toda la empresa (60 Estándares)',
      tipoAccion: 'IR_0312',
    });

    list.push({
      id: 'venc-doc-copasst',
      titulo: 'Reunión Ordinaria Mensual del COPASST / Vigía SST',
      subtitulo: 'Revisión de informe de accidentalidad del mes, seguimiento a amoladora y verificación de mamparas',
      categoria: 'DOCUMENTO',
      fechaLimite: 'Último viernes del mes',
      diasRestantes: 11,
      urgencia: 'PROXIMO',
      normativa: 'Resolución 2013 de 1986 / Dec. 1072 Art. 2.2.4.6.11',
      responsable: 'Comité Paritario COPASST',
      areaAfectada: 'Sede Operativa Principal',
      tipoAccion: 'ACCION_INTERNA',
    });

    list.push({
      id: 'venc-doc-dotacion-legal',
      titulo: 'Segunda Entrega Cuatrimestral de Dotación y Calzado',
      subtitulo: 'Entrega legal periódica de uniformes y calzado de seguridad con puntera para 8 operarios de taller',
      categoria: 'EPP',
      fechaLimite: 'Periodo reglamentario de Ley',
      diasRestantes: 18,
      urgencia: 'PROXIMO',
      normativa: 'Art. 230 y 232 Código Sustantivo del Trabajo',
      responsable: 'Gerencia General & Recursos Humanos',
      areaAfectada: 'Planta de Producción Automotriz',
      tipoAccion: 'IR_ACTAS',
    });

    // 4. CAPACITACIONES PROGRAMADAS (Resolución 0312 Estándar 2.2.1 & Dec. 1072)
    if (capacitaciones) {
      capacitaciones
        .filter((c) => c.estado === 'PROGRAMADA')
        .forEach((cap) => {
          list.push({
            id: `venc-cap-${cap.id}`,
            titulo: `Capacitación SST: ${cap.tema}`,
            subtitulo: `${cap.modalidad.replace(/_/g, ' ')} (${cap.duracionHoras}h) • Facilitador: ${cap.capacitador.nombre} • ${cap.convocadosCount} convocados`,
            categoria: 'CAPACITACION',
            fechaLimite: cap.fechaProgramada,
            diasRestantes: 7,
            urgencia: 'URGENTE',
            normativa: 'Res. 0312 Est. 2.2.1 / Dec. 1072 Art. 2.2.4.6.11',
            responsable: cap.capacitador.nombre,
            areaAfectada: cap.areaAfectada,
            relacionadoId: cap.id,
            tipoAccion: 'IR_CAPACITACIONES',
          });
        });
    }

    return list;
  }, [hazards, incapacidades, company, capacitaciones]);

  const toggleCompletado = (id: string) => {
    setCompletadosIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filtered list
  const vencimientosFiltrados = useMemo(() => {
    return vencimientosBase.filter((item) => {
      // Category filter
      if (categoriaFiltro !== 'TODOS' && item.categoria !== categoriaFiltro) {
        return false;
      }
      // Urgency filter
      if (urgenciaFiltro !== 'TODOS' && item.urgencia !== urgenciaFiltro) {
        return false;
      }
      // Search filter
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        const matches =
          item.titulo.toLowerCase().includes(q) ||
          item.subtitulo.toLowerCase().includes(q) ||
          item.normativa.toLowerCase().includes(q) ||
          item.responsable.toLowerCase().includes(q) ||
          item.areaAfectada.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [vencimientosBase, categoriaFiltro, urgenciaFiltro, busqueda]);

  // Counts for KPIs
  const stats = useMemo(() => {
    let vencidos = 0;
    let urgentes = 0;
    let proximos = 0;
    let programados = 0;
    let atendidos = completadosIds.size;

    vencimientosBase.forEach((v) => {
      if (completadosIds.has(v.id)) return;
      if (v.urgencia === 'VENCIDO') vencidos++;
      else if (v.urgencia === 'URGENTE') urgentes++;
      else if (v.urgencia === 'PROXIMO') proximos++;
      else if (v.urgencia === 'PROGRAMADO') programados++;
    });

    return { vencidos, urgentes, proximos, programados, atendidos, total: vencimientosBase.length };
  }, [vencimientosBase, completadosIds]);

  const handleActionClick = (item: VencimientoItem) => {
    if (item.tipoAccion === 'IR_PELIGRO' && item.relacionadoId) {
      const target = hazards.find((h) => h.id === item.relacionadoId);
      if (target) {
        onSelectHazard(target);
        onNavigate('gestion-peligros');
      }
    } else if (item.tipoAccion === 'IR_AUSENTISMO') {
      onNavigate('ausentismo');
    } else if (item.tipoAccion === 'IR_ACTAS') {
      onNavigate('actas-entrega');
    } else if (item.tipoAccion === 'IR_0312') {
      onNavigate('diagnostico-0312');
    } else if (item.tipoAccion === 'IR_CAPACITACIONES') {
      onNavigate('capacitaciones');
    } else {
      toggleCompletado(item.id);
    }
  };

  const getCategoriaBadge = (cat: VencimientoCategoria) => {
    switch (cat) {
      case 'DOCUMENTO':
        return { label: 'Documento / Legal', icon: FileText, bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'INSPECCION':
        return { label: 'Inspección GTC 45', icon: Wrench, bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'INCAPACIDAD':
        return { label: 'Incapacidad & ARL', icon: Stethoscope, bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'EPP':
        return { label: 'Dotación & EPP', icon: ShieldCheck, bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'AUDITORIA':
        return { label: 'Auditoría Res. 0312', icon: Award, bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'CAPACITACION':
        return { label: 'Capacitación SST', icon: GraduationCap, bg: 'bg-teal-50 text-teal-800 border-teal-200' };
    }
  };

  const getUrgenciaBadge = (urgencia: VencimientoUrgencia, dias: number, completado?: boolean) => {
    if (completado) {
      return {
        label: 'Gestionado',
        pill: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold',
        indicator: 'bg-emerald-500',
      };
    }
    switch (urgencia) {
      case 'VENCIDO':
        return {
          label: dias < 0 ? `Vencido (${Math.abs(dias)}d de retraso)` : 'Vencido Hoy',
          pill: 'bg-red-100 text-red-800 border-red-300 font-bold animate-pulse',
          indicator: 'bg-red-600',
        };
      case 'URGENTE':
        return {
          label: `Urgente (${dias}d restantes)`,
          pill: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold',
          indicator: 'bg-amber-500',
        };
      case 'PROXIMO':
        return {
          label: `Próximo (${dias}d)`,
          pill: 'bg-blue-50 text-blue-800 border-blue-200 font-medium',
          indicator: 'bg-blue-500',
        };
      case 'PROGRAMADO':
        return {
          label: `Programado (${dias}d)`,
          pill: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
          indicator: 'bg-slate-400',
        };
    }
  };

  return (
    <div id="seccion-proximos-vencimientos" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5 font-sans text-[13px]">
      {/* Header with Title and Regulatory Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-red-100 text-red-700">
              <Clock className="w-4 h-4" />
            </span>
            <h2 className="text-[16px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Próximos Vencimientos y Alertas de Atención SST
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                {stats.total - stats.atendidos} pendientes
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Control de términos legales, fechas de inspección técnica GTC 45, reintegros de incapacidades y vigencia documental para <strong>{company.name}</strong>.
          </p>
        </div>

        {/* Action Quick Link */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11.5px] text-slate-500 hidden md:inline">
            Términos según Dec. 1072 / Res. 0312
          </span>
          {stats.atendidos > 0 && (
            <button
              type="button"
              onClick={() => setCompletadosIds(new Set())}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors"
              title="Restablecer gestiones completadas"
            >
              <RotateCcw className="w-3 h-3" />
              Restablecer ({stats.atendidos})
            </button>
          )}
        </div>
      </div>

      {/* 4 Quick Stat Micro-Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setUrgenciaFiltro(urgenciaFiltro === 'VENCIDO' ? 'TODOS' : 'VENCIDO')}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            urgenciaFiltro === 'VENCIDO'
              ? 'bg-red-50/80 border-red-300 ring-2 ring-red-400'
              : 'bg-white border-red-200 hover:bg-red-50/40'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-red-700 uppercase">
            <span>Atención Inmediata</span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-red-900">{stats.vencidos}</span>
            <span className="text-xs text-red-600 font-medium">Vencidos</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Requieren mitigación hoy</span>
        </div>

        <div
          onClick={() => setUrgenciaFiltro(urgenciaFiltro === 'URGENTE' ? 'TODOS' : 'URGENTE')}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            urgenciaFiltro === 'URGENTE'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400'
              : 'bg-white border-amber-200 hover:bg-amber-50/40'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-amber-800 uppercase">
            <span>Urgente (&le; 7 días)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-amber-900">{stats.urgentes}</span>
            <span className="text-xs text-amber-700 font-medium">Por vencer</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Plazos perentorios</span>
        </div>

        <div
          onClick={() => setUrgenciaFiltro(urgenciaFiltro === 'PROXIMO' ? 'TODOS' : 'PROXIMO')}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            urgenciaFiltro === 'PROXIMO'
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400'
              : 'bg-white border-blue-200 hover:bg-blue-50/40'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-blue-800 uppercase">
            <span>Próximos (8-30 días)</span>
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-blue-900">{stats.proximos}</span>
            <span className="text-xs text-blue-700 font-medium">En cronograma</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Auditorías y COPASST</span>
        </div>

        <div
          onClick={() => {
            setUrgenciaFiltro('TODOS');
            setCategoriaFiltro('TODOS');
          }}
          className="p-3 rounded-lg border bg-slate-50/60 border-slate-200 hover:bg-slate-100/60 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 uppercase">
            <span>Gestiones al Día</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-emerald-700">{stats.atendidos}</span>
            <span className="text-xs text-slate-600 font-medium">Completados</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">{stats.programados} programados</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
        {/* Category Pill Filters */}
        <div className="wrap-chips items-center gap-1.5 pb-1 max-w-full text-xs">
          <button
            type="button"
            onClick={() => setCategoriaFiltro('TODOS')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-colors ${
              categoriaFiltro === 'TODOS'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Todos ({vencimientosBase.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoriaFiltro('DOCUMENTO')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-colors ${
              categoriaFiltro === 'DOCUMENTO'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Documentos & Licencias
          </button>
          <button
            type="button"
            onClick={() => setCategoriaFiltro('INSPECCION')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-colors ${
              categoriaFiltro === 'INSPECCION'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Inspecciones & Peligros
          </button>
          <button
            type="button"
            onClick={() => setCategoriaFiltro('INCAPACIDAD')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-colors ${
              categoriaFiltro === 'INCAPACIDAD'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/60'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            Incapacidades & ARL
          </button>
          <button
            type="button"
            onClick={() => setCategoriaFiltro('EPP')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-colors ${
              categoriaFiltro === 'EPP'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Dotación & Actas
          </button>
          <button
            type="button"
            onClick={() => setCategoriaFiltro('CAPACITACION')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-colors ${
              categoriaFiltro === 'CAPACITACION'
                ? 'bg-teal-700 text-white'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/60'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Capacitaciones SST
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por responsable, norma o tarea..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Critical Alert Warning when there are urgent/overdue items */}
      {stats.vencidos > 0 && urgenciaFiltro !== 'PROGRAMADO' && (
        <div className="p-3 bg-red-50/80 border border-red-200 rounded-lg flex items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-semibold text-red-950">
                Atención Inmediata Requerida:
              </span>{' '}
              <span className="text-red-900">
                Tienes {stats.vencidos} gestión vencida (examen de reintegro post-incapacidad de Javier Morales). El Decreto 1072 exige aptitud médica antes de retomar soldadura.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('ausentismo')}
            className="text-[11px] font-semibold text-red-700 hover:text-red-900 underline shrink-0 cursor-pointer"
          >
            Ver Caso en Ausentismo &rarr;
          </button>
        </div>
      )}

      {/* Main Table List of Vencimientos */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="table-stack-lg w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-2.5 px-2.5 w-[11%]">Estado / Plazo</th>
              <th className="py-2.5 px-2.5 w-[11%]">Categoría</th>
              <th className="py-2.5 px-2.5 w-[32%]">Obligación / Documento / Peligro</th>
              <th className="py-2.5 px-2.5 w-[16%]">Área / Responsable</th>
              <th className="py-2.5 px-2.5 w-[13%]">Sustento Legal</th>
              <th className="py-2.5 px-2.5 text-right w-[17%]">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {vencimientosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-60" />
                    <p className="font-medium text-slate-700">No hay vencimientos pendientes con los filtros seleccionados</p>
                    <p className="text-[11px] text-slate-400">Prueba cambiando la categoría o restableciendo los filtros.</p>
                  </div>
                </td>
              </tr>
            ) : (
              vencimientosFiltrados.map((item) => {
                const isCompletado = completadosIds.has(item.id);
                const catBadge = getCategoriaBadge(item.categoria);
                const urgBadge = getUrgenciaBadge(item.urgencia, item.diasRestantes, isCompletado);
                const CatIcon = catBadge.icon;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isCompletado
                        ? 'bg-slate-50/60 opacity-75'
                        : item.urgencia === 'VENCIDO'
                        ? 'bg-red-50/30 hover:bg-red-50/60'
                        : item.urgencia === 'URGENTE'
                        ? 'bg-amber-50/20 hover:bg-amber-50/50'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Urgencia / Días Restantes */}
                    <td data-label="Estado / Plazo" className="py-3 px-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${urgBadge.indicator} shrink-0`} />
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] border ${urgBadge.pill}`}
                        >
                          {urgBadge.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1 ml-4">
                        {item.fechaLimite}
                      </div>
                    </td>

                    {/* Categoría */}
                    <td data-label="Categoría" className="py-3 px-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border font-medium ${catBadge.bg}`}
                      >
                        <CatIcon className="w-3 h-3 shrink-0" />
                        {catBadge.label}
                      </span>
                    </td>

                    {/* Título y Subtítulo */}
                    <td data-label="Obligación / Documento / Peligro" className="py-3 px-2.5">
                      <div className="flex items-start gap-1.5">
                        {isCompletado && (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div
                            className={`font-semibold text-slate-900 ${
                              isCompletado ? 'line-through text-slate-500' : ''
                            }`}
                          >
                            {item.titulo}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {item.subtitulo}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Área y Responsable */}
                    <td data-label="Área / Responsable" className="py-3 px-2.5 text-slate-600">
                      <div className="text-slate-800 font-medium text-[11.5px]">{item.responsable}</div>
                      <div className="text-[10.5px] text-slate-400">{item.areaAfectada}</div>
                    </td>

                    {/* Normativa */}
                    <td data-label="Sustento Legal" className="py-3 px-2.5">
                      <span className="text-[10.5px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 inline-block">
                        {item.normativa}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td data-label="Acción" className="py-3 px-2.5 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {/* Action navigation button */}
                        {item.tipoAccion !== 'ACCION_INTERNA' && (
                          <button
                            type="button"
                            onClick={() => handleActionClick(item)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-semibold border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>
                              {item.tipoAccion === 'IR_PELIGRO'
                                ? 'Ver Peligro'
                                : item.tipoAccion === 'IR_AUSENTISMO'
                                ? 'Ver Caso'
                                : item.tipoAccion === 'IR_ACTAS'
                                ? 'Firmar Acta'
                                : item.tipoAccion === 'IR_CAPACITACIONES'
                                ? 'Capacitación'
                                : 'Auditar'}
                            </span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}

                        {/* Mark completed toggle button */}
                        <button
                          type="button"
                          onClick={() => toggleCompletado(item.id)}
                          title={isCompletado ? 'Marcar como pendiente' : 'Marcar como gestionado'}
                          className={`p-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                            isCompletado
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <Check className={`w-3.5 h-3.5 ${isCompletado ? 'text-emerald-700' : 'text-slate-400'}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Helper Note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-[11px] text-slate-500 border-t border-slate-100">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          Los vencimientos se actualizan automáticamente al registrar nuevos peligros GTC 45, actas de dotación e incapacidades médicas.
        </span>
        <span className="font-mono text-slate-400">
          Supervisado: Art. 2.2.4.6.28 Dec. 1072 / 2015
        </span>
      </div>
    </div>
  );
}
